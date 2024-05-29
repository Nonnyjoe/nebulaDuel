use hyper::Method;
use crate::battle_challenge::Duel;
use crate::game_characters::Character;
use crate::players_profile::{Player, UserTransaction};
use crate::market_place::SaleDetails;
use crate::ai_battle;
use crate::structures::{TransactionData, TransactionStatus, emit_notice};
extern crate json;
use json::JsonValue;

pub struct Storage {
    pub total_players: u128,
    pub admin_address: String,
    pub all_players: Vec<Player>,
    pub all_characters: Vec<Character>,
    pub listed_characters: Vec<SaleDetails>,
    pub total_characters: u128,
    pub all_duels: Vec<Duel>,
    pub all_ai_duels: Vec<Duel>,
    pub available_duels: Vec<Duel>,
    pub total_duels: u128,
    pub points_rate: f64,
    pub who_plays_first: u128,
    pub profit_from_stake: f64,
    pub profit_from_p2p_sales : f64,
    pub profit_from_points_purchase : f64,
    pub all_offchain_characters: Vec<u128>,
    pub cartesi_token_address: String,
    pub nebula_token_address: String,
    pub nebula_nft_address: String,
    pub dapp_contract_address: String,
    pub total_transactions: u128,
    pub all_transactions: Vec<TransactionData>,
    pub server_addr: String,
}

impl Storage {
    pub fn new(server_addr: String) -> Self { 
        Self {
            total_players: 0,
            admin_address: String::from("0xAdmin"),
            all_players: Vec::new(),
            all_characters: Vec::new(),
            listed_characters: Vec::new(),
            total_characters: 0,
            all_duels: Vec::new(),
            all_ai_duels: Vec::new(),
            available_duels: Vec::new(),
            total_duels: 0,
            points_rate : 100.00,
            who_plays_first: 1,
            profit_from_stake: 0.0,
            profit_from_p2p_sales: 0.0,
            profit_from_points_purchase: 0.0,
            all_offchain_characters: Vec::new(),
            cartesi_token_address: String::from("0xCartesiTokenAddress"),
            nebula_token_address: String::from("0xNebulaTokenAddress"),
            nebula_nft_address: String::from("0xNebulaNftAddress"),
            dapp_contract_address: String::from("0xNebulaNftAddress"),
            total_transactions: 0,
            all_transactions: Vec::new(),
            server_addr,
        }
    }

    pub fn record_tx(&mut self, method: String, caller: String, status: TransactionStatus) {
        let tx_id = self.total_transactions;
        let new_tx = TransactionData {
            tx_id: tx_id.clone(),
            method: method.clone(),
            caller: caller.clone(),
            status: status.clone(),
        };
        self.all_transactions.push(new_tx);

        let all_tx_string = transaction_to_json(&mut self.all_transactions);
        let json_structure_string = standard_output_to_json(tx_id, method, caller, all_tx_string).dump();

        emit_notice(&json_structure_string[..], &mut self.server_addr[..]);
        
    }
}

pub struct BaseContracts {
    pub erc20_portal: String,
    pub erc721_portal: String,
    pub dapp_relayer: String,
    pub input_box: String,
}

impl BaseContracts {
    pub fn new() -> Self {
        Self {
            erc20_portal: String::from("0xAdmin"),
            erc721_portal: String::from("0xAdmin"),
            dapp_relayer: String::from("0xAdmin"),
            input_box: String::from("0xAdmin"),
            
        }
    }
}


pub fn deployment_setup(storage: &mut Storage) {
    ai_battle::set_up_ai(&mut storage.all_players, &mut storage.total_players, &mut storage.all_characters, &mut storage.total_characters);
}


fn transaction_to_json(transactions: &mut Vec<TransactionData>) -> String {
    let mut json_array = JsonValue::new_array();

    for tx in transactions {
        let mut tx_json = JsonValue::new_object();

        let status = match tx.status{
            TransactionStatus::Failed => {String::from("Failed")},
            TransactionStatus::Success => {String::from("Success")},
            TransactionStatus::Pending => {String::from("Pending")},
        };
        tx_json["tx_id"] = (tx.tx_id as u64).into();
        tx_json["method"] = tx.method.clone().into();
        tx_json["caller"] = tx.caller.clone().into();
        tx_json["status"] = status.to_string().into();
        json_array.push(tx_json).unwrap();
    }
    json_array.dump()
}


fn standard_output_to_json(tx_id: u128, method: String, target: String, all_tx_data: String) -> JsonValue {
    let mut output_json = JsonValue::new_object();

    output_json["method"] = method.into();
    output_json["tx_id"] = (tx_id as u64).into();
    output_json["target"] =target.into();
    output_json["data"] = all_tx_data.into();
    output_json["notice_type"] = String::from("all_tx").into();

    output_json

}

