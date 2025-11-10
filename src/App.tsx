import React, { useState, useMemo, useEffect } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"; // NEW
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"; // NEW

// ... (Theme definition remains the same) ...
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    success: {
      light: "#e8f5e9",
      main: "#4caf50",
      dark: "#388e3c",
    },
    error: {
      main: "#f44336",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h4: {
      fontWeight: 700,
      margin: "16px 0",
    },
    h5: {
      fontWeight: 600,
      marginBottom: "12px",
    },
    // NEW for smaller labels
    caption: {
      fontWeight: 500,
      color: "#555",
      marginBottom: "4px",
      display: "block",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#fff", // NEW: Match screenshot
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          // NEW: Style for standard variant
          "&.MuiInput-underline:before": {
            borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
          },
          "&.MuiInput-underline:hover:not(.Mui-disabled):before": {
            borderBottom: "2px solid rgba(0, 0, 0, 0.87)",
          },
          "&.MuiInput-underline.Mui-focused:after": {
            borderBottom: "2px solid #1976d2",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
        // NEW: Outlined variant for setup panels
        outlined: {
          border: "1px solid #e0e0e0",
          boxShadow: "none",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          backgroundColor: "#f4f6f8",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
  },
});

// --- Типи ---
type TriangularNumber = { l: number; m: number; u: number };
type Fuzzy5 = {
  l: number;
  lPrime: number;
  m: number;
  uPrime: number;
  u: number;
};
type LinguisticTerm = {
  shortName: string;
  fullName: string;
  value: TriangularNumber;
};
// --- UPDATED TYPE ---
type CriterionType = boolean; // true = benefit, false = cost

// --- Константи (За замовчуванням) ---
const DEFAULT_CRITERIA_LINGUISTIC_TERMS: LinguisticTerm[] = [
  {
    shortName: "VL",
    fullName: "Very low (VL)",
    value: { l: 0.0, m: 0.0, u: 0.1 },
  },
  {
    shortName: "L",
    fullName: "Low (L)",
    value: { l: 0.0, m: 0.1, u: 0.3 },
  },
  {
    shortName: "ML",
    fullName: "Medium low (ML)",
    value: { l: 0.1, m: 0.3, u: 0.5 },
  },
  {
    shortName: "M",
    fullName: "Medium (M)",
    value: { l: 0.3, m: 0.5, u: 0.7 },
  },
  {
    shortName: "MH",
    fullName: "Medium high (MH)",
    value: { l: 0.5, m: 0.7, u: 0.9 },
  },
  {
    shortName: "H",
    fullName: "High (H)",
    value: { l: 0.7, m: 0.7, u: 1.0 }, // Повернено згідно ПР
  },
  {
    shortName: "VH",
    fullName: "Very high (VH)",
    value: { l: 0.9, m: 1.0, u: 1.0 },
  },
];

const DEFAULT_ALTERNATIVE_LINGUISTIC_TERMS: LinguisticTerm[] = [
  {
    shortName: "VP",
    fullName: "Very poor (VP)",
    value: { l: 0.0, m: 0.0, u: 0.1 },
  },
  {
    shortName: "P",
    fullName: "Poor (P)",
    value: { l: 0.0, m: 0.1, u: 0.3 },
  },
  {
    shortName: "MP",
    fullName: "Medium poor (MP)",
    value: { l: 0.1, m: 0.3, u: 0.5 },
  },
  {
    shortName: "F",
    fullName: "Fair (F)",
    value: { l: 0.3, m: 0.5, u: 0.7 },
  },
  {
    shortName: "MG",
    fullName: "Medium good (MG)",
    value: { l: 0.5, m: 0.7, u: 0.9 },
  },
  {
    shortName: "G",
    fullName: "Good (G)",
    value: { l: 0.7, m: 0.7, u: 1.0 }, // Повернено згідно ПР
  },
  {
    shortName: "VG",
    fullName: "Very good (VG)",
    value: { l: 0.9, m: 1.0, u: 1.0 },
  },
];

// --- NEW: Короткі назви для хедера результатів ---
const tabHeaderLabels = [
  "Крок 2",
  "Крок 3",
  "Крок 4",
  "Крок 5",
  "Крок 6",
  "Крок 7",
  "Крок 8",
  "Крок 9",
  "Крок 10",
];

// --- Допоміжні функції ---
const geometricMean = (arr: number[]): number => {
  if (arr.some((n) => n <= 0)) {
    // Геометричне середнє не визначено для нульових або від'ємних значень
    // У нашому контексті (0.0...1.0) 0 означає 0
    return 0;
  }
  return Math.pow(
    arr.reduce((acc, val) => acc * val, 1),
    1 / arr.length
  );
};

const calculateFuzzy5 = (triNumbers: TriangularNumber[]): Fuzzy5 => {
  const l_values = triNumbers.map((t) => t.l);
  const m_values = triNumbers.map((t) => t.m);
  const u_values = triNumbers.map((t) => t.u);

  const l = Math.min(...l_values);
  const lPrime = geometricMean(l_values);
  const m = geometricMean(m_values);
  const uPrime = geometricMean(u_values);
  const u = Math.max(...u_values);

  return { l, lPrime, m, uPrime, u };
};

const create2DArray = <T,>(rows: number, cols: number, fill: T): T[][] => {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
};

const create3DArray = <T,>(
  dim1: number,
  dim2: number,
  dim3: number,
  fill: T
): T[][][] => {
  return Array.from({ length: dim1 }, () => create2DArray(dim2, dim3, fill));
};

const resizeLabels = (
  prevLabels: string[],
  newSize: number,
  prefix: string
): string[] => {
  const newLabels = new Array(newSize)
    .fill(0)
    .map((_, i) => `${prefix} ${i + 1}`);
  prevLabels.forEach((label, i) => {
    if (i < newSize) {
      newLabels[i] = label;
    }
  });
  return newLabels;
};

// <T,> - це підказка для TSX, що це generic, а не JSX-тег
const resize2DArray = <T,>(
  prevArray: T[][],
  newRows: number,
  newCols: number,
  fill: T
): T[][] => {
  const newArray = create2DArray(newRows, newCols, fill);
  const rowsToCopy = Math.min(prevArray.length, newRows);
  const colsToCopy = Math.min(prevArray[0]?.length || 0, newCols);
  for (let i = 0; i < rowsToCopy; i++) {
    for (let j = 0; j < colsToCopy; j++) {
      newArray[i][j] = prevArray[i][j];
    }
  }
  return newArray;
};

const resize3DArray = <T,>(
  prevArray: T[][][],
  dim1: number,
  dim2: number,
  dim3: number,
  fill: T
): T[][][] => {
  const newArray = create3DArray(dim1, dim2, dim3, fill);
  const dim1ToCopy = Math.min(prevArray.length, dim1);
  const dim2ToCopy = Math.min(prevArray[0]?.length || 0, dim2);
  const dim3ToCopy = Math.min(prevArray[0]?.[0]?.length || 0, dim3);

  for (let i = 0; i < dim1ToCopy; i++) {
    for (let j = 0; j < dim2ToCopy; j++) {
      for (let k = 0; k < dim3ToCopy; k++) {
        newArray[i][j][k] = prevArray[i][j][k];
      }
    }
  }
  return newArray;
};

const formatFuzzy5 = (f: Fuzzy5) => {
  if (!f || Object.values(f).some(isNaN)) {
    return "[...]";
  }
  return `[${f.l.toFixed(3)}; ${f.lPrime.toFixed(3)}; ${f.m.toFixed(3)}; ${f.uPrime.toFixed(3)}; ${f.u.toFixed(3)}]`;
};

// --- Компонент вкладки (TabPanel) ---
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// --- NEW: Компонент редактора термів ---
interface LinguisticTermEditorProps {
  open: boolean;
  onClose: () => void;
  terms: LinguisticTerm[];
  setTerms: React.Dispatch<React.SetStateAction<LinguisticTerm[]>>;
  title: string;
}

function LinguisticTermEditor({
  open,
  onClose,
  terms,
  setTerms,
  title,
}: LinguisticTermEditorProps) {
  const [localTerms, setLocalTerms] = useState<LinguisticTerm[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({}); // { "0-l": "Error message" }

  useEffect(() => {
    if (open) {
      setLocalTerms(JSON.parse(JSON.stringify(terms))); // Deep copy
      setErrors({});
    }
  }, [open, terms]);

  const validateTerms = (currentTerms: LinguisticTerm[]) => {
    const newErrors: Record<string, string> = {};
    const shortNames = new Set<string>();

    if (currentTerms.length < 2) {
      newErrors["global"] = "Має бути принаймні 2 лінгвістичні терми.";
    }

    currentTerms.forEach((term, index) => {
      const { l, m, u } = term.value;
      const l_num = Number(l);
      const m_num = Number(m);
      const u_num = Number(u);

      if (term.shortName.trim() === "") {
        newErrors[`${index}-shortName`] = "Обов'язково";
      } else if (shortNames.has(term.shortName.trim())) {
        newErrors[`${index}-shortName`] = "Дублікат";
      }
      shortNames.add(term.shortName.trim());

      if (term.fullName.trim() === "") {
        newErrors[`${index}-fullName`] = "Обов'язково";
      }
      if (isNaN(l_num)) newErrors[`${index}-l`] = "Число?";
      if (isNaN(m_num)) newErrors[`${index}-m`] = "Число?";
      if (isNaN(u_num)) newErrors[`${index}-u`] = "Число?";

      if (l_num > m_num) newErrors[`${index}-l`] = "l ≤ m";
      if (m_num > u_num) newErrors[`${index}-m`] = "m ≤ u";
      if (l_num === u_num) newErrors[`${index}-u`] = "l має бути != u";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  useEffect(() => {
    validateTerms(localTerms);
  }, [localTerms]);

  const handleTermChange = (
    index: number,
    field: keyof LinguisticTerm | "l" | "m" | "u",
    value: string | number
  ) => {
    const newTerms = [...localTerms];
    const term = newTerms[index];
    if (!term) return;

    if (field === "l" || field === "m" || field === "u") {
      term.value[field] = value as number;
    } else {
      (term[field] as string) = value as string;
    }
    setLocalTerms(newTerms);
  };

  const handleAddTerm = () => {
    setLocalTerms([
      ...localTerms,
      {
        shortName: "New",
        fullName: "New Term",
        value: { l: 0, m: 0.5, u: 1 },
      },
    ]);
  };

  const handleDeleteTerm = (index: number) => {
    if (localTerms.length <= 2) {
      setErrors({ global: "Має бути принаймні 2 лінгвістичні терми." });
      return;
    }
    setLocalTerms(localTerms.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (validateTerms(localTerms)) return; // Don't save if errors exist

    // Нормалізація
    let maxVal = 1.0;
    localTerms.forEach((t) => {
      maxVal = Math.max(maxVal, t.value.l, t.value.m, t.value.u);
    });

    let normalizedTerms = localTerms;
    if (maxVal > 1) {
      normalizedTerms = localTerms.map((t) => ({
        ...t,
        value: {
          l: t.value.l / maxVal,
          m: t.value.m / maxVal,
          u: t.value.u / maxVal,
        },
      }));
    }

    setTerms(normalizedTerms);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Коротка назва</TableCell>
                <TableCell>Повна назва</TableCell>
                <TableCell>L (Нижня)</TableCell>
                <TableCell>M (Середня)</TableCell>
                <TableCell>U (Верхня)</TableCell>
                <TableCell>Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {localTerms.map((term, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      value={term.shortName}
                      onChange={(e) =>
                        handleTermChange(index, "shortName", e.target.value)
                      }
                      size="small"
                      variant="outlined"
                      error={!!errors[`${index}-shortName`]}
                      helperText={errors[`${index}-shortName`]}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={term.fullName}
                      onChange={(e) =>
                        handleTermChange(index, "fullName", e.target.value)
                      }
                      size="small"
                      variant="outlined"
                      error={!!errors[`${index}-fullName`]}
                      helperText={errors[`${index}-fullName`]}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={term.value.l}
                      onChange={(e) =>
                        handleTermChange(index, "l", parseFloat(e.target.value))
                      }
                      size="small"
                      variant="outlined"
                      error={!!errors[`${index}-l`]}
                      helperText={errors[`${index}-l`]}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={term.value.m}
                      onChange={(e) =>
                        handleTermChange(index, "m", parseFloat(e.target.value))
                      }
                      size="small"
                      variant="outlined"
                      error={!!errors[`${index}-m`]}
                      helperText={errors[`${index}-m`]}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={term.value.u}
                      onChange={(e) =>
                        handleTermChange(index, "u", parseFloat(e.target.value))
                      }
                      size="small"
                      variant="outlined"
                      error={!!errors[`${index}-u`]}
                      helperText={errors[`${index}-u`]}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Видалити">
                      <span>
                        <IconButton
                          onClick={() => handleDeleteTerm(index)}
                          disabled={localTerms.length <= 2}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          startIcon={<AddCircleIcon />}
          onClick={handleAddTerm}
          sx={{ mt: 2 }}
        >
          Додати терм
        </Button>
        {errors["global"] && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errors["global"]}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={Object.keys(errors).length > 0}
        >
          Зберегти та закрити
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Головний компонент ---
function App() {
  // --- Стани ---
  const [page, setPage] = useState<"setup" | "results">("setup");
  const [tabIndex, setTabIndex] = useState(0);

  // Налаштування кількостей
  const [numAlternatives, setNumAlternatives] = useState(4);
  const [numCriteria, setNumCriteria] = useState(5);
  const [numExperts, setNumExperts] = useState(4);

  // Налаштування назв
  const [alternativeLabels, setAlternativeLabels] = useState<string[]>([]);
  const [criteriaLabels, setCriteriaLabels] = useState<string[]>([]);
  const [expertLabels, setExpertLabels] = useState<string[]>([]);

  // --- UPDATED STATE for Benefit/Cost ---
  const [criteriaTypes, setCriteriaTypes] = useState<CriterionType[]>([]);

  // --- NEW: Лінгвістичні терми у стані ---
  const [criteriaTerms, setCriteriaTerms] = useState<LinguisticTerm[]>(
    DEFAULT_CRITERIA_LINGUISTIC_TERMS
  );
  const [alternativeTerms, setAlternativeTerms] = useState<LinguisticTerm[]>(
    DEFAULT_ALTERNATIVE_LINGUISTIC_TERMS
  );
  const [editorOpen, setEditorOpen] = useState<"criteria" | "alternative" | null>(
    null
  );

  // Налаштування введених даних
  const [criteriaInputs, setCriteriaInputs] = useState<string[][]>([]);
  const [alternativeInputs, setAlternativeInputs] = useState<string[][][]>([]);

  // --- Ефекти для оновлення станів при зміні кількостей ---
  useEffect(() => {
    setAlternativeLabels((prev) =>
      resizeLabels(prev, numAlternatives, "Альтернатива")
    );
  }, [numAlternatives]);

  useEffect(() => {
    setCriteriaLabels((prev) =>
      resizeLabels(prev, numCriteria, "Критерій")
    );
    // --- UPDATED LOGIC for criteriaTypes ---
    setCriteriaTypes((prevTypes) => {
      const newTypes = new Array(numCriteria).fill(true) as CriterionType[]; // true = benefit
      for (let i = 0; i < Math.min(prevTypes.length, numCriteria); i++) {
        newTypes[i] = prevTypes[i];
      }
      return newTypes;
    });
  }, [numCriteria]);

  useEffect(() => {
    setExpertLabels((prev) => resizeLabels(prev, numExperts, "Експерт"));
  }, [numExperts]);

  // Оновлення матриць вводу
  useEffect(() => {
    setCriteriaInputs((prev) =>
      resize2DArray(prev, numExperts, numCriteria, "M")
    );
  }, [numExperts, numCriteria]);

  useEffect(() => {
    setAlternativeInputs((prev) =>
      resize3DArray(prev, numExperts, numAlternatives, numCriteria, "G")
    );
  }, [numExperts, numAlternatives, numCriteria]);

  // --- Скидання термів, якщо видалили кастомні ---
  useEffect(() => {
    // Перевіряємо, чи поточні обрані значення існують у новому списку термів
    const validShortNames = new Set(criteriaTerms.map((t) => t.shortName));
    const defaultTerm = criteriaTerms[0]?.shortName ?? "M";
    setCriteriaInputs((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          validShortNames.has(cell) ? cell : defaultTerm
        )
      )
    );
  }, [criteriaTerms]);

  useEffect(() => {
    const validShortNames = new Set(alternativeTerms.map((t) => t.shortName));
    const defaultTerm = alternativeTerms[0]?.shortName ?? "G";
    setAlternativeInputs((prev) =>
      prev.map((expert) =>
        expert.map((alt) =>
          alt.map((cell) =>
            validShortNames.has(cell) ? cell : defaultTerm
          )
        )
      )
    );
  }, [alternativeTerms]);

  const handleCountChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setter(1);
    } else {
      setter(num);
    }
  };

  const handleLabelChange = (
    newLabel: string,
    index: number,
    type: "alternative" | "criteria" | "expert"
  ) => {
    const setter =
      type === "alternative"
        ? setAlternativeLabels
        : type === "criteria"
          ? setCriteriaLabels
          : setExpertLabels;
    setter((prev) => prev.map((l, i) => (i === index ? newLabel : l)));
  };

  // --- UPDATED HANDLER for criteria type change ---
  const handleCriteriaTypeChange = (isBenefit: boolean, index: number) => {
    setCriteriaTypes((prev) =>
      prev.map((t, i) => (i === index ? isBenefit : t))
    );
  };

  const handleCriteriaChange = (
    e: SelectChangeEvent<string>,
    expertIndex: number,
    criteriaIndex: number
  ) => {
    const newValue = e.target.value;
    setCriteriaInputs((prev) =>
      prev.map((row, eIdx) =>
        eIdx !== expertIndex
          ? row
          : row.map((cell, cIdx) =>
              cIdx !== criteriaIndex ? cell : newValue
            )
      )
    );
  };

  const handleAlternativeChange = (
    e: SelectChangeEvent<string>,
    expertIndex: number,
    altIndex: number,
    criteriaIndex: number
  ) => {
    const newValue = e.target.value;
    setAlternativeInputs((prev) =>
      prev.map((expertData, eIdx) =>
        eIdx !== expertIndex
          ? expertData
          : expertData.map((altRow, aIdx) =>
              aIdx !== altIndex
                ? altRow
                : altRow.map((cell, cIdx) =>
                    cIdx !== criteriaIndex ? cell : newValue
                  )
            )
      )
    );
  };

  const resetInputs = () => {
    // Скидаємо до значень за замовчуванням
    setCriteriaTerms(DEFAULT_CRITERIA_LINGUISTIC_TERMS);
    setAlternativeTerms(DEFAULT_ALTERNATIVE_LINGUISTIC_TERMS);

    setCriteriaInputs(create2DArray(numExperts, numCriteria, "M"));
    setAlternativeInputs(
      create3DArray(numExperts, numAlternatives, numCriteria, "G")
    );
    setAlternativeLabels(resizeLabels([], numAlternatives, "Альтернатива"));
    setCriteriaLabels(resizeLabels([], numCriteria, "Критерій"));
    setExpertLabels(resizeLabels([], numExperts, "Експерт"));
    setCriteriaTypes(new Array(numCriteria).fill(true)); // true = benefit
  };

  // --- Сторінка "Налаштування": UI (REVERTED TO TABLE) ---

  const criteriaInputTable = useMemo(
    () => (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">Важливість критеріїв (Оцінки експертів)</Typography>
          <Button
            variant="text"
            startIcon={<EditIcon />}
            onClick={() => setEditorOpen("criteria")}
            size="small"
          >
            Редагувати терми
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              {/* Рядок для назв критеріїв */}
              <TableRow>
                <TableCell sx={{ width: "250px" }}>Експерт</TableCell>
                {criteriaLabels.map((label, cIdx) => (
                  <TableCell key={cIdx} align="center" sx={{ minWidth: 100 }}>
                    <TextField
                      value={label}
                      onChange={(e) =>
                        handleLabelChange(e.target.value, cIdx, "criteria")
                      }
                      size="small"
                      variant="standard"
                      sx={{ m: 0, p: 0 }}
                    />
                  </TableCell>
                ))}
              </TableRow>
              {/* --- UPDATED ROW for Benefit/Cost --- */}
              <TableRow>
                <TableCell sx={{ width: "250px", pt: 0, pb: 2, border: 0, verticalAlign: 'top' }}>
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Тип критерію:
                  </Typography>
                </TableCell>
                {criteriaTypes.map((isBenefit, cIdx) => (
                  <TableCell key={cIdx} align="center" sx={{ pt: 1, pb: 2, border: 0 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isBenefit}
                          onChange={(e) =>
                            handleCriteriaTypeChange(e.target.checked, cIdx)
                          }
                          size="small"
                        />
                      }
                      label="Benefit"
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {expertLabels.map((label, eIdx) => (
                <TableRow key={eIdx}>
                  <TableCell sx={{ width: "250px" }}>
                    <TextField
                      value={label}
                      onChange={(e) =>
                        handleLabelChange(e.target.value, eIdx, "expert")
                      }
                      size="small"
                      variant="standard"
                      sx={{ m: 0, p: 0, width: "100%" }}
                    />
                  </TableCell>
                  {criteriaInputs[eIdx]?.map((value, cIdx) => (
                    <TableCell key={cIdx} align="center">
                      <Select
                        value={value}
                        onChange={(e) => handleCriteriaChange(e, eIdx, cIdx)}
                        fullWidth
                        size="small"
                        renderValue={(selected) =>
                          criteriaTerms.find((t) => t.shortName === selected) // UPDATED
                            ?.shortName ?? ""
                        }
                      >
                        {criteriaTerms.map((term) => ( // UPDATED
                          <MenuItem
                            key={term.shortName}
                            value={term.shortName}
                          >
                            {term.fullName}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    ),
    [
      criteriaInputs,
      criteriaLabels,
      expertLabels,
      criteriaTypes,
      criteriaTerms, // NEW
      handleLabelChange,
      handleCriteriaChange,
      handleCriteriaTypeChange,
    ]
  );

  const alternativeInputTables = useMemo(
    () => (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 4 }}>
          <Typography variant="h5">Оцінки експертів</Typography>
          <Button
            variant="text"
            startIcon={<EditIcon />}
            onClick={() => setEditorOpen("alternative")}
            size="small"
          >
            Редагувати терми
          </Button>
        </Box>
        {expertLabels.map((expertLabel, eIdx) => (
          <Paper key={eIdx} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Оцінки експерта: {expertLabel}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "250px" }}>Альтернатива</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell
                        key={cIdx}
                        align="center"
                        sx={{ minWidth: 100 }}
                      >
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alternativeLabels.map((label, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell sx={{ width: "250px" }}>
                        <TextField
                          value={label}
                          onChange={(e) =>
                            handleLabelChange(
                              e.target.value,
                              aIdx,
                              "alternative"
                            )
                          }
                          size="small"
                          variant="standard"
                          sx={{ m: 0, p: 0, width: "100%" }}
                        />
                      </TableCell>
                      {alternativeInputs[eIdx]?.[aIdx]?.map((value, cIdx) => (
                        <TableCell key={cIdx} align="center">
                          <Select
                            value={value}
                            onChange={(e) =>
                              handleAlternativeChange(e, eIdx, aIdx, cIdx)
                            }
                            fullWidth
                            size="small"
                            renderValue={(selected) =>
                              alternativeTerms.find( // UPDATED
                                (t) => t.shortName === selected
                              )?.shortName ?? ""
                            }
                          >
                            {alternativeTerms.map((term) => ( // UPDATED
                              <MenuItem
                                key={term.shortName}
                                value={term.shortName}
                              >
                                {term.fullName}
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))}
      </>
    ),
    [
      alternativeInputs,
      alternativeLabels,
      criteriaLabels,
      expertLabels,
      alternativeTerms, // NEW
      handleLabelChange,
      handleAlternativeChange,
    ]
  );

  // --- Логіка розрахунків ---
  const calculationResults = useMemo(() => {
    // NEW: Створюємо карти для швидкого пошуку всередині useMemo
    const criteriaTermMap = new Map(
      criteriaTerms.map((t) => [t.shortName, t.value])
    );
    const alternativeTermMap = new Map(
      alternativeTerms.map((t) => [t.shortName, t.value])
    );

    const getTerm = (
      name: string,
      type: "criteria" | "alternative"
    ): TriangularNumber => {
      const map = type === "criteria" ? criteriaTermMap : alternativeTermMap;
      return map.get(name) ?? { l: 0, m: 0, u: 0 };
    };

    // Перевірка, чи готові дані
    if (
      criteriaInputs.length === 0 ||
      alternativeInputs.length === 0 ||
      criteriaTypes.length === 0 ||
      criteriaInputs[0].length === 0 || // Fix for initial render
      alternativeInputs[0]?.[0]?.length === 0
    ) {
      return {
        step1_criteriaTri: [],
        step1_alternativeTri: [],
        step2_criteriaMatrix: [],
        step3_altMatrices: [],
        step4_optimalMatrix: [],
        step6_normalizedMatrix: [],
        step7_weightedMatrix: [],
        step8_sumMatrix: [],
        step9_defuzzify: [],
        step10_utility: [],
        bestAlternativeIndex: -1,
      };
    }

    // Крок 1: Отримати трикутні числа з введених даних
    const step1_criteriaTri: TriangularNumber[][] = criteriaInputs.map((row) =>
      row.map((shortName) => getTerm(shortName, "criteria")) // UPDATED
    );
    const step1_alternativeTri: TriangularNumber[][][] = alternativeInputs.map(
      (expert) =>
        expert.map((alt) =>
          alt.map((shortName) => getTerm(shortName, "alternative")) // UPDATED
        )
    );

    // Крок 2: Агрегація експертних оцінок (Fuzzy 5)
    // Матриця [Критерії x Fuzzy5]
    const step2_criteriaMatrix: Fuzzy5[] = [];
    for (let j = 0; j < numCriteria; j++) {
      const expertOpinionsForCriterion: TriangularNumber[] = [];
      for (let i = 0; i < numExperts; i++) {
        expertOpinionsForCriterion.push(step1_criteriaTri[i][j]);
      }
      step2_criteriaMatrix.push(calculateFuzzy5(expertOpinionsForCriterion));
    }

    // Матриця [Альтернативи x Критерії x Fuzzy5]
    const step3_altMatrices: Fuzzy5[][] = [];
    for (let i = 0; i < numAlternatives; i++) {
      const altRow: Fuzzy5[] = [];
      for (let j = 0; j < numCriteria; j++) {
        const expertOpinionsForAltCriterion: TriangularNumber[] = [];
        for (let k = 0; k < numExperts; k++) {
          expertOpinionsForAltCriterion.push(step1_alternativeTri[k][i][j]);
        }
        altRow.push(calculateFuzzy5(expertOpinionsForAltCriterion));
      }
      step3_altMatrices.push(altRow);
    }
    // (step3_altMatrices - це "Матриця нечітких чисел" з Рис. 6)
    // (step2_criteriaMatrix - це "Матриця нечітких чисел по критеріям" з Рис. 5)

    // Крок 4: Знаходження матриці оптимальних значень (Рис. 7)
    // --- UPDATED LOGIC for Benefit/Cost ---
    const step4_optimalMatrix = ((): Fuzzy5[] => {
      const optimalMatrix: Fuzzy5[] = [];
      for (let j = 0; j < numCriteria; j++) {
        const isBenefit = criteriaTypes[j]; // UPDATED (true/false)
        const allValues_l: number[] = [];
        const allValues_lPrime: number[] = [];
        const allValues_m: number[] = [];
        const allValues_uPrime: number[] = [];
        const allValues_u: number[] = [];

        for (let i = 0; i < numAlternatives; i++) {
          allValues_l.push(step3_altMatrices[i][j].l);
          allValues_lPrime.push(step3_altMatrices[i][j].lPrime);
          allValues_m.push(step3_altMatrices[i][j].m);
          allValues_uPrime.push(step3_altMatrices[i][j].uPrime);
          allValues_u.push(step3_altMatrices[i][j].u);
        }

        // Логіка з документа
        if (isBenefit) {
          optimalMatrix.push({
            l: Math.max(...allValues_l),
            lPrime: Math.max(...allValues_lPrime),
            m: Math.max(...allValues_m),
            uPrime: Math.max(...allValues_uPrime),
            u: Math.max(...allValues_u),
          });
        } else {
          // Cost
          optimalMatrix.push({
            l: Math.min(...allValues_l),
            lPrime: Math.min(...allValues_lPrime),
            m: Math.min(...allValues_m),
            uPrime: Math.min(...allValues_uPrime),
            u: Math.min(...allValues_u),
          });
        }
      }
      return optimalMatrix;
    })(); // Додано criteriaTypes

    // Крок 5: Це власне крок 2 (Матриця нечітких чисел по критеріям)
    const step5_criteriaMatrix = step2_criteriaMatrix;

    // Крок 6: Нормування (Рис. 8)
    // --- UPDATED LOGIC for Benefit/Cost ---
    const step6_normalizedMatrix = ((): Fuzzy5[][] => {
      // (m+1) x n матриця: [0] = Оптимальна, [1..m] = Альтернативи
      const combinedMatrix = [step4_optimalMatrix, ...step3_altMatrices];

      const cj_plus: number[] = new Array(numCriteria).fill(0);
      const aj_minus: number[] = new Array(numCriteria).fill(0);

      // Попередній розрахунок сум
      for (let j = 0; j < numCriteria; j++) {
        if (criteriaTypes[j]) { // UPDATED (true = benefit)
          for (let i = 0; i < combinedMatrix.length; i++) {
            cj_plus[j] += combinedMatrix[i][j].u;
          }
        } else {
          // cost
          for (let i = 0; i < combinedMatrix.length; i++) {
            // aj- = sum(1/l)
            aj_minus[j] +=
              combinedMatrix[i][j].l === 0
                ? Infinity // Уникаємо ділення на нуль
                : 1 / combinedMatrix[i][j].l;
          }
        }
      }

      const normalizedMatrix: Fuzzy5[][] = [];
      // Нормалізуємо тільки альтернативи (i = 1 to m)
      for (let i = 0; i < numAlternatives; i++) {
        const row: Fuzzy5[] = [];
        const x_ij = step3_altMatrices[i]; // x_ij це i-й рядок
        for (let j = 0; j < numCriteria; j++) {
          const x_ij_j = x_ij[j]; // Конкретне нечітке число
          if (criteriaTypes[j]) { // UPDATED (true = benefit)
            const c_plus = cj_plus[j];
            if (c_plus === 0) {
              row.push({ l: 0, lPrime: 0, m: 0, uPrime: 0, u: 0 });
              continue;
            }
            row.push({
              l: x_ij_j.l / c_plus,
              lPrime: x_ij_j.lPrime / c_plus,
              m: x_ij_j.m / c_plus,
              uPrime: x_ij_j.uPrime / c_plus,
              u: x_ij_j.u / c_plus,
            });
          } else {
            // cost
            const a_minus = aj_minus[j];
            if (a_minus === 0 || !isFinite(a_minus)) {
              row.push({ l: 0, lPrime: 0, m: 0, uPrime: 0, u: 0 });
              continue;
            }
            // Інвертуємо нечітке число: (1/u, 1/uPrime, 1/m, 1/lPrime, 1/l)
            const inv_l = x_ij_j.u === 0 ? Infinity : 1 / x_ij_j.u;
            const inv_lPrime =
              x_ij_j.uPrime === 0 ? Infinity : 1 / x_ij_j.uPrime;
            const inv_m = x_ij_j.m === 0 ? Infinity : 1 / x_ij_j.m;
            const inv_uPrime =
              x_ij_j.lPrime === 0 ? Infinity : 1 / x_ij_j.lPrime;
            const inv_u = x_ij_j.l === 0 ? Infinity : 1 / x_ij_j.l;

            row.push({
              l: inv_l / a_minus,
              lPrime: inv_lPrime / a_minus,
              m: inv_m / a_minus,
              uPrime: inv_uPrime / a_minus,
              u: inv_u / a_minus,
            });
          }
        }
        normalizedMatrix.push(row);
      }

      // Також нормалізуємо ОПТИМАЛЬНИЙ рядок
      const normalizedOptimalRow: Fuzzy5[] = [];
      for (let j = 0; j < numCriteria; j++) {
        const x_0j = step4_optimalMatrix[j];
        if (criteriaTypes[j]) { // UPDATED (true = benefit)
          const c_plus = cj_plus[j];
           if (c_plus === 0) {
              normalizedOptimalRow.push({ l: 0, lPrime: 0, m: 0, uPrime: 0, u: 0 });
              continue;
            }
          normalizedOptimalRow.push({
            l: x_0j.l / c_plus,
            lPrime: x_0j.lPrime / c_plus,
            m: x_0j.m / c_plus,
            uPrime: x_0j.uPrime / c_plus,
            u: x_0j.u / c_plus,
          });
        } else {
          // cost
          const a_minus = aj_minus[j];
          if (a_minus === 0 || !isFinite(a_minus)) {
              normalizedOptimalRow.push({ l: 0, lPrime: 0, m: 0, uPrime: 0, u: 0 });
              continue;
            }
          const inv_l = x_0j.u === 0 ? Infinity : 1 / x_0j.u;
          const inv_lPrime = x_0j.uPrime === 0 ? Infinity : 1 / x_0j.uPrime;
          const inv_m = x_0j.m === 0 ? Infinity : 1 / x_0j.m;
          const inv_uPrime = x_0j.lPrime === 0 ? Infinity : 1 / x_0j.lPrime;
          const inv_u = x_0j.l === 0 ? Infinity : 1 / x_0j.l;
          normalizedOptimalRow.push({
            l: inv_l / a_minus,
            lPrime: inv_lPrime / a_minus,
            m: inv_m / a_minus,
            uPrime: inv_uPrime / a_minus,
            u: inv_u / a_minus,
          });
        }
      }
      // Повертаємо [optimal_row, alt1_row, alt2_row, ...]
      return [normalizedOptimalRow, ...normalizedMatrix];
    })(); // Додано criteriaTypes

    // Крок 7: Нормована зважена матриця (Рис. 9)
    const step7_weightedMatrix = ((): Fuzzy5[][] => {
      const normalizedMatrix = step6_normalizedMatrix; // [optimal, alt1, ...]
      const weights = step5_criteriaMatrix; // w_j

      return normalizedMatrix.map((row) => {
        // row = r_i (або r_0)
        return row.map((r_ij, j) => {
          const w_j = weights[j];
          // Множення нечітких чисел: (l1*l2, lPrime1*lPrime2, ...)
          return {
            l: r_ij.l * w_j.l,
            lPrime: r_ij.lPrime * w_j.lPrime,
            m: r_ij.m * w_j.m,
            uPrime: r_ij.uPrime * w_j.uPrime,
            u: r_ij.u * w_j.u,
          };
        });
      });
    })();

    // Крок 8: Загальна оцінка (сума) (Рис. 10)
    const step8_sumMatrix = ((): Fuzzy5[] => {
      const weightedMatrix = step7_weightedMatrix; // [optimal, alt1, ...]
      // Сума нечітких чисел: (sum(l), sum(lPrime), ...)
      return weightedMatrix.map((row) => {
        return row.reduce(
          (acc, fuzzy) => {
            acc.l += fuzzy.l;
            acc.lPrime += fuzzy.lPrime;
            acc.m += fuzzy.m;
            acc.uPrime += fuzzy.uPrime;
            acc.u += fuzzy.u;
            return acc;
          },
          { l: 0, lPrime: 0, m: 0, uPrime: 0, u: 0 }
        );
      });
    })();

    // Крок 9: Дефазифікація (Перетворення в чіткі) (Рис. 11)
    const step9_defuzzify = ((): number[] => {
      const sumMatrix = step8_sumMatrix; // [optimal, alt1, ...]
      // Формула: (l + lPrime + m + uPrime + u) / 5
      return sumMatrix.map(
        (f) => (f.l + f.lPrime + f.m + f.uPrime + f.u) / 5
      );
    })();

    // Крок 10: Ступінь корисності (Рис. 12)
    const step10_utility = ((): number[] => {
      const defuzzified = step9_defuzzify; // [optimal, alt1, ...]
      const optimalValue = defuzzified[0]; // S_def_opt
      if (optimalValue === 0) {
        return new Array(numAlternatives).fill(0);
      }
      // Повертаємо тільки альтернативи (з 1-го індексу)
      return defuzzified
        .slice(1)
        .map((s_def_i) => s_def_i / optimalValue); // Q_i = S_def_i / S_def_opt
    })();

    // Знаходження найкращої альтернативи
    const bestAlternativeIndex = ((): number => {
      const utilities = step10_utility;
      if (utilities.length === 0) return -1;
      let maxUtility = -Infinity;
      let bestIndex = -1;
      utilities.forEach((utility, index) => {
        if (utility > maxUtility) {
          maxUtility = utility;
          bestIndex = index;
        }
      });
      return bestIndex;
    })();

    return {
      step1_criteriaTri,
      step1_alternativeTri,
      step2_criteriaMatrix, // (Крок 2 + 5)
      step3_altMatrices, // (Крок 3)
      step4_optimalMatrix, // (Крок 4)
      step6_normalizedMatrix, // (Крок 6)
      step7_weightedMatrix, // (Крок 7)
      step8_sumMatrix, // (Крок 8)
      step9_defuzzify, // (Крок 9)
      step10_utility, // (Крок 10)
      bestAlternativeIndex,
    };
  }, [
    numAlternatives,
    numCriteria,
    numExperts,
    criteriaInputs,
    alternativeInputs,
    criteriaTypes,
    criteriaTerms, // NEW
    alternativeTerms, // NEW
  ]);

  const calculate = () => {
    setPage("results");
    setTabIndex(0);
  };

  // --- Рендеринг ---
  if (page === "setup") {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* --- REVERTED SETTINGS PANEL --- */}
          <Typography variant="h4">Налаштування методу Fuzzy ARAS</Typography>
          <Paper sx={{ p: 3, mb: 4, mt: 2 }}>
            <Typography variant="h5">Загальні параметри</Typography>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid sx={{ flexGrow: 1 }}>
                <TextField
                  label="Кількість альтернатив"
                  type="number"
                  value={numAlternatives}
                  onChange={(e) =>
                    handleCountChange(e.target.value, setNumAlternatives)
                  }
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <TextField
                  label="Кількість критеріїв"
                  type="number"
                  value={numCriteria}
                  onChange={(e) =>
                    handleCountChange(e.target.value, setNumCriteria)
                  }
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Grid>
              <Grid sx={{ flexGrow: 1 }}>
                <TextField
                  label="Кількість експертів"
                  type="number"
                  value={numExperts}
                  onChange={(e) =>
                    handleCountChange(e.target.value, setNumExperts)
                  }
                  inputProps={{ min: 1 }}
                  fullWidth
                />
              </Grid>
              <Grid container spacing={1} justifyContent="flex-start">
                <Button
                  variant="contained"
                  onClick={calculate}
                  size="large"
                  sx={{ height: "56px" }}
                >
                  Розрахувати
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetInputs}
                  size="large"
                  sx={{ height: "56px" }}
                >
                  Скинути
                </Button>
              </Grid>
            </Grid>
            
            {/* --- DELETED BUTTONS for LT Editor --- */}
          </Paper>
          
          {/* --- END REVERTED SETTINGS PANEL --- */}

          {criteriaInputTable}
          {alternativeInputTables}

          {/* --- NEW DIALOGS --- */}
          <LinguisticTermEditor
            open={editorOpen === "criteria"}
            onClose={() => setEditorOpen(null)}
            terms={criteriaTerms}
            setTerms={setCriteriaTerms}
            title="Редактор термів (Важливість критеріїв)"
          />
          <LinguisticTermEditor
            open={editorOpen === "alternative"}
            onClose={() => setEditorOpen(null)}
            terms={alternativeTerms}
            setTerms={setAlternativeTerms}
            title="Редактор термів (Оцінки альтернатив)"
          />

        </Container>
      </ThemeProvider>
    );
  }

  // --- Сторінка "Результати" ---
  const {
    step2_criteriaMatrix,
    step3_altMatrices,
    step4_optimalMatrix,
    step6_normalizedMatrix,
    step7_weightedMatrix,
    step8_sumMatrix,
    step9_defuzzify,
    step10_utility,
    bestAlternativeIndex,
    step1_criteriaTri, // Для кроку 3
    step1_alternativeTri, // Для кроку 3
  } = calculationResults;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* --- NEW HEADER (from screenshot) --- */}
        <Paper>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Button
              variant="text"
              onClick={() => setPage("setup")}
              startIcon={<ArrowBackIosIcon />}
            >
              Назад до налаштувань
            </Button>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconButton
                onClick={() => setTabIndex((p) => Math.max(0, p - 1))}
                disabled={tabIndex === 0}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography variant="h6" component="div">
                {tabHeaderLabels[tabIndex]}
              </Typography>
              <IconButton
                onClick={() => setTabIndex((p) => Math.min(tabHeaderLabels.length - 1, p + 1))}
                disabled={tabIndex === tabHeaderLabels.length - 1}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Box>
          {/* --- END NEW HEADER --- */}

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="result tabs"
            >
              <Tab label="Крок 2: Агреговані оцінки" />
              <Tab label="Крок 3: Трикутні числа" />
              <Tab label="Крок 4: Матриця нечітких чисел" />
              <Tab label="Крок 5: Оптимальні значення" />
              <Tab label="Крок 6: Нормована матриця" />
              <Tab label="Крок 7: Норм. зважена матриця" />
              <Tab label="Крок 8: Загальна оцінка" />
              <Tab label="Крок 9: Дефазифікація" />
              <Tab label="Крок 10: Ступінь корисності" />
            </Tabs>
          </Box>
          {/* ... (Всі TabPanel залишаються без змін, вони просто відображають нові дані) ... */}
          {/* Крок 2: Агреговані оцінки (Рис. 2) */}
          <TabPanel value={tabIndex} index={0}>
            <Typography variant="h5" gutterBottom>
              Крок 2: Агреговані оцінки альтернатив (Fuzzy 5)
            </Typography>
            <Typography variant="body2" gutterBottom>
              (Також показує "Крок 5: Агреговавані оцінки критеріїв")
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Критерій</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Ваги критеріїв (Крок 5)</strong>
                    </TableCell>
                    {step2_criteriaMatrix.map((fuzzy, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {formatFuzzy5(fuzzy)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 3: Трикутні числа (Рис. 3, 4) */}
          <TabPanel value={tabIndex} index={1}>
            <Typography variant="h5" gutterBottom>
              Крок 3: Перетворення в трикутні числа
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Трикутні числа (критерії)
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Експерт</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {step1_criteriaTri.map((row, eIdx) => (
                    <TableRow key={eIdx}>
                      <TableCell>{expertLabels[eIdx]}</TableCell>
                      {row.map((tri, cIdx) => (
                        <TableCell key={cIdx} align="center">
                          {`[${tri.l}, ${tri.m}, ${tri.u}]`}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Трикутні числа (альтернативи)
            </Typography>
            {step1_alternativeTri.map((expertMatrix, eIdx) => (
              <Box key={eIdx} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {expertLabels[eIdx]}
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Альтернатива</TableCell>
                        {criteriaLabels.map((label, cIdx) => (
                          <TableCell key={cIdx} align="center">
                            {label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expertMatrix.map((row, aIdx) => (
                        <TableRow key={aIdx}>
                          <TableCell>{alternativeLabels[aIdx]}</TableCell>
                          {row.map((tri, cIdx) => (
                            <TableCell key={cIdx} align="center">
                              {`[${tri.l}, ${tri.m}, ${tri.u}]`}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </TabPanel>

          {/* Крок 4: Матриця нечітких чисел (Рис. 6) */}
          <TabPanel value={tabIndex} index={2}>
            <Typography variant="h5" gutterBottom>
              Крок 4: Матриця нечітких чисел (Оцінки альтернатив)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Альтернатива</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {step3_altMatrices.map((row, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell>{alternativeLabels[aIdx]}</TableCell>
                      {row.map((fuzzy, cIdx) => (
                        <TableCell key={cIdx} align="center">
                          {formatFuzzy5(fuzzy)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 5: Оптимальні значення (Рис. 7) */}
          <TabPanel value={tabIndex} index={3}>
            <Typography variant="h5" gutterBottom>
              Крок 5: Матриця оптимальних значень критеріїв
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Критерій</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Optimal alternative</strong>
                    </TableCell>
                    {step4_optimalMatrix.map((fuzzy, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {formatFuzzy5(fuzzy)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 6: Нормована матриця (Рис. 8) */}
          <TabPanel value={tabIndex} index={4}>
            <Typography variant="h5" gutterBottom>
              Крок 6: Нормована матриця
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Альтернатива</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {step6_normalizedMatrix.map((row, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell>
                        {aIdx === 0
                          ? "Optimal alternative"
                          : alternativeLabels[aIdx - 1]}
                      </TableCell>
                      {row.map((fuzzy, cIdx) => (
                        <TableCell key={cIdx} align="center">
                          {formatFuzzy5(fuzzy)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 7: Нормована зважена матриця (Рис. 9) */}
          <TabPanel value={tabIndex} index={5}>
            <Typography variant="h5" gutterBottom>
              Крок 7: Нормована зважена матриця
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Альтернатива</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {step7_weightedMatrix.map((row, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell>
                        {aIdx === 0
                          ? "Optimal alternative"
                          : alternativeLabels[aIdx - 1]}
                      </TableCell>
                      {row.map((fuzzy, cIdx) => (
                        <TableCell key={cIdx} align="center">
                          {formatFuzzy5(fuzzy)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 8: Загальна оцінка (Рис. 10) */}
          <TabPanel value={tabIndex} index={6}>
            <Typography variant="h5" gutterBottom>
              Крок 8: Загальна оцінка оптимальності (Сума)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Альтернатива</TableCell>
                    <TableCell align="center">
                      Загальна нечітка оцінка (S_i)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {step8_sumMatrix.map((fuzzy, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell>
                        {aIdx === 0
                          ? "Optimal alternative"
                          : alternativeLabels[aIdx - 1]}
                      </TableCell>
                      <TableCell align="center">
                        {formatFuzzy5(fuzzy)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 9: Дефазифікація (Рис. 11) */}
          <TabPanel value={tabIndex} index={7}>
            <Typography variant="h5" gutterBottom>
              Крок 9: Дефазифікація (Перетворення в чіткі числа)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Альтернатива</TableCell>
                    <TableCell align="center">
                      Чітка оцінка (S_def)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {step9_defuzzify.map((value, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell>
                        {aIdx === 0
                          ? "Optimal alternative"
                          : alternativeLabels[aIdx - 1]}
                      </TableCell>
                      <TableCell align="center">{value.toFixed(6)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Крок 10: Ступінь корисності (Рис. 12) */}
          <TabPanel value={tabIndex} index={8}>
            <Typography variant="h5" gutterBottom>
              Крок 10: Ступінь корисності (Фінальний рейтинг)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Альтернатива</TableCell>
                    <TableCell align="center">
                      Ступінь корисності (Q_i)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Optimal alternative</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>1.000000</strong>
                    </TableCell>
                  </TableRow>
                  {step10_utility.map((value, aIdx) => (
                    <TableRow
                      key={aIdx}
                      sx={{
                        backgroundColor:
                          aIdx === bestAlternativeIndex
                            ? "success.light"
                            : "inherit",
                      }}
                    >
                      <TableCell>{alternativeLabels[aIdx]}</TableCell>
                      <TableCell align="center">
                        <strong>{value.toFixed(6)}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {bestAlternativeIndex !== -1 && (
              <Typography variant="h6" sx={{ mt: 3, color: "success.dark" }}>
                Найкраща альтернатива:{" "}
                {alternativeLabels[bestAlternativeIndex]} (
                {step10_utility[bestAlternativeIndex].toFixed(6)})
              </Typography>
            )}
          </TabPanel>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;