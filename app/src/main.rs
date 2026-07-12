extern crate dapp;
use json::{object, parse, JsonValue};
use dapp::advance_router::{handle_deposit, handle_deposit_character_as_nft, router};
use dapp::inspect_router::inspect_router;
use dapp::storage::*;
use dapp::structures::emit_error_report;
use std::env;
use std::str;

/// Process one advance_state request.
/// Returns "accept" when the state transition succeeded and "reject" when the
/// input was invalid. Never panics: a malformed payload must reject the input,
/// not halt the Cartesi machine.
pub async fn handle_advance(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
    storage: &mut Storage,
) -> &'static str {
    println!("Received advance request data {}", &request);

    let payload = match request["data"]["payload"].as_str() {
        Some(p) => p,
        None => {
            emit_error_report("advance", "Missing payload", _server_addr);
            return "reject";
        }
    };

    let msg_sender = match request["data"]["metadata"]["msg_sender"].as_str() {
        Some(s) => s,
        None => {
            emit_error_report("advance", "Missing msg_sender in metadata", _server_addr);
            return "reject";
        }
    };
    println!("caller is {}", msg_sender);

    // Node v1 used a `timestamp` field, while node v2 uses `block_timestamp`.
    // Support both, preferring the v2 field when present.
    let time_stamp: u128 = if let Some(ts) = request["data"]["metadata"]["block_timestamp"].as_u64()
    {
        ts as u128
    } else if let Some(ts) = request["data"]["metadata"]["timestamp"].as_u64() {
        ts as u128
    } else {
        println!("Warning: no block_timestamp or timestamp in metadata, defaulting to 0");
        0
    };

    // In node v2, every advance_state request carries the application
    // contract address in metadata.app_contract. Store it once if it
    // hasn't been recorded yet.
    if !storage.has_relayed_address {
        if let Some(app_contract) = request["data"]["metadata"]["app_contract"].as_str() {
            storage.dapp_contract_address = app_contract.to_lowercase();
            storage.has_relayed_address = true;
            println!(
                "Stored application contract address: {}",
                storage.dapp_contract_address
            );
        } else {
            println!("advance metadata is missing app_contract field");
        }
    }

    let hex_payload = strip_0x_prefix(payload);
    match handle_request(hex_payload, &msg_sender.to_lowercase(), storage, time_stamp).await {
        Ok(()) => "accept",
        Err(e) => {
            println!("Rejecting input: {}", e);
            emit_error_report("advance", &e, _server_addr);
            "reject"
        }
    }
}

fn strip_0x_prefix(s: &str) -> &str {
    s.strip_prefix("0x").unwrap_or(s)
}

async fn handle_request(
    hex_str: &str,
    msg_sender: &str,
    storage: &mut Storage,
    time_stamp: u128,
) -> Result<(), String> {
    let base_contracts: BaseContracts = BaseContracts::new();
    if msg_sender == base_contracts.erc20_portal {
        return handle_deposit(hex_str, msg_sender.to_string(), storage).await;
    } else if msg_sender == base_contracts.erc721_portal {
        return handle_deposit_character_as_nft(hex_str, msg_sender.to_string(), storage).await;
    }

    // Decode the hex string to a byte array
    let bytes = hex::decode(hex_str).map_err(|e| format!("Payload is not valid hex: {}", e))?;

    // Convert the byte array to a string
    let json_string =
        str::from_utf8(&bytes).map_err(|e| format!("Payload is not valid UTF-8: {}", e))?;

    // Parse the JSON string to a JsonValue using the `json` crate
    let parsed_json: JsonValue =
        parse(json_string).map_err(|e| format!("Payload is not valid JSON: {}", e))?;

    // Frontend encodes inputs as `{ data: <payload-object> }`. Support both:
    // - `{ "func": "...", ... }`
    // - `{ "data": { "func": "...", ... } }`
    let (func_value, payload_json) = if let JsonValue::Object(ref obj) = parsed_json {
        if let Some(inner) = obj.get("data") {
            if let JsonValue::Object(ref inner_obj) = *inner {
                let func = inner_obj
                    .get("func")
                    .ok_or("Field 'func' not found in 'data' object")?;
                (func.clone(), inner.clone())
            } else {
                return Err("Field 'data' is not an object".to_string());
            }
        } else if let Some(func) = obj.get("func") {
            (func.clone(), parsed_json.clone())
        } else {
            return Err("Field 'func' not found in JSON object".to_string());
        }
    } else {
        return Err("Parsed JSON payload is not an object".to_string());
    };

    println!("Destructured func: {}", func_value);
    router(&func_value, &payload_json, msg_sender, storage, time_stamp).await
}

fn hex_to_string(hex_input: &str) -> Result<String, String> {
    let bytes = hex::decode(hex_input).map_err(|e| format!("Invalid hex: {}", e))?;
    String::from_utf8(bytes).map_err(|e| format!("Invalid UTF-8: {}", e))
}

//HANDLE INSPECT PART;
pub async fn handle_inspect(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
    storage: &mut Storage,
) -> &'static str {
    println!("Received inspect request data {}", &request);

    let payload = match request["data"]["payload"].as_str() {
        Some(p) => p,
        None => {
            emit_error_report("inspect", "Missing payload", _server_addr);
            return "reject";
        }
    };

    match hex_to_string(strip_0x_prefix(payload)) {
        Ok(decoded) => {
            inspect_router(&decoded, storage);
            "accept"
        }
        Err(e) => {
            println!("Failed to decode inspect payload: {}", e);
            emit_error_report("inspect", &e, _server_addr);
            "reject"
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Starting dapp backend logic...");
    let client = hyper::Client::new();
    let server_addr = env::var("ROLLUP_HTTP_SERVER_URL").unwrap_or_else(|_| {
        println!("Using default value for ROLLUP_HTTP_SERVER_URL: http://localhost:5004");
        "http://localhost:5004".to_string()
    });

    let mut storage: Storage = Storage::new(server_addr.clone(), &client);
    deployment_setup(&mut storage);

    let mut status = "accept";
    loop {
        println!("Sending finish");
        let response = object! {"status" => status};
        let request = hyper::Request::builder()
            .method(hyper::Method::POST)
            .header(hyper::header::CONTENT_TYPE, "application/json")
            .uri(format!("{}/finish", &server_addr))
            .body(hyper::Body::from(response.dump()))?;
        let response = client.request(request).await?;
        println!("Received finish status {}", response.status());

        if response.status() == hyper::StatusCode::ACCEPTED {
            println!("No pending rollup request, trying again");
        } else {
            // A malformed response from the rollup server must never kill the
            // dapp process — log, reject, and keep the finish loop alive.
            let req = match hyper::body::to_bytes(response).await {
                Ok(body) => match std::str::from_utf8(&body)
                    .map_err(|e| e.to_string())
                    .and_then(|utf| json::parse(utf).map_err(|e| e.to_string()))
                {
                    Ok(req) => req,
                    Err(e) => {
                        eprintln!("Could not parse rollup request: {}", e);
                        status = "reject";
                        continue;
                    }
                },
                Err(e) => {
                    eprintln!("Could not read rollup response body: {}", e);
                    status = "reject";
                    continue;
                }
            };

            let request_type = match req["request_type"].as_str() {
                Some(t) => t,
                None => {
                    eprintln!("request_type is not a string");
                    status = "reject";
                    continue;
                }
            };
            status = match request_type {
                "advance_state" => {
                    handle_advance(&client, &server_addr[..], req, &mut storage).await
                }
                "inspect_state" => {
                    handle_inspect(&client, &server_addr[..], req, &mut storage).await
                }
                &_ => {
                    eprintln!("Unknown request type");
                    "reject"
                }
            };
        }
    }
}
