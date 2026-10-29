# Point and reply — implementation and testing

## Purpose and before/after

On the inspected Ziki issue #107, before/after attachments open as raw images in a separate tab while comments are composed in the issue conversation. The proposed viewer keeps the image and a selected feedback thread together. A person can point to a specific area rather than describe its location in prose, and the agent receives the same spatial reference.

The original Ziki navigation is represented by a limited issue shell. The feedback component belongs at an attachment, rather than adding another dashboard or approval workflow. This independent prototype uses an illustrated sample to demonstrate the interaction.

## Architecture

- [index.html](../dist/index.html): app shell, navigation, theme control, announcements, and dialogs.
- [app.js](../dist/app.js): SVG sample renderer, pointer selection, named-area picker, issue/viewer routes, feedback UI, demo-agent timers, and tab persistence. All user text is escaped before HTML rendering.
- [model.js](../dist/model.js): pure transitions, normalized coordinates, versioned image records, source pin filtering, agent context, and storage validation.
- [intent.js](../dist/intent.js): controlled component geometry, validated visual instructions, readable instructions, revision layouts, browser SVG measurements, and comparison checks.
- [intent.test.mjs](../checks/intent.test.mjs): visual-instruction and correction regression tests.
- [styles.css](../dist/styles.css): dark/light tokens, responsive screenshot/conversation layout, focus styles, and reduced motion.
- [model.test.mjs](../checks/model.test.mjs): regression tests using Node's built-in test runner.
- [serve.mjs](../serve.mjs): allowlisted static local server on 127.0.0.1:4180. Vercel serves dist directly via its existing configuration.

## Data and mechanism

A feedback record contains a stable ID and number, image version, normalized region x/y/w/h in the range 0–1, a nearest named sample area, exact human text, scope text/mode, message history, phase, and optional revision ID. The named area selects a preset demonstration; the exact selected rectangle remains the real feedback reference. Image coordinates are independent of display size and zoom.

The agentInput function reads this record rather than reconstructing context from visible chat. The interface exposes a readable context summary and optional Copy context control. Clipboard access can fail; the context stays readable in the panel.

Flow: sent → question → working → ready → resolved. Reopening returns a ready/resolved thread to sent and retains history. Editing a pending note requests a fresh response. Removal is allowed only before a revision exists and has an immediate undo option.

Revisions append immutable image-version records and reference their parent. A thread's pin remains anchored to the image selected when that feedback began. Switching to a new image does not transfer old pins. New feedback on a revision belongs to that revision.

## Inputs and validation

Feedback and custom answers require at least three non-whitespace characters and accept up to 1500 characters. Invalid coordinates, unknown image versions, and invalid transition orders are rejected. Coordinates are bounded to the image; tiny click selections have a minimum visible size. The demo supports up to 30 threads and 50 total image versions including Original. Invalid stored state resets safely to a fresh demo.

State is saved under ziki-point-and-reply-v1 in sessionStorage. The old prototype's storage is not reused. Unsent drafts are not persisted across reloads. The theme uses ziki-feedback-theme in localStorage. Storage failure displays a notice and leaves the current in-memory session usable.

## Simulation boundary

Replies and short response delays are scripted. No server, AI call, real Ziki recipient, delivery acknowledgment, or execution authorization exists. Area-only adjusts one preset component; surrounding-layout mode also adjusts a neighbouring component. A custom answer is recorded but not semantically interpreted. Preview variations are illustrative spacing changes, not arbitrary image generation or verified fixes.

A production integration must preserve source asset versions, route messages to authorized issue participants/agents, enforce access server-side, and attach real revisions to feedback IDs. Feedback resolution must remain separate from issue closure and pipeline approvals.

## Repeatable browser regression

Prerequisite: npm run dev; open the HTTP URL, not a file URL.

1. Reset. Click the sample button or use Choose an area → Create account button. Expected: selected region and editable feedback composer. Empty feedback cannot send.
2. Send example feedback. Expected: a numbered source pin and an agent question. Open What your agent receives; exact note and source are present.
3. Choose Only the selected area. Expected: a new sample image version, with a larger gap above the button; Original remains unchanged. Compare images.
4. Resolve, reload, and reopen with a new note. Expected: resolution survives reload; follow-up retains source and earlier revision history. Choose surrounding layout; the neighbouring field spacing also changes.
5. Drag another region, send different feedback, and switch threads. Expected: distinct pin numbers, notes, and image references. Edit a pending note; remove and undo it.
6. Create feedback on a revision. Return to Original. Expected: the new pin appears only on its own source version; it does not drift onto Original.
7. Zoom in/out and fit. Expected: normalized regions remain on their selected content. Use keyboard selection and send via Ctrl/Cmd+Enter.
8. Check 1440px desktop and 390px phone layouts in both themes. Expected: desktop image/thread split; phone stack; no horizontal page overflow; controls remain usable.
9. Close the viewer. Expected: issue view lists feedback; selecting an entry returns to its thread.

Run npm run check and npm test. Record actual browser results and outstanding limitations in the work log. No usability improvement percentages or approval guarantees should be claimed without separate evidence.

## Verification evidence

All 23 automated checks and JavaScript syntax checks passed. Browser testing covered the main exchange, both scope choices, custom answers, reopening, multiple pins, edit/removal/undo, image-version anchoring, reload persistence, keyboard sending, zoom positioning, and desktop/phone dark/light layouts. There was no horizontal phone-page overflow and no captured browser console errors. These checks do not constitute an assistive-technology audit or usability study.

Visual references: [first use](point-and-reply-empty.png), [feedback exchange](point-and-reply-feedback.png), [comparison](point-and-reply-comparison.png), [light theme](point-and-reply-light.png).

## First-load explanation and demo entry

On every page load, a visible introduction leads with “Give your agent feedback, right on their screenshot.” It explains that screenshot sharing already exists in Ziki and that the proposed addition is pinned feedback and a conversation beside the image. A before/after comparison and three short steps introduce the mechanism. A visible note identifies the signup attachment as sample work and the agent replies/revisions as simulated.

Try the demo opens the button’s visual controls with an empty optional note; it does not send feedback automatically. The introduction compacts to free workspace space. About this proposal expands it again. Continue the demo preserves an in-memory feedback draft or resumes existing sent feedback; reload shows the full explanation again. Reset clears the demo after confirmation and restores the full introduction.

Check the initial URL with no hash and with #review, on desktop and phone. The headline and start/continue action should be visible without scrolling on the checked phone viewport. Start, adjust a gap or add an optional note, reopen the explanation, and continue; the draft must remain. Send feedback, reload, and continue; the sent note must remain.

First-load visual QA: [desktop](first-impression-desktop.png) and [phone](first-impression-phone.png). At the checked 390×844 viewport, the full proposal headline and demo action are visible without scrolling; both themes were inspected.

## Show, protect, and compare

**Purpose:** a pin supplies the location, but “more space” still leaves the desired result open to interpretation. This optional mode lets the human demonstrate the desired layout and explicitly identify content that must stay unchanged. The agent context contains those instructions as structured data and plain language.

1. Start feedback on the Create account button and choose **Show what you mean**.
2. Drag the outlined part, its width handle, or the orange spacing handle between fields and button. Spacing/width sliders and 8/16/24/32 px presets offer alternatives to precise dragging. Nudge buttons move 4 px; arrow keys on the image selection move 1 px (Shift: 8 px). Horizontal dragging snaps within 7 sample pixels of nearby alignment lines. **Align with original** restores the source's horizontal alignment; a guide marks it. **Fine-tune position** exposes optional number fields. The source stays immutable; the preview is labelled **Your intent**. **Remove** discards only visual instructions, retaining any note.
3. Click the locks directly on the image, or the matching **Keep unchanged** chips. Both change the same protected-part list. Form fields are protected by default for this example. Wording is always retained. The generated sentence updates as the person edits. Selecting Page heading or Welcome panel also offers Smaller / Original / Larger text-size buttons for that entire text block.
4. Review **Ready for your agent**, then **Send these changes**. No typing is required: when the optional note is empty, the generated sentence becomes the human feedback. A supplied note is retained exactly alongside the structured visual contract. The source image, region, desired layout/text scale, protected part IDs, and source geometry/text snapshot are included. The scripted agent restates these instructions and returns a sample without asking the old scope question.
5. **Your intent / Agent sample** comparison opens. The first labelled test revision deliberately moves the first protected part by 12 px. The browser measures the rendered SVG parts and flags the changed area. Resolution stays disabled.
6. **Keep my instructions · show corrected sample** appends a corrected version. Measurements run again; the intended position/size, protected areas, and wording must match before the UI enables resolution. A pure model guard also rejects resolution of the known incorrect layout.

No new dependencies, configuration, server, AI call, or live message delivery is required. Position is expressed in the sample's 960×600 coordinate system and remains independent of zoom. Sliders, presets and number fields provide keyboard and touch alternatives to dragging. Width editing applies only to the button (280–340 px); movement is clamped to the sample bounds. The gap is derived from button top minus field bottom; limits are shared with the bounded button position (440–490 px). Heading scale is constrained to 90–115% in 5% steps, with 90/100/110% UI presets. Text scale persists in version records and validation rejects unsupported targets or values. This demonstration does not validate collisions or usability of the resulting signup design.

The source browser snapshot is captured when visual mode starts and included in the agent context. During comparison, the immutable source is also measured at the revision’s current display scale to avoid text rounding differences after a viewport or zoom change. `measureSvg` reads each named SVG group's bounding box, transforms it into image coordinates, and captures its wording. `compareSnapshots` compares the returned rendered measurements against the source plus intended deltas, using a tolerance below 1 sample pixel. Missing measurements fail closed. This is not a full pixel comparison or AI evaluation. It checks only the five named components, not all chrome or signup functionality. An arbitrary uploaded bitmap is not editable or measurable with this mechanism without a component mapping.

For text-size changes, the intended part is measured from the **Your intent** preview so the expected box includes its new font geometry. Protected parts and wording are still checked against the source. The pure model also checks the requested text scale before resolving. Ordinary feedback retains its clarification step, now with cropped preview cards; each card is computed by the same answer/revision transitions used after selection, without mutating stored state. These are labelled approach previews, not AI-generated options. A custom text answer remains available.

Visual instructions are optional on schema-1 records, so old sessions remain valid. Revisions are immutable and retain parent links; snapshots and intent persist in the existing tab-local session record. Unsent visual drafts, like unsent text, are not persisted. Reopening retains the original visual contract; create a new feedback pin to demonstrate a different layout. Copy context includes the complete visual instructions. Browser check results are not persisted; comparison measures again after reload.

### Repeatable visual-intent checks

- Open Try the button area → Show what you mean. Leave the note empty. Drag the orange gap handle, choose a 24 px preset, and change width using its slider. Confirm preview, marker, slider values, and readable sentence agree. Click an image lock; the corresponding chip must agree. Send without typing and inspect the generated human message.
- Select Page heading → Show what you mean → Larger. Nudge with keyboard arrows. Send without typing, request the corrected sample, and verify its measured position/size passes and wording stays unchanged. Reload and compare again.
- Send ordinary example feedback without visual mode. Confirm the two cropped scope cards appear, and each chooses its own area/layout scope. A custom answer must still work.
- Protect fields and another part, then send. Confirm the returned comparison flags the 12 px violation and Resolve is disabled. Request the corrected sample; all displayed checks should pass and Resolve should work.
- Reload and Continue. Confirm the note, visual instructions, source and both revisions remain; comparison recomputes its measurements.
- Create ordinary text-only feedback on a revision. Confirm the old clarification flow remains usable. Remove visual mode before sending; only the note should be sent.
- Use keyboard number controls and checkbox controls on phone and desktop; check both themes and page overflow. Verify no console errors. Run `npm run check` and `npm test`.
