use crate::battle_challenge::{fight, set_strategy, Difficulty, Duel};
use crate::game_characters::{mint_character_unchecked, select_fighters, Character};
use crate::players_profile::{create_player, Player};
use crate::strategy_simulation::AllStrategies;

pub const AI_ADDRESS: &str = "0xnebula";

pub fn set_up_ai(
    all_players: &mut Vec<Player>,
    total_players: &mut u128,
    all_characters: &mut Vec<Character>,
    total_characters: &mut u128,
) {
    let monika: String = String::from("Nebula Ai");
    let wallet_address = String::from(AI_ADDRESS);
    let avatar_url = String::new();

    match create_player(
        monika,
        wallet_address,
        avatar_url,
        all_players,
        total_players,
    ) {
        Some(ai) => {
            for x in 0..20 {
                if let Err(e) = mint_character_unchecked(
                    all_players,
                    all_characters,
                    total_characters,
                    ai.wallet_address.clone(),
                    x,
                ) {
                    println!("AI setup: failed to mint character {}: {}", x, e);
                }
            }
            println!("AI Created!!");
        }
        None => {
            println!("Couldn't create AI (already exists?)");
        }
    }
}

pub fn create_ai_duel(
    all_ai_duels: &mut Vec<Duel>,
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    total_duels: &mut u128,
    creators_address: String,
    creators_warriors: Vec<u128>,
    difficulty: Difficulty,
    time_stamp: u128,
) -> Result<u128, String> {
    if creators_warriors.len() != 3 {
        return Err("Player must present exactly 3 characters for each battle".to_string());
    }
    if difficulty == Difficulty::P2P {
        return Err("P2P difficulty is not applicable for AI duels".to_string());
    }

    let creators_warriors = select_fighters(
        all_characters,
        all_players,
        creators_address.clone(),
        creators_warriors[0],
        creators_warriors[1],
        creators_warriors[2],
    )?;

    *total_duels += 1;
    let mut new_duel = Duel {
        duel_id: *total_duels,
        is_active: true,
        is_completed: false,
        has_stake: false,
        stake_amount: 0,
        difficulty,
        duel_creator: creators_address.clone(),
        creator_warriors: creators_warriors.clone(),
        creators_strategy: AllStrategies::YetToSelect,
        duel_opponent: String::from(AI_ADDRESS),
        opponent_warriors: Vec::new(),
        opponents_strategy: AllStrategies::YetToSelect,
        creators_commit: String::new(),
        opponents_commit: String::new(),
        battle_events: String::new(),
        duel_winner: String::new(),
        duel_loser: String::new(),
        creation_time: time_stamp,
    };

    select_ai_battle_characters(
        creators_warriors,
        &mut new_duel,
        all_players,
        all_characters,
        time_stamp,
    )?;
    all_ai_duels.push(new_duel.clone());
    all_duels.push(new_duel);
    Ok(*total_duels)
}

fn select_ai_battle_characters(
    players_characters: Vec<u128>,
    duel: &mut Duel,
    all_players: &Vec<Player>,
    all_characters: &Vec<Character>,
    seed: u128,
) -> Result<(), String> {
    let mut ai_warriors: Vec<u128> = Vec::new();
    for character_id in players_characters.iter() {
        let opponent = find_opponent(
            *character_id,
            &duel.difficulty,
            &ai_warriors,
            all_players,
            all_characters,
            seed,
        )
        .ok_or("Could not find an AI opponent for one of the selected characters")?;
        ai_warriors.push(opponent);
    }
    duel.opponent_warriors = ai_warriors;
    Ok(())
}

pub fn select_ai_battle_strategy(
    all_ai_duels: &mut Vec<Duel>,
    all_duels: &mut Vec<Duel>,
    duel_id: u128,
    wallet_address: String,
    strategy: AllStrategies,
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
) -> Result<Duel, String> {
    set_strategy(all_duels, duel_id, wallet_address, strategy)?;

    let ai_strategy: AllStrategies =
        determine_ai_strategy(all_ai_duels, duel_id, all_characters)
            .ok_or("Error determining AI strategy")?;
    set_strategy(all_duels, duel_id, String::from(AI_ADDRESS), ai_strategy)?;

    fight(
        all_duels,
        all_characters,
        duel_id,
        all_players,
        all_ai_duels,
        &mut 0,
    )
}

fn determine_ai_strategy(
    all_ai_duels: &Vec<Duel>,
    duel_id: u128,
    all_characters: &Vec<Character>,
) -> Option<AllStrategies> {
    let duel_details = all_ai_duels.iter().find(|d| d.duel_id == duel_id)?;

    let player_total_health =
        calculate_total_health(&duel_details.creator_warriors, all_characters)?;
    let ai_total_health =
        calculate_total_health(&duel_details.opponent_warriors, all_characters)?;
    let player_total_strength =
        calculate_total_strength(&duel_details.creator_warriors, all_characters)?;
    let ai_total_strength =
        calculate_total_strength(&duel_details.opponent_warriors, all_characters)?;

    if player_total_health > ai_total_health && player_total_strength > ai_total_strength {
        Some(AllStrategies::MaxStrengthToLowest)
    } else if player_total_strength < ai_total_strength && player_total_health > ai_total_health {
        Some(AllStrategies::LowestHealthToMax)
    } else if player_total_strength < ai_total_strength && player_total_health < ai_total_health {
        Some(AllStrategies::MaxHealthToLowest)
    } else {
        Some(AllStrategies::LowestStrengthToMax)
    }
}

fn calculate_total_health(
    duel_warriors: &Vec<u128>,
    all_characters: &Vec<Character>,
) -> Option<u128> {
    let mut total_health: u128 = 0;
    for character_id in duel_warriors {
        for character in all_characters {
            if character.id == *character_id {
                total_health += character.health;
            }
        }
    }
    if total_health == 0 {
        None
    } else {
        Some(total_health)
    }
}

fn calculate_total_strength(
    duel_warriors: &Vec<u128>,
    all_characters: &Vec<Character>,
) -> Option<u128> {
    let mut total_strength: u128 = 0;
    for character_id in duel_warriors {
        for character in all_characters {
            if character.id == *character_id {
                total_strength += character.strength;
            }
        }
    }
    if total_strength == 0 {
        None
    } else {
        Some(total_strength)
    }
}

fn character_metric(c: &Character) -> u128 {
    c.strength
        .saturating_add(c.health)
        .saturating_add(c.attack / 3)
}

/// Find an AI warrior to face the given player character.
/// Easy: prefer the first shuffled AI character strictly weaker than the
/// player's. Hard: prefer one at least as strong. Either way, fall back to any
/// unselected AI character so a duel can always be formed (no recursion, no
/// panic).
fn find_opponent(
    character_id: u128,
    difficulty: &Difficulty,
    already_selected: &Vec<u128>,
    all_players: &Vec<Player>,
    all_characters: &Vec<Character>,
    seed: u128,
) -> Option<u128> {
    let possible_characters = get_ai_characters(all_players);
    let player_metric = all_characters
        .iter()
        .find(|c| c.id == character_id)
        .map(character_metric)?;

    let shuffled = shuffle_vector(&possible_characters, seed);
    let unselected: Vec<u128> = shuffled
        .into_iter()
        .filter(|id| !already_selected.contains(id))
        .collect();

    let preferred = unselected.iter().find(|id| {
        all_characters
            .iter()
            .find(|c| c.id == **id)
            .map(|c| {
                let m = character_metric(c);
                match difficulty {
                    Difficulty::Easy => m < player_metric,
                    Difficulty::Hard => m >= player_metric,
                    Difficulty::P2P => false,
                }
            })
            .unwrap_or(false)
    });

    preferred.copied().or_else(|| unselected.first().copied())
}

pub fn get_ai_characters(all_players: &Vec<Player>) -> Vec<u128> {
    for player in all_players {
        if player.wallet_address == AI_ADDRESS {
            return player.characters.clone();
        }
    }
    Vec::new()
}

pub fn decode_difficulty(difficulty_id: u128) -> Option<Difficulty> {
    match difficulty_id {
        1 => Some(Difficulty::Easy),
        2 => Some(Difficulty::Hard),
        3 => Some(Difficulty::P2P),
        _ => None,
    }
}

// Function to shuffle the vector using a u128 seed and return a new shuffled
// vector. Deterministic: same seed -> same order (replay-safe).
fn shuffle_vector<T: Clone>(vec: &Vec<T>, seed: u128) -> Vec<T> {
    let mut rng_seed = seed;
    let mut new_vec = vec.clone();
    let len = new_vec.len();

    for i in (1..len).rev() {
        // Simple linear congruential generator (LCG) for pseudo-random numbers
        rng_seed = rng_seed.wrapping_mul(6364136223846793005).wrapping_add(1);
        let j = (rng_seed % (i as u128 + 1)) as usize;
        new_vec.swap(i, j);
    }

    new_vec
}
