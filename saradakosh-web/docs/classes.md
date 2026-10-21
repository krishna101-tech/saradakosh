# Classes

`/classes` is a public, read-only snapshot of the Morning Class Subject Library.
It contains only class dates, classifications, complete video titles, YouTube IDs,
recorded topics, approved summaries, and transcript availability. Operational
databases, attendance information, local file paths, and Drive credentials are
not part of the published dataset.

Subjects sort alphabetically. Videos sort by the app's class dates, oldest first.
All visible Classes and transcript-reader text is at least 13pt (17.333 CSS px).
Video and transcript buttons share one row beneath the thumbnail, including on
phones. On phones, a third icon button expands the initially collapsed class
details. All three actions stay on one line; desktop details remain visible.
Topic lists are labelled "Video chapters". Transcript content appears only in the formatted reader, never in the
summary field. Missing summaries remain blank; a summary must be based on the
matched script and contain no more than five sentences.

Original scripts are matched using their complete opening title against the
catalog. The already available combined script supplies matching sections;
remaining originals come from the owner's Drive archive. The identical
24 January 2023 duplicate is represented by one video ID. The owner-confirmed
5 September 2025 heading typo is the sole explicit title correction.

Server-only content snapshots live in `data/class-transcripts/*.json.gz` and are
included in the reader's deployment trace. They are not public Markdown URLs.
The renderer creates React text nodes and never activates source HTML or links.
The availability manifest is `src/data/transcripts.json`. Update the catalog's
availability flags and manifest together when refreshing the snapshot.

Before publication, run `node scripts/check-class-data.mjs`, the production
build, and mobile navigation/reader checks. Verify the deployment's commit SHA
and a dynamic transcript response before promoting it.
