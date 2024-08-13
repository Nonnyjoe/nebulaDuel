extern crate dapp;
use json::{object, parse, JsonValue};
// use serde::{Serialize, Deserialize};
use dapp::advance_router::{handle_deposit, handle_deposit_character_as_nft, router};
use dapp::inspect_router::inspect_router;
use dapp::storage::*;
use dapp::structures::{emit_notice, emit_report, TransactionStatus};
use std::collections::btree_set::SymmetricDifference;
use std::env;
use std::error::Error;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::str;

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
    let time_stamp: u128 = (request["data"]["metadata"]["timestamp"])
        .to_string()
        .parse::<u128>()
        .unwrap();

    let modified_string = remove_first_two_chars(&_payload);
    println!("payload without unnecesary content is: {}", modified_string);
    // let request_payload = hex::decode(modified_string).expect("Every payload has to be hex encoded");
    hex_to_json(
        &modified_string,
        &msg_sender.to_lowercase(),
        storage,
        time_stamp,
    );

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

fn hex_to_json(hex_str: &str, msg_sender: &str, storage: &mut Storage, time_stamp: u128) {
    let base_contracts: BaseContracts = BaseContracts::new();
    if msg_sender == base_contracts.erc20_portal {
        handle_deposit(hex_str, msg_sender.to_string(), storage);
        return;
    } else if msg_sender == base_contracts.erc721_portal {
        handle_deposit_character_as_nft(hex_str, msg_sender.to_string(), storage);
        return;
    } else if msg_sender == base_contracts.dapp_relayer {
        storage.dapp_contract_address = ("0x".to_string() + hex_str).to_lowercase();
        storage.has_relayed_address = true;
        println!("RECEIVED DAPP ADDRESS: {:?}", storage.dapp_contract_address);
        return;
    }
    // {"data": "{\"func\":\"create_player\",\"monika\":\"NonnyJoe\",\"avatar_url\":\"nonnyjoe_image1\"}", "signer": "0xA771E1625DD4FAa2Ff0a41FA119Eb9644c9A46C8", "target": "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"}
    // ETH_RPC_URL=http://127.0.0.1:8545 ETH_FROM=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 cast send  0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB "depositERC20Tokens(address,address,uint256,bytes)" 0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2 0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e 1000 '0x' --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    // ETH_RPC_URL=http://127.0.0.1:8545 ETH_FROM=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 cast send  0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2 "approve(address,uint256)" 0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB 1000 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    // NFT INTERACTION
    // ETH_RPC_URL=http://127.0.0.1:8545 ETH_FROM=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 cast send  0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1 "setApprovalForAll(address,bool)" 0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87 true --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    // ETH_RPC_URL=http://127.0.0.1:8545 ETH_FROM=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 cast send  0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1 "mint(address, uint256)" 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 1 --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    // ETH_RPC_URL=http://127.0.0.1:8545 ETH_FROM=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 cast send  0x237F8DD094C0e47f4236f12b4Fa01d6Dae89fb87 "depositERC721Token(address,address,uint256,bytes, bytes)" 0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1 0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e 1 '0x' '0x' --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --private-key ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    // Decode the hex string to a byte array
    let bytes = hex::decode(hex_str).expect("Failed to decode hex string");

    // Convert the byte array to a string
    let json_string: &str = str::from_utf8(&bytes).expect("Failed to convert bytes to string");

    let bc_payload: &str = json_string.clone();

    // Parse the JSON string to a JsonValue using the `json` crate
    let parsed_json: JsonValue = parse(json_string).expect("Failed to parse JSON");

    if msg_sender.to_lowercase() == storage.relayer_addr {
        println!("{}", storage.relayer_addr);
        println!("RECEIVED RELAYER SPONSORED TX");
        // Destructure the JsonValue to access the fields
        if let JsonValue::Object(obj) = parsed_json.clone() {
            println!("parsed json: {:?}", obj);

            let new_data = obj.get("data").unwrap().as_str().unwrap();
            println!("New data is {:?}", new_data);
            let signer = obj.get("signer").unwrap().to_string().to_lowercase();

            println!("Signer is {}", signer);

            let parsed_json: JsonValue = parse(new_data).expect("Failed to parse JSON");
            if let JsonValue::Object(obj) = parsed_json.clone() {
                let func = obj.get("func").unwrap();
                println!("Destructured func: {}", func);
                router(
                    func,
                    &parsed_json,
                    signer.to_lowercase().as_str(),
                    storage,
                    time_stamp,
                );
            } else {
                println!("Parsed newdata JSON is not an object");
            }
        } else {
            println!("Parsed JSON is not an object");
        }
    } else {
        // Destructure the JsonValue to access the fields
        if let JsonValue::Object(obj) = parsed_json.clone() {
            if let Some(func) = obj.get("func") {
                println!("Destructured func: {}", func);
                router(func, &parsed_json, msg_sender, storage, time_stamp);
            } else {
                println!("Field 'func' not found in JSON object");
            }
        } else {
            println!("Parsed JSON is not an object");
        }
    }
    println!("JSON: {:?}", json_string);
}

fn hex_to_string(hex_input: &str) -> Result<String, hex::FromHexError> {
    let bytes = hex::decode(hex_input)?;
    let result = String::from_utf8(bytes).expect("Invalid UTF-8 sequence");
    Ok(result)
}

//HANDLE INSPECT PART;
pub async fn handle_inspect(
    _client: &hyper::Client<hyper::client::HttpConnector>,
    _server_addr: &str,
    request: JsonValue,
    storage: &mut Storage,
) -> Result<&'static str, Box<dyn std::error::Error>> {
    println!("Received inspect request data {}", &request);
    let _payload = request["data"]["payload"]
        .as_str()
        .ok_or("Missing payload")?;
    // TODO: add application logic here
    println!("data is: {}", request["data"]);
    println!("payload is: {}", _payload);

    let payload = remove_first_two_chars(_payload);

    match hex_to_string(&payload) {
        Ok(payload) => inspect_router(&payload, storage),
        Err(_) => panic!("Failed to decode hex payload"),
    };
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
                "advance_state" => {
                    handle_advance(&client, &server_addr[..], req, &mut storage).await?
                }
                "inspect_state" => {
                    handle_inspect(&client, &server_addr[..], req, &mut storage).await?
                }
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
