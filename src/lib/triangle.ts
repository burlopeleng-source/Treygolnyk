export type SideKey = 'a' | 'b' | 'c';

export type SolveStatus =
  | 'empty'
  | 'need-one'
  | 'ok'
  | 'verify-ok'
  | 'verify-bad'
  | 'invalid';

export interface Derived {
  S: number; // площадь
  P: number; // периметр
  alpha: number; // угол против катета a, градусы
  beta: number; // угол против катета b, градусы
  h: number; // высота к гипотенузе
  r: number; // радиус вписанной окружности
  R: number; // радиус описанной окружности
}

export interface SolveResult {
  status: SolveStatus;
  sides: { a: number; b: number; c: number } | null;
  computed: SideKey | null;
  given: { a: number | null; b: number | null; c: number | null };
  derived: Derived | null;
  message: string;
}

export interface Preset {
  name: string;
  a: string;
  b: string;
}

export interface HistEntry {
  id: number;
  a: number;
  b: number;
  c: number;
  ts: number;
}

/** Разбор значения стороны: null — пусто, 'bad' — некорректно, иначе число. */
export function parseSide(s: string): number | null | 'bad' {
  const t = s.trim().replace(',', '.');
  if (!t) return null;
  if (!/^\d*\.?\d*$/.test(t) || t === '.' ) return 'bad';
  const n = Number(t);
  if (!isFinite(n) || n <= 0) return 'bad';
  return n;
}

export function fmt(n: number, digits: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: digits });
}

/** Компактная запись числа без хвостовых нулей (для журнала). */
export function compact(n: number): string {
  return String(parseFloat(n.toFixed(6)));
}

export function solveTriangle(sa: string, sb: string, sc: string): SolveResult {
  const pa = parseSide(sa);
  const pb = parseSide(sb);
  const pc = parseSide(sc);

  const given = {
    a: typeof pa === 'number' ? pa : null,
    b: typeof pb === 'number' ? pb : null,
    c: typeof pc === 'number' ? pc : null,
  };

  const base: Omit<SolveResult, 'status' | 'message'> = {
    sides: null,
    computed: null,
    given,
    derived: null,
  };

  if (pa === 'bad' || pb === 'bad' || pc === 'bad') {
    return { ...base, status: 'invalid', message: 'Сторона должна быть положительным числом (без букв и знаков).' };
  }

  const filled = ([pa, pb, pc] as const).filter((v): v is number => typeof v === 'number');

  if (filled.length === 0) {
    return { ...base, status: 'empty', message: 'Введите любые две стороны — третью достроит теорема Пифагора.' };
  }
  if (filled.length === 1) {
    return { ...base, status: 'need-one', message: 'Пока мало данных: укажите ещё одну сторону.' };
  }

  const derive = (a: number, b: number, c: number): Derived => ({
    S: (a * b) / 2,
    P: a + b + c,
    alpha: (Math.atan(a / b) * 180) / Math.PI,
    beta: 90 - (Math.atan(a / b) * 180) / Math.PI,
    h: (a * b) / c,
    r: (a + b - c) / 2,
    R: c / 2,
  });

  if (filled.length === 3) {
    const a = given.a as number;
    const b = given.b as number;
    const c = given.c as number;
    const lhs = a * a + b * b;
    const rhs = c * c;
    const ok = Math.abs(lhs - rhs) <= Math.max(1e-6 * Math.max(lhs, rhs), 1e-9);
    if (ok) {
      return {
        ...base,
        status: 'verify-ok',
        sides: { a, b, c },
        derived: derive(a, b, c),
        message: `Проверка пройдена: a² + b² = c² (${fmt(lhs, 4)} = ${fmt(rhs, 4)}) ✓`,
      };
    }
    return {
      ...base,
      status: 'verify-bad',
      sides: { a, b, c },
      message: `Теорема не сходится: a² + b² = ${fmt(lhs, 3)}, а c² = ${fmt(rhs, 3)}. Измените одно из значений.`,
    };
  }

  // ровно две стороны
  const { a, b, c } = given;
  if (a != null && b != null) {
    const cc = Math.hypot(a, b);
    return {
      ...base,
      status: 'ok',
      sides: { a, b, c: cc },
      computed: 'c',
      derived: derive(a, b, cc),
      message: `Гипотенуза: c = √(a² + b²) = √(${fmt(a * a, 4)} + ${fmt(b * b, 4)}) = ${fmt(cc, 6)}`,
    };
  }
  if (a != null && c != null) {
    if (c <= a) {
      return {
        ...base,
        status: 'invalid',
        message: `Гипотенуза обязана быть длиннее катета: c = ${fmt(c, 4)} ≤ a = ${fmt(a, 4)}.`,
      };
    }
    const bb = Math.sqrt(c * c - a * a);
    return {
      ...base,
      status: 'ok',
      sides: { a, b: bb, c },
      computed: 'b',
      derived: derive(a, bb, c),
      message: `Катет: b = √(c² − a²) = √(${fmt(c * c, 4)} − ${fmt(a * a, 4)}) = ${fmt(bb, 6)}`,
    };
  }
  // b и c
  const bb = b as number;
  const cc = c as number;
  if (cc <= bb) {
    return {
      ...base,
      status: 'invalid',
      message: `Гипотенуза обязана быть длиннее катета: c = ${fmt(cc, 4)} ≤ b = ${fmt(bb, 4)}.`,
    };
  }
  const aa = Math.sqrt(cc * cc - bb * bb);
  return {
    ...base,
    status: 'ok',
    sides: { a: aa, b: bb, c: cc },
    computed: 'a',
    derived: derive(aa, bb, cc),
    message: `Катет: a = √(c² − b²) = √(${fmt(cc * cc, 4)} − ${fmt(bb * bb, 4)}) = ${fmt(aa, 6)}`,
  };
}

export const PRESETS: Preset[] = [
  { name: '3 · 4 · 5', a: '3', b: '4' },
  { name: '5 · 12 · 13', a: '5', b: '12' },
  { name: '8 · 15 · 17', a: '8', b: '15' },
  { name: '7 · 24 · 25', a: '7', b: '24' },
  { name: '1 · 1 · √2', a: '1', b: '1' },
];

export function buildReport(res: SolveResult, digits: number): string {
  if (!res.sides || !res.derived) return '';
  const { a, b, c } = res.sides;
  const d = res.derived;
  return [
    'ПРЯМОУГОЛЬНЫЙ ТРЕУГОЛЬНИК · расчёт Пифагор·КБ',
    `a = ${fmt(a, digits)}   b = ${fmt(b, digits)}   c = ${fmt(c, digits)}`,
    `Площадь S = ${fmt(d.S, digits)}`,
    `Периметр P = ${fmt(d.P, digits)}`,
    `Углы: α = ${fmt(d.alpha, 2)}°  β = ${fmt(d.beta, 2)}°`,
    `Высота к гипотенузе h = ${fmt(d.h, digits)}`,
    `Вписанная окружность r = ${fmt(d.r, digits)}`,
    `Описанная окружность R = ${fmt(d.R, digits)}`,
  ].join('\n');
}
