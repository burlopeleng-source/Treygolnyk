import type { HistEntry } from '../lib/triangle';
import { compact } from '../lib/triangle';

interface HistoryPanelProps {
  items: HistEntry[];
  onRestore: (e: HistEntry) => void;
  onRemove: (id: number) => void;
  onClearAll: () => void;
}

export default function HistoryPanel({ items, onRestore, onRemove, onClearAll }: HistoryPanelProps) {
  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="panel-head">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-dim">Журнал расчётов</span>
        <span className="flex items-center gap-3">
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-dim">{items.length}</span>
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="font-mono text-[11px] text-[#5f7fa3] underline decoration-dotted underline-offset-4 transition-colors hover:text-coral"
            >
              очистить
            </button>
          )}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="#35597f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 28V8l20 20z" />
            <path d="M6 22h6v6" />
          </svg>
          <p className="max-w-[240px] text-[13px] leading-relaxed text-dim">
            Журнал пуст. Решите треугольник и нажмите <span className="font-semibold text-ambersoft">«В журнал»</span> — расчёт сохранится даже после закрытия страницы.
          </p>
        </div>
      ) : (
        <ul className="max-h-[330px] flex-1 divide-y divide-line overflow-y-auto">
          {items.map((e) => (
            <li key={e.id} className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-panel2">
              <span className="font-mono text-[13px] font-semibold tabular-nums">
                <span className="text-cy">a</span> <span className="text-ink">{compact(e.a)}</span>
                <span className="mx-1.5 text-[#46617f]">·</span>
                <span className="text-mint">b</span> <span className="text-ink">{compact(e.b)}</span>
                <span className="mx-1.5 text-[#46617f]">·</span>
                <span className="text-amber">c</span> <span className="text-ink">{compact(e.c)}</span>
              </span>
              <span className="ml-auto font-mono text-[10.5px] text-[#5f7fa3]">
                {new Date(e.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                type="button"
                onClick={() => onRestore(e)}
                title="Вернуть в расчёт"
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim opacity-60 transition-all hover:border-mint hover:text-mint group-hover:opacity-100"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7h8M8 3l4 4-4 4" transform="rotate(180 7 7)" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onRemove(e.id)}
                title="Удалить запись"
                className="grid h-7 w-7 place-items-center rounded-md border border-line text-dim opacity-60 transition-all hover:border-coral hover:text-coral group-hover:opacity-100"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M1 1l8 8M9 1l-8 8" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
