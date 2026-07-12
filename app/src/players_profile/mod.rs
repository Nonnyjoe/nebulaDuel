use crate::game_characters::{
    get_character_details,
    Character,
};

#[derive(Debug, PartialEq, Clone)]
pub struct Player {
    pub monika: String,
    pub wallet_address: String,
    pub avatar_url: String,
    pub characters: Vec<u128>,
    pub id: u128,
    pub points: u128,
    pub nebula_token_balance: u128,
    /// CTSI balance in integer base units (wei) — never f64, so fees, stakes
    /// and splits can't drift or truncate.
    pub cartesi_token_balance: u128,
    pub total_battles: u128,
    pub total_wins: u128,
    pub total_losses: u128,
    pub total_ai_battles: u128,
    pub ai_battles_won: u128,
    pub ai_battles_losses: u128,
    pub transaction_history: Vec<UserTransaction>,
    // --- Campaign mode ---
    /// Highest level cleared (0 = none).
    pub campaign_progress: u128,
    pub campaign_wins: u128,
    pub campaign_losses: u128,
    pub campaign_titles: Vec<String>,
    /// (level_id, attempt_count) pairs.
    pub campaign_attempts: Vec<(u128, u128)>,
    // --- Marketplace anti-farm tracking ---
    /// How many characters this player has minted with points (drives the
    /// escalating price premium).
    pub point_purchase_count: u128,
    /// Block timestamp of the last points-funded mint (drives the cooldown).
    pub last_point_purchase_time: u128,
    /// Whether the one-time starter team has been claimed.
    pub starter_team_claimed: bool,
    /// Battle charm inventory: (charm_id, count) pairs.
    pub charm_inventory: Vec<(u128, u128)>,
    // --- Daily return loop ---
    /// UTC-day index (block_timestamp / 86400) of the last claimed daily
    /// reward. 0 = never claimed.
    pub last_daily_claim_day: u128,
    /// Consecutive-day streak length (drives the escalating reward).
    pub daily_streak: u128,
}

/// Seconds in a day — the daily reward bucket is derived deterministically
/// from the block timestamp, so it needs no wall clock.
pub const SECONDS_PER_DAY: u128 = 86_400;

#[derive(Debug, PartialEq, Clone)]
pub struct UserTransaction {
    pub transaction_id: u128,
    pub method_called: String,
    // pub transaction_status: TransactionStatus,
    // pub payload: String,
}

impl Player {
    pub fn reduce_cartesi_token_balance(&mut self, amount: u128) {
        if self.cartesi_token_balance >= amount {
            self.cartesi_token_balance -= amount;
        } else {
            println!("Insufficient nebula balance");
        }
    }

    pub fn increase_cartesi_token_balance(&mut self, amount: u128) {
        self.cartesi_token_balance = self.cartesi_token_balance.saturating_add(amount);
    }

    pub fn remove_character(&mut self, character_id: u128) {
        match find_index(&self.characters, &character_id) {
            Some(index) => {
                self.characters.remove(index);
            }
            None => {
                println!("Character not found");
            }
        }
    }

    pub fn add_character(&mut self, character_id: u128) {
        self.characters.push(character_id);
    }

    /// Credits ONLY the fighters that actually fought (not the whole roster).
    pub fn register_win(&mut self, all_characters: &mut Vec<Character>, fighters: &[u128]) -> &mut Self {
        self.total_battles += 1;
        self.total_wins += 1;
        for id in fighters {
            if let Some(character_details) = get_character_details(all_characters, *id) {
                character_details.total_wins += 1;
                character_details.total_battles += 1;
                character_details.award_battle_xp(true);
            }
        }
        return self;
    }

    /// Credits ONLY the fighters that actually fought (not the whole roster).
    pub fn register_loss(&mut self, all_characters: &mut Vec<Character>, fighters: &[u128]) -> &mut Self {
        self.total_battles += 1;
        self.total_losses += 1;
        for id in fighters {
            if let Some(character_details) = get_character_details(all_characters, *id) {
                character_details.total_losses += 1;
                character_details.total_battles += 1;
                character_details.award_battle_xp(false);
            }
        }
        return self;
    }

    pub fn charm_count(&self, charm_id: u128) -> u128 {
        self.charm_inventory
            .iter()
            .find(|(id, _)| *id == charm_id)
            .map(|(_, n)| *n)
            .unwrap_or(0)
    }

    pub fn add_charms(&mut self, charm_id: u128, quantity: u128) {
        if let Some(entry) = self
            .charm_inventory
            .iter_mut()
            .find(|(id, _)| *id == charm_id)
        {
            entry.1 += quantity;
        } else {
            self.charm_inventory.push((charm_id, quantity));
        }
    }

    pub fn remove_charm(&mut self, charm_id: u128) {
        if let Some(entry) = self
            .charm_inventory
            .iter_mut()
            .find(|(id, _)| *id == charm_id)
        {
            entry.1 = entry.1.saturating_sub(1);
        }
    }

    /// Claim today's daily reward. Rewards escalate with a consecutive-day
    /// streak (capped) and reset if a day is missed. Deterministic in the block
    /// timestamp; can only be claimed once per UTC day.
    pub fn claim_daily(&mut self, time_stamp: u128) -> Result<(u128, u128), String> {
        if time_stamp == 0 {
            return Err("Daily reward needs a block timestamp".to_string());
        }
        let today = time_stamp / SECONDS_PER_DAY;
        if self.last_daily_claim_day == today {
            return Err("You already claimed today's reward — come back tomorrow".to_string());
        }
        // Continue the streak only if the previous claim was exactly yesterday.
        if self.last_daily_claim_day != 0 && self.last_daily_claim_day + 1 == today {
            self.daily_streak += 1;
        } else {
            self.daily_streak = 1;
        }
        self.last_daily_claim_day = today;
        // 50 base, +25 per consecutive day, capped at a 7-day streak (200).
        let tier = self.daily_streak.min(7);
        let reward = 50 + (tier - 1) * 25;
        self.points += reward;
        Ok((reward, self.daily_streak))
    }

    pub fn campaign_attempt_count(&self, level_id: u128) -> u128 {
        self.campaign_attempts
            .iter()
            .find(|(lvl, _)| *lvl == level_id)
            .map(|(_, n)| *n)
            .unwrap_or(0)
    }

    pub fn record_campaign_attempt(&mut self, level_id: u128) {
        if let Some(entry) = self
            .campaign_attempts
            .iter_mut()
            .find(|(lvl, _)| *lvl == level_id)
        {
            entry.1 += 1;
        } else {
            self.campaign_attempts.push((level_id, 1));
        }
    }

    pub fn register_transaction(
        &mut self,
        _all_characters: &mut Vec<Character>,
        tx_id: u128,
        method_called: String,
    ) {
        let new_tx = UserTransaction {
            transaction_id: tx_id,
            method_called,
        };
        self.transaction_history.push(new_tx);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn blank_player() -> Player {
        let mut players = Vec::new();
        let mut total = 0;
        create_player("p".into(), "0xabc".into(), "".into(), &mut players, &mut total).unwrap()
    }

    #[test]
    fn daily_streak_escalates_resets_and_blocks_double_claim() {
        let mut p = blank_player();
        // Day 10: first claim -> streak 1, reward 50.
        let (r1, s1) = p.claim_daily(10 * SECONDS_PER_DAY).unwrap();
        assert_eq!((r1, s1), (50, 1));
        // Same day -> rejected.
        assert!(p.claim_daily(10 * SECONDS_PER_DAY + 500).is_err());
        // Next day -> streak 2, reward 75.
        let (r2, s2) = p.claim_daily(11 * SECONDS_PER_DAY).unwrap();
        assert_eq!((r2, s2), (75, 2));
        // Skip a day -> streak resets to 1.
        let (r3, s3) = p.claim_daily(13 * SECONDS_PER_DAY).unwrap();
        assert_eq!((r3, s3), (50, 1));
    }

    #[test]
    fn daily_reward_caps_at_seven_day_streak() {
        let mut p = blank_player();
        let mut last = 0u128;
        for day in 1..=9u128 {
            let (reward, _) = p.claim_daily(day * SECONDS_PER_DAY).unwrap();
            last = reward;
        }
        // 7-day cap => 50 + 6*25 = 200, held for day 8 and 9.
        assert_eq!(last, 200);
    }
}

pub fn find_player(all_players: &mut Vec<Player>, wallet_address: String) -> Option<&mut Player> {
    for player in all_players {
        if (player.wallet_address).to_lowercase() == wallet_address.to_lowercase() {
            return Some(player);
        }
    }
    return None;
}

pub fn create_player(
    monika: String,
    wallet_address: String,
    avatar_url: String,
    all_players: &mut Vec<Player>,
    total_players: &mut u128,
) -> Option<Player> {
    match find_player(all_players, wallet_address.clone()) {
        Some(_player) => {
            println!("Address already Exists!");
            return None;
        }
        None => {
            *total_players += 1;
            let mut player = Player {
                monika: monika,
                wallet_address: wallet_address,
                avatar_url: avatar_url,
                characters: Vec::new(),
                id: *total_players,
                points: 1050,
                nebula_token_balance: 0,
                cartesi_token_balance: 0,
                total_battles: 0,
                total_wins: 0,
                total_losses: 0,
                total_ai_battles: 0,
                ai_battles_losses: 0,
                ai_battles_won: 0,
                transaction_history: Vec::new(),
                campaign_progress: 0,
                campaign_wins: 0,
                campaign_losses: 0,
                campaign_titles: Vec::new(),
                campaign_attempts: Vec::new(),
                point_purchase_count: 0,
                last_point_purchase_time: 0,
                starter_team_claimed: false,
                charm_inventory: Vec::new(),
                last_daily_claim_day: 0,
                daily_streak: 0,
            };

            if player.wallet_address == String::from("0xnebula") {
                player.points = 10000;
            }

            all_players.push(player.clone());

            println!("New Player Created!!");
            return Some(player);
        }
    }
}

pub fn get_profile(all_players: &mut Vec<Player>, wallet_address: String) -> Option<&mut Player> {
    return find_player(all_players, wallet_address);
}

pub fn modify_avatar(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    new_avatar_uri: String,
) -> bool {
    if let Some(player) = find_player(all_players, wallet_address) {
        player.avatar_url = new_avatar_uri;
        true
    } else {
        false
    }
}

pub fn modify_monika(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    new_monika: String,
) -> bool {
    if let Some(player) = find_player(all_players, wallet_address) {
        player.monika = new_monika;
        true
    } else {
        false
    }
}

fn find_index(vec: &Vec<u128>, item: &u128) -> Option<usize> {
    vec.iter().position(|x| *x == *item)
}

pub fn add_character(all_players: &mut Vec<Player>, wallet_address: String, character_id: u128) {
    match find_player(all_players, wallet_address.clone()) {
        Some(player) => {
            player.characters.push(character_id);
        }
        None => {
            println!("Couldn't find player, please register!!")
        }
    }
}

pub fn remove_character(
    player: &mut Player,
    all_characters: &mut Vec<Character>,
    new_owner: String,
    character_id: u128,
) {
    match find_index(&player.characters, &character_id) {
        Some(index) => {
            player.characters.remove(index);

            let mut selected_character: Option<&mut Character> = None;
            for character in all_characters {
                if character.id == character_id {
                    character.buy_character(new_owner.clone());
                    selected_character = Some(character);
                }
            }
            if selected_character.is_none() {
                println!("Character with id {} not found", character_id);
            }
        }
        None => {
            println!("User not owner of said character!!!");
        }
    }
}
