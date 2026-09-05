# Session log

## 2026-09-05 — Completed review comparison version

Arnold approved the proposed extraction/review update and requested a separate comparison version. Built this directory from the earlier GPT-6 preview; both existing application versions and all other pre-existing project files are byte-for-byte unchanged against baseline-hashes.json. Work is on local branch codex/extraction-review-comparison and is not pushed to GitHub.

Improved titles, company suffixes, letter-only codes, explicit acronym aliases, marked Chinese/English names, overlapping candidate removal and abbreviation sentence boundaries. Plain quoted speech no longer creates a candidate by itself. Explicit works-for and contract direction are handled. Compound sentences remain reviewable when an unsupported clause may coexist with an extracted fact. Dates, separate payments, unknown values and evidence distinctions remain.

Added a separate draft dialogue for entities, relationships, events and unresolved passages. Corrections include display names, types, roles, endpoints, labels, amounts, dates, evidence status, direction and event participants. Exclusions remove dependent relationships and event participants. Validation precedes live mutation. Cancel leaves the live chart untouched. Applying is one undoable edit; returning to review preserves existing positions and pins. Organisation name changes update automatic group labels and visible card names. Source text is escaped and shown alongside relationship/event fields.

Validation on final build: 47 automated tests; 126 browser assertions (24 review flow, 8 review fields, 22 navigation/printing, 37 general, 15 transactions, 20 crossing/export). Browser console was clear. Inspected desktop/1024px review screens and final chart; fictional comparison report yielded 10 entities, 6 relationships, 2 events and no measured overlaps/crossings. Review and chart previews saved here. Layout.js and vendor libraries unchanged. Reviewer-identified contract endpoint, abbreviation, partial-warning and group-name issues were fixed and regression-tested.

Known limits: rule-based English extraction still requires review; compound warnings are intentionally conservative. Explicitly marked Chinese names are supported, but full Chinese-language parsing, document import, table input and populated editable HTML export remain outside this update. Save JSON before closing. The Codex in-app browser freeze was not diagnosed or fixed; testing used separate gstack browser tabs.
