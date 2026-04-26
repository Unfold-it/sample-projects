// Mock work items for the AI Academy learner showcase.
// These simulate tasks assigned to engineers in a Zapcom-style AI Academy.

export type ProficiencyBand = 'beginner' | 'low' | 'medium' | 'high';
export type WorkItemStatus = 'todo' | 'in_progress' | 'blocked';
export type Priority = 'high' | 'medium' | 'low';

export interface SkillRequirement {
  id: string;
  skill: string;
  targetProficiency: ProficiencyBand;
  description: string;
  facts: string[];
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  priority: Priority;
  track: string;
  techStack: string[];
  skills: SkillRequirement[];
  status: WorkItemStatus;
  dueIn?: string;
}

export const WORK_ITEMS: WorkItem[] = [
  {
    id: 'wi-001',
    title: 'Build RAG-Powered Knowledge Assistant',
    description:
      'Implement a retrieval-augmented generation system that answers questions from the internal engineering handbook. The assistant must return citations, stay within a 2-second p95 latency budget, and fall back gracefully when context is insufficient.',
    tags: ['GenAI', 'Backend', 'Python', 'Q2-Priority'],
    priority: 'high',
    track: 'backend',
    techStack: ['Python', 'FastAPI', 'Anthropic Claude', 'Pinecone'],
    status: 'todo',
    dueIn: '2 weeks',
    skills: [
      {
        id: 'sk-rag',
        skill: 'RAG & Retrieval',
        targetProficiency: 'medium',
        description: 'Design and implement chunking, embedding, and re-ranking pipelines for high-quality retrieval.',
        facts: [
          'Uses Pinecone for vector storage',
          'Chunk size: 512 tokens with 64-token overlap',
          'Re-ranker: cross-encoder for top-10 candidates',
        ],
      },
      {
        id: 'sk-llm-api',
        skill: 'LLM API Integration',
        targetProficiency: 'medium',
        description: 'Call the Anthropic Messages API with structured system prompts, handle streaming, and manage token budgets.',
        facts: [
          'Model: claude-sonnet-4-6 (balanced cost/quality)',
          'Max context: 8k tokens per request',
          'Tool use required for citation extraction',
        ],
      },
      {
        id: 'sk-py',
        skill: 'Python',
        targetProficiency: 'low',
        description: 'Write async Python services, use pydantic for data validation, and write unit + integration tests.',
        facts: [
          'Python 3.12, asyncio throughout',
          'FastAPI for the HTTP layer',
          'pytest + httpx for testing',
        ],
      },
    ],
  },
  {
    id: 'wi-002',
    title: 'Add AI Code Review to CI Pipeline',
    description:
      'Integrate an LLM-based code reviewer that runs on every pull request. It should flag security issues, logic errors, and style violations. Reviews must complete in under 60 seconds and cost less than $0.05 per PR.',
    tags: ['DevOps', 'Automation', 'GenAI'],
    priority: 'medium',
    track: 'devops',
    techStack: ['Python', 'GitHub Actions', 'Anthropic Claude', 'Docker'],
    status: 'in_progress',
    dueIn: '1 week',
    skills: [
      {
        id: 'sk-llm-api-2',
        skill: 'LLM API Integration',
        targetProficiency: 'low',
        description: 'Send structured diffs to the Claude API, parse structured JSON feedback, and handle rate limits gracefully.',
        facts: [
          'Model: claude-haiku-4-5 (cost-optimized)',
          'Budget: <$0.05 per review',
          'Output: structured JSON with severity + line refs',
        ],
      },
      {
        id: 'sk-infra',
        skill: 'LLM Infrastructure',
        targetProficiency: 'low',
        description: 'Package the reviewer as a Docker container, configure GitHub Actions triggers, and manage secrets safely.',
        facts: [
          'Runs as a GitHub Actions job step',
          'API key stored in GitHub Secrets',
          'Container: python:3.12-slim, <200MB image',
        ],
      },
    ],
  },
  {
    id: 'wi-003',
    title: 'Streaming Chat Interface Component',
    description:
      'Build a React component library for AI chat interfaces. Must support streaming token-by-token responses, show thinking indicators, handle errors gracefully, and be accessible at WCAG AA. Component goes into the shared design system.',
    tags: ['Frontend', 'React', 'UX', 'Design System'],
    priority: 'high',
    track: 'frontend',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Server-Sent Events'],
    status: 'todo',
    dueIn: '10 days',
    skills: [
      {
        id: 'sk-ai-ux',
        skill: 'AI UX & Streaming Interfaces',
        targetProficiency: 'medium',
        description: 'Handle SSE streaming, build incremental render patterns, design loading states, and implement abort/retry UX.',
        facts: [
          'Uses EventSource API for SSE',
          'Tokens render at ~30ms intervals',
          'Must support abort mid-stream',
        ],
      },
      {
        id: 'sk-react',
        skill: 'React & TypeScript',
        targetProficiency: 'medium',
        description: 'Build composable, typed React components with proper ref forwarding, hooks, and Storybook stories.',
        facts: [
          'React 19, strict mode enabled',
          'Tailwind CSS for styling',
          'Storybook required for each new component',
        ],
      },
    ],
  },
  {
    id: 'wi-004',
    title: 'Production Model Deployment (7B Classifier)',
    description:
      'Deploy a fine-tuned 7B parameter intent-classification model to production on AWS. SLA: 99.9% uptime, p95 latency < 100ms. The model runs behind an autoscaling API gateway shared by three product teams.',
    tags: ['MLOps', 'Cloud', 'Infrastructure'],
    priority: 'high',
    track: 'data-ml',
    techStack: ['Python', 'Docker', 'Kubernetes', 'AWS SageMaker', 'Terraform'],
    status: 'blocked',
    dueIn: '3 weeks',
    skills: [
      {
        id: 'sk-infra-2',
        skill: 'LLM Infrastructure',
        targetProficiency: 'medium',
        description: 'Containerize the model with optimized inference settings, configure autoscaling, and set up health checks and canary deployments.',
        facts: [
          'Model: 7B params, quantized to int8',
          'Hardware: AWS g5.2xlarge (A10G GPU)',
          'Autoscaling: target 70% GPU utilization',
        ],
      },
      {
        id: 'sk-py-adv',
        skill: 'Python',
        targetProficiency: 'high',
        description: 'Write high-performance inference code, profile bottlenecks, implement batching, and write load tests.',
        facts: [
          'Inference framework: vLLM or TorchServe',
          'Target throughput: 50 req/s per instance',
          'Load testing: Locust + custom LLM scenarios',
        ],
      },
    ],
  },
  {
    id: 'wi-005',
    title: 'Content Safety Filter — Phase 1',
    description:
      'Build a real-time content moderation filter that screens user-generated content for PII, prompt injection, and hate speech before it reaches any LLM. Must add less than 5ms to the request path and have zero false negatives on the PII category.',
    tags: ['Safety', 'Backend', 'Security', 'GenAI'],
    priority: 'medium',
    track: 'backend',
    techStack: ['Python', 'FastAPI', 'Anthropic Claude', 'Redis'],
    status: 'todo',
    dueIn: '2 weeks',
    skills: [
      {
        id: 'sk-llm-safety',
        skill: 'LLM API Integration',
        targetProficiency: 'medium',
        description: 'Use Claude as a fast classifier for complex policy violations; combine with regex/rule-based layers for PII.',
        facts: [
          'Hybrid approach: rules for PII, LLM for nuanced violations',
          'Model: claude-haiku-4-5 for <5ms budget',
          'Response cache: Redis, 1h TTL for repeated patterns',
        ],
      },
      {
        id: 'sk-prompt-eng',
        skill: 'Prompt Engineering',
        targetProficiency: 'medium',
        description: 'Design reliable classification prompts that are resistant to adversarial inputs and return structured verdicts.',
        facts: [
          'Output format: {verdict, category, confidence}',
          'Must handle multi-language inputs',
          'Tested against red-team prompt injection suite',
        ],
      },
    ],
  },
];

export const LEARNER_PROFILE = {
  name: 'Alex Tran',
  role: 'Backend Engineer',
  track: 'backend',
  cohort: 'spring-2026',
  email: 'alex.t@zapcom.ai',
  avatarInitial: 'A',
};

export const PROFICIENCY_LABELS: Record<ProficiencyBand, string> = {
  beginner: 'Beginner',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PROFICIENCY_COLORS: Record<ProficiencyBand, string> = {
  beginner: 'text-slate-400 bg-slate-900/60 border-slate-700/60',
  low: 'text-amber-400 bg-amber-950/50 border-amber-800/50',
  medium: 'text-violet-400 bg-violet-950/50 border-violet-800/50',
  high: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'text-red-400 bg-red-950/50 border-red-800/50',
  medium: 'text-amber-400 bg-amber-950/50 border-amber-800/50',
  low: 'text-slate-400 bg-slate-900/60 border-slate-700/60',
};

export const STATUS_COLORS: Record<string, string> = {
  todo: 'text-slate-400 bg-slate-900/60 border-slate-700/60',
  in_progress: 'text-violet-400 bg-violet-950/50 border-violet-800/50',
  blocked: 'text-red-400 bg-red-950/50 border-red-800/50',
};

export const TRACK_COLORS: Record<string, string> = {
  backend: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50',
  frontend: 'text-violet-400 bg-violet-950/50 border-violet-800/50',
  devops: 'text-orange-400 bg-orange-950/50 border-orange-800/50',
  'data-ml': 'text-cyan-400 bg-cyan-950/50 border-cyan-800/50',
};
