use crate::game_characters::{
    confirm_ownership, get_character_details, get_characters, purchase_team, select_fighters,
    Character, SuperPower,
};

// An "enum" for strategies
#[derive(Debug, PartialEq, Clone)]
pub enum AllStrategies {
    YetToSelect,
    MaxHealthToLowest,
    LowestHealthToMax,
    MaxStrengthToLowest,
    LowestStrengthToMax,
}

// A function to return the strategy type a user has selected based on the passed strategy Id.
pub fn decode_strategy(strategy_id: u128) -> Option<AllStrategies> {
    match strategy_id {
        1 => return Some(AllStrategies::MaxHealthToLowest),
        2 => return Some(AllStrategies::LowestHealthToMax),
        3 => return Some(AllStrategies::MaxStrengthToLowest),
        4 => return Some(AllStrategies::LowestStrengthToMax),
        _ => return None,
    }
}

// Function to determine who the victim of an attack is going to be,
// it collects the strategy and also a vector of opponentsId as arguments.
pub fn decicde_victim<'a>(
    strategy: &AllStrategies,
    opponents: &'a mut Vec<Character>,
) -> Option<&'a mut Character> {
    if *strategy == AllStrategies::MaxHealthToLowest {
        let character_index = find_max_health(opponents);
        return opponents.get_mut(character_index);
    } else if *strategy == AllStrategies::LowestHealthToMax {
        let character_index = find_min_health(opponents);
        return opponents.get_mut(character_index);
    } else if *strategy == AllStrategies::MaxStrengthToLowest {
        let character_index = find_max_strength(opponents);
        return opponents.get_mut(character_index);
    } else if *strategy == AllStrategies::LowestStrengthToMax {
        let character_index = find_min_strength(opponents);
        return opponents.get_mut(character_index);
    } else {
        println!("Invalid strategy");
        return None;
    }
}

pub fn find_max_health(opponents: &mut Vec<Character>) -> usize {
    let mut max_health_index: usize = 0;
    for (index, character) in opponents.iter().enumerate() {
        if character.health > opponents[max_health_index].health {
            max_health_index = index;
        }
    }
    return max_health_index;
}
pub fn find_min_health(opponents: &mut Vec<Character>) -> usize {
    let mut min_health_index: usize = 0;
    for (index, character) in opponents.iter().enumerate() {
        if character.health < opponents[min_health_index].health {
            min_health_index = index;
        }
    }
    return min_health_index;
}
pub fn find_max_strength(opponents: &mut Vec<Character>) -> usize {
    let mut max_strength_index = 0;
    for (index, character) in opponents.iter().enumerate() {
        if character.strength > opponents[max_strength_index].strength {
            max_strength_index = index;
        }
    }
    max_strength_index
}

pub fn find_min_strength(opponents: &mut Vec<Character>) -> usize {
    let mut min_strength_index: usize = 0;
    for (index, character) in opponents.iter().enumerate() {
        if character.strength < opponents[min_strength_index].strength {
            min_strength_index = index;
        }
    }
    return min_strength_index;
}
