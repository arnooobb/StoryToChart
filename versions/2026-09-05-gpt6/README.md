# Story to Chart GPT-6 preview

Open `index.html` in a desktop browser. The file works on its own, offline, with no server, account, API key or external assets. The original Sol version remains unchanged two folders above this version.

Paste an investigation report or summary into the left panel and choose **Create chart**. Review the relationships and the passages listed below the input. Click a card or link to edit it; drag cards or group headings to move them. **Undo** and **Redo** work with edits and layout changes. Use **Save JSON** to keep an editable document before closing.

**Find a name or code** searches all entities. Press Enter or select a result. The chosen entity and its direct visible connections stay clear while unrelated cards, lines and labels fade. **Fit connections** zooms to that area without moving cards. **Clear** removes the highlight; **Fit** returns to the whole chart. Search expands a collapsed group when needed and preserves existing coordinates and pins.

**Export diagram** produces SVG or PNG of the complete current view. Temporary navigation highlights are removed. **Print** uses the complete current view, its title and evidence legend, regardless of screen zoom; it defaults to A3 landscape. Printing was visually checked as a one-page PDF in Chromium. Browser and printer settings may affect other paper sizes. Save JSON separately to preserve editability.

Try `examples/ordinary-names-report.txt`, a fictional six-entity report. It produces five relationships with no overlaps or crossings in the checked layout. Its final tender-review sentence remains listed for manual review. The existing reviewed Kite Tech example is also available using **Load reviewed example**.

## Extraction limits

This is still a rule-based English parser, not a general language model. This version adds full names beside supported relationship wording, company names without acronyms, received-payment and passive-payment direction, and separate semicolon-delimited payment clauses. Unknown amounts stay unknown. Suspected and alleged relationships retain their status.

Negated statements, plans, unresolved references and complex wording may require manual entry. Sentences with several payment actions are left for review rather than assigned one combined meaning. Warnings are not a guarantee that every omission or misreading has been detected: check all extracted facts against the report. Chinese narrative extraction and direct Word/PDF file import are not implemented; paste text or open saved graph JSON.

## Development

Edit this version’s `src/` and run `node build.mjs` from this directory. `index.html` is the generated deliverable. Keep the renderer and locally bundled ELK library intact.

Run `node --test tests/*.test.cjs`. Browser scripts run through gstack browse in a disposable tab: `tests/browser-workspace.js` starts from the fresh empty screen; the existing browser, transaction and line-crossing suites load their own reviewed fixtures. The long suites should run as an asynchronous page job and have their results collected later, avoiding the command response timeout.

The baseline hashes in `baseline-hashes.json` verify that the original application files were preserved. Read `MEMORY.md` for this version’s session log.
