/**
 * Contract test: validates ResourceNode structure returned by route.ts
 * Usage: node tests/backend/contract-test.js (after running smoke-run.sh for server)
 */
const expectedFields = ['id','name','kind','healthStatus','syncStatus','children'];

async function testContract() {
  const url = process.env.QSP_API_URL || 'http://localhost:3000/api/qsp/applications';
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.data) throw new Error('Missing data array');
    const node = Array.isArray(data.data) ? data.data[0] : data.data;
    for (const f of expectedFields) {
      if (!(f in node)) throw new Error(`Missing field: ${f}`);
    }
    console.log('PASS: Contract ResourceNode[] valid');
    process.exit(0);
  } catch (e) {
    console.error('FAIL:', e.message);
    process.exit(1);
  }
}
testContract();
