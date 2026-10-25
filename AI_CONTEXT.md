# AI Context

Repository-level engineering guidance. `AGENTS.md` and `CLAUDE.md` are symlinks
to this file, so every agent reads the same source of truth. These notes do not
replace the framework docs, types, or tests.

## Brand: read before designing or writing anything

Brand and voice documents live in `docs/`. Read every document there before any
work that a visitor will see: page copy, headings, microcopy, labels on
diagrams, layout, type, colour, imagery, motion, or naming. Those documents
outrank anything in this file on those questions. Until they exist for this
site, flag missing brand guidance instead of inventing it.

A few constraints that are violated most easily:

- **Write the way Calin talks.** Short, plain, concrete. If a sentence could
  not be said out loud to a client across a table, cut it. Copy that reads as
  AI-generated is the exact failure mode to avoid.
- **No em-dashes anywhere in copy.** Use commas, colons, periods, or split the
  sentence.
- Do not invent proof: no fabricated client names, logos, statistics, or
  credentials. Leave a placeholder and flag it instead.

## Project

- Next.js 16 (App Router) + React 19 + CSS Modules + TypeScript.
- Static export (`output: "export"`) deployed as a Cloudflare Worker with
  Workers Static Assets; any runtime API handlers live in a module Worker, not
  in Next.js server features. `wrangler.toml` is the deployment source of
  truth, and `docs/deployment.md` documents the pipeline once it exists.
- Source lives in `src/`, imported through the `@/*` alias.
- Checks: `npm run lint` and `npm run build` (the build runs TypeScript).
  Run both before any push.
- Site copy lives in `src/lib/site.ts`, not inside components. The production
  palette and type scale live in `src/app/page.module.css`; font files are
  configured in `src/app/layout.tsx`.

## Implementation Preferences

- Always prefer the best long-term production solution. Boil the ocean, do
  things end-to-end, never be lazy and do half a job.
- Never do half a job. If a change fixes a defect on one path while the same
  defect stays live on an adjacent path — especially when the new mechanism
  already covers it — the job is not done: convert the adjacent path in the
  same effort, do not park it as a residual. Two legitimate reasons to stop
  short, and both must be stated explicitly with the reason: another
  workstream already owns that adjacent fix (check open PRs/branches and
  coordinate instead of duplicating their work), or the remaining piece is
  genuinely large or risky enough to stand alone.
- One mechanism, almost never guards. "End-to-end" means covering the full
  lifecycle and edge cases of ONE mechanism, never stacking redundant ones. A
  defensive check, fallback, retry wrapper, clamp, or extra validation layer
  around a symptom is nearly always the wrong fix: root-cause the real issue
  and build an implementation robust enough not to need it. A diff that wraps
  a failure point instead of removing the failure mode means the diagnosis is
  not done — keep digging until the bad state is unrepresentable or the
  failing path is correct by construction. Self-test before shipping: if the
  diff's own error/fallback path accepts the primary mechanism's output
  unmodified, or two parts of the diff share the same success criterion, one
  layer is redundant — delete it. The only legitimate guards are safety,
  privacy, formatting, and idempotency gates on SIDE EFFECTS, plus
  provider/network boundaries genuinely outside our control — one guard at the
  right boundary, scaled to observed failure frequency, never speculative
  layers on every request.
- No speculative bookkeeping: do not write events, markers, or state fields
  for situations that cannot occur under the code as shipped. Add them in the
  change that adds their consumer.
- Never dual-write old and new versions of a field, prop, or contract as a
  transition shim; replace the old one outright and migrate every consumer in
  the same change.
- Keep behavior changes covered by narrow tests that reproduce the observed
  failure when possible.
- Tests should prove behavior, transformation, boundaries, or regression risk.
  Do not add assertions that merely restate a static constant or check x = x
  when there is no independent code path and effectively zero chance of
  divergence.
- When a failure is hard to classify from existing output, add targeted
  diagnostic logging at the boundary being debugged. Prefer structured
  identifiers, state classifications, and causal fields that would make the
  same issue diagnosable next time without guessing.
- When changing a shared contract — a component prop shape, an exported type,
  a data module, a route signature — audit every consumer before shipping.
- When debugging CI or deploy failures, inspect the run and logs directly with
  available tools. Do not tell the user to go check a site or dashboard.

## Model Roles And Sub-Agent Orchestration

Delegate implementation to Sol BY DEFAULT — as much as possible, not just for
large features. Any change that touches code, styles, config, or tests goes to
a Sol sub-agent; a small bug fix is simply a one-agent wave, not a reason to
hand-write it. Fable implements directly only in these narrow cases:

- one-to-few-line seam/integration fixes found while reviewing a wave's diff
  (and even there, prefer a follow-up sub-agent when the fix grows beyond a
  couple of lines or spans files);
- mechanical merge/rebase conflict resolution;
- docs-only edits (`README.md`, `docs/*`, `AI_CONTEXT.md`) and `.context/`
  scratch files;
- read-only investigation, log tracing, and diagnostics (though Sol sub-agents
  can also run these when parallel legwork helps).

When in doubt, delegate. "It's faster to just do it myself" is not an
exception — writing the prompt file IS the orchestrator's implementation step.
The roles across the two model tiers:

- Claude Fable 5 (the main interactive session) owns product thinking, written
  plans (`docs/*-plan.md`), decomposition into waves, sub-agent prompt
  authoring, diff review between waves, cross-agent seam fixes, root-level
  verification, and the final intentional commit. The orchestrator is
  accountable for the end state; sub-agents are not. The orchestrator does NOT
  hand-write feature code or tests outside the exceptions above.
- Codex GPT-5.6 Sol at high reasoning implements each scoped task as a
  non-interactive sub-agent (high, not xhigh — xhigh runs took over an hour per
  wave for no observed quality gain):
  `codex exec --ignore-user-config -m gpt-5.6-sol -c model_reasoning_effort='"high"' --sandbox workspace-write -C <repo-root> -o <report-file> --color never - < <prompt-file>`
  (`--ignore-user-config` keeps sub-agent runs isolated from personal config
  drift; auth still resolves from `CODEX_HOME`. Use the explicit `gpt-5.6-sol`
  id, not the `gpt-5.6` alias.)

Process contract for each implementation wave (a "wave" can be a single agent —
small fixes scale the brief down, never the mechanics):

- Write the full task brief to a prompt file under `.context/` (gitignored) and
  capture the agent's final report with `-o` next to it. Run agents in the
  background and review reports plus `git diff` before the next wave. This
  applies to one-agent bug-fix waves too: prompt file, background run, report +
  diff review. Follow-up fixes from PR review and CI failures are
  implementation work and default to Sol sub-agents the same way, unless they
  fall under the inline exceptions above.
- NEVER kill processes by bare name or pattern (`pkill codex`,
  `pgrep -f "codex exec" | xargs kill`, etc.). Conductor runs many workspaces
  on this machine in parallel, and a name-pattern kill will take down ANOTHER
  session's live sub-agents. Stop your own background work through the
  harness's task-stop facility; if a shell kill is unavoidable, match on this
  workspace's absolute path (`pgrep -f "codex exec.*$(pwd -P)"`) and inspect
  the `pgrep -fl` output before signalling anything. Sub-agents needing network
  access under codex `workspace-write` sandboxing take
  `-c sandbox_workspace_write.network_access=true` (TOML dotted key, not a JSON
  string).
- Every sub-agent prompt must open by stating the agent IS the implementing Sol
  sub-agent and must implement directly — never delegate to another agent.
- Every sub-agent prompt must state: the plan doc section it implements, an
  explicit file-scope boundary (what it owns, what it must not touch), the repo
  conventions that apply, a requirement to read `git status`/`git diff` first
  so it builds against prior agents' actual APIs, a no-commit/no-push rule, and
  a required final report format (files changed, decisions, verbatim check
  results).
- Sequence waves so no two concurrent agents touch the same file. Shared files
  like `src/app/layout.tsx`, `src/app/globals.css`, and `src/lib/site.ts` force
  serialization; parallelize only disjoint areas.
- Sub-agents run and fix their own checks; the orchestrator runs `npm run lint`
  and `npm run build` after the final wave, fixes integration seams (directly
  or via a follow-up sub-agent), and makes the commit.

## Release Workflow

- Do not automatically push, deploy, or open a PR after making changes. Keep
  changes local until the user asks for a PR or explicitly asks to push.
- Default flow is branch-then-PR into `main`: work on a feature branch, run
  the checks, push the branch, open the PR. Do not develop directly on
  `main`.
- Exception: documentation-only changes (`README.md`, `docs/*`,
  `AI_CONTEXT.md`) may be pushed straight to the default branch without a PR.
  Anything touching code, styles, config, or tests goes through the PR flow.
- When the user asks for a PR, inspect the diff, run the checks, commit
  intentionally, push the branch, and open the PR ready for review. Do not open
  a draft PR unless the user explicitly asks for a draft.
- After every push, work the PR in this strict order:
  1. Wait for the automated review to complete BEFORE anything else. A review
     bot's CHECK conclusion can report "pass" even when its REVIEW left
     findings — never treat the check status as the review verdict. Read the
     review body and the inline comments
     (`gh api repos/<org>/<repo>/pulls/<n>/comments`) and count the findings.
     Never manually re-trigger the review; it runs automatically on every push,
     and the automatic run reviews only the new commits' delta while a manual
     re-trigger re-reviews the entire PR — slower, noisier, and it burns quota.
  2. Fix review findings before anything else. Real findings get fixes pushed
     to the same branch; false positives get a written rebuttal in the PR
     conversation, never silence.
  3. Then fix CI if any workflow failed.
  4. Then check mergeability (`gh pr view <n> --json mergeable`) and resolve
     conflicts by rebasing onto the base branch. A CONFLICTING PR gets no CI
     runs, so conflicts silently mask everything above.
  5. Every push restarts this sequence from (1). Merge only when the latest
     head has a completed review with zero unaddressed findings, green CI, and
     MERGEABLE state.
- Do not push directly to `main` unless the user explicitly requests it or
  asks for an urgent hotfix. If using the hotfix exception, say so, keep the
  commit narrow, run the checks, push, and monitor the deploy to completion.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
