# Security Specification - Project Village

## Data Invariants
1. A village must belong to exactly one user (userId).
2. A profile must belong to exactly one user (userId).
3. A username claim must be lowercase and link to a valid userId and email.
4. A clan member must be part of a valid clanId.
5. A message must have a senderId matching the current user.
6. A timestamp must be reasonably close to the server time (or exactly serverTimestamp).

## The "Dirty Dozen" Payloads
1. **Identity Spoofing**: `setDoc(doc(db, 'villages', 'target_user_id'), { ... })` - Should fail if not 'target_user_id'.
2. **Username Hijack**: `setDoc(doc(db, 'usernames', 'existing_username'), { uid: 'my_id' })` - Should fail if 'existing_username' taken.
3. **Ghost Friend**: `setDoc(doc(db, 'users/other_user/friends/my_id'), { ... })` - Adding myself as a friend to someone else without their consent.
4. **Clan Member Inflation**: `updateDoc(doc(db, 'clans/target_clan'), { memberCount: 999 })` - Artificially increasing member count.
5. **Role Escalation**: `updateDoc(doc(db, 'clans/my_clan/members/my_id'), { role: 'leader' })` - Promoting self to leader.
6. **Shadow Field Injection**: `setDoc(doc(db, 'profiles/my_id'), { isAdmin: true, ... })` - Adding unauthorized admin field.
7. **Timestamp Fraud**: `setDoc(doc(db, 'chats/global/messages/msg'), { timestamp: 0 })` - Sending messages in the past or future.
8. **Orphaned Message**: `setDoc(doc(db, 'clans/not_my_clan/messages/msg'), { ... })` - Sending message to a clan I'm not in.
9. **Resource Exhaustion**: `setDoc(doc(db, 'villages/my_id'), { long_string: 'A'.repeat(1000000) })` - Flooding with garbage data.
10. **ID Poisoning**: `setDoc(doc(db, 'villages/../profiles/admin'), { ... })` - Attempting path traversal as doc ID.
11. **PII Leak**: `getDoc(doc(db, 'usernames/some_user'))` - Trying to read another user's email if the rule doesn't restrict it.
12. **Blind List Scraping**: `query(collection(db, 'villages'))` - Trying to download all villages without a filter (Rule must enforce filters).

## Test Runner
(Tests would be implemented in firestore.rules.test.ts if runner available)
