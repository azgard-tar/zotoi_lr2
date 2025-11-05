// Трикутне нечітке число
export type TriangularNumber = {
  l: number; // lower
  m: number; // middle
  u: number; // upper
};

// 5-компонентне нечітке число
export type Fuzzy5Number = {
  l: number; // min(l)
  lp: number; // geometric_mean(l)
  m: number; // geometric_mean(m)
  up: number; // geometric_mean(u)
  u: number; // max(u)
};

// Лінгвістичний терм
export type LinguisticTerm = {
  name: string;
  shortName: string;
  tri: TriangularNumber;
};

// Структура для збереження всіх результатів
export type CalculationResults = {
  step2_aggregated: string[][];
  step3_criteriaTri: TriangularNumber[][];
  step3_alternativeTri: TriangularNumber[][][];
  step4_criteriaFuzzy: Fuzzy5Number[];
  step4_alternativeFuzzy: Fuzzy5Number[][];
  step5_optimalValues: Fuzzy5Number[];
  step6_normalized: Fuzzy5Number[][];
  step7_weighted: Fuzzy5Number[][];
  step8_overall: Fuzzy5Number[];
  step9_defuzzified: number[];
  step10_utility: number[];
  bestAlternativeIndex: number;
};