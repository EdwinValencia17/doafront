// src/components/tags/OrderTags.tsx
import React from 'react';

type Sev = 'purple' | 'red' | 'orange' | 'green' | 'blue' | 'amber' | 'gray';

function Chip({ text, color }: { text: string; color: Sev }) {
  return <span className={`chip chip--${color}`}>{text}</span>;
}

/* PRIORIDAD */
export const PrioridadTag = ({ p }: { p?: string | null }) => {
  const code = (p || '').toUpperCase();
  switch (code) {
    case 'N': return <Chip text="NORMAL"      color="purple" />;
    case 'G': return <Chip text="URGENTE"     color="red"    />;
    case 'U': return <Chip text="PRIORITARIO" color="orange" />;
    case 'I': return <Chip text="INVENTARIO"  color="green"  />;
    case 'P': return <Chip text="PREVENTIVO"  color="blue"   />;
    default:  return <Chip text={code || '—'} color="gray"   />;
  }
};

/* ESTADO */
export const EstadoTag = ({ s }: { s?: string | null }) => {
  const v = (s || '').toUpperCase().trim();
  if (/PENDIENTE/.test(v))       return <Chip text={v} color="orange" />;
  if (/RECHAZAD/.test(v))        return <Chip text={v} color="red"    />;
  if (/APROBAD/.test(v))         return <Chip text={v} color="purple" />;
  if (/ANULAD/.test(v))          return <Chip text={v} color="orange" />;
  if (/CANCELAD|CERRAD/.test(v)) return <Chip text={v} color="amber"  />;
  return <Chip text={v || '—'} color="gray" />;
};
