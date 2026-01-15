# Setup Guide

This guide will help you set up the Claude Code Usage Dashboard with your own Claude Code statistics.

## Prerequisites Checklist

Before you begin, make sure you have:

- [ ] **Claude Code CLI installed** - [Get it here](https://claude.ai/code)
- [ ] **Used Claude Code at least once** - This generates the session data files
- [ ] **Node.js** (v14 or higher) - For the session cache builder
  - Check: `node --version`
  - Install: [nodejs.org](https://nodejs.org/)
- [ ] **Python 3** - For the local development server
  - Check: `python3 --version`
  - Usually pre-installed on macOS/Linux

## Quick Start (5 minutes)

```bash
# 1. Navigate to the dashboard directory
cd /path/to/claude-code-dashboard

# 2. Install Node.js dependencies
npm install

# 3. Update your data from Claude Code
./update.sh

# 4. Start the dashboard
./serve.sh
```

The dashboard will open automatically at `http://localhost:8000`

## Understanding the Data Flow

### Where Your Data Is Stored

Claude Code stores your session data in your home directory:

```
~/.claude/
├── projects/                    # All your projects
│   ├── project-name-1/
│   │   └── session.jsonl       # Raw session data
│   └── project-name-2/
│       └── session.jsonl
└── stats-cache.json             # Aggregated statistics
```

### How the Dashboard Processes Your Data

```
~/.claude/projects/*/session.jsonl
           ↓
build-session-cache.js (reads & indexes)
           ↓
.cache/sessions.db (SQLite cache - fast!)
           ↓
aggregate-data.sh (queries cache)
           ↓
projects.json + sessions.json (for dashboard)
           ↓
index.html (visualizes your stats)
```

### Why a Cache?

The SQLite cache makes updates **much faster**:
- **Initial build**: ~2 seconds for ~1,400 session files
- **Incremental updates**: ~0.1 seconds (only processes new files)

## Step-by-Step Setup

### Step 1: Clone or Download

```bash
git clone <repository-url>
cd claude-code-dashboard
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs `sql.js` - a pure JavaScript SQLite library used for the session cache.

### Step 3: Update Your Data

```bash
./update.sh
```

This script:
1. Copies your latest stats from `~/.claude/stats-cache.json`
2. Builds the SQLite session cache from all your project session files
3. Generates `projects.json` and `sessions.json`

### Step 4: Start the Dashboard

```bash
./serve.sh
```

This script:
1. Aggregates the latest data (runs `aggregate-data.sh`)
2. Starts a local web server on port 8000
3. Opens your browser to `http://localhost:8000`

## Customization

### Change the Port

```bash
./serve.sh 3000  # Uses port 3000 instead of 8000
```

### Update Model Pricing

Edit `dashboard-common.js` (lines 40-48) to customize model pricing for cost calculations:

```javascript
const MODEL_PRICING = {
    'claude-sonnet-4-5-20250929': { input: 3, output: 15, cacheRead: 0.30, cacheWrite: 3.75 },
    'claude-opus-4-5-20251101': { input: 15, output: 75, cacheRead: 1.50, cacheWrite: 18.75 },
    // Add your models here
};
```

### Add Model Name Aliases

Edit `dashboard-common.js` (lines 107-118) to add friendly names for models:

```javascript
function formatModelName(modelId) {
    const nameMap = {
        'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
        'your-model-id': 'Your Display Name',
    };
    return nameMap[modelId] || modelId;
}
```

## Troubleshooting

### "stats-cache.json not found"

**Cause**: You haven't used Claude Code yet, or it's in a different location.

**Solution**:
1. Make sure Claude Code CLI is installed
2. Run a Claude Code session: `cd /your/project && claude`
3. Try `./update.sh` again

### "Node.js not found"

**Cause**: Node.js is not installed or not in your PATH.

**Solution**:
- macOS: `brew install node`
- Ubuntu: `sudo apt install nodejs npm`
- Download: [nodejs.org](https://nodejs.org/)

### "Projects directory not found"

**Cause**: The `~/.claude/projects` directory doesn't exist.

**Solution**:
- Use Claude Code in at least one project to generate session data
- Check that `~/.claude` exists: `ls ~/.claude`

### Dashboard shows "No data available"

**Cause**: The data files weren't generated or are empty.

**Solution**:
```bash
# Rebuild the cache from scratch
rm .cache/sessions.db
./serve.sh  # This will rebuild the cache
```

### Changes aren't showing in the dashboard

**Cause**: Browser cache or data not updated.

**Solution**:
```bash
# Update the data
./update.sh

# Then hard refresh your browser:
# Chrome/Firefox: Cmd+Shift+R (macOS) or Ctrl+Shift+R (Windows/Linux)
```

## Updating Your Data

Whenever you want to see updated stats:

```bash
./update.sh
```

Then refresh your browser.

## Data Privacy

- All data stays **local** on your machine
- The dashboard reads from `~/.claude/` - nothing is sent to external servers
- The local server (`serve.sh`) only serves files to your browser

## Next Steps

- Explore the [Features](README.md#features)
- Read the [Glossary](README.md#dashboard-metrics) to understand the metrics
- Check the [Key Links](README.md#key-links) for official documentation
