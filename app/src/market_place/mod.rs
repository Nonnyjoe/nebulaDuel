use crate::game_characters::{confirm_ownership, Character};
use crate::players_profile::{find_player, remove_character, Player};
use crate::storage::*;
use crate::structures::emit_voucher;
extern crate ethabi;
use ethabi::{Function, Param, ParamType, Token};

#[derive(Debug, PartialEq, Clone)]
pub struct SaleDetails {
    pub character_id: u128,
    /// Listing price in integer CTSI base units (wei).
    pub price: u128,
    pub seller: String,
}

pub fn deposit(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    amount: u128,
) -> Result<(), String> {
    let player = find_player(all_players, wallet_address)
        .ok_or("Couldn't find player, please register first")?;
    player.cartesi_token_balance = player.cartesi_token_balance.saturating_add(amount);
    Ok(())
}

pub async fn withdraw(
    storage: &mut Storage,
    wallet_address: String,
    amount: u128,
) -> Result<(), String> {
    if amount == 0 {
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
    amount: u128,
) -> Result<(), String> {
    if amount == 0 {
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

/// Split a sale price into (platform fee, seller proceeds) using basis points.
/// Integer-only: every base unit is accounted for (platform + seller == price),
/// and the fee is capped at 100%.
pub fn split_fee(price: u128, fee_bps: u128) -> (u128, u128) {
    let platform = price.saturating_mul(fee_bps.min(10_000)) / 10_000;
    (platform, price - platform)
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
    price: u128,
) -> Result<(), String> {
    if price == 0 {
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
    price: u128,
) -> Result<(), String> {
    if price == 0 {
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

/// Buy a P2P listing with deposited CTSI. The platform keeps
/// `fee_bps` basis points (e.g. 300 = 3%) and the seller receives the rest.
pub fn buy_character(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    listed_characters: &mut Vec<SaleDetails>,
    wallet_address: String,
    character_id: u128,
    profit_from_p2p_sales: &mut u128,
    fee_bps: u128,
) -> Result<(), String> {
    let list_index = listed_characters
        .iter()
        .position(|c| c.character_id == character_id)
        .ok_or("Character not listed")?;

    let listing = listed_characters[list_index].clone();

    if listing.seller.to_lowercase() == wallet_address.to_lowercase() {
        return Err("You cannot buy your own listing".to_string());
    }

    // The seller must STILL own the character (it could have been withdrawn
    // as an NFT after listing). Stale listings are removed instead of
    // charging the buyer.
    let still_owned = all_characters
        .iter()
        .any(|c| c.id == character_id && c.owner.to_lowercase() == listing.seller.to_lowercase());
    if !still_owned {
        listed_characters.remove(list_index);
        return Err("Listing was stale (seller no longer owns this character) and has been removed".to_string());
    }

    // Validate buyer funds before mutating anything.
    {
        let buyer = find_player(all_players, wallet_address.clone())
            .ok_or("Buyer not registered, please register first")?;
        if buyer.cartesi_token_balance < listing.price {
            return Err(format!(
                "This warrior costs {} CTSI (base units) — you have {}. Deposit more tokens first",
                listing.price, buyer.cartesi_token_balance
            ));
        }
    }
    find_player(all_players, listing.seller.clone())
        .ok_or("Seller profile not found")?;

    // Integer fee math (basis points) — no float rounding, no lost wei.
    let (platform_cut, seller_cut) = split_fee(listing.price, fee_bps);

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
        seller.increase_cartesi_token_balance(seller_cut);
        remove_character(
            seller,
            all_characters,
            wallet_address.clone(),
            character_id,
        );
    }
    *profit_from_p2p_sales = profit_from_p2p_sales.saturating_add(platform_cut);
    listed_characters.remove(list_index);
    Ok(())
}

/// Remove your own listing from the marketplace.
pub fn delist_character(
    listed_characters: &mut Vec<SaleDetails>,
    wallet_address: String,
    character_id: u128,
) -> Result<(), String> {
    let index = listed_characters
        .iter()
        .position(|c| c.character_id == character_id)
        .ok_or("Character not listed")?;

    if listed_characters[index].seller.to_lowercase() != wallet_address.to_lowercase() {
        return Err("Only the seller can delist this character".to_string());
    }
    listed_characters.remove(index);
    Ok(())
}

pub fn purchase_points(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    amount: u128,
    points_rate: f64,
    profit_from_points_purchase: &mut u128,
) -> Result<(), String> {
    if amount == 0 {
        return Err("Purchase amount must be positive".to_string());
    }
    let player = find_player(all_players, wallet_address)
        .ok_or("Couldn't find player, please register first")?;

    if player.cartesi_token_balance < amount {
        return Err("Insufficient cartesi token balance, please deposit first".to_string());
    }
    player.reduce_cartesi_token_balance(amount);
    player.points += calculate_points(amount, points_rate);
    *profit_from_points_purchase = profit_from_points_purchase.saturating_add(amount);
    Ok(())
}

/// Points minted per CTSI base unit spent. `points_rate` is a config
/// multiplier (not money), so the f64→u128 floor here is intentional.
fn calculate_points(cartesi_token_amount: u128, points_rate: f64) -> u128 {
    (cartesi_token_amount as f64 * points_rate) as u128
}

/// Emit a v2 voucher instructing the CTSI ERC-20 contract to transfer
/// `amount` to `recipient` when executed on L1. Public so admin treasury
/// withdrawals can emit real vouchers too.
pub async fn transfer_token(
    storage: &mut Storage,
    recipient: String,
    amount: u128,
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

    // Balances are integer base units (wei) — forward them to the ERC-20
    // transfer with full u128 precision.
    let transfer_payload = transfer_function
        .encode_input(&[
            Token::Address(recipient_address),
            Token::Uint(amount.into()),
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

/// Emit a v2 voucher that mints the withdrawn character as a Tableland NFT by
/// calling `entrypoint(...)` on the Nebula ERC-721 contract. The Application
/// contract executes the voucher, so it must be registered as the NFT's
/// `dappAddress`. This closes the on-chain side of the character→NFT bridge.
pub async fn mint_nft_voucher(
    storage: &mut Storage,
    to: &str,
    character: &Character,
) -> Result<(), String> {
    #[allow(deprecated)]
    let entrypoint = Function {
        name: "entrypoint".to_owned(),
        inputs: vec![
            Param { name: "to".into(), kind: ParamType::Address, internal_type: None },
            Param { name: "_tokenid".into(), kind: ParamType::Uint(256), internal_type: None },
            Param { name: "_name".into(), kind: ParamType::String, internal_type: None },
            Param { name: "_image".into(), kind: ParamType::String, internal_type: None },
            Param { name: "health".into(), kind: ParamType::Uint(256), internal_type: None },
            Param { name: "strength".into(), kind: ParamType::Uint(256), internal_type: None },
            Param { name: "attack".into(), kind: ParamType::Uint(256), internal_type: None },
            Param { name: "speed".into(), kind: ParamType::Uint(256), internal_type: None },
            Param { name: "superPower".into(), kind: ParamType::String, internal_type: None },
            Param { name: "totalWins".into(), kind: ParamType::Uint(256), internal_type: None },
            Param { name: "totalLoss".into(), kind: ParamType::Uint(256), internal_type: None },
        ],
        outputs: vec![],
        state_mutability: ethabi::StateMutability::NonPayable,
        constant: Some(false),
    };

    let to_address = to
        .parse()
        .map_err(|_| "Invalid recipient address for NFT mint".to_string())?;

    let payload = entrypoint
        .encode_input(&[
            Token::Address(to_address),
            Token::Uint(character.id.into()),
            Token::String(character.name.clone()),
            Token::String(String::new()),
            Token::Uint(character.health.into()),
            Token::Uint(character.strength.into()),
            Token::Uint(character.attack.into()),
            Token::Uint(character.speed.into()),
            Token::String(crate::campaign::power_name(&character.super_power).to_string()),
            Token::Uint(character.total_wins.into()),
            Token::Uint(character.total_losses.into()),
        ])
        .map_err(|e| format!("NFT mint ABI encoding failed: {}", e))?;

    let payload_hex = format!("0x{}", hex::encode(&payload));
    let destination = storage.nebula_nft_address.clone();
    emit_voucher(&destination, &payload_hex, "0x0", &storage.server_addr)
        .map_err(|e| format!("NFT mint voucher request failed: {}", e))?;
    println!("NFT mint voucher emitted: token {} -> {}", character.id, to);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fee_split_is_lossless_and_capped() {
        // 3% of 1000 = 30 platform, 970 seller; nothing lost.
        let (p, s) = split_fee(1000, 300);
        assert_eq!((p, s), (30, 970));
        assert_eq!(p + s, 1000);
        // Odd amounts: integer floor on the fee, seller gets the remainder.
        let (p2, s2) = split_fee(1001, 300);
        assert_eq!(p2 + s2, 1001);
        // Fee capped at 100%.
        let (p3, s3) = split_fee(500, 50_000);
        assert_eq!((p3, s3), (500, 0));
        // Zero fee.
        assert_eq!(split_fee(777, 0), (0, 777));
    }

    #[test]
    fn calculate_points_floors_cleanly() {
        // 5 base units * rate 100 = 500 points.
        assert_eq!(calculate_points(5, 100.0), 500);
        assert_eq!(calculate_points(0, 100.0), 0);
    }
}
