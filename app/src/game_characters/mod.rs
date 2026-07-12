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
    /// Seeded rarity tier rolled once at mint ("Common".."Legendary"). Drives
    /// the stat variance below, so two copies of the same template are no
    /// longer identical — and a well-rolled veteran is worth buying.
    pub rarity: String,
    /// Per-character progression earned by fighting. Levels grant small
    /// permanent stat boosts, so used characters accrue real value.
    pub level: u128,
    pub xp: u128,
}

impl Character {
    pub fn buy_character(&mut self, buyer_address: String) {
        self.owner = buyer_address;
    }

    /// Award XP for a battle (win pays more than a loss) and apply any level
    /// ups. Each level grants a small permanent stat boost. Deterministic and
    /// bounded — purely a function of current stats.
    pub fn award_battle_xp(&mut self, won: bool) {
        let gain = if won { XP_PER_WIN } else { XP_PER_LOSS };
        self.xp = self.xp.saturating_add(gain);
        while self.xp >= xp_to_next_level(self.level) {
            self.xp -= xp_to_next_level(self.level);
            self.level += 1;
            // Modest, predictable growth so leveling rewards play without
            // breaking the economy.
            self.health = self.health.saturating_add(4);
            self.strength = self.strength.saturating_add(1);
            self.attack = self.attack.saturating_add(1);
            if self.level % 3 == 0 {
                self.speed = self.speed.saturating_add(1);
            }
        }
    }
}

pub const XP_PER_WIN: u128 = 50;
pub const XP_PER_LOSS: u128 = 20;

/// XP required to advance FROM the given level. Gently escalating curve.
pub fn xp_to_next_level(level: u128) -> u128 {
    100 + level.saturating_sub(1).saturating_mul(40)
}

// ---------------------------------------------------------------------------
// Rarity rolls
//
// At mint each character rolls a per-stat multiplier in [90%, 110%] from a
// deterministic seed, and its rarity tier is derived from how lucky those
// rolls were. This makes duplicate templates differ and gives the marketplace
// a real reason to exist (buy a Legendary roll instead of gambling a mint).
// ---------------------------------------------------------------------------

fn rarity_from_avg(avg_pct: u128) -> &'static str {
    if avg_pct >= 108 {
        "Legendary"
    } else if avg_pct >= 104 {
        "Epic"
    } else if avg_pct >= 100 {
        "Rare"
    } else if avg_pct >= 96 {
        "Uncommon"
    } else {
        "Common"
    }
}

/// Apply a deterministic rarity roll to a freshly minted character, mutating
/// its stats and setting its rarity tier. Same seed -> same roll (replay-safe).
pub fn apply_rarity_roll(character: &mut Character, seed: u128) {
    let mut state = seed
        .wrapping_mul(6364136223846793005)
        .wrapping_add(1442695040888963407);
    let mut roll = || -> u128 {
        state = state
            .wrapping_mul(6364136223846793005)
            .wrapping_add(1442695040888963407);
        // multiplier in [90, 110]
        90 + ((state >> 33) % 21)
    };

    let hp = roll();
    let st = roll();
    let at = roll();
    let sp = roll();

    character.health = (character.health * hp / 100).max(1);
    character.strength = (character.strength * st / 100).max(1);
    character.attack = (character.attack * at / 100).max(1);
    character.speed = (character.speed * sp / 100).max(1);

    let avg = (hp + st + at + sp) / 4;
    character.rarity = rarity_from_avg(avg).to_string();
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
        rarity: String::from("Common"),
        level: 1,
        xp: 0,
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

/// CTSI price (integer base units) for a base points price at the given points
/// rate. `points_rate` is a config multiplier, not money, so flooring the
/// division is intentional and deterministic.
pub fn ctsi_price_for(base_price: u128, points_rate: f64) -> u128 {
    if points_rate <= 0.0 {
        return base_price;
    }
    (base_price as f64 / points_rate) as u128
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
    let seed = character.id;
    apply_rarity_roll(&mut character, seed);
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
    let (s1, s2, s3) = (character1.id, character2.id, character3.id);
    apply_rarity_roll(&mut character1, s1);
    apply_rarity_roll(&mut character2, s2);
    apply_rarity_roll(&mut character3, s3);

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
    profit_from_points_purchase: &mut u128,
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
                    "This recruit costs {} CTSI (base units) — you have {}. Deposit more tokens first",
                    price, player.cartesi_token_balance
                ));
            }
            player.cartesi_token_balance -= price;
            *profit_from_points_purchase = profit_from_points_purchase.saturating_add(price);
        }
    }

    character.owner = wallet_address.clone();
    *total_characters += 1;
    character.id = *total_characters;
    // Fold the timestamp into the seed so points/CTSI mints vary over time.
    let seed = character.id.wrapping_add(time_stamp);
    apply_rarity_roll(&mut character, seed);

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn points_premium_escalates_and_caps() {
        let mut p = crate::players_profile::Player {
            monika: "t".into(), wallet_address: "0x1".into(), avatar_url: "".into(),
            characters: vec![], id: 1, points: 0, nebula_token_balance: 0,
            cartesi_token_balance: 0, total_battles: 0, total_wins: 0,
            total_losses: 0, total_ai_battles: 0, ai_battles_won: 0,
            ai_battles_losses: 0, transaction_history: vec![],
            campaign_progress: 0, campaign_wins: 0, campaign_losses: 0,
            campaign_titles: vec![], campaign_attempts: vec![],
            point_purchase_count: 0, last_point_purchase_time: 0,
            starter_team_claimed: false, charm_inventory: vec![],
            last_daily_claim_day: 0, daily_streak: 0,
        };
        assert_eq!(points_price_for(&p, 100), 100);
        p.point_purchase_count = 2;
        assert_eq!(points_price_for(&p, 100), 130); // +15% each
        p.point_purchase_count = 1000;
        assert_eq!(points_price_for(&p, 100), 400); // capped at +300%
    }

    #[test]
    fn ctsi_price_uses_points_rate() {
        assert_eq!(ctsi_price_for(300, 100.0), 3); // integer base units
        assert_eq!(ctsi_price_for(300, 0.0), 300); // degenerate rate guard
    }

    fn template(id: u128) -> Character {
        let mut c = sort_characters(id).unwrap();
        c.id = id + 1;
        c
    }

    #[test]
    fn rarity_roll_is_deterministic_and_bounded() {
        let base = template(8); // Bone Collector: 93/12/15/8
        let mut a = base.clone();
        let mut b = base.clone();
        apply_rarity_roll(&mut a, 12345);
        apply_rarity_roll(&mut b, 12345);
        // Same seed -> identical roll (replay-safe).
        assert_eq!(a, b);
        // Stats stay within +/-10% of base, never zero.
        assert!(a.health >= base.health * 90 / 100 && a.health <= base.health * 110 / 100);
        assert!(a.strength >= 1 && a.attack >= 1 && a.speed >= 1);
        assert!(matches!(
            a.rarity.as_str(),
            "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary"
        ));
    }

    #[test]
    fn rarity_roll_varies_by_seed() {
        // Two different seeds should (across a spread) produce different stat
        // totals — proving duplicate templates are no longer identical.
        let base = template(5);
        let total = |seed: u128| {
            let mut c = base.clone();
            apply_rarity_roll(&mut c, seed);
            c.health + c.strength + c.attack + c.speed
        };
        let distinct: std::collections::HashSet<u128> =
            (0..40u128).map(total).collect();
        assert!(distinct.len() > 1);
    }

    #[test]
    fn xp_levels_up_and_boosts_stats() {
        let mut c = template(0);
        let (h0, s0, lvl0) = (c.health, c.strength, c.level);
        assert_eq!(lvl0, 1);
        // Two wins = 100 XP = exactly one level (xp_to_next(1) == 100).
        c.award_battle_xp(true);
        c.award_battle_xp(true);
        assert_eq!(c.level, 2);
        assert!(c.health > h0 && c.strength > s0);
        // A loss grants less XP than a win.
        assert_eq!(XP_PER_LOSS < XP_PER_WIN, true);
    }
}
