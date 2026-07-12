//! Commit–reveal for duel strategies. The "Hidden" serialization already stops
//! an opponent from reading a committed strategy via inspect, but a determined
//! node operator could still see the plaintext in machine state before the
//! other side commits. Commit–reveal closes that: each player first submits
//! `keccak256("<strategy_id>:<salt>")`; only after BOTH have committed does each
//! reveal `(strategy_id, salt)`, which the machine verifies against the stored
//! hash. Neither side can see or change their pick after seeing the other's.
//!
//! Frontend parity: `commit == ethers.utils.id(`${strategyId}:${salt}`)`.

use sha3::{Digest, Keccak256};

/// Canonical commitment for a strategy choice: `keccak256("id:salt")` as a
/// lowercase `0x` hex string.
pub fn compute_commit(strategy_id: u128, salt: &str) -> String {
    let preimage = format!("{}:{}", strategy_id, salt);
    let mut hasher = Keccak256::new();
    hasher.update(preimage.as_bytes());
    let digest = hasher.finalize();
    format!("0x{}", hex::encode(digest))
}

/// True iff the revealed `(strategy_id, salt)` matches the stored commitment.
pub fn verify_reveal(commit: &str, strategy_id: u128, salt: &str) -> bool {
    if commit.is_empty() || salt.is_empty() {
        return false;
    }
    compute_commit(strategy_id, salt).eq_ignore_ascii_case(commit)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn commit_is_deterministic_and_reveal_verifies() {
        let c = compute_commit(3, "f1a9c0deadbeef");
        assert_eq!(c, compute_commit(3, "f1a9c0deadbeef"));
        assert!(c.starts_with("0x") && c.len() == 66); // 32-byte keccak
        assert!(verify_reveal(&c, 3, "f1a9c0deadbeef"));
    }

    #[test]
    fn reveal_fails_on_wrong_strategy_or_salt() {
        let c = compute_commit(2, "salty");
        assert!(!verify_reveal(&c, 5, "salty")); // changed strategy
        assert!(!verify_reveal(&c, 2, "pepper")); // changed salt
        assert!(!verify_reveal("", 2, "salty")); // no commit
        assert!(!verify_reveal(&c, 2, "")); // no salt
    }

    #[test]
    fn case_insensitive_hex_match() {
        let c = compute_commit(1, "abc");
        assert!(verify_reveal(&c.to_uppercase(), 1, "abc"));
    }
}
