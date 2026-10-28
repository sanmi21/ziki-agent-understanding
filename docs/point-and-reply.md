# Point and reply — implementation and testing

## Purpose and before/after

On the inspected Ziki issue #107, before/after attachments open as raw images in a separate tab while comments are composed in the issue conversation. The proposed viewer keeps the image and a selected feedback thread together. A person can point to a specific area rather than describe its location in prose, and the agent receives the same spatial reference.

The original Ziki navigation is represented by a limited issue shell. The feedback component belongs at an attachment, rather than adding another dashboard or approval workflow. This independent prototype uses an illustrated sample to demonstrate the interaction.

## Architecture

- [index.html](../dist/index.html): app shell, navigation, theme control, announcements, and dialogs.
- [app.js](../dist/app.js): SVG sample renderer, pointer selection, named-area picker, issue/viewer routes, feedback UI, demo-agent timers, and tab persistence. All user text is escaped before HTML rendering.
- [model.js](../dist/model.js): pure transitions, normalized coordinates, versioned image records, source pin filtering, agent context, and storage validation.
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
