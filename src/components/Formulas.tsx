import { useReveal } from '../hooks';

const ITEMS: { f: string; d: string; hot?: boolean }[] = [
  { f: 'c = √(a² + b²)', d: 'Гипотенуза через два катета — сама теорема Пифагора.', hot: true },
  { f: 'a = √(c² − b²)', d: 'Катет через гипотенузу и второй катет.' },
  { f: 'S = a·b / 2', d: 'Площадь — половина произведения катетов.' },
  { f: 'h = a·b / c', d: 'Высота, опущенная на гипотенузу.' },
  { f: 'α = arctg(a / b)', d: 'Острый угол против катета a. Второй: β = 90° − α.' },
  { f: 'r = (a + b − c) / 2', d: 'Радиус вписанной окружности.' },
  { f: 'R = c / 2', d: 'Радиус описанной окружности: её центр — середина гипотенузы.' },
  { f: 'P = a + b + c', d: 'Периметр треугольника.' },
];

export default function Formulas() {
  const { ref, inView } = useReveal<HTMLElement>();
  return (
    <section ref={ref} className={`reveal ${inView ? 'in' : ''}`}>
      <div className="panel overflow-hidden">
        <div className="panel-head">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-dim">Шпаргалка по прямому углу</span>
          <span className="font-mono text-[11px] text-[#5f7fa3]">8 формул</span>
        </div>
        <div className="p-5">
          <p className="mb-5 border-l-2 border-line pl-4 text-[13px] italic leading-relaxed text-dim">
            «Квадрат гипотенузы равен сумме квадратов катетов» — теорема Пифагора, VI век до н. э.,
            основа всего, что считает эта страница.
          </p>
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <div
                key={it.f}
                className={`rounded-r-md border-l-2 py-2 pl-4 pr-2 transition-colors hover:border-amber ${
                  it.hot ? 'border-amber/70 bg-amber/[0.05] sm:col-span-2' : 'border-line hover:bg-[rgba(89,200,255,0.03)]'
                }`}
              >
                <div className={`font-mono font-bold tracking-tight ${it.hot ? 'text-[26px] text-ambersoft' : 'text-[17px] text-ink'}`}>
                  {it.f}
                </div>
                <div className="mt-1 text-[12.5px] leading-relaxed text-dim">{it.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
