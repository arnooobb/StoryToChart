# Session log

## 2026-09-06 — GitHub upload authorised

Arnold requested pushing the current work to GitHub. Prepared the comparison branch codex/extraction-review-comparison for upload to arnooobb/StoryToChart, including extraction review, blank titles, New and colourful group boxes. Earlier notes describing these changes as local-only record their previous state. No merge into main requested.

## 2026-09-05 — Colourful group boxes

At Arnold's request, compared Claude Association Chart Builder v14's GPAL colours and applied the same six pastel fill/border pairs, plus three additional shades, to this comparison version. Group headings and collapse controls use darker matching colours. Collapsed group cards keep the group palette; selection retains its blue outline. Colours follow the document's group order, independent of visible filtering, and repeat after nine groups. No changes to graph facts, layout algorithms, parsing or earlier versions.

Rebuilt index.html. All 49 existing automated tests and 11 browser checks passed, covering distinct sample fills, selection, collapse/expand, existing positions, unchanged facts, JSON reopen, SVG colours and PNG rendering. Inspected the final screenshot, saved as group-colours-preview.png. Changes remain local; no GitHub upload.

## 2026-09-05 — Blank title and New button

At Arnold's request, new charts and newly extracted reports now have a blank title. Blank titles survive JSON validation, can be named or cleared using the title dialogue, and use a chart filename fallback for downloads. The blank title area remains focusable and can be opened with Enter/Space or double-click.

Added New in the header. It clears the graph, source input, selection, search, layout view and undo history, returning to the source panel. Unsaved chart edits or unparsed source text require confirmation; cancellation preserves them. Unchanged saved documents start fresh without another prompt. Before-close protection now includes unparsed source text. Existing versions remain unchanged.

Verification: two title regressions and 15 new browser assertions passed, plus the existing 24 review-flow, 8 review-field and 22 navigation/printing assertions. Inspected the blank opening screen at /tmp/story-new-chart-final.png. The full automated suite passed all 49 tests; 69 browser assertions passed in this session.

## 2026-09-05 — Completed review comparison version

Arnold approved the proposed extraction/review update and requested a separate comparison version. Built this directory from the earlier GPT-6 preview; both existing application versions and all other pre-existing project files are byte-for-byte unchanged against baseline-hashes.json. Work is on local branch codex/extraction-review-comparison and is not pushed to GitHub.

Improved titles, company suffixes, letter-only codes, explicit acronym aliases, marked Chinese/English names, overlapping candidate removal and abbreviation sentence boundaries. Plain quoted speech no longer creates a candidate by itself. Explicit works-for and contract direction are handled. Compound sentences remain reviewable when an unsupported clause may coexist with an extracted fact. Dates, separate payments, unknown values and evidence distinctions remain.

Added a separate draft dialogue for entities, relationships, events and unresolved passages. Corrections include display names, types, roles, endpoints, labels, amounts, dates, evidence status, direction and event participants. Exclusions remove dependent relationships and event participants. Validation precedes live mutation. Cancel leaves the live chart untouched. Applying is one undoable edit; returning to review preserves existing positions and pins. Organisation name changes update automatic group labels and visible card names. Source text is escaped and shown alongside relationship/event fields.

Validation on final build: 47 automated tests; 126 browser assertions (24 review flow, 8 review fields, 22 navigation/printing, 37 general, 15 transactions, 20 crossing/export). Browser console was clear. Inspected desktop/1024px review screens and final chart; fictional comparison report yielded 10 entities, 6 relationships, 2 events and no measured overlaps/crossings. Review and chart previews saved here. Layout.js and vendor libraries unchanged. Reviewer-identified contract endpoint, abbreviation, partial-warning and group-name issues were fixed and regression-tested.

Known limits: rule-based English extraction still requires review; compound warnings are intentionally conservative. Explicitly marked Chinese names are supported, but full Chinese-language parsing, document import, table input and populated editable HTML export remain outside this update. Save JSON before closing. The Codex in-app browser freeze was not diagnosed or fixed; testing used separate gstack browser tabs.
