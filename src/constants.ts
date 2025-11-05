import type { LinguisticTerm } from "./types";

export const CRITERIA_TERMS: LinguisticTerm[] = [
  { name: "Very low (VL)", shortName: "VL", tri: { l: 0.0, m: 0.0, u: 0.1 } },
  { name: "Low (L)", shortName: "L", tri: { l: 0.0, m: 0.1, u: 0.3 } },
  {
    name: "Medium low (ML)",
    shortName: "ML",
    tri: { l: 0.1, m: 0.3, u: 0.5 },
  },
  { name: "Medium (M)", shortName: "M", tri: { l: 0.3, m: 0.5, u: 0.7 } },
  {
    name: "Medium high (MH)",
    shortName: "MH",
    tri: { l: 0.5, m: 0.7, u: 0.9 },
  },
  { name: "High (H)", shortName: "H", tri: { l: 0.7, m: 0.7, u: 1.0 } },
  { name: "Very high (VH)", shortName: "VH", tri: { l: 0.9, m: 1.0, u: 1.0 } },
];

export const ALTERNATIVE_TERMS: LinguisticTerm[] = [
  { name: "Very poor (VP)", shortName: "VP", tri: { l: 0.0, m: 0.0, u: 0.1 } },
  { name: "Poor (P)", shortName: "P", tri: { l: 0.0, m: 0.1, u: 0.3 } },
  {
    name: "Medium poor (MP)",
    shortName: "MP",
    tri: { l: 0.1, m: 0.3, u: 0.5 },
  },
  { name: "Fair (F)", shortName: "F", tri: { l: 0.3, m: 0.5, u: 0.7 } },
  {
    name: "Medium good (MG)",
    shortName: "MG",
    tri: { l: 0.5, m: 0.7, u: 0.9 },
  },
  { name: "Good (G)", shortName: "G", tri: { l: 0.7, m: 0.7, u: 1.0 } },
  { name: "Very good (VG)", shortName: "VG", tri: { l: 0.9, m: 1.0, u: 1.0 } },
];

// Словники для швидкого пошуку
export const CRITERIA_MAP = new Map(
  CRITERIA_TERMS.map((t) => [t.shortName, t.tri])
);
export const ALTERNATIVE_MAP = new Map(
  ALTERNATIVE_TERMS.map((t) => [t.shortName, t.tri])
);
