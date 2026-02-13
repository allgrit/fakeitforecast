# Release checklist: Analysis save/reset/telemetry

## Feature flags
- `analysis.save-slice`
- `analysis.full-reset`
- `analysis.telemetry-v1`
- `analysis.api-error-messages`

## Pre-release checks
1. Verify `POST /analysis/save` returns 200 in staging for valid payload and 4xx for invalid payload.
2. Verify API error responses (400/409/422) show user-friendly messages in UI.
3. Verify "Убрать все фильтры" resets:
   - dates;
   - warehouse/classification;
   - selected node;
   - flags;
   - scope selection;
   - service level matrix values;
   - search field and workspace transient state.
4. Verify telemetry events are sent:
   - analysis run start (`analysis_run_started`);
   - view switch (`analysis_view_switched`);
   - service level apply (`analysis_service_level_apply`).
5. Run automated tests (`npm test`, `python -m unittest tests/test_analysis_openapi.py`).

## Rollout plan

### Wave 1 — 10%
- Enable all 4 flags for 10% of users.
- Monitor 24h:
  - API errors for `/analysis/save`;
  - telemetry ingest volume;
  - front-end errors.
- Rollback condition: error budget exceeded or save success rate < 99%.

### Wave 2 — 50%
- Increase rollout to 50% after stable Wave 1.
- Monitor 24h with same SLOs.
- Rollback condition: same as Wave 1.

### Wave 3 — 100%
- Enable flags to 100%.
- Keep wave-specific dashboards for 72h.
- Remove temporary alert thresholds after stabilization.
