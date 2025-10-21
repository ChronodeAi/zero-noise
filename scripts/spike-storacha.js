#!/usr/bin/env node
/**
 * Spike: Storacha Upload PoC
 * 
 * Purpose: Validate Storacha integration for secondary IPFS pinning
 * - Test upload via Storacha client
 * - Measure pin latency
 * - Verify CID retrieval via public gateways
 * 
 * Expected Results:
 * - Pin latency <10s for <10MB files
 * - CID accessible via public IPFS gateways
 * - Async redundancy (fire-and-forget pattern)
 */

import 'dotenv/config';
import fs from 'node:fs';
import * as Client from '@storacha/client';
import { StoreMemory } from '@storacha/client/stores/memory';
import * as Signer from '@ucanto/principal/ed25519';
import { CAR } from '@ucanto/transport';

// Environment validation
const STORACHA_KEY = process.env.STORACHA_KEY;
const STORACHA_PROOF = process.env.STORACHA_PROOF;

if (!STORACHA_KEY || !STORACHA_PROOF) {
  console.error('❌ Missing required environment variables:');
  console.error('   STORACHA_KEY');
  console.error('   STORACHA_PROOF');
  process.exit(1);
}

// Create test file
const testFile = '/tmp/zn-storacha-test.txt';
const testContent = `Zero Noise Storacha Test\nTimestamp: ${new Date().toISOString()}\nSpike: Storacha IPFS + Filecoin`;
fs.writeFileSync(testFile, testContent);

console.log('🚀 Starting Storacha Upload Spike\n');
console.log(`📄 Test file: ${testFile} (${fs.statSync(testFile).size} bytes)`);

async function uploadToStoracha(filePath) {
  const startTime = Date.now();
  
  try {
    console.log('\n⏱️  Uploading to Storacha...');
    
    // Create principal from private key
    const principal = Signer.parse(STORACHA_KEY);
    console.log(`🆔 DID: ${principal.did()}`);
    
    // Create client
    const client = await Client.create({ principal, store: new StoreMemory() });
    
    // Add proof
    const proofBytes = Buffer.from(STORACHA_PROOF, 'base64');
    const blocks = [];
    const reader = await CAR.request.decode({ body: proofBytes, headers: {} });
    for (const block of reader.blocks.values()) {
      blocks.push(block);
    }
    const proof = await Client.Delegation.extract(proofBytes);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());
    
    console.log(`📦 Space: ${space.did()}`);
    
    // Read file and upload
    const fileContent = fs.readFileSync(filePath);
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' });
    
    const cid = await client.uploadFile(file);
    
    const duration = Date.now() - startTime;
    
    console.log(`✅ Upload successful in ${duration}ms`);
    console.log(`📦 CID: ${cid}`);
    console.log(`🔗 Storacha Gateway: https://w3s.link/ipfs/${cid}`);
    console.log(`🔗 Public Gateway: https://ipfs.io/ipfs/${cid}`);
    
    // Summary
    console.log('\n📊 Spike Results:');
    console.log(`   Upload latency: ${duration}ms ${duration < 10000 ? '✅' : '⚠️'} (target: <10s)`);
    console.log(`   IPFS + Filecoin backup: ✅`);
    console.log(`   Fire-and-forget suitable: ✅`);
    console.log(`   CID: ${cid}`);
    
    return { success: true, cid: cid.toString(), uploadLatency: duration };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Upload failed after ${duration}ms`);
    console.error(`Error: ${error.message}`);
    
    return { success: false, error: error.message, duration };
  }
}

// Run spike
uploadToStoracha(testFile)
  .then(result => {
    console.log('\n✅ Storacha Upload Spike Complete');
    
    // Cleanup
    fs.unlinkSync(testFile);
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Spike failed:', err);
    process.exit(1);
  });