# Solution Profile

Select a profile to set defaults for gates, controls, and process rigor.

## Profile

- Profile: `MVP` (working product for early adopters, validated concept, baseline quality controls)

## Defaults (can be tailored)

- Security
  - Prototype: basic auth, no PII storage
  - MVP: baseline controls, secrets management, SBOM
  - Production: threat model, SAST/DAST, zero criticals
  - Enterprise: comprehensive SDL, compliance, IR playbooks
- Reliability
  - Prototype: best-effort
  - MVP: p95 targets, basic alerts
  - Production: SLO/SLI, ORR, runbooks
  - Enterprise: error budgets, chaos drills, 24/7 on-call
- Process
  - Prototype: lightweight docs, rapid iteration
  - MVP: briefs/cards, minimal plans
  - Production: full traceability and assessments
  - Enterprise: strict gates and audits

## Overrides

- Notes:
  - **Security**: Enhanced focus on malicious file detection beyond typical MVP (critical for user trust in decentralized context)
  - **Reliability**: IPFS gateway redundancy and pinning replication prioritized (decentralized infrastructure requires resilience)
  - **Process**: Lightweight docs but thorough architecture planning (decentralized systems complex, need clear design)
  - **Skip**: Authentication/accounts, advanced permissions (anonymous sharing for MVP)
  - **Defer**: Mobile apps, real-time collaboration, content moderation (web-first, async sharing model)
