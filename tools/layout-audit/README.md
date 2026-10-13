# Focused responsive tutorial layout audit

Runtime changes are limited to the CSS insertion and body layout class in `index.html`.
All existing inline/external script tags, navigation metadata and topic index markup remain byte-identical. The Git-tree contract checks every existing non-index file and mode against release `fe6a5a1e01be41121eee30247c495e7aea192ae4`, permitting only the seven explicit new QA files.

This PR-only workflow has read-only repository permissions, pinned official actions, pinned Playwright, official Chrome, no saved checkout credentials, no secrets, no publishing step, an eight-minute job limit, a four-minute browser limit, and three-day artifacts. Never run the browser script locally.

## Coverage

- Exact before/after source in real Chrome at 1440px and 390px, with explicitly labelled baseline/candidate viewport screenshots.
- Candidate geometry at 320, 390, 768, 1024, and 1440px; full-page screenshots retain the entire prose and topic index.
- Actual Markdown fragment geometry, content width, main/sidebar widths, no horizontal document/content overflow, no normal text escaping the reading column, and topic index below the reader.
- Normal visible clicks for sidebar selection, repeated same-hash navigation, Back/Forward and reload; all 76 topics retained, each sidebar category expandable and last item scroll-reachable, all static links contained in the reachable index.
- Independent desktop reader/sidebar scrolling and independent mobile sidebar/document scrolling; ordinary scrolling to the index and a normal visible click to the actual published standalone Roadmap page and Back.
- Exact committed Data Serialization Markdown with complete syntax-highlighted C# code at every candidate width; long code lines can scroll within the code block.
- A labelled synthetic long-table probe tests table containment. It exists only in the browser test and is removed before ending the case; it is not website copy.
- Seven isolated contexts. Exact repository HTML and three original Markdown files are intercepted at the tutorial URL for source-precise layout rehearsal. CDNs and the standalone Roadmap page are actual public requests. This is not a claim that all published Markdown routes were audited.
- Every demo script is blocked. All non-read HTTP methods and non-allowlisted hosts are blocked. No game code is executed. Offline controlled tests prove all 76 loader paths and failure behavior remain identical without evaluating actual demo source.

The artifact `summary.json` includes hashes, per-case geometry, interaction results, request blocks and any errors. Baseline observations do not pass the candidate readability gate; their narrow/clipped text is retained as regression evidence.

## Local source-only checks

Set `TUTORIAL_LAYOUT_BASELINE` to the released index directory and `TUTORIAL_LAYOUT_CANDIDATE` to the candidate repository directory, then run `node --test tools/layout-audit/test.cjs` and `node tools/layout-audit/contract.cjs`. With complete Git trees, add `--repository` for the repository-wide preservation check. No browser is invoked by those commands.
