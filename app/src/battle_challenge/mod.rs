use std::option;

use crate::game_characters::{
    confirm_ownership, get_character_details, get_characters, purchase_team, select_fighters,
    Character, MinimalCharacter, SuperPower,
};
use crate::players_profile::{create_player, get_profile, modify_avatar, modify_monika, Player};
use crate::strategy_simulation::{decicde_victim, AllStrategies};

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
    turn_number: u128,
    max_turn: Option<u128>,
}

impl TurnsTracker {
    fn new() -> TurnsTracker {
        TurnsTracker {
            turn_number: 0,
            max_turn: Some(2),
        }
    }

    fn increase_turn(&mut self) {
        match self.max_turn {
            Some(max_turn) => {
                if self.turn_number == max_turn || self.turn_number > max_turn || max_turn == 0 {
                    self.turn_number = 0;
                } else {
                    self.turn_number += 1;
                }
            }
            None => {
                self.turn_number = 0;
            }
        }
    }

    fn reduce_max_turn(&mut self) {
        match self.max_turn {
            Some(max_turn) => {
                if max_turn >= 1 {
                    self.max_turn = Some(max_turn - 1);
                } else {
                    self.max_turn = None;
                }
            }
            None => {
                self.max_turn = None;
            }
        };
    }

    fn check_turn(&self) -> usize {
        return self.turn_number.try_into().expect("ERROR CHECKING TURN");
    }

    fn sync(&mut self) {
        match self.max_turn {
            Some(max_turn) => {
                if self.turn_number > max_turn {
                    self.turn_number = max_turn;
                }
            }
            None => {}
        };
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
) {
    if creators_warriors.len() < 3 {
        println!("Player must present at least 3 characters for each battle!!");
    };
    if has_stake == false && stake_amount > 0.0 {
        println!("Stake amount must be 0 if stake is deactivated");
    }

    let creators_warriors = select_fighters(
        all_characters,
        all_players,
        creators_address.clone(),
        creators_warriors[0],
        creators_warriors[1],
        creators_warriors[2],
    );
    *total_duels += 1;
    let new_duel = Duel {
        duel_id: total_duels.clone(),
        is_active: false,
        is_completed: false,
        has_stake: has_stake,
        stake_amount: stake_amount,
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

    if has_stake {
        enforce_stake(all_players, creators_address.clone(), stake_amount.clone());
    }

    available_duels.push(new_duel.clone());
    all_duels.push(new_duel);
}

fn enforce_stake(all_players: &mut Vec<Player>, user_address: String, stake_amount: f64) {
    let mut found = false;
    for player in all_players {
        if player.wallet_address == user_address {
            found = true;
            if player.cartesi_token_balance < stake_amount {
                println!("You do not have enough balance to stake");
            } else {
                player.reduce_cartesi_token_balance(stake_amount);
            };
        }
    }
    if !found {
        println!("player not found");
    }
}

pub fn join_duel(
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    duel_id: u128,
    opponent_address: String,
    opponent_warriors: Vec<u128>,
) -> Option<Vec<Vec<u128>>> {
    let selected_duel = find_duel(all_duels, duel_id);
    match selected_duel {
        Some(duel) => {
            if duel.is_active {
                println!("duel already active");
                return None;
            } else if duel.is_completed {
                println!("duel already completed");
                return None;
            } else if opponent_warriors.len() < 3 || opponent_warriors.len() > 3 {
                println!("Player must present exactly 3 characters for each battle!!");
                return None;
            } else if duel.duel_creator == opponent_address.clone() {
                println!("You cannot join your own duel");
                return None;
            } else {
                if duel.has_stake {
                    enforce_stake(all_players, opponent_address.clone(), duel.stake_amount);
                }
                let opponent_warriors = select_fighters(
                    all_characters,
                    all_players,
                    opponent_address.clone(),
                    opponent_warriors[0],
                    opponent_warriors[1],
                    opponent_warriors[2],
                );
                duel.duel_opponent = opponent_address.clone();
                duel.opponent_warriors = opponent_warriors.clone();
                duel.opponents_strategy = AllStrategies::YetToSelect;
                duel.is_active = true;
            }
            let both_warriors: Vec<Vec<u128>> =
                reveal_both_warriors(all_duels, duel_id).expect("DUEL ID NOT FOUND");
            return Some(both_warriors);
        }
        None => {
            println!("Duel with id {} not found", duel_id);
            return None;
        }
    }
}

pub fn set_strategy(
    all_duels: &mut Vec<Duel>,
    duel_id: u128,
    wallet_address: String,
    strategy: AllStrategies,
) -> Option<bool> {
    let selected_duel = find_duel(all_duels, duel_id);
    match selected_duel {
        Some(duel) => {
            if !duel.is_active {
                println!("duel not active");
                return None;
            } else if duel.is_completed {
                println!("duel already completed");
                return None;
            } else if duel.duel_opponent == String::from("") {
                println!("You can only set strategies when you have an opponent!");
                return None;
            } else if duel.duel_creator == wallet_address {
                duel.creators_strategy = strategy;
                if duel.opponents_strategy != AllStrategies::YetToSelect {
                    return Some(true);
                } else {
                    return Some(false);
                }
            } else if duel.duel_opponent == wallet_address {
                duel.opponents_strategy = strategy;
                if duel.creators_strategy != AllStrategies::YetToSelect {
                    return Some(true);
                } else {
                    return Some(false);
                }
            } else {
                println!("You are not the creator or opponent of this duel");
                return None;
            }
        }
        None => {
            println!("Duel with id {} not found", duel_id);
            return None;
        }
    }
}

pub fn fight(
    all_duels: &mut Vec<Duel>,
    all_characters: &mut Vec<Character>,
    duel_id: u128,
    all_players: &mut Vec<Player>,
    available_duels: &mut Vec<Duel>,
    profit_from_stake: &mut f64,
) -> Option<Duel> {
    let mut creator_turn_tracker = TurnsTracker::new();
    let mut opponent_turn_tracker = TurnsTracker::new();

    match find_duel(all_duels, duel_id) {
        Some(duel) => {
            let creators_strategy = &duel.creators_strategy;
            let opponents_strategy = &duel.opponents_strategy;
            let creators_warriors: &mut Vec<Character> =
                &mut get_warriors_clone(all_characters, &duel.creator_warriors);
            let opponent_warriors: &mut Vec<Character> =
                &mut get_warriors_clone(all_characters, &duel.opponent_warriors);
            if !duel.is_active {
                println!("duel not active");
            } else if duel.is_completed {
                return Some(duel.clone());
            } else if duel.creators_strategy == AllStrategies::YetToSelect
                || duel.opponents_strategy == AllStrategies::YetToSelect
            {
                println!("Strategy not selected");
            } else {
                loop {
                    if creators_warriors.len() == 0 {
                        duel.duel_winner = duel.duel_opponent.clone();
                        duel.duel_loser = duel.duel_creator.clone();
                        register_battle_details(
                            all_players,
                            all_characters,
                            duel.duel_winner.clone(),
                            duel.duel_loser.clone(),
                            duel.clone(),
                            profit_from_stake,
                        );
                        duel.is_completed = true;
                        break;
                    } else if opponent_warriors.len() == 0 {
                        duel.duel_winner = duel.duel_creator.clone();
                        duel.duel_loser = duel.duel_opponent.clone();
                        register_battle_details(
                            all_players,
                            all_characters,
                            duel.duel_winner.clone(),
                            duel.duel_loser.clone(),
                            duel.clone(),
                            profit_from_stake,
                        );
                        duel.is_completed = true;
                        break;
                    } else {
                        println!(".");
                        println!(
                            "NEW ROUND BEGINNING WITH OPPONENT LENGTH: {}, AND CREATOR LENTTH: {}",
                            opponent_warriors.len(),
                            creators_warriors.len()
                        );
                        println!("ATTACKERS ARE: {:?}", creators_warriors);
                        println!("OPPONENT WARRIORS: {:?}", opponent_warriors);
                        println!(".");
                        println!(
                            "-----INDEX OF ATTACKER: {}",
                            creator_turn_tracker.check_turn()
                        );
                        creator_turn_tracker.sync();
                        let mut attacker: &mut Character = creators_warriors
                            .get_mut(creator_turn_tracker.check_turn())
                            .expect("ERROR GETTING WARRIORS");
                        let mut opponent: &mut Character =
                            decicde_victim(creators_strategy, opponent_warriors)
                                .expect("INVALID STRATEGY");
                        single_duel(&mut attacker, &mut opponent);
                        duel.battle_log.push(new_vec(attacker, opponent));

                        // Check if the opponent is dead
                        if opponent.is_dead() {
                            let opponent_index =
                                find_index_in_vec(opponent.id, opponent_warriors.clone());
                            println!("character at creator index:{:?} dead", opponent_index);
                            match opponent_index {
                                Some(index) => {
                                    opponent_warriors
                                        .remove(index.try_into().expect("ERROR REMOVING OPPONENT"));
                                    println!("New oponent length is: {}", opponent_warriors.len());
                                    opponent_turn_tracker.reduce_max_turn();
                                }
                                None => {
                                    println!("character not found in opponents warriors");
                                }
                            }
                        }

                        // Check if the first battle ended the duel
                        if creators_warriors.len() == 0 {
                            duel.duel_winner = duel.duel_opponent.clone();
                            duel.duel_loser = duel.duel_creator.clone();
                            register_battle_details(
                                all_players,
                                all_characters,
                                duel.duel_winner.clone(),
                                duel.duel_loser.clone(),
                                duel.clone(),
                                profit_from_stake,
                            );
                            duel.is_completed = true;
                            break;
                        } else if opponent_warriors.len() == 0 {
                            duel.duel_winner = duel.duel_creator.clone();
                            duel.duel_loser = duel.duel_opponent.clone();
                            register_battle_details(
                                all_players,
                                all_characters,
                                duel.duel_winner.clone(),
                                duel.duel_loser.clone(),
                                duel.clone(),
                                profit_from_stake,
                            );
                            duel.is_completed = true;
                            break;
                        }

                        // OPPONENT ATTACKS SECOND
                        opponent_turn_tracker.sync();
                        println!(
                            "-----INDEX OF ATTACKER2: {}",
                            opponent_turn_tracker.check_turn()
                        );
                        attacker = opponent_warriors
                            .get_mut(opponent_turn_tracker.check_turn())
                            .expect("error getting attacker");
                        opponent = decicde_victim(opponents_strategy, creators_warriors)
                            .expect("INVALID STRATEGY");
                        single_duel(attacker, opponent);
                        duel.battle_log.push(new_vec(attacker, opponent));

                        // Check if the opponent is dead
                        if opponent.is_dead() {
                            println!("dead opponent: {:?}", opponent);
                            // println!("Opponent warriors before removal is: {:?}", creators_warriors.clone());
                            // println!("Opponent warriors length before removal is: {:?}", creators_warriors.len());

                            let opponent_index =
                                find_index_in_vec(opponent.id, creators_warriors.clone());
                            println!(
                                "index of character is: {}",
                                opponent_index.expect("ERROR FINDING INDEX")
                            );
                            match opponent_index {
                                Some(index) => {
                                    creators_warriors
                                        .remove(index.try_into().expect("ERROR REMOVING WARRRIOR"));
                                    creator_turn_tracker.reduce_max_turn();
                                    println!("New oponent length is: {}", opponent_warriors.len());
                                    // println!("character at opponent index:{:?} dead", opponent_warriors[index as usize]);
                                    println!("Opponent warriors is: {:?}", opponent_warriors);
                                }
                                None => {
                                    println!("character not found in opponents warriors");
                                }
                            }
                        }

                        creator_turn_tracker.increase_turn();
                        opponent_turn_tracker.increase_turn();
                    }
                }
            };
            for (index, duel) in available_duels.clone().iter().enumerate() {
                if duel.duel_id == duel_id {
                    available_duels.remove(index.try_into().expect("ERROR REMOVING DUEL"));
                }
            }
            return Some(duel.clone());
        }
        None => {
            println!("Duel with id {} not found", duel_id);
            return None;
        }
    }
}

fn register_battle_details(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    duel_winner: String,
    duel_looser: String,
    duel: Duel,
    profit_from_stake: &mut f64,
) {
    println!("Registering battle winners and loosers...");
    println!("============================== RESULTS ARE IN!! WINNER: {}, LOSSER: {} ==========================================", duel_winner, duel_looser);

    {
        let winner = get_profile(all_players, duel_winner.clone());
        match winner {
            Some(winner) => {
                winner.register_win(all_characters);
            }
            None => {
                println!("winner not found");
            }
        }
    }
    {
        let looser = get_profile(all_players, duel_looser);
        match looser {
            Some(looser) => {
                looser.register_loss(all_characters);
            }
            None => {
                println!("looser not found");
            }
        }
    }
    {
        if duel.has_stake {
            println!("=== RELEASING STAKE TO WINNER ===");
            let winner = get_profile(all_players, duel_winner).expect("ERROR FETCHING WINNERS");
            winner.increase_cartesi_token_balance((duel.stake_amount * 2.0) * 0.90);
            *profit_from_stake += (duel.stake_amount * 2.0) * 0.10;
        }
    }
}

fn find_index_in_vec(character_id: u128, characters: Vec<Character>) -> Option<u128> {
    let mut index = 0;
    for character in characters {
        if character_id == character.id {
            return Some(index);
        } else {
            index += 1;
        }
    }
    return None;
}

fn new_vec(attacker: &Character, opponent: &Character) -> Vec<MinimalCharacter> {
    let mut new_vec: Vec<MinimalCharacter> = Vec::new();
    new_vec.push(attacker.character_to_minimal_character());
    new_vec.push(opponent.character_to_minimal_character());
    return new_vec;
}

fn single_duel(attacker: &mut Character, opponent: &mut Character) {
    println!(
        "new battle round: {}, will attack: {}",
        attacker.id, opponent.id
    );
    let damage: u128 = (attacker.strength + (attacker.attack / 2)) - (opponent.speed / 4);
    if opponent.health <= damage {
        opponent.health = 0;
    } else {
        opponent.health -= damage;
    };
    if opponent.speed >= 1 {
        opponent.speed -= 1;
    }
    attacker.attack = if (attacker.attack - (damage / 5)) >= 5 {
        attacker.attack - (damage / 5)
    } else {
        attacker.attack
    };
    attacker.strength = if (attacker.strength - (damage / 7)) >= 5 {
        attacker.strength - (damage / 7)
    } else {
        attacker.strength
    };

    println!("One battle round has been completed, attacker_id: {}, attacker_strenght: {}, opponent_id: {}, opponent_health: {}", attacker.id, attacker.strength, opponent.id, opponent.health);
}

fn get_warriors_clone(
    all_characters: &mut Vec<Character>,
    selected_characters: &Vec<u128>,
) -> Vec<Character> {
    if selected_characters.len() < 3 {
        println!("Player must present at least 3 characters for each battle!!");
    }
    let mut creators_warriors: Vec<Character> = Vec::new();

    for character_id in selected_characters {
        let mut selected_character_clone: Option<Character> = None;

        for character in all_characters.iter_mut() {
            if character.id == *character_id {
                selected_character_clone = Some(character.clone());
            }
        }
        match selected_character_clone {
            Some(character) => {
                creators_warriors.push(character.clone());
            }
            None => {
                println!("Character with id {} not found", character_id);
            }
        }
    }
    return creators_warriors;
}

pub fn reveal_both_warriors(all_duels: &mut Vec<Duel>, duel_id: u128) -> Option<Vec<Vec<u128>>> {
    let selected_duel = find_duel(all_duels, duel_id);
    match selected_duel {
        Some(duel) => {
            let mut both_warriors = Vec::new();
            both_warriors.push(duel.creator_warriors.clone());
            both_warriors.push(duel.opponent_warriors.clone());
            return Some(both_warriors);
        }
        None => {
            println!("Duel with id {} not found", duel_id);
            return None;
        }
    }
}

pub fn get_duel(all_duels: &mut Vec<Duel>, duel_id: u128) -> Option<&mut Duel> {
    return find_duel(all_duels, duel_id);
}

fn find_duel(all_duels: &mut Vec<Duel>, duel_id: u128) -> Option<&mut Duel> {
    for duel in all_duels.iter_mut() {
        if duel.duel_id == duel_id {
            return Some(duel);
        }
    }
    return None;
}
