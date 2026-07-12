/// Admin-gated state mutations. Every function validates the caller against
/// the stored admin address and returns Err on unauthorized or invalid input
/// so the router can reject the input instead of silently accepting it.

fn require_admin(caller: &str, admin_address: &str) -> Result<(), String> {
    if caller.to_lowercase() == admin_address.to_lowercase() {
        Ok(())
    } else {
        Err("Only the admin can call this function".to_string())
    }
}

pub fn change_admin_address(
    admin_address: &mut String,
    caller_address: String,
    new_admin_address: String,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if !is_address_like(&new_admin_address) {
        return Err("Invalid admin address".to_string());
    }
    *admin_address = new_admin_address.to_lowercase();
    Ok(())
}

pub fn set_cartesi_token_address(
    admin_address: &mut String,
    caller_address: String,
    cartesi_token_address: &mut String,
    new_cartesi_token_address: String,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if !is_address_like(&new_cartesi_token_address) {
        return Err("Invalid token address".to_string());
    }
    *cartesi_token_address = new_cartesi_token_address.to_lowercase();
    Ok(())
}

pub fn set_relayer_address(
    admin_address: &mut String,
    caller_address: String,
    relayer_address: &mut String,
    new_relayer_address: String,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if !is_address_like(&new_relayer_address) {
        return Err("Invalid relayer address".to_string());
    }
    *relayer_address = new_relayer_address.to_lowercase();
    Ok(())
}

pub fn set_nebula_token_address(
    admin_address: &mut String,
    caller_address: String,
    nebula_token_address: &mut String,
    new_nebula_token_address: String,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if !is_address_like(&new_nebula_token_address) {
        return Err("Invalid token address".to_string());
    }
    *nebula_token_address = new_nebula_token_address.to_lowercase();
    Ok(())
}

pub fn withdraw_profit_from_stake(
    admin_address: &mut String,
    caller_address: String,
    profit_from_stake: &mut u128,
    amount: u128,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if amount == 0 {
        return Err("Withdrawal amount must be positive".to_string());
    }
    if amount > *profit_from_stake {
        return Err("Insufficient stake profit to withdraw".to_string());
    }
    *profit_from_stake -= amount;
    Ok(())
}

pub fn withdraw_profit_from_p2p_sales(
    admin_address: &mut String,
    caller_address: String,
    profit_from_p2p_sales: &mut u128,
    amount: u128,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if amount == 0 {
        return Err("Withdrawal amount must be positive".to_string());
    }
    if amount > *profit_from_p2p_sales {
        return Err("Insufficient p2p sales profit to withdraw".to_string());
    }
    *profit_from_p2p_sales -= amount;
    Ok(())
}

pub fn withdraw_profit_from_points_purchase(
    admin_address: &mut String,
    caller_address: String,
    profit_from_points_purchase: &mut u128,
    amount: u128,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if amount == 0 {
        return Err("Withdrawal amount must be positive".to_string());
    }
    if amount > *profit_from_points_purchase {
        return Err("Insufficient points-purchase profit to withdraw".to_string());
    }
    *profit_from_points_purchase -= amount;
    Ok(())
}

pub fn change_points_rate(
    admin_address: &mut String,
    caller_address: String,
    points_rate: &mut f64,
    new_points_rate: f64,
) -> Result<(), String> {
    require_admin(&caller_address, admin_address)?;
    if new_points_rate <= 0.0 {
        return Err("Points rate must be positive".to_string());
    }
    *points_rate = new_points_rate;
    Ok(())
}

/// Light sanity check for EVM address strings: 0x prefix + 40 hex chars.
fn is_address_like(s: &str) -> bool {
    let s = s.trim();
    s.len() == 42
        && s.starts_with("0x")
        && s[2..].chars().all(|c| c.is_ascii_hexdigit())
}
