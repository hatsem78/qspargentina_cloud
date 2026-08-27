#!/bin/bash
set -e
node -e "const { CheckCircle2 } = require('lucide-react'); console.log('lucide-react OK:', typeof CheckCircle2);"
echo "TEST LUCIDE PASSED"
