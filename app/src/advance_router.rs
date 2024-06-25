use crate::admin_functions;
use crate::ai_battle;
use crate::battle_challenge;
use crate::battle_challenge::Difficulty;
use crate::game_characters;
use crate::market_place;
use crate::players_profile;
use crate::players_profile::get_profile;
use crate::storage;
use crate::strategy_simulation;
use crate::strategy_simulation::AllStrategies;
use crate::structures::{TransactionStatus, emit_notice};
use crate::structures::*;
// use crate::structures::*;
use std::error::Error;
use json::JsonValue;
use crate::storage::*;
use crate::players_profile::Player;
// pub storage: Storage = new();
use std::convert::TryFrom;
extern crate hex;

pub struct Route {
    pub endpoint: String,
    pub payload: Option<RoutePayload>,
}

pub enum RoutePayload {
    YetToSelect,
    MaxHealthToLowest,
    LowestHealthToMax,
    MaxStrengthToLowest,
    LowestStrengthToMax
}

#[derive(Debug)]
pub struct StandardInput {
    //bytes32: Option<ethabi::Token>,
    pub address: Option<String>,
    // pub uint256: Option<ethabi::Token>,
    pub bytes: Vec<u8>,
    pub request: JsonValue,
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

// pub fn router(route: Route, data: &StandardInput) {
pub fn router(route: &JsonValue, payload: &JsonValue, msg_sender: &str, storage: &mut Storage, time_stamp: u128) {
    storage.total_transactions += 1;

    match route.as_str() {
        Some(function) => {
            match function {
                "change_admin_address" => {
                    println!("Changing admin address!!");
                    handle_change_admin_address(payload, msg_sender.to_string(), storage);
                },
                "change_relayer_address" => {
                    println!("Changing relayer address!!");
                    handle_change_relayer_address(payload, msg_sender.to_string(), storage);
                },
                "change_points_rate" => {
                    println!("Changing points range!!");
                    handle_change_points_rate(payload, msg_sender.to_string(), storage);
                },
                "set_cartesi_token_address" => {
                    println!("Setting CTSI address!!");
                    handle_set_cartesi_token_address(payload, msg_sender.to_string(), storage);
                },
                "set_nebula_token_address" => {
                    println!("Setting Nebula token Address!!!");
                    handle_set_nebula_token_address(payload, msg_sender.to_string(), storage);
                },
                "withdraw_profit_from_stake" => {
                    println!("Withdrawing Profit from Stake!!!");
                    handle_withdraw_profit_from_stake(payload, msg_sender.to_string(), storage);
                },
                "withdraw_profit_from_p2p_sales" => {
                    println!("Withdrawing Profit from P2P sales!!!");
                    handle_withdraw_profit_from_p2p_sales(payload, msg_sender.to_string(), storage);
                },
                "withdraw_profit_from_points_purchase" => {
                    println!("Withdrawing Profit from Points Purchase!!!");
                    handle_withdraw_profit_from_points_purchase(payload, msg_sender.to_string(), storage);
                },
                "withdraw_character_as_nft" => {
                    println!("Withdrawing character as NFT!!!");
                    handle_withdraw_character_as_nft(payload, msg_sender.to_string(), storage);
                },
                "withdraw" => {
                    println!("Withdrawing CTSI Token!!!");
                    handle_withdraw(payload, msg_sender.to_string(), storage);
                },
                "create_ai_duel" => {
                    println!("Creating AI Duel!!!");
                    handle_create_ai_duel(payload, msg_sender.to_string(), storage, time_stamp);
                },
                "select_ai_battle_strategy" => {
                    println!("Creating AI Duel!!!");
                    handle_select_ai_battle_strategy(payload, msg_sender.to_string(), storage);
                },
                "create_duel" => {
                    println!("Creating Duel!!!");
                    handle_create_duel(payload, msg_sender.to_string(), storage, time_stamp);
                },
                "join_duel" => {
                    println!("Joining Duel!!!");
                    handle_join_duel(payload, msg_sender.to_string(), storage);
                },
                "set_strategy" => {
                    println!("Setting Strategy!!!");
                    handle_set_strategy(payload, msg_sender.to_string(), storage);
                },
                "fight" => {
                    println!("Starting Battle!!!");
                    handle_fight(payload, msg_sender.to_string(), storage);
                },
                "purchase_team" => {
                    println!("Purchasing Team!!!");
                    handle_purchase_team(payload, msg_sender.to_string(), storage);
                },
                // "get_characters" => {},
                "transfer_tokens" => {
                    println!("Transfering Tokens!!!");
                    handle_transfer_tokens(payload, msg_sender.to_string(), storage);
                },
                "purchase_single_character" => {
                    println!("Purchasing Single Character!!!");
                    handle_purchase_single_character(payload, msg_sender.to_string(), storage);
                },
                "list_character" => {
                    println!("Listing Character!!!");
                    handle_listing_character(payload, msg_sender.to_string(), storage);
                },
                "buy_character" => {
                    println!("Buying Character!!!");
                    handle_buy_character(payload, msg_sender.to_string(), storage);
                },
                "purchase_points" => {
                    println!("Purchasing Points!!!");
                    handle_purchase_points(payload, msg_sender.to_string(), storage);
                },
                "modify_list_price" => {
                    println!("Modifying List Price!!!");
                    handle_modify_list_price(payload, msg_sender.to_string(), storage);
                },
                "create_player" => {
                    println!("Create player function selected");
                    handle_create_player(payload, msg_sender.to_string(), storage);
                },
                "modify_monika" => {
                    println!("Create player function selected");
                    handle_modify_monika(payload, msg_sender.to_string(), storage);
                },
                "modify_avatar" => {
                    println!("Create player function selected");
                    handle_modify_avatar(payload, msg_sender.to_string(), storage);
                },

                _ => todo!(),
            }
        }, 
        None => {
            panic!("error decoding func");
        }
        
    };

    let player = get_profile(&mut storage.all_players, msg_sender.to_string());
    match player {
        Some(player) => {player.register_transaction(&mut storage.all_characters, (storage.total_transactions).clone(), route.as_str().unwrap().to_string())},
        None => {
            panic!("Player Not registered, Please Register");
        }
    }
}

// {"func": "create_player", "monika": "NonnyJoe", "avatar_url": "nonnyjoe_image1"}
// {"func": "create_player", "monika": "Evans", "avatar_url": "evans_image1"}
// {"func": "create_player", "monika": "Black_Adam", "avatar_url": "Black_image1"}
pub fn handle_create_player(payload: &JsonValue, msg_sender: String, storage: &mut Storage ) {
    if let JsonValue::Object(obj) = payload.clone() {

        let mut user_monika = String::from("new_player");
        let mut avatar_url = String::from("default_url");

        if let Some(monika) = obj.get("monika") {
            user_monika = monika.as_str().unwrap().to_string();
        } else {
            panic!("Please pass your monika");
        }

        if let Some(avatar) = obj.get("avatar_url") {
            avatar_url = avatar.as_str().unwrap().to_string();
        } else {
            panic!("Please pass your avatar_url");
        }

        players_profile::create_player(user_monika, msg_sender.clone(), avatar_url, &mut storage.all_players, &mut storage.total_players);
        storage.record_tx(String::from("create_player"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.all_players;
        println!("All players now are: {:?}", data.clone());

        let json_data = players_profile_to_json(data.to_vec());
        structure_notice(String::from("create_player"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);

        println!("Total players now is: {}", storage.total_players);
    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "purchase_team", "char_id1": 2, "char_id2": 3, "char_id3": 6}
pub fn handle_purchase_team(payload: &JsonValue, msg_sender: String, storage: &mut Storage ) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut char_id1: u128 = 0;
        let mut char_id2: u128 = 0;
        let mut char_id3: u128 = 0;

        if let Some(charid1) = obj.get("char_id1") {
            char_id1 = charid1.as_u64().unwrap().into();
        } else {
            panic!("invalid character id 1");
        }

        if let Some(charid2) = obj.get("char_id2") {
            char_id2 = charid2.as_u64().unwrap().into();
        } else {
            panic!("invalid character id 2");
        }

        if let Some(charid3) = obj.get("char_id3") {
            char_id3 = charid3.as_u64().unwrap().into();
        } else {
            panic!("invalid character id 3");
        }
        game_characters::purchase_team(&mut storage.all_players, &mut storage.all_characters, &mut storage.total_characters, msg_sender.clone(), char_id1, char_id2, char_id3);
        storage.record_tx(String::from("purchase_team"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_characters;
        let json_data = character_to_json(data.to_vec());
        structure_notice(String::from("purchase_team"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "create_duel", "char_id1": 9, "char_id2": 10, "char_id3": 11, "has_staked": false, "stake_amount": 0.0}
pub fn handle_create_duel(payload: &JsonValue, msg_sender: String, storage: &mut Storage, time_stamp: u128 ) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut has_staked: bool = false;
        let mut stake_amount: f64 = 0.0;
        let mut char_ids: Vec<u128> = Vec::new();

        if let Some(charid1) = obj.get("char_id1") {
            char_ids.push(charid1.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 1");
        }

        if let Some(charid2) = obj.get("char_id2") {
            char_ids.push(charid2.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 2");
        }

        if let Some(charid3) = obj.get("char_id3") {
            char_ids.push(charid3.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 3");
        }

        if let Some(will_staked) = obj.get("has_staked") {
            has_staked = will_staked.as_bool().unwrap();
        } else {
            panic!("invalid argument has_staked");
        }

        if let Some(amt_staked) = obj.get("stake_amount") {
            stake_amount = amt_staked.as_f64().unwrap();
        } else {
            panic!("invalid stake amount");
        }

        battle_challenge::create_duel(&mut storage.all_duels, &mut storage.all_characters, &mut storage.all_players, &mut storage.total_duels, msg_sender.clone(), char_ids, &mut storage.available_duels, has_staked, stake_amount, time_stamp);
        storage.record_tx(String::from("create_duel"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_duels;
        let json_data = duels_to_json(data.to_vec());
        structure_notice(String::from("create_duel"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        
    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "join_duel", "char_id1": 12, "char_id2": 13, "char_id3": 14, "duel_id": 1}
pub fn handle_join_duel(payload: &JsonValue, msg_sender: String, storage: &mut Storage ) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut char_ids: Vec<u128> = Vec::new();
        let mut duel_id: u128 = 0;

        if let Some(charid1) = obj.get("char_id1") {
            char_ids.push(charid1.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 1");
        }

        if let Some(charid2) = obj.get("char_id2") {
            char_ids.push(charid2.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 2");
        }

        if let Some(charid3) = obj.get("char_id3") {
            char_ids.push(charid3.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 3");
        }

        if let Some(id) = obj.get("duel_id") {
            duel_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid duel id");
        }

        battle_challenge::join_duel(&mut storage.all_duels, &mut storage.all_characters, &mut storage.all_players, duel_id, msg_sender.clone(), char_ids);
        storage.record_tx(String::from("join_duel"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_ai_duels;
        let json_data = duels_to_json(data.to_vec());
        structure_notice(String::from("join_duel"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        
    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "set_strategy", "strategy_id": 1, "duel_id": 1}
// {"func": "set_strategy", "strategy_id": 3, "duel_id": 1}
pub fn handle_set_strategy(payload: &JsonValue, msg_sender: String, storage: &mut Storage ) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut duel_id: u128 = 0;
        let mut strategy_id: u128 = 0;
        let mut strategy: AllStrategies = AllStrategies::YetToSelect;

        if let Some(id) = obj.get("strategy_id") {
            strategy_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid strategy id");
        }

        if let Some(id) = obj.get("duel_id") {
            duel_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid duel id");
        }

        if strategy_id != 0 {
            strategy = strategy_simulation::decode_strategy(strategy_id).unwrap();
        } else {
            panic!("invalid strategy Id");
        }

        battle_challenge::set_strategy(&mut storage.all_duels, duel_id, msg_sender.clone(), strategy);
        storage.record_tx(String::from("set_strategy"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_ai_duels;
        let json_data = duels_to_json(data.to_vec());
        structure_notice(String::from("set_strategy"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        
        println!("Strategy set succesfully!!");
    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "fight", "duel_id": 1}
pub fn handle_fight(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut duel_id: u128 = 0;

        if let Some(id) = obj.get("duel_id") {
            duel_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid duel id");
        }

        battle_challenge::fight(&mut storage.all_duels, &mut storage.all_characters, duel_id, &mut storage.all_players, &mut storage.available_duels, &mut storage.profit_from_stake);
        storage.record_tx(String::from("fight"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_ai_duels;
        let json_data = duels_to_json(data.to_vec());
        structure_notice(String::from("fight"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        
    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "create_ai_duel", "char_id1": 14, "char_id2": 15, "char_id3": 16, "difficulty_id": 1}
pub fn handle_create_ai_duel(payload: &JsonValue, msg_sender: String, storage: &mut Storage, time_stamp: u128) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut char_ids: Vec<u128> = Vec::new();
        let mut difficulty_id: u128 = 0;
        let mut difficulty: Difficulty = Difficulty::P2P;

        if let Some(charid1) = obj.get("char_id1") {
            char_ids.push(charid1.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 1");
        }

        if let Some(charid2) = obj.get("char_id2") {
            char_ids.push(charid2.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 2");
        }

        if let Some(charid3) = obj.get("char_id3") {
            char_ids.push(charid3.as_u64().unwrap().into());
        } else {
            panic!("invalid character id 3");
        }

        if let Some(id) = obj.get("difficulty_id") {
            difficulty_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid strategy id");
        }

        if difficulty_id != 0 {
            difficulty = ai_battle::decode_difficulty(difficulty_id).unwrap();
        } else {
            panic!("invalid strategy Id");
        }

        ai_battle::create_ai_duel(&mut storage.all_ai_duels, &mut storage.all_duels, &mut storage.all_characters, &mut storage.all_players, &mut storage.total_duels, msg_sender.clone(), char_ids, difficulty, time_stamp);
        storage.record_tx(String::from("create_ai_duel"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.all_ai_duels;
        let json_data = duels_to_json(data.to_vec());
        structure_notice(String::from("create_ai_duel"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        

    } else {
        panic!("Parsed JSON is not an object");
    }
}

// {"func": "select_ai_battle_strategy", "strategy_id": 1, "duel_id": 1}
// {"func": "select_ai_battle_strategy", "strategy_id": 1, "duel_id": 2}
pub fn handle_select_ai_battle_strategy(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut duel_id: u128 = 0;
        let mut strategy_id: u128 = 0;
        let mut strategy: AllStrategies = AllStrategies::YetToSelect;

        if let Some(id) = obj.get("strategy_id") {
            strategy_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid strategy id");
        }

        if let Some(id) = obj.get("duel_id") {
            duel_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid duel id");
        }

        if strategy_id != 0 {
            strategy = strategy_simulation::decode_strategy(strategy_id).unwrap();
        } else {
            panic!("invalid strategy Id");
        }

        ai_battle::select_ai_battle_strategy(&mut storage.all_ai_duels, &mut storage.all_duels, duel_id, msg_sender.clone(), strategy, &mut storage.all_characters, &mut storage.all_players);
        storage.record_tx(String::from(""), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_ai_duels;
        let json_data = duels_to_json(data.to_vec());
        structure_notice(String::from("select_ai_battle_strategy"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        
        println!("Strategy set succesfully!!");
    } else {
        panic!("Parsed JSON is not an object");
    }
}

pub fn handle_set_cartesi_token_address(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut ctsi_token: String = String::from(" ");

        if let Some(token_add) = obj.get("ctsi_token") {
            ctsi_token = token_add.as_str().unwrap().to_string();
        } else {
            panic!("Please pass in a valid token address");
        }

        admin_functions::set_cartesi_token_address(&mut storage.admin_address, msg_sender.clone(), &mut storage.cartesi_token_address, ctsi_token);
        storage.record_tx(String::from("set_cartesi_token_address"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.cartesi_token_address;
        structure_notice(String::from("set_cartesi_token_address"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);
    } else {
        panic!("Parsed JSON is not an object");
    }  
}

pub fn handle_set_nebula_token_address(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut nebula_token: String = String::from(" ");

        if let Some(token_add) = obj.get("nebula_token") {
            nebula_token = token_add.as_str().unwrap().to_string();
        } else {
            panic!("Please pass in a valid token address");
        }
        admin_functions::set_nebula_token_address(&mut storage.admin_address, msg_sender.clone(), &mut storage.nebula_token_address, nebula_token);
        storage.record_tx(String::from("set_nebula_token_address"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.nebula_token_address;
        structure_notice(String::from("set_nebula_token_address"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    }  
}

pub fn handle_change_admin_address(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut new_admin_address: String = String::from(" ");

        if let Some(admin_address) = obj.get("new_admin_address") {
            new_admin_address = admin_address.as_str().unwrap().to_string();
        } else {
            panic!("Please pass in a valid admin address");
        }

        if new_admin_address != String::from(" ") {
            admin_functions::change_admin_address(&mut storage.admin_address, msg_sender.clone(), new_admin_address);
            storage.record_tx(String::from("change_admin_address"), msg_sender.clone(), TransactionStatus::Success);

            let data = &mut storage.admin_address;
            structure_notice(String::from("change_admin_address"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);
        }


    } else {
        panic!("Parsed JSON is not an object");
    }  
}


// {"func": "change_relayer_address", "new_relayer_address": "0xbD8Eba8Bf9e56ad92F4C4Fc89D6CB88902535749"}
pub fn handle_change_relayer_address(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut new_relayer_address: String = String::from(" ");

        if let Some(relayer_address) = obj.get("new_relayer_address") {
            new_relayer_address = relayer_address.as_str().unwrap().to_string().to_lowercase();
        } else {
            panic!("Please pass in a valid relayer address");
        }

        if new_relayer_address != String::from(" ") {
            admin_functions::set_relayer_address(&mut storage.admin_address, msg_sender.clone(), &mut storage.relayer_addr, new_relayer_address);
            storage.record_tx(String::from("change_admin_address"), msg_sender.clone(), TransactionStatus::Success);

            let data = &mut storage.relayer_addr;
            structure_notice(String::from("change_admin_address"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);
        }
        println!("New relayer is: {}", storage.relayer_addr.clone());

    } else {
        panic!("Parsed JSON is not an object");
    }  
}


pub fn handle_transfer_tokens(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut receiver_add: String = String::from(" ");
        let mut trf_amount: f64 = 0.0;

        if let Some(amount) = obj.get("trf_amount") {
            trf_amount = amount.as_f64().unwrap();
        } else {
            panic!("invalid transfer amount");
        }

        if let Some(address) = obj.get("receiver_add") {
            receiver_add = address.as_str().unwrap().to_string();
        } else {
            panic!("Please pass in a valid receiver address");
        }

        if receiver_add != String::from(" ") { 
            market_place::transfer_tokens(&mut storage.all_players, msg_sender.clone(), receiver_add, trf_amount);
            storage.record_tx(String::from("transfer_tokens"), msg_sender.clone(), TransactionStatus::Success);

            let data = &mut storage.all_players;

            let json_data = players_profile_to_json(data.to_vec());
            structure_notice(String::from("transfer_tokens"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);    
        }

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "purchase_single_character", "character_id": 1}
pub fn handle_purchase_single_character(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut character_id: u128 = 0;

        if let Some(id) = obj.get("character_id") {
            character_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid character id");
        }
        game_characters::purchase_single_character(&mut storage.all_players, &mut storage.all_characters, &mut storage.total_characters, msg_sender.clone(), character_id);
        storage.record_tx(String::from("purchase_single_character"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_characters;
        let json_data = character_to_json(data.to_vec());
        structure_notice(String::from("purchase_single_character"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "list_character", "character_id": 1, "price": 10.0}
pub fn handle_listing_character(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut character_id: u128 = 0;
        let mut price: f64 = 0.0;

        if let Some(id) = obj.get("character_id") {
            character_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid character id");
        }

        if let Some(price_a) = obj.get("price") {
            price = price_a.as_f64().unwrap();
        } else {
            panic!("invalid stake amount");
        }

        market_place::list_character(&mut storage.all_characters, &mut storage.all_players, &mut storage.listed_characters, msg_sender.clone(), character_id, price);
        storage.record_tx(String::from("list_character"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.listed_characters;
        let json_data = listed_character_json(data.to_vec());
        structure_notice(String::from("list_character"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "buy_character", "character_id": 10}
pub fn handle_buy_character(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut character_id: u128 = 0;

        if let Some(id) = obj.get("character_id") {
            character_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid character id");
        }
        
        market_place::buy_character(&mut storage.all_players, &mut storage.all_characters, &mut storage.listed_characters, msg_sender.clone(), character_id, &mut storage.profit_from_p2p_sales);
        storage.record_tx(String::from("buy_character"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_characters;
        let json_data = character_to_json(data.to_vec());
        structure_notice(String::from("buy_character"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "purchase_points", "amount": 10.0}
pub fn handle_purchase_points(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut amount: f64 = 0.0;

        if let Some(amt) = obj.get("amount") {
            amount = amt.as_f64().unwrap();
        } else {
            panic!("invalid purchase amount");
        }

        market_place::purchase_points(&mut storage.all_players, msg_sender.clone(), amount, storage.points_rate, &mut storage.profit_from_points_purchase);
        storage.record_tx(String::from("purchase_points"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_players;

        let json_data = players_profile_to_json(data.to_vec());
        structure_notice(String::from("purchase_points"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "modify_list_price", "character_id": 1, "price": 10.0}
pub fn handle_modify_list_price(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut character_id: u128 = 0;
        let mut price: f64 = 0.0;

        if let Some(id) = obj.get("character_id") {
            character_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid character id");
        }

        if let Some(price_a) = obj.get("price") {
            price = price_a.as_f64().unwrap();
        } else {
            panic!("invalid stake amount");
        }

        market_place::modify_list_price(&mut storage.listed_characters, msg_sender.clone(), character_id, price);
        storage.record_tx(String::from("modify_list_price"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.listed_characters;
        let json_data = listed_character_json(data.to_vec());
        structure_notice(String::from("modify_list_price"), &mut storage.total_transactions, msg_sender.clone(), json_data.clone(), &mut storage.server_addr);
        
    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "change_points_rate", "point_rate": 5.0}
pub fn handle_change_points_rate(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut new_point_rate: f64 = 0.0;

        if let Some(point_rate) = obj.get("new_point_rate") {
            new_point_rate = point_rate.as_f64().unwrap();
        } else {
            panic!("invalid point rate");
        }

        admin_functions::change_points_rate(&mut storage.admin_address, msg_sender.clone(), &mut storage.points_rate, new_point_rate);
        storage.record_tx(String::from("change_points_rate"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.points_rate.to_string();
        structure_notice(String::from("change_points_rate"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);
    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "modify_monika", "new_monika": "NonnyJoe"}
pub fn handle_modify_monika(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut new_monika = String::from("new_player");

        if let Some(monika) = obj.get("new_monika") {
            new_monika = monika.as_str().unwrap().to_string();
        } else {
            panic!("Please pass valid monika");
        }
        players_profile::modify_monika(&mut storage.all_players, msg_sender.clone(), new_monika);
        storage.record_tx(String::from("modify_monika"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.all_players;

        let json_data = players_profile_to_json(data.to_vec());
        structure_notice(String::from("modify_monika"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);
    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "modify_avatar", "new_avatar_uri": "NonnyJoe_image_uri"}
pub fn handle_modify_avatar(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut new_avatar_uri = String::from("new_player");

        if let Some(avatar_uri) = obj.get("new_avatar_uri") {
            new_avatar_uri = avatar_uri.as_str().unwrap().to_string();
        } else {
            panic!("Please pass valid avatar");
        }
        players_profile::modify_avatar(&mut storage.all_players, msg_sender.clone(), new_avatar_uri);
        storage.record_tx(String::from("modify_avatar"), msg_sender.clone(), TransactionStatus::Success);

        let data = &mut storage.all_players;

        let json_data = players_profile_to_json(data.to_vec());
        structure_notice(String::from("modify_avatar"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);  
    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "withdraw_profit_from_stake", "amount": 10.0}
pub fn handle_withdraw_profit_from_stake(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut amount: f64 = 0.0;

        if let Some(amt) = obj.get("amount") {
            amount = amt.as_f64().unwrap();
        } else {
            panic!("Please pass in a valid withdrawal amount");
        }

        admin_functions::withdraw_profit_from_stake(&mut storage.admin_address, msg_sender.clone(), &mut storage.profit_from_stake, amount);
        storage.record_tx(String::from("withdraw_profit_from_stake"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.profit_from_stake.to_string();
        structure_notice(String::from("withdraw_profit_from_stake"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "withdraw_profit_from_p2p_sales", "amount": 10.0}
pub fn handle_withdraw_profit_from_p2p_sales(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut amount: f64 = 0.0;

        if let Some(amt) = obj.get("amount") {
            amount = amt.as_f64().unwrap();
        } else {
            panic!("Please pass in a valid withdrawal amount");
        }
        admin_functions::withdraw_profit_from_p2p_sales(&mut storage.admin_address, msg_sender.clone(), &mut storage.profit_from_p2p_sales, amount);
        storage.record_tx(String::from("withdraw_profit_from_p2p_sales"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.profit_from_p2p_sales.to_string();
        structure_notice(String::from("withdraw_profit_from_p2p_sales"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "withdraw_profit_from_points_purchase", "amount": 10.0}
pub fn handle_withdraw_profit_from_points_purchase(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut amount: f64 = 0.0;

        if let Some(amt) = obj.get("amount") {
            amount = amt.as_f64().unwrap();
        } else {
            panic!("Please pass in a valid withdrawal amount");
        }
        admin_functions::withdraw_profit_from_points_purchase(&mut storage.admin_address, msg_sender.clone(), &mut storage.profit_from_points_purchase, amount);
        storage.record_tx(String::from("withdraw_profit_from_points_purchase"), msg_sender.clone(), TransactionStatus::Success);
    
        let data = &mut storage.profit_from_points_purchase.to_string();
        structure_notice(String::from("withdraw_profit_from_points_purchase"), &mut storage.total_transactions, msg_sender.clone(), data.clone(), &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "withdraw_character_as_nft", "character_id": 10}
pub fn handle_withdraw_character_as_nft(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut character_id: u128 = 0;

        if let Some(id) = obj.get("character_id") {
            character_id = id.as_u64().unwrap().into();
        } else {
            panic!("invalid character id");
        }

        market_place::withdraw_character_as_nft(&mut storage.all_players, &mut storage.all_characters, msg_sender.clone(), character_id, &mut storage.all_offchain_characters);
        storage.record_tx(String::from("withdraw_character_as_nft"), msg_sender.clone(), TransactionStatus::Success);
        
        let data = &mut storage.all_offchain_characters;
        let json_data = vec_of_id_to_json(data.clone());
       
        structure_notice(String::from("withdraw_character_as_nft"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}

// {"func": "withdraw", "amount": 10.0}
pub fn handle_withdraw(payload: &JsonValue, msg_sender: String, storage: &mut Storage) {
    if let JsonValue::Object(obj) = payload.clone() { 
        let mut amount: f64 = 0.0;

        if let Some(amt) = obj.get("amount") {
            amount = amt.as_f64().unwrap();
        } else {
            panic!("Please pass in a valid withdrawal amount");
        }
        
        market_place::withdraw(&mut storage.all_players, msg_sender.clone(), amount);
        storage.record_tx(String::from("withdraw"), msg_sender.clone(), TransactionStatus::Success);
    
        let data = &mut storage.all_players;

        let json_data = players_profile_to_json(data.to_vec());
        structure_notice(String::from("withdraw"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);

    } else {
        panic!("Parsed JSON is not an object");
    } 
}


pub fn handle_deposit(payload: &str, msg_sender: String, storage: &mut Storage) {
    match erc20_deposit_parse(payload) {
        Ok((token, receiver, amount)) => {
            println!("Sender Address: {}", token);
            println!("Receiver Address: {}", receiver);
            println!("Amount: {}", amount);
            let deposit_amount: f64 = amount as f64;

            if token.to_string() == storage.cartesi_token_address.clone() {
                market_place::deposit(&mut storage.all_players, receiver.to_string(), deposit_amount);
                storage.record_tx(String::from("deposit"), msg_sender.clone(), TransactionStatus::Success);

                let data = &mut storage.all_players;
                let json_data = players_profile_to_json(data.to_vec());
                structure_notice(String::from("deposit"), &mut storage.total_transactions, msg_sender.clone(), json_data, &mut storage.server_addr);
             
            }
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }
}


pub fn erc20_deposit_parse(payload: &str) -> Result<(&str, &str, u128), String> {
    if payload.len() < 146 {
        return Err("Payload length is incorrect".to_string());
    }

    let bytes = match hex::decode(payload) {
        Ok(bytes) => bytes,
        Err(_) => return Err("Failed to decode hex payload".to_string()),
    };

    if bytes[0] != 1 {
        return Err("ERC20 deposit unsuccessful".to_string());
    }

    let token_address = &payload[2..42];
    let receiver_address = &payload[42..82];
    let amount_str = &payload[82..146];

    let amount = match u128::from_str_radix(amount_str, 16) {
        Ok(amount) => amount,
        Err(_) => return Err("Failed to parse amount".to_string()),
    };

    Ok((token_address, receiver_address, amount))
}

pub fn handle_deposit_character_as_nft(payload: &str, msg_sender: String, storage: &mut Storage) {
    match erc721_deposit_parse(payload) {
        Ok((token, receiver, id)) => {
            println!("Token Address: {}", token);
            println!("Receiver Address: {}", receiver);
            println!("Amount: {}", id);

            if token.to_string() == storage.nebula_nft_address.clone() {
                market_place::deposit_character_as_nft(&mut storage.all_players, &mut storage.all_characters, receiver.to_string(), id, &mut storage.all_offchain_characters);
                storage.record_tx(String::from("deposit_character_as_nft"), msg_sender.clone(), TransactionStatus::Success);
                
            }
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }
}

pub fn erc721_deposit_parse(payload: &str) -> Result<(&str, &str, u128), String> {
    if payload.len() < 144 {
        return Err("Payload length is incorrect".to_string());
    }

    let bytes = match hex::decode(payload) {
        Ok(bytes) => bytes,
        Err(_) => return Err("Failed to decode hex payload".to_string()),
    };

    let token_address = &payload[0..40];
    let receiver_address = &payload[40..80];
    let token_id = &payload[80..144];

    let id = match u128::from_str_radix(token_id, 16) {
        Ok(id) => id,
        Err(_) => return Err("Failed to parse amount".to_string()),
    };

    Ok((token_address, receiver_address, id))
}