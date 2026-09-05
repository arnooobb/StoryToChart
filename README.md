# Story to Chart

Open **index.html** in Chrome, Edge or Safari. It is a single, self-contained HTML file: no installation, internet connection, API key or account is required. Source text and graph data stay in the browser. Save JSON before closing; there is no automatic disk save.

The opening chart is a **reviewed example**, prepared from the supplied story. It contains 32 entities, 48 relationships, nine organisation groups and 13 events. It is deliberately distinguished from automatic extraction.

## Try it

1. Start with Relationships → Key links. Scroll to zoom, drag the background to pan, or press F to fit the chart.
2. Click a person, company or relationship to open the inspector. Edit names, labels, amounts, dates, status and group membership. Apply changes saves the edit in this session.
3. Drag entities or a group heading. Shift-click several entities, then choose + Group. The minus button collapses a group; double-click its collapsed card to expand it. Pins protect positions during automatic arrangement; manual dragging remains possible.
4. Choose Money flow for payments, benefits and contract awards. An award is not evidence that money was paid. Timeline shows dated events. Hierarchy arranges directed links in layers. Groups starts with a collapsed overview. Mixed shows the full grouped network with financial styling.
5. Click Arrange chart to compare four candidates (three for timeline and hierarchy). The measurement button explains the score and reports current collisions. Select a group and choose Arrange this group for a local change.
6. Open Source & entities to paste text or JSON. Parse text / JSON runs the rule-based parser. Review its output against the source. Load reviewed sample returns to the prepared example.
7. Save JSON keeps an editable document, including coordinates and pins. Export diagram produces SVG or PNG of the current view. Open JSON restores a saved document.

Transactions with the same source, destination and direction share one line. Their label keeps each amount, date and evidence status separate. Click the line for a transaction list, or click an entry in its label to edit just that transaction.

Undo: Cmd/Ctrl Z. Redo: Cmd/Ctrl Shift Z. Save: Cmd/Ctrl S. Delete requests confirmation. Double-click the chart title to rename it.

## Extraction boundaries

The parser recognises entity codes such as TSM1, quoted names (including Chinese), organisation names with acronyms, explicit roles and family relationships, selected transaction and introduction patterns, percentages, HK$ amounts, and month/year dates. It also accepts one `AAA1 -> BBB1: relationship` per line.

It is not a general language model. Unsupported wording, pronouns and implied relationships can be missed or misread. Dated events are initially sentence-based; a sentence mixing established and suspected conduct may need splitting. The reviewed example includes objects and locations that the parser may omit. The source wording remains available, and every automatically extracted relationship should be reviewed. “Reported” means stated in the source, not independently proven.

For precise data, use the saved example JSON as the interchange reference. Required graph arrays are `entities` and `relationships`; the importer supplies empty `groups`, `events` and `sources` arrays when absent. Every entity and relationship requires a unique string id; relationships reference entity ids through `source` and `target`. Group membership is the entity's `group` id. This prototype supports flat groups, not nested groups.

Facts are under `graph`, positions and pins under `layout`, and appearance under `visual`. Do not place factual amounts or certainty in the layout object. Unknown amounts should be omitted, not recorded as zero. JSON version is 1. Imports are validated and rejected when endpoints, groups, amounts or geometry are invalid.

## Layout choices and limits

ELK.js 0.10.0 is bundled locally. ELK first supplies local ordering; a compact grid then arranges group members. The application compares compact group packing and horizontal/vertical ELK macro layouts. Hierarchy uses ELK layered layouts directly. Timeline compares chronological grids. Money flow gives backward financial direction an additional penalty.

Routing leaves 14px clearance around boxes and reserves a 28px straight approach at each endpoint, so arrowheads meet the box squarely. Between these approaches it prefers an unobstructed direct segment, then a small number of right-angle bends. A bounded A* visibility search handles harder obstacles. Connectors avoid narrow exclusion strips around other lines, with separate attachment points and outside detours where possible. Labels are placed against node, header and label obstacles; lines are checked again against labels and other connectors afterwards. Remaining intersections use small visual breaks so unrelated lines do not look joined. These breaks are included in SVG and PNG exports. Curved mode rounds routed corners. Straight mode is labelled Direct first because it still detours when an obstacle blocks the direct line.

Scoring penalises node overlap, lines through nodes, group overlap, label collision, lines through other labels, crossings, bends, length, area and poor use of a wide canvas. Candidate cost is an internal comparison, not a human satisfaction percentage. The crossing count measures conflicting connector pairs, including touching or shared tracks away from a common endpoint, before visual breaks are applied. It is not a claim that every dense graph can be drawn without crossings. Dense views still need judgement, zooming and occasional manual movement. The whole-network view is deliberately available even when the focused views are clearer.

Existing node coordinates survive ordinary edits. Adding a node looks for free space. Local arrangement fixes all outside nodes and pinned members. Explicit whole-chart arrangement may move every unpinned node. Switching layout modes also arranges the view. If you pin incompatible positions or manually overlap groups, the app keeps your instruction and reports the resulting geometry.

The current tested Key links view has 17 visible entities, with no node overlaps, label overlaps, edges through nodes, edges through other labels or group overlaps. Remaining line intersections are separated visually; the measurement panel retains the underlying conflict count. These measurements apply to the bundled sample and current settings; they are not a general guarantee. The full network is denser. The prototype accepts up to 160 entities / 350 relationships; the supplied 32-entity sample is the tested performance reference, not a benchmark at the limit.

## Development

Edit the source files in `src/`, then run `node build.mjs` to recreate `index.html`. Run `node --test tests/core.test.cjs tests/layout.test.cjs tests/routing-transactions.test.cjs tests/line-crossings.test.cjs` for the data/layout acceptance checks. `tests/browser-checks.js` runs inside the loaded app through gstack browse and verifies editing, history, grouping, JSON, exports and every view.

There are no package-manager dependencies. ELK is the only bundled third-party library. Its EPL-2.0 licence is included in `vendor/ELK-LICENSE.md` and embedded as text inside the standalone HTML. The original library is unmodified. Source: https://github.com/kieler/elkjs. Algorithm reference: https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html.
