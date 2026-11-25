# Security Specification — Aleta Wondo Youth Mutual Aid Edir (Firestore)

## 1. Data Invariants
1. **Verified Identity**: Every authenticated read/write requires `request.auth != null` and `request.auth.token.email_verified == true`.
2. **PII Isolation**: User records (`/users/{userId}`) containing phone, email, address, emergency contacts, and `passwordHash` can only be read by the owning user (`authUid == request.auth.uid` or verified email match) or an authorized committee officer listed in `committee_roster` / bootstrapped admin (`misganalead28@gmail.com`).
3. **Vice Chairperson Authority**: Only the Vice Chairperson (`vice_chair`) or bootstrapped admin (`misganalead28@gmail.com`) can register new users, assign/change roles, reset `passwordHash`, update `portalAccessEnabled`, or delete accounts. Members cannot escalate their own `role` or `portalAccessEnabled` or modify their financial balances (`monthlyDueBalance`, `penaltyBalance`, `specialDueBalance`, `totalPaidEtb`).
4. **No Self-Approval of Payments or Requests**: Members can only create `transactions` with `status == 'pending_verification'` and `requests` with `status == 'pending_vice_chair'`, with `ownerUid == request.auth.uid`. Only Cashier (`cashier`) / Admin can verify or reject receipts and disburse payouts; only Vice Chair can route requests from `pending_vice_chair`; only Chairperson can approve `pending_chair` member/asset approvals.
5. **Terminal State Locking**: Verified/rejected transactions (`verified`, `rejected`) and completed/rejected requests (`disbursed`, `rejected`) are immutable for non-admin users. Audit logs (`/auditLogs/{logId}`) are append-only (`update` and `delete` always denied).
6. **Temporal Integrity & Strict Keys**: Every create enforces `createdAt == request.time` and `updatedAt == request.time`; every update preserves `createdAt` and sets `updatedAt == request.time`, using strict `keys().hasAll(...)` / `keys().hasOnly(...)` and `affectedKeys().hasOnly(...)`.

## 2. "Dirty Dozen" Adversarial Payloads (All Expected: PERMISSION_DENIED)
1. **Unauthenticated Read**: Read `/users/AWY-2026-001` with `auth == null`.
2. **Unverified Email Write**: Create `/requests/REQ-1` with `email_verified: false`.
3. **Role Self-Escalation on Create**: Regular user creates `/users/{uid}` setting `role: "vice_chair"`.
4. **Role Escalation on Update**: Regular member updates own `/users/{uid}` changing `role` to `"cashier"`.
5. **Balance Tampering**: Member updates own `/users/{uid}` setting `monthlyDueBalance: 0, totalPaidEtb: 999999`.
6. **Shadow / Ghost Field Injection**: Create `/transactions/TXN-1` with extra field `isAdminApproved: true`.
7. **Receipt Self-Verification**: Member creates `/transactions/TXN-1` directly with `status: "verified"`.
8. **Request Stage Bypass**: Member creates `/requests/REQ-1` directly with `status: "disbursed"`.
9. **Unauthorized User Password Reset**: Secretary attempts to update `passwordHash` on another user's `/users/{id}` doc.
10. **PII Cross-Member Read**: Member A attempts `get(/users/member-B)` or unfiltered `list(/users)`.
11. **ID Poisoning**: Create `/records/` with a 200-char invalid document ID containing `$` or spaces.
12. **Audit Log Tampering**: Any user (even admin) attempts `update` or `delete` on `/auditLogs/AUD-1`.
