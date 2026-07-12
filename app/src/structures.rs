use crate::battle_challenge::{Difficulty, Duel};
use crate::game_characters::{Character, SuperPower};
use crate::market_place::SaleDetails;
use crate::players_profile::{Player, UserTransaction};
use crate::strategy_simulation::AllStrategies;
use json::JsonValue;
use std::io::{Read, Write};
use std::net::TcpStream;
use std::error::Error;
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

/// POST a rollup output (notice/report/voucher) to the rollup HTTP server.
/// Shared transport used by all emitters. Never panics: transport errors are
/// returned to the caller, who decides whether they are fatal.
fn post_rollup_output(
    endpoint: &str,
    body_json: &str,
    rollup_server: &str,
) -> Result<String, Box<dyn Error>> {
    let full_url = format!("{}/{}", rollup_server.trim_end_matches('/'), endpoint);

    let url = url::Url::parse(&full_url)?;
    let host = url.host_str().ok_or("Invalid URL")?;
    let port = url.port_or_known_default().ok_or("Invalid port")?;
    let path = url.path();

    let mut stream = TcpStream::connect((host, port))?;

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
        body_json.len(),
        body_json
    );

    stream.write_all(request.as_bytes())?;

    let mut response = String::new();
    stream.read_to_string(&mut response)?;

    Ok(response)
}

/// Emit a notice (verifiable, consensus-relevant output).
/// Payload must be "0x"-prefixed hex per the rollup HTTP API.
pub fn emit_notice(data: &str, rollup_server: &str) -> Result<String, Box<dyn Error>> {
    let hexresult = "0x".to_string() + &hex::encode(data);
    let payload = format!(r#"{{"payload":"{}"}}"#, hexresult);
    post_rollup_output("notice", &payload, rollup_server)
}

/// Emit a report (diagnostic / inspect response output).
/// Payload must be "0x"-prefixed hex per the rollup HTTP API.
pub fn emit_report(data: &str, rollup_server: &str) -> Result<String, Box<dyn Error>> {
    let hexresult = "0x".to_string() + &hex::encode(data);
    let payload = format!(r#"{{"payload":"{}"}}"#, hexresult);
    post_rollup_output("report", &payload, rollup_server)
}

/// Emit a structured error report so the frontend always receives a response
/// it can parse, even on rejected/invalid inputs.
pub fn emit_error_report(method: &str, error: &str, rollup_server: &str) {
    let mut output_json = JsonValue::new_object();
    output_json["error"] = error.into();
    output_json["method"] = method.into();
    output_json["status"] = "rejected".into();
    if let Err(e) = emit_report(&output_json.dump(), rollup_server) {
        println!("Failed to emit error report: {}", e);
    }
}

/// Emit a voucher in the Cartesi Rollups v2 format. v2 vouchers carry a
/// `value` field (Wei to forward with the call) in addition to destination
/// and payload.
pub fn emit_voucher(
    destination: &str,
    payload_hex: &str,
    value_wei_hex: &str,
    rollup_server: &str,
) -> Result<String, Box<dyn Error>> {
    let body = format!(
        r#"{{"destination":"{}","payload":"{}","value":"{}"}}"#,
        destination, payload_hex, value_wei_hex
    );
    post_rollup_output("voucher", &body, rollup_server)
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

#[derive(Debug, PartialEq, Clone)]
pub struct UserOutput {
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
    Failed,
}

#[derive(Debug, PartialEq, Clone)]
pub struct TransactionData {
    pub tx_id: u128,
    pub method: String,
    pub caller: String,
    pub status: TransactionStatus,
}


/// Anti-front-running: a committed strategy is only revealed once BOTH sides
/// have committed (or the duel is complete). Before that, an opponent could
/// read it via inspect/notices and join staked duels they're guaranteed to
/// win. "Hidden" still tells the UI a choice was made.
fn strategy_for_serialization(duel: &Duel, mine: &AllStrategies, theirs: &AllStrategies) -> String {
    let both_committed = *mine != AllStrategies::YetToSelect && *theirs != AllStrategies::YetToSelect;
    if duel.is_completed || both_committed {
        decode_strategy_json(mine.clone())
    } else if *mine == AllStrategies::YetToSelect {
        String::from("Yet_to_select")
    } else {
        String::from("Hidden")
    }
}

pub fn duels_to_json(all_duels: Vec<Duel>) -> String {
    let mut json_array = JsonValue::new_array();

    for duel in all_duels {
        let mut tx_json = JsonValue::new_object();
        let cs = strategy_for_serialization(&duel, &duel.creators_strategy, &duel.opponents_strategy);
        let os = strategy_for_serialization(&duel, &duel.opponents_strategy, &duel.creators_strategy);

        tx_json["duel_id"] = (duel.duel_id as u64).into();
        tx_json["is_active"] = (duel.is_active).into();
        tx_json["is_completed"] = duel.is_completed.into();
        tx_json["has_stake"] = duel.has_stake.into();
        tx_json["stake_amount"] = (duel.stake_amount as u64).into();
        tx_json["difficulty"] = match duel.difficulty {
            Difficulty::Easy => String::from("Easy").into(),
            Difficulty::P2P => String::from("P2P").into(),
            Difficulty::Hard => String::from("Hard").into(),
        };
        tx_json["duel_creator"] = duel.duel_creator.into();
        tx_json["creator_warriors"] = vec_of_id_to_json(duel.creator_warriors).into();
        tx_json["creators_strategy"] = cs.into();
        tx_json["duel_opponent"] = duel.duel_opponent.into();
        tx_json["opponent_warriors"] = vec_of_id_to_json(duel.opponent_warriors).into();
        tx_json["opponents_strategy"] = os.into();
        tx_json["creator_committed"] = (!duel.creators_commit.is_empty()).into();
        tx_json["opponent_committed"] = (!duel.opponents_commit.is_empty()).into();
        tx_json["battle_events"] = battle_events_json(&duel.battle_events);
        tx_json["duel_winner"] = duel.duel_winner.into();
        tx_json["duel_loser"] = duel.duel_loser.into();
        tx_json["creation_time"] = (duel.creation_time as u64).into();

        json_array.push(tx_json).ok();
    }

    json_array.dump()
}

/// Parse the stored rich battle report into a JSON value (or null when the
/// duel has not been fought yet).
fn battle_events_json(raw: &str) -> JsonValue {
    if raw.is_empty() {
        JsonValue::Null
    } else {
        json::parse(raw).unwrap_or(JsonValue::Null)
    }
}

pub fn single_duel_to_json(duel: Duel) -> String {
    let mut tx_json = JsonValue::new_object();
    let cs = strategy_for_serialization(&duel, &duel.creators_strategy, &duel.opponents_strategy);
    let os = strategy_for_serialization(&duel, &duel.opponents_strategy, &duel.creators_strategy);

    tx_json["duel_id"] = (duel.duel_id as u64).into();
    tx_json["is_active"] = (duel.is_active).into();
    tx_json["is_completed"] = duel.is_completed.into();
    tx_json["has_stake"] = duel.has_stake.into();
    tx_json["stake_amount"] = (duel.stake_amount as u64).into();
    tx_json["difficulty"] = match duel.difficulty {
        Difficulty::Easy => String::from("Easy").into(),
        Difficulty::P2P => String::from("P2P").into(),
        Difficulty::Hard => String::from("Hard").into(),
    };
    tx_json["duel_creator"] = duel.duel_creator.into();
    tx_json["creator_warriors"] = vec_of_id_to_json(duel.creator_warriors).into();
    tx_json["creators_strategy"] = cs.into();
    tx_json["duel_opponent"] = duel.duel_opponent.into();
    tx_json["opponent_warriors"] = vec_of_id_to_json(duel.opponent_warriors).into();
    tx_json["opponents_strategy"] = os.into();
    tx_json["creator_committed"] = (!duel.creators_commit.is_empty()).into();
    tx_json["opponent_committed"] = (!duel.opponents_commit.is_empty()).into();
    tx_json["battle_events"] = battle_events_json(&duel.battle_events);
    tx_json["duel_winner"] = duel.duel_winner.into();
    tx_json["duel_loser"] = duel.duel_loser.into();
    tx_json["creation_time"] = (duel.creation_time as u64).into();

    return tx_json.to_string();
}

pub fn decode_strategy_json(strategy: AllStrategies) -> String {
    match strategy {
        AllStrategies::LowestHealthToMax => String::from("Lowest_to_highest_health"),
        AllStrategies::LowestStrengthToMax => String::from("Lowest_to_highest_strength"),
        AllStrategies::MaxHealthToLowest => String::from("Highest_to_lowest_health"),
        AllStrategies::MaxStrengthToLowest => String::from("Highest_to_lowest_strength"),
        AllStrategies::MaxAttackToLowest => String::from("Highest_to_lowest_attack"),
        AllStrategies::LowestSpeedToMax => String::from("Lowest_to_highest_speed"),
        AllStrategies::YetToSelect => String::from("Yet_to_select"),
    }
}

pub fn listed_character_json(listed_characters: Vec<SaleDetails>) -> String {
    let mut json_array = JsonValue::new_array();

    for character in listed_characters {
        let mut tx_json = JsonValue::new_object();

        tx_json["character_id"] = (character.character_id as u64).into();
        tx_json["price"] = (character.price as u64).into();
        tx_json["seller"] = (character.seller).into();
        json_array.push(tx_json).ok();
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
        tx_json["super_power"] = decode_super_power_json(character.super_power).into() ;
        tx_json["id"] = (character.id as u64).into();
        tx_json["total_battles"] = (character.total_battles as u64).into();
        tx_json["total_wins"] = (character.total_wins as u64).into();
        tx_json["total_losses"] = (character.total_losses as u64).into();
        tx_json["price"] = (character.price as u64).into();
        tx_json["owner"] = (character.owner).into();
        tx_json["rarity"] = (character.rarity).into();
        tx_json["level"] = (character.level as u64).into();
        tx_json["xp"] = (character.xp as u64).into();
        tx_json["xp_to_next"] = (crate::game_characters::xp_to_next_level(character.level) as u64).into();
        json_array.push(tx_json).ok();
    }

    json_array.dump()
}

pub fn single_character_to_json(character: Character) -> String {
    let mut tx_json = JsonValue::new_object();

    tx_json["name"] = (character.name).into();
    tx_json["health"] = (character.health as u64).into();
    tx_json["strength"] = (character.strength as u64).into();
    tx_json["attack"] = (character.attack as u64).into();
    tx_json["speed"] = (character.speed as u64).into();
    tx_json["super_power"] = decode_super_power_json(character.super_power).into() ;
    tx_json["id"] = (character.id as u64).into();
    tx_json["total_battles"] = (character.total_battles as u64).into();
    tx_json["total_wins"] = (character.total_wins as u64).into();
    tx_json["total_losses"] = (character.total_losses as u64).into();
    tx_json["price"] = (character.price as u64).into();
    tx_json["owner"] = (character.owner).into();
    tx_json["rarity"] = (character.rarity).into();
    tx_json["level"] = (character.level as u64).into();
    tx_json["xp"] = (character.xp as u64).into();
    tx_json["xp_to_next"] = (crate::game_characters::xp_to_next_level(character.level) as u64).into();

    return tx_json.to_string();
}

fn decode_super_power_json(super_power: SuperPower) -> String {
    match super_power {
        SuperPower::Adaptability => String::from("Adaptability"),
        SuperPower::ShadowBall => String::from("ShadowBall"),
        SuperPower::Psychic => String::from("Psychic"),
        SuperPower::SleepSong => String::from("SleepSong"),
        SuperPower::WaterGun => String::from("WaterGun"),
        SuperPower::VineWhip => String::from("VineWhip"),
        SuperPower::Flamethrower => String::from("Flamethrower"),
        SuperPower::Thunderbolt => String::from("Thunderbolt"),
        SuperPower::HeadCrush => String::from("HeadCrush"),
        SuperPower::SonicKick => String::from("SonicKick"),
        SuperPower::TelekineticHit => String::from("TelekineticHit"),
        SuperPower::InvisibleClaws => String::from("InvisibleClaws"),
        SuperPower::DodgeNdTailLash => String::from("DodgeNdTailLash"),
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
        tx_json["cartesi_token_balance"] = (player.cartesi_token_balance as u64).into();
        tx_json["total_battles"] = (player.total_battles as u64).into();
        tx_json["total_wins"] = (player.total_wins as u64).into();
        tx_json["total_losses"] = (player.total_losses as u64).into();
        tx_json["total_ai_battles"] = (player.total_ai_battles as u64).into();
        tx_json["ai_battles_won"] = (player.ai_battles_won as u64).into();
        tx_json["ai_battles_losses"] = (player.ai_battles_losses as u64).into();
        tx_json["campaign_progress"] = (player.campaign_progress as u64).into();
        tx_json["campaign_wins"] = (player.campaign_wins as u64).into();
        tx_json["campaign_losses"] = (player.campaign_losses as u64).into();
        tx_json["campaign_titles"] = campaign_titles_to_json(&player.campaign_titles);
        tx_json["daily_streak"] = (player.daily_streak as u64).into();
        tx_json["last_daily_claim_day"] = (player.last_daily_claim_day as u64).into();
        tx_json["transaction_history"] =
            player_transactions_to_json(player.transaction_history).into() ;
        json_array.push(tx_json).ok();
    }

    json_array.dump()
}

pub fn vec_of_id_to_json(all_ids: Vec<u128>) -> String {
    let mut json_array: JsonValue = JsonValue::new_array();

    for id in all_ids {
        let mut tx_json = JsonValue::new_object();
        tx_json["char_id"] = (id as u64).into();
        json_array.push(tx_json).ok();
    }

    json_array.dump()
}

pub fn player_transactions_to_json(transactions: Vec<UserTransaction>) -> String {
    let mut json_array: JsonValue = JsonValue::new_array();

    for transaction in transactions {
        let mut tx_json = JsonValue::new_object();
        tx_json["transaction_id"] = (transaction.transaction_id as u64).into();
        tx_json["method_called"] = (transaction.method_called).into();

        json_array.push(tx_json).ok();
    }

    json_array.dump()
}

pub fn single_player_profile_to_json(player: &mut Player) -> String {
    let mut tx_json = JsonValue::new_object();

    tx_json["monika"] = player.monika.clone().into();
    tx_json["wallet_address"] = player.wallet_address.clone().into();
    tx_json["avatar_url"] = player.avatar_url.clone().into();
    tx_json["characters"] = vec_of_id_to_json(player.characters.clone()).into();
    tx_json["id"] = (player.id as u64).into();
    tx_json["points"] = (player.points as u64).into();
    tx_json["nebula_token_balance"] = (player.nebula_token_balance as u64).into();
    tx_json["cartesi_token_balance"] = (player.cartesi_token_balance as u64).into();
    tx_json["total_battles"] = (player.total_battles as u64).into();
    tx_json["total_wins"] = (player.total_wins as u64).into();
    tx_json["total_losses"] = (player.total_losses as u64).into();
    tx_json["total_ai_battles"] = (player.total_ai_battles as u64).into();
    tx_json["ai_battles_won"] = (player.ai_battles_won as u64).into();
    tx_json["ai_battles_losses"] = (player.ai_battles_losses as u64).into();
    tx_json["campaign_progress"] = (player.campaign_progress as u64).into();
    tx_json["campaign_wins"] = (player.campaign_wins as u64).into();
    tx_json["campaign_losses"] = (player.campaign_losses as u64).into();
    tx_json["campaign_titles"] = campaign_titles_to_json(&player.campaign_titles);
    tx_json["daily_streak"] = (player.daily_streak as u64).into();
    tx_json["last_daily_claim_day"] = (player.last_daily_claim_day as u64).into();
    tx_json["transaction_history"] =
        player_transactions_to_json(player.transaction_history.clone()).into() ;

    return tx_json.to_string();
}

/// Simple deterministic battle rating from win/loss record. Floors at 100 so
/// the number never goes negative or wraps.
pub fn pvp_rating(wins: u128, losses: u128) -> u128 {
    let base = 1000u128;
    let up = wins.saturating_mul(20);
    let down = losses.saturating_mul(10);
    base.saturating_add(up).saturating_sub(down).max(100)
}

/// Global PvP/AI duel leaderboard: every player with at least one battle,
/// ranked by rating (wins up, losses down), then win count, then fewer losses.
/// The AI account is excluded. Top 50.
pub fn pvp_leaderboard_to_json(all_players: &[Player]) -> String {
    let mut ranked: Vec<&Player> = all_players
        .iter()
        .filter(|p| p.total_battles > 0 && p.wallet_address.to_lowercase() != "0xnebula")
        .collect();
    ranked.sort_by(|a, b| {
        pvp_rating(b.total_wins, b.total_losses)
            .cmp(&pvp_rating(a.total_wins, a.total_losses))
            .then(b.total_wins.cmp(&a.total_wins))
            .then(a.total_losses.cmp(&b.total_losses))
    });

    let mut arr = JsonValue::new_array();
    for (rank, p) in ranked.iter().take(50).enumerate() {
        let mut j = JsonValue::new_object();
        j["rank"] = ((rank + 1) as u64).into();
        j["monika"] = p.monika.clone().into();
        j["wallet_address"] = p.wallet_address.clone().into();
        j["rating"] = (pvp_rating(p.total_wins, p.total_losses) as u64).into();
        j["total_wins"] = (p.total_wins as u64).into();
        j["total_losses"] = (p.total_losses as u64).into();
        j["total_battles"] = (p.total_battles as u64).into();
        let win_rate = if p.total_battles > 0 {
            (p.total_wins * 100 / p.total_battles) as u64
        } else {
            0
        };
        j["win_rate"] = win_rate.into();
        j["avatar_url"] = p.avatar_url.clone().into();
        let _ = arr.push(j);
    }
    arr.dump()
}

fn campaign_titles_to_json(titles: &[String]) -> JsonValue {
    let mut arr = JsonValue::new_array();
    for t in titles {
        let _ = arr.push(JsonValue::from(t.clone()));
    }
    arr
}

// pub fn listed_characters_to_json(listed_characters: Vec<SaleDetails>) -> String {
//     let mut json_array = JsonValue::new_array();

//     for character in listed_characters {
//         let mut tx_json = JsonValue::new_object();

//         tx_json["id"] = (character.character_id as u64).into();
//         tx_json["price"] = (character.price as u64).into();
//         tx_json["seller"] = (character.seller).into();
//         json_array.push(tx_json);
//     }
//     json_array.dump()
// }

// const result = JSON.stringify({"method": "all_Players", "txId": totalTransactions, "target": data.metadata.msg_sender, "data": allPlayers });

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pvp_rating_rewards_wins_and_floors() {
        assert_eq!(pvp_rating(0, 0), 1000);
        assert_eq!(pvp_rating(5, 2), 1000 + 100 - 20);
        // Never underflows below the floor, even with a terrible record.
        assert_eq!(pvp_rating(0, 100_000), 100);
    }
}
