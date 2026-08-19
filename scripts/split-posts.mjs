import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const candidates = [
  path.join(root, 'content-source', 'linkedin-post.md'),
  path.join(root, '..', 'ai-projects', 'linkedin-post.md'),
];
const source = candidates.find((p) => fs.existsSync(p));
const outDir = path.join(root, 'src', 'content', 'writing');

if (!source) {
  console.warn('linkedin-post.md not found in content-source/ or ../ai-projects/');
  process.exit(0);
}

const text = fs.readFileSync(source, 'utf8').replace(/\r\n/g, '\n');
const sections = text.split(/\n---\n/).slice(1); // skip intro

const dateMap = {
  1: '2026-02-17',
  2: '2026-02-19',
  3: '2026-02-22',
  4: '2026-02-24',
  5: '2026-02-26',
  6: '2026-02-28',
  7: '2026-03-03',
  8: '2026-03-06',
  9: '2026-03-08',
  10: '2026-03-13',
  11: '2026-03-17',
  12: '2026-03-21',
  13: '2026-03-23',
  14: '2026-03-25',
  15: '2026-04-04',
  16: '2026-04-18',
  17: '2026-07-29',
};

const linkedinMap = {
  1: 'https://www.linkedin.com/posts/ramalapure_most-ai-demos-work-most-ai-systems-fail-activity-7429368552131809281-0vb3',
  2: 'https://www.linkedin.com/posts/ramalapure_a-recurring-pattern-ive-seen-when-ai-agents-activity-7430268073825341440-dcGJ',
  3: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7431381232552316928-Ax_Y',
  4: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7432051775983194112-ZuHC',
  5: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7432828371211841536-dc9h',
  6: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7433516104494424064-3cdt',
  7: 'https://www.linkedin.com/posts/ramalapure_ai-agent-resilience-activity-7434506374165815296-QmEF',
  8: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7435520123098189825-Reyr',
  9: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7436342711500300288-iqox',
  10: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7438110584300158976-R7rW',
  11: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7439545533654007808-oioB',
  12: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7441012428265537536-XHii',
  13: 'https://www.linkedin.com/posts/ramalapure_ai-agent-eval-activity-7441687034655617024-GSO3',
  14: 'https://www.linkedin.com/posts/ramalapure_ai-agent-activity-7442414033821016064-IVAe',
  15: 'https://www.linkedin.com/posts/ramalapure_ai-agent-aiarchitecture-activity-7446090916664123393-UN0u',
  16: 'https://www.linkedin.com/posts/ramalapure_ai-agent-aiarchitecture-activity-7451149596275335168-hgfk',
  17: 'https://www.linkedin.com/posts/ramalapure_ai-aiagents-aiarchitecture-activity-7488080411840118784-MCQJ',
};

const summaryMap = {
  1: 'Why production AI in regulated industries needs determinism, observability, and governance beyond what demos require.',
  2: 'Tool invocation must be validated and decoupled from raw LLM output before anything executes.',
  3: 'Production validators are layered decision engines—not a single boolean gate at the end.',
  4: 'Multi-step agents need coordination, state, and failure handling like distributed systems—not smarter prompts.',
  5: 'Production agent failures often stem from poor observability across orchestrated steps, not just bad execution.',
  6: 'Agent reliability requires idempotent, replay-safe execution—not blind retries on multi-step workflows.',
  7: 'Multi-step agents need compensating actions and rollback when retries cannot restore consistent state.',
  8: 'Most enterprise agents lack true autonomy—goal ownership, constraint negotiation, and persistence are rarely satisfied.',
  9: 'Production risk concentrates in the planner—validate whether a plan is safe to execute, not just final outputs.',
  10: 'Agents need explicit authority boundaries and permission scopes before planned actions run.',
  11: 'Ten architecture lessons from building planner–orchestrator–validator agents for production environments.',
  12: 'Production agents need a structured knowledge layer—not prompt-only context—for grounded reasoning.',
  13: 'Without evaluation loops in CI, you have a prototype—not a production agent you can safely operate.',
  14: 'Enterprise scale needs specialized agents and routing—not one omniscient God Agent.',
  15: 'High-impact multi-agent decisions need an explicit Human Gateway for approval before execution.',
  16: 'Security must be a decoupled AI Firewall—not a system prompt asking the model to behave.',
  17: 'Agentic workflows need bidirectional PII masking through a continuous protection gateway, not one-time front-door filtering.',
};

fs.mkdirSync(outDir, { recursive: true });

for (const section of sections) {
  const headerMatch = section.match(/^## Post #(\d+) — (.+)$/m);
  if (!headerMatch) continue;

  const num = Number(headerMatch[1]);
  const title = headerMatch[2].trim();
  const slug = `post-${String(num).padStart(2, '0')}`;

  const headerLine = section.match(/^## Post #\d+ — .+$/m)?.[0];
  let body = headerLine ? section.replace(headerLine, '').trim() : section.trim();

  // Extract inline metadata lines at top of body
  let date = dateMap[num];
  let linkedin = linkedinMap[num];
  const dateLine = body.match(/^- Date: (.+)$/m);
  if (dateLine) {
    date = dateLine[1].trim();
    body = body.replace(/^- Date: .+\n?/, '');
  }
  const linkedinLine = body.match(/^- LinkedIn: <(.+)>$/m);
  if (linkedinLine) {
    linkedin = linkedinLine[1].trim();
    body = body.replace(/^- LinkedIn: <.+>\n?/, '');
  }

  body = body.trim();

  body = body.replace(
    /!\[([^\]]*)\]\(assets\/(post-\d+[^)]+\.png)\)/g,
    '![$1](/images/writing/$2)',
  );

  body = body.replace(/^(?:#[A-Za-z][\w]*\s*)+$/gm, '').replace(/\n{3,}/g, '\n\n');

  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `summary: "${summaryMap[num].replace(/"/g, '\\"')}"`,
    `series: ${num}`,
    date ? `date: "${date}"` : null,
    linkedin ? `linkedin: ${linkedin}` : null,
    'tags: ["AI", "Agents", "Architecture"]',
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  fs.writeFileSync(path.join(outDir, `${slug}.md`), `${frontmatter}\n${body}\n`, 'utf8');
  console.log(`Wrote ${slug}.md`);
}
