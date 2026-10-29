# Submission — Point and reply

## Paste-ready description

**Point and reply: visual feedback for human–agent collaboration in Ziki**

Ziki issues contain visual evidence, but on the inspected issue #107, screenshots open separately from the conversation. A human must describe where a problem is, and an agent must infer which part of the image the feedback refers to.

This proposal puts a feedback conversation beside the attachment. The human selects an exact area and can demonstrate the desired change by moving the part, resizing the button, and protecting nearby content. The agent receives the image version, region, exact note, intended geometry, and protected areas together. The returned sample is compared against that intent using real browser measurements; unexpected changes are highlighted and corrected before resolving the feedback.

The UI supports click/drag selection, keyboard-friendly named areas, editable notes, multiple pins, clarification choices, revision comparison, per-image-version anchoring, and resolution/reopening. Existing issue context stays in place. This changes the precision of the exchange rather than adding another task list, progress dashboard, or plan-approval button.

This is an independent functional UI prototype with a scripted agent and illustrated sample images. It does not send real Ziki messages or produce arbitrary AI-generated revisions. User feedback is retained exactly. Preset sample revisions demonstrate how responses attach to feedback; they are not verified fixes. Novelty across every class submission and measured usability improvements are not claimed.

Live URL: https://ziki-agent-understanding.vercel.app/

Source: https://github.com/sanmi21/ziki-agent-understanding

## A 90-second demonstration

1. **Problem (15 seconds):** Open the URL. The first-screen headline explains screenshot feedback for agents, with a Before / With this UI comparison. Explain: “Ziki already supports screenshots. Our change lets me point to the part I mean and discuss it beside the image.”
2. **Point (15 seconds):** Choose Try the demo. The introduction compacts, the button area is selected, and visual controls appear with no required note. Drag or use a preset. You can also select another area yourself.
3. **Show (20 seconds):** Drag the orange spacing handle or select 24 px. Optionally resize the button. Click a lock on the image to keep a nearby part unchanged. Point out the generated instructions, then Send these changes; no typing is needed.
4. **Catch (20 seconds):** Your intent / Agent sample comparison opens. The deliberately flawed sample moved the protected fields 12 px. The rendered checks flag it and Resolve stays disabled.
5. **Correct (15 seconds):** Choose Keep my instructions · show corrected sample. The corrected layout is measured again, the checks pass, and you can resolve. The source and earlier revision remain in history.
6. **Scope (5 seconds):** “The interaction works; agent responses and spacing revisions are simulated. A real integration would use actual agent messages and revision attachments.”

## What a reviewer can actually do

- Select a region rather than merely click a decorative button.
- Write or change a note and send it with spatial context.
- Choose a scope that changes the preset revision.
- Compare images, keep feedback open, resolve it, or reopen it.
- Demonstrate an exact change, protect nearby parts, catch a measured violation, and compare a corrected sample.
- Change spacing or text size through gestures and visual presets; send automatically composed instructions. Answer the ordinary scope question by choosing between preview cards.
- Switch pins, inspect shared context, and reload without losing this tab's progress.

## Checks and next validation

Run the documented syntax and model tests. Browser verification is recorded in [work-log.md](work-log.md). A next usability check should ask a person unfamiliar with the demo to leave precise feedback and identify the agent's response without coaching. No measured performance or grading claims are made.
