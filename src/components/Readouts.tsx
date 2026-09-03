import { useAnimatedNumber } from '../hooks';
import type { Derived } from '../lib/triangle';
import { fmt } from '../lib/triangle';

interface TileProps {
  sym: string;
  label: string;
  value: number | null;
  unit?: string;
  isAngle?: boolean;
  prec: number;
}

function Tile({ sym, label, value, unit, isAngle, prec }: TileProps) {
  const v = useAnimatedNumber(value);
  const digits = isAngle ? Math.min(prec, 2) : prec;
  return (
    <div className="group bg-panel px-4 py-4 transition-colors hover:bg-panel2">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[13px] font-bold text-ambersoft">{sym}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-dim">{label}</span>
      </div>
      <div className="mt-2 font-mono text-[21px] font-bold leading-none tabular-nums text-ink transition-colors group-hover:text-ambersoft">
        {v == null ? '—' : fmt(v, digits)}
        {v != null && unit ? <span className="text-[15px] text-dim">{unit}</span> : null}
      </div>
    </div>
  );
}

interface ReadoutsProps {
  derived: Derived | null;
  prec: number;
}

export default function Readouts({ derived, prec }: ReadoutsProps) {
  const d = derived;
  const tiles: TileProps[] = [
    { sym: 'S', label: 'площадь', value: d ? d.S : null, prec },
    { sym: 'P', label: 'периметр', value: d ? d.P : null, prec },
    { sym: 'α', label: 'угол', value: d ? d.alpha : null, unit: '°', isAngle: true, prec },
    { sym: 'β', label: 'угол', value: d ? d.beta : null, unit: '°', isAngle: true, prec },
    { sym: 'h', label: 'высота', value: d ? d.h : null, prec },
    { sym: 'r', label: 'впис. окр.', value: d ? d.r : null, prec },
    { sym: 'R', label: 'опис. окр.', value: d ? d.R : null, prec },
  ];
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-line shadow-[0_14px_36px_rgba(3,10,20,0.4)]">
      <div className="grid grid-cols-2 gap-px sm:grid-cols-4 xl:grid-cols-7">
        {tiles.map((t) => (
          <Tile key={t.sym} {...t} />
        ))}
      </div>
    </div>
  );
}
