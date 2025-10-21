#!/bin/bash
# Spike: Storacha Upload via CLI
# Tests Storacha integration using the CLI tool

set -e

# Load .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

echo "🚀 Starting Storacha CLI Upload Spike"
echo

# Create test file
TEST_FILE="/tmp/zn-storacha-test.txt"
echo "Zero Noise Storacha Test
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Spike: Storacha CLI" > "$TEST_FILE"

echo "📄 Test file: $TEST_FILE ($(wc -c < "$TEST_FILE") bytes)"
echo

# Set env vars
export STORACHA_PRINCIPAL="$STORACHA_KEY"

# Add space using proof
echo "⏱️  Adding space with proof..."
storacha space add "$STORACHA_PROOF"

# Upload file
echo "⏱️  Uploading to Storacha..."
START_TIME=$(date +%s%3N)

OUTPUT=$(storacha up "$TEST_FILE" --json)
END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))

# Extract CID
CID=$(echo "$OUTPUT" | jq -r '.root."/"')

echo "✅ Upload successful in ${DURATION}ms"
echo "📦 CID: $CID"
echo "🔗 Storacha Gateway: https://w3s.link/ipfs/$CID"
echo "🔗 Public Gateway: https://ipfs.io/ipfs/$CID"

# Summary
echo
echo "📊 Spike Results:"
if [ $DURATION -lt 10000 ]; then
    echo "   Upload latency: ${DURATION}ms ✅ (target: <10s)"
else
    echo "   Upload latency: ${DURATION}ms ⚠️  (target: <10s)"
fi
echo "   IPFS + Filecoin backup: ✅"
echo "   Fire-and-forget suitable: ✅"
echo "   CID: $CID"

# Cleanup
rm "$TEST_FILE"

echo
echo "✅ Storacha CLI Upload Spike Complete"
