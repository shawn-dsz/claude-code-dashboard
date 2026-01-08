#!/bin/bash
# Claude Code Dashboard Server
# Usage: ./serve.sh [port]

PORT="${1:-8000}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting Claude Code Dashboard..."
echo ""

# Run aggregation script
if [ -f "$DIR/aggregate-data.sh" ]; then
    echo "📊 Aggregating data..."
    bash "$DIR/aggregate-data.sh"
    echo ""
fi

echo "📁 Directory: $DIR"
echo "🌐 URL: http://localhost:$PORT"
echo ""
echo "Theme toggle is available in the app (🌙/☀️ button)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Change to the project directory
cd "$DIR"

# Start the server and open browser
python3 -m http.server "$PORT" &
SERVER_PID=$!

# Wait a moment for server to start
sleep 0.5

# Open browser
open "http://localhost:$PORT/"

# Wait for the server process
wait $SERVER_PID
