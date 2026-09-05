# Story to Chart

Standalone, offline SVG relationship-chart editor. No backend, cloud AI or external runtime requests. Arnold prefers British spelling and plain explanations. Do not send case data to external services.

Read MEMORY.md for the session log. index.html is the generated, self-contained deliverable. Edit src/ and rebuild with node build.mjs. Do not replace the renderer or introduce a build framework without a concrete need.

Files: src/core.js (facts/validation/parser/history), src/sample.js (explicitly reviewed sample), src/layout.js (ELK/layout/routing/scoring), src/app.js (editor), src/style.css and src/shell.html. Vendor ELK.js is unmodified and licensed EPL-2.0.

Keep graph facts, layout coordinates and visual preferences separate. Preserve unknown amounts and uncertainty. Never silently substitute the reviewed sample for automatic parsing. Pins and local layout must preserve existing positions. No automatic upload or storage.

Tests: node --test tests/core.test.cjs tests/layout.test.cjs. Browser checks: tests/browser-checks.js via gstack browse eval against the app. Inspect the final screenshot after layout completes. Update MEMORY.md at the end of work.
