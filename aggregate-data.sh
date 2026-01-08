#!/bin/bash
# Claude Code Dashboard Data Aggregation Script
# Generates projects.json and sessions.json from ~/.claude/projects/

set -e

PROJECTS_DIR="$HOME/.claude/projects"
DEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📊 Aggregating Claude Code data..."
echo ""

# Check if projects directory exists
if [ ! -d "$PROJECTS_DIR" ]; then
    echo "❌ Error: $PROJECTS_DIR not found"
    echo "   Make sure you've used Claude Code at least once."
    exit 1
fi

# Generate projects.json
echo "📁 Generating projects.json..."
PROJECTS_OUTPUT="$DEST_DIR/projects.json"

echo "[" > "$PROJECTS_OUTPUT"

first=true
find "$PROJECTS_DIR" -maxdepth 1 -type d -not -name "$PROJECTS_DIR" | while read -r project_dir; do
    project_name=$(basename "$project_dir")
    session_files=$(find "$project_dir" -maxdepth 1 -name "*.jsonl" -type f 2>/dev/null)
    session_count=$(echo "$session_files" | grep -c . || echo "0")

    if [ "$session_count" -gt 0 ]; then
        # Get last modified timestamp
        last_timestamp=$(find "$project_dir" -maxdepth 1 -name "*.jsonl" -type f -printf '%T@\n' 2>/dev/null | sort -rn | head -1)

        if [ "$first" = false ]; then
            echo "," >> "$PROJECTS_OUTPUT"
        fi
        first=false

        cat >> "$PROJECTS_OUTPUT" << EOF
{
  "path": "$project_name",
  "sessionCount": $session_count,
  "lastTimestamp": ${last_timestamp:-0}
}
EOF
    fi
done

echo "]" >> "$PROJECTS_OUTPUT"
echo "✅ projects.json generated"

# Generate sessions.json (simplified index)
echo ""
echo "📝 Generating sessions.json..."
SESSIONS_OUTPUT="$DEST_DIR/sessions.json"

# Use jq for safer JSON parsing if available
if command -v jq &> /dev/null; then
    # Fast path with jq
    find "$PROJECTS_DIR" -maxdepth 2 -name "*.jsonl" -type f -exec sh -c '
        for file do
            project=$(basename "$(dirname "$file")")
            session_id=$(basename "$file" .jsonl)
            first_line=$(head -1 "$file" 2>/dev/null)
            if [ -n "$first_line" ]; then
                timestamp=$(echo "$first_line" | jq -r "select(.timestamp != null) | .timestamp" 2>/dev/null | head -1)
                model=$(echo "$first_line" | jq -r "select(.model != null) | .model" 2>/dev/null | head -1)
                message_count=$(wc -l < "$file" 2>/dev/null || echo "0")
                echo "{\"sessionId\":\"$session_id\",\"project\":\"$project\",\"timestamp\":\"$timestamp\",\"model\":\"$model\",\"messageCount\":$message_count}"
            fi
        done
    ' sh {} + | jq -s '.' > "$SESSIONS_OUTPUT"
else
    # Fallback without jq
    echo "[" > "$SESSIONS_OUTPUT"
    first=true
    find "$PROJECTS_DIR" -maxdepth 2 -name "*.jsonl" -type f | while read -r session_file; do
        project=$(basename "$(dirname "$session_file")")
        session_id=$(basename "$session_file" .jsonl)

        # Get first line for metadata
        first_line=$(head -1 "$session_file" 2>/dev/null)
        message_count=$(wc -l < "$session_file" 2>/dev/null | tr -d ' ')

        if [ "$first" = false ]; then
            echo "," >> "$SESSIONS_OUTPUT"
        fi
        first=false

        cat >> "$SESSIONS_OUTPUT" << EOF
{
  "sessionId": "$session_id",
  "project": "$project",
  "timestamp": null,
  "model": null,
  "messageCount": ${message_count:-0}
}
EOF
    done
    echo "]" >> "$SESSIONS_OUTPUT"
fi

echo "✅ sessions.json generated"
echo ""
echo "🎉 Data aggregation complete!"
echo "   📁 $PROJECTS_OUTPUT"
echo "   📁 $SESSIONS_OUTPUT"
