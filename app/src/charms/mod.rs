//! Battle Charms — consumable boosters purchasable with battle points or
//! deposited CTSI.
//!
//! Anti pay-to-win measures, enforced deterministically on-chain:
//!   * a battle loadout holds at most MAX_CHARMS_PER_BATTLE (2) charms
//!   * no duplicate charm types in one loadout
//!   * every charm is consumed by the battle that uses it (win or lose)
//!   * inventory is capped per charm type (max_hold) so nobody stockpiles
//!   * effects are modest gap-closers (<= 20%), not steamrollers
use crate::campaign::{power_element, Element};
use crate::players_profile::{find_player, Player};
use json::JsonValue;

pub const MAX_CHARMS_PER_BATTLE: usize = 2;

#[derive(Debug, Clone)]
pub struct CharmDef {
    pub id: u128,
    pub name: &'static str,
    pub description: &'static str,
    /// Some(element) for elemental sigils, None for universal charms.
    pub element: Option<Element>,
    pub cost_points: u128,
    pub max_hold: u128,
}

pub const TOTAL_CHARMS: u128 = 11;

pub fn get_charm(id: u128) -> Option<CharmDef> {
    let c = |id: u128,
             name: &'static str,
             description: &'static str,
             element: Option<Element>,
             cost_points: u128| CharmDef {
        id,
        name,
        description,
        element,
        cost_points,
        max_hold: 5,
    };
    let def = match id {
        1 => c(1, "Storm Sigil", "+20% damage for your Storm warriors this battle", Some(Element::Storm), 180),
        2 => c(2, "Fire Sigil", "+20% damage for your Fire warriors this battle", Some(Element::Fire), 180),
        3 => c(3, "Nature Sigil", "+20% damage for your Nature warriors this battle", Some(Element::Nature), 180),
        4 => c(4, "Water Sigil", "+20% damage for your Water warriors this battle", Some(Element::Water), 180),
        5 => c(5, "Psychic Sigil", "+20% damage for your Psychic warriors this battle", Some(Element::Psychic), 180),
        6 => c(6, "Shadow Sigil", "+20% damage for your Shadow warriors this battle", Some(Element::Shadow), 180),
        7 => c(7, "Healing Salve", "Your squad enters battle with +15% max health", None, 200),
        8 => c(8, "Energy Catalyst", "Your warriors start with half-charged power bars", None, 220),
        9 => c(9, "Guardian Ward", "The first hit on each of your warriors is halved", None, 200),
        10 => c(10, "War Horn", "+10% strength for your whole squad this battle", None, 180),
        11 => c(11, "Lucky Talisman", "Your critical-hit chance doubles (10% -> 20%)", None, 250),
        _ => return None,
    };
    Some(def)
}

// ---------------------------------------------------------------------------
// Loadout: validated set of charms applied to one battle
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Default)]
pub struct Loadout {
    /// (element, bonus damage percent)
    pub dmg_element: Option<(Element, u128)>,
    pub hp_pct: u128,
    pub start_energy: u128,
    pub first_hit_ward: bool,
    pub strength_pct: u128,
    pub crit_chance: u128, // 0 = default
    pub used_names: Vec<&'static str>,
}

pub fn build_loadout(charm_ids: &[u128]) -> Result<Loadout, String> {
    if charm_ids.len() > MAX_CHARMS_PER_BATTLE {
        return Err(format!(
            "You can carry at most {} charms into a battle",
            MAX_CHARMS_PER_BATTLE
        ));
    }
    let mut seen: Vec<u128> = Vec::new();
    let mut loadout = Loadout::default();
    for id in charm_ids {
        if seen.contains(id) {
            return Err("You cannot carry two of the same charm".to_string());
        }
        seen.push(*id);
        let charm = get_charm(*id).ok_or_else(|| format!("Unknown charm id: {}", id))?;
        loadout.used_names.push(charm.name);
        match charm.id {
            1..=6 => {
                if loadout.dmg_element.is_some() {
                    return Err("Only one elemental sigil per battle".to_string());
                }
                loadout.dmg_element = Some((charm.element.unwrap(), 20));
            }
            7 => loadout.hp_pct = 15,
            8 => loadout.start_energy = 50,
            9 => loadout.first_hit_ward = true,
            10 => loadout.strength_pct = 10,
            11 => loadout.crit_chance = 20,
            _ => {}
        }
    }
    Ok(loadout)
}

// ---------------------------------------------------------------------------
// Purchase / inventory
// ---------------------------------------------------------------------------

#[allow(clippy::too_many_arguments)]
pub fn buy_charm(
    all_players: &mut Vec<Player>,
    wallet_address: String,
    charm_id: u128,
    quantity: u128,
    pay_with_ctsi: bool,
    points_rate: f64,
    profit_from_points_purchase: &mut f64,
) -> Result<(), String> {
    if quantity == 0 {
        return Err("Quantity must be at least 1".to_string());
    }
    let charm = get_charm(charm_id).ok_or_else(|| format!("Unknown charm id: {}", charm_id))?;
    let player = find_player(all_players, wallet_address)
        .ok_or("Player not registered. Please register first")?;

    let held = player.charm_count(charm_id);
    if held + quantity > charm.max_hold {
        return Err(format!(
            "You can hold at most {} of {} (you have {})",
            charm.max_hold, charm.name, held
        ));
    }

    if pay_with_ctsi {
        let unit_price = if points_rate > 0.0 {
            charm.cost_points as f64 / points_rate
        } else {
            charm.cost_points as f64
        };
        let total = unit_price * quantity as f64;
        if player.cartesi_token_balance < total {
            return Err(format!(
                "{} x{} costs {:.2} CTSI — you have {:.2}",
                charm.name, quantity, total, player.cartesi_token_balance
            ));
        }
        player.cartesi_token_balance -= total;
        *profit_from_points_purchase += total;
    } else {
        let total = charm.cost_points * quantity;
        if player.points < total {
            return Err(format!(
                "{} x{} costs {} points — you have {}",
                charm.name, quantity, total, player.points
            ));
        }
        player.points -= total;
    }

    player.add_charms(charm_id, quantity);
    Ok(())
}

/// Verify ownership of every charm in the loadout, then consume them.
pub fn consume_charms(player: &mut Player, charm_ids: &[u128]) -> Result<(), String> {
    for id in charm_ids {
        if player.charm_count(*id) == 0 {
            let name = get_charm(*id).map(|c| c.name).unwrap_or("charm");
            return Err(format!("You do not own a {}", name));
        }
    }
    for id in charm_ids {
        player.remove_charm(*id);
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Serializers
// ---------------------------------------------------------------------------

pub fn catalog_to_json(points_rate: f64) -> String {
    let mut arr = JsonValue::new_array();
    for id in 1..=TOTAL_CHARMS {
        if let Some(c) = get_charm(id) {
            let mut j = JsonValue::new_object();
            j["id"] = (c.id as u64).into();
            j["name"] = c.name.into();
            j["description"] = c.description.into();
            if let Some(e) = c.element {
                j["element"] = e.as_str().into();
            }
            j["cost_points"] = (c.cost_points as u64).into();
            j["cost_ctsi"] = if points_rate > 0.0 {
                (c.cost_points as f64 / points_rate).into()
            } else {
                (c.cost_points as f64).into()
            };
            j["max_hold"] = (c.max_hold as u64).into();
            let _ = arr.push(j);
        }
    }
    arr.dump()
}

pub fn inventory_to_json(player: &Player) -> JsonValue {
    let mut arr = JsonValue::new_array();
    for (id, count) in &player.charm_inventory {
        if *count == 0 {
            continue;
        }
        let mut j = JsonValue::new_object();
        j["charm_id"] = (*id as u64).into();
        j["count"] = (*count as u64).into();
        if let Some(c) = get_charm(*id) {
            j["name"] = c.name.into();
        }
        let _ = arr.push(j);
    }
    arr
}
