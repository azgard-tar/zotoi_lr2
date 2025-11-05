import type { Fuzzy5Number, TriangularNumber } from "./types";

export const geometricMean = (arr: number[]): number => {
  if (arr.some((n) => n <= 0)) {
    console.warn("Geometric mean is not defined for non-positive numbers. Using 1e-10 instead of 0.");
  }
  const product = arr.reduce((acc, val) => acc * (val > 0 ? val : 1e-10), 1);
  return Math.pow(product, 1 / arr.length);
};

/**
 * Крок 4: Розрахунок 5-компонентного нечіткого числа з масиву трикутних
 */
export const calculateFuzzy5 = (triArr: TriangularNumber[]): Fuzzy5Number => {
  if (triArr.length === 0) {
    return { l: 0, lp: 0, m: 0, up: 0, u: 0 };
  }

  const ls = triArr.map((t) => t.l);
  const ms = triArr.map((t) => t.m);
  const us = triArr.map((t) => t.u);

  const l = Math.min(...ls);
  const lp = geometricMean(ls);
  const m = geometricMean(ms);
  const up = geometricMean(us);
  const u = Math.max(...us);

  return { l, lp, m, up, u };
};

/**
 * Додавання двох 5-компонентних нечітких чисел (для Кроку 8)
 */
export const fuzzyAdd = (f1: Fuzzy5Number, f2: Fuzzy5Number): Fuzzy5Number => ({
  l: f1.l + f2.l,
  lp: f1.lp + f2.lp,
  m: f1.m + f2.m,
  up: f1.up + f2.up,
  u: f1.u + f2.u,
});

/**
 * Множення двох 5-компонентних нечітких чисел (для Кроку 7)
 */
export const fuzzyMultiply = (f1: Fuzzy5Number, f2: Fuzzy5Number): Fuzzy5Number => ({
  l: f1.l * f2.l,
  lp: f1.lp * f2.lp,
  m: f1.m * f2.m,
  up: f1.up * f2.up,
  u: f1.u * f2.u,
});

/**
 * Крок 9: Дефазифікація 5-компонентного нечіткого числа
 */
export const defuzzify = (f: Fuzzy5Number): number => {
  return (f.l + f.lp + f.m + f.up + f.u) / 5;
};

/**
 * Ініціалізація 2D-масиву
 */
export function create2DArray<T>(rows: number, cols: number, fill: T): T[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

/**
 * Ініціалізація 3D-масиву
 */
export function create3DArray<T>(
  d1: number,
  d2: number,
  d3: number,
  fill: T
): T[][][] {
  return Array.from({ length: d1 }, () => create2DArray(d2, d3, fill));
}

/**
 * Функція для зміни розміру масиву назв
 */
export const resizeLabels = (
  prevLabels: string[],
  newCount: number,
  prefix: string
): string[] => {
  const newLabels = Array.from({ length: newCount }, (_, i) =>
    prevLabels[i] !== undefined ? prevLabels[i] : `${prefix} ${i + 1}`
  );
  return newLabels;
};

/**
 * Функція для зміни розміру 2D-масиву
 */
export const resize2DArray = <T,>(
  prevArray: T[][],
  newRows: number,
  newCols: number,
  fill: T
): T[][] => {
  const newArray = create2DArray(newRows, newCols, fill);
  const rowsToCopy = Math.min(newRows, prevArray.length);
  const colsToCopy = Math.min(newCols, prevArray[0]?.length || 0);
  for (let r = 0; r < rowsToCopy; r++) {
    for (let c = 0; c < colsToCopy; c++) {
      newArray[r][c] = prevArray[r][c];
    }
  }
  return newArray;
};

/**
 * "Розумна" функція для зміни розміру 3D-масиву
 */
export const resize3DArray = <T,>(
  prevArray: T[][][],
  d1: number,
  d2: number,
  d3: number,
  fill: T
): T[][][] => {
  const newArray = create3DArray(d1, d2, d3, fill);
  const d1ToCopy = Math.min(d1, prevArray.length);
  const d2ToCopy = Math.min(d2, prevArray[0]?.length || 0);
  const d3ToCopy = Math.min(d3, prevArray[0]?.[0]?.length || 0);
  for (let i = 0; i < d1ToCopy; i++) {
    for (let j = 0; j < d2ToCopy; j++) {
      for (let k = 0; k < d3ToCopy; k++) {
        newArray[i][j][k] = prevArray[i][j][k];
      }
    }
  }
  return newArray;
};