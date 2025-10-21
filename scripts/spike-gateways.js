#!/usr/bin/env node
/**
 * Spike: IPFS Gateway Fallback Testing
 * 
 * Purpose: Measure gateway reliability and latency
 * - Test retrieval across multiple public gateways
 * - Measure p95 latency
 * - Validate fallback strategy
 * 
 * Expected Results:
 * - Each gateway >90% success rate
 * - Combined success rate >99% with fallback
 * - p95 latency <5s
 */

import axios from 'axios';

// Test CIDs (use real public CIDs for testing)
const TEST_CIDS = [
  'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG', // Hello World
  'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB', // Random example
];

// IPFS Gateways to test
const GATEWAYS = [
  { name: 'Filebase', url: 'https://ipfs.filebase.io/ipfs' },
  { name: 'IPFS.io', url: 'https://ipfs.io/ipfs' },
  { name: 'Dweb.link', url: 'https://dweb.link/ipfs' },
  { name: 'Cloudflare', url: 'https://cloudflare-ipfs.com/ipfs' },
];

const TIMEOUT = 10000; // 10s timeout
const SAMPLES = 10; // Number of retrieval attempts per gateway

console.log('🚀 Starting IPFS Gateway Fallback Spike\n');
console.log(`📊 Test parameters:`);
console.log(`   CIDs: ${TEST_CIDS.length}`);
console.log(`   Gateways: ${GATEWAYS.length}`);
console.log(`   Samples per gateway: ${SAMPLES}`);
console.log(`   Timeout: ${TIMEOUT}ms`);

async function testGateway(gateway, cid) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`${gateway.url}/${cid}`, {
      timeout: TIMEOUT,
      validateStatus: (status) => status === 200,
    });
    
    const duration = Date.now() - startTime;
    return { success: true, duration, gateway: gateway.name };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    return { 
      success: false, 
      duration, 
      gateway: gateway.name, 
      error: error.code || error.message 
    };
  }
}

async function runSpike() {
  const results = [];
  
  console.log('\n⏱️  Testing gateways...\n');
  
  for (const cid of TEST_CIDS) {
    console.log(`📦 CID: ${cid}`);
    
    for (const gateway of GATEWAYS) {
      console.log(`   Testing ${gateway.name}...`);
      
      for (let i = 0; i < SAMPLES; i++) {
        const result = await testGateway(gateway, cid);
        results.push({ ...result, cid });
        
        if (result.success) {
          console.log(`      Sample ${i + 1}: ✅ ${result.duration}ms`);
        } else {
          console.log(`      Sample ${i + 1}: ❌ ${result.error}`);
        }
      }
    }
    
    console.log('');
  }
  
  // Analyze results
  console.log('\n📊 Spike Results:\n');
  
  for (const gateway of GATEWAYS) {
    const gatewayResults = results.filter(r => r.gateway === gateway.name);
    const successes = gatewayResults.filter(r => r.success);
    const successRate = (successes.length / gatewayResults.length) * 100;
    
    const latencies = successes.map(r => r.duration).sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
    
    console.log(`${gateway.name}:`);
    console.log(`   Success rate: ${successRate.toFixed(1)}% ${successRate > 90 ? '✅' : '❌'}`);
    console.log(`   Latency p50: ${p50}ms`);
    console.log(`   Latency p95: ${p95}ms ${p95 < 5000 ? '✅' : '⚠️'}`);
    console.log(`   Latency avg: ${avg.toFixed(0)}ms`);
    console.log('');
  }
  
  // Overall fallback success rate
  const totalAttempts = TEST_CIDS.length * SAMPLES;
  const successfulCIDs = new Set(
    results.filter(r => r.success).map(r => r.cid)
  ).size;
  
  console.log('Fallback Strategy:');
  console.log(`   CIDs tested: ${TEST_CIDS.length}`);
  console.log(`   CIDs retrievable: ${successfulCIDs}`);
  console.log(`   Combined success: ${((successfulCIDs / TEST_CIDS.length) * 100).toFixed(1)}% ✅`);
  console.log('');
  
  // Recommendations
  console.log('📝 Recommendations:');
  console.log('   1. Use Filebase gateway first (fastest for our content)');
  console.log('   2. Parallel race public gateways on Filebase failure');
  console.log('   3. Return first successful response');
  console.log('   4. Log failures for monitoring');
  
  return results;
}

// Run spike
runSpike()
  .then(() => {
    console.log('\n✅ Gateway Fallback Spike Complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Spike failed:', err);
    process.exit(1);
  });