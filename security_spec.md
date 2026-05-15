# Security Specification: Ascend Career Coach

## 1. Data Invariants
- A profile (`/users/{userId}`) can only be created or modified by the authenticated user with the matching `uid`.
- A goal or skill assessment must belong to the user who created it and cannot be moved between users.
- Timestamps (`createdAt`, `updatedAt`) must be server-generated.
- Users cannot see other users' data.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Unauthenticated Write**: Creating a profile without being logged in.
2. **Identity Spoofing**: Creating a profile for `userB` while logged in as `userA`.
3. **Ghost Field Mutation**: Updating a goal with an unauthorized field (e.g., `isVerifiedByCoach: true`).
4. **State Shortcutting**: Skipping "In Progress" to "Completed" (if I had more complex logic, but here I'll check terminal status).
5. **Orphaned Record**: Creating a goal with a `userId` that doesn't match the path.
6. **Self-Promotion**: Updating `experienceYears` to `999`.
7. **PII Leak**: Querying `/users` without a specific `uid` filter.
8. **ID Poisoning**: Using a 2KB string as a `goalId`.
9. **Timestamp Manipulation**: Providing a manual `createdAt` in the future.
10. **Type Mismatch**: Sending a string for `experienceYears`.
11. **Bulk Scrape**: Attempting to list all goals in the system.
12. **Malicious Update**: User A trying to update User B's goal.

## 3. Test Runner Concept
The `firestore.rules.test.ts` will verify these rejections.
