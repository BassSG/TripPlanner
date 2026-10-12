# Validation — 12 October 2026 (Asia/Bangkok)

## Automated checks

`npm run check` and `npm test` pass. **28 regression tests** cover:

- Input validation: integer days/people, budgets, group size, travel modes and real calendar dates.
- Compatibility with the existing `AI_API_KEY`; diagnostics never contain credentials.
- Full server pipeline, 30-day chunking, cached duplicate requests and exact day counts.
- Invalid/truncated JSON, missing lodging and overlapping times; failure never becomes a successful partial itinerary.
- Group expense totals, duplicate hotel activity charges, final-night exclusion and truthful budget overruns.
- OpenRouter credit/auth/network failures, safe errors, persistent daily request ceilings and Thai-date reset.
- Brave failure handling, current query year, `search_lang=th`, supported `country=ALL` and source deduplication.
- Destination relevance filtering: unrelated province sources are excluded, including from saved/imported plans, and removed source references cannot be shown as supporting evidence.
- Imported/legacy plans, unsafe URLs, HTML escaping, export text and calendar boundaries.
- Service-worker subdirectory paths, shell/icon precache, preservation of unrelated caches and offline app fallback.

Build checks validate JavaScript/GAS syntax, JSON manifests, PWA icon dimensions, unique HTML IDs, generated output and accidental secret patterns. GitHub CI also rebuilds and ensures the generated GitHub/GAS files match the source.

## Browser and API checks

- The GAS `/dev` app was tested with the owner's existing OpenRouter key: a real Chiang Mai plan for **3 days / 2 adults** was returned and saved, with all three days and a recomputed group total of **฿5,720**.
- Existing saved plans on the GAS origin were detected and migrated into the new UI; the legacy storage key is retained.
- The production GAS health endpoint returns version `8.0.0`, AI/search key-presence flags and model `google/gemini-3.8-flash`, without exposing keys.
- The local web app successfully connects to the production GAS bridge and receives status through the validated postMessage connection.
- The default dark theme was inspected in the in-app browser. At **390 × 844**, the document width is within the viewport and the page uses the expected `#101916` background and dark dialogs.
- Key dark-theme text/background pairs were measured: primary text **13.83:1**, secondary text **6.80:1**, button text **7.01:1**, selected navigation text **6.66:1**, input placeholders **5.70:1**.
- PNG generation was checked on the real 3-day GAS result: the image preview contains the selected day's itinerary and lodging. The final theme also applies to exported PNGs.

- A real **5-day / 2-adult Chiang Mai plan** was generated from the standalone web UI through the production GAS bridge, including **all 5 days, 4 lodging nights and 8 Brave sources**. Daily expenses sum to **฿7,710**, matching the grand total. The JSON export downloaded successfully and contains the complete plan.
- The first live 5-day test exposed missing lodging on the last day of an intermediate chunk. The final schema requires a lodging object, the prompt names the overnight days, and server validation rejects missing stays with the affected day. The corrected live 5-day run completed successfully.
- The final UI corrects metadata to cover the whole trip and warns when transport costs have not been itemized; a zero transport estimate is never silently presented as a complete budget.

- The daily PNG downloaded successfully and was visually inspected: Thai text wraps correctly, all selected-day activities appear, and the image uses the dark theme.
- With network connectivity disabled in the browser, the app reloaded from its service worker and reopened the complete saved 5-day plan. The checked packing item remained checked. Network emulation was restored afterward.
- Print-media inspection confirms all **5 day panels** are displayed, including panels hidden during normal tab navigation. Printing uses a light palette. Automatic PDF extraction through the in-app browser CDP timed out; a physical browser print/save dialog was not tested.
- GitHub Actions successfully built the source, ran all 28 regression tests, checked manifests/icons/secrets and verified generated-file consistency on the published branch.
- A final GitHub Pages smoke test generated a real 1-day Bangkok–Kanchanaburi return trip for 2 adults: **฿2,370** overall, including **฿1,450** of itemized transport, with no extra lodging night. Unrelated Chiang Mai search results were identified; the follow-up filters those sources instead of presenting them as evidence for another destination.
- The release uses the existing GAS deployment URL, version **120**, with the original access settings and Script Properties retained.

## Release

- [GitHub Pages](https://basssg.github.io/TripPlanner/)
- [Change review](https://github.com/BassSG/TripPlanner/pull/1)
- [Apps Script project](https://script.google.com/home/projects/1KMuYaHImc-CAzdRQwJye8kYO27sYch9QSjqb-_OaSDkfJFHZNTonprU6/edit)

## Practical limits

- Prices are estimates for the group, not guaranteed rates or bookings. Search sources are supporting evidence, not a verification badge.
- Browser storage is device/origin-specific; JSON exports are the backup and transfer path. No cross-device cloud sync is claimed.
- The 30-day maximum is validated by mocked API regression tests. Live smoke tests use shorter trips to avoid unnecessary API consumption.
- Responsive tests use desktop browser device-size emulation; physical iOS/Android installation and native share sheets still depend on the device/browser.
- The request ticket expires after 30 minutes and Apps Script may evict cache entries earlier. The UI resets expired requests so another attempt can start cleanly.
