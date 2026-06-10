use crate::battle_challenge::get_duel;
use crate::game_characters::{get_character_details, get_characters};
use crate::players_profile::find_player;
use crate::storage::Storage;
use crate::structures::*;

/// Inspect routes are read-only. Every route ALWAYS emits a report — either
/// the requested data or a structured `{"error": ...}` object — so the
/// frontend never hangs waiting for a response that was silently skipped.
pub fn inspect_router(payload: &str, storage: &mut Storage) {
    let new_payload = split_string(payload);
    let result: Result<String, String> = match new_payload[0] {
        "profile" => {
            println!("Fetching Profile!!");
            handle_fetch_profile(&new_payload, storage)
        }
        "characters" => {
            println!("Fetching characters!!");
            handle_fetch_characters(&new_payload, storage)
        }
        "duels" => {
            println!("Fetching Duels!!");
            handle_fetch_duels(&new_payload, storage)
        }
        "available_duels" => {
            println!("Fetching Available Duels!!");
            Ok(duels_to_json(storage.available_duels.clone()))
        }
        "listed_characters" => {
            println!("Fetching listed_characters!!");
            Ok(listed_character_json(storage.listed_characters.clone()))
        }
        "has_profile" => {
            println!("Checking if user has profile!!");
            handle_check_has_profile(&new_payload, storage)
        }
        "admin" => Ok(storage.admin_address.clone()),
        "relayer" => Ok(storage.relayer_addr.clone()),
        "check_relayed_dapp_address" => Ok(storage.has_relayed_address.to_string()),
        "players_characters" => {
            println!("Fetching a players characters");
            handle_get_players_characters(&new_payload, storage)
        }
        "get_duel_characters" => {
            println!("Fetching characters in duel");
            handle_get_characters_in_duel(&new_payload, storage)
        }
        other => Err(format!("Inspect route '{}' not implemented", other)),
    };

    match result {
        Ok(data) => {
            if let Err(e) = emit_report(&data, &storage.server_addr) {
                println!("Failed to emit inspect report: {}", e);
            }
        }
        Err(error) => {
            println!("Inspect error: {}", error);
            emit_error_report("inspect", &error, &storage.server_addr);
        }
    }
}

fn split_string(input: &str) -> Vec<&str> {
    input.split('/').collect()
}

fn handle_fetch_profile(new_payload: &Vec<&str>, storage: &mut Storage) -> Result<String, String> {
    if new_payload.len() > 1 && !new_payload[1].is_empty() {
        println!("Fetching Profile for {}", new_payload[1]);
        match find_player(&mut storage.all_players, new_payload[1].to_string()) {
            Some(player) => Ok(single_player_profile_to_json(player)),
            None => Err(format!("Player {} not found", new_payload[1])),
        }
    } else {
        println!("Fetching all Profiles");
        Ok(players_profile_to_json(storage.all_players.clone()))
    }
}

fn handle_fetch_characters(
    new_payload: &Vec<&str>,
    storage: &mut Storage,
) -> Result<String, String> {
    if new_payload.len() > 1 && !new_payload[1].is_empty() {
        let character_id = new_payload[1]
            .parse::<u128>()
            .map_err(|_| format!("Invalid character id: {}", new_payload[1]))?;
        let character = get_character_details(&mut storage.all_characters, character_id)
            .ok_or_else(|| format!("Character with id {} not found", character_id))?;
        Ok(single_character_to_json(character.clone()))
    } else {
        println!("Fetching all characters");
        Ok(character_to_json(storage.all_characters.clone()))
    }
}

fn handle_fetch_duels(new_payload: &Vec<&str>, storage: &mut Storage) -> Result<String, String> {
    if new_payload.len() > 1 && !new_payload[1].is_empty() {
        let duel_id = new_payload[1]
            .parse::<u128>()
            .map_err(|_| format!("Invalid duel id: {}", new_payload[1]))?;
        let duel = get_duel(&mut storage.all_duels, duel_id)
            .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
        Ok(single_duel_to_json(duel.clone()))
    } else {
        println!("Fetching all duels");
        Ok(duels_to_json(storage.all_duels.clone()))
    }
}

fn handle_check_has_profile(
    new_payload: &Vec<&str>,
    storage: &mut Storage,
) -> Result<String, String> {
    if new_payload.len() > 1 && !new_payload[1].is_empty() {
        let has_profile =
            find_player(&mut storage.all_players, new_payload[1].to_string()).is_some();
        Ok(has_profile.to_string())
    } else {
        Err("Usage: has_profile/<wallet_address>".to_string())
    }
}

fn handle_get_players_characters(
    new_payload: &Vec<&str>,
    storage: &mut Storage,
) -> Result<String, String> {
    if new_payload.len() > 1 && !new_payload[1].is_empty() {
        let mut all_characters = Vec::new();
        let character_ids = get_characters(&mut storage.all_players, new_payload[1].to_string())
            .ok_or_else(|| format!("Player {} not found", new_payload[1]))?;
        for character in character_ids {
            if let Some(details) = get_character_details(&mut storage.all_characters, character) {
                all_characters.push(details.clone());
            }
        }
        Ok(character_to_json(all_characters))
    } else {
        Err("Usage: players_characters/<wallet_address>".to_string())
    }
}

fn handle_get_characters_in_duel(
    new_payload: &Vec<&str>,
    storage: &mut Storage,
) -> Result<String, String> {
    if new_payload.len() < 3 {
        return Err("Usage: get_duel_characters/<duel_id>/<wallet_address>".to_string());
    }

    let duel_id = new_payload[1]
        .parse::<u128>()
        .map_err(|_| format!("Invalid duel id: {}", new_payload[1]))?;
    let caller = new_payload[2].to_lowercase();

    let (creator_warriors, opponent_warriors, creator, opponent) = {
        let duel = get_duel(&mut storage.all_duels, duel_id)
            .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
        (
            duel.creator_warriors.clone(),
            duel.opponent_warriors.clone(),
            duel.duel_creator.to_lowercase(),
            duel.duel_opponent.to_lowercase(),
        )
    };

    let warrior_ids = if caller == creator {
        creator_warriors
    } else if caller == opponent {
        opponent_warriors
    } else {
        return Err("Address is neither the creator nor the opponent of this duel".to_string());
    };

    let mut all_characters = Vec::new();
    for character in warrior_ids {
        if let Some(details) = get_character_details(&mut storage.all_characters, character) {
            all_characters.push(details.clone());
        }
    }
    Ok(character_to_json(all_characters))
}
