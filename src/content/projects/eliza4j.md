---
title: Eliza4J
status: shipped
order: 1
description: Java library for enterprise AI agent integration with BNY Eliza AI Agents and LLMs.
related:
  - post-02
  - post-04
  - post-10
  - post-16
  - post-17
---

## Problem

Enterprise Java teams were bolting LLMs onto existing services without a governed integration path. Each team built its own HTTP clients, prompt assembly, and agent wiring. That worked in demos, but it did not scale across a regulated platform: no shared patterns, weak boundaries around tool execution, and policy living in prompts instead of architecture.

## Constraints

Eliza4J was shaped by enterprise and regulated-industry requirements, not a standalone AI SDK:

- **Spring-first, LangChain4j-aware** — fit existing Java services, deployment models, and team skills.
- **Governed integration** — least privilege, auditable paths, no ad-hoc side doors to models or tools.
- **Production posture** — observability, PII handling, auth, and retry belong in the library, not in each team's prompt.

## Architecture

Eliza4J provides a unified backend that bridges two major Java AI frameworks — Spring AI and LangChain4j — through a single integration point.

<figure class="eliza-arch" aria-label="Eliza4J architecture">
  <div class="eliza-arch-row eliza-arch-row-2">
    <div class="eliza-arch-box">
      <strong>Spring AI Path</strong>
      <span>(Advisors · Tools · MCP)</span>
    </div>
    <div class="eliza-arch-box">
      <strong>LangChain4j Path</strong>
      <span>(Agent executor · AI services)</span>
    </div>
  </div>
  <svg class="eliza-arch-join" viewBox="0 0 200 28" aria-hidden="true">
    <path d="M50 0 V12 H100 V28" />
    <path d="M150 0 V12 H100 V28" />
  </svg>
  <div class="eliza-arch-core">
    <p class="eliza-arch-core-title">Eliza4J</p>
    <div class="eliza-arch-box">
      <strong>Unified Service</strong>
      <span>(Chat · Embeddings · Vision · Speech)</span>
    </div>
    <div class="eliza-arch-arrow" aria-hidden="true"></div>
    <div class="eliza-arch-box">
      <strong>SPI Extensions</strong>
      <span>(Observability · PII Masking)</span>
    </div>
    <div class="eliza-arch-arrow" aria-hidden="true"></div>
    <div class="eliza-arch-box">
      <strong>Infrastructure</strong>
      <span>(Auth · Retry)</span>
    </div>
  </div>
  <div class="eliza-arch-arrow" aria-hidden="true"></div>
  <div class="eliza-arch-row">
    <div class="eliza-arch-box">
      <strong>Eliza AI Agents/LLMs</strong>
    </div>
  </div>
</figure>

A message conversion layer handles bidirectional translation between the two frameworks. Teams can use Spring AI for some features and LangChain4j for others in the same application.

The SPI layer provides pluggable extensions:

- Observability captures the full exchange lifecycle.
- PII masking detects and replaces sensitive data before it reaches the model.

Teams can extend these SPIs to add custom behavior — detectors, handlers, recorders — without modifying framework code.

The library does not replace your orchestration architecture. It gives Java teams one governed place to attach Spring AI or LangChain4j without every service reinventing HTTP, masking, and retry.

## Capabilities

- **Dual-framework model abstraction** — Spring AI (advisors, tools, MCP) and LangChain4j (agent executor, AI services) on the same core.
- **Unified service** — Chat, embeddings, vision, and speech behind one abstraction instead of scattered provider clients.
- **SPI extensions** — Observability and PII masking on the request path before the model.
- **Infrastructure** — Auth and retry as library concerns, not per-service glue.
- **Eliza execution** — a consistent path to Eliza AI Agents and LLMs.

## Design decisions

**Why Java and Spring?** Most of the platform already runs on Java/Spring. A library that fits that stack lets teams adopt agents without a parallel runtime or a rewrite.

**Why SPI extensions instead of prompts for PII and observability?** Masking and observability must run on every call. Putting them in SPI extensions keeps them deterministic and reusable — the same thesis as the AI Firewall and PII gateway writing.

**Why a library, not a sidecar?** Teams needed integration inside existing Java services — shared types, deployment units, and operational models. Auth and retry belong next to those services, not in a parallel process.

**Why not raw model output driving tools?** Tool and agent execution still sit behind this stack. The library is the place to enforce policy, not whatever the model returns on a given turn.

## Outcome

Shipped internally at BNY as a reusable path for Java teams building on Eliza AI Agents and LLMs. Open-source exploration continues around the same enterprise constraints — no fabricated adoption metrics, but a real framework rather than one-off integrations.
