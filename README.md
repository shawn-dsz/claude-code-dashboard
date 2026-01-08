# Claude Code Usage Dashboard

A personal dashboard to visualize your Claude Code usage patterns.

## Quick Start

### Update the data

Run the update script:

```bash
cd /Users/shawn/proj/claude-code-dashboard
./update.sh
```

Or manually copy the stats:

```bash
cp ~/.claude/stats-cache.json data.json
```

### View the dashboard

Open `index.html` in your browser:

```bash
open index.html
```

The dashboard will **automatically load** from `data.json` when you open it.

## Features

- **6 Key Metrics**: Total messages, sessions, tool calls, averages, most active day, and current streak
- **5 Interactive Charts**: Daily activity timeline, messages per day, tool calls, session frequency, and distribution
- **Dynamic Insights**: Personalized observations about your usage patterns
- **Auto-load**: Data loads automatically from `data.json` on page load
- **Easy Updates**: Just run `./update.sh` to refresh your stats

## Updating Your Data

Whenever you want to see updated stats:

1. Run the update script: `./update.sh`
2. Refresh the dashboard in your browser (or click "Reload Data")

The script copies your latest Claude Code stats from `~/.claude/stats-cache.json` to `data.json`.

## Manual Data Load

If you prefer to paste data manually:

1. Copy contents of `~/.claude/stats-cache.json`
2. Paste into the text area on the dashboard
3. Click "Load Data"

## Files

- `index.html` - Main dashboard (self-contained)
- `data.json` - Your stats cache (auto-generated)
- `update.sh` - Update script to refresh data
- `README.md` - This file
