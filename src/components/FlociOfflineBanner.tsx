'use client';

import { WifiOff } from 'lucide-react';

export default function FlociOfflineBanner() {
  return (
    <div className="w-full bg-red-600 text-white px-4 py-3 rounded-lg shadow-sm flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <WifiOff className="w-5 h-5 shrink-0" />
      <div>
        <h2 className="font-bold text-sm">Error de comunicación con el clúster local (Floci Offline)</h2>
        <p className="text-xs text-red-100">No se pudo conectar con Qsp CD. Verifique que el emulador local esté activo.</p>
      </div>
    </div>
  );
}
