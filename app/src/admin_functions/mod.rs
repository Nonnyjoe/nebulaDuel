pub fn change_admin_address(
    admin_address: &mut String,
    caller_address: String,
    new_admin_address: String,
) {
    if caller_address == *admin_address {
        *admin_address = new_admin_address;
    } else {
        println!("Only the admin can change the admin address");
    }
}

pub fn set_cartesi_token_address(
    admin_address: &mut String,
    caller_address: String,
    cartesi_token_address: &mut String,
    new_cartesi_token_address: String,
) {
    if caller_address == *admin_address {
        *cartesi_token_address = new_cartesi_token_address;
    } else {
        println!("Only the admin can change the admin address");
    }
}

pub fn set_relayer_address(
    admin_address: &mut String,
    caller_address: String,
    relayer_address: &mut String,
    new_relayer_address: String,
) {
    if caller_address == *admin_address {
        *relayer_address = new_relayer_address;
    } else {
        println!("Only the admin can change the admin address");
    }
}

pub fn set_nebula_token_address(
    admin_address: &mut String,
    caller_address: String,
    nebula_token_address: &mut String,
    new_nebula_token_address: String,
) {
    if caller_address == *admin_address {
        *nebula_token_address = new_nebula_token_address;
    } else {
        println!("Only the admin can change the admin address");
    }
}

pub fn withdraw_profit_from_stake(
    admin_address: &mut String,
    caller_address: String,
    profit_from_stake: &mut f64,
    amount: f64,
) {
    match check_is_admin(caller_address.clone(), admin_address.clone()) {
        Some(x) => {
            if amount < *profit_from_stake {
                println!("Insufficient amount to withdraw");
            } else {
                *profit_from_stake -= amount;
                // Emit a voucher to pay the admin.
            }
        }
        None => println!("ONLY ADMIN CAN CALL THIS FUNCTION"),
    }
}

pub fn withdraw_profit_from_p2p_sales(
    admin_address: &mut String,
    caller_address: String,
    profit_from_p2p_sales: &mut f64,
    amount: f64,
) {
    match check_is_admin(caller_address.clone(), admin_address.clone()) {
        Some(x) => {
            if amount < *profit_from_p2p_sales {
                println!("Insufficient amount to withdraw");
            } else {
                *profit_from_p2p_sales -= amount;
                // Emit a voucher to pay the admin.
            }
        }
        None => println!("ONLY ADMIN CAN CALL THIS FUNCTION"),
    }
}

pub fn withdraw_profit_from_points_purchase(
    admin_address: &mut String,
    caller_address: String,
    profit_from_points_purchase: &mut f64,
    amount: f64,
) {
    match check_is_admin(caller_address.clone(), admin_address.clone()) {
        Some(x) => {
            if amount < *profit_from_points_purchase {
                println!("Insufficient amount to withdraw");
            } else {
                *profit_from_points_purchase -= amount;
                // Emit a voucher to pay the admin.
            }
        }
        None => println!("ONLY ADMIN CAN CALL THIS FUNCTION"),
    }
}

pub fn change_points_rate(
    admin_address: &mut String,
    caller_address: String,
    points_rate: &mut f64,
    new_points_rate: f64,
) {
    if caller_address == *admin_address {
        *points_rate = new_points_rate;
    } else {
        println!("Only the admin can change the admin address");
    }
}

fn check_is_admin(caller: String, admin_add: String) -> Option<bool> {
    if caller == admin_add {
        return Some(true);
    } else {
        println!("Only the admin can change the admin address");
        return None;
    }
}
