# Ziki — Review understanding

A focused, independent human–agent interaction prototype. A person can inspect an agent's understanding, challenge an assumption, correct its direction, and confirm a revised plan before authorizing work.

## Submission positioning

This is a proposed interaction improvement to Ziki's existing human–agent workflow. Ziki already has owner messages/instructions, questions/escalations, issue discussions, and separate pipeline approvals. The contribution is an issue-specific structured review that makes assumptions, corrections, plan changes, and approval scope easier to inspect. It is not a new underlying messaging system, a production integration, or a measured reduction in errors.

Live submission: https://ziki-agent-understanding.vercel.app/ — the existing deployed main workflow was browser-verified on 28 October 2026. Local packaging edits require a subsequent source push before they appear live. See [submission text and demo script](docs/submission.md).

## Implemented features

- Screenshot-matched Ziki Inbox composition on **Try the proposal**: app-first header, toolbar, status navigation, Inbox explanation with agent panel, three Inbox lists, and a sample request. Presentation navigation sits below the app. Only the screens relevant to this proposal are recreated.
- Integrated review panel with Understanding, Evidence, and Changes tabs.
- Editable human corrections, a clearly scripted re-check, visible revised scope, and plan versions.
- Direct **Approve plan** and **Review understanding** choices on the request and issue. The optional structured route keeps confirmation separate from approval; a correction invalidates either approval route.
- Simulated work/outcomes compare the approved plan with the requested scope. The original wrong plan makes the form fit by removing a field and changing validation; the corrected plan preserves behaviour. Pause/correct during work or reopen a result to recover. No actual changes or damage occur.
- Current-pattern comparison and an explanation of the problem, interaction choices, attribution, and production limitations.
- Dark/light themes, responsive layouts, keyboard tabs/focus, polite announcements, and tab-local progress with reset.

## Quick start

Requires Node.js 18 or newer. There are no dependencies to install and no build step.

```sh
npm run dev
```

Open http://127.0.0.1:4180. The server binds only to this computer. An optional Google Font falls back to local sans-serif fonts offline.

## Usage

1. In **Try the proposal → Inbox → Need your input**, choose **Review understanding** to question the plan, or **Approve plan v1** to authorize the shown proposal directly. Other Inbox categories show the reference-style empty state; **Clear filters** returns to the sample request. Status tabs open a focused sample issue list. Search filters that one issue; other toolbar tools explain their prototype scope.
2. Read the proposed approach and inspect **Evidence**. The layout-only issue conflicts with the sample agent's proposal to remove fields and change validation.
3. Select **That's outside scope** or enter your own correction, then send it for re-evaluation.
4. Choose **Run simulated re-check**. Review the changed plan and constraints.
5. Approve the revised plan directly if you already understand and agree. Alternatively, check the three agreement statements, confirm understanding, and then separately approve that plan version.
6. Show the simulated outcome. Reopen/correct the result, or reset to replay.

To demonstrate the risk: reset → **Approve plan v1** → **Show simulated outcome**. The visual-fit example passes, but preserving fields and validation fails. Choose **Reopen and correct**, run the simulated re-check, then approve v2 directly to compare. A bad outcome comes from the wrong plan, not automatically from using direct approval. **Pause and correct** can also stop the simulated work before the result.

Corrections can also be sent during simulated work. They pause that workflow and clear its previous approval. Free-text input is recorded exactly, but the response is a fixed signup scenario: the prototype does not interpret arbitrary constraints. Do not enter sensitive information.

## Architecture

- [dist/model.js](dist/model.js): pure state transitions and validation of restored tab state, including direct/reviewed approval mode and plan version. Phases: request → rechecking → revised → agreed → working → delivered. Corrections return the flow to rechecking; reopening a result does the same.
- [dist/app.js](dist/app.js): page rendering, correction entry, keyboard controls, theme, and `sessionStorage` progress. User-entered content is escaped before rendering.
- [dist/styles.css](dist/styles.css): presentation and issue/review layout. [dist/prototype.css](dist/prototype.css) scopes the screenshot-matched Inbox and app header to the proposal view, including responsive and light-mode variants.
- [serve.mjs](serve.mjs): allowlisted local static server.
- [checks/model.test.mjs](checks/model.test.mjs): meaningful state/approval, persistence, and asset checks.

## Verification

```sh
npm run check
npm test
```

Browser regression workflow: perform the six steps above; use Evidence and Changes; correct an already approved plan and verify approval clears; reload to restore tab progress; reset; repeat at phone width and in light mode. Use keyboard Tab and arrow keys on the review tabs. All 21 automated checks and syntax checks passed. The desktop browser completed the main exchange through reopening, restored state after reload, and visually checked light mode. Phone-width visual verification remains outstanding. Details are in the [work log](docs/work-log.md).

## Vercel deployment — user-operated

Source repository: [sanmi21/ziki-agent-understanding](https://github.com/sanmi21/ziki-agent-understanding).

1. In Vercel, choose **Add New → Project** and import `sanmi21/ziki-agent-understanding`.
2. Set **Framework Preset** to **Other** and keep **Root Directory** as `./`.
3. Confirm **Build Command** is empty (enable its override if needed) and **Output Directory** is `dist`. The tracked [vercel.json](vercel.json) already declares these settings.
4. No environment variables or custom install command are required. This project has no dependencies and no build step.
5. Click **Deploy** yourself. When Vercel reports Ready, open its generated URL.
6. Verify all three presentation views, then complete the review/correction/approval/result flow. Check light mode and reset the demo.

The user requested deployment instructions only. No deployment has been performed or verified by Codex. See [push-commands.md](docs/push-commands.md) for the source publication commands.

## Limitations and attribution

This is a browser-only interaction demonstration, not Ziki's source or a live integration. The agent proposal, re-check, and completion are fictional. No AI agent runs, no repository is inspected, no real tests against Zedu run, and nothing is written to Ziki. Direct approval is intentionally allowed without structured confirmation. Client-side approval gates illustrate the experience; production enforcement requires an authenticated backend.

The sample scenario paraphrases the layout-only report in [Ziki issue #106](https://ziki.dev/issues/106), inspected on 27 October 2026. The supplied reference header displays the user-provided account name, points, and notification badge as a static visual snapshot; these are not live account data. The agent and issue interaction remain sample data. Other contributors' identities are not reproduced. Ziki's styling and locally recreated logo are used for a presentation prototype.

[Michael Churchill's Ziki Desk](https://ziki-desk.vercel.app/) was reviewed as related work, helping distinguish this proposal from a decision-dashboard redesign. No code from that prototype is used. This proposal is independently focused on correcting and agreeing on an agent's understanding inside the issue.
