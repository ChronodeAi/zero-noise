# zero-noise

This project uses the AI Writing Guide SDLC Complete framework.

## Getting Started

### 1. Fill Intake Forms

Start by completing the intake forms in the `.aiwg/intake/` directory:

- `.aiwg/intake/project-intake.md` - Project overview, stakeholders, constraints
- `.aiwg/intake/solution-profile.md` - Technical requirements, architecture preferences
- `.aiwg/intake/option-matrix.md` - Solution alternatives and evaluation criteria

### 2. Agents and Commands

SDLC agents and commands are automatically deployed to `.claude/agents/` and `.claude/commands/`.

Access to SDLC framework documentation is configured in `.claude/settings.json`.

### 3. Start SDLC Flow

Once intake forms are complete, kick off the Concept → Inception flow:

```bash
# Start Inception phase with automated validation
/project:flow-concept-to-inception .

# Or use the intake-start command
/project:intake-start .aiwg/intake/

# Check available flow commands
ls .claude/commands/flow-*.md
```

### 4. SDLC Framework Documentation

Claude Code agents have read access to the complete SDLC framework documentation at:

`/Users/chronode/.local/share/ai-writing-guide/agentic/code/frameworks/sdlc-complete/`

This includes templates, flows, add-ons, and artifacts for all SDLC phases.

## Framework Components

- **Agents** (51): Specialized SDLC role agents (Requirements Analyst, Security Gatekeeper, etc.)
- **Commands** (24+): Flow orchestration and workflow commands
- **Templates**: Intake, requirements, architecture, test, security, deployment
- **Flows**: Phase-based workflows (Inception → Elaboration → Construction → Transition)
- **Add-ons**: GDPR compliance, legal frameworks

## Key Commands

- `/project:flow-concept-to-inception` - Execute Inception phase
- `/project:flow-discovery-track` - Continuous requirements refinement
- `/project:flow-delivery-track` - Test-driven implementation
- `/project:flow-iteration-dual-track` - Synchronize Discovery and Delivery
- `/project:flow-gate-check` - Validate phase gates
- `/project:flow-handoff-checklist` - Phase transition validation

For more information, see the [SDLC Complete Framework documentation](/Users/chronode/.local/share/ai-writing-guide/agentic/code/frameworks/sdlc-complete/README.md).
# Trigger redeploy
