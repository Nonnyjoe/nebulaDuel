use core::panic;

use crate::players_profile::{Player, create_player, modify_avatar, modify_monika, get_profile};
use crate::game_characters::{SuperPower, Character, purchase_team, purchase_single_character, get_characters, select_fighters, confirm_ownership, get_character_details};
use crate::battle_challenge::{create_duel, fight, get_duel, join_duel, set_strategy, Difficulty, Duel };
use crate::strategy_simulation::{AllStrategies, decicde_victim};

pub fn set_up_ai(all_players: &mut Vec<Player>, total_players:&mut u128, all_characters:&mut Vec<Character>, total_characters: &mut u128, ) {
    let monika: String = String::from("Nebula Ai");
    let wallet_address = String::from("0xnebula").to_lowercase();
    let avatar_url = String::new();

    let ai = create_player(monika, wallet_address, avatar_url, all_players, total_players);
    println!("AI profile is {:?}", ai.clone().unwrap());

    match ai {
        Some(ai) => {
            let mut x = 0;

            while x < 20 {
                purchase_single_character(all_players, all_characters, total_characters, ai.wallet_address.clone(), x);
                x += 1;
            }
            println!("AI Created!!");
        },
        None => {
            panic!("Couldn't create AI");
        }
    }
}

pub fn create_ai_duel(all_ai_duels: &mut Vec<Duel>, all_duels: &mut Vec<Duel>, all_characters:&mut Vec<Character>, all_players:&mut Vec<Player>, total_duels: &mut u128, creators_address: String, creators_warriors: Vec<u128>, difficulty: Difficulty, time_stamp: u128) {
    if creators_warriors.len() < 3 {
        panic!("Player must present at least 3 characters for each battle!!");
    } 

    let creators_warriors = select_fighters(all_characters, all_players, creators_address.clone(), creators_warriors[0], creators_warriors[1], creators_warriors[2]);
    *total_duels += 1;
    let mut new_duel = Duel{
        duel_id: total_duels.clone(),
        is_active: true,
        is_completed: false,
        has_stake: false,
        stake_amount: 0.0,
        difficulty: difficulty,
        duel_creator: creators_address.clone(),
        creator_warriors: creators_warriors.clone(),
        creators_strategy: AllStrategies::YetToSelect,
        duel_opponent: String::from("0xnebula"),
        opponent_warriors: Vec::new(),
        opponents_strategy: AllStrategies::YetToSelect,
        battle_log: Vec::new(),
        duel_winner: String::new(),
        duel_loser: String::new(),
        creation_time: time_stamp,
    };

    select_ai_battle_characters(creators_warriors, &mut new_duel, all_players.clone(), all_characters.clone(), time_stamp);
    all_ai_duels.push(new_duel.clone());
    all_duels.push(new_duel);
}


fn  select_ai_battle_characters(players_characters: Vec<u128>, duel: &mut Duel, all_players: Vec<Player>, all_characters: Vec<Character>, seed: u128) {
    println!("Players characters.......: {:?}", players_characters);
    let mut ai_warriors: Vec<u128> = Vec::new();
    for (_index, character_id) in players_characters.iter().enumerate() {
        ai_warriors.push(find_opponent(*character_id, duel.clone(), ai_warriors.clone(), all_players.clone(), all_characters.clone(), seed));
    }
    duel.opponent_warriors = ai_warriors;
}



pub fn  select_ai_battle_strategy(all_ai_duels: &mut Vec<Duel>, all_duels: &mut Vec<Duel>, duel_id: u128, wallet_address: String, strategy: AllStrategies, all_characters: &mut Vec<Character>, all_players: &mut Vec<Player>) -> Duel {
    {
        set_strategy(all_duels, duel_id, wallet_address, strategy.clone());
    }
    {
        let ai_strategy: AllStrategies = determine_ai_strategy(all_ai_duels.clone(), duel_id.clone(), all_characters.clone());
        set_strategy(all_duels, duel_id, String::from("0xnebula"), ai_strategy);
    }

    println!("Duel data after stratyegy selection is: {:?}", all_duels);

    return fight(all_duels, all_characters, duel_id, all_players, all_ai_duels, &mut 0.0);
}


fn determine_ai_strategy(all_ai_duels: Vec<Duel>, duel_id: u128, all_characters: Vec<Character>) -> AllStrategies {
    let mut duel_details: Option<Duel> = None;
    for duels in all_ai_duels {
        if duels.duel_id == duel_id {
            duel_details = Some(duels);
        }
    };

    match duel_details {
        None => panic!("Could not fetch duel Details"),
        Some(duel_details) => {
            println!("=========================== AI warriors details: {:?}  ================================", duel_details.opponent_warriors.clone());
            let player_total_health = calculate_total_health(duel_details.creator_warriors.clone(), all_characters.clone());
            let ai_total_health = calculate_total_health(duel_details.opponent_warriors.clone(), all_characters.clone());
        
            let player_total_strength = calculate_total_strength(duel_details.creator_warriors.clone(), all_characters.clone());
            let ai_total_strength = calculate_total_strength(duel_details.opponent_warriors.clone(), all_characters.clone());
            
            println!("========= Calculations completed: player health: {}, AI health: {}, player strength: {}, AI strength: {} ", player_total_health, ai_total_health, player_total_strength, ai_total_strength);
            if player_total_health > ai_total_health && player_total_strength > ai_total_strength {
                return AllStrategies::MaxStrengthToLowest;
            } else if player_total_strength < ai_total_strength && player_total_health > ai_total_health {
                return AllStrategies::LowestHealthToMax;
            } else if player_total_strength < ai_total_strength && player_total_health < ai_total_health {
                return AllStrategies::MaxHealthToLowest;
            } else {
                return AllStrategies::LowestStrengthToMax;
            }
        }
    }
}

fn calculate_total_health(duel_warriors: Vec<u128>, all_characters: Vec<Character>) -> u128 {
    let mut total_health: u128 = 0;
    for character_id in duel_warriors.clone() {
        for character in all_characters.clone() {
            if character.id == character_id {
                total_health += character.health;
            }
        }
    }
    if total_health == 0 {
        panic!("Error fetching character health");
    } else {
        total_health
    }
}

fn calculate_total_strength(duel_warriors: Vec<u128>, all_characters: Vec<Character>) -> u128 {
    let mut total_strength: u128 = 0;
    for character_id in duel_warriors.clone() {
        for character in all_characters.clone() {
            if character.id == character_id {
                total_strength += character.strength;
            }
        }
    } if total_strength == 0 {
        panic!("Error fetching character strength");
    } else {
        total_strength
    }
}


fn find_opponent(character_id: u128, duel: Duel, already_selected: Vec<u128>, all_players: Vec<Player>, all_characters: Vec<Character>, seed: u128) -> u128 {
    let difficulty = duel.difficulty;
    let possible_characters = get_ai_characters(all_players);
    match difficulty {
        Difficulty::Easy => {
            return select_easy_opponent(all_characters, possible_characters, character_id, already_selected, seed);
        },
        Difficulty::Hard => {
            return select_hard_opponent(all_characters, possible_characters, character_id, already_selected, seed);
        },
        Difficulty::P2P => {
            panic!("P2P battle difficulty not applicable for Ai Duel");
        },
    }
}

fn select_easy_opponent(all_characters: Vec<Character>, possible_characters: Vec<u128>, character_id: u128, already_selected: Vec<u128>,  seed: u128) -> u128 {
    let mut selected_character: Option<u128> = None;
    let mut opponent_details: Character;
    let mut opponent_metric: u128= 0;
    let mut previous_character_metric: u128= 0;
    
    for character in all_characters.clone() {
        if character.id == character_id { 
            opponent_details = character;
            opponent_metric = opponent_details.strength + opponent_details.health + (opponent_details.attack / 3);
            println!("oponent id: {}..... oponnent metrix: {}", opponent_details.id.clone(), opponent_metric.clone());
        }
    };

    for characters_id in shuffle_vector(&possible_characters.clone(), seed.clone()) {
        let mut character_details;
        let mut character_metric: u128 = 0;
        
        for character in all_characters.clone() {
            if character.id == characters_id {
                character_details = character;
                character_metric = character_details.strength + character_details.health + (character_details.attack / 3);
                if !is_already_selected(already_selected.clone(), characters_id) &&character_metric > previous_character_metric && character_metric < opponent_metric {
                    println!("character id: {}..... character metrix: {}", character_details.id.clone(), character_metric.clone());
                    // selected_character = Some(character_details.id);
                    // previous_character_metric = character_metric;
                    return character_details.id;
                }
            }
        };
    }

    match selected_character {
        None => {
            println!("Findind Difficult Characters......");
            selected_character = Some(select_compromise(all_characters, possible_characters, character_id, already_selected, seed.clone()));
            if selected_character.is_none() {
                panic!("No opponent found for selected character");
            } else {
                return selected_character.unwrap();
            }
        },
        Some(character_id) => {
            println!("Character found: {}", character_id);
            return character_id;
        }
    }
}





fn select_compromise(all_characters: Vec<Character>, possible_characters: Vec<u128>, character_id: u128, already_selected: Vec<u128>,  seed: u128) -> u128 {
    let mut selected_character: Option<u128> = None;
    let mut opponent_details: Character;
    let mut opponent_metric: u128= 0;
    let mut previous_character_metric: u128= 0;
    
    for character in all_characters.clone() {
        if character.id == character_id { 
            opponent_details = character;
            opponent_metric = opponent_details.strength + opponent_details.health + (opponent_details.attack / 3);
        }
    };

    for characters_id in possible_characters.clone() {
        let mut character_details;
        let mut character_metric: u128 = 0;
        
        for character in all_characters.clone() {
            if character.id == characters_id {
                character_details = character;
                character_metric = character_details.strength + character_details.health + (character_details.attack / 3);
                if !is_already_selected(already_selected.clone(), characters_id) &&character_metric > previous_character_metric && character_metric >= opponent_metric {
                    return (character_details.id);
                }
            }
        };
    }

    match selected_character {
        None => {
            selected_character = Some(select_easy_opponent(all_characters, possible_characters, character_id, already_selected, seed));
            if selected_character.is_none() {
                panic!("No opponent found for selected character");
            } else {
                return selected_character.unwrap();
            }
        },
        Some(character_id) => {
            println!("Character found: {}", character_id);
            return character_id;
        }
    }
}






fn select_hard_opponent(all_characters: Vec<Character>, possible_characters: Vec<u128>, character_id: u128, already_selected: Vec<u128>, seed: u128) -> u128 {
    let mut selected_character: Option<u128> = None;
    let mut opponent_details: Character;
    let mut opponent_metric: u128= 0;
    let mut previous_character_metric: u128= 0;
    
    for character in all_characters.clone() {
        if character.id == character_id { 
            opponent_details = character;
            opponent_metric = opponent_details.strength + opponent_details.health + (opponent_details.attack / 3);
        }
    };

    for characters_id in shuffle_vector(&possible_characters.clone(), seed.clone()) {
        let mut character_details;
        let mut character_metric: u128 = 0;
        
        for character in all_characters.clone() {
            if character.id == characters_id {
                character_details = character;
                character_metric = character_details.strength + character_details.health + (character_details.attack / 3);
                if !is_already_selected(already_selected.clone(), characters_id) &&character_metric > previous_character_metric && character_metric >= opponent_metric {
                    // selected_character = Some(character_details.id);
                    // previous_character_metric = character_metric;
                    return character_details.id;
                }
            }
        };
    }

    match selected_character {
        None => {
            selected_character = Some(select_easy_opponent(all_characters, possible_characters, character_id, already_selected, seed.clone()));
            if selected_character.is_none() {
                panic!("No opponent found for selected character");
            } else {
                return selected_character.unwrap();
            }
        },
        Some(character_id) => {
            println!("Character found: {}", character_id);
            return character_id;
        }
    }
}

pub fn get_ai_characters(all_players: Vec<Player>) -> Vec<u128> {
    let mut ai_characters: Vec<u128> = Vec::new();
    for player in all_players {
        if player.wallet_address == String::from("0xnebula") {
            ai_characters = player.characters;
        }
    }
    return ai_characters;
}

fn is_already_selected(selected_characters: Vec<u128>, character_id: u128) -> bool {
    for character in selected_characters {
        if character == character_id {
            return true;
        }
    }
    return false;
}


pub fn decode_difficulty(difficulty_id: u128) -> Option<Difficulty> {
    match difficulty_id {
        1 => return Some(Difficulty::Easy),
        2 => return Some(Difficulty::Hard),
        3 => return Some(Difficulty::P2P),
        _ => return None,
    }
}


// Function to shuffle the vector using a u128 seed and return a new shuffled vector
fn shuffle_vector<T: Clone>(vec: &Vec<T>, seed: u128) -> Vec<T> {
    let mut rng_seed = seed;
    let mut new_vec = vec.clone();
    let len = new_vec.len();

    for i in (1..len).rev() {
        // Simple linear congruential generator (LCG) for generating pseudo-random numbers
        rng_seed = rng_seed.wrapping_mul(6364136223846793005).wrapping_add(1);
        let j = (rng_seed % (i as u128 + 1)) as usize;
        new_vec.swap(i, j);
    }

    new_vec
}