# Zero Noise - Business Case

**Project**: Zero Noise  
**Date**: 2025-10-21  
**Version**: 1.0 (Inception Baseline)  
**Owner**: chronode  
**Approval Status**: APPROVED (solo project, self-funded)

---

## Executive Summary

Zero Noise is a decentralized P2P file sharing platform targeting researchers and knowledge workers who value privacy, permanence, and platform independence. Built on IPFS with a "zero noise" minimal UX, it addresses the gap between centralized file sharing (Dropbox, Google Drive) and existing decentralized solutions with poor usability.

**Investment**: $0-50/mo for MVP (8-10 weeks), primarily volunteer development time  
**Expected Outcome**: Validated product-market fit with 10-50 early adopters, technical proof-of-concept for IPFS reliability, foundation for potential open source community  
**Decision**: **GO** to Elaboration Phase

---

## Business Need

### Problem Statement

Current file sharing solutions force users into false trade-offs:
- **Centralized platforms** (Dropbox, Google Drive): convenient but create vendor lock-in, single points of failure, and privacy concerns
- **Decentralized solutions** (raw IPFS, Sia): technically sound but steep learning curves, poor UX, no unified interface for mixed media

**Target Pain Point**: Researchers need a *frictionless* way to share diverse content (papers + videos + links) with *permanent availability* and *no platform control*.

### Opportunity

- **Market Gap**: No decentralized file sharing with consumer-grade UX
- **IPFS Momentum**: Growing ecosystem (Protocol Labs funding, Web3 adoption)
- **Privacy Awareness**: Increasing demand for decentralized alternatives (post-Cambridge Analytica)
- **Research Community**: Underserved by existing tools (institutional barriers, link rot, attachment limits)

---

## Success Criteria

### MVP Validation (8-10 weeks)

**Quantitative Metrics**:
- **User Adoption**: 10-50 weekly active users (researchers, students)
- **Technical Performance**: >95% upload success, p95 <5s retrieval, zero data loss
- **Engagement**: >50% of users share 2+ collections
- **File Type Coverage**: 10+ supported formats (PDFs, images, video, audio, links)

**Qualitative Metrics**:
- **User Feedback**: >70% rate "easy to use" in interviews
- **Product-Market Fit**: Users prefer Zero Noise over Dropbox for specific use cases (permanent sharing, privacy-conscious)
- **Community Interest**: >20 GitHub stars, 3+ contributors expressing interest

### Post-MVP Goals (6-12 months)

- 500 weekly active users
- Open source community (5+ contributors)
- Grants or donations covering infrastructure costs
- Potential commercial model (enterprise features, premium pinning)

---

## Cost Estimate (ROM ±50%)

### Development Costs (MVP: 8-10 weeks)

**Volunteer Time** (solo developer, part-time):
- **Hours**: 15-20 hrs/week × 10 weeks = 150-200 hours
- **Opportunity Cost**: $0 (hobby project, learning investment)
- **Market Rate Equivalent**: $75/hr × 175 hrs = **~$13,125 value** (not cash outlay)

**Key Assumptions**:
- Leveraging existing IPFS libraries (Helia, Filebase SDK)
- React/Next.js familiarity (no framework learning curve)
- Minimal design (Tailwind CSS, simple UI)

### Infrastructure Costs (MVP: 3 months)

| Service | Purpose | MVP Cost | Scaling Cost (500 users) |
|---------|---------|----------|--------------------------|
| Filebase | IPFS pinning (primary) | $0 (5GB free) | $25/mo (100GB) |
| Web3.Storage | IPFS pinning (secondary) | $0 (free tier) | $0 (still free) |
| Vercel/Netlify | Frontend hosting, CDN | $0 (hobby tier) | $20/mo (Pro) |
| Uptime Robot | Gateway monitoring | $0 (50 monitors) | $0 (still free) |
| Sentry | Error tracking | $0 (5k events/mo) | $26/mo (paid tier) |
| Domain | zeronoise.app | $10/yr | $10/yr |
| **Total** | | **$2.50/mo** | **$71/mo** |

**Contingency**: $50/mo budget cap for MVP (ample headroom)

### Post-MVP Costs (6-12 months)

| Scenario | Users | Storage | Monthly Cost |
|----------|-------|---------|--------------|
| Low Growth | 100 users | 200GB | $35/mo |
| Medium Growth | 500 users | 1TB | $120/mo |
| High Growth | 1000 users | 2TB | $250/mo |

**Funding Sources** (if scaling):
- IPFS ecosystem grants (Protocol Labs, Filecoin Foundation)
- Community donations (Open Collective, GitHub Sponsors)
- Commercial features (enterprise SSO, private sharing, dedicated support)

---

## Benefits and ROI

### Quantitative Benefits (MVP)

**Technical Validation**:
- **IPFS Reliability Proof**: Validate multi-gateway fallback reduces failure rate from 20% → <5%
- **Multi-Provider Pinning**: Demonstrate redundancy eliminates single point of failure
- **Performance Baseline**: Establish p95 <5s retrieval is achievable with hybrid architecture

**Learning Investment**:
- **IPFS Expertise**: Deep understanding of decentralized storage (valuable for future projects)
- **Full-Stack Decentralized App**: Experience building on Web3 infrastructure
- **Open Source Leadership**: Portfolio project demonstrating technical execution

### Qualitative Benefits

**Community Impact**:
- **Research Community**: Enable frictionless sharing for academics (underserved niche)
- **Privacy Advocacy**: Real-world alternative to centralized platforms
- **IPFS Ecosystem**: Contribute usable UX patterns to decentralized web

**Personal Goals**:
- **Technical Challenge**: Learn cutting-edge decentralized tech
- **Portfolio Project**: Showcase full-stack + infrastructure skills
- **Open Source Contribution**: Build in public, contribute to ecosystem

### ROI Calculation (Informal)

**Investment**:
- Cash: $0-50/mo for 3 months = **$150 max**
- Time: 150-200 hours volunteer (opportunity cost: **$13,125 value**)

**Returns** (MVP validation):
- **Technical Proof**: IPFS reliability patterns validated → reusable for future projects
- **User Validation**: Product-market fit proven → foundation for scaling or pivoting
- **Portfolio Value**: Demonstrable full-stack + Web3 project → career opportunities
- **Community**: Open source contributors → multiplier on solo effort

**Break-Even**: Validation of IPFS architecture alone justifies time investment (learning goal achieved). Any user traction or community is upside.

---

## Alternatives Considered

### Option 1: Do Nothing
- **Pros**: No investment, no risk
- **Cons**: Problem persists, no learning, missed opportunity in growing IPFS ecosystem
- **Rejected**: Opportunity cost of not learning decentralized tech outweighs modest investment

### Option 2: Use Existing Decentralized Tools (IPFS Desktop, Fleek)
- **Pros**: No development needed
- **Cons**: Poor UX (target users won't adopt), no unified multi-media interface, misses "zero noise" philosophy
- **Rejected**: Existing tools fail to address core UX problem

### Option 3: Build on Centralized Infrastructure (S3 + CloudFront)
- **Pros**: Easier, faster, more reliable
- **Cons**: Defeats decentralization goal, vendor lock-in, not aligned with target users' values
- **Rejected**: Misses core value proposition (decentralization, permanence, privacy)

### Option 4: Commercial Ambitions (Raise VC, Build Team)
- **Pros**: Faster execution, marketing budget, scalability
- **Cons**: Pressure to monetize, lose control, "zero noise" philosophy compromised by growth metrics
- **Rejected**: MVP-first approach de-risks before seeking funding; solo allows creative control

---

## Funding Request

### Inception → Elaboration (Next 2-4 weeks)

**Budget**: $0 (no funding needed)  
**Deliverables**:
- Detailed requirements (user stories, NFRs)
- Architecture baseline (detailed SAD, API specs)
- Security threat model
- Technical spikes (IPFS PoC, gateway testing)
- Test strategy

### Elaboration → Construction (Weeks 3-10)

**Budget**: $50/mo maximum  
**Deliverables**:
- Working MVP with drag-drop upload, P2P link sharing
- 10+ file types supported
- Multi-gateway fallback implemented
- Automated tests
- Deployed to Vercel

**Approval**: Self-approved (solo project, hobby budget)

---

## Risks and Mitigations

**See**: `.aiwg/risks/risk-list.md` for comprehensive risk analysis

**Top 3 Risks**:
1. **IPFS Gateway Unreliability**: Mitigated by multi-gateway fallback (ADR-003)
2. **Malicious File Uploads**: Mitigated by validation pipeline + virus scanning
3. **Legal Liability**: Mitigated by ToS disclaimers + DMCA process

**Acceptable Risk**: MVP-scale budget allows experimentation; if validation fails, modest loss (<$200 total)

---

## Decision Recommendation

**Recommendation**: **GO to Elaboration Phase**

**Rationale**:
- Low financial risk ($0-50/mo)
- High learning value (IPFS, decentralized architecture)
- Clear validation criteria (10-50 users, >70% "easy to use" feedback)
- Aligned with target users' needs (researchers, privacy-conscious)
- Feasible timeline (8-10 weeks part-time)

**Approval**: chronode (Owner) - **APPROVED**  
**Date**: 2025-10-21

---

## Next Steps

1. **Proceed to Elaboration**: Detailed requirements, architecture baseline, technical spikes
2. **User Interviews**: Talk to 5-10 researchers to validate problem/solution
3. **Technical Spike**: Build IPFS upload PoC (validate Filebase API, gateway reliability)
4. **Test Strategy**: Define testing approach (unit, integration, E2E)
5. **Schedule Construction Kickoff**: Target start date: Week 3

---

## Appendix: Option Matrix

**See**: `.aiwg/planning/option-matrix.md` (already completed in intake)

**Summary**:
- **Build Custom** (Zero Noise): $0-50/mo, 8-10 weeks, full control, aligned with decentralization goal → **SELECTED**
- **Use Existing Tools** (IPFS Desktop): $0, 0 weeks, poor UX, doesn't solve problem → **REJECTED**
- **Centralized Solution** (S3 + CloudFront): $10-50/mo, 4 weeks, easier but defeats purpose → **REJECTED**
- **Do Nothing**: $0, 0 weeks, problem persists, no learning → **REJECTED**
