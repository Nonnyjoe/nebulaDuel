use crate::campaign::simulate_duel;
use crate::charms::build_loadout;
use crate::game_characters::{select_fighters, Character, SuperPower};
use crate::players_profile::{get_profile, Player};
use crate::strategy_simulation::AllStrategies;

/// Winning any duel (P2P or AI) now pays points — the core mode finally has
/// a progression loop instead of being reward-free.
pub const DUEL_WIN_REWARD_POINTS: u128 = 40;
pub const AI_ADDRESS: &str = "0xnebula";

#[derive(Debug, PartialEq, Clone)]
pub enum Difficulty {
    Easy,
    P2P,
    Hard,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Duel {
    pub duel_id: u128,
    pub is_active: bool,
    pub is_completed: bool,
    pub has_stake: bool,
    pub stake_amount: f64,
    pub difficulty: Difficulty,
    pub duel_creator: String,
    pub creator_warriors: Vec<u128>,
    pub creators_strategy: AllStrategies,
    pub duel_opponent: String,
    pub opponent_warriors: Vec<u128>,
    pub opponents_strategy: AllStrategies,
    /// Rich, campaign-format battle report (events + final squads) emitted by
    /// the unified engine. Empty until the duel is fought. Serialized to the
    /// frontend as `battle_events` so the 3D replay shows elements, powers and
    /// crits exactly like the campaign.
    pub battle_events: String,
    pub duel_winner: String,
    pub duel_loser: String,
    pub creation_time: u128,
}

pub fn create_duel(
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    total_duels: &mut u128,
    creators_address: String,
    creators_warriors: Vec<u128>,
    available_duels: &mut Vec<Duel>,
    has_stake: bool,
    stake_amount: f64,
    time_stamp: u128,
) -> Result<u128, String> {
    if creators_warriors.len() != 3 {
        return Err("Player must present exactly 3 characters for each battle".to_string());
    }
    if !has_stake && stake_amount > 0.0 {
        return Err("Stake amount must be 0 if stake is deactivated".to_string());
    }
    if has_stake && stake_amount <= 0.0 {
        return Err("Stake amount must be positive when staking is enabled".to_string());
    }

    let creators_warriors = select_fighters(
        all_characters,
        all_players,
        creators_address.clone(),
        creators_warriors[0],
        creators_warriors[1],
        creators_warriors[2],
    )?;

    // Stake must be enforced BEFORE the duel is registered, so a failed stake
    // doesn't leave a phantom duel behind.
    if has_stake {
        enforce_stake(all_players, creators_address.clone(), stake_amount)?;
    }

    *total_duels += 1;
    let new_duel = Duel {
        duel_id: *total_duels,
        is_active: false,
        is_completed: false,
        has_stake,
        stake_amount,
        difficulty: Difficulty::P2P,
        duel_creator: creators_address.clone(),
        creator_warriors: creators_warriors.clone(),
        creators_strategy: AllStrategies::YetToSelect,
        duel_opponent: String::new(),
        opponent_warriors: Vec::new(),
        opponents_strategy: AllStrategies::YetToSelect,
        battle_events: String::new(),
        duel_winner: String::new(),
        duel_loser: String::new(),
        creation_time: time_stamp,
    };

    available_duels.push(new_duel.clone());
    all_duels.push(new_duel);
    Ok(*total_duels)
}

fn enforce_stake(
    all_players: &mut Vec<Player>,
    user_address: String,
    stake_amount: f64,
) -> Result<(), String> {
    let player = all_players
        .iter_mut()
        .find(|p| p.wallet_address.to_lowercase() == user_address.to_lowercase())
        .ok_or("Player not found, please register")?;

    if player.cartesi_token_balance < stake_amount {
        return Err("You do not have enough balance to stake".to_string());
    }
    player.cartesi_token_balance -= stake_amount;
    Ok(())
}

pub fn join_duel(
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    duel_id: u128,
    opponent_address: String,
    opponent_warriors: Vec<u128>,
) -> Result<Vec<Vec<u128>>, String> {
    // Validate everything that doesn't need the duel borrow first.
    if opponent_warriors.len() != 3 {
        return Err("Player must present exactly 3 characters for each battle".to_string());
    }

    {
        let duel = find_duel(all_duels, duel_id)
            .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
        if duel.is_active {
            return Err("Duel already active".to_string());
        }
        if duel.is_completed {
            return Err("Duel already completed".to_string());
        }
        if duel.duel_creator.to_lowercase() == opponent_address.to_lowercase() {
            return Err("You cannot join your own duel".to_string());
        }
    }

    let opponent_warriors = select_fighters(
        all_characters,
        all_players,
        opponent_address.clone(),
        opponent_warriors[0],
        opponent_warriors[1],
        opponent_warriors[2],
    )?;

    // Re-borrow to apply mutations after stake enforcement.
    let (has_stake, stake_amount) = {
        let duel = find_duel(all_duels, duel_id)
            .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
        (duel.has_stake, duel.stake_amount)
    };

    if has_stake {
        enforce_stake(all_players, opponent_address.clone(), stake_amount)?;
    }

    let duel = find_duel(all_duels, duel_id)
        .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
    duel.duel_opponent = opponent_address.clone();
    duel.opponent_warriors = opponent_warriors;
    duel.opponents_strategy = AllStrategies::YetToSelect;
    duel.is_active = true;

    reveal_both_warriors(all_duels, duel_id)
        .ok_or_else(|| format!("Duel with id {} not found", duel_id))
}

/// Returns Ok(true) when both sides have selected and the fight can start.
pub fn set_strategy(
    all_duels: &mut Vec<Duel>,
    duel_id: u128,
    wallet_address: String,
    strategy: AllStrategies,
) -> Result<bool, String> {
    let duel = find_duel(all_duels, duel_id)
        .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;

    if !duel.is_active {
        return Err("Duel not active".to_string());
    }
    if duel.is_completed {
        return Err("Duel already completed".to_string());
    }
    if duel.duel_opponent.is_empty() {
        return Err("You can only set strategies when you have an opponent".to_string());
    }

    let caller = wallet_address.to_lowercase();
    if duel.duel_creator.to_lowercase() == caller {
        duel.creators_strategy = strategy;
        Ok(duel.opponents_strategy != AllStrategies::YetToSelect)
    } else if duel.duel_opponent.to_lowercase() == caller {
        duel.opponents_strategy = strategy;
        Ok(duel.creators_strategy != AllStrategies::YetToSelect)
    } else {
        Err("You are not the creator or opponent of this duel".to_string())
    }
}

/// Resolve a duel using the UNIFIED combat engine (the same one the campaign
/// uses): elements, super-powers, energy, crits and charms all apply, so a
/// warrior fights identically in P2P, AI and campaign battles. The arena is
/// neutral (no biome bias) to keep staked duels environmentally fair. The
/// result is stored as a rich `battle_events` report the frontend replays in
/// full 3D, then win/loss/stake settlement runs.
pub fn fight(
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    duel_id: u128,
    all_players: &mut Vec<Player>,
    available_duels: &mut Vec<Duel>,
    profit_from_stake: &mut f64,
) -> Result<Duel, String> {
    // Phase 1: read-only validation + snapshot the inputs we need.
    let (creator_strategy, opponent_strategy, creator_ids, opponent_ids, seed) = {
        let duel = find_duel(all_duels, duel_id)
            .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
        if duel.is_completed {
            return Ok(duel.clone());
        }
        if !duel.is_active {
            return Err("Duel not active".to_string());
        }
        if duel.creators_strategy == AllStrategies::YetToSelect
            || duel.opponents_strategy == AllStrategies::YetToSelect
        {
            return Err("Both players must select a strategy before fighting".to_string());
        }
        (
            duel.creators_strategy.clone(),
            duel.opponents_strategy.clone(),
            duel.creator_warriors.clone(),
            duel.opponent_warriors.clone(),
            // Deterministic, replay-safe seed from on-chain duel data.
            duel.creation_time
                .wrapping_add(duel_id.wrapping_mul(7919))
                .wrapping_add(1),
        )
    };

    // Phase 2: run the simulation (no duel borrow held).
    let creator_squad = squad_spec(all_characters, &creator_ids)?;
    let opponent_squad = squad_spec(all_characters, &opponent_ids)?;
    // Duels carry no charms yet, so both sides use an empty loadout.
    let empty = build_loadout(&[])?;
    let battle = simulate_duel(
        creator_squad,
        opponent_squad,
        creator_strategy,
        opponent_strategy,
        seed,
        &empty,
        &empty,
    );

    // Phase 3: record the outcome.
    let duel = find_duel(all_duels, duel_id)
        .ok_or_else(|| format!("Duel with id {} not found", duel_id))?;
    if battle.winner_side == 0 {
        duel.duel_winner = duel.duel_creator.clone();
        duel.duel_loser = duel.duel_opponent.clone();
    } else {
        duel.duel_winner = duel.duel_opponent.clone();
        duel.duel_loser = duel.duel_creator.clone();
    }
    duel.battle_events = battle.report.dump();
    duel.is_completed = true;
    let completed_duel = duel.clone();

    register_battle_details(
        all_players,
        all_characters,
        completed_duel.duel_winner.clone(),
        completed_duel.duel_loser.clone(),
        completed_duel.clone(),
        profit_from_stake,
    );

    // Remove from the available duels list.
    available_duels.retain(|d| d.duel_id != duel_id);

    Ok(completed_duel)
}

/// Build a `(id, name, power, health, strength, attack, speed)` spec tuple for
/// each of the three character ids, for the unified engine to consume.
fn squad_spec(
    all_characters: &[Character],
    ids: &[u128],
) -> Result<Vec<(u128, String, SuperPower, u128, u128, u128, u128)>, String> {
    if ids.len() != 3 {
        return Err("Each side must have exactly 3 characters".to_string());
    }
    let mut out = Vec::new();
    for id in ids {
        let c = all_characters
            .iter()
            .find(|c| c.id == *id)
            .ok_or_else(|| format!("Character with id {} not found", id))?;
        out.push((
            c.id,
            c.name.clone(),
            c.super_power.clone(),
            c.health,
            c.strength,
            c.attack,
            c.speed,
        ));
    }
    Ok(out)
}

fn register_battle_details(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    duel_winner: String,
    duel_looser: String,
    duel: Duel,
    profit_from_stake: &mut f64,
) {
    println!(
        "=== RESULTS ARE IN!! WINNER: {}, LOSER: {} ===",
        duel_winner, duel_looser
    );

    let is_ai_duel = duel.duel_creator == AI_ADDRESS || duel.duel_opponent == AI_ADDRESS;
    let winner_fighters = if duel.duel_creator.to_lowercase() == duel_winner.to_lowercase() {
        duel.creator_warriors.clone()
    } else {
        duel.opponent_warriors.clone()
    };
    let loser_fighters = if duel.duel_creator.to_lowercase() == duel_looser.to_lowercase() {
        duel.creator_warriors.clone()
    } else {
        duel.opponent_warriors.clone()
    };

    if let Some(winner) = get_profile(all_players, duel_winner.clone()) {
        winner.register_win(all_characters, &winner_fighters);
        if winner.wallet_address != AI_ADDRESS {
            // Core-loop reward: winning duels earns points.
            winner.points += DUEL_WIN_REWARD_POINTS;
            if is_ai_duel {
                winner.total_ai_battles += 1;
                winner.ai_battles_won += 1;
            }
        }
    } else {
        println!("winner profile not found");
    }

    if let Some(looser) = get_profile(all_players, duel_looser) {
        looser.register_loss(all_characters, &loser_fighters);
        if looser.wallet_address != AI_ADDRESS && is_ai_duel {
            looser.total_ai_battles += 1;
            looser.ai_battles_losses += 1;
        }
    } else {
        println!("loser profile not found");
    }

    if duel.has_stake {
        println!("=== RELEASING STAKE TO WINNER ===");
        if let Some(winner) = get_profile(all_players, duel_winner) {
            winner.increase_cartesi_token_balance((duel.stake_amount * 2.0) * 0.90);
            *profit_from_stake += (duel.stake_amount * 2.0) * 0.10;
        } else {
            println!("Could not release stake: winner profile missing");
        }
    }
}

pub fn reveal_both_warriors(all_duels: &mut Vec<Duel>, duel_id: u128) -> Option<Vec<Vec<u128>>> {
    let duel = find_duel(all_duels, duel_id)?;
    Some(vec![
        duel.creator_warriors.clone(),
        duel.opponent_warriors.clone(),
    ])
}

pub fn get_duel(all_duels: &mut Vec<Duel>, duel_id: u128) -> Option<&mut Duel> {
    find_duel(all_duels, duel_id)
}

fn find_duel(all_duels: &mut Vec<Duel>, duel_id: u128) -> Option<&mut Duel> {
    all_duels.iter_mut().find(|d| d.duel_id == duel_id)
}
