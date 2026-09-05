# Layout decision

The useful combination in this prototype is ELK ordering, compact organisation groups, several macro candidates, obstacle-aware routing, independent label placement and a second routing pass for label clearance. A clear first view also needs a deliberate level of detail: Key links and Money flow are easier to read than showing every employment relation at once.

The implementation uses a single SVG renderer. ELK supplies coordinates rather than the scene or editor. This keeps the entire app in one offline HTML file and makes exports direct.

| Option considered | Decision for this prototype |
| --- | --- |
| ELK.js | Selected. Its documented layered algorithm, compound support and browser bundle fit the layout role. |
| Cytoscape.js | A credible alternative renderer/editor. Not added alongside the existing SVG scene. No comparative benchmark conducted. |
| Dagre | An alternative layered engine. Not added as a second layout dependency in this iteration. |
| Graphviz | A possible layout alternative. Its browser runtime was not integrated or benchmarked. |
| d3-force | Not used as the main layout; the brief explicitly requires more than an unconstrained force simulation. |
| AntV G6 / React Flow | Alternative editor foundations, not additional layers in this small standalone editor. Not benchmarked. |
| yFiles | Not selected; this prototype uses an open-source engine and requires no commercial licence setup. |

ELK references consulted: [layered algorithm](https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html), [browser package and limitations](https://github.com/kieler/elkjs).

The first implementation had zero node collisions but was too tall to read at fit-to-window scale. Compact member placement and a four-column macro candidate materially improved the opening chart. Initial label clearance was expensive; bounded A* search and route reuse reduced the acceptance run from tens of seconds to a few seconds on the supplied sample.

The target of 80–90% human acceptability is not proven by a geometric score. The next useful evaluation is Arnold's manual assessment of several realistic, unseen graphs: how many node/group moves and label corrections are needed before sharing the result? Record those edits alongside the geometric measurements. Do not optimise a percentage against this one fixture.
