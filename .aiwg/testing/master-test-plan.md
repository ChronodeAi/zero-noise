# Master Test Plan - Zero Noise

**Project**: Zero Noise  
**Version**: 1.0  
**Date**: 2025-10-21  
**Phase**: Construction  
**Owner**: chronode

---

## 1. Test Strategy Overview

### 1.1 Testing Objectives

**Primary Goals**:
1. Ensure **P0 features** work reliably (>95% success rate)
2. Validate **file upload and retrieval** functionality
3. Verify **security** (file validation, malware prevention)
4. Confirm **performance** targets (p95 <5s retrieval, <30s upload)

**Quality Targets**:
- Unit test coverage: >80% for core logic
- Integration test coverage: 100% of API routes
- E2E test coverage: 100% of P0 user flows
- Bug escape rate: <5% (bugs found in production vs. testing)

### 1.2 Testing Approach

**Test Pyramid**:
```
       ┌─────────┐
       │   E2E   │  10% - Critical user flows
       ├─────────┤
       │  Integ  │  20% - API routes, gateway fallback
       ├─────────┤
       │  Unit   │  70% - Component logic, validation
       └─────────┘
```

**Testing Philosophy**:
- **Fast feedback**: Unit tests run on every save (watch mode)
- **Confidence before merge**: All tests pass before PR merge
- **Production-like**: E2E tests use real Filebase API (test bucket)

---

## 2. Test Levels

### 2.1 Unit Testing

**Tool**: Vitest (faster than Jest, Vite-native)

**Scope**: Individual functions, components, utilities

**Coverage Target**: >80% line coverage

**Test Cases**:

#### File Validation Logic
- ✅ MIME type validation (accept whitelist, reject others)
- ✅ File size validation (<100MB pass, >100MB reject)
- ✅ Magic bytes validation (PDF header matches .pdf extension)
- ✅ Multiple file validation (batch processing)

#### Upload Component
- ✅ Drag-and-drop event handling
- ✅ File selection via click
- ✅ Progress indicator updates
- ✅ Error display (invalid file, too large)

#### Utility Functions
- ✅ CID generation/parsing
- ✅ File type detection
- ✅ URL generation (P2P link format)

**Run Command**: `npm run test`

**Configuration**: `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});
```

---

### 2.2 Integration Testing

**Tool**: Vitest + MSW (Mock Service Worker) for API mocking

**Scope**: API routes, third-party integrations (Filebase API)

**Coverage Target**: 100% of API routes

**Test Cases**:

#### `/api/upload` - File Upload Endpoint
- ✅ Valid file upload → Returns CID
- ✅ Invalid MIME type → Returns 400 error
- ✅ File too large → Returns 413 error
- ✅ Filebase API failure → Returns 502 error with retry
- ✅ Magic bytes mismatch → Returns 400 error

#### Filebase IPFS Integration
- ✅ Successful pin → Returns CID in <5s
- ✅ API timeout → Retry logic works
- ✅ Invalid API key → Returns auth error
- ✅ Network failure → Graceful degradation

#### Gateway Fallback
- ✅ Primary gateway success → Fast retrieval
- ✅ Primary gateway failure → Fallback to secondary
- ✅ All gateways fail → Error message shown

**Run Command**: `npm run test:integration`

**Mock Strategy**:
- Use MSW to mock Filebase API responses
- Test both success and failure scenarios
- Validate retry logic and timeout handling

---

### 2.3 End-to-End (E2E) Testing

**Tool**: Playwright (cross-browser, visual regression)

**Scope**: Complete user flows (browser → API → Filebase → retrieval)

**Coverage Target**: 100% of P0 user flows

**Test Cases**:

#### P0 User Flow 1: Upload Single File
1. User opens homepage
2. User drags PDF file into upload zone
3. File is validated (client-side)
4. File uploads to Filebase
5. User sees CID and shareable link
6. User copies link to clipboard

**Expected Result**: ✅ File accessible via P2P link

#### P0 User Flow 2: Upload Multiple Files
1. User selects 5 files (PDF, PNG, JPG, MP4, TXT)
2. All files validate and upload in parallel
3. User sees collection page with all files
4. User shares collection link

**Expected Result**: ✅ Collection page shows all files, all retrievable

#### P0 User Flow 3: Invalid File Rejection
1. User tries to upload .exe file
2. Client-side validation rejects (not in whitelist)
3. Error message displayed

**Expected Result**: ❌ File rejected, clear error message

#### P0 User Flow 4: File Retrieval via Gateway Fallback
1. File uploaded successfully (has CID)
2. Primary gateway simulated failure
3. System falls back to secondary gateway
4. File retrieved successfully

**Expected Result**: ✅ File retrieves despite gateway failure

**Run Command**: `npm run test:e2e`

**Configuration**: `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### 2.4 Performance Testing

**Tool**: k6 (load testing), Lighthouse (frontend performance)

**Scope**: Upload/retrieval latency, concurrent users

**Test Cases**:

#### Upload Performance
- ✅ 1MB file uploads in <2s (p95)
- ✅ 10MB file uploads in <10s (p95)
- ✅ 50MB file uploads in <30s (p95)

**Test Script** (`tests/performance/upload-load.js`):
```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function () {
  let data = {
    file: http.file(open('fixtures/test-1mb.pdf'), 'test.pdf'),
  };
  
  let res = http.post('http://localhost:3000/api/upload', data);
  
  check(res, {
    'upload successful': (r) => r.status === 200,
    'returns CID': (r) => r.json('cid') !== undefined,
    'latency < 5s': (r) => r.timings.duration < 5000,
  });
}
```

**Run Command**: `k6 run tests/performance/upload-load.js`

#### Retrieval Performance
- ✅ Gateway retrieval <2s (p95)
- ✅ Fallback retrieval <5s (p95)

#### Frontend Performance (Lighthouse)
- ✅ Performance score >90
- ✅ First Contentful Paint (FCP) <1.8s
- ✅ Time to Interactive (TTI) <3.8s

**Run Command**: `npm run lighthouse`

---

### 2.5 Security Testing

**Tool**: Manual + OWASP ZAP (automated security scanning)

**Scope**: File validation, XSS prevention, API security

**Test Cases**:

#### File Upload Security
- ✅ Malicious PDF (embedded JS) → Rejected by magic bytes check
- ✅ HTML file with XSS payload → Rejected (not in whitelist)
- ✅ ZIP bomb (compressed 1GB → 10TB) → Rejected by size limit
- ✅ Mismatched extension (.exe renamed to .pdf) → Rejected by magic bytes

#### API Security
- ✅ Missing API key → Returns 401
- ✅ Rate limiting → Blocks after 100 uploads/hour
- ✅ CORS policy → Only allows whitelisted origins

**Run Command**: `npm run test:security`

---

## 3. Test Environment Setup

### 3.1 Local Development
- **URL**: `http://localhost:3000`
- **Filebase**: Test bucket (`zero-noise-test`)
- **Data**: Mock data (fixtures in `tests/fixtures/`)

### 3.2 CI/CD (GitHub Actions)
- **URL**: N/A (headless)
- **Filebase**: Separate test bucket
- **Data**: Generated fixtures

### 3.3 Staging (Vercel Preview)
- **URL**: `https://zero-noise-git-{branch}.vercel.app`
- **Filebase**: Test bucket (shared)
- **Data**: Real user uploads (ephemeral)

### 3.4 Production
- **URL**: `https://zero-noise.vercel.app`
- **Filebase**: Production bucket
- **Data**: Real user uploads

**Environment Variables** (test vs. prod):
```bash
# Test
FILEBASE_IPFS_RPC_KEY="test_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production
FILEBASE_IPFS_RPC_KEY="prod_key"
NEXT_PUBLIC_APP_URL="https://zero-noise.vercel.app"
```

---

## 4. Test Data Management

### 4.1 Test Fixtures

**Location**: `tests/fixtures/`

**Files**:
- `test-1mb.pdf` - Small PDF for fast tests
- `test-10mb.mp4` - Medium video for performance tests
- `test-50mb.zip` - Large file for size limit tests
- `malicious.pdf` - PDF with embedded JavaScript (security test)
- `fake-pdf.exe` - Renamed .exe to test magic bytes validation

**Generation**: `npm run generate-fixtures`

### 4.2 Mock Data

**Filebase API Responses** (MSW mocks):
```typescript
// tests/mocks/filebase.ts
export const handlers = [
  http.post('https://rpc.filebase.io/api/v0/add', () => {
    return HttpResponse.json({
      Name: 'test.pdf',
      Hash: 'QmTest123456789',
      Size: '1234'
    });
  }),
];
```

---

## 5. Test Execution Schedule

### 5.1 Developer Workflow (Local)
- **On save**: Unit tests (watch mode)
- **Before commit**: Unit + integration tests
- **Before push**: All tests (unit + integration + E2E)

### 5.2 CI/CD Pipeline (GitHub Actions)
- **On PR**: Unit + integration + E2E (Chromium only)
- **On merge to main**: Full test suite (all browsers)
- **Nightly**: Performance tests + security scans

### 5.3 Release Testing
- **Before MVP launch**: Full regression suite + manual exploratory testing
- **Post-deployment**: Smoke tests (production)

---

## 6. Defect Management

### 6.1 Bug Severity Levels

| Severity | Definition | Example | Response Time |
|----------|------------|---------|---------------|
| **P0 - Critical** | Service down, data loss | Upload fails 100% | Fix immediately |
| **P1 - High** | Major feature broken | Gateway fallback fails | Fix within 24h |
| **P2 - Medium** | Minor feature issue | UI glitch, slow load | Fix in next sprint |
| **P3 - Low** | Cosmetic issue | Typo, alignment off | Backlog |

### 6.2 Bug Workflow
1. **Report**: Create GitHub Issue with reproduction steps
2. **Triage**: Assign severity (P0-P3) and priority
3. **Fix**: Developer creates PR with fix + test
4. **Verify**: QA validates fix in staging
5. **Close**: Merge to main, deploy to production

### 6.3 Regression Prevention
- **For each bug**: Add test case to prevent recurrence
- **Critical bugs**: Add E2E test for regression
- **Track**: Bug escape rate (bugs in prod vs. caught in testing)

---

## 7. Test Metrics & Reporting

### 7.1 Key Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Unit Test Coverage** | >80% | TBD | ⏳ |
| **Integration Test Coverage** | 100% API routes | TBD | ⏳ |
| **E2E Test Coverage** | 100% P0 flows | TBD | ⏳ |
| **Build Success Rate** | >95% | TBD | ⏳ |
| **Test Execution Time** | <5 min (CI) | TBD | ⏳ |
| **Bug Escape Rate** | <5% | TBD | ⏳ |

### 7.2 Reporting
- **Daily**: CI build status (GitHub Actions)
- **Weekly**: Test coverage report (Codecov)
- **Sprint Review**: Test metrics dashboard (GitHub Issues)

**Coverage Dashboard**: Integrate Codecov for visual test coverage tracking

---

## 8. Tool Stack Summary

| Test Level | Tool | Purpose |
|------------|------|---------|
| **Unit** | Vitest | Component and function testing |
| **Integration** | Vitest + MSW | API route testing with mocks |
| **E2E** | Playwright | Full user flow testing |
| **Performance** | k6 + Lighthouse | Load and frontend performance |
| **Security** | OWASP ZAP | Security vulnerability scanning |
| **Coverage** | Vitest (v8) | Code coverage reporting |
| **CI/CD** | GitHub Actions | Automated test execution |

---

## 9. Next Steps (Iteration 0)

### Immediate Setup
- [ ] Install testing dependencies: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom`
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Create `vitest.config.ts` configuration
- [ ] Create `playwright.config.ts` configuration
- [ ] Add npm scripts to `package.json`:
  - `"test": "vitest"`
  - `"test:ui": "vitest --ui"`
  - `"test:coverage": "vitest --coverage"`
  - `"test:e2e": "playwright test"`

### Sprint 1 Testing
- [ ] Write unit tests for file validation logic
- [ ] Write integration tests for `/api/upload`
- [ ] Write E2E test for upload flow
- [ ] Setup Codecov integration

---

## 10. Sign-off

**Test Plan Status**: **APPROVED** ✅  
**Owner**: chronode  
**Date**: 2025-10-21  
**Next Review**: End of Sprint 1 (2025-11-04)

---

## Appendix A: Test Script Examples

See `tests/` directory for full examples:
- `tests/unit/validation.test.ts` - File validation unit tests
- `tests/integration/api-upload.test.ts` - Upload API integration tests
- `tests/e2e/upload-flow.spec.ts` - Upload E2E test
- `tests/fixtures/` - Test data files
- `tests/mocks/` - MSW API mocks
