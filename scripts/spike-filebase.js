#!/usr/bin/env node
/**
 * Spike: Filebase IPFS RPC Upload PoC
 * 
 * Purpose: Validate Filebase IPFS RPC API integration
 * - Test upload via IPFS RPC endpoint
 * - Measure pin latency
 * - Verify CID retrieval via dedicated gateway
 * 
 * Expected Results:
 * - Pin latency <5s for <10MB files
 * - CID accessible via ipfs.filebase.io gateway
 * - 100% success rate for valid files
 */

import 'dotenv/config';
import fs from 'node:fs';
import FormData from 'form-data';
import axios from 'axios';

// Environment validation
const RPC_ENDPOINT = process.env.FILEBASE_IPFS_RPC_ENDPOINT;
const RPC_KEY = process.env.FILEBASE_IPFS_RPC_KEY;

if (!RPC_ENDPOINT || !RPC_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   FILEBASE_IPFS_RPC_ENDPOINT');
  console.error('   FILEBASE_IPFS_RPC_KEY');
  console.error('\nSet with:');
  console.error('   export FILEBASE_IPFS_RPC_ENDPOINT="https://rpc.filebase.io"');
  console.error('   export FILEBASE_IPFS_RPC_KEY={{your_base64_key}}');
  process.exit(1);
}

// Create test file
const testFile = '/tmp/zn-test.txt';
const testContent = `Zero Noise Test Upload\nTimestamp: ${new Date().toISOString()}\nSpike: Filebase IPFS RPC`;
fs.writeFileSync(testFile, testContent);

console.log('🚀 Starting Filebase IPFS RPC Upload Spike\n');
console.log(`📄 Test file: ${testFile} (${fs.statSync(testFile).size} bytes)`);

async function uploadToFilebase(filePath) {
  const startTime = Date.now();
  
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    console.log('\n⏱️  Uploading to Filebase IPFS RPC...');
    
    const response = await axios.post(
      `${RPC_ENDPOINT}/api/v0/add`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${RPC_KEY}`,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
        timeout: 30000, // 30s timeout
      }
    );
    
    const duration = Date.now() - startTime;
    const cid = response.data.Hash;
    
    console.log(`✅ Upload successful in ${duration}ms`);
    console.log(`📦 CID: ${cid}`);
    console.log(`🔗 Filebase Gateway: https://zonal-crimson-egret.myfilebase.com/ipfs/${cid}`);
    console.log(`🔗 Public Gateway: https://ipfs.io/ipfs/${cid}`);
    
    // Verify retrieval via Filebase gateway
    console.log('\n🔍 Verifying retrieval via Filebase gateway...');
    const verifyStart = Date.now();
    
    const retrieveResponse = await axios.get(
      `https://zonal-crimson-egret.myfilebase.com/ipfs/${cid}`,
      { timeout: 10000 }
    );
    
    const retrieveDuration = Date.now() - verifyStart;
    const retrievedContent = retrieveResponse.data;
    
    if (retrievedContent === testContent) {
      console.log(`✅ Content verified in ${retrieveDuration}ms`);
    } else {
      console.log(`⚠️  Content mismatch!`);
      console.log(`Expected: ${testContent.substring(0, 50)}...`);
      console.log(`Got: ${retrievedContent.substring(0, 50)}...`);
    }
    
    // Summary
    console.log('\n📊 Spike Results:');
    console.log(`   Upload latency: ${duration}ms ${duration < 5000 ? '✅' : '⚠️'} (target: <5s)`);
    console.log(`   Retrieval latency: ${retrieveDuration}ms ${retrieveDuration < 2000 ? '✅' : '⚠️'} (target: <2s)`);
    console.log(`   Success: ✅`);
    console.log(`   CID: ${cid}`);
    
    return { success: true, cid, uploadLatency: duration, retrieveLatency: retrieveDuration };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log(`❌ Upload failed after ${duration}ms`);
    console.error(`Error: ${error.message}`);
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return { success: false, error: error.message, duration };
  }
}

// Run spike
uploadToFilebase(testFile)
  .then(result => {
    console.log('\n✅ Filebase IPFS RPC Spike Complete');
    
    // Cleanup
    fs.unlinkSync(testFile);
    
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Spike failed:', err);
    process.exit(1);
  });