# Session log

## 2026-09-05 — Extraction comparison and proposal

GitHub connection completed: the initial project commit was uploaded to private arnooobb/StoryToChart, with local and remote main verified identical. Compared the actual Claude v8 and GPT-6 story-parser functions on ten fictional inputs. Claude recognises titles and letter-only codes that ours misses, but its generic relationship guessing, certainty defaults and deduplication lose or misstate facts. Ours handles full names and payments better but misidentifies quoted speech and fails to flag an unhandled witness clause. Reviewed Claude's table import, pre-drawing review and editable HTML export in source only.

Proposal saved in docs/2026-09-05-extraction-comparison-plan.md. First update would improve detection and relationship coverage and add review before drawing, retaining our layout. Table input and editable HTML export are later options. Application code is unchanged; wait for Arnold's approval before creating the updated version.

## 2026-09-05 — GitHub setup

Arnold requested connection to the existing private repository https://github.com/arnooobb/StoryToChart and confirmed that the bundled Kite Tech example is fictional and may be uploaded. The remote was empty. Initialised local Git on main and prepared both the original application and the GPT-6 comparison version for the initial upload. Added .gitignore for local credentials, macOS metadata, browser sessions and temporary files; GITHUB.md identifies the working versions and the pending comparison plan. No application code changed. Earlier notes saying this folder is not a Git repository describe its previous state.

The Association Chart Builder v8 comparison is paused for this setup. Arnold prefers our layout and wants its entity extraction and other useful functions studied, with an improvement plan approved before an updated version is built. Arnold clarified that the earlier freeze affected the Codex in-app browser panel; passing gstack checks does not diagnose or rule out that panel problem.

## 2026-09-05 — Session handoff

Created `HANDOFF.md` for a new session. It records the current architecture, routing and transaction-label decisions, completed verification, known limits, browser-state warning and next steps. This folder is not a Git repository. No application code changed during the handoff.

## 2026-09-04 — Connector crossings

Changed routing after Arnold’s crossing-line screenshot. Other connectors now form narrow obstacles, outside detours are considered, and lines use separate attachment positions where space permits. Final routing checks both labels and connectors. Endpoint clearance, square arrowheads and bundled transaction entries remain intact. Chart bounds include connector detours so exports do not crop them.

Dense fixed arrangements can still contain geometric intersections. SVG masks add small breaks on one line at remaining intersections, including elbows, while protecting arrowhead landings. The same masks export to SVG and PNG. The measurement panel counts conflicting connector pairs before breaks, including shared tracks and touching away from a common endpoint; old crossing figures are not directly comparable. This is not a guarantee of a crossing-free planar layout.

Validation: all 24 data/layout/routing tests passed. The 15 transaction browser checks and 20 checks for masks, unchanged facts/positions and SVG-to-image rendering across four line styles passed. The broader existing browser suite exceeded the browser tool timeout; its background retry lost the browser session, so no completion claim for that suite. Reopened the final build and inspected the desktop screenshot at /tmp/story-crossings-final-desktop.png. The default sample has no node, label or group overlaps and no edges through nodes or other labels; its underlying connector-conflict count is 16. index.html rebuilt. Arnold’s actual tab was left untouched; Save JSON before refresh, then Open JSON to restore unsaved work.

## 2026-09-04 — Routing and transaction labels

Fixed the side-hugging lines and clipped/tangential arrowheads reported in Arnold’s four screenshots. Routes now use a 14px endpoint clearance and 28px perpendicular landing, with a 2px gap at the box. Labels reserve arrowhead space. Normal approaches apply to every routing style, rerouting after edits and SVG/PNG exports.

Financial relationships with identical original source, destination and direction share a visual line and a label containing separate entries. Cash/Rolex benefits and envelope/8% kickbacks are bundled in the sample. Underlying graph facts are unchanged: no amounts are summed, mixed certainty is shown per entry, reverse flows and non-financial relations remain separate. Click a shared line for its transaction list or an individual label entry to edit it. Individual deletion, undo and old saved JSON were verified.

Validation: 19 automated checks passed, including new routing/aggregation/arrowhead regressions. The existing 37 browser assertions and 15 new transaction assertions passed. index.html rebuilt. Historical layout measurements below describe the first prototype; new routing and bundle labels change those scores. Existing browser tabs need refreshing; preserve unsaved edits with Save JSON first.

## 2026-09-04

Built the first working prototype from an empty folder following Arnold's request to deliver it in one go. Main deliverable: index.html, a self-contained offline HTML app with locally bundled ELK.js 0.10.0. No external services or remote assets. Supporting source is in src/; rebuild with node build.mjs.

Reviewed example contains 32 entities, 48 relationships, nine groups and 13 events from Arnold's Kite Tech story. It is explicitly labelled as reviewed data; Parse text / JSON runs a separate deterministic parser. Unknown transaction totals are not inferred. Suspected, alleged, admitted and reported statuses remain distinct.

Implemented SVG editing, source/JSON input, automatic organisation grouping, six views, draggable nodes and groups, add/edit/delete with confirmation, group/ungroup, collapse/expand, pins, local and full layout, undo/redo, JSON save/load, SVG/PNG export and geometric candidate scoring. Groups view starts collapsed. New nodes are placed without disturbing old positions. Source drawer initially closed to give the graph more room.

Validation: 11 data/layout tests passed; 37 browser assertions passed for edit/history/pins/groups/round-trip/export and all views. Actual group-header drag verified equal member displacement, unchanged outside coordinates and undo. The default 17-visible-entity Key links layout has 12 crossings, zero node/label/group overlaps and zero edges through nodes or other labels. Full 32-entity view also has zero collisions/obstructions but 59 crossings and needs more user judgement. Measurements saved under docs/.

Limits: rule-based extraction is incomplete and must be reviewed. Timeline events are initially sentence-based. Flat groups only. Shared edge segments are not fully captured by the crossing score. No automatic disk save, backend or general AI parser. The 80–90% human satisfaction target is unproven; Arnold's assessment on unseen stories is the next useful check. README.md and docs/2026-09-04-layout-decision.md explain usage and decisions.
