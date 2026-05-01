# Security Specification (Anti-Cheat & Data Integrity)

## Data Invariants
1. **Resource Integrity:** Total resources cannot exceed storage capacity by more than a 10% buffer (loot overflow).
2. **Action Lineage:** A building cannot be upgraded unless its requirements (Era, Resources) are met.
3. **Identity Locked:** Only the authenticated owner (`uid`) can modify their specific village document.
4. **Temporal Consistency:** `syncedAt` must be updated using server-side timestamps where possible, or validated against `request.time`.

## The "Dirty Dozen" Payloads (Red Team Tests)

1. **The Millionaire injection:** Attempt to set `resources.gold` to `999,999,999` on a level 1 account.
2. **Shadow Field Attack:** Add `isVerified: true` or `isAdmin: true` to a profile update.
3. **Negative Cost Exploit:** Set building level to `-1` to try and trigger a resource refund.
4. **Ownership Spoofing:** Attempt to update `villages/OTHER_USER_ID` while logged in as `USER_A`.
5. **Instant Upgrade:** Send a payload where `level` increases by 5 ranks in a single write without cost deduction.
6. **Negative Resource Spending:** Send a payload with `resources.wood: -5000` to try and flip an unsigned integer.
7. **Identity Hopping:** Change `userId` field inside a document to a different UID.
8. **Era Skip:** Set `era` to `atomic` while buildings are still `primal`.
9. **Spam Sync:** Sending 100 sync requests within 1 second.
10. **Orphaned Troop:** Attempt to add units to `army` without having the required `barracks` level.
11. **PII Leak:** Attempt to 'list' all `villages` to scrape player emails.
12. **Status Lock Bypass:** Attempt to change a completed `quest` status back to `active` to re-claim rewards.

## Enforcement Strategy
- **Firestore Rules:** Use `isValidVillage()` helper to enforce strict schema.
- **Client Sanitization:** `useGameStore` will locally validate all state changes before attempting cloud sync.
