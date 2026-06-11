use crate::admin_functions;
use crate::ai_battle;
use crate::battle_challenge;
use crate::battle_challenge::Difficulty;
use crate::campaign;
use crate::game_characters;
use crate::market_place;
use crate::players_profile;
use crate::players_profile::get_profile;
use crate::storage::*;
use crate::strategy_simulation;
use crate::strategy_simulation::AllStrategies;
use crate::structures::*;
use json::object::Object;
use json::JsonValue;
extern crate hex;

// ---------------------------------------------------------------------------
// Payload extraction helpers. All input is untrusted: every field access goes
// through these so a malformed payload becomes a rejected input, never a
// panic that halts the Cartesi machine.
// ---------------------------------------------------------------------------

fn as_object(payload: &JsonValue) -> Result<&Object, String> {
    match payload {
        JsonValue::Object(obj) => Ok(obj),
        _ => Err("Payload is not a JSON object".to_string()),
    }
}

fn get_str(obj: &Object, key: &str) -> Result<String, String> {
    obj.get(key)
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("Missing or invalid field '{}'", key))
}

fn get_u128(obj: &Object, key: &str) -> Result<u128, String> {
    obj.get(key)
        .and_then(|v| v.as_u64())
        .map(|v| v as u128)
        .ok_or_else(|| format!("Missing or invalid field '{}'", key))
}

fn get_f64(obj: &Object, key: &str) -> Result<f64, String> {
    obj.get(key)
        .and_then(|v| v.as_f64())
        .ok_or_else(|| format!("Missing or invalid field '{}'", key))
}

fn get_bool(obj: &Object, key: &str) -> Result<bool, String> {
    obj.get(key)
        .and_then(|v| v.as_bool())
        .ok_or_else(|| format!("Missing or invalid field '{}'", key))
}

fn get_char_ids(obj: &Object) -> Result<Vec<u128>, String> {
    Ok(vec![
        get_u128(obj, "char_id1")?,
        get_u128(obj, "char_id2")?,
        get_u128(obj, "char_id3")?,
    ])
}

pub fn structure_notice(
    method: String,
    tx_id: &mut u128,
    target: String,
    data: String,
    server_addr: &mut String,
) {
    let mut output_json = JsonValue::new_object();

    output_json["method"] = method.into();
    output_json["tx_id"] = (*tx_id as u64).into();
    output_json["target"] = target.into();
    output_json["data"] = data.into();
    output_json["notice_type"] = String::from("specific_tx").into();

    if let Err(e) = emit_notice(&output_json.dump()[..], &mut server_addr[..]) {
        println!("Failed to emit notice: {}", e);
    }
}

// ---------------------------------------------------------------------------
// Router: dispatches a validated func name to its handler. Returns Err for
// any invalid input so /finish reports `reject` and the frontend receives a
// structured error report.
// ---------------------------------------------------------------------------

pub async fn router(
    route: &JsonValue,
    payload: &JsonValue,
    msg_sender: &str,
    storage: &mut Storage,
    time_stamp: u128,
) -> Result<(), String> {
    storage.total_transactions += 1;

    let function = route
        .as_str()
        .ok_or("Could not decode 'func' field as a string")?;

    let result: Result<(), String> = match function {
        "change_admin_address" => {
            handle_change_admin_address(payload, msg_sender.to_string(), storage).await
        }
        "change_relayer_address" => {
            handle_change_relayer_address(payload, msg_sender.to_string(), storage).await
        }
        "change_points_rate" => {
            handle_change_points_rate(payload, msg_sender.to_string(), storage).await
        }
        "set_cartesi_token_address" => {
            handle_set_cartesi_token_address(payload, msg_sender.to_string(), storage).await
        }
        "set_nebula_token_address" => {
            handle_set_nebula_token_address(payload, msg_sender.to_string(), storage).await
        }
        "withdraw_profit_from_stake" => {
            handle_withdraw_profit_from_stake(payload, msg_sender.to_string(), storage).await
        }
        "withdraw_profit_from_p2p_sales" => {
            handle_withdraw_profit_from_p2p_sales(payload, msg_sender.to_string(), storage).await
        }
        "withdraw_profit_from_points_purchase" => {
            handle_withdraw_profit_from_points_purchase(payload, msg_sender.to_string(), storage)
                .await
        }
        "withdraw_character_as_nft" => {
            handle_withdraw_character_as_nft(payload, msg_sender.to_string(), storage).await
        }
        "withdraw" => handle_withdraw(payload, msg_sender.to_string(), storage).await,
        "create_ai_duel" => {
            handle_create_ai_duel(payload, msg_sender.to_string(), storage, time_stamp).await
        }
        "select_ai_battle_strategy" => {
            handle_select_ai_battle_strategy(payload, msg_sender.to_string(), storage).await
        }
        "create_duel" => {
            handle_create_duel(payload, msg_sender.to_string(), storage, time_stamp).await
        }
        "join_duel" => handle_join_duel(payload, msg_sender.to_string(), storage).await,
        "set_strategy" => handle_set_strategy(payload, msg_sender.to_string(), storage).await,
        "fight" => handle_fight(payload, msg_sender.to_string(), storage).await,
        "purchase_team" => handle_purchase_team(payload, msg_sender.to_string(), storage).await,
        "transfer_tokens" => {
            handle_transfer_tokens(payload, msg_sender.to_string(), storage).await
        }
        "purchase_single_character" => {
            handle_purchase_single_character(payload, msg_sender.to_string(), storage, time_stamp)
                .await
        }
        "list_character" => {
            handle_listing_character(payload, msg_sender.to_string(), storage).await
        }
        "delist_character" => {
            handle_delist_character(payload, msg_sender.to_string(), storage).await
        }
        "set_marketplace_fee" => {
            handle_set_marketplace_fee(payload, msg_sender.to_string(), storage).await
        }
        "buy_character" => handle_buy_character(payload, msg_sender.to_string(), storage).await,
        "purchase_points" => {
            handle_purchase_points(payload, msg_sender.to_string(), storage).await
        }
        "modify_list_price" => {
            handle_modify_list_price(payload, msg_sender.to_string(), storage).await
        }
        "create_player" => handle_create_player(payload, msg_sender.to_string(), storage).await,
        "modify_monika" => handle_modify_monika(payload, msg_sender.to_string(), storage).await,
        "modify_avatar" => handle_modify_avatar(payload, msg_sender.to_string(), storage).await,
        "play_campaign_level" => {
            handle_play_campaign_level(payload, msg_sender.to_string(), storage, time_stamp).await
        }
        _ => Err(format!("Method '{}' does not exist", function)),
    };

    // Register the transaction on the caller's profile (success or failure is
    // part of the deterministic state either way).
    if let Some(player) = get_profile(&mut storage.all_players, msg_sender.to_string()) {
        player.register_transaction(
            &mut storage.all_characters,
            storage.total_transactions,
            function.to_string(),
        );
    }

    result
}

// {"func": "create_player", "monika": "NonnyJoe", "avatar_url": "nonnyjoe_image1"}
pub async fn handle_create_player(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let user_monika = get_str(obj, "monika")?;
    let avatar_url = get_str(obj, "avatar_url")?;

    if user_monika.trim().is_empty() {
        return Err("Monika cannot be empty".to_string());
    }

    players_profile::create_player(
        user_monika,
        msg_sender.clone(),
        avatar_url,
        &mut storage.all_players,
        &mut storage.total_players,
    )
    .ok_or("Address already has a profile")?;

    storage.record_tx(
        String::from("create_player"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("create_player"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );

    println!("Total players now is: {}", storage.total_players);
    Ok(())
}

// {"func": "purchase_team", "char_id1": 2, "char_id2": 3, "char_id3": 6}
pub async fn handle_purchase_team(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let ids = get_char_ids(obj)?;

    game_characters::purchase_team(
        &mut storage.all_players,
        &mut storage.all_characters,
        &mut storage.total_characters,
        msg_sender.clone(),
        ids[0],
        ids[1],
        ids[2],
    )?;

    storage.record_tx(
        String::from("purchase_team"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = character_to_json(storage.all_characters.to_vec());
    structure_notice(
        String::from("purchase_team"),
        &mut storage.total_transactions,
        msg_sender.clone(),
        json_data,
        &mut storage.server_addr,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("create_player"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "create_duel", "char_id1": 9, "char_id2": 10, "char_id3": 11, "has_staked": false, "stake_amount": 0.0}
pub async fn handle_create_duel(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
    time_stamp: u128,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let char_ids = get_char_ids(obj)?;
    let has_staked = get_bool(obj, "has_staked")?;
    let stake_amount = get_f64(obj, "stake_amount")?;

    battle_challenge::create_duel(
        &mut storage.all_duels,
        &mut storage.all_characters,
        &mut storage.all_players,
        &mut storage.total_duels,
        msg_sender.clone(),
        char_ids,
        &mut storage.available_duels,
        has_staked,
        stake_amount,
        time_stamp,
    )?;

    storage.record_tx(
        String::from("create_duel"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = duels_to_json(storage.all_duels.to_vec());
    structure_notice(
        String::from("create_duel"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "join_duel", "char_id1": 12, "char_id2": 13, "char_id3": 14, "duel_id": 1}
pub async fn handle_join_duel(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let char_ids = get_char_ids(obj)?;
    let duel_id = get_u128(obj, "duel_id")?;

    battle_challenge::join_duel(
        &mut storage.all_duels,
        &mut storage.all_characters,
        &mut storage.all_players,
        duel_id,
        msg_sender.clone(),
        char_ids,
    )?;

    storage.record_tx(
        String::from("join_duel"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = duels_to_json(storage.all_duels.to_vec());
    structure_notice(
        String::from("join_duel"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "set_strategy", "strategy_id": 1, "duel_id": 1}
pub async fn handle_set_strategy(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let strategy_id = get_u128(obj, "strategy_id")?;
    let duel_id = get_u128(obj, "duel_id")?;

    let strategy = strategy_simulation::decode_strategy(strategy_id)
        .ok_or_else(|| format!("Invalid strategy id: {}", strategy_id))?;

    let both_selected = battle_challenge::set_strategy(
        &mut storage.all_duels,
        duel_id,
        msg_sender.clone(),
        strategy,
    )?;

    if both_selected {
        battle_challenge::fight(
            &mut storage.all_duels,
            &mut storage.all_characters,
            duel_id,
            &mut storage.all_players,
            &mut storage.available_duels,
            &mut storage.profit_from_stake,
        )?;

        let json_data = duels_to_json(storage.all_duels.to_vec());
        structure_notice(
            String::from("fight"),
            &mut storage.total_transactions,
            msg_sender.clone(),
            json_data,
            &mut storage.server_addr,
        );
    }

    storage.record_tx(
        String::from("set_strategy"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = duels_to_json(storage.all_duels.to_vec());
    structure_notice(
        String::from("set_strategy"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );

    println!("Strategy set successfully!!");
    Ok(())
}

// {"func": "fight", "duel_id": 1}
pub async fn handle_fight(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let duel_id = get_u128(obj, "duel_id")?;

    battle_challenge::fight(
        &mut storage.all_duels,
        &mut storage.all_characters,
        duel_id,
        &mut storage.all_players,
        &mut storage.available_duels,
        &mut storage.profit_from_stake,
    )?;

    storage.record_tx(
        String::from("fight"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = duels_to_json(storage.all_duels.to_vec());
    structure_notice(
        String::from("fight"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "create_ai_duel", "char_id1": 14, "char_id2": 15, "char_id3": 16, "difficulty_id": 1}
pub async fn handle_create_ai_duel(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
    time_stamp: u128,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let char_ids = get_char_ids(obj)?;
    let difficulty_id = get_u128(obj, "difficulty_id")?;

    let difficulty: Difficulty = ai_battle::decode_difficulty(difficulty_id)
        .ok_or_else(|| format!("Invalid difficulty id: {}", difficulty_id))?;

    ai_battle::create_ai_duel(
        &mut storage.all_ai_duels,
        &mut storage.all_duels,
        &mut storage.all_characters,
        &mut storage.all_players,
        &mut storage.total_duels,
        msg_sender.clone(),
        char_ids,
        difficulty,
        time_stamp,
    )?;

    storage.record_tx(
        String::from("create_ai_duel"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = duels_to_json(storage.all_ai_duels.to_vec());
    structure_notice(
        String::from("create_ai_duel"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "select_ai_battle_strategy", "strategy_id": 1, "duel_id": 1}
pub async fn handle_select_ai_battle_strategy(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let strategy_id = get_u128(obj, "strategy_id")?;
    let duel_id = get_u128(obj, "duel_id")?;

    let strategy = strategy_simulation::decode_strategy(strategy_id)
        .ok_or_else(|| format!("Invalid strategy id: {}", strategy_id))?;

    ai_battle::select_ai_battle_strategy(
        &mut storage.all_ai_duels,
        &mut storage.all_duels,
        duel_id,
        msg_sender.clone(),
        strategy,
        &mut storage.all_characters,
        &mut storage.all_players,
    )?;

    storage.record_tx(
        String::from("select_ai_battle_strategy"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = duels_to_json(storage.all_duels.to_vec());
    structure_notice(
        String::from("select_ai_battle_strategy"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );

    println!("Strategy set successfully!!");
    Ok(())
}

pub async fn handle_set_cartesi_token_address(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let ctsi_token = get_str(obj, "ctsi_token")?;

    admin_functions::set_cartesi_token_address(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.cartesi_token_address,
        ctsi_token,
    )?;

    storage.record_tx(
        String::from("set_cartesi_token_address"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.cartesi_token_address.clone();
    structure_notice(
        String::from("set_cartesi_token_address"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

pub async fn handle_set_nebula_token_address(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let nebula_token = get_str(obj, "nebula_token")?;

    admin_functions::set_nebula_token_address(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.nebula_token_address,
        nebula_token,
    )?;

    storage.record_tx(
        String::from("set_nebula_token_address"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.nebula_token_address.clone();
    structure_notice(
        String::from("set_nebula_token_address"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

pub async fn handle_change_admin_address(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let new_admin_address = get_str(obj, "new_admin_address")?;

    admin_functions::change_admin_address(
        &mut storage.admin_address,
        msg_sender.clone(),
        new_admin_address,
    )?;

    storage.record_tx(
        String::from("change_admin_address"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.admin_address.clone();
    structure_notice(
        String::from("change_admin_address"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "change_relayer_address", "new_relayer_address": "0x..."}
pub async fn handle_change_relayer_address(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let new_relayer_address = get_str(obj, "new_relayer_address")?.to_lowercase();

    admin_functions::set_relayer_address(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.relayer_addr,
        new_relayer_address,
    )?;

    storage.record_tx(
        String::from("change_relayer_address"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.relayer_addr.clone();
    structure_notice(
        String::from("change_relayer_address"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    println!("New relayer is: {}", storage.relayer_addr);
    Ok(())
}

// {"func": "transfer_tokens", "trf_amount": 200, "receiver_add": "0x..."}
pub async fn handle_transfer_tokens(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let trf_amount = get_f64(obj, "trf_amount")?;
    let receiver_add = get_str(obj, "receiver_add")?;

    market_place::transfer_tokens(
        &mut storage.all_players,
        msg_sender.clone(),
        receiver_add.to_lowercase(),
        trf_amount,
    )?;

    storage.record_tx(
        String::from("transfer_tokens"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("transfer_tokens"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "purchase_single_character", "character_id": 1, "currency": "points" | "ctsi"}
pub async fn handle_purchase_single_character(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
    time_stamp: u128,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let character_id = get_u128(obj, "character_id")?;
    // Default to points for backward compatibility with older payloads.
    let currency_str = get_str(obj, "currency").unwrap_or_else(|_| "points".to_string());
    let currency = game_characters::decode_currency(&currency_str)?;

    game_characters::purchase_single_character(
        &mut storage.all_players,
        &mut storage.all_characters,
        &mut storage.total_characters,
        msg_sender.clone(),
        character_id,
        currency,
        storage.points_rate,
        time_stamp,
        &mut storage.profit_from_points_purchase,
    )?;

    storage.record_tx(
        String::from("purchase_single_character"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = character_to_json(storage.all_characters.to_vec());
    structure_notice(
        String::from("purchase_single_character"),
        &mut storage.total_transactions,
        msg_sender.clone(),
        json_data,
        &mut storage.server_addr,
    );
    // Balances/premium counters changed too.
    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("purchase_points"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "delist_character", "character_id": 1}
pub async fn handle_delist_character(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let character_id = get_u128(obj, "character_id")?;

    market_place::delist_character(
        &mut storage.listed_characters,
        msg_sender.clone(),
        character_id,
    )?;

    storage.record_tx(
        String::from("delist_character"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = listed_character_json(storage.listed_characters.to_vec());
    structure_notice(
        String::from("list_character"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "set_marketplace_fee", "fee_bps": 300}  (admin only)
pub async fn handle_set_marketplace_fee(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let fee_bps = get_u128(obj, "fee_bps")?;

    if msg_sender.to_lowercase() != storage.admin_address.to_lowercase() {
        return Err("Only the admin can change the marketplace fee".to_string());
    }
    if fee_bps > 2_000 {
        return Err("Marketplace fee cannot exceed 20% (2000 bps)".to_string());
    }
    storage.marketplace_fee_bps = fee_bps;

    storage.record_tx(
        String::from("set_marketplace_fee"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    structure_notice(
        String::from("set_marketplace_fee"),
        &mut storage.total_transactions,
        msg_sender,
        fee_bps.to_string(),
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "list_character", "character_id": 1, "price": 10.0}
pub async fn handle_listing_character(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let character_id = get_u128(obj, "character_id")?;
    let price = get_f64(obj, "price")?;

    market_place::list_character(
        &mut storage.all_characters,
        &mut storage.all_players,
        &mut storage.listed_characters,
        msg_sender.clone(),
        character_id,
        price,
    )?;

    storage.record_tx(
        String::from("list_character"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = listed_character_json(storage.listed_characters.to_vec());
    structure_notice(
        String::from("list_character"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "buy_character", "character_id": 10}
pub async fn handle_buy_character(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let character_id = get_u128(obj, "character_id")?;

    market_place::buy_character(
        &mut storage.all_players,
        &mut storage.all_characters,
        &mut storage.listed_characters,
        msg_sender.clone(),
        character_id,
        &mut storage.profit_from_p2p_sales,
        storage.marketplace_fee_bps,
    )?;

    storage.record_tx(
        String::from("buy_character"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = character_to_json(storage.all_characters.to_vec());
    structure_notice(
        String::from("buy_character"),
        &mut storage.total_transactions,
        msg_sender.clone(),
        json_data,
        &mut storage.server_addr,
    );
    // Buyer/seller balances changed.
    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("transfer_tokens"),
        &mut storage.total_transactions,
        msg_sender.clone(),
        json_data,
        &mut storage.server_addr,
    );
    // Listing was consumed.
    let json_data = listed_character_json(storage.listed_characters.to_vec());
    structure_notice(
        String::from("list_character"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "purchase_points", "amount": 10.0}
pub async fn handle_purchase_points(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let amount = get_f64(obj, "amount")?;

    market_place::purchase_points(
        &mut storage.all_players,
        msg_sender.clone(),
        amount,
        storage.points_rate,
        &mut storage.profit_from_points_purchase,
    )?;

    storage.record_tx(
        String::from("purchase_points"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("purchase_points"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "modify_list_price", "character_id": 1, "price": 10.0}
pub async fn handle_modify_list_price(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let character_id = get_u128(obj, "character_id")?;
    let price = get_f64(obj, "price")?;

    market_place::modify_list_price(
        &mut storage.listed_characters,
        msg_sender.clone(),
        character_id,
        price,
    )?;

    storage.record_tx(
        String::from("modify_list_price"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = listed_character_json(storage.listed_characters.to_vec());
    structure_notice(
        String::from("modify_list_price"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "change_points_rate", "new_point_rate": 5.0}
pub async fn handle_change_points_rate(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let new_point_rate = get_f64(obj, "new_point_rate")?;

    admin_functions::change_points_rate(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.points_rate,
        new_point_rate,
    )?;

    storage.record_tx(
        String::from("change_points_rate"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.points_rate.to_string();
    structure_notice(
        String::from("change_points_rate"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "modify_monika", "new_monika": "NonnyJoe"}
pub async fn handle_modify_monika(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let new_monika = get_str(obj, "new_monika")?;

    if new_monika.trim().is_empty() {
        return Err("Monika cannot be empty".to_string());
    }

    if !players_profile::modify_monika(&mut storage.all_players, msg_sender.clone(), new_monika) {
        return Err("Player not found, please register first".to_string());
    }

    storage.record_tx(
        String::from("modify_monika"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("modify_monika"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "modify_avatar", "new_avatar_uri": "NonnyJoe_image_uri"}
pub async fn handle_modify_avatar(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let new_avatar_uri = get_str(obj, "new_avatar_uri")?;

    if !players_profile::modify_avatar(
        &mut storage.all_players,
        msg_sender.clone(),
        new_avatar_uri,
    ) {
        return Err("Player not found, please register first".to_string());
    }

    storage.record_tx(
        String::from("modify_avatar"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("modify_avatar"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "withdraw_profit_from_stake", "amount": 10.0}
pub async fn handle_withdraw_profit_from_stake(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let amount = get_f64(obj, "amount")?;

    admin_functions::withdraw_profit_from_stake(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.profit_from_stake,
        amount,
    )?;

    storage.record_tx(
        String::from("withdraw_profit_from_stake"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.profit_from_stake.to_string();
    structure_notice(
        String::from("withdraw_profit_from_stake"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "withdraw_profit_from_p2p_sales", "amount": 10.0}
pub async fn handle_withdraw_profit_from_p2p_sales(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let amount = get_f64(obj, "amount")?;

    admin_functions::withdraw_profit_from_p2p_sales(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.profit_from_p2p_sales,
        amount,
    )?;

    storage.record_tx(
        String::from("withdraw_profit_from_p2p_sales"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.profit_from_p2p_sales.to_string();
    structure_notice(
        String::from("withdraw_profit_from_p2p_sales"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "withdraw_profit_from_points_purchase", "amount": 10.0}
pub async fn handle_withdraw_profit_from_points_purchase(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let amount = get_f64(obj, "amount")?;

    admin_functions::withdraw_profit_from_points_purchase(
        &mut storage.admin_address,
        msg_sender.clone(),
        &mut storage.profit_from_points_purchase,
        amount,
    )?;

    storage.record_tx(
        String::from("withdraw_profit_from_points_purchase"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let data = storage.profit_from_points_purchase.to_string();
    structure_notice(
        String::from("withdraw_profit_from_points_purchase"),
        &mut storage.total_transactions,
        msg_sender,
        data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "withdraw_character_as_nft", "character_id": 10}
pub async fn handle_withdraw_character_as_nft(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let character_id = get_u128(obj, "character_id")?;

    market_place::withdraw_character_as_nft(
        &mut storage.all_players,
        &mut storage.all_characters,
        msg_sender.clone(),
        character_id,
        &mut storage.all_offchain_characters,
    )?;

    storage.record_tx(
        String::from("withdraw_character_as_nft"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = vec_of_id_to_json(storage.all_offchain_characters.clone());
    structure_notice(
        String::from("withdraw_character_as_nft"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "withdraw", "amount": 10.0}
pub async fn handle_withdraw(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    println!("handling withdrawal function: {:?}", msg_sender);
    let obj = as_object(payload)?;
    let amount = get_f64(obj, "amount")?;

    market_place::withdraw(storage, msg_sender.clone(), amount).await?;

    storage.record_tx(
        String::from("withdraw"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    println!("Voucher for this withdrawal emitted......");
    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("withdraw"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

// {"func": "play_campaign_level", "level_id": 1, "char_id1": 21, "char_id2": 22, "char_id3": 23, "strategy_id": 2}
pub async fn handle_play_campaign_level(
    payload: &JsonValue,
    msg_sender: String,
    storage: &mut Storage,
    time_stamp: u128,
) -> Result<(), String> {
    let obj = as_object(payload)?;
    let level_id = get_u128(obj, "level_id")?;
    let char_ids = get_char_ids(obj)?;
    // Optional battle strategy; defaults to hunting the weakest enemy.
    let strategy = match obj.get("strategy_id").and_then(|v| v.as_u64()) {
        Some(id) => strategy_simulation::decode_strategy(id as u128)
            .ok_or_else(|| format!("Invalid strategy id: {}", id))?,
        None => AllStrategies::LowestHealthToMax,
    };

    let result = campaign::play_level(
        &mut storage.all_players,
        &mut storage.all_characters,
        msg_sender.clone(),
        level_id,
        char_ids,
        time_stamp,
        strategy,
    )?;

    storage.record_tx(
        String::from("play_campaign_level"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    // 1) Full battle report (replayed by the frontend battle page).
    structure_notice(
        String::from("campaign_battle"),
        &mut storage.total_transactions,
        msg_sender.clone(),
        result.report.dump(),
        &mut storage.server_addr,
    );

    // 2) Updated player snapshot (points / progress / titles changed).
    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("campaign_progress"),
        &mut storage.total_transactions,
        msg_sender.clone(),
        json_data,
        &mut storage.server_addr,
    );

    // 3) Updated characters snapshot (stat boosts on first clear).
    let json_data = character_to_json(storage.all_characters.to_vec());
    structure_notice(
        String::from("campaign_characters"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

pub async fn handle_deposit(
    payload: &str,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let (token, receiver, amount) = erc20_deposit_parse(payload)?;
    println!("token Address: {}", token);
    println!("Receiver Address: {}", receiver);
    println!("Amount: {}", amount);

    let deposit_amount: f64 = amount as f64;
    let deposit_token = format!("0x{}", token).to_lowercase();
    let token_receiver = format!("0x{}", receiver).to_lowercase();

    if deposit_token != storage.cartesi_token_address.to_lowercase() {
        return Err(format!(
            "Deposited token {} is not the accepted CTSI token",
            deposit_token
        ));
    }

    println!("PROCESSING DEPOSIT TRANSACTION!!!");
    market_place::deposit(&mut storage.all_players, token_receiver, deposit_amount)?;

    storage.record_tx(
        String::from("deposit"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("deposit"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

pub fn erc20_deposit_parse(payload: &str) -> Result<(&str, &str, u128), String> {
    // In Cartesi Rollups node v2, the ERC-20 portal only accepts successful
    // transfers and no longer prefixes the payload with a 1-byte success flag.
    // The payload is encoded as:
    //   token (20 bytes) | receiver (20 bytes) | amount (32 bytes)
    // all represented as hex (40 + 40 + 64 = 144 chars).
    if payload.len() < 144 {
        return Err("ERC-20 deposit payload length is incorrect".to_string());
    }

    if hex::decode(payload).is_err() {
        return Err("Failed to decode hex payload".to_string());
    }

    let token_address = &payload[0..40];
    let receiver_address = &payload[40..80];
    let amount_str = &payload[80..144];

    let amount = u128::from_str_radix(amount_str, 16)
        .map_err(|_| "Failed to parse deposit amount".to_string())?;

    Ok((token_address, receiver_address, amount))
}

pub async fn handle_deposit_character_as_nft(
    payload: &str,
    msg_sender: String,
    storage: &mut Storage,
) -> Result<(), String> {
    let (token, receiver, id) = erc721_deposit_parse(payload)?;
    println!("Token Address: {}", token);
    println!("Receiver Address: {}", receiver);
    println!("Token Id: {}", id);

    let deposit_token = format!("0x{}", token).to_lowercase();
    let token_receiver = format!("0x{}", receiver).to_lowercase();

    if deposit_token != storage.nebula_nft_address.to_lowercase() {
        return Err(format!(
            "Deposited NFT {} is not the Nebula NFT collection",
            deposit_token
        ));
    }

    println!("PROCESSING DEPOSIT TRANSACTION!!!");
    market_place::deposit_character_as_nft(
        &mut storage.all_players,
        &mut storage.all_characters,
        token_receiver,
        id,
        &mut storage.all_offchain_characters,
    )?;

    storage.record_tx(
        String::from("deposit_character_as_nft"),
        msg_sender.clone(),
        TransactionStatus::Success,
    );

    let json_data = players_profile_to_json(storage.all_players.to_vec());
    structure_notice(
        String::from("deposit"),
        &mut storage.total_transactions,
        msg_sender,
        json_data,
        &mut storage.server_addr,
    );
    Ok(())
}

pub fn erc721_deposit_parse(payload: &str) -> Result<(&str, &str, u128), String> {
    if payload.len() < 144 {
        return Err("ERC-721 deposit payload length is incorrect".to_string());
    }

    if hex::decode(payload).is_err() {
        return Err("Failed to decode hex payload".to_string());
    }

    let token_address = &payload[0..40];
    let receiver_address = &payload[40..80];
    let token_id = &payload[80..144];

    let id = u128::from_str_radix(token_id, 16)
        .map_err(|_| "Failed to parse token id".to_string())?;

    Ok((token_address, receiver_address, id))
}
