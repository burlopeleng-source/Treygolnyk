import { useEffect, useMemo, useState } from 'react';
import Diagram from './components/Diagram';
import Calculator from './components/Calculator';
import Readouts from './components/Readouts';
import Formulas from './components/Formulas';
import HistoryPanel from './components/HistoryPanel';
import { buildReport, compact, fmt, solveTriangle } from './lib/triangle';
import type { HistEntry, Preset, SideKey } from './lib/triangle';
import { useLocalStorage, useReveal } from './hooks';

const STEPS = [
  {
    n: '01',
    t: 'Сохраните страницу',
    d: 'Ctrl + S → «Веб-страница полностью». Локальная копия программы появится на диске — это и есть вся «установка».',
  },
  {
    n: '02',
    t: 'Откройте двойным щелчком',
    d: 'Файл запустится в любом браузере Windows: Edge, Chrome, Firefox. Ярлыки и реестр не требуются.',
  },
  {
    n: '03',
    t: 'Считайте без интернета',
    d: 'Все вычисления выполняются локально на вашем компьютере — хоть в поезде, хоть на даче.',
  },
];

export default function App() {
  const [fields, setFields] = useState<Record<SideKey, string>>({ a: '3', b: '4', c: '' });
  const [prec, setPrec] = useState(3);
  const [showCircle, setShowCircle] = useState(true);
  const [showAlt, setShowAlt] = useState(false);
  const [history, setHistory] = useLocalStorage<HistEntry[]>('pifagor-kb-log', []);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);

  const solve = useMemo(() => solveTriangle(fields.a, fields.b, fields.c), [fields]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const notify = (text: string) => setToast({ id: Date.now(), text });

  const setField = (k: SideKey, v: string) => setFields((f) => ({ ...f, [k]: v }));
  const applyPreset = (p: Preset) => setFields({ a: p.a, b: p.b, c: '' });
  const resetAll = () => {
    setFields({ a: '', b: '', c: '' });
    notify('Поля очищены');
  };

  const saveEntry = () => {
    if (!solve.sides || solve.status === 'verify-bad') return;
    setHistory((h) => [{ id: Date.now(), ...solve.sides!, ts: Date.now() }, ...h].slice(0, 8));
    notify('Сохранено в журнал');
  };

  const copyAll = async () => {
    const text = buildReport(solve, prec);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    notify('Расчёт скопирован в буфер');
  };

  const restore = (e: HistEntry) => {
    setFields({ a: compact(e.a), b: compact(e.b), c: '' });
    notify(`Восстановлено: ${compact(e.a)} · ${compact(e.b)} · ${compact(e.c)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canSave = solve.sides != null && solve.status !== 'verify-bad';
  const canCopy = canSave;

  const readoutsRev = useReveal<HTMLDivElement>();
  const stepsRev = useReveal<HTMLElement>();
  const colsRev = useReveal<HTMLDivElement>();
  const footRev = useReveal<HTMLElement>();

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* фоновая геометрия */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <svg className="spin-slow absolute -right-24 -top-24 h-[520px] w-[520px]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(89,200,255,0.14)" strokeWidth="0.8" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(89,200,255,0.09)" strokeWidth="0.6" />
          <path d="M100 6v188M6 100h188" stroke="rgba(89,200,255,0.07)" strokeWidth="0.6" />
        </svg>
        <svg className="float-slow absolute -bottom-20 -left-16 h-[420px] w-[420px]" viewBox="0 0 200 200">
          <path d="M30 170V40l130 130Z" fill="rgba(255,181,69,0.04)" stroke="rgba(255,181,69,0.15)" strokeWidth="1" />
          <path d="M30 150h20v20" fill="none" stroke="rgba(255,181,69,0.22)" strokeWidth="1" />
        </svg>
      </div>

      {/* шапка */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-[1180px] items-end justify-between gap-4 px-5 pb-5 pt-7">
          <div className="flex items-center gap-4">
            <svg width="46" height="46" viewBox="0 0 48 48" aria-hidden>
              <path d="M8 40V8l32 32Z" fill="rgba(255,181,69,0.14)" stroke="#ffb545" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M8 31h9v9" fill="none" stroke="#ffb545" strokeWidth="2" />
              <circle cx="40" cy="40" r="2.6" fill="#59c8ff" />
              <circle cx="8" cy="8" r="2.6" fill="#5ce0a8" />
            </svg>
            <div>
              <h1 className="font-display text-[25px] font-extrabold leading-none tracking-tight sm:text-3xl">
                Пифагор<span className="text-amber">·</span>КБ
              </h1>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-dim sm:text-[12px]">
                Расчётный лист · прямоугольный треугольник
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2.5 md:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber/50 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-ambersoft">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-mint" />
              без установки
            </span>
            <span className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] text-dim">офлайн</span>
            <span className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] text-dim">Windows · браузер</span>
          </div>
        </div>
        <div className="tick-ruler" />
      </header>

      <main className="relative z-10 mx-auto max-w-[1180px] px-5 pb-10 pt-7">
        {/* вступление + живой статус */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="font-display text-[12px] font-bold uppercase tracking-[0.24em] text-amber">
              Лист 01 — чертёж и расчёт
            </div>
            <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-dim">
              Заполните любые <span className="font-semibold text-ink">два поля</span> — третье достроится по теореме
              Пифагора, а чертёж и все показатели пересчитаются мгновенно.
            </p>
          </div>
          {solve.status === 'ok' && solve.sides && solve.computed && (
            <div className="rounded-md border border-mint/40 bg-mint/[0.07] px-3.5 py-2 font-mono text-[13px] font-semibold text-mint">
              → {solve.computed} = {fmt(solve.sides[solve.computed], prec)}
            </div>
          )}
        </div>

        {/* чертёж + калькулятор */}
        <div className="grid items-stretch gap-6 lg:grid-cols-[13fr_11fr]">
          <section className="panel flex flex-col overflow-hidden">
            <div className="panel-head">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-dim">Чертёж ПТ-01</span>
              <span className="font-mono text-[11px] text-[#5f7fa3]">
                {solve.sides ? 'построен · масштаб адаптивный' : 'ожидает данные'}
              </span>
            </div>
            <Diagram
              a={solve.sides ? solve.sides.a : null}
              b={solve.sides ? solve.sides.b : null}
              computed={solve.computed}
              prec={prec}
              showCircle={showCircle}
              showAlt={showAlt}
              bad={solve.status === 'verify-bad'}
            />
          </section>
          <section className="panel flex flex-col overflow-hidden">
            <div className="panel-head">
              <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-dim">Данные · расчёт</span>
              <span className="font-mono text-[11px] text-[#5f7fa3]">c² = a² + b²</span>
            </div>
            <Calculator
              fields={fields}
              onField={setField}
              solve={solve}
              prec={prec}
              onPrec={setPrec}
              showCircle={showCircle}
              onShowCircle={setShowCircle}
              showAlt={showAlt}
              onShowAlt={setShowAlt}
              onSave={saveEntry}
              onCopy={copyAll}
              onReset={resetAll}
              onPreset={applyPreset}
              canSave={canSave}
              canCopy={canCopy}
            />
          </section>
        </div>

        {/* показания */}
        <div ref={readoutsRev.ref} className={`reveal mt-6 ${readoutsRev.inView ? 'in' : ''}`}>
          <Readouts derived={solve.derived} prec={prec} />
        </div>

        {/* портативность */}
        <section ref={stepsRev.ref} className={`reveal panel mt-6 overflow-hidden ${stepsRev.inView ? 'in' : ''}`}>
          <div className="panel-head">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-dim">
              Портативная версия для Windows
            </span>
            <span className="rounded border border-mint/40 px-2 py-0.5 font-mono text-[10.5px] text-mint">exe не требуется</span>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="group bg-panel px-6 py-5 transition-colors hover:bg-panel2">
                <div className="font-display text-[22px] font-bold text-amber/90 transition-transform group-hover:-translate-y-0.5">{s.n}</div>
                <div className="mt-2 font-display text-[13px] font-bold text-ink">{s.t}</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* формулы + журнал */}
        <div ref={colsRev.ref} className={`reveal mt-6 grid items-start gap-6 lg:grid-cols-2 ${colsRev.inView ? 'in' : ''}`}>
          <Formulas />
          <HistoryPanel
            items={history}
            onRestore={restore}
            onRemove={(id) => setHistory((h) => h.filter((e) => e.id !== id))}
            onClearAll={() => {
              setHistory([]);
              notify('Журнал очищен');
            }}
          />
        </div>
      </main>

      {/* штамп листа */}
      <footer ref={footRev.ref} className={`reveal relative z-10 mx-auto max-w-[1180px] px-5 pb-10 ${footRev.inView ? 'in' : ''}`}>
        <div className="overflow-hidden rounded-[10px] border border-line bg-line font-mono text-[11.5px] text-dim">
          <div className="grid grid-cols-2 gap-px md:grid-cols-6">
            {[
              ['Разработал', 'Ученик 8 «Б»'],
              ['Проверил', 'Пифагор Самосский'],
              ['Утвердил', 'Евклид Александрийский'],
              ['Обозначение', 'ПТ-01'],
              ['Лист', '1'],
              ['Листов', '1'],
            ].map(([label, value]) => (
              <div key={label} className="bg-panel px-3 py-2">
                <div className="text-[9.5px] uppercase tracking-[0.15em] text-[#5f7fa3]">{label}</div>
                <div className="mt-0.5 text-ink/90">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-px grid grid-cols-2 gap-px md:grid-cols-6">
            <div className="col-span-2 bg-panel px-3 py-2 md:col-span-3">
              <div className="text-[9.5px] uppercase tracking-[0.15em] text-[#5f7fa3]">Организация</div>
              <div className="mt-0.5 text-ambersoft">КБ «Пифагор» · теорема № 47 · ок. 530 г. до н. э.</div>
            </div>
            <div className="bg-panel px-3 py-2">
              <div className="text-[9.5px] uppercase tracking-[0.15em] text-[#5f7fa3]">Масштаб</div>
              <div className="mt-0.5 text-ink/90">1 : 1</div>
            </div>
            <div className="bg-panel px-3 py-2">
              <div className="text-[9.5px] uppercase tracking-[0.15em] text-[#5f7fa3]">Формат</div>
              <div className="mt-0.5 text-ink/90">А4</div>
            </div>
            <div className="col-span-2 bg-panel px-3 py-2 md:col-span-1">
              <div className="text-[9.5px] uppercase tracking-[0.15em] text-[#5f7fa3]">Точность</div>
              <div className="mt-0.5 text-ink/90">{prec} знака</div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[11.5px] text-[#5f7fa3]">
          c² = a² + b² · 2500 лет без единой установки · портативный расчёт для Windows и не только
        </p>
      </footer>

      {/* тост */}
      {toast && (
        <div
          key={toast.id}
          className="toast-in fixed bottom-6 right-6 z-[90] flex items-center gap-2.5 rounded-lg border border-amber/50 bg-panel2 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
          role="status"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#5ce0a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 8.5l3.5 3.5 7.5-8" />
          </svg>
          <span className="font-mono text-[13px] text-ink">{toast.text}</span>
        </div>
      )}
    </div>
  );
}
