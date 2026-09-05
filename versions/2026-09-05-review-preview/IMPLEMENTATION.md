# Extraction and review implementation plan

Approved by Arnold: make a separate comparison version of the proposed first update.

Goal: improve offline entity recognition and add correction before drawing, retaining the existing chart layout.
Spec: ../../docs/2026-09-05-extraction-comparison-plan.md.
Architecture: core.js returns the same document shape; review.js owns a cloned draft and renders a native review dialogue; app.js applies a validated draft as one undoable edit. Existing ids, positions and pins survive editing existing-chart facts. No renderer replacement or external requests.

## Task 1 — Parser

- [x] Add failing extraction tests for titles, codes, marked names, quoted speech, abbreviations, aliases, explicit employment and partial-sentence warnings.
- [x] Improve core.js without changing ChartCore.parse(text) or existing document fields. Keep sourceText on relationships/events; add sourceText to detected entities. Preserve separate transactions, dates, unknown amounts and evidence status.
- [x] Run node --test tests/*.test.cjs and review the resulting facts on the ten comparison inputs.

## Task 2 — Review draft and interface

- [x] Write browser checks demonstrating parse leaves the live chart alone and opens a draft; cancel changes nothing; corrections and exclusions apply with valid endpoints; undo restores the previous chart; revisiting review preserves coordinates and pins.
- [x] Add ChartReview.open(document, {onApply, onClose, replacing}) in src/review.js. It clones input, allows edits and keep/exclude choices for entities, links and events, validates kept facts and calls onApply(next) only on submission. It does not own the live chart.
- [x] Add accessible dialogue markup and responsive styling in shell.html/style.css and bundle review.js before app.js.
- [x] Replace immediate parse application with draft review. A Review chart button opens current facts. Applying uses history.push(doc), validates before replacing, and locally places missing nodes when editing an existing chart. A new report is explicitly labelled as replacing the current chart, and cancellation leaves it untouched.
- [x] Verify keyboard behaviour, endpoint filtering, safe source text rendering, unknown amount handling and retained extraction notes.

## Task 3 — Delivery

- [x] Run all data/layout tests and browser checks on final build; inspect review and completed chart screenshots, print resources and SVG/PNG rendering.
- [x] Review code for correctness and evidence-preservation defects and resolve findings.
- [x] Confirm baseline file hashes match for both existing application versions.
- [x] Write README.md, a fictional comparison report and final MEMORY.md with results and known limits. Deliver index.html without opening the Codex in-app browser panel.

## Execution ledger

Ruling: use the user-requested new version directory on a separate Git branch as the edit boundary. Do not move or overwrite the existing applications.
Ruling: entity recognition and review UI share only the existing validated document contract, so they can be implemented independently. Parser work owns core.js and extraction tests; the coordinator owns review.js, app.js, shell.html, style.css, build integration and browser tests.
Ruling: the user's approval already covers implementation; no second plan approval is needed. No GitHub publication is part of this build request.

Final verification: 47 automated tests and 126 browser checks passed. Both existing versions match baseline hashes. Reviewer findings were corrected with regressions. Local comparison is ready; no GitHub push or merge performed.
