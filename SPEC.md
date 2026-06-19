# Matura Nota Product Spec

## Vision

Matura Nota is a static, public analytics platform for Albanian Matura exam results. It turns anonymous exam records into a fast, clear, and accessible data exploration experience for two audiences:

- The general public, journalists, researchers, schools, and policy observers who want to understand national exam performance.
- Individual students who want to look up their anonymous identifier and understand their results in context.

The application is Albanian-first in the user interface and English-first in developer documentation. It should feel like a public statistics dashboard: calm, trustworthy, responsive, and focused on insight rather than raw record display.

## Core Experiences

### Public Analytics

Users can explore national Matura performance across years, exams, and subjects. The experience should answer questions such as:

- How did students perform nationally?
- Which subjects had the highest or lowest averages?
- How are scores and grades distributed?
- What percentage of students passed?
- Where are there notable differences between subjects?
- Which insights are interesting without requiring technical analysis?

Required analytics include:

- Candidate/result counts.
- Average, median, minimum, maximum, and standard deviation.
- Percentiles, especially p10, p25, p50, p75, and p90.
- Pass rates and grade distributions.
- Subject comparisons and rankings.
- Score distributions through histograms or density-style views.
- Drill-down from national overview to subject-level detail.

Public analytics should include search, sorting, filtering, and interactive charts. The default view should provide useful insight immediately, even for non-technical users.

### Student Lookup

Students can enter their anonymous student identifier and view their personal results. The lookup must not require or expose personally identifying information.

The result view should include:

- A clear list of subjects/exams taken.
- Points, scaled grade, and final grade.
- Comparison against national average for each subject.
- Percentile context for each result.
- Visual indicators for above-average and below-average performance.
- Short personalized insight text that explains strengths and areas to review.

The lookup flow must handle existing IDs, missing IDs, students with one result, and students with multiple results.

## Data Model

The current upstream extractor reads PDF tables into row-level JSON with these fields:

- `ID`: anonymous student identifier.
- `Lenda`: subject name.
- `Pike Totale`: total points.
- `Nota e Shkallezuar`: scaled grade.
- `Nota`: final grade.

Frontend-facing data should be normalized into ASCII-safe camelCase fields:

```ts
type ExamRecord = {
  id: string;
  year: number;
  exam: string;
  subject: string;
  totalPoints: number;
  scaledGrade: number;
  grade: number;
};
```

Aggregated artifacts should be generated before deployment so the browser consumes compact JSON instead of recalculating national statistics from the full raw dataset.

Recommended static artifacts:

- `public/data/index.json`: available years, latest year, dataset metadata.
- `public/data/{year}/summary.json`: national summary, headline metrics, distributions, and insights.
- `public/data/{year}/subjects.json`: subject-level aggregate metrics and chart-ready series.
- `public/data/{year}/students/{shard}.json`: anonymous student lookup shards.

## Architecture

The app must be fully static and deployable to a CDN or static host. No backend service is required for v1.

Recommended stack:

- Runtime and package manager: Bun.
- Frontend: Vite, React, TypeScript.
- Routing: TanStack Router.
- Charts: Apache ECharts.
- Tables and sorting: TanStack Table.
- Styling: Tailwind CSS v4 with a restrained dashboard design system.
- Testing: Vitest for statistics/data utilities and Playwright for key user flows.

The existing `extraction/` Python project remains the upstream PDF extraction step. Future preprocessing should add Bun/TypeScript scripts that normalize extracted records, validate schemas, compute aggregates, shard student records, and write static frontend artifacts.

## UX Principles

- Prioritize clarity, speed, and accessibility.
- Use Albanian labels and concise explanatory text in the public interface.
- Lead with insight cards and chart summaries before detailed tables.
- Keep filters visible and predictable.
- Make charts interactive through tooltips, legends, highlighting, and drill-down affordances.
- Use color consistently for performance status, but never rely on color alone.
- Ensure keyboard navigation, readable contrast, responsive layouts, and clear empty states.
- Prefer dense but organized dashboard layouts over marketing-style pages.

## Performance Requirements

- The initial route should load quickly on static hosting.
- Large datasets must be precomputed into compact artifacts.
- Student lookup should use sharded static files or indexes so the browser does not download all student records up front.
- Charts should consume prepared series data.
- Filtering and sorting should remain responsive for subject-level tables.

## Future Expansion

The data model and UI should allow:

- Multiple years.
- Additional exam sessions and subjects.
- Region, school, or demographic aggregates if legally and ethically publishable.
- Richer trend analysis across years.
- Dataset version metadata and source provenance.
- Downloadable aggregate CSV/JSON files.
- More advanced insight generation and anomaly detection.

## Acceptance Criteria

- A user can understand national performance from the first screen.
- A user can compare subjects through charts and a sortable table.
- A student can enter an anonymous ID and see contextualized personal results.
- The app builds into static files.
- The data layer is separated from presentation.
- ECharts is used for visualizations.
- The implementation remains clean, typed, and developer friendly.
