# Story to Chart review preview

This is a separate comparison version. Open `index.html` in Chrome, Edge or Safari. It works offline on its own. The original application and the earlier GPT-6 preview remain unchanged.

## Try the new flow

1. Paste a report and choose **Extract & review**. Try `examples/review-comparison-report.txt` for a fictional example with titles, company names, letter-only codes, payments and unsupported wording.
2. Check **Entities**, **Relationships**, **Events** and **Passages to check**. Correct display names, entity types, roles, endpoints, labels, amounts, dates, participants and evidence status. Source wording is shown with each relationship and event. Uncheck Include for draft items you do not want on the chart.
3. Choose **Apply and draw**. The existing chart changes only at this point. **Cancel** leaves it untouched; **Undo** restores it after applying a new report.
4. Use **Review this chart** to revisit its current facts. These corrections preserve existing positions and pins and can be undone together. Changing a company's name also updates its automatic group label. Add missing people or relationships using **+ Entity** or **+ Link** on the chart.
5. Use **Save JSON** to keep an editable document before closing. Printing, SVG/PNG exports, search, connection highlighting and all existing chart views remain available.

Excluding an entity also excludes its connected relationships and removes it from event participants. The footer shows how many items will be applied or excluded. Cancelling reverses draft exclusions; undo restores applied exclusions.

Reviewing means you have checked the draft, not that the allegations are confirmed. Unknown amounts stay blank. Reported, alleged, suspected and admitted information remain distinct. Repeated payments are retained as separate facts, even where the chart bundles their labels on one line.

## What changed

The parser recognises more titles, company endings and letter-only codes, preserves explicit company-name/acronym aliases, and avoids duplicate candidates found only inside longer names. It protects title, company and marked-name abbreviation dots when splitting supported sentences. Explicit names in parentheses with quotation marks, such as `("Amy Ho")` or `（「李志強」）`, are supported. Ordinary quoted speech does not itself create an entity.

Explicit works-for relationships and contract direction are better covered. Compound sentences stay visible for review even when part of the sentence produced a relationship. The existing chart renderer and layout engine remain in use.

## Limits

This is still a rule-based English parser. It can miss or misread unfamiliar wording, pronouns, single-word names, abbreviations and complex relationships. The stop-word list for letter-only codes is finite. Conservative warnings can include sentences whose useful facts were already extracted. Warnings are not proof that every omission has been found; check the whole report.

Recognising an explicitly marked Chinese name does not provide Chinese-language report understanding. Word/PDF import, pasted roles/timeline tables and exporting a populated chart as editable HTML are not included in this update.

No reports are uploaded or automatically saved. Use a normal browser to compare this file; the previously reported Codex in-app browser freeze is a separate unresolved issue.

## Verification

47 automated tests and 126 browser assertions passed on the completed build: 24 review-flow, 8 review-field, 22 navigation/printing, 37 general editing/export/view, 15 transaction and 20 crossing/export checks. Desktop and 1024px review screens and the finished chart were inspected. The supplied fictional comparison report produced 10 entities and 6 relationships with no measured overlaps or crossings. That result is specific to this report, not a general layout guarantee.

Build from this directory with `node build.mjs`. Run automated checks with `node --test tests/*.test.cjs`. Browser scripts under `tests/` run through gstack browse in separate local tabs. The longer scripts should run as an asynchronous page job and have their result collected afterwards to avoid the command timeout.

Development is on the local Git branch `codex/extraction-review-comparison`. This comparison build has not been pushed to GitHub.
