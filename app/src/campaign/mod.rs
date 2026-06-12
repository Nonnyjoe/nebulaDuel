//! Campaign mode: a 20-level PvE gauntlet. Each level is a hand-designed
//! battle on a themed map (biome). Elements interact with both the biome and
//! the opposing element, and every unit owns a special power that fires when
//! its energy bar fills. The whole battle is simulated deterministically in
//! one advance input and emitted as a rich event log the frontend replays
//! cinematically.
//!
//! Determinism: the only entropy source is an LCG seeded from
//! (block_timestamp, level_id, attempt#) — all inputs replay identically.

use crate::charms::{build_loadout, consume_charms, Loadout};
use crate::game_characters::{confirm_ownership, Character, SuperPower};
use crate::players_profile::{find_player, Player};
use crate::strategy_simulation::AllStrategies;
use json::JsonValue;

// ---------------------------------------------------------------------------
// Elements & biomes
// ---------------------------------------------------------------------------

#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Element {
    Storm,
    Fire,
    Nature,
    Water,
    Psychic,
    Shadow,
    Neutral,
}

impl Element {
    pub fn as_str(&self) -> &'static str {
        match self {
            Element::Storm => "Storm",
            Element::Fire => "Fire",
            Element::Nature => "Nature",
            Element::Water => "Water",
            Element::Psychic => "Psychic",
            Element::Shadow => "Shadow",
            Element::Neutral => "Neutral",
        }
    }
}

pub fn power_element(power: &SuperPower) -> Element {
    match power {
        SuperPower::Thunderbolt | SuperPower::SonicKick => Element::Storm,
        SuperPower::Flamethrower | SuperPower::HeadCrush => Element::Fire,
        SuperPower::VineWhip | SuperPower::SleepSong => Element::Nature,
        SuperPower::WaterGun => Element::Water,
        SuperPower::Psychic | SuperPower::TelekineticHit => Element::Psychic,
        SuperPower::ShadowBall | SuperPower::InvisibleClaws => Element::Shadow,
        SuperPower::Adaptability | SuperPower::DodgeNdTailLash => Element::Neutral,
    }
}

pub fn power_name(power: &SuperPower) -> &'static str {
    match power {
        SuperPower::Thunderbolt => "Thunderbolt",
        SuperPower::Flamethrower => "Flamethrower",
        SuperPower::VineWhip => "VineWhip",
        SuperPower::WaterGun => "WaterGun",
        SuperPower::SleepSong => "SleepSong",
        SuperPower::Psychic => "Psychic",
        SuperPower::Adaptability => "Adaptability",
        SuperPower::ShadowBall => "ShadowBall",
        SuperPower::HeadCrush => "HeadCrush",
        SuperPower::SonicKick => "SonicKick",
        SuperPower::TelekineticHit => "TelekineticHit",
        SuperPower::InvisibleClaws => "InvisibleClaws",
        SuperPower::DodgeNdTailLash => "DodgeNdTailLash",
    }
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub enum Biome {
    VerdantWilds,  // boosts Nature, dampens Shadow
    VolcanicForge, // boosts Fire, dampens Nature
    AbyssalDepths, // boosts Water, dampens Fire
    StormSpire,    // boosts Storm, dampens Psychic
    AstralPlane,   // boosts Psychic, dampens Water
    VoidNexus,     // boosts Shadow, dampens Storm
}

impl Biome {
    pub fn as_str(&self) -> &'static str {
        match self {
            Biome::VerdantWilds => "VerdantWilds",
            Biome::VolcanicForge => "VolcanicForge",
            Biome::AbyssalDepths => "AbyssalDepths",
            Biome::StormSpire => "StormSpire",
            Biome::AstralPlane => "AstralPlane",
            Biome::VoidNexus => "VoidNexus",
        }
    }

    fn boosted(&self) -> Element {
        match self {
            Biome::VerdantWilds => Element::Nature,
            Biome::VolcanicForge => Element::Fire,
            Biome::AbyssalDepths => Element::Water,
            Biome::StormSpire => Element::Storm,
            Biome::AstralPlane => Element::Psychic,
            Biome::VoidNexus => Element::Shadow,
        }
    }

    fn dampened(&self) -> Element {
        match self {
            Biome::VerdantWilds => Element::Shadow,
            Biome::VolcanicForge => Element::Nature,
            Biome::AbyssalDepths => Element::Fire,
            Biome::StormSpire => Element::Psychic,
            Biome::AstralPlane => Element::Water,
            Biome::VoidNexus => Element::Storm,
        }
    }
}

/// Damage multiplier (percent) for attacker element vs defender element.
/// Two triangles + two thematic crossovers; reverse matchups are weak (75%).
fn element_multiplier(attacker: Element, defender: Element) -> u128 {
    use Element::*;
    let strong = matches!(
        (attacker, defender),
        (Fire, Nature)
            | (Nature, Water)
            | (Water, Fire)
            | (Storm, Psychic)
            | (Psychic, Shadow)
            | (Shadow, Storm)
            | (Storm, Water)
            | (Nature, Storm)
    );
    if strong {
        return 130;
    }
    let weak = matches!(
        (attacker, defender),
        (Nature, Fire)
            | (Water, Nature)
            | (Fire, Water)
            | (Psychic, Storm)
            | (Shadow, Psychic)
            | (Storm, Shadow)
            | (Water, Storm)
            | (Storm, Nature)
    );
    if weak {
        return 75;
    }
    100
}

/// Biome modifier (percent) applied to an attacker of the given element.
fn biome_multiplier(biome: &Biome, attacker: Element) -> u128 {
    if attacker == biome.boosted() {
        125
    } else if attacker == biome.dampened() {
        85
    } else {
        100
    }
}

// ---------------------------------------------------------------------------
// Level definitions (20 hand-designed levels)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub struct EnemyDef {
    pub name: &'static str,
    pub power: SuperPower,
    pub health: u128,
    pub strength: u128,
    pub attack: u128,
    pub speed: u128,
}

#[derive(Debug, Clone)]
pub struct LevelDef {
    pub id: u128,
    pub name: &'static str,
    pub biome: Biome,
    pub lore: &'static str,
    pub enemies: [EnemyDef; 3],
    pub reward_points: u128,
    pub retry_cost: u128,
    pub title: Option<&'static str>,
    pub is_boss: bool,
}

fn enemy(
    name: &'static str,
    power: SuperPower,
    health: u128,
    strength: u128,
    attack: u128,
    speed: u128,
) -> EnemyDef {
    EnemyDef {
        name,
        power,
        health,
        strength,
        attack,
        speed,
    }
}

pub const TOTAL_LEVELS: u128 = 20;

pub fn get_level(id: u128) -> Option<LevelDef> {
    use SuperPower::*;
    let lvl = |id: u128,
               name: &'static str,
               biome: Biome,
               lore: &'static str,
               enemies: [EnemyDef; 3],
               title: Option<&'static str>,
               is_boss: bool| LevelDef {
        id,
        name,
        biome,
        lore,
        enemies,
        reward_points: 100 + id * 30,
        retry_cost: 10 + id * 5,
        title,
        is_boss,
    };

    let def = match id {
        1 => lvl(1, "Whispering Thicket", Biome::VerdantWilds,
            "Sprouts of the Verdant Wilds test every newcomer. Nature thrives here — Shadow withers.",
            [enemy("Moss Whelp", VineWhip, 70, 8, 9, 6),
             enemy("Thorn Sprite", SleepSong, 65, 7, 10, 8),
             enemy("Grove Warden", VineWhip, 85, 9, 10, 6)], None, false),
        2 => lvl(2, "Tidepool Shallows", Biome::AbyssalDepths,
            "Brine-soaked raiders ambush from the shallows. Water surges with power; flames sputter.",
            [enemy("Reef Skulker", WaterGun, 78, 9, 10, 7),
             enemy("Brine Snapper", WaterGun, 82, 9, 11, 7),
             enemy("Tide Caller", SleepSong, 90, 10, 11, 8)], None, false),
        3 => lvl(3, "Ember Foothills", Biome::VolcanicForge,
            "Cinder-born scouts guard the forge road. Fire rages stronger; Nature chars to ash.",
            [enemy("Ash Hound", Flamethrower, 85, 10, 12, 8),
             enemy("Cinder Imp", HeadCrush, 80, 11, 11, 9),
             enemy("Slag Brute", Flamethrower, 100, 12, 12, 6)], None, false),
        4 => lvl(4, "Static Fields", Biome::StormSpire,
            "Charged plains crackle underfoot. Storm strikes harder; Psychic minds scatter.",
            [enemy("Volt Leaper", Thunderbolt, 92, 11, 13, 10),
             enemy("Arc Dancer", SonicKick, 88, 11, 13, 11),
             enemy("Storm Herald", Thunderbolt, 105, 12, 13, 9)], None, false),
        5 => lvl(5, "Maw of the Forge", Biome::VolcanicForge,
            "BOSS: Pyrelord Karn awaits in the magma vault, flanked by his smelter guard.",
            [enemy("Smelter Guard", HeadCrush, 95, 12, 13, 8),
             enemy("Forge Acolyte", Flamethrower, 90, 11, 14, 9),
             enemy("PYRELORD KARN", Flamethrower, 170, 16, 17, 10)],
            Some("Forge Breaker"), true),
        6 => lvl(6, "Mirror Marsh", Biome::AstralPlane,
            "Reality bends over still water. Psychic powers amplify; Water dulls.",
            [enemy("Mind Wisp", Psychic, 100, 12, 14, 10),
             enemy("Echo Shade", TelekineticHit, 105, 12, 14, 10),
             enemy("Marsh Oracle", Psychic, 115, 13, 15, 11)], None, false),
        7 => lvl(7, "Gloom Hollow", Biome::VoidNexus,
            "The first taste of the Void. Shadow reigns; Storm is swallowed silent.",
            [enemy("Null Stalker", InvisibleClaws, 108, 13, 15, 11),
             enemy("Umbral Fang", ShadowBall, 112, 13, 15, 10),
             enemy("Hollow Priest", ShadowBall, 122, 14, 16, 10)], None, false),
        8 => lvl(8, "Coral Labyrinth", Biome::AbyssalDepths,
            "A drowned maze of living coral. Choose conduits of Storm — or be swept away.",
            [enemy("Labyrinth Eel", WaterGun, 118, 14, 16, 12),
             enemy("Coral Sentinel", DodgeNdTailLash, 124, 14, 16, 11),
             enemy("Depth Matron", WaterGun, 134, 15, 17, 11)], None, false),
        9 => lvl(9, "Canopy of Teeth", Biome::VerdantWilds,
            "The Wilds grow hungry. Carnivorous groves snap at any flame they sense.",
            [enemy("Snapvine Horror", VineWhip, 126, 15, 17, 12),
             enemy("Spore Witch", SleepSong, 120, 14, 18, 12),
             enemy("Elder Treant", VineWhip, 145, 16, 18, 10)], None, false),
        10 => lvl(10, "Eye of the Tempest", Biome::StormSpire,
            "BOSS: Tempest Queen Voltra holds the spire's crown amid eternal lightning.",
            [enemy("Thunder Knight", Thunderbolt, 132, 15, 18, 12),
             enemy("Gale Reaver", SonicKick, 128, 15, 18, 14),
             enemy("TEMPEST QUEEN VOLTRA", Thunderbolt, 220, 19, 21, 14)],
            Some("Stormbreaker"), true),
        11 => lvl(11, "Sunken Cathedral", Biome::AbyssalDepths,
            "Drowned bells still toll. The Matron's chosen guard relics of the old sea.",
            [enemy("Pale Chorister", SleepSong, 138, 16, 19, 13),
             enemy("Relic Keeper", WaterGun, 144, 16, 19, 12),
             enemy("Abyss Bishop", Psychic, 154, 17, 20, 13)], None, false),
        12 => lvl(12, "Obsidian Crucible", Biome::VolcanicForge,
            "Forged anew, the fire legion marches. Only the tide can quench them.",
            [enemy("Magma Reaver", Flamethrower, 148, 17, 20, 13),
             enemy("Obsidian Golem", HeadCrush, 162, 18, 19, 11),
             enemy("Crucible Champion", Flamethrower, 168, 18, 21, 13)], None, false),
        13 => lvl(13, "Fractured Mindscape", Biome::AstralPlane,
            "Thought becomes terrain. Shadows slip between the cracks of the mind.",
            [enemy("Doubt Specter", TelekineticHit, 152, 17, 21, 14),
             enemy("Memory Thief", Psychic, 158, 17, 21, 14),
             enemy("Dream Tyrant", Psychic, 172, 18, 22, 14)], None, false),
        14 => lvl(14, "Throat of the Void", Biome::VoidNexus,
            "Light dies here. The Void Court tests all who descend.",
            [enemy("Void Duelist", InvisibleClaws, 160, 18, 22, 15),
             enemy("Entropy Monk", ShadowBall, 166, 18, 22, 14),
             enemy("Court Executioner", ShadowBall, 180, 19, 23, 14)], None, false),
        15 => lvl(15, "Heart of the Wilds", Biome::VerdantWilds,
            "BOSS: Sylvaron, the First Seed, awakens. The forest itself fights beside him.",
            [enemy("Bramble Colossus", VineWhip, 170, 19, 22, 13),
             enemy("Lifebloom Siren", SleepSong, 164, 18, 23, 15),
             enemy("SYLVARON THE FIRST SEED", VineWhip, 270, 22, 25, 15)],
            Some("Wildheart Champion"), true),
        16 => lvl(16, "Twin Riptide Arena", Biome::AbyssalDepths,
            "The drowned colosseum demands a spectacle. Storm conduits sing in the spray.",
            [enemy("Riptide Twin Kael", WaterGun, 176, 19, 24, 16),
             enemy("Riptide Twin Zara", WaterGun, 176, 19, 24, 16),
             enemy("Arena Leviathan", DodgeNdTailLash, 195, 20, 24, 14)], None, false),
        17 => lvl(17, "Pyroclasm Summit", Biome::VolcanicForge,
            "The mountain erupts in protest. Karn's heir leads the final fire host.",
            [enemy("Eruption Shaman", Flamethrower, 182, 20, 25, 15),
             enemy("Lava Behemoth", HeadCrush, 200, 21, 24, 13),
             enemy("Heir of Karn", Flamethrower, 205, 21, 26, 16)], None, false),
        18 => lvl(18, "Singularity Garden", Biome::AstralPlane,
            "Gravity blooms like flowers. The mind benders here predate language.",
            [enemy("Gravity Warden", TelekineticHit, 188, 21, 26, 16),
             enemy("Thought Devourer", Psychic, 194, 21, 26, 16),
             enemy("Singularity Sage", Psychic, 210, 22, 27, 16)], None, false),
        19 => lvl(19, "Penumbra Gate", Biome::VoidNexus,
            "The final gate before the throne. The Void Court empties to stop you.",
            [enemy("Gatekeeper Null", InvisibleClaws, 196, 22, 27, 17),
             enemy("Shadow Archon", ShadowBall, 204, 22, 27, 16),
             enemy("Penumbra Warlord", ShadowBall, 225, 23, 28, 16)], None, false),
        20 => lvl(20, "Throne of Eternity", Biome::VoidNexus,
            "FINAL BOSS: Nyxar the Eternal, sovereign of the Void, on a throne of dead stars.",
            [enemy("Eternal Herald", ShadowBall, 210, 23, 28, 17),
             enemy("Eternal Praetor", InvisibleClaws, 215, 23, 28, 17),
             enemy("NYXAR THE ETERNAL", ShadowBall, 340, 26, 31, 18)],
            Some("Eternal Champion of Nebula"), true),
        _ => return None,
    };
    Some(def)
}

// ---------------------------------------------------------------------------
// Deterministic RNG (LCG)
// ---------------------------------------------------------------------------

struct Lcg(u128);

impl Lcg {
    fn new(seed: u128) -> Self {
        Lcg(seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407))
    }
    /// next value in [0, bound)
    fn next(&mut self, bound: u128) -> u128 {
        self.0 = self.0.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        if bound == 0 {
            0
        } else {
            (self.0 >> 33) % bound
        }
    }
    fn chance(&mut self, percent: u128) -> bool {
        self.next(100) < percent
    }
}

// ---------------------------------------------------------------------------
// Battle simulation
// ---------------------------------------------------------------------------

const MAX_ROUNDS: u32 = 60;
const ENERGY_PER_TURN: u128 = 35;
const ENERGY_WHEN_HIT: u128 = 15;
const ENERGY_FULL: u128 = 100;

#[derive(Debug, Clone)]
struct Unit {
    id: u128,
    name: String,
    side: u8, // 0 = player, 1 = enemy
    power: SuperPower,
    element: Element,
    max_health: u128,
    health: u128,
    strength: u128,
    attack: u128,
    speed: u128,
    energy: u128,
    burn_rounds: u128,
    stunned: bool,
    shielded: bool,
    /// Guardian Ward charm: halves the first hit taken.
    ward: bool,
    /// Crit chance percent for this unit's attacks.
    crit_chance: u128,
    /// Elemental sigil bonus damage percent (player units only).
    sigil_bonus: u128,
}

impl Unit {
    fn alive(&self) -> bool {
        self.health > 0
    }
}

pub struct BattleOutcome {
    pub victory: bool,
    pub rounds: u32,
    pub events: JsonValue,
    pub player_squad: JsonValue,
    pub enemy_squad: JsonValue,
}

fn unit_json(u: &Unit) -> JsonValue {
    let mut j = JsonValue::new_object();
    j["id"] = (u.id as u64).into();
    j["name"] = u.name.clone().into();
    j["side"] = if u.side == 0 { "player" } else { "enemy" }.into();
    j["power"] = power_name(&u.power).into();
    j["element"] = u.element.as_str().into();
    j["max_health"] = (u.max_health as u64).into();
    j["health"] = (u.health as u64).into();
    j["strength"] = (u.strength as u64).into();
    j["attack"] = (u.attack as u64).into();
    j["speed"] = (u.speed as u64).into();
    j
}

#[allow(clippy::too_many_arguments)]
fn push_event(
    events: &mut JsonValue,
    round: u32,
    actor: &Unit,
    target: &Unit,
    action: &str,
    power: Option<&SuperPower>,
    damage: u128,
    heal: u128,
    crit: bool,
    effective: &str,
    effect: &str,
) {
    let mut e = JsonValue::new_object();
    e["round"] = round.into();
    e["actor_id"] = (actor.id as u64).into();
    e["actor_side"] = if actor.side == 0 { "player" } else { "enemy" }.into();
    e["target_id"] = (target.id as u64).into();
    e["action"] = action.into();
    if let Some(p) = power {
        e["power"] = power_name(p).into();
        e["element"] = power_element(p).as_str().into();
    } else {
        e["element"] = actor.element.as_str().into();
    }
    e["damage"] = (damage as u64).into();
    if heal > 0 {
        e["heal"] = (heal as u64).into();
    }
    e["crit"] = crit.into();
    e["effective"] = effective.into(); // "strong" | "weak" | "normal"
    if !effect.is_empty() {
        e["effect"] = effect.into();
    }
    e["actor_hp"] = (actor.health as u64).into();
    e["target_hp"] = (target.health as u64).into();
    e["target_ko"] = (target.health == 0).into();
    let _ = events.push(e);
}

/// Pick the living target on `side` according to a strategy (deterministic).
fn pick_target_with_strategy(
    units: &[Unit],
    side: u8,
    strategy: &AllStrategies,
) -> Option<usize> {
    let mut best: Option<usize> = None;
    for (i, u) in units.iter().enumerate() {
        if u.side != side || !u.alive() {
            continue;
        }
        best = match best {
            None => Some(i),
            Some(b) => {
                let better = match strategy {
                    AllStrategies::MaxHealthToLowest => u.health > units[b].health,
                    AllStrategies::LowestHealthToMax | AllStrategies::YetToSelect => {
                        u.health < units[b].health
                    }
                    AllStrategies::MaxStrengthToLowest => u.strength > units[b].strength,
                    AllStrategies::LowestStrengthToMax => u.strength < units[b].strength,
                };
                if better { Some(i) } else { Some(b) }
            }
        };
    }
    best
}

fn side_alive(units: &[Unit], side: u8) -> bool {
    units.iter().any(|u| u.side == side && u.alive())
}

fn base_damage(attacker: &Unit, defender: &Unit) -> u128 {
    attacker
        .strength
        .saturating_add(attacker.attack / 2)
        .saturating_sub(defender.speed / 4)
        .max(1)
}

fn apply_damage(unit: &mut Unit, dmg: u128) {
    unit.health = unit.health.saturating_sub(dmg);
}

/// Simulate the full battle. Returns the outcome with a frontend-replayable
/// event log.
pub fn simulate(
    level: &LevelDef,
    player_units: Vec<(u128, String, SuperPower, u128, u128, u128, u128)>,
    seed: u128,
    player_strategy: AllStrategies,
    loadout: &Loadout,
) -> BattleOutcome {
    let mut rng = Lcg::new(seed);
    let biome = level.biome;

    let mut units: Vec<Unit> = Vec::new();
    for (id, name, power, health, strength, attack, speed) in player_units {
        let element = power_element(&power);
        // Apply the charm loadout to player units only.
        let health = health * (100 + loadout.hp_pct) / 100;
        let strength = strength * (100 + loadout.strength_pct) / 100;
        let sigil_bonus = match loadout.dmg_element {
            Some((e, pct)) if e == element => pct,
            _ => 0,
        };
        units.push(Unit {
            id,
            name,
            side: 0,
            power,
            element,
            max_health: health,
            health,
            strength,
            attack,
            speed,
            energy: loadout.start_energy,
            burn_rounds: 0,
            stunned: false,
            shielded: false,
            ward: loadout.first_hit_ward,
            crit_chance: if loadout.crit_chance > 0 {
                loadout.crit_chance
            } else {
                10
            },
            sigil_bonus,
        });
    }
    for (slot, e) in level.enemies.iter().enumerate() {
        let element = power_element(&e.power);
        units.push(Unit {
            id: 100_000 + level.id * 10 + slot as u128,
            name: e.name.to_string(),
            side: 1,
            power: e.power.clone(),
            element,
            max_health: e.health,
            health: e.health,
            strength: e.strength,
            attack: e.attack,
            speed: e.speed,
            energy: 0,
            burn_rounds: 0,
            stunned: false,
            shielded: false,
            ward: false,
            crit_chance: 10,
            sigil_bonus: 0,
        });
    }

    let mut events = JsonValue::new_array();
    let mut round: u32 = 0;

    while side_alive(&units, 0) && side_alive(&units, 1) && round < MAX_ROUNDS {
        round += 1;

        // Burn ticks at the start of each round.
        for i in 0..units.len() {
            if units[i].alive() && units[i].burn_rounds > 0 {
                units[i].burn_rounds -= 1;
                let tick = (units[i].max_health / 25).max(1);
                apply_damage(&mut units[i], tick);
                let actor = units[i].clone();
                push_event(
                    &mut events, round, &actor, &actor, "burn", None, tick, 0, false, "normal",
                    "burn",
                );
            }
        }

        // Initiative: living units ordered by current speed (desc), id tiebreak.
        let mut order: Vec<usize> = (0..units.len()).filter(|&i| units[i].alive()).collect();
        order.sort_by(|&a, &b| {
            units[b]
                .speed
                .cmp(&units[a].speed)
                .then(units[a].id.cmp(&units[b].id))
        });

        for &idx in &order {
            if !units[idx].alive() {
                continue;
            }
            if !side_alive(&units, 0) || !side_alive(&units, 1) {
                break;
            }
            if units[idx].stunned {
                units[idx].stunned = false;
                let actor = units[idx].clone();
                push_event(
                    &mut events, round, &actor, &actor, "stunned", None, 0, 0, false, "normal",
                    "skip",
                );
                continue;
            }

            let enemy_side = 1 - units[idx].side;
            // The player targets according to their chosen strategy; enemies
            // always hunt the weakest (lowest health) player unit.
            let strategy = if units[idx].side == 0 {
                player_strategy.clone()
            } else {
                AllStrategies::LowestHealthToMax
            };
            let target_idx = match pick_target_with_strategy(&units, enemy_side, &strategy) {
                Some(t) => t,
                None => break,
            };

            units[idx].energy = units[idx].energy.saturating_add(ENERGY_PER_TURN);
            let cast_power = units[idx].energy >= ENERGY_FULL;
            if cast_power {
                units[idx].energy = 0;
                execute_power(&mut units, idx, target_idx, &biome, round, &mut rng, &mut events);
            } else {
                execute_attack(&mut units, idx, target_idx, &biome, round, &mut rng, &mut events);
            }
        }
    }

    // Timeout tie-break: higher remaining total health wins.
    let player_hp: u128 = units.iter().filter(|u| u.side == 0).map(|u| u.health).sum();
    let enemy_hp: u128 = units.iter().filter(|u| u.side == 1).map(|u| u.health).sum();
    let victory = if side_alive(&units, 0) && !side_alive(&units, 1) {
        true
    } else if !side_alive(&units, 0) {
        false
    } else {
        player_hp >= enemy_hp
    };

    let mut player_squad = JsonValue::new_array();
    let mut enemy_squad = JsonValue::new_array();
    for u in &units {
        if u.side == 0 {
            let _ = player_squad.push(unit_json(u));
        } else {
            let _ = enemy_squad.push(unit_json(u));
        }
    }

    BattleOutcome {
        victory,
        rounds: round,
        events,
        player_squad,
        enemy_squad,
    }
}

fn effectiveness_label(mult: u128) -> &'static str {
    if mult > 100 {
        "strong"
    } else if mult < 100 {
        "weak"
    } else {
        "normal"
    }
}

fn execute_attack(
    units: &mut [Unit],
    attacker_idx: usize,
    target_idx: usize,
    biome: &Biome,
    round: u32,
    rng: &mut Lcg,
    events: &mut JsonValue,
) {
    // Shield consumes the hit entirely.
    if units[target_idx].shielded {
        units[target_idx].shielded = false;
        let actor = units[attacker_idx].clone();
        let target = units[target_idx].clone();
        push_event(
            events, round, &actor, &target, "attack", None, 0, 0, false, "normal", "dodged",
        );
        return;
    }

    let elem_mult = element_multiplier(units[attacker_idx].element, units[target_idx].element);
    let bio_mult = biome_multiplier(biome, units[attacker_idx].element);
    let crit = rng.chance(units[attacker_idx].crit_chance);
    let crit_mult: u128 = if crit { 150 } else { 100 };
    let sigil_mult: u128 = 100 + units[attacker_idx].sigil_bonus;

    let raw = base_damage(&units[attacker_idx], &units[target_idx]);
    let mut dmg = (raw * elem_mult * bio_mult * crit_mult * sigil_mult / 100_000_000).max(1);

    // Guardian Ward: the first hit on a warded unit is halved.
    let mut effect = "";
    if units[target_idx].ward {
        units[target_idx].ward = false;
        dmg = (dmg / 2).max(1);
        effect = "warded";
    }

    apply_damage(&mut units[target_idx], dmg);
    units[target_idx].energy = units[target_idx].energy.saturating_add(ENERGY_WHEN_HIT);

    let actor = units[attacker_idx].clone();
    let target = units[target_idx].clone();
    push_event(
        events,
        round,
        &actor,
        &target,
        "attack",
        None,
        dmg,
        0,
        crit,
        effectiveness_label(elem_mult * bio_mult / 100),
        effect,
    );
}

fn execute_power(
    units: &mut [Unit],
    attacker_idx: usize,
    target_idx: usize,
    biome: &Biome,
    round: u32,
    rng: &mut Lcg,
    events: &mut JsonValue,
) {
    use SuperPower::*;
    let power = units[attacker_idx].power.clone();
    let elem_mult = element_multiplier(units[attacker_idx].element, units[target_idx].element);
    let bio_mult = biome_multiplier(biome, units[attacker_idx].element);
    let raw = base_damage(&units[attacker_idx], &units[target_idx]);
    let scaled = |pct: u128| (raw * pct * elem_mult * bio_mult / 10_000_000).max(1);
    let label = effectiveness_label(elem_mult * bio_mult / 100);

    let mut damage: u128;
    let mut heal: u128 = 0;
    let mut effect = "";
    let mut crit = false;

    match power {
        Thunderbolt => {
            damage = scaled(180);
            if rng.chance(25) {
                units[target_idx].stunned = true;
                effect = "stun";
            }
        }
        Flamethrower => {
            damage = scaled(140);
            units[target_idx].burn_rounds = 2;
            effect = "burn_applied";
        }
        VineWhip => {
            damage = scaled(120);
            heal = damage / 2;
            effect = "drain";
        }
        WaterGun => {
            damage = scaled(130);
            units[target_idx].attack = (units[target_idx].attack * 90 / 100).max(5);
            effect = "soak";
        }
        SleepSong => {
            damage = scaled(60);
            units[target_idx].stunned = true;
            effect = "sleep";
        }
        Psychic => {
            // Pierces speed: recompute without the speed mitigation.
            let pierce = units[attacker_idx]
                .strength
                .saturating_add(units[attacker_idx].attack / 2)
                .max(1);
            damage = (pierce * 150 * elem_mult * bio_mult / 10_000_000).max(1);
            effect = "pierce";
        }
        Adaptability => {
            damage = (units[target_idx].strength * 120 * bio_mult / 1_000_000).max(1);
            units[attacker_idx].attack = units[attacker_idx].attack * 115 / 100;
            effect = "adapt";
        }
        ShadowBall => {
            damage = scaled(160);
            heal = damage * 15 / 100;
            effect = "lifesteal";
        }
        HeadCrush => {
            damage = scaled(200);
            let recoil = (units[attacker_idx].max_health / 10).max(1);
            apply_damage(&mut units[attacker_idx], recoil);
            effect = "recoil";
        }
        SonicKick => {
            damage = scaled(90) + scaled(90);
            effect = "double_strike";
        }
        TelekineticHit => {
            damage = scaled(140);
            units[target_idx].speed = units[target_idx].speed * 80 / 100;
            effect = "slow";
        }
        InvisibleClaws => {
            damage = scaled(170);
            crit = true;
            effect = "guaranteed_crit";
        }
        DodgeNdTailLash => {
            damage = scaled(110);
            units[attacker_idx].shielded = true;
            effect = "shield_up";
        }
    }

    if units[target_idx].shielded {
        units[target_idx].shielded = false;
        damage = 0;
        effect = "dodged";
    }

    // Sigil bonus applies to powers too.
    if units[attacker_idx].sigil_bonus > 0 && damage > 0 {
        damage = damage * (100 + units[attacker_idx].sigil_bonus) / 100;
    }
    // Guardian Ward halves the first hit.
    if units[target_idx].ward && damage > 0 {
        units[target_idx].ward = false;
        damage = (damage / 2).max(1);
        effect = "warded";
    }

    apply_damage(&mut units[target_idx], damage);
    units[target_idx].energy = units[target_idx].energy.saturating_add(ENERGY_WHEN_HIT);
    if heal > 0 {
        units[attacker_idx].health =
            (units[attacker_idx].health + heal).min(units[attacker_idx].max_health);
    }

    let actor = units[attacker_idx].clone();
    let target = units[target_idx].clone();
    push_event(
        events, round, &actor, &target, "power", Some(&power), damage, heal, crit, label, effect,
    );
}

// ---------------------------------------------------------------------------
// Campaign progression / rewards
// ---------------------------------------------------------------------------

pub struct CampaignResult {
    pub report: JsonValue,
}

/// Run one campaign attempt for the caller. Mutates player profile
/// (points, progress, titles) and squad characters (stat boost on first
/// clear). Returns the full battle report to emit as a notice.
#[allow(clippy::too_many_arguments)]
#[allow(clippy::too_many_arguments)]
pub fn play_level(
    all_players: &mut Vec<Player>,
    all_characters: &mut Vec<Character>,
    wallet_address: String,
    level_id: u128,
    char_ids: Vec<u128>,
    time_stamp: u128,
    player_strategy: AllStrategies,
    charm_ids: Vec<u128>,
) -> Result<CampaignResult, String> {
    // Validate and build the charm loadout before anything mutates.
    let loadout = build_loadout(&charm_ids)?;
    let level = get_level(level_id).ok_or_else(|| format!("Level {} does not exist", level_id))?;

    if char_ids.len() != 3 {
        return Err("You must field exactly 3 characters".to_string());
    }
    if char_ids[0] == char_ids[1] || char_ids[0] == char_ids[2] || char_ids[1] == char_ids[2] {
        return Err("Cannot field the same character twice".to_string());
    }

    // Ownership checks before any mutation.
    for id in &char_ids {
        confirm_ownership(all_characters, all_players, wallet_address.clone(), *id)?;
    }

    // Unlock + retry fee.
    let (attempt_no, first_clear_pending) = {
        let player = find_player(all_players, wallet_address.clone())
            .ok_or("Player not registered. Please register first")?;

        if level_id > 1 && player.campaign_progress < level_id - 1 {
            return Err(format!(
                "Level {} is locked — clear level {} first",
                level_id,
                level_id - 1
            ));
        }

        let attempts = player.campaign_attempt_count(level_id);
        if attempts > 0 {
            if player.points < level.retry_cost {
                return Err(format!(
                    "Retrying level {} costs {} points — you have {}",
                    level_id, level.retry_cost, player.points
                ));
            }
            player.points -= level.retry_cost;
        }
        // Charms are consumed by the attempt, win or lose.
        consume_charms(player, &charm_ids)?;
        player.record_campaign_attempt(level_id);
        (attempts + 1, player.campaign_progress < level_id)
    };

    // Snapshot squad stats for the sim.
    let mut squad: Vec<(u128, String, SuperPower, u128, u128, u128, u128)> = Vec::new();
    for id in &char_ids {
        let c = all_characters
            .iter()
            .find(|c| c.id == *id)
            .ok_or_else(|| format!("Character {} not found", id))?;
        squad.push((
            c.id,
            c.name.clone(),
            c.super_power.clone(),
            c.health,
            c.strength,
            c.attack,
            c.speed,
        ));
    }

    let seed = time_stamp
        .wrapping_add(level_id.wrapping_mul(7919))
        .wrapping_add(attempt_no.wrapping_mul(104729));
    let outcome = simulate(&level, squad, seed, player_strategy, &loadout);

    // Rewards.
    let mut reward_points: u128 = 0;
    let mut stat_boost = false;
    let mut new_title: Option<&'static str> = None;

    if outcome.victory {
        if first_clear_pending {
            reward_points = level.reward_points;
            stat_boost = true;
            if let Some(title) = level.title {
                new_title = Some(title);
            }
        } else if attempt_no <= 5 {
            // Anti-farm: replaying a cleared level pays 10% of the first-clear
            // reward, and only for the first 5 total attempts of that level.
            // Beyond that, replays are for glory (and retry fees), not points.
            reward_points = level.reward_points / 10;
        }

        // Permanent squad boost on first clear of this level.
        if stat_boost {
            for id in &char_ids {
                if let Some(c) = all_characters.iter_mut().find(|c| c.id == *id) {
                    c.health += 3;
                    c.strength += 1;
                    c.attack += 1;
                }
            }
        }

        let player = find_player(all_players, wallet_address.clone())
            .ok_or("Player vanished mid-battle")?;
        player.points += reward_points;
        if first_clear_pending {
            player.campaign_progress = level_id;
        }
        player.campaign_wins += 1;
        if let Some(title) = new_title {
            if !player.campaign_titles.iter().any(|t| t == title) {
                player.campaign_titles.push(title.to_string());
            }
        }
    } else {
        let player = find_player(all_players, wallet_address.clone())
            .ok_or("Player vanished mid-battle")?;
        player.campaign_losses += 1;
    }

    // Build the report.
    let mut report = JsonValue::new_object();
    report["level_id"] = (level_id as u64).into();
    report["level_name"] = level.name.into();
    report["biome"] = level.biome.as_str().into();
    report["is_boss"] = level.is_boss.into();
    report["attempt"] = (attempt_no as u64).into();
    report["player"] = wallet_address.into();
    report["victory"] = outcome.victory.into();
    report["rounds"] = outcome.rounds.into();
    report["player_squad"] = outcome.player_squad;
    report["enemy_squad"] = outcome.enemy_squad;
    report["events"] = outcome.events;
    let mut rewards = JsonValue::new_object();
    rewards["points"] = (reward_points as u64).into();
    rewards["stat_boost"] = stat_boost.into();
    if let Some(t) = new_title {
        rewards["title"] = t.into();
    }
    report["rewards"] = rewards;
    let mut charms_used = JsonValue::new_array();
    for name in &loadout.used_names {
        let _ = charms_used.push(JsonValue::from(*name));
    }
    report["charms_used"] = charms_used;

    Ok(CampaignResult { report })
}

// ---------------------------------------------------------------------------
// Inspect serializers
// ---------------------------------------------------------------------------

pub fn levels_to_json() -> String {
    let mut arr = JsonValue::new_array();
    for id in 1..=TOTAL_LEVELS {
        if let Some(level) = get_level(id) {
            let mut j = JsonValue::new_object();
            j["id"] = (level.id as u64).into();
            j["name"] = level.name.into();
            j["biome"] = level.biome.as_str().into();
            j["lore"] = level.lore.into();
            j["reward_points"] = (level.reward_points as u64).into();
            j["retry_cost"] = (level.retry_cost as u64).into();
            j["is_boss"] = level.is_boss.into();
            if let Some(t) = level.title {
                j["title"] = t.into();
            }
            let mut enemies = JsonValue::new_array();
            for (slot, e) in level.enemies.iter().enumerate() {
                let mut ej = JsonValue::new_object();
                ej["id"] = ((100_000 + level.id * 10 + slot as u128) as u64).into();
                ej["name"] = e.name.into();
                ej["power"] = power_name(&e.power).into();
                ej["element"] = power_element(&e.power).as_str().into();
                ej["health"] = (e.health as u64).into();
                ej["strength"] = (e.strength as u64).into();
                ej["attack"] = (e.attack as u64).into();
                ej["speed"] = (e.speed as u64).into();
                let _ = enemies.push(ej);
            }
            j["enemies"] = enemies;
            let _ = arr.push(j);
        }
    }
    arr.dump()
}

pub fn progress_to_json(player: &Player) -> String {
    let mut j = JsonValue::new_object();
    j["wallet_address"] = player.wallet_address.clone().into();
    j["campaign_progress"] = (player.campaign_progress as u64).into();
    j["campaign_wins"] = (player.campaign_wins as u64).into();
    j["campaign_losses"] = (player.campaign_losses as u64).into();
    let mut titles = JsonValue::new_array();
    for t in &player.campaign_titles {
        let _ = titles.push(JsonValue::from(t.clone()));
    }
    j["titles"] = titles;
    let mut attempts = JsonValue::new_array();
    for (lvl, n) in &player.campaign_attempts {
        let mut a = JsonValue::new_object();
        a["level"] = (*lvl as u64).into();
        a["attempts"] = (*n as u64).into();
        let _ = attempts.push(a);
    }
    j["attempts"] = attempts;
    j["charm_inventory"] = crate::charms::inventory_to_json(player);
    j.dump()
}

pub fn leaderboard_to_json(all_players: &[Player]) -> String {
    let mut ranked: Vec<&Player> = all_players
        .iter()
        .filter(|p| p.campaign_progress > 0 && p.wallet_address != "0xnebula")
        .collect();
    ranked.sort_by(|a, b| {
        b.campaign_progress
            .cmp(&a.campaign_progress)
            .then(b.campaign_wins.cmp(&a.campaign_wins))
            .then(a.campaign_losses.cmp(&b.campaign_losses))
    });

    let mut arr = JsonValue::new_array();
    for (rank, p) in ranked.iter().take(50).enumerate() {
        let mut j = JsonValue::new_object();
        j["rank"] = ((rank + 1) as u64).into();
        j["monika"] = p.monika.clone().into();
        j["wallet_address"] = p.wallet_address.clone().into();
        j["campaign_progress"] = (p.campaign_progress as u64).into();
        j["campaign_wins"] = (p.campaign_wins as u64).into();
        j["campaign_losses"] = (p.campaign_losses as u64).into();
        j["top_title"] = p
            .campaign_titles
            .last()
            .cloned()
            .unwrap_or_default()
            .into();
        let _ = arr.push(j);
    }
    arr.dump()
}
