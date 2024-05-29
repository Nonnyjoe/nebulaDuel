pub fn change_admin_address(admin_address: &mut String, caller_address: String, new_admin_address: String) {
    if caller_address == *admin_address {
        *admin_address = new_admin_address;
    } else {
        panic!("Only the admin can change the admin address");
    }
}

pub fn set_cartesi_token_address(admin_address: &mut String, caller_address: String, cartesi_token_address: &mut String, new_cartesi_token_address: String) {
    if caller_address == *admin_address {
        *cartesi_token_address = new_cartesi_token_address;
    } else {
        panic!("Only the admin can change the admin address");
    }
}

pub fn set_nebula_token_address(admin_address: &mut String, caller_address: String, nebula_token_address: &mut String, new_nebula_token_address: String) {
    if caller_address == *admin_address {
        *nebula_token_address = new_nebula_token_address;
    } else {
        panic!("Only the admin can change the admin address");
    }
}

pub fn withdraw_profit_from_stake(admin_address: &mut String, caller_address: String,  profit_from_stake: &mut f64, amount: f64) {
    check_is_admin(caller_address.clone(), admin_address.clone());
    if amount < *profit_from_stake {
        panic!("Insufficient amount to withdraw");
    } else {
        *profit_from_stake -= amount;
        // Emit a voucher to pay the admin.
    }
}

pub fn withdraw_profit_from_p2p_sales(admin_address: &mut String, caller_address: String,  profit_from_p2p_sales: &mut f64, amount: f64) {
    check_is_admin(caller_address.clone(), admin_address.clone());
    if amount < *profit_from_p2p_sales {
        panic!("Insufficient amount to withdraw");
    } else {
        *profit_from_p2p_sales -= amount;
        // Emit a voucher to pay the admin.
    }
}

pub fn withdraw_profit_from_points_purchase (admin_address: &mut String, caller_address: String, profit_from_points_purchase: &mut f64, amount: f64) {
    check_is_admin(caller_address.clone(), admin_address.clone());
    if amount < *profit_from_points_purchase {
        panic!("Insufficient amount to withdraw");
    } else {
        *profit_from_points_purchase -= amount;
        // Emit a voucher to pay the admin.
    }
}

pub fn change_points_rate(admin_address: &mut String, caller_address: String, points_rate: &mut f64, new_points_rate: f64) {
    if caller_address == *admin_address {
        *points_rate = new_points_rate;
    } else {
        panic!("Only the admin can change the admin address");
    }
}


fn check_is_admin(caller: String, admin_add: String) -> bool {
    if caller == admin_add {
        return true
    } else {
        panic!("Only the admin can change the admin address");
    }
}