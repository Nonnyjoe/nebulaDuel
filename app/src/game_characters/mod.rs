use crate::players_profile::{find_player, Player};

#[derive(Debug, PartialEq, Clone)]
pub enum SuperPower {
    Thunderbolt,
    Flamethrower,
    VineWhip,
    WaterGun,
    SleepSong,
    Psychic,
    Adaptability,
    ShadowBall,
    HeadCrush,
    SonicKick,
    TelekineticHit,
    InvisibleClaws,
    DodgeNdTailLash,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Character {
    pub name: String,
    pub health: u128,
    pub strength: u128,
    pub attack: u128,
    pub speed: u128,
    pub super_power: SuperPower,
    pub id: u128,
    pub total_battles: u128,
    pub total_wins: u128,
    pub total_losses: u128,
    pub price: u128,
    pub owner: String,
}

#[derive(Debug, PartialEq, Clone)]
pub struct MinimalCharacter {
    pub id: u128,
    pub name: String,
    pub health: u128,
    pub strength: u128,
    pub attack: u128,
    pub owner: String,
}

impl Character {
    pub fn character_to_minimal_character(&self) -> MinimalCharacter {
        MinimalCharacter {
            id: self.id,
            name: self.name.clone(),
            health: self.health,
            strength: self.strength,
            attack: self.attack,
            owner: self.owner.clone(),
        }
    }

    pub fn is_dead(&self) -> bool {
        if self.health < 1 {
            return true;
        } else {
            return false;
        }
    }

    pub fn buy_character(&mut self, buyer_address: String) {
        self.owner = buyer_address;
    }
}

//Function to sort a players character choice from the inputed character ID
fn sort_characters(character_id: u128) -> Option<Character> {
    if character_id <= 19 {
        match character_id {
            0 => model_character(
                String::from("Mystic Seer"),
                80,
                10,
                10,
                10,
                SuperPower::Thunderbolt,
                317,
            ),
            1 => model_character(
                String::from("Zylar the Conqueror"),
                90,
                10,
                13,
                9,
                SuperPower::Flamethrower,
                385,
            ),
            2 => model_character(
                String::from("Shadow Strike"),
                75,
                10,
                13,
                10,
                SuperPower::VineWhip,
                307,
            ),
            3 => model_character(
                String::from("Captain Valor"),
                85,
                8,
                10,
                8,
                SuperPower::WaterGun,
                350,
            ),
            4 => model_character(
                String::from("Sir Elara the Great"),
                88,
                9,
                13,
                7,
                SuperPower::SleepSong,
                362,
            ),
            5 => model_character(
                String::from("Goul King"),
                92,
                11,
                14,
                9,
                SuperPower::Psychic,
                415,
            ),
            6 => model_character(
                String::from("Elinor Swiftstrike"),
                80,
                10,
                13,
                7,
                SuperPower::HeadCrush,
                320,
            ),
            7 => model_character(
                String::from("Ravager"),
                75,
                8,
                16,
                6,
                SuperPower::ShadowBall,
                300,
            ),
            8 => model_character(
                String::from("Bone Collector"),
                93,
                12,
                15,
                8,
                SuperPower::Adaptability,
                440,
            ),
            9 => model_character(
                String::from("Vortex"),
                88,
                10,
                13,
                8,
                SuperPower::SonicKick,
                370,
            ),
            10 => model_character(
                String::from("Dire Wolf"),
                90,
                11,
                14,
                6,
                SuperPower::TelekineticHit,
                397,
            ),
            11 => model_character(
                String::from("Luna Empress"),
                87,
                8,
                15,
                10,
                SuperPower::InvisibleClaws,
                357,
            ),
            12 => model_character(
                String::from("Blaze"),
                83,
                8,
                13,
                8,
                SuperPower::DodgeNdTailLash,
                338,
            ),
            13 => model_character(
                String::from("Techno Mage"),
                93,
                10,
                12,
                8,
                SuperPower::DodgeNdTailLash,
                430,
            ),
            14 => model_character(
                String::from("Berzerker"),
                96,
                13,
                14,
                8,
                SuperPower::DodgeNdTailLash,
                480,
            ),
            15 => model_character(
                String::from("Gorgon"),
                92,
                11,
                13,
                8,
                SuperPower::DodgeNdTailLash,
                405,
            ),
            16 => model_character(
                String::from("Troll"),
                93,
                11,
                15,
                7,
                SuperPower::DodgeNdTailLash,
                440,
            ),
            17 => model_character(
                String::from("Drake Fire"),
                90,
                10,
                10,
                8,
                SuperPower::DodgeNdTailLash,
                380,
            ),
            18 => model_character(
                String::from("Stone Golem"),
                91,
                10,
                13,
                7,
                SuperPower::DodgeNdTailLash,
                400,
            ),
            19 => model_character(
                String::from("Serena Hawk"),
                88,
                10,
                11,
                9,
                SuperPower::DodgeNdTailLash,
                365,
            ),
            _ => {
                return None;
            }
        }
    } else {
        return None;
    }
}

// Function to create a new character struct
fn model_character(
    name: String,
    health: u128,
    strength: u128,
    attack: u128,
    speed: u128,
    super_power: SuperPower,
    price: u128,
) -> Option<Character> {
    let character = Character {
        name,
        health,
        strength,
        attack,
        speed,
        super_power: super_power,
        id: 0,
        total_battles: 0,
        total_wins: 0,
        total_losses: 0,
        price,
        owner: String::from(" "),
    };
    return Some(character);
}

// Function to create a team
pub fn purchase_team(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    total_characters: &mut u128,
    wallet_address: String,
    character1_id: u128,
    character2_id: u128,
    character3_id: u128,
) -> Result<(), String> {
    let mut character1 = sort_characters(character1_id)
        .ok_or_else(|| format!("Invalid character id: {}", character1_id))?;
    let mut character2 = sort_characters(character2_id)
        .ok_or_else(|| format!("Invalid character id: {}", character2_id))?;
    let mut character3 = sort_characters(character3_id)
        .ok_or_else(|| format!("Invalid character id: {}", character3_id))?;
    let total_price = character1.price + character2.price + character3.price;

    let player = find_player(all_players, wallet_address.clone())
        .ok_or("Player not registered. Please register first")?;

    if player.points < total_price {
        return Err(format!(
            "Insufficient points balance, you need {} more points",
            total_price - player.points
        ));
    }

    player.points -= total_price;
    character1.owner = wallet_address.clone();
    character2.owner = wallet_address.clone();
    character3.owner = wallet_address.clone();

    character1.id = *total_characters + 1;
    character2.id = *total_characters + 2;
    character3.id = *total_characters + 3;
    *total_characters += 3;

    player.characters.push(character1.id);
    player.characters.push(character2.id);
    player.characters.push(character3.id);

    all_characters.push(character1);
    all_characters.push(character2);
    all_characters.push(character3);

    println!("Team purchase successful!!");
    Ok(())
}

pub fn purchase_single_character(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    total_characters: &mut u128,
    wallet_address: String,
    character_id: u128,
) -> Result<(), String> {
    let mut character = sort_characters(character_id)
        .ok_or_else(|| format!("Invalid character id: {}", character_id))?;
    let price = character.price;
    let player = find_player(all_players, wallet_address.clone())
        .ok_or("Player not registered. Please register first")?;

    if player.points < price {
        return Err(format!(
            "Insufficient points balance, you need {} more points",
            price - player.points
        ));
    }

    player.points -= price;
    character.owner = wallet_address.clone();
    *total_characters += 1;
    character.id = *total_characters;

    player.characters.push(character.id);
    all_characters.push(character);

    println!("Character purchase successful!!");
    Ok(())
}

// function to return an array containing the Id's of a users characters
pub fn get_characters(all_players: &mut Vec<Player>, wallet_address: String) -> Option<Vec<u128>> {
    match find_player(all_players, wallet_address) {
        Some(player) => Some(player.characters.to_vec()),
        None => None,
    }
}

// function that collects a users address and the id of the 3 characters he selected
// we run a check to confirm that the character exists and also belongs to the said address
// then we return an array of the selected characters id
pub fn select_fighters(
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    wallet_address: String,
    character1_id: u128,
    character2_id: u128,
    character3_id: u128,
) -> Result<Vec<u128>, String> {
    if character1_id == character2_id || character1_id == character3_id || character2_id == character3_id {
        return Err("Cannot select the same character more than once".to_string());
    }
    let mut selected_fighters: Vec<u128> = Vec::new();
    selected_fighters.push(confirm_ownership(
        all_characters,
        all_players,
        wallet_address.clone(),
        character1_id,
    )?);
    selected_fighters.push(confirm_ownership(
        all_characters,
        all_players,
        wallet_address.clone(),
        character2_id,
    )?);
    selected_fighters.push(confirm_ownership(
        all_characters,
        all_players,
        wallet_address.clone(),
        character3_id,
    )?);

    println!("Fighters selected");
    Ok(selected_fighters)
}

/// Confirms a character exists AND belongs to the given wallet.
/// Unlike the previous version, failing either check is now an error that
/// rejects the input instead of a log line that lets the action through.
pub fn confirm_ownership(
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    wallet_address: String,
    character_id: u128,
) -> Result<u128, String> {
    let selected_character = all_characters
        .iter()
        .find(|c| c.id == character_id)
        .ok_or_else(|| format!("Character with id {} not found", character_id))?;

    find_player(all_players, wallet_address.clone())
        .ok_or("Player not registered. Please register first")?;

    if selected_character.owner.to_lowercase() != wallet_address.to_lowercase() {
        return Err(format!(
            "Player is not the owner of character id: {}",
            character_id
        ));
    }

    Ok(character_id)
}

pub fn get_character_details(
    all_characters: &mut Vec<Character>,
    character_id: u128,
) -> Option<&mut Character> {
    all_characters.iter_mut().find(|c| c.id == character_id)
}
