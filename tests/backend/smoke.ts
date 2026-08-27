// Smoke test: verifica que route.ts responde 200 (Floci online) o 502 (offline)
// Se ejecuta con: node/tests/backend/smoke.ts (o curl directo)

export async function smokeRouteTest() {
  const url = process.env.QSP_API_URL || 'http://localhost:3000/api/qsp/applications';
  try {
    const res = await fetch(url);
    if (res.status === 200) return { ok: true, status: 200, data: await res.json() };
    if (res.status === 502) return { ok: false, status: 502, offline: true };
    return { ok: false, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e), offline: true };
  }
}
