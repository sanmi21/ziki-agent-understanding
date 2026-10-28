# Submission package — Ziki: Review Understanding

## Paste-ready submission

**Title:** Review Understanding — a structured way to question and correct an agent's plan in Ziki

**Live prototype:** https://ziki-agent-understanding.vercel.app/

**Source:** https://github.com/sanmi21/ziki-agent-understanding

**Problem:** An agent can request approval for an approach that misunderstands an issue. Ziki already supports agent questions, owner messages, issue discussions, and approvals. The proposed improvement makes the goal, supporting evidence, assumptions, changes after a correction, and the exact approved plan easier to inspect together inside the issue.

**Solution:** Add “Review understanding” beside “Approve plan” on an agent request. A person can inspect the proposal, question an assumption, supply a correction, and compare the revised plan. They may approve directly when they already understand and agree, or use optional structured confirmation. Corrections clear the prototype's previous authorization, and the result can be compared with the original requirement or reopened.

**Demonstration:** A sample issue asks for the desktop signup form to fit its window while preserving fields and validation. Approving the fictional agent's original proposal makes the form shorter by changing behaviour outside scope. The scripted outcome reveals that mismatch. The correction path produces a layout-only plan; directly approving that corrected plan gives a scope-matching sample outcome. The plan's suitability—not simply the choice of approval route—determines the illustrated result.

**Existing Ziki versus the proposal:** Messages and instructions already let a human redirect an agent; escalations and Activity & Approvals already handle requests and permission gates. Our proposed panel structures the issue-specific understanding and approval record. We do not claim that Ziki lacked human review or that no equivalent capability exists anywhere in the platform.

**Implementation and validation:** A responsive, Ziki-style browser prototype with editable corrections, versioned plans, approval state, persistence, reset, dark/light themes, and 21 passing automated checks. The main approve/consequence/recovery flows were exercised in the browser. No usability study or measured improvement is claimed.

**Scope:** This is an interactive proposal with scripted agent responses, not a production fix in Ziki. It does not call a real agent, change signup code, or enforce server permissions. Real integration must preserve Ziki's distinction between owner guidance and workspace-admin pipeline approval.

## Two-minute demo

1. **0:00–0:20 — Problem.** “Ziki already lets us talk to agents. My improvement makes it easier to see whether we agree on the work before it proceeds.”
2. **0:20–0:40 — Context.** Open Try the proposal. “The issue asks for a layout-only fix. The sample agent proposes removing fields and changing validation.”
3. **0:40–1:00 — Consequence.** Approve plan v1 → Show simulated outcome. “The form fits, but the original scope was not met. Approval alone was not verification.”
4. **1:00–1:25 — Repair.** Reopen and correct → Run simulated re-check. Point to the changed plan. “Now it preserves fields and validation and adjusts layout only.”
5. **1:25–1:45 — Continue.** Approve plan v2 directly → Show simulated outcome. “Direct approval is still valid when we understand and agree. The corrected plan stays within scope.”
6. **1:45–2:00 — Contribution and limits.** “The addition is a clear, issue-specific review and correction loop. Responses are scripted; production integration would use Ziki's existing communication mechanisms and preserve its approval permissions.”

## If the instructor asks

- **“Doesn't Ziki already let us question agents?”** Yes. This improves the structure and visibility of that exchange; it does not introduce messaging or approval for the first time.
- **“What specifically did you add?”** The issue-side understanding/evidence/changes panel, editable correction flow, plan-version approval record, correction invalidation, and requested-versus-outcome demonstration.
- **“Does it prevent real execution?”** No. Pausing and authorization are simulated. A production implementation needs backend enforcement and must respect actions already in flight.
- **“Did you prove it reduces mistakes?”** No. The demo illustrates a plausible failure and recovery. A next user test would check whether people can identify a mismatch and explain exactly what they approved.
- **“Did you rebuild Ziki?”** No. Only the Inbox, one sample issue, the proposed review flow, and explanatory views were recreated.

## Before submitting

- Open the public live URL in a fresh tab; reset the demo.
- Verify both Approve plan and Review understanding are available.
- Run the short demonstration once without changing its scenario.
- Include the live URL, source URL, concise problem/solution, and simulation limitation.
- Ensure the live Current pattern and Why this change text matches this positioning after the final source update.
