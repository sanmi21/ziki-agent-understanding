# Submission — Point and reply

## Paste-ready description

**Point and reply: visual feedback for human–agent collaboration in Ziki**

Ziki issues contain visual evidence, but on the inspected issue #107, screenshots open separately from the conversation. A human must describe where a problem is, and an agent must infer which part of the image the feedback refers to.

This proposal puts a feedback conversation beside the attachment. The human selects an exact area, writes a note, and answers the agent's contextual question. The agent receives the image version, region, note, and direction together. Replies and sample revisions remain linked, so the human can compare the work and resolve or reopen that feedback.

The UI supports click/drag selection, keyboard-friendly named areas, editable notes, multiple pins, clarification choices, revision comparison, per-image-version anchoring, and resolution/reopening. Existing issue context stays in place. This changes the precision of the exchange rather than adding another task list, progress dashboard, or plan-approval button.

This is an independent functional UI prototype with a scripted agent and illustrated sample images. It does not send real Ziki messages or produce arbitrary AI-generated revisions. User feedback is retained exactly. Preset sample revisions demonstrate how responses attach to feedback; they are not verified fixes. Novelty across every class submission and measured usability improvements are not claimed.

Live URL: https://ziki-agent-understanding.vercel.app/

Source: https://github.com/sanmi21/ziki-agent-understanding

## A 90-second demonstration

1. **Problem (15 seconds):** Close the viewer to show the issue and attachment. Explain: “Instead of describing where I mean, I can point to the work.”
2. **Point (15 seconds):** Open the attachment. Choose Try the button area or drag around the button. Enter feedback or use the example.
3. **Exchange (20 seconds):** Send. The agent asks how broadly it may adjust the layout. Choose Only the selected area. Expand What your agent receives to show the note and image context remain together.
4. **Review (20 seconds):** Compare Original and Revision. The sample increases spacing above the button. Resolve the feedback.
5. **Correct again (15 seconds):** Reopen and explain what still needs attention. Show that the previous messages and original source remain available.
6. **Scope (5 seconds):** “The interaction works; agent responses and spacing revisions are simulated. A real integration would use actual agent messages and revision attachments.”

## What a reviewer can actually do

- Select a region rather than merely click a decorative button.
- Write or change a note and send it with spatial context.
- Choose a scope that changes the preset revision.
- Compare images, keep feedback open, resolve it, or reopen it.
- Switch pins, inspect shared context, and reload without losing this tab's progress.

## Checks and next validation

Run the documented syntax and model tests. Browser verification is recorded in [work-log.md](work-log.md). A next usability check should ask a person unfamiliar with the demo to leave precise feedback and identify the agent's response without coaching. No measured performance or grading claims are made.
