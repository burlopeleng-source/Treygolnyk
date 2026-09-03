import type { Preset, SideKey, SolveResult } from '../lib/triangle';
import { PRESETS, fmt } from '../lib/triangle';
import { SIDE_COLORS } from './Diagram';

interface CalculatorProps {
  fields: Record<SideKey, string>;
  onField: (k: SideKey, v: string) => void;
  solve: SolveResult;
  prec: number;
  onPrec: (n: number) => void;
  showCircle: boolean;
  onShowCircle: (v: boolean) => void;
  showAlt: boolean;
  onShowAlt: (v: boolean) => void;
  onSave: () => void;
  onCopy: () => void;
  onReset: () => void;
  onPreset: (p: Preset) => void;
  canSave: boolean;
  canCopy: boolean;
}

const FIELD_DEFS: { k: SideKey; title: string; sub: string }[] = [
  { k: 'a', title: 'Катет a', sub: 'вертикальный · против угла α' },
  { k: 'b', title: 'Катет b', sub: 'горизонтальный · против угла β' },
  { k: 'c', title: 'Гипотенуза c', sub: 'напротив прямого угла' },
];

export default function Calculator(props: CalculatorProps) {
  const {
    fields, onField, solve, prec, onPrec,
    showCircle, onShowCircle, showAlt, onShowAlt,
    onSave, onCopy, onReset, onPreset, canSave, canCopy,
  } = props;

  const good = solve.status === 'ok' || solve.status === 'verify-ok';
  const badStatus = solve.status === 'invalid' || solve.status === 'verify-bad';
  const msgColor = good ? 'text-mint' : badStatus ? 'text-coral' : 'text-dim';
  const dotCls = good ? 'bg-mint pulse-dot' : badStatus ? 'bg-coral' : 'bg-line';

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      {/* эталонные тройки */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#5f7fa3]">Эталонные тройки</span>
        {PRESETS.map((p) => (
          <button key={p.name} type="button" className="chip" onClick={() => onPreset(p)} title={`Подставить a = ${p.a}, b = ${p.b}`}>
            {p.name}
          </button>
        ))}
      </div>

      {/* поля сторон */}
      <div className="mt-5 grid gap-3">
        {FIELD_DEFS.map(({ k, title, sub }) => {
          const isComputed = solve.computed === k && solve.sides != null;
          const color = SIDE_COLORS[k];
          return (
            <div
              key={k}
              className="rounded-lg border border-line bg-[rgba(10,25,44,0.35)] p-3.5 transition-colors hover:border-[#33587f]"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-[15px] font-bold" style={{ color }}>{title}</span>
                  <span className="text-[11px] text-dim">{sub}</span>
                </div>
                {fields[k] && !isComputed && (
                  <button
                    type="button"
                    onClick={() => onField(k, '')}
                    className="grid h-6 w-6 place-items-center rounded-md border border-line text-dim transition-colors hover:border-coral hover:text-coral"
                    aria-label={`Очистить поле ${k}`}
                    title="Очистить поле"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M1 1l8 8M9 1l-8 8" />
                    </svg>
                  </button>
                )}
              </div>
              {isComputed ? (
                <div className="flex items-center justify-between gap-3 rounded-md border border-amber/30 bg-amber/[0.06] px-3.5 py-2.5">
                  <span className="font-mono text-[22px] font-bold leading-none text-ambersoft tabular-nums">
                    {fmt(solve.sides![k], prec)}
                  </span>
                  <span className="rounded bg-amber px-2 py-0.5 font-display text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#132134]">
                    найдено
                  </span>
                </div>
              ) : (
                <input
                  className="field-input"
                  inputMode="decimal"
                  placeholder={k === 'c' ? 'например, 5' : 'например, ' + (k === 'a' ? '3' : '4')}
                  value={fields[k]}
                  onChange={(e) => onField(k, e.target.value.replace(/[^\d.,]/g, '').slice(0, 12))}
                  aria-label={title}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* статус */}
      <div className="mt-4 flex min-h-[44px] items-start gap-2.5 rounded-md border border-line bg-[rgba(10,25,44,0.35)] px-3.5 py-2.5">
        <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${dotCls}`} />
        <p className={`font-mono text-[12.5px] leading-relaxed ${msgColor}`}>{solve.message}</p>
      </div>

      {/* настройки */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
        <label className="flex items-center gap-2 text-[12px] text-dim">
          Точность
          <select className="select-input" value={prec} onChange={(e) => onPrec(Number(e.target.value))}>
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} знака</option>
            ))}
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-dim transition-colors hover:text-ink">
          <input type="checkbox" className="check" checked={showCircle} onChange={(e) => onShowCircle(e.target.checked)} />
          описанная окружность R
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[12px] text-dim transition-colors hover:text-ink">
          <input type="checkbox" className="check" checked={showAlt} onChange={(e) => onShowAlt(e.target.checked)} />
          высота h
        </label>
      </div>

      {/* действия */}
      <div className="mt-auto flex flex-wrap gap-2.5 pt-5">
        <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={onSave} disabled={!canSave}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 1h6l3 3v9H3z" />
            <path d="M5 1v3h4V1M5 13V8h5v5" />
          </svg>
          В журнал
        </button>
        <button type="button" className="btn-ghost inline-flex items-center gap-2" onClick={onCopy} disabled={!canCopy} style={!canCopy ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
            <path d="M9.5 4.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
          </svg>
          Копировать
        </button>
        <button type="button" className="btn-ghost ml-auto inline-flex items-center gap-2" onClick={onReset}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 7a5 5 0 1 0 1.5-3.6" />
            <path d="M2 1v3h3" />
          </svg>
          Сброс
        </button>
      </div>
    </div>
  );
}
