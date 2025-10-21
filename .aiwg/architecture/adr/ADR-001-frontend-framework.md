# ADR-001: Frontend Framework Selection

**Status**: Proposed  
**Date**: 2025-10-21  
**Deciders**: chronode  
**Tags**: frontend, framework, ux

---

## Context and Problem Statement

Zero Noise requires a clean, minimal "zero noise" UI with drag-drop file upload. Need to choose frontend framework that balances developer familiarity, bundle size, performance, and community support.

**Key Requirements**:
- Minimal bundle size (aligns with "zero noise" philosophy)
- Fast initial load (<2s)
- TypeScript support
- Drag-drop file upload
- IPFS browser client compatibility (Helia)
- Easy deployment to Vercel/Netlify

---

## Decision Drivers

- **Bundle size**: Smaller = faster load, cleaner UX
- **Developer experience**: Solo developer, want fast iteration
- **Performance**: Client-side IPFS operations, need responsiveness
- **Community/ecosystem**: IPFS examples, drag-drop libraries
- **Learning curve**: Limited time budget (8-10 weeks to MVP)

---

## Considered Options

### Option 1: React + Next.js 14 (App Router)

**Pros**:
- Most familiar (chronode has React experience)
- Largest ecosystem (react-dropzone, excellent IPFS examples)
- Next.js 14 App Router with RSC improves performance
- Vercel-native (seamless deployment)
- Abundant Helia + React examples

**Cons**:
- Larger bundle size (~80KB React + 120KB Next.js base)
- React overhead for simple UI
- Hydration complexity with App Router

**Bundle Size**: ~200KB (gzipped base)

---

### Option 2: SvelteKit

**Pros**:
- Smallest bundle (~20KB Svelte + 50KB SvelteKit)
- Compiles to vanilla JS (no runtime)
- Cleaner syntax, less boilerplate
- Built-in animations, transitions
- "Zero noise" philosophy aligns with Svelte minimalism

**Cons**:
- Less familiar (learning curve)
- Smaller IPFS ecosystem (fewer Helia examples)
- Smaller drag-drop library ecosystem

**Bundle Size**: ~70KB (gzipped base) - **65% smaller than React/Next.js**

---

### Option 3: Vanilla TypeScript + Vite

**Pros**:
- Absolute smallest bundle (~10KB)
- Maximum control, no framework overhead
- Direct Helia integration

**Cons**:
- Reinvent drag-drop, routing, state management
- Slower development (no component reuse)
- Higher maintenance burden for solo developer

**Bundle Size**: ~10KB (but high development cost)

---

## Decision Outcome

**Chosen**: **Option 1: React + Next.js 14 (App Router)**

**Rationale**:
- Developer familiarity outweighs bundle size concerns for MVP
- Rich ecosystem (react-dropzone, Helia examples) accelerates development
- Vercel deployment seamless (critical for 8-10 week timeline)
- Performance acceptable with Next.js 14 optimizations (lazy loading, code splitting)
- Can optimize bundle size post-MVP (tree shaking, dynamic imports)

**Trade-offs Accepted**:
- 65% larger bundle than SvelteKit (200KB vs 70KB gzipped)
- Mitigation: Code splitting, lazy load IPFS client, CDN caching

---

## Consequences

**Positive**:
- Fast development velocity (familiar tools)
- Abundant resources (Stack Overflow, Helia + React examples)
- Vercel free tier perfect for MVP hosting

**Negative**:
- Bundle size conflicts with "zero noise" philosophy (but acceptable for MVP)
- React ecosystem bloat (need discipline to avoid unnecessary dependencies)

**Mitigations**:
- Use Next.js dynamic imports: `const Helia = dynamic(() => import('helia'), { ssr: false })`
- Lazy load file validation libraries
- Minimize dependencies (only essential packages)
- Bundle analysis via `next bundle-analyzer`

---

## Revisit Criteria

**Reconsider SvelteKit if**:
- Post-MVP performance profiling shows bundle size impacting UX
- User feedback: "app feels heavy" or "slow to load"
- Learning Svelte becomes feasible (post-MVP, more time available)

---

## Related Decisions

- ADR-002: Multi-Provider IPFS Pinning Strategy
- ADR-005: Browser vs Server-Side IPFS (TBD in Elaboration)
