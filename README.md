# Ziki — Point and reply

A focused UI proposal for human–agent visual feedback in Ziki. Select an area of an issue attachment, explain what needs attention, answer the agent in context, and compare a linked sample revision. This replaces the earlier plan-review prototype; that version remains in Git history.

## Implemented features

- **Show what you mean:** move a named part of the controlled sample preview, resize the button, and mark nearby parts **Keep unchanged**. Dragging or keyboard number controls generate exact visual instructions alongside the human's note.
- **Give instructions without typing:** drag the spacing handle between fields and button, use spacing/width sliders or presets, click locks directly on the image, align or nudge the selected part, and choose smaller/original/larger heading text. Review the generated instruction and **Send these changes**; a written note is optional. Fine-tune number fields remain collapsed unless needed.
- **Choose a visual answer:** ordinary feedback still asks about scope, now with two cropped sample previews showing the selected-area and surrounding-layout approaches. Choosing a card sends that scope and produces the corresponding sample revision.
- **Check the returned work:** compare Your intent with the agent sample. Browser measurements check position, size, protected parts, and wording. A labelled scripted mistake moves protected content; the UI flags it, blocks resolution, and offers a corrected sample that is measured again. See [the visual-intent workflow](docs/point-and-reply.md#show-protect-and-compare).

- A visible first-load explanation states the Ziki UI proposal, shows the before/after interaction, and distinguishes the sample signup work from the feedback UI. Try the demo opens the visual controls with no required note; Continue resumes existing feedback. The introduction compacts during interaction and can be reopened.

- Ziki-style issue context and an integrated screenshot workspace. Close the viewer to see the issue and its linked feedback conversations.
- Click to place a pin or drag a region. A named-area picker provides a keyboard-friendly alternative.
- Editable feedback before sending; pending feedback can also be edited or removed, with undo for removal.
- The human and simulated agent use the same record: issue, image version, region, exact feedback, and direction.
- Contextual clarification with two choices and a custom answer. Area-only and surrounding-layout choices produce different preset image changes.
- New revision versions preserve the source image. Original/revision switching, side-by-side comparison on desktop, and zoom/fit controls.
- Feedback can be resolved, reopened with a follow-up, or kept alongside other independent pins. Pins stay on their original image versions.
- Tab-local session persistence, reset, dark/light themes, responsive layout, reduced-motion support, focus indicators, and live announcements.

## Quick start

Requires Node.js 18 or newer. No dependencies, install step, API keys, or build step are required.

```sh
npm run dev
```

Open http://127.0.0.1:4180/. The server binds to this computer only. Opening index.html directly from the filesystem does not support its ES modules reliably. System fonts keep the UI self-contained; no external font request is required.

## Usage

1. Read the short introduction, then choose **Try the demo** to open a selected area and its visual controls. Alternatively, choose **Try the button area**, use **Choose an area**, or click/drag on the screenshot. **Continue the demo** resumes feedback already in this tab; it does not reset it.
2. Type feedback or choose **Use example feedback**, then **Send to agent**. Ctrl/Cmd+Enter also sends the feedback.
3. The scripted agent asks how broadly it may adjust the layout. Choose **Only the selected area**, **The surrounding layout too**, or type your own direction.
4. A sample revision appears. Switch between Original and Revision or choose **Compare images**.
5. Choose **Resolve feedback** or **Needs another pass**. A resolved thread can be reopened; its earlier messages and image versions remain available.
6. Close the attachment to see the issue and its feedback entries. **Reset demo** clears this tab's sample state after confirmation.

For the visual flow, choose **Show what you mean** before sending. Drag the blue outline or orange spacing handle, use the 24 px spacing preset, and click image locks to protect nearby parts. Review **Ready for your agent**, then **Send these changes** without typing. Select a heading to try **Aa Larger**. Compare highlights the sample's extra 12 px movement. Choose **Keep my instructions · show corrected sample**, then resolve once the rendered checks pass. The original screenshot remains unchanged.

See [the submission and demonstration guide](docs/submission.md) for a short presentation and [the implementation notes](docs/point-and-reply.md) for state, inputs, limits, and regression steps.

## Verification

```sh
npm run check
npm test
```

The check script validates JavaScript syntax. The Node tests cover the existing feedback flow plus bounded visual editing, validated intent, shared instructions, protected-area violations, correction, rendered-snapshot comparisons, and resolution gating. Browser verification results are recorded in [the work log](docs/work-log.md); automated model checks alone do not establish that the visual workflow works.

## Existing repository and deployment

- Repository: https://github.com/sanmi21/ziki-agent-understanding
- Existing public URL: https://ziki-agent-understanding.vercel.app/
- Branch: main, explicitly approved by the user.
- Vercel: Framework **Other**, root **./**, no build command, output **dist**. Existing vercel.json is unchanged. No environment variables are needed.

A source push to main can trigger the user's connected Vercel project. No separate deployment command is needed. See [the actual publication commands](docs/push-commands.md). The replacement title and complete sample feedback-to-resolution exchange were browser-verified on the public URL on 28 October 2026. Future pushes still require a separate live check.

## Limitations

This is an independent browser prototype, not Ziki's source or a production integration. It sends no messages or writes to Ziki. Agent replies are scripted; typed feedback is retained exactly but is not interpreted by an AI model. Revisions are preset spacing variations chosen by the nearest named area and the explicit scope choice. They do not promise to fulfil arbitrary instructions. Custom answers are recorded and displayed; the sample renderer does not infer their meaning.

Visual-intent mode directly applies the user's structured position, button width, gap, and heading-text scale choices to named SVG parts. Text sizing applies to the selected heading block, including its accompanying text. Generated feedback uses these structured choices; no language model interprets gestures. Editing and rendered comparison are real browser functions; both the deliberately flawed agent revision and corrected revision are scripted. Checks cover named components' bounding boxes and text, not arbitrary screenshots, pixel appearance, overlapping parts, accessibility, working signup behaviour, or semantic correctness. Existing screenshots cannot automatically become editable parts without an integration that supplies that mapping.

The signup preview is a newly illustrated SVG sample, not the original issue attachment. It supplies work to discuss inside Ziki; this project does not implement a signup fix. The issue context is adapted from [Ziki issue #107](https://ziki.dev/issues/107), inspected on 28 October 2026. Navigation is limited to the relevant issue and attachment views. No code approval, merge authorization, or issue resolution occurs when feedback is marked resolved.

Feedback persists only in this browser tab. Up to 30 threads and 49 revisions are supported. Theme choice is saved separately in local storage. A production version needs authenticated recipients, persistent image/annotation records, actual message delivery, and agent-generated revision attachments. Class-wide novelty and improved usability have not been proven by this prototype.
