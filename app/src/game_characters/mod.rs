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

// ---------------------------------------------------------------------------
// Mint economics
//
// Points are earned in battle, so points-funded mints must be rate-limited or
// the campaign becomes a character printer:
//   * escalating premium: each successive points mint costs +15% more
//   * cooldown: one points mint per 6 in-game hours (block timestamp)
//   * the starter team (purchase_team) is one-time per player at base price
// CTSI-funded mints carry no premium/cooldown — tokens were deposited, not
// farmed. CTSI price = base points price / points_rate.
// ---------------------------------------------------------------------------

pub const POINT_MINT_COOLDOWN_SECS: u128 = 6 * 60 * 60;
pub const POINT_MINT_PREMIUM_PCT_PER_PURCHASE: u128 = 15;
pub const POINT_MINT_PREMIUM_CAP_PCT: u128 = 300; // premium tops out at +300%

#[derive(Debug, PartialEq, Clone, Copy)]
pub enum MintCurrency {
    Points,
    Ctsi,
}

pub fn decode_currency(s: &str) -> Result<MintCurrency, String> {
    match s.to_lowercase().as_str() {
        "points" => Ok(MintCurrency::Points),
        "ctsi" | "tokens" | "token" => Ok(MintCurrency::Ctsi),
        other => Err(format!(
            "Unknown currency '{}': use \"points\" or \"ctsi\"",
            other
        )),
    }
}

/// Points price for this player including the anti-farm premium.
pub fn points_price_for(player: &Player, base_price: u128) -> u128 {
    let premium =
        (player.point_purchase_count * POINT_MINT_PREMIUM_PCT_PER_PURCHASE)
            .min(POINT_MINT_PREMIUM_CAP_PCT);
    base_price * (100 + premium) / 100
}

/// CTSI price for a base points price at the given points rate.
pub fn ctsi_price_for(base_price: u128, points_rate: f64) -> f64 {
    if points_rate <= 0.0 {
        return base_price as f64;
    }
    base_price as f64 / points_rate
}

/// Internal mint that bypasses economics — used for AI setup only.
pub fn mint_character_unchecked(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    total_characters: &mut u128,
    wallet_address: String,
    template_id: u128,
) -> Result<(), String> {
    let mut character = sort_characters(template_id)
        .ok_or_else(|| format!("Invalid character id: {}", template_id))?;
    let price = character.price;
    let player = find_player(all_players, wallet_address.clone())
        .ok_or("Player not registered")?;
    if player.points < price {
        return Err("Insufficient points".to_string());
    }
    player.points -= price;
    character.owner = wallet_address;
    *total_characters += 1;
    character.id = *total_characters;
    player.characters.push(character.id);
    all_characters.push(character);
    Ok(())
}

/// One-time starter team: 3 characters at base points price, no premium.
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

    if player.starter_team_claimed {
        return Err(
            "Starter team already claimed — recruit individual warriors in the marketplace"
                .to_string(),
        );
    }
    if player.points < total_price {
        return Err(format!(
            "Insufficient points balance, you need {} more points",
            total_price - player.points
        ));
    }

    player.points -= total_price;
    player.starter_team_claimed = true;
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

    println!("Starter team claimed!!");
    Ok(())
}

/// Mint a single character paying with battle points (premium + cooldown) or
/// deposited CTSI (base-rate price, no cooldown).
#[allow(clippy::too_many_arguments)]
pub fn purchase_single_character(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    total_characters: &mut u128,
    wallet_address: String,
    character_id: u128,
    currency: MintCurrency,
    points_rate: f64,
    time_stamp: u128,
    profit_from_points_purchase: &mut f64,
) -> Result<(), String> {
    let mut character = sort_characters(character_id)
        .ok_or_else(|| format!("Invalid character id: {}", character_id))?;
    let base_price = character.price;
    let player = find_player(all_players, wallet_address.clone())
        .ok_or("Player not registered. Please register first")?;

    match currency {
        MintCurrency::Points => {
            // Cooldown gate.
            if player.last_point_purchase_time > 0
                && time_stamp > 0
                && time_stamp < player.last_point_purchase_time + POINT_MINT_COOLDOWN_SECS
            {
                let wait =
                    player.last_point_purchase_time + POINT_MINT_COOLDOWN_SECS - time_stamp;
                return Err(format!(
                    "Points recruiting is on cooldown — try again in {} minutes, or pay with CTSI",
                    wait / 60 + 1
                ));
            }
            let price = points_price_for(player, base_price);
            if player.points < price {
                return Err(format!(
                    "This recruit costs {} points at your current premium — you have {}",
                    price, player.points
                ));
            }
            player.points -= price;
            player.point_purchase_count += 1;
            player.last_point_purchase_time = time_stamp;
        }
        MintCurrency::Ctsi => {
            let price = ctsi_price_for(base_price, points_rate);
            if player.cartesi_token_balance < price {
                return Err(format!(
                    "This recruit costs {:.2} CTSI — you have {:.2}. Deposit more tokens first",
                    price, player.cartesi_token_balance
                ));
            }
            player.cartesi_token_balance -= price;
            *profit_from_points_purchase += price;
        }
    }

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
