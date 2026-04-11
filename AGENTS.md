# Agent Context

This document provides context for AI agents working on this project.

## External Skills Reference

Claude Code skills are located at `~/proj/skills/`:

### Commands (`~/proj/skills/commands/`)
Slash commands for Claude Code that can be referenced for workflows:

| Command | Description |
|---------|-------------|
| `add` | Add new components/files to the project |
| `build-feature` | Complex feature implementation workflow with detailed planning and execution |
| `codex` | Quick codex reference |
| `coding-challenge-agent` | Agent specialized for coding challenges |
| `commit` | Git commit helper with message generation |
| `commit-pr` | Commit and create PR workflow |
| `docx` | Microsoft Word document operations |
| `frontend-design` | Frontend design and implementation workflow |
| `gemini` | Google Gemini model integration |
| `git-status` | Enhanced git status overview |
| `glm` | GLM model integration |
| `main` | Main entry point commands |
| `mentor` | Mentoring and code review workflow |
| `note` | Note-taking and documentation helper |
| `openclaw` | OpenClaw gateway operations |
| `optimize` | Code optimization workflow |
| `pdf` | PDF operations and processing |
| `pr` | Pull request creation and management |
| `pull` | Git pull with conflict resolution |
| `push` | Git push with checks |
| `search` | Enhanced search operations |
| `speckit.multimodel` | Multi-model specification workflow |
| `ui-component-agent` | UI component creation agent |
| `vault` | Secrets and credentials management |
| `write` | Writing and content generation |

### Other Resources

- **Templates**: `~/proj/skills/templates/` - Project templates
- **Adapters**: `~/proj/skills/adapters/` - Model adapters
- **Agents**: `~/proj/skills/agents/` - Agent configurations
- **Hooks**: `~/proj/skills/hooks/` - Workflow hooks
- **Prompts**: `~/proj/skills/prompts/` - Reusable prompts

## Using These Resources

When working on tasks, reference these external skills for:
1. **Workflow patterns** - Follow established patterns from similar commands
2. **Best practices** - Apply domain-specific knowledge from skills
3. **Templates** - Use as starting points for new files/components

To load a specific skill or command in context, ask the agent to read it from `~/proj/skills/`.
