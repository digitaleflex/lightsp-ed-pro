import React from 'react';

// Composant lourd : graphiques avancés, données volumineuses
export default function HeavyChart({ data }: { data: unknown }) {
  return (
    <div className="p-4 bg-slate-900 rounded-xl text-white">
      <h3 className="font-bold mb-2">Graphique avancé</h3>
      <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
