import 'server-only';
import { NextResponse } from 'next/server';
import { QspClient } from '@/services/qspClient';

export async function GET() {
  try {
    const client = new QspClient();
    const data = await client.getApplications();
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('401') || err.message.includes('Token JWT')) {
        return NextResponse.json({ error: 'Token JWT expirado o no autorizado' }, { status: 401 });
      }
      if (err.message.includes('Floci') || err.message.includes('conectividad')) {
        return NextResponse.json({ error: 'Error de comunicación con Qsp CD / Floci' }, { status: 502 });
      }
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
