extern crate dapp;
use json::{object, JsonValue, parse};
// use serde::{Serialize, Deserialize};
use dapp::router::{router, handle_deposit, handle_deposit_character_as_nft};
use dapp::storage::*;
use std::str;
use std::env;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::error::Error;

pub async fn handle_advance(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
    storage: &mut Storage,
) -> Result<&'static str, Box<dyn std::error::Error>> {
println!("Received advance request data {}", &request);
    let _payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;
    // TODO: add application logic here
    println!("payload is: {}", _payload);

    let msg_sender = request["data"]["metadata"]["msg_sender"]
    .as_str()
    .ok_or("Missing caller")?;

    println!("caller is {}", msg_sender);

    let modified_string = remove_first_two_chars(&_payload);
    println!("payload without unnecesary content is: {}", modified_string);
    // let request_payload = hex::decode(modified_string).expect("Every payload has to be hex encoded");
    hex_to_json(&modified_string, &msg_sender, storage);

    // let data = "new notice emitted";
    // emit_notice(data, _server_addr);
    Ok("accept")
}

fn remove_first_two_chars(s: &str) -> String {
    if let Some((index, _)) = s.char_indices().nth(2) {
        s[index..].to_string()
    } else {
        String::new()
    }
}

fn hex_to_json(hex_str: &str, msg_sender: &str, storage: &mut Storage) {
    // Decode the hex string to a byte array
    let bytes = hex::decode(hex_str).expect("Failed to decode hex string");

    // Convert the byte array to a string
    let json_string: &str = str::from_utf8(&bytes).expect("Failed to convert bytes to string");

    let bc_payload: &str = json_string.clone();
    let base_contracts: BaseContracts = BaseContracts::new();
    
    // Parse the JSON string to a JsonValue using the `json` crate
    let parsed_json: JsonValue = parse(json_string).expect("Failed to parse JSON");

    if msg_sender == base_contracts.erc20_portal {
        handle_deposit(bc_payload, msg_sender.to_string(), storage);

    } else if msg_sender == base_contracts.dapp_relayer {
        storage.dapp_contract_address = bc_payload.to_string();

    } else if msg_sender == base_contracts.erc721_portal {
        handle_deposit_character_as_nft(bc_payload, msg_sender.to_string(), storage);

    } else {
          // Destructure the JsonValue to access the fields
        if let JsonValue::Object(obj) = parsed_json.clone() {
            if let Some(func) = obj.get("func") {
                println!("Destructured func: {}", func);
                router(func, &parsed_json, msg_sender, storage);
            } else {
                println!("Field 'func' not found in JSON object");
            }
        } else {
            println!("Parsed JSON is not an object");
        }
    }
    println!("JSON: {:?}", json_string);
}

pub async fn handle_inspect(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
) -> Result<&'static str, Box<dyn std::error::Error>> {
    println!("Received inspect request data {}", &request);
    let _payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;
    // TODO: add application logic here
    Ok("accept")
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = hyper::Client::new();
    let server_addr = env::var("ROLLUP_HTTP_SERVER_URL")?;

    let mut storage: Storage = Storage::new(server_addr.clone());
    deployment_setup(&mut storage);

    let mut status = "accept";
    loop {
        println!("Sending finish");
        let response = object! {"status" => status.clone()};
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
            let body = hyper::body::to_bytes(response).await?;
            let utf = std::str::from_utf8(&body)?;
            let req = json::parse(utf)?;

            let request_type = req["request_type"]
                .as_str()
                .ok_or("request_type is not a string")?;
            status = match request_type {
                "advance_state" => handle_advance(&client, &server_addr[..], req, &mut storage).await?,
                "inspect_state" => handle_inspect(&client, &server_addr[..], req).await?,
                &_ => {
                    eprintln!("Unknown request type");
                    "reject"
                }
            };
        }
    }
}

// emitNotice = async (data) => {
//     const hexresult = stringToHex(data);
//     advance_req = await fetch(rollup_server + "/notice", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ payload: hexresult }),
//     });
//     return advance_req;
//   }



