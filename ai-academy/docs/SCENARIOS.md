# AI Academy — Scenario Guide

Each scenario in this project demonstrates one or more Unfold MCP tools working together to power a real-world AI academy use case.

---

## Scenario 1 — Assess & Enroll (`npm run assess-and-enroll`)

**Use case:** Smart intake for a new developer joining the AI Academy.

**Flow:**
1. Query assessment engine capabilities (`get_assessment_capabilities`)
2. Generate a skill benchmark assessment (`generate_skill_assessment`)
3. Developer answers questions in your UI
4. Score their answers — determine proficiency band and gap (`score_skill_assessment`)
5. Use the `suggested_goal_seed` to auto-create a personalized learning path (`create_goal`)
6. Send the claim link to the developer

**Key features demonstrated:**
- Assessment anchored to a real work context (not generic MCQs)
- Signed, tamper-proof assessment tokens
- Auto-enrollment when score is below target
- Goal metadata tags for cohort tracking

---

## Scenario 2 — Batch Cohort Onboarding (`npm run batch-onboard`)

**Use case:** Enroll an entire development team in one operation.

**Flow:**
1. **Tier 1 (4 developers):** `create_goal` with `auto_respond=true` — agent answers all clarification questions, plans generate immediately
2. **Tier 2 (1 senior engineer):** `create_goal` with `auto_respond=false` — returns questions + agent suggestions for coordinator review
3. Coordinator reviews suggestions, then calls `submit_clarification` to trigger plan generation
4. All claim links collected and ready for distribution

**Key features demonstrated:**
- Three autonomy tiers side by side
- Metadata tagging by cohort, track, experience level
- Semi-auto flow: agent suggestions + human review before plan generates
- Batch coordination patterns

---

## Scenario 3 — Import Curated Curriculum (`npm run import-curriculum`)

**Use case:** You own the curriculum structure; Unfold adds the intelligence layer.

**Flow:**
1. Load JSON curriculum files from `curricula/`
2. Call `import_plan` with AI enrichment enabled
3. Unfold returns enriched steps with:
   - Critical path identification
   - Step-to-step dependencies
   - Duration estimates
   - Complexity and severity ratings
   - Quick-win flags

**Key features demonstrated:**
- Tier 3 passthrough import (zero clarification)
- Granular enrichment options (enable/disable per type)
- Substep structure preserved
- One import call per learner (metadata tags differentiate)

---

## Scenario 4 — Cohort Analytics Dashboard (`npm run analytics`)

**Use case:** Operational visibility into your entire AI Academy.

**Queries run:**
1. **Overall health** — total, active, completed, blocked, at-risk
2. **By track** — completion rate per AI track (`group_by: "track"`)
3. **At-risk** — learners inactive 5+ days
4. **By department** — `group_by: "department"`
5. **Time-bounded** — Q1 2026 cohort for quarterly reporting

**Key features demonstrated:**
- All `get_analytics` filter combinations
- Step completion funnel (where learners drop off)
- Dimension-based breakdown with `group_by`
- Date-range filtering for reporting periods

---

## Scenario 5 — At-Risk Intervention (`npm run at-risk`)

**Use case:** Automated daily job that detects and re-engages inactive learners.

**Flow:**
1. `list_goals` with `inactive_days=7` and cohort metadata filter
2. For each at-risk goal: `get_goal_status` to find the stuck step
3. `create_goal` with a focused "getting unstuck" plan targeting their specific blocker
4. Optionally `revoke_claim` and reissue for expired claim links

**Key features demonstrated:**
- `list_goals` for at-risk detection
- `get_goal_status` with step-level details
- `revoke_claim` for claim lifecycle management
- Creating intervention goals with high priority
- Designed to run as a scheduled cron job

---

## Scenario 6 — Full Academy Demo (`npm run full-academy`)

**Use case:** The complete AI Academy lifecycle — all 11 MCP tools in 6 phases.

**Phases:**
1. **Intake** — Assess each developer (`get_assessment_capabilities`, `generate_skill_assessment`, `score_skill_assessment`)
2. **Enroll** — Create personalized AI plans (`create_goal`)
3. **Curriculum** — Import structured track curricula (`import_plan`)
4. **Monitor** — Analytics dashboard (`get_analytics`)
5. **Intervene** — At-risk detection and help goals (`list_goals`, `get_goal_status`, `create_goal`)
6. **Graduate** — Check completion status (`get_goal_status`)

This is the showstopper demo for showing the full platform capability in a single run.

---

## Scenario 7 — Check Capabilities (`npm run check-capabilities`)

**Use case:** Verify your API key works before running any other scenario.

Calls `get_assessment_capabilities` and prints:
- Supported proficiency bands and thresholds
- Question range (min/max)
- Difficulty mix defaults
- Supported languages
- Token TTL

---

## Using with Claude via MCP

Once you've configured Claude Desktop or Cursor (see `configs/`), you can ask Claude natural-language questions that map to these same scenarios:

```
"Set up a learning path for our new ML engineer. She knows Python well but has never built with LLMs."
→ Uses: generate_skill_assessment → score_skill_assessment → create_goal

"How is our spring-2026 cohort doing? Who's at risk?"
→ Uses: get_analytics (with metadata filter + inactive_days)

"Import our internal AI onboarding doc and turn it into a tracked learning goal."
→ Uses: import_plan

"Jordan hasn't touched his AI fundamentals goal in 2 weeks. Create a re-engagement plan."
→ Uses: get_goal_status → create_goal
```
