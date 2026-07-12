//! Achievements / badges — pure functions over existing player + character
//! state. Deterministic, recomputed on read (no extra stored state), and served
//! via the `achievements/<wallet>` inspect route. They give players concrete
//! goals beyond raw points.

use crate::game_characters::Character;
use crate::players_profile::Player;
use json::JsonValue;

pub struct Badge {
    pub id: &'static str,
    pub name: &'static str,
    pub description: &'static str,
    pub earned: bool,
    /// Progress toward the goal, 0..=100 (100 = earned).
    pub progress: u128,
}

fn pct(current: u128, target: u128) -> u128 {
    if target == 0 {
        return 100;
    }
    (current.saturating_mul(100) / target).min(100)
}

/// Compute every badge for a player. `owned` are the player's characters
/// (already filtered to this player) so we can inspect rarity/level.
pub fn evaluate(player: &Player, owned: &[&Character]) -> Vec<Badge> {
    let total_battles = player.total_battles;
    let win_rate = if total_battles > 0 {
        player.total_wins * 100 / total_battles
    } else {
        0
    };
    let owns_legendary = owned.iter().any(|c| c.rarity == "Legendary");
    let max_level = owned.iter().map(|c| c.level).max().unwrap_or(0);
    let collection = owned.len() as u128;

    let mk = |id, name, description, earned, progress| Badge {
        id,
        name,
        description,
        earned,
        progress,
    };

    vec![
        mk(
            "first_blood",
            "First Blood",
            "Win your first duel.",
            player.total_wins >= 1,
            pct(player.total_wins, 1),
        ),
        mk(
            "veteran",
            "Veteran",
            "Fight 50 battles.",
            total_battles >= 50,
            pct(total_battles, 50),
        ),
        mk(
            "sharpshooter",
            "Sharpshooter",
            "Hold an 80%+ win rate over at least 10 battles.",
            total_battles >= 10 && win_rate >= 80,
            if total_battles < 10 {
                pct(total_battles, 10)
            } else {
                pct(win_rate, 80)
            },
        ),
        mk(
            "campaign_champion",
            "Champion of Nebula",
            "Clear all 20 campaign levels.",
            player.campaign_progress >= 20,
            pct(player.campaign_progress, 20),
        ),
        mk(
            "collector",
            "Collector",
            "Own 10 or more warriors.",
            collection >= 10,
            pct(collection, 10),
        ),
        mk(
            "legendary_owner",
            "Legendary Bond",
            "Own a Legendary-rarity warrior.",
            owns_legendary,
            if owns_legendary { 100 } else { 0 },
        ),
        mk(
            "ascended",
            "Ascended",
            "Level a warrior to level 5.",
            max_level >= 5,
            pct(max_level, 5),
        ),
        mk(
            "daily_devotee",
            "Daily Devotee",
            "Reach a 7-day login streak.",
            player.daily_streak >= 7,
            pct(player.daily_streak, 7),
        ),
        mk(
            "champion_of_the_arena",
            "Arena Veteran",
            "Win 25 duels.",
            player.total_wins >= 25,
            pct(player.total_wins, 25),
        ),
    ]
}

pub fn to_json(player: &Player, owned: &[&Character]) -> String {
    let badges = evaluate(player, owned);
    let earned_count = badges.iter().filter(|b| b.earned).count() as u64;

    let mut arr = JsonValue::new_array();
    for b in &badges {
        let mut j = JsonValue::new_object();
        j["id"] = b.id.into();
        j["name"] = b.name.into();
        j["description"] = b.description.into();
        j["earned"] = b.earned.into();
        j["progress"] = (b.progress as u64).into();
        let _ = arr.push(j);
    }

    let mut root = JsonValue::new_object();
    root["wallet_address"] = player.wallet_address.clone().into();
    root["earned"] = earned_count.into();
    root["total"] = (badges.len() as u64).into();
    root["badges"] = arr;
    root.dump()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::players_profile::create_player;

    fn player_with(wins: u128, battles: u128, campaign: u128, streak: u128) -> Player {
        let mut players = Vec::new();
        let mut total = 0;
        let mut p =
            create_player("p".into(), "0xabc".into(), "".into(), &mut players, &mut total).unwrap();
        p.total_wins = wins;
        p.total_battles = battles;
        p.campaign_progress = campaign;
        p.daily_streak = streak;
        p
    }

    #[test]
    fn badges_unlock_on_thresholds() {
        let fresh = player_with(0, 0, 0, 0);
        let badges = evaluate(&fresh, &[]);
        assert!(badges.iter().all(|b| !b.earned));

        let seasoned = player_with(25, 60, 20, 7);
        let badges = evaluate(&seasoned, &[]);
        let earned: Vec<&str> = badges.iter().filter(|b| b.earned).map(|b| b.id).collect();
        assert!(earned.contains(&"first_blood"));
        assert!(earned.contains(&"veteran"));
        assert!(earned.contains(&"campaign_champion"));
        assert!(earned.contains(&"daily_devotee"));
        assert!(earned.contains(&"champion_of_the_arena"));
    }

    #[test]
    fn progress_is_bounded() {
        let p = player_with(3, 5, 0, 0);
        for b in evaluate(&p, &[]) {
            assert!(b.progress <= 100);
        }
    }
}
