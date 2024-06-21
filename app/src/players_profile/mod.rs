use crate::game_characters::{SuperPower, Character, purchase_team, get_characters, select_fighters, confirm_ownership, get_character_details};


#[derive(Debug, PartialEq, Clone)]
pub struct Player {
    pub monika: String,
    pub wallet_address: String,
    pub avatar_url: String,
    pub characters: Vec<u128>,
    pub id: u128,
    pub points: u128,
    pub nebula_token_balance: u128,
    pub cartesi_token_balance: f64,
    pub total_battles: u128,
    pub total_wins: u128,
    pub total_losses: u128,
    pub total_ai_battles: u128,
    pub ai_battles_won: u128,
    pub ai_battles_losses: u128,
    pub transaction_history: Vec<UserTransaction>,

}



#[derive(Debug, PartialEq, Clone)]
pub struct UserTransaction {
    pub transaction_id: u128,
    pub method_called: String,
    // pub transaction_status: TransactionStatus,
    // pub payload: String,
}

impl Player {
    pub fn reduce_cartesi_token_balance(&mut self, amount: f64) {
        if self.cartesi_token_balance >= amount {
            self.cartesi_token_balance -= amount;
        } else {
            panic!("Insufficient nebula balance");
        }
    }

    pub fn increase_cartesi_token_balance(&mut self, amount: f64) {
        self.cartesi_token_balance += amount;
    }

    pub fn remove_character(&mut self, character_id: u128) {
        match find_index(&self.characters, &character_id) { 
            Some(index) => {
                self.characters.remove(index);
            },
            None => {
                panic!("Character not found");
            }
        }
    }

    pub fn add_character(&mut self, character_id: u128) {
        self.characters.push(character_id);
    }

    pub fn register_win(&mut self, all_characters: &mut Vec<Character>) -> &mut Self {
        self.total_battles += 1;
        self.total_wins += 1;
        for characters in self.characters.iter() {
            let character_details = get_character_details(all_characters, *characters);
            character_details.total_wins += 1;
            character_details.total_battles += 1;
        }
        return self;
    }

    pub fn register_loss(&mut self, all_characters: &mut Vec<Character>) -> &mut Self {
        self.total_battles += 1;
        self.total_losses += 1;
        for characters in self.characters.iter() {
            let character_details = get_character_details(all_characters, *characters);
            character_details.total_wins += 1;
            character_details.total_losses += 1;
        }
        return self;
    }

    pub fn register_transaction(&mut self, all_characters: &mut Vec<Character>, tx_id: u128, method_called: String) {
        let new_tx = UserTransaction {
            transaction_id: tx_id,
            method_called,
        };
        self.transaction_history.push(new_tx);
    }
}

pub fn find_player (all_players: &mut Vec<Player>, wallet_address: String) -> Option<&mut Player> {
   for player in all_players {
        if (player.wallet_address).to_lowercase() == wallet_address.to_lowercase() {
            return Some(player);
        }
   }
   return None;
}

pub fn create_player(monika: String, wallet_address: String, avatar_url: String, all_players: &mut Vec<Player>, total_players: &mut u128) -> Option<Player> {
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
                cartesi_token_balance: 0.0,
                total_battles: 0,
                total_wins: 0,
                total_losses: 0,
                total_ai_battles: 0,
                ai_battles_losses: 0,
                ai_battles_won: 0,
                transaction_history: Vec::new(),
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


pub fn modify_avatar(all_players: &mut Vec<Player>, wallet_address: String, new_avatar_uri: String) -> bool {
    if let Some(player) = find_player(all_players, wallet_address) {
        player.avatar_url = new_avatar_uri;
        true
    } else {
        false
    }
}

pub fn modify_monika(all_players: &mut Vec<Player>, wallet_address: String, new_monika: String) -> bool {
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
        },
        None => {
            panic!("Couldn't find player, please register!!")
        }
    }
}

pub fn remove_character(player: &mut Player, all_characters: &mut Vec<Character>, new_owner: String, character_id: u128) {
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
                panic!("Character with id {} not found", character_id);
            }

        },
        None => {
            panic!("User not owner of said character!!!");
        }
    }
}
