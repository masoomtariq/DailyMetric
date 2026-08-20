# Dashboard Daylog Migration Checklist

## Phase 1: Baseline Capture

- [x] Sleep duration was displayed from `useDashboardData(today)` and the analytics dashboard `sleep_duration` field.
- [x] Yesterday's bed edit used `PATCH /daylogs/update_daylog?daylog_date=<previous-day>` with `{ date: <previous-day>, bed_time }`.
- [x] Today's wake edit used `PATCH /daylogs/update_daylog?daylog_date=<today>` with `{ date: <today>, wake_time }`.
- [x] Today's bed edit used `PATCH /daylogs/update_daylog?daylog_date=<today>` with `{ date: <today>, bed_time }`.
- [x] Daylog mutation invalidated dashboard and daylog queries; the refactor adds explicit active-query refetch and reconciliation after each save.

## Phase 2: Domain Layer

- [x] Date keys, response normalization, field routing, save sequencing, refresh, and accordion state are owned by `src/domain/dashboardDaylog.js`.
- [x] No sleep duration calculation is performed in the frontend.

## Phase 3: UI Relocation

- [x] Header sleep summary is read-only and remains sourced from analytics data.
- [x] `Today’s Log` contains separate `Today’s Sleep` and `Today’s Note` accordions.
- [x] Sleep and note saves have independent error messages and view/edit state.

## Phase 4: Cleanup

- [x] Deprecated header sleep edit controls and handlers were removed from the dashboard page.
- [x] Sleep and note entry controls are available through the accordions only.
