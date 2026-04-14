# Plan: Pixel Agents Web Dashboard

## Goal

Replace `home.html` with a pixel-art office visualisation where each agent is a character. Active agents sit at desks typing. Idle agents rest on couches/beds. Each project gets its own room.

## Data Source

- **API**: `GET /api/peers` (proxied from claude-peers broker at `127.0.0.1:7899`)
- **Returns**: `[{ id, pid, cwd, git_root, tty, summary, registered_at, last_seen, cpu, isActive }]`
- **Active check**: The API returns `isActive` (boolean), `cpu` (float), and `parentPid` (int) per peer. Server-side, `server.js` enriches broker data with **instantaneous CPU** by sampling `cputime` twice 200ms apart on the parent claude process. An agent with > 5% instantaneous CPU is considered active.

### Activity detection - key learnings

1. **Do NOT use `last_seen`** - heartbeats fire every ~5s even for fully idle agents.
2. **The broker PID is the bun MCP server**, not the claude process. The actual claude binary is the **parent** process. Always check `ppid` first.
3. **`ps %cpu` is a lifetime average**, not instantaneous. It's useless for detecting current activity. Instead, sample `cputime` (cumulative CPU seconds) twice with a short gap and compute the delta.
4. **Threshold: > 5% instantaneous CPU** = active. Idle agents sit at ~0-3%. Active agents doing tool calls spike to 10-30%+.
5. **The 200ms sampling delay** adds latency to the API response but gives accurate readings.
- **Project extraction**: `cwd.match(/\/proj\/(.+)$/)[1]`
- **Branch**: worktree paths (`/worktrees/branch-name`) encode the branch in the folder name, otherwise assume `main`
- Poll every 5 seconds

## Sprite Assets (MIT licensed)

Copy from `/tmp/pixel-agents/webview-ui/public/`:

- `characters.png` - 6 character variants, each 16x32px, with walk/type/read frames
- `assets/furniture/PC/` - computer sprites (front on/off, side, back)
- `assets/furniture/DESK/` - desk sprites
- `assets/furniture/CUSHIONED_BENCH/` - for idle agents
- `assets/walls/wall_0.png` - room wall tiles

Place in `/Users/shawn/proj/claude-code-dashboard/assets/`

The pixel-agents project is at `/tmp/pixel-agents` (cloned from https://github.com/pablodelucca/pixel-agents, MIT licence).

## Architecture

**Single file**: `home.html` (inline CSS + JS, same as current pattern)

**Rendering**: Canvas 2D, `image-rendering: pixelated`, integer zoom (3x or 4x)

**Layout** (no tile engine needed):

```
+--[ talux-context ]---------------------+
|  office              |  break room     |
|  [desk][char]        |  [couch][char]  |
|  [desk][char]        |  [couch][char]  |
|  [desk][char]        |                 |
+-----------------------------------------+
```

Each project = one room div containing a `<canvas>`. Room rendered as:

- Left side: "office" with desks. Active agents here, typing animation.
- Right side: "break room" with couches. Idle agents here, resting.

**Character rendering**:

- Extract 16x32 sprite frames from `characters.png` sprite sheet via `drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)`
- Assign character variant per agent: `hashId(agent.id) % 6`
- Active: alternate between typing frames every 500ms
- Idle: static sitting frame

**No pathfinding, no walking, no tile map.** Characters are placed at fixed desk/couch positions. They transition between office and break room on state change (can do a simple CSS transition or just snap).

## Page Structure

```
[topbar] - "CLAUDE AGENTS" logo, live dot, status, nav link to /index.html
[hero]   - big agent count, working/sleeping/projects counts
[rooms]  - grid of room canvases, one per project
[detail] - agent list + click-to-inspect detail panel
```

### Current topbar/hero design (keep this)

- Dark theme: `--bg: #0a0e1a`, `--bg-card: #141825`
- Green accent: `--green: #00d68f`
- Purple secondary: `--purple: #7b61ff`
- Pixel font: `Press Start 2P` from Google Fonts
- Hero: giant green number in pixel font for agent count
- Status bar: live green dot + "X working, Y sleeping"

## Key Functions

1. `loadSpriteSheet(url)` - load characters.png, return Image
2. `drawCharacter(ctx, img, variantIndex, frame, x, y, scale)` - draw one character from sheet
3. `drawDesk(ctx, img, x, y)` - draw desk + monitor furniture
4. `drawCouch(ctx, img, x, y)` - draw couch furniture
5. `renderRoom(canvas, projectName, activeAgents, idleAgents)` - full room render
6. `syncPeers(peers)` - group by project, create/update rooms, render
7. `selectAgent(id)` - highlight in room + detail panel

## Existing Files (do not modify unless noted)

| File | Purpose |
|------|---------|
| `server.js` | Node server, serves static files + proxies `/api/peers` to broker. No changes needed. |
| `serve.sh` | Launches server. No changes needed. |
| `index.html` | Activity dashboard (historical stats). No changes needed. |
| `dashboard-common.js` | Shared utils for index.html. No changes needed. |

## File Changes

| File | Action |
|------|--------|
| `home.html` | Full rewrite with pixel-art room visualisation |
| `assets/characters.png` | Copy from pixel-agents |
| `assets/desk.png` | Copy from pixel-agents |
| `assets/pc_front_on.png` | Copy from pixel-agents |
| `assets/couch.png` | Copy from pixel-agents |

## Implementation Steps

1. Copy sprite assets from `/tmp/pixel-agents/webview-ui/public/` to `assets/`
2. Build the sprite sheet extraction logic (character variant + frame selection)
3. Build the room canvas renderer (desks on left, couches on right, characters at positions)
4. Build the room grid layout (one canvas per project, auto-sizing grid)
5. Wire up the polling loop and peer data flow
6. Add the detail panel (agent list + click-to-inspect)
7. Keep the topbar and hero metric from the current design
8. Test in browser at `http://localhost:8082/`

## Sprite Sheet Layout (characters.png)

The sprite sheet contains 6 character variants arranged horizontally. Each variant has multiple frames for different directions and actions:

- Frames per direction: 7 (walk x3, idle x1, type x2, read x2)
- Directions: down, up, right (left = horizontal flip of right)
- Character size: 16x32 pixels each

Use `drawImage(img, sourceX, sourceY, 16, 32, destX, destY, 16*scale, 32*scale)` to extract frames.

## Helper: Project Extraction

```javascript
function extractProject(cwd) {
    var m = cwd.match(/\/proj\/(.+)$/);
    return m ? m[1] : cwd.split('/').slice(-2).join('/');
}

function shortProject(cwd) {
    return extractProject(cwd).split('/').pop();
}

function isWorktree(cwd) {
    return cwd.indexOf('/worktrees/') !== -1;
}

function extractBranch(cwd) {
    return isWorktree(cwd) ? cwd.split('/').pop() : 'main';
}

// Activity determined server-side via instantaneous CPU sampling.
// Do NOT use last_seen (heartbeats fire constantly for idle agents).
function isActive(peer) {
    return !!peer.isActive;
}

function hashId(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) {
        h = ((h << 5) - h + id.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}
```
