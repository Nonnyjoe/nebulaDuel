use std::{error::Error, fmt};
use json::JsonValue;
use std::io::{Read, Write};
use std::net::TcpStream;
use crate::battle_challenge::{Difficulty, Duel};
use crate::game_characters::{Character, MinimalCharacter, SuperPower};
use crate::players_profile::{Player, UserTransaction};
use crate::market_place::SaleDetails;
use crate::ai_battle;
use crate::strategy_simulation::AllStrategies;
pub const WEI_TO_GWEI_FACTOR: u128 = 1000000000;
pub const GWEI_TO_WEI_FACTOR: i32 = 1000000000;
pub const ROLLUP_ADDRESS: &str = "ROLLUPS_ADDRESS";

#[derive(Debug)]
pub enum ResponseStatus {
    Accept,
    Reject,
}

impl ResponseStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ResponseStatus::Accept => "accept",
            ResponseStatus::Reject => "reject",
        }
    }
}

#[derive(Debug)]
pub enum ResponseType {
    Notice,
    Report,
    Voucher,
}

#[derive(Debug)]
pub struct StandardInput {
    //bytes32: Option<ethabi::Token>,
    pub address: Option<String>,
    // pub uint256: Option<ethabi::Token>,
    pub bytes: Vec<u8>,
    pub request: JsonValue,
}


pub fn emit_notice(data: &str, rollup_server: &str) -> Result<String, Box<dyn Error>> {
    // let hexresult = string_to_hex(data);
    let hexresult = hex::encode(data);


    // Create the JSON payload
    let payload = format!(r#"{{"payload":"{}"}}"#, hexresult);

    let modified_url = Box::leak([rollup_server,  "/notice"].concat().into_boxed_str());
    println!("Sending a notice to this address: {}", rollup_server);

    // Parse the rollup server URL
    let url = url::Url::parse(modified_url)?;
    let host = url.host_str().ok_or("Invalid URL")?;
    let port = url.port_or_known_default().ok_or("Invalid port")?;
    let path = url.path();

    // Create a TCP connection
    let mut stream = TcpStream::connect((host, port))?;

    // Construct the HTTP POST request
    let request = format!(
        "POST {} HTTP/1.1\r\n\
        Host: {}\r\n\
        Content-Type: application/json\r\n\
        Content-Length: {}\r\n\
        Connection: close\r\n\
        \r\n\
        {}",
        path,
        host,
        payload.len(),
        payload
    );

    // Send the request
    stream.write_all(request.as_bytes())?;

    // Read the response
    let mut response = String::new();
    stream.read_to_string(&mut response)?;

    Ok(response)
}


pub fn structure_notice(method: String, tx_id: &mut u128, target: String, data: String, server_addr: &mut String) {
    let mut output_json = JsonValue::new_object();
   

    output_json["method"] = method.into();
    output_json["tx_id"] = (*tx_id as u64).into();
    output_json["target"] =target.into();
    output_json["data"] = data.into();
    output_json["notice_type"] = String::from("specific_tx").into();

    emit_notice(&output_json.dump()[..], &mut server_addr[..]);
}


#[derive(Debug, PartialEq, Clone)]
pub struct UserOutput{
    pub attached_to_tx_id: u128,
    pub user_address: String,
    pub user_transactions: Vec<UserTransaction>,
    pub notice_type: String,
}


#[derive(Debug, PartialEq, Clone)]
pub struct StandardOutput {
    pub method: String,
    pub tx_id: u128,
    pub target: String,
    pub data: String,
}

#[derive(Debug, PartialEq, Clone)]
pub enum TransactionStatus {
    Success,
    Pending,
    Failed
}

#[derive(Debug, PartialEq, Clone)]
pub struct TransactionData {
    pub tx_id: u128,
    pub method: String,
    pub caller: String,
    pub status: TransactionStatus,
}

pub fn duels_to_json(all_duels: Vec<Duel>) -> String {
    let mut json_array = JsonValue::new_array();

    for duel in all_duels {
        let mut tx_json = JsonValue::new_object();

        tx_json["duel_id"] = (duel.duel_id as u64).into();
        tx_json["is_active"] = (duel.is_active).into();
        tx_json["is_completed"] = duel.is_completed.into();
        tx_json["has_stake"] = duel.has_stake.into();
        tx_json["stake_amount"] = duel.stake_amount.into();
        tx_json["difficulty"] = match duel.difficulty {
                Difficulty::Easy => String::from("Easy").into(),
                Difficulty::P2P => String::from("P2P").into(),
                Difficulty::Hard => String::from("Hard").into(),
        };
        tx_json["duel_creator"] = duel.duel_creator.into();
        tx_json["creator_warriors"] = vec_of_id_to_json(duel.creator_warriors).into();
        tx_json["creators_strategy"] = decode_strategy_json(duel.creators_strategy).into();
        tx_json["duel_opponent"] = duel.duel_opponent.into();
        tx_json["opponent_warriors"] = vec_of_id_to_json(duel.opponent_warriors).into();
        tx_json["opponents_strategy"] = decode_strategy_json(duel.opponents_strategy).into();
        tx_json["battle_log"] = (decode_battle_log_json(duel.battle_log)).into();
        tx_json["duel_winner"] = duel.duel_winner.into();
        tx_json["duel_loser"] = duel.duel_loser.into();
        json_array.push(tx_json).unwrap();
    }

    json_array.dump()
}

pub fn decode_battle_log_json(battle_log: Vec<Vec<MinimalCharacter>>) -> String {
    let mut json_array = JsonValue::new_array();

    for duel in battle_log {
        let mut json_array1 = JsonValue::new_array();

        for round in duel {
            let mut tx_json = JsonValue::new_object();

            tx_json["character_id"] = (round.id as u64).into();
            tx_json["name"] = (round.name).into();
            tx_json["health"] = (round.health as u64).into();
            tx_json["strength"] = (round.strength as u64).into();
            tx_json["attack"] = (round.attack as u64).into();
            tx_json["owner"] = (round.owner).into();
            
            json_array1.push(tx_json).unwrap();
        }
        json_array.push(json_array1).unwrap();
    }

    json_array.dump()
}


pub fn decode_strategy_json(strategy: AllStrategies) -> String {
    match strategy {
        AllStrategies::LowestHealthToMax => { String::from("Lowest_to_highest_health")},
        AllStrategies::LowestStrengthToMax  => { String::from("Lowest_to_highest_strength")},
        AllStrategies::MaxHealthToLowest  => { String::from("Highest_to_lowest_health")},
        AllStrategies::MaxStrengthToLowest  => { String::from("Highest_to_lowest_strength")},
        AllStrategies::YetToSelect => { String::from("Yet_to_select")}
    }
}

pub fn listed_character_json(listed_characters: Vec<SaleDetails>) -> String {
    let mut json_array = JsonValue::new_array();

    for character in listed_characters {
        let mut tx_json = JsonValue::new_object();

        tx_json["character_id"] = (character.character_id as u64).into();
        tx_json["price"] = (character.price).into();
        tx_json["seller"] = (character.seller).into();
        json_array.push(tx_json).unwrap();
    } 

    json_array.dump()
}

pub fn character_to_json(all_characters: Vec<Character>) -> String {
    let mut json_array = JsonValue::new_array();

    for character in all_characters {
        let mut tx_json = JsonValue::new_object();
        
        tx_json["name"] = (character.name).into();
        tx_json["health"] = (character.health as u64).into();
        tx_json["strength"] = (character.strength as u64).into();
        tx_json["attack"] = (character.attack as u64).into();
        tx_json["speed"] = (character.speed as u64).into();
        tx_json["super_power"] = (decode_super_power_json(character.super_power).into());
        tx_json["id"] = (character.id as u64).into();
        tx_json["total_battles"] = (character.total_battles as u64).into();
        tx_json["total_wins"] = (character.total_wins as u64).into();
        tx_json["total_losses"] = (character.total_losses as u64).into();
        tx_json["price"] = (character.price as u64).into();
        tx_json["owner"] = (character.owner).into();
        json_array.push(tx_json).unwrap();
        
    }

    json_array.dump()
}

fn decode_super_power_json(super_power: SuperPower) -> String {
    match super_power {
        SuperPower::Adaptability => {String::from("Adaptability")},
        SuperPower::ShadowBall => {String::from("ShadowBall")},
        SuperPower::Psychic => {String::from("Psychic")},
        SuperPower::SleepSong => {String::from("SleepSong")},
        SuperPower::WaterGun => {String::from("WaterGun")},
        SuperPower::VineWhip => {String::from("VineWhip")},
        SuperPower::Flamethrower => {String::from("Flamethrower")},
        SuperPower::Thunderbolt => {String::from("Thunderbolt")},
        SuperPower::HeadCrush => {String::from("HeadCrush")},
        SuperPower::SonicKick => {String::from("SonicKick")},
        SuperPower::TelekineticHit => {String::from("TelekineticHit")},
        SuperPower::InvisibleClaws => {String::from("InvisibleClaws")},
        SuperPower::DodgeNdTailLash => {String::from("DodgeNdTailLash")}
    }
}


pub fn players_profile_to_json(all_players: Vec<Player>) -> String {
    let mut json_array = JsonValue::new_array();

    for player in all_players {
        let mut tx_json = JsonValue::new_object();
        
        tx_json["monika"] = player.monika.into();
        tx_json["wallet_address"] = player.wallet_address.into();
        tx_json["avatar_url"] = player.avatar_url.into();
        tx_json["characters"] = vec_of_id_to_json(player.characters).into();
        tx_json["id"] = (player.id as u64).into();
        tx_json["points"] = (player.points as u64).into();
        tx_json["nebula_token_balance"] = (player.nebula_token_balance as u64).into();
        tx_json["cartesi_token_balance"] = player.cartesi_token_balance.into();
        tx_json["total_battles"] = (player.total_battles as u64).into();
        tx_json["total_wins"] = (player.total_wins as u64).into();
        tx_json["total_losses"] = (player.total_losses as u64).into();
        tx_json["total_ai_battles"] = (player.total_ai_battles as u64).into();
        tx_json["ai_battles_won"] = (player.ai_battles_won as u64).into();
        tx_json["ai_battles_losses"] = (player.ai_battles_losses as u64).into();
        tx_json["transaction_history"] = (player_transactions_to_json(player.transaction_history).into());
        json_array.push(tx_json).unwrap();
    }

    json_array.dump()
}

pub fn vec_of_id_to_json(all_ids: Vec<u128>) -> String {
    let mut json_array: JsonValue = JsonValue::new_array();

    for id in all_ids {
        let mut tx_json = JsonValue::new_object();
        tx_json["char_id"] = (id as u64).into();
        json_array.push(tx_json).unwrap();
    }

    json_array.dump()
}

pub fn player_transactions_to_json(transactions: Vec<UserTransaction>) -> String {
    let mut json_array: JsonValue = JsonValue::new_array();

    for transaction in transactions {
        let mut tx_json = JsonValue::new_object();
        tx_json["transaction_id"] = (transaction.transaction_id as u64).into();
        tx_json["method_called"] = (transaction.method_called).into();

        json_array.push(tx_json).unwrap();
    }

    json_array.dump()
}



// const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });