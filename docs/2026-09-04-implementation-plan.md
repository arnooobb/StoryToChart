# Story to Chart implementation plan

Goal: deliver an offline HTML relationship-chart editor with a useful first layout for the supplied sample.

Design: SVG canvas, a collapsible source panel, contextual inspector and view toolbar. White/slate working surface, ink #243449, blue #245edb for selection, teal #087f80 for transactions, amber #ac7218 for uncertainty. System sans-serif text; no remote fonts or images. Local processing only.

Architecture: graph facts (entities, relationships, groups, events and sources), layout (positions, pins, collapsed groups and mode), and visual preferences remain separate. ELK is bundled locally. Deterministic candidate generation uses group topology plus local layout, followed by routing and geometric scoring. Manual edits preserve coordinates; selected-group layout changes only its unpinned members.

Files: src/core.js (validation, extraction and history); src/sample.js (reviewed sample plus source); src/layout.js (ELK orchestration, routing and metrics); src/app.js (SVG renderer and editing); src/style.css; src/shell.html; build.mjs (offline single HTML); tests/core.test.cjs and tests/layout.test.cjs; index.html (deliverable).

1. Write failing acceptance tests for safe JSON validation, uncertainty, financial direction, history, pins, candidate scoring and obstacle avoidance. Implement the data layer and sample, then run tests.
2. Build layout candidates for relationship, money-flow, timeline, hierarchy, groups and mixed modes. Measure actual geometry rather than a claimed human-quality percentage. Test pins, routing and deterministic output.
3. Build the editor: input, selection, drag, grouping, collapse, local layout, inspector edits, undo/redo, JSON import/export and SVG/PNG export. Confirm each flow in a real browser.
4. Bundle a self-contained HTML file, verify it over file:// without network requests, inspect screenshots, document limitations and leave a dated project log.

Prototype boundaries: deterministic extraction recognises explicit markers, quoted names, role declarations, selected relationship verbs, dated events and structured relationship lines. Unsupported sentences remain available for review. Reviewed sample data is explicitly labelled; it is not presented as automatic extraction. No cloud AI or persistence service. Undo history is session-local; JSON saves preserve all durable state.

Technology decision: use ELK + SVG rather than an additional graph renderer. ELK supplies layered crossing reduction and compound capability; SVG keeps rendering, editing and offline export direct. Cytoscape/G6/React Flow would add a second scene model; Dagre has a narrower layout role; Graphviz adds another runtime; d3-force alone does not satisfy constraints; commercial yFiles is unnecessary for this prototype. ELK routing and compound graph support verified at https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html and browser packaging at https://github.com/kieler/elkjs.
