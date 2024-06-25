use crate::structures::*;
use crate::storage::Storage;
use crate::players_profile::{Player, UserTransaction, find_player};
use crate::game_characters::get_character_details;
use crate::battle_challenge::get_duel;

pub fn inspect_router( payload: &str, storage: &mut Storage) {

    let new_payload = split_string(payload);
    match new_payload[0] {
        "profile" => {
            println!("Fetching Profile!!");
            handle_fetch_profile(new_payload, storage);
        },
        "characters" => {
            println!("Fetching characters!!");
            handle_fetch_characters(new_payload, storage);
        },
        "duels" => {
            println!("Fetching Duels!!");
            handle_fetch_duels(new_payload, storage);
        },
        "available_duels" => {
            println!("Fetching Available Duels!!");
            handle_fetch_available_duels(new_payload, storage);
        },
        "listed_characters" => {
            println!("Fetching listed_characters!!");
            handle_fetch_listed_characters(new_payload, storage);
        },
        "has_profile" => {
            println!("Checking if user has profile!!");
            handle_check_has_profile(new_payload, storage);
        },
        "admin" => {
            println!("Checking admin address!!");
            handle_check_admin_addr(new_payload, storage);
        },
        "relayer" => {
            println!("Checking relayer address!!");
            handle_check_relayer_addr(new_payload, storage);
        },
        _ => todo!(),
    }
}

fn split_string(input: &str) -> Vec<&str> {
    input.split('/').collect()
}

fn handle_fetch_profile(new_payload: Vec<&str>, storage: &mut Storage) {
    if new_payload.len() > 1 {
        println!("Fetching Profile for {}", new_payload[1]);
        match find_player(&mut storage.all_players, (*new_payload[1]).to_string()) {
            Some(player) => {

                println!("Found Player {:?}", player);
                let player_string = single_player_profile_to_json(player);
                emit_report(&player_string, &storage.server_addr);
            },
            None => {
                println!("Player not found");
            }
        }
    } else {
        println!("Fetching all Profiles");
        let all_players_string = players_profile_to_json(storage.all_players.clone());
        emit_report(&all_players_string, &storage.server_addr);
    }
}

fn handle_fetch_characters(new_payload: Vec<&str>, storage: &mut Storage) {
    if new_payload.len() > 1 {
        println!("Fetching characters with id:{}", new_payload[1]);
        let characters_string = single_character_to_json(get_character_details(&mut storage.all_characters, new_payload[1].parse::<u128>().unwrap()).clone());
        emit_report(&characters_string, &storage.server_addr);

    } else {
        println!("Fetching all characters");
        let all_characters_string = character_to_json(storage.all_characters.clone());
        emit_report(&all_characters_string, &storage.server_addr);
    }
}

fn handle_fetch_duels(new_payload: Vec<&str>, storage: &mut Storage) {
    if new_payload.len() > 1 {
        println!("Fetching duels with id:{}", new_payload[1]);
        let duel = get_duel(&mut storage.all_duels, new_payload[1].parse::<u128>().unwrap()).unwrap();
        let duels_string = single_duel_to_json(duel.clone());
        emit_report(&duels_string, &storage.server_addr);
    } else {
        println!("Fetching all duels");
        let all_duels_string = duels_to_json(storage.all_duels.clone());
        emit_report(&all_duels_string, &storage.server_addr);
    }
}

fn handle_fetch_available_duels(new_payload: Vec<&str>, storage: &mut Storage) {
    println!("Fetching available duels");
    let all_duels_string = duels_to_json(storage.available_duels.clone());
    emit_report(&all_duels_string, &storage.server_addr);
}

fn handle_fetch_listed_characters(new_payload: Vec<&str>, storage: &mut Storage) {
    println!("Fetching listed characters");
    let listed_characters_string = listed_character_json(storage.listed_characters.clone());
    emit_report(&listed_characters_string, &storage.server_addr);
}

fn handle_check_has_profile(new_payload: Vec<&str>, storage: &mut Storage) {
    match find_player(&mut storage.all_players, (*new_payload[1]).to_string()) {
        Some(player) => {
            println!("Found Player {:?}", player);
            let status = (true).to_string();
            emit_report(&status, &storage.server_addr);
        },
        None => {
            println!("Player not found");
            let status = (false).to_string();
            emit_report(&status, &storage.server_addr);
        }
    }
}

fn handle_check_admin_addr(new_payload: Vec<&str>, storage: &mut Storage) {
    let admin = storage.admin_address.clone();
    emit_report(&admin, &storage.server_addr);
}

fn handle_check_relayer_addr(new_payload: Vec<&str>, storage: &mut Storage) {
    let relayer = storage.relayer_addr.clone();
    emit_report(&relayer, &storage.server_addr);
}