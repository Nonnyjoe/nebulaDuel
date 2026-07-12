// An "enum" for strategies
#[derive(Debug, PartialEq, Clone)]
pub enum AllStrategies {
    YetToSelect,
    MaxHealthToLowest,
    LowestHealthToMax,
    MaxStrengthToLowest,
    LowestStrengthToMax,
    /// Focus the enemy with the highest ATTACK (Berserker).
    MaxAttackToLowest,
    /// Focus the SLOWEST enemy — they retaliate last (Tactician).
    LowestSpeedToMax,
}

// A function to return the strategy type a user has selected based on the passed strategy Id.
pub fn decode_strategy(strategy_id: u128) -> Option<AllStrategies> {
    match strategy_id {
        1 => return Some(AllStrategies::MaxHealthToLowest),
        2 => return Some(AllStrategies::LowestHealthToMax),
        3 => return Some(AllStrategies::MaxStrengthToLowest),
        4 => return Some(AllStrategies::LowestStrengthToMax),
        5 => return Some(AllStrategies::MaxAttackToLowest),
        6 => return Some(AllStrategies::LowestSpeedToMax),
        _ => return None,
    }
}
