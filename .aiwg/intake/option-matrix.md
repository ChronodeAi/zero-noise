# Option Matrix (Project Context & Intent)

**Purpose**: Capture what this project IS - its nature, audience, constraints, and intent - to determine appropriate SDLC framework application (templates, commands, agents, rigor levels).

## Instructions

This matrix captures the project's reality and stakeholder intent. It drives decisions about:
- Which **templates** are relevant (skip irrelevant artifacts)
- Which **commands** apply (skip enterprise workflows for personal projects)
- Which **agents** are needed (focused team vs full complement)
- What **process rigor** makes sense (documentation depth, gate formality)

**How to use**:
1. **Describe project reality** - What IS this project (audience, scale, deployment, complexity)?
2. **Capture constraints** - Resources, timeline, regulatory environment, technical context
3. **Understand priorities** - What matters most for success (speed, cost, quality, reliability)?
4. **Document intent** - Why this intake, what decisions need making, what's uncertain?

**Key Principle**: This is **descriptive** (what IS), not **prescriptive** (what should be). Analysis happens in solution-profile.md and project-intake.md.

---

## Step 1: Project Reality

### What IS This Project?

**Project Description** (in natural language):
```
Zero Noise is a decentralized P2P file sharing web application that lets users drag-and-drop
research papers, videos, links, and documents into a shared data repository. Built on IPFS,
Filebase, and other decentralized storage protocols, it provides a "zero noise" interface
for knowledge workers and researchers to create collaborative resource collections without
platform lock-in. Deployed as a web app (Vercel/Netlify), accessible via browser, targeting
10-500 users initially with potential for open source community growth.
```

### Audience & Scale

**Who uses this?** (check all that apply)
- [ ] Just me (personal project)
- [x] Small team (2-10 people, known individuals)
- [x] Department (10-100 people, organization-internal)
- [x] External customers (100-10k users, paying or free)
- [ ] Large scale (10k-100k+ users, public-facing)
- [ ] Other: `_________________`

**Audience Characteristics**:
- Technical sophistication: `[x] Technical` (researchers, developers, tech-savvy knowledge workers comfortable with P2P concepts)
- User risk tolerance: `[x] Experimental OK` (early adopters, decentralized tech inherently experimental)
- Support expectations: `[x] Self-service` (GitHub issues, documentation, community support)

**Usage Scale** (current or projected):
- Active users: `10-50 initially, 500 within 6 months (weekly active users)`
- Request volume: `<10 requests/min initially, async file sharing model (not real-time)`
- Data volume: `100GB initially, 1TB within 6 months (distributed across IPFS network)`
- Geographic distribution: `[x] Global` (decentralized P2P, no geographic boundaries)

### Deployment & Infrastructure

**Expected Deployment Model** (what will this become?):
- [ ] Client-only (desktop app, mobile app, CLI tool, browser extension)
- [ ] Static site (HTML/CSS/JS, no backend, hosted files)
- [ ] Client-server (SPA + API backend, traditional web app with database)
- [ ] Full-stack application (frontend + backend + database + supporting services)
- [ ] Multi-system (multiple services, microservices, service mesh, distributed)
- [x] Distributed application (edge computing, P2P, blockchain, federated)
- [ ] Embedded/IoT (device firmware, embedded systems, hardware integration)
- [x] Hybrid (multiple deployment patterns, e.g., mobile app + cloud backend)
- [ ] Other: `Web frontend + decentralized storage (IPFS/Filebase) + optional indexing service`

**Where does this run?**
- [ ] Local only (laptop, desktop, not deployed)
- [ ] Personal hosting (VPS, shared hosting, home server)
- [x] Cloud platform (AWS, GCP, Azure, Vercel, Netlify, GitHub Pages)
- [ ] On-premise (company servers, data center)
- [x] Hybrid (cloud + on-premise, multi-cloud)
- [x] Edge/CDN (distributed, geographically distributed)
- [ ] Mobile (iOS, Android, native or cross-platform)
- [ ] Desktop (Windows, macOS, Linux executables)
- [x] Browser (extension, PWA, web app)
- [ ] Other: `Frontend on Vercel/Netlify, storage on IPFS (globally distributed), browser-based access`

**Infrastructure Complexity**:
- Deployment type: `[x] Serverless` (Vercel/Netlify edge functions, no traditional servers)
- Data persistence: `[x] Multiple data stores` (IPFS distributed storage, Filebase pinning, optional OrbitDB index)
- External dependencies: `5-7 third-party services` (IPFS gateways, Filebase, Web3.Storage, Arweave, scraping APIs)
- Network topology: `[x] Peer-to-peer` (IPFS P2P, WebRTC for direct connections) + `[x] Hybrid` (CDN for frontend, P2P for data)

### Technical Complexity

**Codebase Characteristics**:
- Size: `[x] 1k-10k LoC` (MVP web app with IPFS integration, frontend + storage layer)
- Languages: `TypeScript (primary), JavaScript (IPFS/web3 libraries)`
- Architecture: `[x] Modular` (frontend components, storage abstraction layer, optional indexing service)
- Team familiarity: `[x] Greenfield (starting fresh)` (new project, learning IPFS/decentralized tech as we go)

**Technical Risk Factors** (check all that apply):
- [x] Performance-sensitive (latency, throughput critical) - IPFS retrieval times, gateway latency
- [x] Security-sensitive (PII, payments, authentication) - malicious file uploads, XSS prevention
- [ ] Data integrity-critical (financial, medical, legal records)
- [ ] High concurrency (many simultaneous users/processes)
- [ ] Complex business logic (many edge cases, domain rules)
- [x] Integration-heavy (many external systems, APIs, protocols) - IPFS, Filebase, Arweave, scraping APIs
- [ ] None (straightforward technical requirements)

---

## Step 2: Constraints & Context

### Resources

**Team**:
- Size: `1 developer (chronode), 0 designers (DIY minimal UI), 0 other roles`
- Experience: `[x] Mid (independent)` (full-stack capable, learning decentralized tech)
- Availability: `[x] Part-time` (hobby project, evenings/weekends)

**Budget**:
- Development: `[x] Zero (volunteer/personal)` (solo hobby project, no paid development)
- Infrastructure: `$0-50/month` `[x] Free tier only` initially (Filebase 5GB free, public IPFS gateways), `[x] Cost-conscious` if scaling
- Timeline: `8-10 weeks to MVP` `[x] Flexible` (no hard deadline, balancing quality and speed)

### Regulatory & Compliance

**Data Sensitivity** (check all that apply):
- [x] Public data only (no privacy concerns) - files uploaded are publicly accessible via IPFS CID
- [ ] User-provided content (email, profile, preferences) - no accounts initially
- [ ] Personally Identifiable Information (PII: name, address, phone)
- [ ] Payment information (credit cards, financial accounts)
- [ ] Protected Health Information (PHI: medical records)
- [ ] Sensitive business data (trade secrets, confidential)
- [x] Other: `User-uploaded files MAY contain sensitive data (user responsibility; decentralized = no content control)`

**Regulatory Requirements** (check all that apply):
- [x] None (no specific regulations) - anonymous sharing MVP, no accounts, public content
- [ ] GDPR (EU users, data privacy) - future consideration if adding user accounts
- [ ] CCPA (California users, data privacy)
- [ ] HIPAA (US healthcare)
- [ ] PCI-DSS (payment card processing)
- [ ] SOX (US financial reporting)
- [ ] FedRAMP (US government cloud)
- [ ] ISO27001 (information security management)
- [ ] SOC2 (service organization controls)
- [ ] Other: `Decentralized = no right-to-deletion (IPFS immutable); clear user disclaimers needed`

**Contractual Obligations** (check all that apply):
- [x] None (no contracts) - open source/free service, no SLAs, best-effort
- [ ] SLA commitments (uptime, response time guarantees)
- [ ] Security requirements (penetration testing, audits)
- [ ] Compliance certifications (SOC2, ISO27001, etc.)
- [ ] Data residency (data must stay in specific regions)
- [ ] Right to audit (customers can audit code/infrastructure)
- [ ] Other: `_________________`

### Technical Context

**Current State** (for existing projects):
- Current stage: `[x] Concept` (project intake phase, defining requirements)
- Test coverage: `[x] None` (greenfield project, tests will be added during development)
- Documentation: `[x] README only` (basic project description exists)
- Deployment automation: `[x] Manual` (no deployment yet; will add CI/CD during Construction phase)

**Technical Debt** (for existing projects):
- Severity: `[x] None (new/clean)` (greenfield project, no existing debt)
- Type: `N/A`
- Priority: `N/A`

---

## Step 3: Priorities & Trade-offs

### What Matters Most?

**Rank these priorities** (1 = most important, 4 = least important):
- `2` Speed to delivery (launch fast, iterate quickly)
- `4` Cost efficiency (minimize time/money spent)
- `1` Quality & security (build it right, avoid issues)
- `3` Reliability & scale (handle growth, stay available)

**Priority Weights** (must sum to 1.0, derived from ranking):

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| **Delivery speed** | `0.35` | Want working MVP within 8-10 weeks to validate concept and attract early adopters; learning IPFS/decentralized tech requires iteration |
| **Cost efficiency** | `0.10` | Solo project, free-tier focused, but willing to spend <$50/mo for quality pinning services; time more valuable than money |
| **Quality/security** | `0.40` | "Zero noise" UX is core value prop; malicious file handling critical for trust; clean architecture needed for decentralized complexity |
| **Reliability/scale** | `0.15` | MVP can tolerate occasional issues; decentralized design inherently resilient; scale important but not immediate concern (<500 users) |
| **TOTAL** | **1.00** | ← Must sum to 1.0 |

### Trade-off Context

**What are you optimizing for?** (in your own words)
```
Optimizing for a clean, intuitive UX ("zero noise" philosophy) that makes decentralized
file sharing feel effortless. Quality matters because P2P/IPFS tech is already complex
under the hood - the interface must hide that complexity. Security is critical for
trust (malicious files, XSS). Speed matters to validate the concept within 8-10 weeks,
but not at the expense of core UX. Cost is low priority - willing to use paid pinning
services if they improve reliability. This is a learning project (IPFS, decentralized
tech) but also aiming for real-world usability, not just a toy demo.
```

**What are you willing to sacrifice?** (be explicit)
```
- Launch without user accounts/authentication (anonymous sharing initially)
- Skip mobile apps for MVP (web-first, responsive design acceptable)
- No real-time collaboration/editing (async file sharing model)
- No content moderation initially (community guidelines, user responsibility)
- Manual deployment initially (add CI/CD in Construction phase)
- Limited file type support at launch (start with PDFs, images, videos; expand later)
- Basic search/filtering (no advanced faceted search, AI-powered discovery)
- Best-effort IPFS gateway reliability (no SLA, fallback to multiple gateways)
- No file versioning/history (immutable IPFS CIDs, new uploads = new links)
```

**What is non-negotiable?** (constraints that override trade-offs)
```
- Zero noise UI - interface must be clean, minimal, no clutter (core brand promise)
- Malicious file detection - basic validation/filtering required before launch (user safety)
- Decentralized storage - must use IPFS + decentralized providers (no AWS S3, no centralized DBs)
- Multiple IPFS gateway fallbacks - single point of failure unacceptable
- Open source from day one - code transparency aligns with decentralized ethos
- No user tracking/analytics beyond basic error logging (privacy-first design)
- Clear disclaimers about public content (IPFS CIDs = publicly accessible, user must understand)
```

---

## Step 4: Intent & Decision Context

### Why This Intake Now?

**What triggered this intake?** (check all that apply)
- [x] Starting new project (need to plan approach)
- [ ] Documenting existing project (never had formal intake)
- [ ] Preparing for scale/growth (need more structure)
- [ ] Compliance requirement (audit, certification, customer demand)
- [ ] Team expansion (onboarding new members, need clarity)
- [ ] Technical pivot (major refactor, platform change)
- [ ] Handoff/transition (new maintainer, acquisition, open-sourcing)
- [ ] Funding/business milestone (investor due diligence, enterprise sales)
- [x] Other: `Learning IPFS/decentralized tech, want structured approach to avoid common pitfalls`

**What decisions need making?** (be specific)
```
- Which IPFS implementation? (js-ipfs vs Helia vs Kubo; browser vs server-side nodes)
- Pinning strategy: Single provider (Filebase) or multi-provider (Filebase + Web3.Storage + Arweave)?
- Architecture: Pure P2P (browser IPFS nodes) vs hybrid (pinning services + gateways)?
- File validation: Client-side only or serverless function + virus scanning API?
- Metadata storage: Pure IPFS (OrbitDB) or lightweight centralized index (PocketBase, SQLite)?
- Frontend framework: React/Next.js (familiar) vs Svelte (cleaner, smaller bundle)?
- Link sharing: IPFS CID direct or custom short URLs (requires index/resolver service)?
- Web scraping: Server-side (edge functions) or client-side (CORS limitations)?
```

**What's uncertain or controversial?** (surface disagreements)
```
- IPFS reliability: Public gateways are notoriously unreliable; paid pinning services mitigate
  but add cost. How much redundancy is needed for MVP? When to invest in own IPFS cluster?
  
- File permanence: IPFS content-addressing = immutable; unpinning = eventual deletion.
  Users may expect "delete" button - how to communicate this? Do we need Arweave for truly
  permanent files, or is Filebase pinning sufficient?
  
- Legal exposure: Decentralized = no control over content. What if illegal files uploaded?
  ToS disclaimers enough, or do we need proactive scanning (expensive, centralized)?
  
- P2P vs hybrid: Pure P2P (browser nodes) is purist but flaky (NAT, mobile Safari issues).
  Hybrid (pinning + gateways) is more reliable but less "decentralized". What's the balance?
  
- Open source timing: Launch as open source immediately or wait until code is polished?
  Early transparency vs avoiding premature criticism.
```

**Success criteria for this intake process**:
```
What would make this intake valuable?

1. Clear architecture decisions on IPFS implementation (browser nodes vs pinning services,
   single vs multi-provider, metadata storage approach)
   
2. Risk mitigation plan for known decentralized challenges (gateway reliability, file
   permanence, legal exposure, NAT traversal)
   
3. Prioritized feature roadmap (which file types first, when to add accounts, search
   improvements, mobile support)
   
4. Framework recommendation (which AIWG templates/agents relevant for solo decentralized
   project, what to skip for MVP)
   
5. Technical spike plan (PoCs to validate IPFS reliability, pinning service comparison,
   malicious file detection options)
   
6. Evolution roadmap (when to revisit architecture as user base grows, triggers for adding
   structure: accounts, moderation, compliance)
```

---

## Step 5: Framework Application

### Relevant SDLC Components

Based on project reality (Step 1) and priorities (Step 3), which framework components are relevant?

**Templates** (check applicable):
- [x] Intake (project-intake, solution-profile, option-matrix) - **Always include**
- [x] Requirements (user-stories, use-cases, NFRs) - Solo project but decentralized tech = complex domain, need clear requirements
- [x] Architecture (SAD, ADRs, API contracts) - Critical: IPFS architecture decisions complex, ADRs for pinning strategy, metadata storage
- [x] Test (test-strategy, test-plan, test-cases) - Quality-critical (UX, security); automated tests for IPFS integration, file validation
- [x] Security (threat-model, security-requirements) - Malicious files, XSS, public content, legal exposure = security-sensitive
- [x] Deployment (deployment-plan, runbook, ORR) - Needed for IPFS gateway fallbacks, pinning service monitoring, edge deployment
- [ ] Governance (decision-log, CCB-minutes, RACI) - Skip: solo developer, no stakeholders, informal decision-making

**Commands** (check applicable):
- [x] Intake commands (intake-wizard, intake-from-codebase, intake-start) - **Always include**
- [x] Flow commands (iteration, discovery, delivery) - Solo but structured: iteration cycles for MVP development
- [ ] Quality gates (security-gate, gate-check, traceability) - Skip for MVP: not regulated, solo developer, informal gates
- [x] Specialized (build-poc, pr-review, troubleshooting-guide) - PoCs critical for IPFS validation; troubleshooting for decentralized debugging

**Agents** (check applicable):
- [x] Core SDLC agents (requirements-analyst, architect, code-reviewer, test-engineer, devops) - Solo project but need structured thinking; agents as thought partners
- [x] Security specialists (security-gatekeeper, security-auditor) - Malicious file handling, XSS prevention, legal exposure = security-critical
- [ ] Operations specialists (incident-responder, reliability-engineer) - Skip for MVP: best-effort monitoring, no SLA, <100 users initially
- [ ] Enterprise specialists (legal-liaison, compliance-validator, privacy-officer) - Skip: no compliance, no contracts, anonymous sharing

**Process Rigor Level**:
- [ ] Minimal (README, lightweight notes, ad-hoc) - Too informal for decentralized complexity
- [x] Moderate (user stories, basic architecture, test plan, runbook) - Right fit: solo but complex tech, quality-critical, structured learning
- [ ] Full (comprehensive docs, traceability, gates) - Over-engineering for MVP, solo developer
- [ ] Enterprise (audit trails, compliance evidence, change control) - Not applicable: no compliance, no contracts

### Rationale for Framework Choices

**Why this subset of framework?**
```
Decentralized P2P file sharing (solo, complex tech, quality-critical) needs moderate rigor:

Include:
- Intake (project-intake, solution-profile, option-matrix) - Understand vision, constraints, trade-offs
- Requirements (user stories, NFRs) - Complex domain (IPFS, P2P, multiple file types), need clarity on MVP scope
- Architecture (SAD, ADRs) - Critical: IPFS implementation decisions, pinning strategy, metadata storage, gateway fallbacks
- Security (threat model, security requirements) - Malicious files, XSS, legal exposure = high stakes
- Test (test strategy, test plan) - Quality-critical UX, automated tests for IPFS integration
- Deployment (runbook) - IPFS gateway fallbacks, pinning service monitoring, troubleshooting decentralized issues

Skip:
- Governance templates - Solo developer, no stakeholders, informal decision-making
- Enterprise templates - No compliance, no contracts, no audit requirements
- Operations specialists - Best-effort MVP, no SLA, <100 users initially

Rationale: Decentralized tech is complex enough to warrant structured planning (architecture,
security, testing), but solo MVP context means lightweight governance and no enterprise overhead.
Agents serve as thought partners for technical decisions (IPFS, security) rather than team
coordination.
```

**What we're skipping and why**:
```
Skipping enterprise/governance templates:
- No regulatory requirements (anonymous sharing, no accounts, public content)
- No team coordination needs (solo developer, no stakeholders to align)
- No compliance obligations (no GDPR right-to-deletion, no SLA commitments)
- No formal change control (GitHub PR workflow sufficient for solo project)

Skipping operations specialists (incident response, reliability engineering):
- MVP/best-effort service (no SLA, <100 users initially)
- Decentralized architecture = self-healing by design (IPFS redundancy)
- Community support model (GitHub issues, no 24/7 on-call)

Will revisit framework components if:
- User base exceeds 500 users → Add operations runbooks, monitoring dashboards
- Add user accounts → Add privacy/compliance templates (GDPR), authentication security
- Team expansion (>2 developers) → Add governance (decision log, code review process)
- Commercial/funded → Add full traceability, roadmap planning, stakeholder communication
- Legal issues emerge → Add legal liaison, content moderation strategy
```

---

## Step 6: Evolution & Adaptation

### Expected Changes

**How might this project evolve?**
- [ ] No planned changes (stable scope and scale)
- [x] User base growth (when: `6-12 months`, trigger: `>500 weekly active users, community traction`)
- [x] Feature expansion (when: `3-6 months`, trigger: `MVP validated, user feedback drives priorities`)
- [x] Team expansion (when: `6-12 months`, trigger: `>1k users, open source contributors, potential funding`)
- [x] Commercial/monetization (when: `12+ months`, trigger: `Sustainable costs, enterprise features demand`)
- [x] Compliance requirements (when: `if user accounts added`, trigger: `GDPR for EU users, authentication = privacy concerns`)
- [ ] Technical pivot (when: `___`, trigger: `___`)

**Adaptation Triggers** (when to revisit framework application):
```
What events would require more structure?

- Add operations runbooks when we exceed 500 weekly active users (monitoring, incident response)
- Add privacy/compliance templates when we add user accounts (GDPR, authentication security)
- Add governance templates when team exceeds 2 developers (decision log, code review formalization)
- Add full traceability when we pursue funding/commercial (investor due diligence, audit trail)
- Add content moderation strategy when legal issues emerge (DMCA, illegal content)
- Add performance optimization when IPFS latency impacts UX (gateway selection, caching strategy)
- Add mobile app planning when web traffic shows >30% mobile users
- Add enterprise features (SSO, SAML) when >5 enterprise customer requests
```

**Planned Framework Evolution**:
- Current (Inception/Elaboration):
  - Intake, requirements (user stories, NFRs), architecture (SAD, ADRs), security (threat model)
  - Test strategy, deployment runbook (IPFS monitoring)
  - Moderate rigor, core SDLC agents + security specialists
  
- 3 months (Construction MVP):
  - Add: Performance baseline, user feedback templates
  - Enhance: Test coverage (integration tests), deployment automation (CI/CD)
  - Same rigor level, add performance-optimizer agent
  
- 6 months (Transition/Early Production):
  - Add: Operations runbooks (incident response), monitoring dashboards
  - Enhance: Security (pen testing if >500 users), compliance prep (if accounts added)
  - Increase rigor if team expands, add operations specialists
  
- 12 months (Production/Growth):
  - Add: Governance (if team >2), privacy/compliance (if accounts), enterprise features (SSO)
  - Enhance: Full traceability (if funded), content moderation (if legal issues)
  - Move toward "Full" rigor if >1k users or commercial, add enterprise specialists if needed

---

## Example: Filled Option Matrix

### Example 1: Personal Portfolio Site

**Project Description**: "Personal portfolio site showcasing design work, 10-20 visitors/month, static HTML/CSS deployed to GitHub Pages, solo project for job applications"

**Audience & Scale**:
- Just me (personal project) ✓
- Non-technical audience (hiring managers)
- <100 monthly visitors
- Single region (US)

**Deployment**: GitHub Pages (free, static)
**Complexity**: <1k LoC, simple static site, greenfield
**Team**: Solo, part-time (evenings/weekends)
**Budget**: $0 (free hosting)

**Priorities** (weights):
- Speed: 0.50 (need portfolio for job search ASAP)
- Cost: 0.30 (no budget, must be free)
- Quality: 0.15 (design matters, but functional is enough)
- Reliability: 0.05 (occasional downtime OK, not business-critical)

**Intent**: "Starting new project, need to ship in 2 weeks for job applications, can iterate on design later"

**Framework Application**:
- Templates: Intake only (skip requirements, architecture, tests, security, deployment)
- Commands: intake-wizard
- Agents: writing-validator (content quality for portfolio descriptions)
- Rigor: Minimal (README, comments in code)

**Rationale**: "Solo portfolio site needs lightweight process. Intake captures vision, but comprehensive docs would be over-engineering. Can always add structure later if site becomes business (e.g., freelance clients)."

### Example 2: Internal Business Application

**Project Description**: "Inventory tracking app for 5 warehouse staff, critical to daily operations, deployed on local server, handles 50k product SKUs, used 8 hours/day by operations team"

**Audience & Scale**:
- Small team (5 known users, same organization)
- Mixed technical sophistication (staff use daily, but not technical)
- Zero tolerance for issues (blocks work if down)
- Business hours support (9-5 email)
- 5 active users, 100-500 transactions/day
- Single location (US warehouse)

**Deployment**: On-premise (local server in warehouse)
**Complexity**: 10k-100k LoC (existing brownfield), Node.js + PostgreSQL, moderate technical debt
**Team**: 2 developers (part-time, 20hrs/week), 1 operations manager (requirements)
**Budget**: $500/month (server maintenance), 6 months to major refactor

**Priorities** (weights):
- Reliability: 0.40 (staff can't work if app is down)
- Quality: 0.30 (data integrity critical for inventory)
- Cost: 0.20 (budget-conscious, but uptime worth investment)
- Speed: 0.10 (stable users, features can wait for quality)

**Regulatory**: None (internal tool, no PII, inventory data only)

**Intent**: "Documenting existing brownfield system to prepare for refactor. App works but has technical debt limiting new features. Need to establish baseline, plan modernization, onboard new developer."

**What's uncertain**: "Should we refactor incrementally or rewrite? Current app is tangled but functional. Team split on approach."

**Framework Application**:
- Templates: Intake, basic requirements (user stories), lightweight architecture (component diagram), test plan (critical paths), runbook (deployment, backup)
- Commands: intake-from-codebase, flow-iteration-dual-track, build-poc (test refactor approaches)
- Agents: code-reviewer, test-engineer, database-optimizer (performance critical)
- Rigor: Moderate (structured docs for 2-person team, but not enterprise-level)

**Rationale**: "Small internal app with established users needs moderate structure. Operations depend on reliability, so tests and runbook are critical. Skip enterprise templates (no compliance, no contracts). Lightweight architecture docs help new developer onboard."

### Example 3: B2B SaaS Platform

**Project Description**: "Project management SaaS for software teams, 500 paying customers (2000+ users), multi-tenant cloud (AWS), $500k ARR, primary revenue source, growing 20% MoM"

**Audience & Scale**:
- External customers (B2B, paying)
- Technical users (software developers, project managers)
- Expects stability (paying customers, SLA commitments)
- SLA: 99.5% uptime, <1hr response for P1 issues
- 2000+ active users, 10k+ requests/min
- Multi-region (US, EU)

**Deployment**: AWS (ECS, RDS, S3), multi-tier, microservices (5 services)
**Complexity**: 100k+ LoC, TypeScript + Python + PostgreSQL, integration-heavy (GitHub, Slack, Jira APIs)
**Team**: 10 developers, 2 DevOps, 1 security, 1 designer, 2 product managers
**Budget**: $50k/month infrastructure, well-funded (Series A), aggressive growth targets

**Priorities** (weights):
- Reliability: 0.35 (SLA commitments, customer trust)
- Quality: 0.30 (paying customers, security critical)
- Speed: 0.20 (competitive market, need features)
- Cost: 0.15 (funded, but cost-conscious for profitability)

**Regulatory**: GDPR (EU customers), SOC2 Type II (enterprise sales requirement)
**Contractual**: SLA (99.5% uptime), annual penetration testing, customer audits

**Intent**: "Preparing for SOC2 audit (enterprise customer requirement), need to formalize SDLC process, demonstrate controls for auditor, establish baseline for scaling team (hiring 5 more engineers)"

**What's uncertain**: "Which framework components are SOC2-relevant? What level of documentation do auditors expect? Can we lightweight some areas while over-investing in audit-critical controls?"

**Framework Application**:
- Templates: Full suite (intake, requirements, architecture, test, security, deployment, governance)
- Commands: All SDLC flows, security-gate, gate-check, traceability
- Agents: Full complement (40+ agents covering all roles)
- Rigor: Full (comprehensive docs, traceability, gates) - but tailored for SOC2

**Rationale**: "Production SaaS with enterprise customers and SOC2 requirement needs comprehensive framework. All templates relevant for audit trail. Focus on security (threat model, pen tests) and governance (change control, incident response). Can lightweight some areas (prototypes skip full process), but core product needs full rigor."

**Tailoring**: "Over-invest in security and governance (SOC2 critical), maintain full traceability (audit requirement), but allow experimental projects (internal tools, spikes) to use lighter process (skip governance for non-customer-facing work)."

---

## Notes for Intake Process

### Interactive Questions (6-8 of 10 allocated here)

The option matrix captures **intent and trade-offs** - the most nuanced, least observable information. Interactive questions should focus on:

**Priority questions (ask 2-3)**:
1. "You ranked {criterion} as highest priority. Can you expand on why? What would failure look like?"
2. "You're willing to sacrifice {aspect}. What's your threshold? At what point would you revisit that trade-off?"
3. "You mentioned {non-negotiable constraint}. What's the consequence if we compromise on that? Is there flexibility?"

**Decision context questions (ask 2-3)**:
4. "What specific decisions are you trying to make with this intake? What's blocking you?"
5. "You mentioned {controversy/disagreement}. What are the different perspectives? What data would resolve it?"
6. "What's the biggest risk you see in this project? How does that influence your priorities?"

**Evolution questions (ask 1-2)**:
7. "How do you expect this project to change in the next 6-12 months? What would trigger more structure?"
8. "If you had 10x the users/budget/team, what would you do differently? What's the growth limiting factor?"

**Framework application questions (ask 1-2)**:
9. "Looking at the templates/commands/agents list, which ones feel like overkill? Which feel essential?"
10. "Where do you want to over-invest relative to typical {project type}? Where can you be lean?"

### Other Files Get 2-4 Questions

**project-intake.md** (1-2 questions max):
- "What problem does this solve? Who benefits?" (if not clear from README/description)
- "What are your success metrics?" (if not documented anywhere)

**solution-profile.md** (1-2 questions max):
- "What are your current pain points?" (technical debt, bottlenecks, operational issues)
- "What do you wish you had invested in earlier?" (for existing projects)

Remaining questions are for **clarifying factual gaps** (tech stack, deployment, team size if not detectable from codebase).

### Principle: Capture Intent, Not Prescribe Solutions

**Good option matrix content** (captures what IS and intent):
- "Personal blog, <100 readers, solo, need to ship in 2 weeks for job search"
- "Team split on microservices vs monolith - CTO wants flexibility, CEO wants simplicity"
- "Willing to skip tests initially to launch fast, but non-negotiable on GDPR compliance"

**Bad option matrix content** (prescriptive analysis):
- "Should use MVP profile because small team and limited budget"
- "Microservices inappropriate for this scale, recommend monolith"
- "Need to add automated tests immediately"

Analysis and recommendations go in **solution-profile.md** and **project-intake.md**, not here.
