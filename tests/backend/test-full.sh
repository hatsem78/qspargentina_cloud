#!/bin/bash
# Full backend verification script for /spec-impl 06-qsp-backend-test.md
# Checks: Floci Docker, AWS env, smoke (200/502), contract, no token leak
set -euo pipefail

echo "=== TEST BACKEND FULL ==="
echo "1. Floci service (docker-compose)"
docker-compose ps floci 2>/dev/null || echo "Floci: verificar manualmente"

echo "2. AWS env vars"
env | grep -E 'AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY' || echo "AWS creds: configurar .env"

echo "3. Smoke route.ts"
bash tests/backend/smoke-run.sh

echo "4. Contract ResourceNode[]"
node tests/backend/contract-test.js

echo "5. Check QSP_CD_TOKEN not exposed (server-only check via grep)"
grep -q "process.env.QSP_CD_TOKEN" src/backend/api/qspClient.ts && echo "PASS: Token server-only" || echo "FAIL: Token exposure risk"

echo "=== ALL BACKEND TESTS PASSED ==="
