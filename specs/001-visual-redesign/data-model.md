# Data Model: Visual Design Enhancement

**Feature**: 001-visual-redesign
**Date**: 2025-01-09

---

## Status: No Data Model Changes

This feature involves **only visual design changes**. No modifications to data structures, schemas, or processing logic are required.

### What Remains Unchanged

1. **Data Source Format**: `data.json` format remains identical
2. **Data Parsing Logic**: JavaScript parsing functions unchanged
3. **Data Structure**: All existing data structures preserved
4. **API Contracts**: No API endpoints exist (static site)
5. **State Management**: No state management changes

---

## Existing Data Reference

### data.json Format

```json
{
  "dailyActivity": [
    {
      "date": "2025-01-09",
      "messageCount": 150,
      "sessionCount": 5,
      "toolCallCount": 45
    }
  ]
}
```

### Computed Values (Unchanged)

The dashboard computes the following values from raw data:
- Total Messages (sum of messageCount)
- Total Sessions (sum of sessionCount)
- Total Tool Calls (sum of toolCallCount)
- Average Messages per Session
- Most Active Day (max messageCount)
- Current Streak (consecutive active days)

### Chart Data Structures (Unchanged)

All Chart.js datasets use existing data structures:
- Labels: Array of formatted dates
- Datasets: Array of metric values
- Insights: Generated from computed values

---

## Visual Design Entities

The following "entities" represent visual design tokens, not data structures:

### Color Tokens
```css
--color-primary: #5E6AD2;
--color-secondary: #8B5CF6;
--color-accent-1: #06B6D4;
--color-accent-2: #F59E0B;
--color-success: #10B981;
--color-error: #EF4444;
--color-warning: #F59E0B;
--color-info: #3B82F6;
/* ... plus neutral scale ... */
```

### Typography Tokens
```css
--font-size-h1: 40px;
--font-size-h2: 28px;
--font-size-h3: 20px;
--font-size-body: 16px;
/* ... etc ... */
```

### Spacing Tokens
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

### Icon References

Icon names (Lucide Icons) used throughout:
- `message`, `users`, `wrench`, `calculator`, `flame`, `calendar`
- `chart-line`, `chart-bar`, `chart-pie`
- `refresh-cw`, `upload`, `settings`
- `check-circle`, `alert-circle`, `alert-triangle`, `info`

---

## Summary

| Aspect | Status | Notes |
|--------|--------|-------|
| Data Schema | Unchanged | No modifications to data.json format |
| Data Processing | Unchanged | All JavaScript logic preserved |
| Visual Tokens | New | CSS custom properties added |
| Icon References | New | Lucide icon names defined |
| API Contracts | N/A | Static site, no backend |

---

## Related Files

- [spec.md](./spec.md) - Functional requirements
- [research.md](./research.md) - Technical decisions
- [plan.md](./plan.md) - Implementation approach
