use crate::game_characters::{select_fighters, Character, MinimalCharacter};
use crate::players_profile::{get_profile, Player};
use crate::strategy_simulation::{decicde_victim, AllStrategies};

/// Hard cap on battle rounds so a single input can never loop forever
/// (bounded computation requirement for Cartesi machine execution).
const MAX_BATTLE_ROUNDS: u32 = 500;

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
    pub battle_log: Vec<Vec<MinimalCharacter>>,
    pub duel_winner: String,
    pub duel_loser: String,
    pub creation_time: u128,
}

struct TurnsTracker {
    turn_number: usize,
}

impl TurnsTracker {
    fn new() -> TurnsTracker {
        TurnsTracker { turn_number: 0 }
    }

    /// Advance to the next turn, wrapping around team size.
    fn advance(&mut self, team_size: usize) {
        if team_size == 0 {
            self.turn_number = 0;
        } else {
            self.turn_number = (self.turn_number + 1) % team_size;
        }
    }

    /// Index of the warrior whose turn it is, always within bounds.
    fn current(&self, team_size: usize) -> usize {
        if team_size == 0 {
            0
        } else {
            self.turn_number % team_size
        }
    }
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
        battle_log: Vec::new(),
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

pub fn fight(
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    duel_id: u128,
    all_players: &mut Vec<Player>,
    available_duels: &mut Vec<Duel>,
    profit_from_stake: &mut f64,
) -> Result<Duel, String> {
    let mut creator_turn_tracker = TurnsTracker::new();
    let mut opponent_turn_tracker = TurnsTracker::new();

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

    let creators_strategy = duel.creators_strategy.clone();
    let opponents_strategy = duel.opponents_strategy.clone();
    let mut creators_warriors = get_warriors_clone(all_characters, &duel.creator_warriors)?;
    let mut opponent_warriors = get_warriors_clone(all_characters, &duel.opponent_warriors)?;

    let mut rounds: u32 = 0;
    while !creators_warriors.is_empty() && !opponent_warriors.is_empty() {
        rounds += 1;
        if rounds > MAX_BATTLE_ROUNDS {
            // Deterministic tie-break: side with most total health remaining wins.
            let creator_health: u128 = creators_warriors.iter().map(|c| c.health).sum();
            let opponent_health: u128 = opponent_warriors.iter().map(|c| c.health).sum();
            if creator_health >= opponent_health {
                opponent_warriors.clear();
            } else {
                creators_warriors.clear();
            }
            break;
        }

        // --- Creator attacks first ---
        {
            let attacker_index = creator_turn_tracker.current(creators_warriors.len());
            // Clone attacker stats so we can mutate both sides without aliasing.
            let mut attacker = creators_warriors[attacker_index].clone();
            let victim = decicde_victim(&creators_strategy, &mut opponent_warriors)
                .ok_or("Invalid strategy while deciding victim")?;
            single_duel(&mut attacker, victim);
            duel.battle_log.push(new_vec(&attacker, victim));
            let victim_dead = victim.is_dead();
            let victim_id = victim.id;
            creators_warriors[attacker_index] = attacker;

            if victim_dead {
                opponent_warriors.retain(|c| c.id != victim_id);
            }
        }

        if opponent_warriors.is_empty() {
            break;
        }

        // --- Opponent attacks second ---
        {
            let attacker_index = opponent_turn_tracker.current(opponent_warriors.len());
            let mut attacker = opponent_warriors[attacker_index].clone();
            let victim = decicde_victim(&opponents_strategy, &mut creators_warriors)
                .ok_or("Invalid strategy while deciding victim")?;
            single_duel(&mut attacker, victim);
            duel.battle_log.push(new_vec(&attacker, victim));
            let victim_dead = victim.is_dead();
            let victim_id = victim.id;
            opponent_warriors[attacker_index] = attacker;

            if victim_dead {
                creators_warriors.retain(|c| c.id != victim_id);
            }
        }

        creator_turn_tracker.advance(creators_warriors.len());
        opponent_turn_tracker.advance(opponent_warriors.len());
    }

    if creators_warriors.is_empty() {
        duel.duel_winner = duel.duel_opponent.clone();
        duel.duel_loser = duel.duel_creator.clone();
    } else {
        duel.duel_winner = duel.duel_creator.clone();
        duel.duel_loser = duel.duel_opponent.clone();
    }
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

    if let Some(winner) = get_profile(all_players, duel_winner.clone()) {
        winner.register_win(all_characters);
    } else {
        println!("winner profile not found");
    }

    if let Some(looser) = get_profile(all_players, duel_looser) {
        looser.register_loss(all_characters);
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

fn new_vec(attacker: &Character, opponent: &Character) -> Vec<MinimalCharacter> {
    vec![
        attacker.character_to_minimal_character(),
        opponent.character_to_minimal_character(),
    ]
}

/// One attack round. All arithmetic is saturating so malformed/extreme stats
/// can never underflow u128 and halt the machine. Damage has a floor of 1 so
/// battles always converge.
fn single_duel(attacker: &mut Character, opponent: &mut Character) {
    println!(
        "new battle round: {} attacks {}",
        attacker.id, opponent.id
    );
    let raw_damage = attacker
        .strength
        .saturating_add(attacker.attack / 2)
        .saturating_sub(opponent.speed / 4);
    let damage = raw_damage.max(1);

    opponent.health = opponent.health.saturating_sub(damage);
    opponent.speed = opponent.speed.saturating_sub(1);

    // Attacker fatigue: stats decay slightly but never below a floor of 5.
    let decayed_attack = attacker.attack.saturating_sub(damage / 5);
    if decayed_attack >= 5 {
        attacker.attack = decayed_attack;
    }
    let decayed_strength = attacker.strength.saturating_sub(damage / 7);
    if decayed_strength >= 5 {
        attacker.strength = decayed_strength;
    }

    println!(
        "round complete, attacker_id: {}, attacker_strength: {}, opponent_id: {}, opponent_health: {}",
        attacker.id, attacker.strength, opponent.id, opponent.health
    );
}

fn get_warriors_clone(
    all_characters: &mut Vec<Character>,
    selected_characters: &Vec<u128>,
) -> Result<Vec<Character>, String> {
    if selected_characters.len() != 3 {
        return Err("Each side must have exactly 3 characters".to_string());
    }
    let mut warriors: Vec<Character> = Vec::new();
    for character_id in selected_characters {
        let character = all_characters
            .iter()
            .find(|c| c.id == *character_id)
            .ok_or_else(|| format!("Character with id {} not found", character_id))?;
        warriors.push(character.clone());
    }
    Ok(warriors)
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
