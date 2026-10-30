import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'list' | 'cards';

export function useViewMode(key: string, initial: ViewMode = 'list') {
  const [mode, setMode] = useState<ViewMode>(() => {
    try { const saved = localStorage.getItem('binlegal_view_' + key); return saved === 'cards' || saved === 'list' ? saved : initial; }
    catch { return initial; }
  });
  const choose = (next: ViewMode) => {
    setMode(next);
    try { localStorage.setItem('binlegal_view_' + key, next); } catch { /* Browser storage may be disabled. */ }
  };
  return [mode, choose] as const;
}

export function ViewModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return <div role="group" aria-label="Modo de visualización" className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
    <button type="button" aria-pressed={mode === 'list'} onClick={() => onChange('list')} className={'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' + (mode === 'list' ? 'bg-white text-blue-900 shadow-sm' : 'text-neutral-600 hover:bg-white/60 hover:text-neutral-900')}><List className="h-3.5 w-3.5"/><span>Vista de lista</span></button>
    <button type="button" aria-pressed={mode === 'cards'} onClick={() => onChange('cards')} className={'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' + (mode === 'cards' ? 'bg-white text-blue-900 shadow-sm' : 'text-neutral-600 hover:bg-white/60 hover:text-neutral-900')}><LayoutGrid className="h-3.5 w-3.5"/><span>Tarjetas de seguimiento</span></button>
  </div>;
}
