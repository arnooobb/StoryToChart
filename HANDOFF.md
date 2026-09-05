# Story to Chart — Session Handoff

**Saved:** 2026-09-05 (Asia/Hong_Kong)  
**Status:** Working prototype; latest routing fixes are built into `index.html`  
**Git:** This folder is not a Git repository

## Start here

In the new session, use this instruction:

> Continue the Story to Chart project in `/Users/arnoldle/Desktop/Claude/Story-to-Chart`. Read `AGENTS.md`, `MEMORY.md`, and `HANDOFF.md` before making changes. Treat `index.html` as a generated file: edit `src/`, then run `node build.mjs`.

## Current goal

This is a standalone, offline HTML application that turns written case narratives into editable SVG relationship charts. It has no backend, account, API key, external assets or automatic upload. Case data stays in the browser.

The latest work addressed three visual problems reported from screenshots:

1. Lines no longer run along the side of entity cards.
2. Arrowheads approach entity cards squarely and stop just outside the card.
3. Repeated financial transactions with the same source, destination and direction share one line, while their factual entries remain separate in the label and inspector.
4. Connectors now try to detour around other connectors. Where a dense fixed arrangement still forces an intersection, one line has a small visual break so the lines cannot be mistaken as joined.

## Main files

- `index.html` — generated, self-contained deliverable; currently about 1.63 MB.
- `src/core.js` — validation, rule-based parser and history.
- `src/sample.js` — reviewed Kite Tech sample: 32 entities, 48 relationships, nine groups and 13 events.
- `src/layout.js` — projection, transaction bundling, layout, connector routing, crossing detection, labels and scoring.
- `src/app.js` — SVG rendering, editing, dragging, inspector, JSON save/open and SVG/PNG export.
- `src/style.css` and `src/shell.html` — interface and presentation.
- `build.mjs` — combines the source and bundled ELK library into `index.html`.
- `examples/kite-tech-reviewed.json` — saved-coordinate regression fixture. Do not overwrite it casually.
- `MEMORY.md` — dated development log and earlier decisions.

## Decisions that must be preserved

- Keep graph facts, layout coordinates and visual settings separate.
- Do not infer unknown amounts or combine transaction totals.
- Preserve certainty per factual entry: admitted, reported, suspected, alleged and unverified remain distinct.
- Bundle only financial relationships that have the same original source, destination and direction. Reverse flows and non-financial relationships remain separate.
- A bundled label contains separate transaction rows. Clicking a row edits only that underlying relationship; deleting it removes only that entry.
- Existing coordinates must survive ordinary edits. Adding or editing a fact must not rearrange the whole chart.
- Every endpoint keeps 14 px clearance, a 28 px perpendicular landing and a 2 px visual gap from the card.
- Connector routes treat existing lines as narrow obstacles, try separate attachment positions and may use outside detours.
- Dense graphs are not always planar. Remaining geometric intersections use exported SVG masks to show a small line break. The measurement panel still reports the underlying connector conflicts honestly.
- Keep all processing local. Do not send case material to external services.

## Latest implementation details

`src/layout.js` contains:

- `bundleTransactions()` for same-direction financial transaction labels.
- `lineBarriers()` and `lineConflicts()` for connector-aware routing.
- `crossingGaps()` for visual breaks at unavoidable intersections, including elbows.
- Protection for shared-entity landings and arrowhead areas so breaks do not cut an arrowhead.
- Route points in the final bounds calculation so outside detours are not cropped from exports.

`src/app.js` builds SVG masks for the visual breaks. The same masks appear in live charts, SVG exports and PNG rendering. The export description explains that a small break separates crossing lines and does not show a relationship.

## Verification completed

- All 24 data, layout and routing tests passed:

  `node --test tests/core.test.cjs tests/layout.test.cjs tests/routing-transactions.test.cjs tests/line-crossings.test.cjs`

- All 15 transaction browser checks passed.
- All 20 browser checks for crossing masks, unchanged facts and coordinates, four routing styles, valid SVG export and SVG-to-image rendering passed.
- The broader 37-check browser script exceeded the browser tool response timeout. Its background retry later lost the separate test-browser session, so do not claim a fresh complete pass for that script after the final routing edit.
- The final build was reopened and visually inspected at 1600 × 1000.
- On the current default sample, the measured layout has zero node overlaps, zero label overlaps, zero group overlaps, zero lines through nodes and zero lines through other labels. It reports 16 underlying connector conflicts before visual breaks.

## Known limits

- The parser is rule based and incomplete. Automatic extraction must be reviewed against the source.
- Dense charts may still need manual movement and judgement.
- Visual line breaks clarify unavoidable intersections; they do not make the underlying graph planar.
- The whole-network view is much denser than the focused views.
- Flat groups are supported; nested groups are not.
- Browser data is not saved automatically.

## Important browser-state warning

The user’s actual browser tab was deliberately left untouched during the last fixes to avoid losing unsaved chart edits. Before refreshing that tab, use **Save JSON**. After refreshing, use **Open JSON** to restore the saved work.

## Sensible next steps

1. Ask Arnold to review the refreshed chart visually, especially the area that previously showed the Supply order line crossing another connector.
2. If he supplies another screenshot, reproduce that exact geometry before changing the router.
3. Run the focused routing tests after every routing change, then rebuild `index.html`.
4. Run the browser transaction and line-crossing checks before reporting completion.
5. Use the broader browser suite when the browser runner can remain connected long enough; treat its timeout as a tooling limit until reproduced otherwise.

## Commands

```sh
# Rebuild the standalone application
node build.mjs

# Run the data and layout tests
node --test tests/core.test.cjs tests/layout.test.cjs tests/routing-transactions.test.cjs tests/line-crossings.test.cjs

# Serve locally if needed
python3 -m http.server 8877
```

The expected local preview address is `http://127.0.0.1:8877/` when the server is running.
