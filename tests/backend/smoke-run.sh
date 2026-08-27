#!/bin/bash
# Executable smoke test for /spec-impl 06-qsp-backend-test.md
URL="${QSP_API_URL:-http://localhost:3000/api/qsp/applications}"
echo "Smoke test: $URL"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")
echo "Status: $HTTP"
if [ "$HTTP" = "200" ]; then echo "PASS: Backend online"; exit 0; elif [ "$HTTP" = "502" ]; then echo "PASS: Floci offline (502 expected)"; exit 0; else echo "FAIL: Unexpected $HTTP"; exit 1; fi
