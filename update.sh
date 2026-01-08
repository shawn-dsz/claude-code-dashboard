#!/bin/bash
# Claude Code Dashboard Data Update Script
# Usage: ./update.sh

set -e

SOURCE_FILE="$HOME/.claude/stats-cache.json"
DEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_FILE="$DEST_DIR/data.json"

echo "📊 Updating Claude Code Dashboard data..."
echo ""

# Check if source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: $SOURCE_FILE not found"
    echo "   Make sure you've used Claude Code at least once to generate stats."
    exit 1
fi

# Copy the file
cp "$SOURCE_FILE" "$DEST_FILE"

echo "✅ Data updated successfully!"
echo ""
echo "📁 Source: $SOURCE_FILE"
echo "📁 Destination: $DEST_FILE"
echo ""
echo "🌐 Open the dashboard in your browser to see updated stats:"
echo "   open $DEST_DIR/index.html"
echo ""
echo "Or refresh the page if it's already open."
