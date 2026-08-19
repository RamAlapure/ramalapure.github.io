---
title: "If you don't have evals, you don't have a production agent"
summary: "Without evaluation loops in CI, you have a prototype—not a production agent you can safely operate."
series: 13
date: "2026-03-23"
linkedin: https://www.linkedin.com/posts/ramalapure_ai-agent-eval-activity-7441687034655617024-GSO3
tags: ["AI", "Agents", "Architecture"]
---
We spent the [last 12 posts](/writing/) building a rock-solid, enterprise-grade AI architecture.

Planner. Orchestrator. Validator. Knowledge Layer, etc.

You built it. It runs.

But how do you know it won't break tomorrow?

Traditional software has unit tests.

AI agents need Evals.

**Demo Agent Testing**

Run a prompt.

Read the output.

"Looks good to me." (LGTM)

Works for prototypes.

Disaster for production.

You cannot manually QA a non-deterministic system.

**Production Agent Testing (Evals)**

Production teams treat AI like a CI/CD pipeline. Every change to a prompt, tool, or routing logic must pass an automated evaluation suite before deployment.

We test for:

1. Accuracy — Did it get the right facts from the Knowledge Layer?
2. Format — Did it output clean JSON?
3. Tone/Policy — Did it stay within the Authority Boundary?
4. Latency — Did the Orchestrator take too long to plan?

**The 3 Layers of Agent Evaluations**

1. Deterministic Evals (The Basics)

   Standard code checks.

   - Did the agent call the right API?
   - Is the output exactly 250 words?
   - Does the JSON schema match?

   Fast, cheap, binary.

2. Semantic Evals (The Middle Ground)

   Vector math.

   - Is the meaning of the answer mathematically similar to our "Golden Dataset" of perfect answers?

   Catches hallucinated terminology.

3. LLM-as-a-Judge (The Heavy Lifter)

   Using a stronger, slower model to grade your agent's output based on a strict rubric.

   - "Did the agent politely decline to answer out-of-scope questions?" (Pass/Fail)

   Scales human-level judgment.

**The CI/CD Flow for AI**

Developer tweaks the system prompt

↓

Triggers Eval Pipeline (100 test cases)

↓

Deterministic checks run

↓

LLM-as-a-Judge grades responses

↓

Score drops below 95%? Deployment blocked.

**Key Rule**

If you can't measure it automatically, you can't scale it.

Vibe checks are not a testing strategy.

![Evals are the CI/CD for AI agents](/images/writing/post-13-evals-cicd.png)

```mermaid
flowchart LR
  Dev[Developer push] --> Agent[Agent under test]
  Agent --> Det[Deterministic evals]
  Agent --> Sem[Semantic evals]
  Agent --> Judge[LLM-as-a-Judge]
  Det --> Score[Aggregated score]
  Sem --> Score
  Judge --> Score
  Score -->|over 95 percent| Deploy[Deploy]
  Score -->|under 95 percent| Block[Block and alert]
  Block --> Dev
```
