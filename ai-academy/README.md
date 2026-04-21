# Unfold AI Teams — AI Academy Sample Project

> **"Train your engineers on AI. See who's learning."**

A complete reference implementation of an **AI learning ecosystem for engineering teams** using [Unfold](https://unfoldit.com) MCP tools. Every engineer gets a personalized AI learning path. Every manager gets a real-time cohort dashboard. The system notices things before you have to.

---

## What this builds

A running AI readiness program for a team building a **RAG-powered knowledge base agent** — anchored to real project work, not a generic syllabus.

```
Phase 1 — ASSESS     Benchmark each engineer before a single plan is built
Phase 2 — ENROLL     Generate personalized plans based on role + assessment gaps
Phase 3 — LEARN      Engineers work through steps with curated resources
Phase 4 — MONITOR    Real-time cohort dashboard — funnel, at-risk, health score
Phase 5 — IMPROVE    AI surfaces stall points, skill gaps, and what to fix
```

Each phase maps directly to the Unfold MCP tools your AI agent calls.

---

## The core pattern — two calls to enroll an engineer

```typescript
// 1. Measure where they are
const assessment = await client.generateAssessment({
  skill: "RAG & Retrieval",
  target_proficiency: "medium",
  work_item_context: {
    title: "RAG Knowledge Base Agent",
    description: "Build a production retrieval system for internal docs",
    domain_tags: ["RAG", "embeddings", "Python"],
  },
  num_questions: 8,
  request_id: "...",
});

// 2. Score + generate a focused plan from the gap
const score = await client.scoreAssessment({ ... });
const goal  = await client.createGoal({
  title: score.suggested_goal_seed.title,
  context: {
    experience_level: score.band,          // actual measured level
    tech_stack: ["Python", "FastAPI"],
    success_criteria: `Reach ${target} proficiency in RAG`,
  },
  metadata: { cohort: "spring-2026", track: "backend", role: "Backend Engineer" },
});
// → goal.claimLink is ready. Send it.
```

Plans focus on weak sub-skills from the assessment and skip what the engineer already knows.

---

## Role-based tracks

| Role | Track | Skills covered |
|---|---|---|
| Backend Engineer | `backend` | LLM APIs, RAG, streaming, evals, cost control |
| Frontend Engineer | `frontend` | AI UX patterns, streaming UI, error handling, user feedback |
| DevOps / Platform | `devops` | Model serving, rate limiting, observability, security |
| Data & ML Engineer | `data-ml` | Embeddings, vector DBs, fine-tuning, evaluation pipelines |

All four tracks are anchored to the same project: **building a production RAG knowledge base agent**.

---

## MCP Tools Covered

| Tool | Used in | What it does |
|---|---|---|
| `get_assessment_capabilities` | Scenarios 1, 6, 7 | Query supported skills, bands, question limits |
| `generate_skill_assessment` | Scenarios 1, 2, 6, 8 | MCQ benchmark for any skill, anchored to project context |
| `score_skill_assessment` | Scenarios 1, 2, 6, 8 | Score answers → band + suggested goal seed |
| `create_goal` | Scenarios 1, 2, 5, 6, 9 | AI-generated learning plan (3 autonomy tiers) |
| `get_clarification` | Scenario 2 | Fetch pending clarification questions (semi-auto) |
| `submit_clarification` | Scenario 2 | Submit answers → trigger plan generation |
| `import_plan` | Scenarios 3, 6 | Import your own curriculum + AI enrichment |
| `get_analytics` | Scenarios 4, 6, 8 | Cohort KPIs, funnel, at-risk, dimension breakdown |
| `list_goals` | Scenarios 5, 6, 8 | List goals with status/inactivity filters |
| `get_goal_status` | Scenarios 5, 6 | Deep-dive one goal — steps, progress, blockers |
| `revoke_claim` | Scenario 5 | Expire a stale claim link |

---

## Quickstart

### Prerequisites
- Node.js 18+
- Unfold API key — get one at [app.unfoldit.com](https://app.unfoldit.com) → **Organization → API Keys**

> **Scopes needed:** `goals:create` `goals:read` `assessment:generate` `assessment:score` `analytics:read`

```bash
cd sample-projects/ai-academy
npm install
cp .env.example .env
# Edit .env → set UNFOLD_API_KEY=your_key_here

npm run check-capabilities   # verify setup
npm run full-academy         # run the complete 5-phase demo
```

---

## Scenarios

```bash
# Foundation
npm run check-capabilities     # Verify API key + assessment engine info

# The 5-phase ecosystem
npm run assess-and-enroll      # Phase 1+2: Assess a developer, enroll with a targeted plan
npm run batch-onboard          # Phase 2: Enroll a 4-role team (Backend/Frontend/DevOps/Data)
npm run import-curriculum      # Alternative: Import your own curriculum with AI enrichment

# Operations
npm run analytics              # Phase 4: Cohort KPI dashboard
npm run ai-insights            # Phase 5: Intelligence layer — stall points, gaps, predictors
npm run at-risk                # Automated at-risk detection + targeted help plans

# Integration
npm run platform-integration   # How your existing portal integrates with Unfold

# Full demo
npm run full-academy           # All 5 phases, all 11 tools, one run
```

---

## The intelligence layer (Phase 5)

The system surfaces insights before you have to look for them. Run `npm run ai-insights` to see all five:

| Insight | What it detects | Source |
|---|---|---|
| **Stall point** | "Step 4 is where engineers give up — 24pt funnel drop" | `get_analytics` + funnel |
| **At-risk** | "3 engineers are about to go quiet — 7–12 days inactive" | `list_goals` + `inactive_days` |
| **Completion predictor** | "8 engineers haven't opened a resource — intervene now" | `get_analytics` |
| **Skill gap** | "65% of your team is below target on RAG" | `generate_skill_assessment` across team |
| **Content insight** | "Steps 4–6 have no video resources — that's fixable" | `get_analytics` + resource engagement |

---

## Platform integration

**"Drop Unfold into your stack in an afternoon."**

Your portal handles assessment and roster. Unfold handles plans, learning, and analytics. One MCP call to enroll. Live progress on both sides.

```
Your portal → generate_skill_assessment + create_goal → claim link → email/Slack → engineer
                                                                                    ↓
Your portal ← get_analytics / get_goal_status ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ engineer learns on Unfold
```

See `src/scenarios/09-platform-integration.ts` and `configs/` for the complete integration example.

---

## Using with Claude (MCP)

Add the Unfold MCP server to Claude Desktop or Cursor, then ask Claude:

```
"Assess the backend team on RAG skills before we start the knowledge base project.
 Anyone below medium proficiency gets a targeted learning path."

"Show me the cohort health score for spring-2026. Where are engineers dropping off?"

"Three engineers haven't touched their goals in 10 days. Create re-engagement plans."

"What's the completion rate by role? Which track is furthest behind?"
```

See `configs/claude-desktop-config.json` and `configs/cursor-config.json` for setup.

---

## Project structure

```
ai-academy/
├── src/
│   ├── client.ts                         # Unfold API client (all 11 endpoints)
│   ├── types.ts                          # Shared TypeScript types
│   ├── index.ts                          # CLI entry point
│   ├── utils/display.ts                  # ANSI console helpers
│   └── scenarios/
│       ├── 01-assess-and-enroll.ts       # Smart intake: assess → targeted plan
│       ├── 02-batch-onboarding.ts        # 4-role team enrollment (tiers 1 & 2)
│       ├── 03-import-curriculum.ts       # Import your own curriculum (tier 3)
│       ├── 04-cohort-analytics.ts        # KPI dashboard
│       ├── 05-at-risk-intervention.ts    # At-risk detection + help plans
│       ├── 06-full-academy-demo.ts       # Full 5-phase ecosystem demo
│       ├── 07-check-capabilities.ts      # API health check
│       ├── 08-ai-insights.ts             # Intelligence layer (all 5 insight types)
│       └── 09-platform-integration.ts   # "Your portal + Unfold" integration
├── curricula/                            # Importable JSON curriculum files
│   ├── ai-fundamentals.json
│   ├── prompt-engineering.json
│   ├── llm-integration.json
│   └── ai-safety-ethics.json
├── configs/
│   ├── claude-desktop-config.json        # Claude Desktop MCP setup
│   └── cursor-config.json               # Cursor IDE MCP setup
└── docs/SCENARIOS.md                    # Detailed scenario walkthrough
```

---

## The three autonomy tiers

### Tier 1 — Fully autonomous
Agent answers all clarification questions. Zero review needed.
```typescript
await client.createGoal({ ..., auto_respond: true })
// → plan ready, claim link returned
```

### Tier 2 — Semi-auto with human review
Agent suggests answers. Coordinator reviews before plan generates.
```typescript
const pending = await client.createGoal({ ..., auto_respond: false });
// → pending.questions with agent suggestions
await client.submitClarification(pending.goalId, { accept_agent_answers: true });
```

### Tier 3 — Import your own plan
You provide the steps. Unfold enriches with critical path, dependencies, duration, quick wins.
```typescript
await client.importPlan({ title, steps: curriculum.steps, enrich: true })
```

---

## Metadata drives everything

Tag every goal with your org's dimensions. Analytics slice by any tag.

```typescript
metadata: {
  cohort:     "spring-2026",
  track:      "backend",          // backend | frontend | devops | data-ml
  role:       "Backend Engineer",
  project:    "rag-knowledge-base",
  department: "platform",
  manager:    "alex@example.com",
}

// Then query any dimension:
get_analytics({ group_by: "track" })           // completion by role
get_analytics({ group_by: "department" })      // completion by dept
get_analytics({ metadata: { cohort: "spring-2026" } })  // one cohort
```

---

Works with any AI agent that supports MCP — Claude Code, Cursor, Windsurf, and more.

Built with [Unfold](https://unfoldit.com) · [Docs](https://docs.unfoldit.com/mcp) · [API Reference](https://docs.unfoldit.com/api)
