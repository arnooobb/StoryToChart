# Session log

## 2026-09-05 — Continuation stall investigation

Read the Enhance Story to Chart task (01a06f01-2daa-71c2-a1a1-c610885ecfe2). Both recorded turns completed; the enhancement turn lasted about 16 minutes 37 seconds and saved this comparison version. Its browser history includes sandbox localhost-binding failures and a later browser-server restart that lost the in-page regression result. These support a browser automation/session problem, but do not establish the cause of a separate Codex interface stall while resuming.

Fresh verification in an isolated gstack browser with permitted localhost access: index.html opened, all 22 browser-workspace assertions passed, and the completed screenshot was inspected at /tmp/story-hang-diagnostic-01a06f33.png. No application code changed. Continue improvements from this comparison directory; the original root application remains separate.

## 2026-09-05 — GPT-6 comparison version

Arnold clarified the goal: report or investigation-summary input should produce a readable editable relationship chart, as a standalone interactive file with PNG/SVG export, printing and undo. Created this separate version to preserve the existing Sol application under the project’s no-overwrite rule. Application hashes confirm the original src/, build.mjs and index.html remain unchanged.

Implemented an empty report-first opening screen, visible name/code search with keyboard navigation, fading of unrelated cards/lines/labels when a person is selected, and Fit connections without moving saved coordinates or pins. Searching a collapsed member expands the group; required view changes are recorded in history. Exports remove temporary navigation highlighting. Existing editing, grouped transactions and undo/redo remain.

Added offline extraction of ordinary multi-word names beside supported wording and companies without acronyms. Full organisation names resolve to existing acronyms. Received and passive payments retain true direction; unknown values stay unknown. Whole-identifier matching prevents AAA1 from matching AAA10. Semicolon-separated payment clauses retain separate amounts and status. Negations/plans and unsplit multi-payment sentences remain for review. Dated unsupported statements no longer disappear from the warning list. Improved company headers when ids are full names. Parsing a new report asks before replacing unsaved chart edits.

Print prepares an SVG of the complete current view, independent of zoom, with title and evidence legend. The print SVG prefixes resource ids to prevent collisions with the hidden editor’s masks, arrowheads and shadows. A3 landscape printed as one page and was visually inspected with boxes and arrowheads present. Desktop and 1024px screenshots inspected; no browser console errors.

Validation: 32 automated data/layout/routing/extraction tests passed. The new navigation/printing suite has 22 passing assertions. Existing suites passed 37 general, 15 transaction and 20 crossing/export assertions. An optional final repeat of the long existing browser suites lost the gstack browser connection; no completion claim for that repeat. The 22 new checks passed on the final build, and the printed PDF was re-rendered and visually inspected after the print-resource correction. The fictional report in examples/ordinary-names-report.txt yielded six entities, five links and no overlaps or crossings; one unsupported dated statement remained for review.

Limits: this remains a rule-based English parser requiring factual review, not arbitrary narrative understanding. Direct Word/PDF import and Chinese narrative extraction are not implemented. Dense sample layouts retain their previous geometric limitations. No automatic save or external requests. This version is not promoted over the original; Arnold should compare and assess it on another report.
