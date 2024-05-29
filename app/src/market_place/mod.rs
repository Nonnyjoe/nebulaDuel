use crate::players_profile::{find_player, Player, add_character, remove_character};
use crate::game_characters::{SuperPower, Character, purchase_team, get_characters, select_fighters, confirm_ownership, get_character_details};

#[derive(Debug, PartialEq, Clone)]
pub struct SaleDetails {
    pub character_id: u128,
    pub price: f64,
    pub seller: String,
}

pub fn deposit (all_players: &mut Vec<Player>, wallet_address: String, amount: f64) -> Option<&mut Player> {
    match find_player(all_players, wallet_address){
        Some(player) => {
            player.cartesi_token_balance += amount;
            return Some(player);
        },
        None => {
            panic!("Couldn't find player, please register!!")
        }
    }
}

pub fn withdraw (all_players: &mut Vec<Player>, wallet_address: String, amount: f64) -> Option<&mut Player> {
    match find_player(all_players, wallet_address){
        Some(player) => {
            if player.cartesi_token_balance < amount {
                panic!("Insufficient token balance");
            } else {
                player.cartesi_token_balance -= amount;
                // Emit a voucher to pay the user.
            }
            return Some(player);
        },
        None => {
            panic!("Couldn't find player, please register!!")
        }
    }
}

pub fn withdraw_character_as_nft(all_players: &mut Vec<Player>, all_characters: &mut Vec<Character>, wallet_address: String, character_id: u128, all_offchain_characters: &mut Vec<u128>) {

    match find_player(all_players, wallet_address){
        Some(player) => {
            player.remove_character(character_id);
            all_offchain_characters.push(character_id);

            for character in all_characters {
                if character.id == character_id {
                   character.owner = String::from("0xOffChain");
                }
            }
            // Emit a voucher to transfer an nft with the if of the character id to the user;
        },
        None => {
            panic!("Couldn't find player, please register!!")
        }
    }
}

pub fn deposit_character_as_nft(all_players: &mut Vec<Player>, all_characters: &mut Vec<Character>, wallet_address: String, character_id: u128, all_offchain_characters: &mut Vec<u128>) {
    match find_player(all_players, wallet_address.clone()){
        Some(player) => {
            player.add_character(character_id);
            for (index, character) in all_offchain_characters.iter().enumerate() {
                if *character == character_id {
                    all_offchain_characters.remove(index);
                    break;
                }
            }
            for character in all_characters {
                if character.id == character_id {
                   character.owner = String::from(wallet_address.clone());
                }
            }
        },
        None => {
            panic!("Couldn't find player, please register!!")
        }
    }
}

pub fn transfer_tokens(all_players: &mut Vec<Player>, wallet_address: String, receiver_address: String, amount: f64) {
    let sender_index = all_players.iter().position(|player| player.wallet_address == wallet_address);
    let receiver_index = all_players.iter().position(|player| player.wallet_address == receiver_address);

    match sender_index {
        Some(s_index) => {
            match receiver_index {
                Some(r_index) => {
                    // Ensure sender and receiver are not the same
                    if s_index != r_index {
                        let (sender, receiver) = if s_index < r_index {
                            let (left, right) = all_players.split_at_mut(r_index);
                            (&mut left[s_index], &mut right[0])
                        } else {
                            let (left, right) = all_players.split_at_mut(s_index);
                            (&mut right[0], &mut left[r_index])
                        };
                        
                        if sender.cartesi_token_balance >= amount {
                            sender.cartesi_token_balance -= amount;
                            receiver.cartesi_token_balance += amount;
                        } else {
                            panic!("Sender has insufficient balance")
                        }
                    } else {
                        panic!("Sender and receiver cannot be the same")
                    }
                },
                None => {
                    panic!("Receiver address could not be found, please register!!")
                }
            }
        },
        None => {
            panic!("Couldn't find sender address, please register!!")
        }
    }
}


fn assert_not_listed(character_id: u128, listed_characters: &mut Vec<SaleDetails>) {
    for character in listed_characters {
        if character.character_id == character_id {
            panic!("Character already listed");
        }
    }
}

pub fn list_character(all_characters: &mut Vec<Character> , all_players: &mut Vec<Player>, listed_characters: &mut Vec<SaleDetails>, wallet_address: String, character_id: u128, price: f64)  {
    let _selected_character_id = confirm_ownership(all_characters, all_players, wallet_address.clone(), character_id);
    assert_not_listed(character_id, listed_characters);
    let sales_details = SaleDetails{character_id, price, seller: wallet_address};
    listed_characters.push(sales_details);
}

pub fn modify_list_price(listed_characters: &mut Vec<SaleDetails>, wallet_address: String, character_id: u128, price: f64) -> &mut Vec<SaleDetails> {
    let mut found_character: bool = false;
    for character in listed_characters.iter_mut() {
        if character.character_id == character_id {
            if character.seller == wallet_address {
                character.price = price;
            } else {
                panic!("Not initial Lister");
            }
            found_character = true;
        }
    } if found_character {
        return listed_characters;
    } else {
        panic!("Character not Listed");
    }
}

pub fn buy_character<'a>(all_players: &'a mut Vec<Player>, all_characters: &mut Vec<Character>, listed_characters: &mut Vec<SaleDetails>, wallet_address: String, character_id: u128, profit_from_p2p_sales: &mut f64) {
    let mut list_index: Option<usize> = None;
    let mut found_character: bool = false;
        for (index, character) in listed_characters.iter_mut().enumerate() {
            if character.character_id == character_id {
                let mut traders = extract_traders(all_players, &wallet_address, &character.seller);
                traders[0].reduce_cartesi_token_balance(character.price);
                traders[0].add_character(character_id);
                found_character = true;
                match find_player(all_players, character.seller.clone()) {
                    Some(seller) => {
                        seller.increase_cartesi_token_balance(character.price * 0.97);
                        *profit_from_p2p_sales += character.price * 0.03;
                        remove_character(seller,  all_characters, wallet_address.clone(), character.character_id);
                        list_index= Some(index.clone());
                    },
                    None => {
                        panic!("Couldn't find seller, please register!!")
                    }
                }
            } 
        };
    if found_character {
        match list_index {
            Some(index) => {
                listed_characters.remove(index);
            },
            None => {
                panic!("Character not listed");
            }
        }
    } else {
        panic!("Character not Listed");
    }
}


pub fn purchase_points(all_players: &mut Vec<Player>, wallet_address: String, amount: f64, points_rate: f64, profit_from_points_purchase : &mut f64) {
    match find_player(all_players, wallet_address){
        Some(player) => {
            if player.cartesi_token_balance >= amount {
                player.reduce_cartesi_token_balance(amount);
                let obtained_points = calculate_points(amount, points_rate);
                player.points += obtained_points;
                *profit_from_points_purchase += amount;
            } else {
                panic!("Insufficient cartesi tokeen balance, please deposit!!")
            }
        },
        None => {
            panic!("Couldn't find player, please register!!")
        }
    }
}

fn calculate_points(cartesi_token_amount: f64, points_rate: f64) -> u128 {
    let obtained_points = cartesi_token_amount * points_rate;
    return obtained_points as u128;
}


fn extract_traders<'a>(all_players: &'a mut Vec<Player>, buyer_address: &String, seller_address: &String) -> Vec<&'a mut Player> {
    let mut traders: Vec<&'a mut Player> = Vec::new();
    let mut buyer_profile: Option<&mut Player> = None;
    let mut seller_profile: Option<&mut Player> = None;
    for player in all_players.iter_mut() {
        if player.wallet_address == *buyer_address {
            buyer_profile = Some(player);
        } else if player.wallet_address == *seller_address {
            seller_profile = Some(player);
        }
    }

    if buyer_profile.is_none() || seller_profile.is_none() {
        panic!("Couldn't find complete traders, please register!!")
    }
    traders.push(buyer_profile.unwrap());
    traders.push(seller_profile.unwrap());
    return traders;
}
