# Extraction improvement proposal

Status: awaiting Arnold's approval. No application changes authorised by this proposal yet.

## Recommendation

Keep the GPT-6 version's chart layout and drawing engine. Borrow selected ideas from Association Chart Builder v8 for recognising names and reviewing extracted information. Do not replace our parser wholesale.

The comparison used the actual story-parser functions from both files on ten short fictional inputs. It did not run Claude's complete interface or test its table parser in a browser. These probes expose specific differences; they are not an overall accuracy score.

## Findings

| Input or feature | Claude v8 | Our GPT-6 version |
| --- | --- | --- |
| Mr. Chan works for Blue Sky Engineering Ltd. | Finds the name and employment link, but classifies Mr. Chan as an organisation | Finds the company but misses Mr. Chan and the link |
| ABC paid HK$8,000 to XYZ. | Finds both letter-only codes, but labels the link as employment and confirmed | Misses both codes |
| David Wong paid HK$8,000 to Mary Chan. | Finds neither ordinary full name | Finds both names, payment direction and amount |
| AAA1 said "do not pay" to BBB1. | Avoids a quoted-speech entity but creates a confirmed employment link | Creates a false entity called "do not pay", although it does flag the sentence for review |
| AAA1 did not pay HK$8,000 to BBB1. | Creates a confirmed employment link | Creates no payment and flags the sentence |
| Two payments between the same people in opposite directions | Keeps only one link | Preserves both directions and amounts |
| Payment with a named witness in the same sentence | Adds a link to the witness as well as the recipient | Keeps the payment, but fails to flag the unhandled witness clause |
| A director of a named company | Can classify the director as an organisation | Keeps the person and company distinct |

Claude's source also contains useful features: pasted roles and timeline tables with column-name matching; a review screen for entities, links and events; and saving a chart as a self-contained editable HTML file. Its marked-name syntax accepts parentheses with straight, curly and Chinese quotation marks. It protects abbreviation full stops when splitting sentences.

Avoid copying its default "confirmed" evidence status, automatic "offeror" assignment to the most connected entity, first-name-to-every-other-name linking, and deduplication that ignores direction and separate transactions. A person having few links is not a reason to discard them automatically.

## Proposed first update

1. **Improve entity recognition.** Recognise titles such as Mr. and Dr., letter-only codes with common-word exclusions, and more company endings. Preserve ordinary full-name support. Use explicit marked names for difficult names, including Chinese names; quotation marks around ordinary speech must not create entities. Protect abbreviations and decimals before splitting sentences. Keep overlapping names from generating duplicate entities. Only combine a name and acronym when the source explicitly defines that relationship; do not guess that two similar names identify the same person.

2. **Improve relationship coverage without inventing links.** Use the detected entities consistently in the supported role, family, payment and contract patterns. Retain amounts, separate transactions, direction and uncertainty. Expand cautious handling of explicit wording such as "works for". Identify unsupported clauses even when another clause in the same sentence produced a valid link. Preserve exact source wording for review. Unsupported relationships remain unresolved rather than becoming employment or confirmed facts.

3. **Add review before drawing.** Use the existing visual style for a review panel containing entities, relationships, events and unresolved passages. Allow correction of names, types, endpoints, amounts and evidence status, and explicit inclusion/exclusion of draft items. Show the source passage beside each relationship. Keep extracted draft data separate from the current chart until the user chooses to apply it. Cancelling leaves the existing chart intact. Returning to review must preserve existing positions and pins when the edits are applied, and applying reviewed edits must be undoable.

Build this as a new dated comparison version after approval, preserving both current versions. Work from `versions/2026-09-05-gpt6/`, keeping the existing renderer and offline operation. Likely changes are in core.js, app.js, shell.html, style.css and focused extraction/review tests; introduce a small review module only if that keeps the new flow understandable. Rebuild the standalone HTML from its source.

## Validation before delivery

- Use the ten fictional comparison cases as regression examples, plus titles, abbreviations, overlapping names, marked Chinese names and mixed supported/unsupported clauses.
- Check that ordinary speech produces no entity; negations produce no asserted payment; repeated transactions retain separate amounts, dates and directions; and a witness is never silently treated as the payee.
- Check correction, draft cancellation, applying review, undo, saved JSON round trips and preservation of positions and pins.
- Run existing data/layout tests and browser checks for editing, navigation, bundled transactions, printing and SVG/PNG export. Inspect the finished chart in the separate gstack browser. The Codex in-app browser freeze remains a separate unresolved issue.
- Make no claim of general narrative understanding. Full Chinese-language parsing remains outside this first update.

## Later options

After assessing the first update, consider pasted roles/timeline tables with a column preview, followed by saving a populated chart as a standalone editable HTML file. Both are useful ideas from Claude's version, but they are separate additions and are not included in the first-update approval request.

Approval requested: entity recognition, relationship coverage and review before drawing, in a new comparison version retaining the preferred layout.
