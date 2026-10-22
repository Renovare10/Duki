# Server-side storage cap: plan (not implemented)

Status: plan only. Nothing in AWS or in `portfolio-infra` was changed. Found by read-only inspection on Oct 21, 2026.

## Where the backend is

- Repo: `Renovare10/portfolio-infra` (box checkout `/workspace/portfolio-infra`, on branch `alexandreas-library`; `duki-sync-lambda/index.mjs` is identical to GitHub main 97f98cd).
- `duki.tf`: API Gateway HTTP API `duki-http` (`https://j251m3eof8.execute-api.us-east-2.amazonaws.com`). `GET /me` and `PUT /me` use a Cognito JWT authorizer (issuer = user pool `us-east-2_y5IGDDBu4`, audience = the Duki client). Both go to Lambda `duki-sync` (nodejs20.x, arm64, 256 MB, 15 s).
- Storage: one object per user, `s3://chadm-duki-user/<sub>/state.json`, written whole on every sync. The bucket is versioned and has **no lifecycle rule**, so every sync keeps another full copy forever. That is unbounded storage outside any per-user cap.
- What the Lambda does today: `sub` from authorizer claims; PUT rejects a raw body over 8 MiB (413), checks the JSON has `v === 1`, then `PutObject`. It does no email-verified check, no schema or text-only check, no per-story limit, no handling of `isBase64Encoded`, and no concurrency control (last writer wins).
- `account-janitor-lambda` (account-lifecycle.tf) can delete `chadm-duki-user/<sub>/` for inactive accounts (DRY_RUN defaults to true). That is separate from this cap.
- Terraform has no remote backend block, so state is local and not on the box. Applying needs Chad's machine or wherever the state lives.
- AWS on the box: no `aws` CLI, no `~/.aws`, no `AWS_*` env. The deployed Lambda code and current object sizes could not be checked.

## Enforcement (all in `duki-sync-lambda/index.mjs`, PUT branch)

1. **Auth gate.** Use the authorizer claims. Require `token_use === "id"` and `email_verified === "true"` (HTTP API passes claims as strings) for PUT. Otherwise return 403 `{error:"verify_email"}`. GET stays allowed so legacy and unverified accounts can still read and export.
2. **Decode and parse.** If `event.isBase64Encoded`, decode first. That is transport encoding, not content. Require `content-type: application/json`, reject multipart, and keep a raw-body ceiling (8 MiB) before parsing.
3. **Strict text-only schema.** Port `src/lib/storage-policy.ts`, either shared as a small module or copied with tests:
   - root keys `v, updatedAt, words, texts, sessions, settings` only; row key allowlists; only strings, finite numbers, booleans and null;
   - for `kind !== "paste"`, `body` must be `""`, so a forged `kind: sample` cannot store text outside the quota;
   - `assertPlainText` (control bytes, data:/blob: URLs, media markup, binary signatures, long base64 runs) on new or changed paste rows, title and blurb.
4. **Read current state for atomicity.** `GetObject` the current `state.json` and keep its `ETag` (missing means a new account).
5. **Size.** `bytes = Buffer.byteLength(JSON.stringify(parsed), "utf8")` on the compact re-serialization, and store exactly that string. Since it is one object per user, this number is the user's total. Nothing needs to be summed across objects.
6. **Limits (same rule as the client):**
   - per story: every new or changed `kind: "paste"` row (compared with the stored row by id: body, title, blurb) must be ≤ 512,000 bytes. Unchanged legacy rows are exempt.
   - total: if `bytes > 1,000,000` **and** the write adds or changes a paste story, reject with 413 `{error:"quota", usedBytes, limitBytes:1000000, storyLimitBytes:512000}`.
   - over-cap writes that add no story (progress, words, settings) are accepted, so legacy accounts keep syncing. The 8 MiB raw ceiling still bounds them.
7. **Atomic write.** `PutObject` with `IfMatch: <etag>`, or `IfNoneMatch: "*"` for a first write (S3 conditional writes; the role already has Get and Put, so no new permission is needed). On `412 PreconditionFailed`, return 409 `{error:"conflict"}`. The client then re-pulls, merges and retries. This also fixes today's last-writer-wins data loss between two devices. No two requests can both reserve the same free space.
8. **Usage.** Return `x-duki-usage-bytes`, `x-duki-limit-bytes` and `x-duki-story-limit-bytes` on GET and PUT. Add them to `cors_configuration.expose_headers` in `duki.tf`. The frontend can then show server-confirmed usage. The response body shape stays unchanged.

## Legacy over-cap data

- Never delete or trim. GET serves any existing object, of any size. There is no migration or cleanup job.
- New or grown stories are refused until the account is under 1 MB. Removals and edits that shrink stories are accepted. Removal still needs a tombstone protocol client-side, because the union merge can otherwise bring back a deleted story.
- Before enforcing, measure who is affected (read-only): `aws s3api list-objects-v2 --bucket chadm-duki-user --query 'Contents[?ends_with(Key, \`state.json\`)].[Key,Size]'`.
- Roll out in "report-only" mode first (log would-reject decisions to CloudWatch for about a week), then enforce. Deploy the server before the frontend.

## Decisions for Chad

- **What counts toward 1 MB.** As built, the whole snapshot counts. That includes vocabulary (about 240 B per word record), plus about 0.12 MB of catalog metadata every user carries and about 0.03 MB of sessions. About 3,500 word records alone reach 1 MB, and at that point no uploads are possible. Alternative: count only `kind: paste` story records toward 1 MB, and keep the 8 MiB ceiling for the whole snapshot.
- **Old S3 versions.** Add a lifecycle rule (for example `NoncurrentVersionExpiration` of 30 days, keeping 3 newer noncurrent versions) so storage is actually bounded. This deletes old backup copies only, never current data, but it is still a deletion and needs Chad's sign-off.

## Access needed

- Write access to `portfolio-infra` (a branch plus review). Tests: `node --test` with a mocked S3 client covering exact limit / +1 byte, UTF-8 Chinese, many small stories, a 412 race, forged kind/claims, base64/binary payloads, and legacy over-cap progress-only writes.
- `terraform plan/apply` with the existing local state, using AWS credentials allowed to `lambda:UpdateFunctionCode`, `apigateway:PATCH` (CORS expose headers) and `s3:PutLifecycleConfiguration`.
- Read-only for verification: `lambda:GetFunction` (to confirm the deployed code matches the repo) and `s3:ListBucket` on `chadm-duki-user` (to measure sizes).
