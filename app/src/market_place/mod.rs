use crate::game_characters::{confirm_ownership, Character};
use crate::players_profile::{find_player, remove_character, Player};
use crate::storage::*;
use crate::structures::emit_voucher;
extern crate ethabi;
use ethabi::{Function, Param, ParamType, Token};

#[derive(Debug, PartialEq, Clone)]
pub struct SaleDetails {
    pub character_id: u128,
    pub price: f64,
    pub seller: String,
}

pub fn deposit(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    amount: f64,
) -> Result<(), String> {
    let player = find_player(all_players, wallet_address)
        .ok_or("Couldn't find player, please register first")?;
    player.cartesi_token_balance += amount;
    Ok(())
}

pub async fn withdraw(
    storage: &mut Storage,
    wallet_address: String,
    amount: f64,
) -> Result<(), String> {
    if amount <= 0.0 {
        return Err("Withdrawal amount must be positive".to_string());
    }

    {
        let player = find_player(&mut storage.all_players, wallet_address.clone())
            .ok_or("Couldn't find player, please register first")?;
        if player.cartesi_token_balance < amount {
            return Err("Insufficient token balance".to_string());
        }
        player.cartesi_token_balance -= amount;
    }

    // Emit a voucher to pay the user. If the voucher emission fails, roll the
    // balance back so state stays consistent.
    match transfer_token(storage, wallet_address.clone(), amount).await {
        Ok(()) => Ok(()),
        Err(e) => {
            if let Some(player) = find_player(&mut storage.all_players, wallet_address) {
                player.cartesi_token_balance += amount;
            }
            Err(e)
        }
    }
}

pub fn withdraw_character_as_nft(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    wallet_address: String,
    character_id: u128,
    all_offchain_characters: &mut Vec<u128>,
) -> Result<(), String> {
    // Ownership must be confirmed before any mutation.
    confirm_ownership(
        all_characters,
        all_players,
        wallet_address.clone(),
        character_id,
    )?;

    let player = find_player(all_players, wallet_address)
        .ok_or("Couldn't find player, please register first")?;

    player.remove_character(character_id);
    all_offchain_characters.push(character_id);

    for character in all_characters {
        if character.id == character_id {
            character.owner = String::from("0xOffChain");
        }
    }
    Ok(())
}

pub fn deposit_character_as_nft(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    wallet_address: String,
    character_id: u128,
    all_offchain_characters: &mut Vec<u128>,
) -> Result<(), String> {
    let player = find_player(all_players, wallet_address.clone())
        .ok_or("Couldn't find player, please register first")?;

    player.add_character(character_id);
    all_offchain_characters.retain(|c| *c != character_id);

    for character in all_characters {
        if character.id == character_id {
            character.owner = wallet_address.clone();
        }
    }
    Ok(())
}

pub fn transfer_tokens(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    receiver_address: String,
    amount: f64,
) -> Result<(), String> {
    if amount <= 0.0 {
        return Err("Transfer amount must be positive".to_string());
    }

    let sender_index = all_players
        .iter()
        .position(|p| p.wallet_address.to_lowercase() == wallet_address.to_lowercase())
        .ok_or("Couldn't find sender address, please register first")?;
    let receiver_index = all_players
        .iter()
        .position(|p| p.wallet_address.to_lowercase() == receiver_address.to_lowercase())
        .ok_or("Receiver address could not be found, please register first")?;

    if sender_index == receiver_index {
        return Err("Sender and receiver cannot be the same".to_string());
    }

    if all_players[sender_index].cartesi_token_balance < amount {
        return Err("Sender has insufficient balance".to_string());
    }

    all_players[sender_index].cartesi_token_balance -= amount;
    all_players[receiver_index].cartesi_token_balance += amount;
    Ok(())
}

fn assert_not_listed(
    character_id: u128,
    listed_characters: &Vec<SaleDetails>,
) -> Result<(), String> {
    if listed_characters
        .iter()
        .any(|c| c.character_id == character_id)
    {
        return Err("Character already listed".to_string());
    }
    Ok(())
}

pub fn list_character(
    all_characters: &mut Vec<Character>,
    all_players: &mut Vec<Player>,
    listed_characters: &mut Vec<SaleDetails>,
    wallet_address: String,
    character_id: u128,
    price: f64,
) -> Result<(), String> {
    if price <= 0.0 {
        return Err("List price must be positive".to_string());
    }
    confirm_ownership(
        all_characters,
        all_players,
        wallet_address.clone(),
        character_id,
    )?;
    assert_not_listed(character_id, listed_characters)?;
    listed_characters.push(SaleDetails {
        character_id,
        price,
        seller: wallet_address,
    });
    Ok(())
}

pub fn modify_list_price(
    listed_characters: &mut Vec<SaleDetails>,
    wallet_address: String,
    character_id: u128,
    price: f64,
) -> Result<(), String> {
    if price <= 0.0 {
        return Err("List price must be positive".to_string());
    }
    let listing = listed_characters
        .iter_mut()
        .find(|c| c.character_id == character_id)
        .ok_or("Character not listed")?;

    if listing.seller.to_lowercase() != wallet_address.to_lowercase() {
        return Err("Only the original lister can modify the price".to_string());
    }
    listing.price = price;
    Ok(())
}

pub fn buy_character(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    listed_characters: &mut Vec<SaleDetails>,
    wallet_address: String,
    character_id: u128,
    profit_from_p2p_sales: &mut f64,
) -> Result<(), String> {
    let list_index = listed_characters
        .iter()
        .position(|c| c.character_id == character_id)
        .ok_or("Character not listed")?;

    let listing = listed_characters[list_index].clone();

    if listing.seller.to_lowercase() == wallet_address.to_lowercase() {
        return Err("You cannot buy your own listing".to_string());
    }

    // Validate buyer funds before mutating anything.
    {
        let buyer = find_player(all_players, wallet_address.clone())
            .ok_or("Buyer not registered, please register first")?;
        if buyer.cartesi_token_balance < listing.price {
            return Err("Insufficient balance to buy this character".to_string());
        }
    }
    find_player(all_players, listing.seller.clone())
        .ok_or("Seller profile not found")?;

    // Apply the trade.
    {
        let buyer = find_player(all_players, wallet_address.clone())
            .ok_or("Buyer not registered")?;
        buyer.reduce_cartesi_token_balance(listing.price);
        buyer.add_character(character_id);
    }
    {
        let seller = find_player(all_players, listing.seller.clone())
            .ok_or("Seller profile not found")?;
        seller.increase_cartesi_token_balance(listing.price * 0.97);
        remove_character(
            seller,
            all_characters,
            wallet_address.clone(),
            character_id,
        );
    }
    *profit_from_p2p_sales += listing.price * 0.03;
    listed_characters.remove(list_index);
    Ok(())
}

pub fn purchase_points(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    amount: f64,
    points_rate: f64,
    profit_from_points_purchase: &mut f64,
) -> Result<(), String> {
    if amount <= 0.0 {
        return Err("Purchase amount must be positive".to_string());
    }
    let player = find_player(all_players, wallet_address)
        .ok_or("Couldn't find player, please register first")?;

    if player.cartesi_token_balance < amount {
        return Err("Insufficient cartesi token balance, please deposit first".to_string());
    }
    player.reduce_cartesi_token_balance(amount);
    player.points += calculate_points(amount, points_rate);
    *profit_from_points_purchase += amount;
    Ok(())
}

fn calculate_points(cartesi_token_amount: f64, points_rate: f64) -> u128 {
    (cartesi_token_amount * points_rate) as u128
}

/// Emit a v2 voucher instructing the CTSI ERC-20 contract to transfer
/// `amount` to `recipient` when executed on L1.
async fn transfer_token(
    storage: &mut Storage,
    recipient: String,
    amount: f64,
) -> Result<(), String> {
    #[allow(deprecated)]
    let transfer_function = Function {
        name: "transfer".to_owned(),
        inputs: vec![
            Param {
                name: "recipient".to_owned(),
                kind: ParamType::Address,
                internal_type: None,
            },
            Param {
                name: "amount".to_owned(),
                kind: ParamType::Uint(256),
                internal_type: None,
            },
        ],
        outputs: vec![],
        state_mutability: ethabi::StateMutability::NonPayable,
        constant: Some(false),
    };

    let destination = storage.cartesi_token_address.clone();

    let recipient_address = recipient
        .parse()
        .map_err(|_| "Invalid recipient address".to_string())?;

    // Balances are tracked as whole token units; keep full integer precision
    // through u128 instead of truncating through u64.
    let amount_uint: u128 = amount as u128;

    let transfer_payload = transfer_function
        .encode_input(&[
            Token::Address(recipient_address),
            Token::Uint(amount_uint.into()),
        ])
        .map_err(|e| format!("ABI encoding failed: {}", e))?;

    let payload_hex = format!("0x{}", hex::encode(&transfer_payload));

    // Cartesi Rollups v2 vouchers require a `value` field (Wei forwarded with
    // the call). An ERC-20 transfer forwards no Ether.
    emit_voucher(&destination, &payload_hex, "0x0", &storage.server_addr)
        .map_err(|e| format!("Voucher request failed: {}", e))?;

    println!("Withdrawal voucher emitted for {} -> {}", amount, recipient);
    Ok(())
}
