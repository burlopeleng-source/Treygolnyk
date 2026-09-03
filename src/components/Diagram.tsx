import { useAnimatedNumber } from '../hooks';
import { fmt } from '../lib/triangle';
import type { SideKey } from '../lib/triangle';

export const SIDE_COLORS: Record<SideKey, string> = {
  a: '#59c8ff',
  b: '#5ce0a8',
  c: '#ffb545',
};

interface DiagramProps {
  a: number | null;
  b: number | null;
  computed: SideKey | null;
  prec: number;
  showCircle: boolean;
  showAlt: boolean;
  bad: boolean;
}

const W = 660;
const H = 470;
const PAD_L = 104;
const PAD_R = 60;
const PAD_T = 66;
const PAD_B = 104;
const MONO = "'JetBrains Mono', monospace";

function arcPath(cx: number, cy: number, r: number, t0: number, t1: number): string {
  const n = 26;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    d += (i === 0 ? 'M' : 'L') + (cx + r * Math.cos(t)).toFixed(1) + ' ' + (cy + r * Math.sin(t)).toFixed(1);
  }
  return d;
}

export default function Diagram({ a, b, computed, prec, showCircle, showAlt, bad }: DiagramProps) {
  const A = useAnimatedNumber(a);
  const B = useAnimatedNumber(b);
  const ready = A != null && B != null && A > 1e-4 && B > 1e-4;

  const g = (() => {
    if (!ready || A == null || B == null) return null;
    const k = Math.min((W - PAD_L - PAD_R) / B, (H - PAD_T - PAD_B) / A);
    const C = { x: PAD_L, y: H - PAD_B };
    const Bp = { x: PAD_L + B * k, y: H - PAD_B };
    const Ap = { x: PAD_L, y: H - PAD_B - A * k };
    const cLenPx = Math.hypot(Bp.x - Ap.x, Bp.y - Ap.y);
    const cVal = Math.hypot(A, B);
    const mid = { x: (Ap.x + Bp.x) / 2, y: (Ap.y + Bp.y) / 2 };
    const alphaDeg = (Math.atan(A / B) * 180) / Math.PI;
    const betaDeg = 90 - alphaDeg;

    const tBC = Math.atan2(C.y - Bp.y, C.x - Bp.x);
    let tBA = Math.atan2(Ap.y - Bp.y, Ap.x - Bp.x);
    if (tBA < tBC) tBA += Math.PI * 2;
    const alphaArc = arcPath(Bp.x, Bp.y, 30, tBC, tBA);
    const am = (tBC + tBA) / 2;
    const alphaLabel = { x: Bp.x + 56 * Math.cos(am), y: Bp.y + 56 * Math.sin(am) };

    const tAB = Math.atan2(Bp.y - Ap.y, Bp.x - Ap.x);
    const tAC = Math.atan2(C.y - Ap.y, C.x - Ap.x);
    const betaArc = arcPath(Ap.x, Ap.y, 30, tAB, tAC);
    const bm = (tAB + tAC) / 2;
    const betaLabel = { x: Ap.x + 56 * Math.cos(bm), y: Ap.y + 56 * Math.sin(bm) };

    const dir = { x: (Bp.x - Ap.x) / cLenPx, y: (Bp.y - Ap.y) / cLenPx };
    let n = { x: dir.y, y: -dir.x };
    const toC = { x: mid.x - C.x, y: mid.y - C.y };
    if (n.x * toC.x + n.y * toC.y > 0) n = { x: -n.x, y: -n.y };
    const cLabel = { x: mid.x + n.x * 27, y: mid.y + n.y * 27 };

    const ab = { x: Bp.x - Ap.x, y: Bp.y - Ap.y };
    const t = ((C.x - Ap.x) * ab.x + (C.y - Ap.y) * ab.y) / (cLenPx * cLenPx);
    const Hp = { x: Ap.x + t * ab.x, y: Ap.y + t * ab.y };
    const hLabel = { x: (C.x + Hp.x) / 2 - n.x * 16, y: (C.y + Hp.y) / 2 - n.y * 16 };

    return {
      C, Bp, Ap, cLenPx, cVal, mid, alphaDeg, betaDeg,
      alphaArc, alphaLabel, betaArc, betaLabel, cLabel, n, Hp, hLabel,
    };
  })();

  const sideProps = (key: SideKey) => {
    const isComp = computed === key;
    const color = bad && key === 'c' ? '#ff7a85' : SIDE_COLORS[key];
    return {
      stroke: color,
      strokeWidth: isComp ? 4 : 3,
      strokeLinecap: 'round' as const,
      strokeDasharray: isComp ? '14 9' : undefined,
      className: isComp ? 'dash-run' : undefined,
      style: isComp ? { filter: `drop-shadow(0 0 7px ${color})` } : undefined,
    };
  };

  const dimYb = H - PAD_B + 46;
  const dimXa = PAD_L - 46;
  const angDigits = Math.min(prec, 2);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Чертёж прямоугольного треугольника">
        <defs>
          <pattern id="gmin" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="rgba(126,178,229,0.08)" strokeWidth="1" />
          </pattern>
          <pattern id="gmaj" width="110" height="110" patternUnits="userSpaceOnUse">
            <path d="M110 0H0V110" fill="none" stroke="rgba(126,178,229,0.16)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#gmin)" />
        <rect width={W} height={H} fill="url(#gmaj)" />
        <rect x="10" y="10" width={W - 20} height={H - 20} fill="none" stroke="rgba(30,58,92,0.9)" strokeWidth="1.5" />

        {[[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].map(([x, y], i) => (
          <g key={i} stroke="rgba(143,169,198,0.5)" strokeWidth="1">
            <line x1={x - 7} y1={y} x2={x + 7} y2={y} />
            <line x1={x} y1={y - 7} x2={x} y2={y + 7} />
          </g>
        ))}

        <text x={W - 26} y={34} textAnchor="end" fontFamily={MONO} fontSize="12" fill="#5f7fa3">М 1:1</text>
        <text x={W - 26} y={H - 22} textAnchor="end" fontFamily={MONO} fontSize="11" fill="#46617f">СБ · ПТ/01</text>

        {g ? (
          <g>
            {showCircle && (
              <g>
                <circle cx={g.mid.x} cy={g.mid.y} r={g.cLenPx / 2} fill="none" stroke="rgba(157,188,224,0.5)" strokeWidth="1.5" strokeDasharray="3 7" />
                <circle cx={g.mid.x} cy={g.mid.y} r="3" fill="none" stroke="rgba(157,188,224,0.7)" strokeWidth="1.2" />
                <text x={g.mid.x + 9} y={g.mid.y - 9} fontFamily={MONO} fontSize="11.5" fill="rgba(157,188,224,0.85)" stroke="#0a192c" strokeWidth="4" paintOrder="stroke">центр R</text>
              </g>
            )}

            <path d={`M${g.C.x} ${g.C.y} L${g.Bp.x} ${g.Bp.y} L${g.Ap.x} ${g.Ap.y} Z`} fill="rgba(255,181,69,0.07)" />

            {showAlt && (
              <g>
                <line x1={g.C.x} y1={g.C.y} x2={g.Hp.x} y2={g.Hp.y} stroke="#59c8ff" strokeWidth="1.8" strokeDasharray="5 5" opacity="0.9" />
                <text x={g.hLabel.x} y={g.hLabel.y} textAnchor="middle" dominantBaseline="middle" fontFamily={MONO} fontSize="13" fontWeight={700} fill="#9ed6ff" stroke="#0a192c" strokeWidth="4" paintOrder="stroke">h</text>
              </g>
            )}

            {/* стороны */}
            <line x1={g.C.x} y1={g.C.y} x2={g.Ap.x} y2={g.Ap.y} {...sideProps('a')} />
            <line x1={g.C.x} y1={g.C.y} x2={g.Bp.x} y2={g.Bp.y} {...sideProps('b')} />
            <line x1={g.Ap.x} y1={g.Ap.y} x2={g.Bp.x} y2={g.Bp.y} {...sideProps('c')} />

            {/* прямой угол при C */}
            <path d={`M${g.C.x} ${g.C.y - 16} H${g.C.x + 16} V${g.C.y}`} fill="none" stroke="#e9f2fb" strokeWidth="1.6" opacity="0.9" />

            {/* дуги острых углов */}
            <path d={g.alphaArc} fill="none" stroke="rgba(233,242,251,0.75)" strokeWidth="1.5" />
            <path d={g.betaArc} fill="none" stroke="rgba(233,242,251,0.75)" strokeWidth="1.5" />
            <text x={g.alphaLabel.x} y={g.alphaLabel.y} textAnchor="middle" dominantBaseline="middle" fontFamily={MONO} fontSize="12.5" fill="#cfe0f2" stroke="#0a192c" strokeWidth="4" paintOrder="stroke">
              α {fmt(g.alphaDeg, angDigits)}°
            </text>
            <text x={g.betaLabel.x} y={g.betaLabel.y} textAnchor="middle" dominantBaseline="middle" fontFamily={MONO} fontSize="12.5" fill="#cfe0f2" stroke="#0a192c" strokeWidth="4" paintOrder="stroke">
              β {fmt(g.betaDeg, angDigits)}°
            </text>

            {/* вершины */}
            {[g.C, g.Bp, g.Ap].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0a192c" stroke="#e9f2fb" strokeWidth="1.6" />
            ))}
            <text x={g.Ap.x - 13} y={g.Ap.y - 11} textAnchor="end" fontFamily={MONO} fontSize="14" fill="#cfe0f2">A</text>
            <text x={g.Bp.x + 13} y={g.Bp.y + 22} fontFamily={MONO} fontSize="14" fill="#cfe0f2">B</text>
            <text x={g.C.x - 13} y={g.C.y + 24} textAnchor="end" fontFamily={MONO} fontSize="14" fill="#cfe0f2">C</text>

            {/* размерная линия b */}
            <g fontFamily={MONO}>
              <line x1={g.C.x} y1={g.C.y + 8} x2={g.C.x} y2={dimYb + 8} stroke={SIDE_COLORS.b} strokeWidth="1" opacity="0.5" />
              <line x1={g.Bp.x} y1={g.Bp.y + 8} x2={g.Bp.x} y2={dimYb + 8} stroke={SIDE_COLORS.b} strokeWidth="1" opacity="0.5" />
              <line x1={g.C.x} y1={dimYb} x2={g.Bp.x} y2={dimYb} stroke={SIDE_COLORS.b} strokeWidth="1.4" />
              <path d={`M${g.C.x} ${dimYb} l10 -4 v8 z`} fill={SIDE_COLORS.b} />
              <path d={`M${g.Bp.x} ${dimYb} l-10 -4 v8 z`} fill={SIDE_COLORS.b} />
              <text x={(g.C.x + g.Bp.x) / 2} y={dimYb + 24} textAnchor="middle" fontSize="15" fontWeight={700} fill={SIDE_COLORS.b} stroke="#0a192c" strokeWidth="5" paintOrder="stroke">
                b = {fmt(B ?? 0, prec)}
              </text>
            </g>

            {/* размерная линия a */}
            <g fontFamily={MONO}>
              <line x1={g.C.x - 8} y1={g.C.y} x2={dimXa - 8} y2={g.C.y} stroke={SIDE_COLORS.a} strokeWidth="1" opacity="0.5" />
              <line x1={g.Ap.x - 8} y1={g.Ap.y} x2={dimXa - 8} y2={g.Ap.y} stroke={SIDE_COLORS.a} strokeWidth="1" opacity="0.5" />
              <line x1={dimXa} y1={g.C.y} x2={dimXa} y2={g.Ap.y} stroke={SIDE_COLORS.a} strokeWidth="1.4" />
              <path d={`M${dimXa} ${g.C.y} l-4 -10 h8 z`} fill={SIDE_COLORS.a} />
              <path d={`M${dimXa} ${g.Ap.y} l-4 10 h8 z`} fill={SIDE_COLORS.a} />
              <text x={dimXa - 10} y={(g.C.y + g.Ap.y) / 2} textAnchor="end" dominantBaseline="middle" fontSize="15" fontWeight={700} fill={SIDE_COLORS.a} stroke="#0a192c" strokeWidth="5" paintOrder="stroke">
                a = {fmt(A ?? 0, prec)}
              </text>
            </g>

            {/* подпись гипотенузы */}
            <line x1={g.mid.x + g.n.x * 7} y1={g.mid.y + g.n.y * 7} x2={g.mid.x + g.n.x * 15} y2={g.mid.y + g.n.y * 15} stroke={bad ? '#ff7a85' : SIDE_COLORS.c} strokeWidth="1.2" opacity="0.7" />
            <text x={g.cLabel.x} y={g.cLabel.y} textAnchor="middle" dominantBaseline="middle" fontFamily={MONO} fontSize="16" fontWeight={700} fill={bad ? '#ff7a85' : SIDE_COLORS.c} stroke="#0a192c" strokeWidth="5" paintOrder="stroke">
              c = {fmt(g.cVal, prec)}
            </text>
            {bad && (
              <text x={g.cLabel.x} y={g.cLabel.y + 21} textAnchor="middle" fontFamily={MONO} fontSize="12.5" fontWeight={700} fill="#ff7a85" stroke="#0a192c" strokeWidth="4" paintOrder="stroke">
                a² + b² ≠ c² !
              </text>
            )}
          </g>
        ) : (
          <g fontFamily={MONO}>
            <path d="M170 330 L480 330 L170 140 Z" fill="rgba(89,200,255,0.03)" stroke="#35597f" strokeWidth="2" strokeDasharray="7 7" />
            <path d="M170 314 H186 V330" fill="none" stroke="#35597f" strokeWidth="1.5" />
            <text x={W / 2} y={182} textAnchor="middle" fontSize="17" fontWeight={600} fill="#8fa9c6">Введите две стороны</text>
            <text x={W / 2} y={208} textAnchor="middle" fontSize="13.5" fill="#5f7fa3">— чертёж построится автоматически</text>
            <text x={W / 2} y={384} textAnchor="middle" fontSize="15" fill="#35597f">c² = a² + b²</text>
          </g>
        )}
      </svg>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3 font-mono text-[12px] text-dim">
        {(['a', 'b', 'c'] as SideKey[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-2">
            <span className="inline-block h-[3px] w-5 rounded-full" style={{ background: SIDE_COLORS[k] }} />
            {k === 'a' ? 'катет a' : k === 'b' ? 'катет b' : 'гипотенуза c'}
            {computed === k && <em className="not-italic text-ambersoft">· расчёт</em>}
          </span>
        ))}
        <span className="ml-auto hidden text-[#5f7fa3] sm:inline">прямой угол — при вершине C</span>
      </div>
    </div>
  );
}
