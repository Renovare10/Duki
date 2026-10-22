# Server-side storage cap

Status: **implemented on a local branch, not pushed, not applied.** Repo `Renovare10/portfolio-infra`, branch `duki-storage-cap` (worktree `/workspace/portfolio-infra-duki-storage-cap`), based on `alexandreas-library` 5507ccc. Details and deploy steps are in that repo's `DUKI_STORAGE_CAP.md`.

## Where the backend is

API Gateway HTTP API `duki-http` (`https://j251m3eof8.execute-api.us-east-2.amazonaws.com`) has a Cognito JWT authorizer on `GET /me` and `PUT /me`. It calls Lambda `duki-sync` (`duki-sync-lambda/index.mjs`), which keeps one object per user at `s3://chadm-duki-user/<sub>/state.json`. The bucket is versioned and has no lifecycle rule. Before this branch, the Lambda only checked 8 MiB and `v === 1`.

## What PUT /me enforces (`duki-sync-lambda/policy.mjs` + `index.mjs`)

| Rule | Limit | Enforced response |
| --- | --- | --- |
| Verified email (`email_verified` "true", ID token) to save; GET always allowed | – | 403 `verify_email` |
| `content-type: application/json`; API Gateway base64 transport decoded first | – | 415 `content_type` |
| Strict text-only schema: key allowlists, plain strings (same check as the client), no attachments/byte arrays, built-in rows may not carry a body | – | 415 `text_only` |
| Uploaded stories (`kind: "paste"` records, compact UTF-8 JSON, summed); only when a save adds or changes one | **1,000,000 B** | 413 `quota` |
| Each new or changed uploaded story | **512,000 B** | 413 `story_too_large` |
| Whole snapshot; only when a save adds or changes an uploaded story | **6,000,000 B** | 413 `sync_too_large` |
| Raw body, always (unchanged) | 8 MiB | 413 `too_large` |
| Optimistic concurrency: client `If-Match` must equal the current ETag; S3 `PutObject` with `IfMatch` (or `IfNoneMatch: *` on the first write) | – | 409 `conflict` |

- **Atomic per-user bytes.** Each user is one object, so the total is computed from the snapshot being written. The conditional S3 write guarantees nobody else wrote in between, so two concurrent saves cannot both claim the same free space.
- **Legacy over-cap data.** Stored rows with unchanged text are grandfathered and skip the text-only and per-story checks. Saves that add or change no uploaded story are never refused for size below 8 MiB. Nothing is trimmed or deleted, and removals are accepted.
- **Usage headers** on GET and PUT: `etag`, `x-duki-uploaded-bytes`, `x-duki-uploaded-limit-bytes`, `x-duki-story-limit-bytes`, `x-duki-sync-bytes`, `x-duki-sync-limit-bytes`, `x-duki-policy`. `duki.tf` adds `if-match` to the CORS allowed headers and exposes these headers. API Gateway overrides the Lambda's own CORS headers, so this is required.
- **`LOG_ONLY` (default `true`, set in duki.tf).** Violations, stale `If-Match` values and write races are logged as `{"duki":"put-me-policy",...}`, and the save proceeds exactly as today. Set `LOG_ONLY = "false"` to enforce.
- **409 handling in this frontend.** `pullSnapshotWithTag` reads the ETag. `pushSnapshot` sends `If-Match` only when an ETag was readable, so nothing changes before the CORS update. `retryOnConflict` re-fetches, merges as before and retries up to 3 rounds. The live frontend (main) never sends `If-Match`, so it only sees 409 on a true simultaneous write. It shows a sync error and the next sync merges.
- **Tests.** `cd duki-sync-lambda && npm ci && npm test` runs 13 node:test cases against an in-memory S3 that honours IfMatch/IfNoneMatch.

## To deploy (Chad must provide or decide)

1. **AWS credentials and Terraform state.** There is no remote backend and no state on the box; the box has no AWS CLI or credentials. Run `terraform plan` from wherever the state lives. Expected diff: duki-sync code + env `LOG_ONLY`, `duki-http` CORS. The branch is based on `alexandreas-library`, not main, because that matches the newer infra (account janitor, library).
2. **Before enforcing, measure (read-only):** `aws s3api list-objects-v2 --bucket chadm-duki-user --query 'Contents[].[Key,Size]'`. Then review a week of `put-me-policy` logs.
3. **Runtime SDK.** Conditional writes need a Lambda runtime AWS SDK that knows `IfMatch` on PutObject (late 2024+). An older SDK silently drops it: no breakage, but no protection. Verify with the `race` log lines or by using `nodejs22.x`.
4. **Sign-off needed:** an S3 lifecycle rule to expire old object versions (for example 30 days, keep 3). It is not added. Today every sync keeps a full old copy forever.
5. **Order:** apply the server (log-only), deploy this frontend, review the logs, then set `LOG_ONLY = "false"`.
