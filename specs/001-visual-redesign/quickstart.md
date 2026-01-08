# Quickstart Guide: Claude Code Wrapped 2025

**Feature**: 001-visual-redesign
**Date**: 2025-01-09
**Status**: ✅ Implementation Complete

This guide covers how to run and verify the redesigned "Claude Code Wrapped 2025" dashboard.

---

## What Is This?

A **Spotify Wrapped-style year-in-review dashboard** for your Claude Code usage statistics. The dashboard displays:

- **Activity Heatmap** - GitHub-style contribution graph showing your entire year
- **Weekly Patterns** - Bar chart showing which days you're most active
- **Cache Efficiency** - How much you're saving with prompt caching
- **Top Models** - Which Claude models you use most
- **Usage Cost** - Estimated spend based on API pricing
- **Journey Stats** - When you started, total messages, sessions, tokens, and streak

---

## Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server OR direct file opening
- Existing `data.json` file in the project root

---

## Running the Dashboard

### Option 1: Direct File Open (Quickest)

1. Open `index.html` directly in your browser
2. The dashboard will auto-load `data.json`
3. If loading fails, you'll see an error message

### Option 2: Local Server (Recommended)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (using npx)
npx serve

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

### Option 3: Using Update Script

```bash
# Copy latest Claude stats
cp ~/.claude/stats-cache.json data.json

# Open the dashboard
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

---

## Verification Checklist

### Visual Design

- [ ] **Clean Layout**: 900px max-width container centered on page
- [ ] **Coral Accent**: Key highlights in #ff6b47 color
- [ ] **Card Design**: White cards with subtle shadows
- [ ] **Typography**: Clear hierarchy (11px labels, 32px values, 40px title)
- [ ] **Grid Layouts**: 2-column and 3-column grids with 16px gaps
- [ ] **Star Icon**: ⭐ emoji in header

### Components

- [ ] **Activity Heatmap**: 52x7 grid showing year of activity
- [ ] **Heatmap Intensity**: 5 opacity levels (0.2 to 1.0)
- [ ] **Month Labels**: Jan-Dec labels below heatmap
- [ ] **Weekly Chart**: Bar chart with S/M/T/W/T/F/S labels
- [ ] **Progress Bar**: Smooth coral fill for cache efficiency
- [ ] **Model Rankings**: Top 3 models by token usage

### Metrics

- [ ] **Journey Date**: Shows when user started
- [ ] **Most Active Day**: Day of week with most messages
- [ ] **Cache Hit Rate**: Percentage with progress bar
- [ ] **Cache Read/Write**: Token counts in formatted form (K/M)
- [ ] **Total Sessions**: Session count
- [ ] **Total Messages**: Message count
- [ ] **Total Tokens**: Token count formatted (K/M)
- [ ] **Current Streak**: Consecutive days count
- [ ] **Avg Per Session**: Messages per session
- [ ] **Usage Cost**: Estimated spend in dollars

### Interactions

- [ ] **Auto-Load**: Data loads automatically on page open
- [ ] **Error Handling**: Graceful error if data.json missing
- [ ] **Loading State**: Shows "Loading your stats..." initially

---

## Data Format

The dashboard expects `data.json` with this structure:

```json
{
  "dailyActivity": [
    {
      "date": "2025-01-09",
      "messageCount": 150,
      "sessionCount": 5,
      "toolCallCount": 45
    }
  ],
  "modelUsage": {
    "claude-sonnet-4-5-20250929": {
      "inputTokens": 1000000,
      "outputTokens": 500000,
      "cacheReadInputTokens": 200000,
      "cacheCreationInputTokens": 50000
    }
  },
  "dailyModelTokens": [
    {
      "date": "2025-01-09",
      "modelTokens": {
        "claude-sonnet-4-5-20250929": 50000
      }
    }
  ]
}
```

---

## Browser Testing

Test in these browsers for compatibility:

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Primary | Best tested |
| Firefox | [ ] | Gecko engine |
| Safari | [ ] | WebKit engine |
| Edge | [ ] | Chromium-based |

---

## Responsive Testing

### Screen Sizes to Test

| Device | Width | Expected Layout |
|--------|-------|----------------|
| Desktop | 1200px+ | 2-column and 3-column grids |
| Laptop | 900px | Full-width container |
| Tablet | 768px | May stack vertically |
| Mobile | 375px | Single column |

### Testing with DevTools

1. Open DevTools (F12 or Cmd+Option+I)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test common sizes:
   - iPhone SE: 375px × 667px
   - iPad: 768px × 1024px
   - Desktop: 1440px × 900px

---

## Performance Testing

### Load Time

1. Open DevTools Network tab
2. Disable cache
3. Reload page
4. Verify page load < 2 seconds (should be ~1s)

### Bundle Size

- HTML file: ~15KB
- No external dependencies
- No JS frameworks
- No CSS libraries

---

## Troubleshooting

### Dashboard Won't Load

**Problem**: Blank page or error message

**Solutions**:
- Verify `data.json` exists in project root
- Use local server instead of file:// protocol
- Check browser console for errors
- Verify JSON format is valid

### Heatmap Shows Nothing

**Problem**: Heatmap is all gray

**Solutions**:
- Verify `dailyActivity` array has data
- Check that dates are within the last year
- Ensure `messageCount` values are present

### Cache Efficiency Shows 0%

**Problem**: Cache metrics are zero

**Solutions**:
- Verify `modelUsage` object exists in data.json
- Check for `cacheReadInputTokens` and `cacheCreationInputTokens`
- Note: Older data may not have cache metrics

### Charts Look Wrong

**Problem**: Bars or heatmap cells misaligned

**Solutions**:
- Clear browser cache
- Try different browser
- Check for conflicting CSS in browser extensions
- Test in incognito/private mode

---

## Feature Highlights

### Activity Heatmap

- **52 columns** representing weeks
- **7 rows** representing days of week
- **364 cells** total (full year)
- **5 intensity levels** based on message count
- **Color**: Coral (#ff6b47) with opacity variations

### Weekly Chart

- **7 bars** for days of week (Sunday-Saturday)
- **Dynamic heights** based on message count
- **Percentage-based** for responsive scaling
- **Day labels** positioned below each bar

### Progress Bar

- **8px height** with rounded corners
- **Dynamic width** based on cache hit rate
- **Smooth coral fill** (#ff6b47)
- **Gray background** for empty state

---

## Known Limitations

1. **Data Coverage**: Only shows last 52 weeks from first activity
2. **Time Zone**: Uses browser's local time zone
3. **Currency**: USD only for cost estimation
4. **Model Pricing**: Estimates based on listed prices (may vary)
5. **Accessibility**: Missing ARIA labels for heatmap cells
6. **Dark Mode**: Not implemented (light theme only)
7. **Export**: No way to save or share summary
8. **Historical**: Single year view only (no comparisons)

---

## Future Enhancements

Potential improvements for future versions:

1. **Animations** - Fade-in effects for cards and charts
2. **Dark Mode** - Toggle for dark theme
3. **Export** - Save as PDF or shareable image
4. **Comparison** - Year-over-year comparison view
5. **More Metrics** - Tool usage breakdown, top files/projects
6. **Accessibility** - ARIA labels, keyboard navigation, screen reader support
7. **Filtering** - Date range selection
8. **Multi-Year** - Historical data beyond one year

---

## File Structure

```
/
├── index.html          # Wrapped 2025 dashboard (✅ COMPLETED)
├── data.json           # Your stats data
├── update.sh           # Update script
├── README.md           # Project documentation
└── specs/
    └── 001-visual-redesign/
        ├── spec.md         # Original specification
        ├── plan.md         # Implementation plan (updated)
        ├── research.md     # Research findings
        ├── data-model.md   # Data model documentation
        └── quickstart.md   # This file
```

---

## Summary

The **Claude Code Wrapped 2025** dashboard is complete and ready to use. Simply open `index.html` in a browser with your `data.json` file to see your year-in-review statistics.

**Implementation Status**: ✅ Complete
**Branch**: `001-visual-redesign`
**Last Updated**: 2025-01-09
