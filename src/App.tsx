import React, { useState, useMemo, useEffect } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Tabs,
  Tab,
  AppBar,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import type {
  TriangularNumber,
  Fuzzy5Number,
  CalculationResults,
} from "./types";
import {
  calculateFuzzy5,
  fuzzyAdd,
  fuzzyMultiply,
  defuzzify,
  create2DArray,
  create3DArray,
  resizeLabels,
  resize2DArray,
  resize3DArray,
} from "./utils";
import { ALTERNATIVE_MAP, ALTERNATIVE_TERMS, CRITERIA_MAP, CRITERIA_TERMS } from "./constants";
import { theme } from "./theme";
import { CustomTabPanel } from "./components/CustomTabPanel";
import { TriangularNumberCell } from "./components/TriangularNumberCell";
import { Fuzzy5NumberCell } from "./components/Fuzzy5NumberCell";

function App() {
  const [page, setPage] = useState<"setup" | "results">("setup");
  const [resultPage, setResultPage] = useState(0);

  const [numAlternatives, setNumAlternatives] = useState(4);
  const [numCriteria, setNumCriteria] = useState(5);
  const [numExperts, setNumExperts] = useState(4);

  const [alternativeLabels, setAlternativeLabels] = useState(() =>
    resizeLabels([], numAlternatives, "Альтернатива")
  );
  const [criteriaLabels, setCriteriaLabels] = useState(() =>
    resizeLabels([], numCriteria, "Критерій")
  );
  const [expertLabels, setExpertLabels] = useState(() =>
    resizeLabels([], numExperts, "Експерт")
  );

  const [criteriaInputs, setCriteriaInputs] = useState(() =>
    create2DArray(numExperts, numCriteria, "M")
  );
  const [alternativeInputs, setAlternativeInputs] = useState(() =>
    create3DArray(numExperts, numAlternatives, numCriteria, "G")
  );

  const [results, setResults] = useState<CalculationResults | null>(null);

  useEffect(() => {
    setAlternativeLabels((prev) =>
      resizeLabels(prev, numAlternatives, "Альтернатива")
    );
    setAlternativeInputs((prev) =>
      resize3DArray(prev, numExperts, numAlternatives, numCriteria, "G")
    );
  }, [numAlternatives, numExperts, numCriteria]);

  useEffect(() => {
    setCriteriaLabels((prev) => resizeLabels(prev, numCriteria, "Критерій"));
    setCriteriaInputs((prev) =>
      resize2DArray(prev, numExperts, numCriteria, "M")
    );
    setAlternativeInputs((prev) =>
      resize3DArray(prev, numExperts, numAlternatives, numCriteria, "G")
    );
  }, [numCriteria, numExperts, numAlternatives]);

  useEffect(() => {
    setExpertLabels((prev) => resizeLabels(prev, numExperts, "Експерт"));
    setCriteriaInputs((prev) =>
      resize2DArray(prev, numExperts, numCriteria, "M")
    );
    setAlternativeInputs((prev) =>
      resize3DArray(prev, numExperts, numAlternatives, numCriteria, "G")
    );
  }, [numExperts, numAlternatives, numCriteria]);

  const resetInputs = () => {
    setCriteriaInputs(create2DArray(numExperts, numCriteria, "M"));
    setAlternativeInputs(
      create3DArray(numExperts, numAlternatives, numCriteria, "G")
    );
    setAlternativeLabels(resizeLabels([], numAlternatives, "Альтернатива"));
    setCriteriaLabels(resizeLabels([], numCriteria, "Критерій"));
    setExpertLabels(resizeLabels([], numExperts, "Експерт"));
  };

  const handleCountChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const strValue = e.target.value;
      if (strValue === "") {
        setter(1);
        return;
      }
      const value = parseInt(strValue, 10);
      if (!isNaN(value) && value > 0 && value <= 20) {
        setter(value);
      }
    };

  const handleLabelChange =
    (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter((prev) =>
        prev.map((label, i) => (i === index ? e.target.value : label))
      );
    };

  const handleCriteriaChange = (
    expertIndex: number,
    criteriaIndex: number,
    value: string
  ) => {
    setCriteriaInputs((prev) => {
      const newInputs = prev.map((row) => [...row]);
      newInputs[expertIndex][criteriaIndex] = value;
      return newInputs;
    });
  };

  const handleAlternativeChange = (
    expertIndex: number,
    altIndex: number,
    criteriaIndex: number,
    value: string
  ) => {
    setAlternativeInputs((prev) => {
      const newInputs = prev.map((expertMatrix) =>
        expertMatrix.map((altRow) => [...altRow])
      );
      newInputs[expertIndex][altIndex][criteriaIndex] = value;
      return newInputs;
    });
  };


  const calculate = () => {
    try {
      const step2_aggregated: string[][] = create2DArray(
        numAlternatives,
        numCriteria,
        ""
      );

      for (let i = 0; i < numAlternatives; i++) {
        for (let j = 0; j < numCriteria; j++) {
          const terms: string[] = [];
          for (let k = 0; k < numExperts; k++) {
            terms.push(alternativeInputs[k][i][j]);
          }
          step2_aggregated[i][j] = `[${terms.join(", ")}]`;
        }
      }

      const step3_criteriaTri: TriangularNumber[][] = criteriaInputs.map(
        (expertRow) =>
          expertRow.map(
            (term) => CRITERIA_MAP.get(term) || { l: 0, m: 0, u: 0 }
          )
      );
      const step3_alternativeTri: TriangularNumber[][][] =
        alternativeInputs.map((expertMatrix) =>
          expertMatrix.map((altRow) =>
            altRow.map(
              (term) => ALTERNATIVE_MAP.get(term) || { l: 0, m: 0, u: 0 }
            )
          )
        );

      const step4_criteriaFuzzy: Fuzzy5Number[] = [];
      for (let j = 0; j < numCriteria; j++) {
        const termsForCriteria: TriangularNumber[] = [];
        for (let k = 0; k < numExperts; k++) {
          termsForCriteria.push(step3_criteriaTri[k][j]);
        }
        step4_criteriaFuzzy.push(calculateFuzzy5(termsForCriteria));
      }

      const step4_alternativeFuzzy: Fuzzy5Number[][] = create2DArray(
        numAlternatives,
        numCriteria,
        { l: 0, lp: 0, m: 0, up: 0, u: 0 }
      );
      for (let i = 0; i < numAlternatives; i++) {
        for (let j = 0; j < numCriteria; j++) {
          const termsForAlt: TriangularNumber[] = [];
          for (let k = 0; k < numExperts; k++) {
            termsForAlt.push(step3_alternativeTri[k][i][j]);
          }
          step4_alternativeFuzzy[i][j] = calculateFuzzy5(termsForAlt);
        }
      }

      const step5_optimalValues: Fuzzy5Number[] = [];
      for (let j = 0; j < numCriteria; j++) {
        let maxL = -Infinity,
          maxLp = -Infinity,
          maxM = -Infinity,
          maxUp = -Infinity,
          maxU = -Infinity;
        for (let i = 0; i < numAlternatives; i++) {
          const f = step4_alternativeFuzzy[i][j];
          if (f.l > maxL) maxL = f.l;
          if (f.lp > maxLp) maxLp = f.lp;
          if (f.m > maxM) maxM = f.m;
          if (f.up > maxUp) maxUp = f.up;
          if (f.u > maxU) maxU = f.u;
        }

        step5_optimalValues.push({
          l: Math.max(0, maxL),
          lp: Math.max(0, maxLp),
          m: Math.max(0, maxM),
          up: Math.max(0, maxUp),
          u: Math.max(0, maxU),
        });
      }

      const combinedAltsFuzzy = [
        step5_optimalValues,
        ...step4_alternativeFuzzy,
      ];

      const step6_normalized: Fuzzy5Number[][] = create2DArray(
        numAlternatives + 1,
        numCriteria,
        { l: 0, lp: 0, m: 0, up: 0, u: 0 }
      );

      for (let j = 0; j < numCriteria; j++) {
        let cj_plus = 0;
        for (let i = 0; i < combinedAltsFuzzy.length; i++) {
          cj_plus += combinedAltsFuzzy[i][j].u;
        }

        if (cj_plus === 0) {
          console.warn(`Division by zero in Step 6 for criteria ${j}`);
          continue; 
        }

        for (let i = 0; i < combinedAltsFuzzy.length; i++) {
          const f = combinedAltsFuzzy[i][j];
          step6_normalized[i][j] = {
            l: f.l / cj_plus,
            lp: f.lp / cj_plus,
            m: f.m / cj_plus,
            up: f.up / cj_plus,
            u: f.u / cj_plus,
          };
        }
      }

      const step7_weighted: Fuzzy5Number[][] = create2DArray(
        numAlternatives + 1,
        numCriteria,
        { l: 0, lp: 0, m: 0, up: 0, u: 0 }
      );

      for (let i = 0; i < step6_normalized.length; i++) {
        for (let j = 0; j < numCriteria; j++) {
          const rij = step6_normalized[i][j];
          const wj = step4_criteriaFuzzy[j];
          step7_weighted[i][j] = fuzzyMultiply(rij, wj);
        }
      }

      const step8_overall: Fuzzy5Number[] = [];
      for (let i = 0; i < step7_weighted.length; i++) {
        const row = step7_weighted[i];
        const sum = row.reduce((acc, f) => fuzzyAdd(acc, f), {
          l: 0,
          lp: 0,
          m: 0,
          up: 0,
          u: 0,
        });
        step8_overall.push(sum);
      }

      const step9_defuzzified: number[] = step8_overall.map(defuzzify);

      const optimalDefuzzified = step9_defuzzified[0];
      const step10_utility: number[] = [];
      let bestUtility = -Infinity;
      let bestAlternativeIndex = -1;

      for (
        let i = 1;
        i < step9_defuzzified.length;
        i++
      ) {
        const utility =
          optimalDefuzzified > 0
            ? step9_defuzzified[i] / optimalDefuzzified
            : 0;
        step10_utility.push(utility);

        if (utility > bestUtility) {
          bestUtility = utility;
          bestAlternativeIndex = i - 1;
        }
      }

      const finalResults: CalculationResults = {
        step2_aggregated,
        step3_criteriaTri,
        step3_alternativeTri,
        step4_criteriaFuzzy,
        step4_alternativeFuzzy,
        step5_optimalValues,
        step6_normalized,
        step7_weighted,
        step8_overall,
        step9_defuzzified,
        step10_utility,
        bestAlternativeIndex,
      };

      setResults(finalResults);
      setResultPage(0);
      setPage("results");
    } catch (error) {
      console.error("Calculation failed:", error);
    }
  };

  const settingsPanel = useMemo(
    () => (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Налаштування
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{ display: "flex", flexGrow: 1 }}>
            <TextField
              label="Кількість альтернатив"
              type="number"
              value={numAlternatives}
              onChange={handleCountChange(setNumAlternatives)}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 20 } }}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
          <Grid sx={{ display: "flex", flexGrow: 1 }}>
            <TextField
              label="Кількість критеріїв"
              type="number"
              value={numCriteria}
              onChange={handleCountChange(setNumCriteria)}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 20 } }}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
          <Grid sx={{ display: "flex", flexGrow: 1 }}>
            <TextField
              label="Кількість експертів"
              type="number"
              value={numExperts}
              onChange={handleCountChange(setNumExperts)}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 20 } }}
              sx={{ flexGrow: 1 }}
            />
          </Grid>
          <Grid>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                height: "56px",
                alignItems: "center",
              }}
            >
              <Button
                variant="outlined"
                onClick={resetInputs}
                sx={{ flexGrow: 1 }}
              >
                Скинути
              </Button>
              <Button
                variant="contained"
                onClick={calculate}
                sx={{ flexGrow: 1 }}
              >
                Розрахувати
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    ),
    [numAlternatives, numCriteria, numExperts, calculate]
  );

  const criteriaInputTable = useMemo(
    () => (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Важливість критеріїв
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '250px' }}>Експерт</TableCell>
                {criteriaLabels.map((label, cIdx) => (
                  <TableCell key={cIdx} align="center">
                    <TextField
                      value={label}
                      onChange={handleLabelChange(setCriteriaLabels, cIdx)}
                      size="small"
                      sx={{
                        minWidth: 100,
                        "& .MuiInputBase-input": {
                          fontWeight: 700,
                          textAlign: "center",
                        },
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {expertLabels.map((label, eIdx) => (
                <TableRow key={eIdx}>
                  <TableCell sx={{ width: '250px' }}>
                    <TextField
                      value={label}
                      onChange={handleLabelChange(setExpertLabels, eIdx)}
                      size="small"
                    />
                  </TableCell>
                  {criteriaLabels.map((_, cIdx) => (
                    <TableCell key={cIdx} align="center">
                      <Select
                        value={criteriaInputs[eIdx]?.[cIdx] || "M"}
                        onChange={(e) =>
                          handleCriteriaChange(eIdx, cIdx, e.target.value)
                        }
                        variant="standard"
                        fullWidth
                        renderValue={(value) => value}
                      >
                        {CRITERIA_TERMS.map((term) => (
                          <MenuItem key={term.shortName} value={term.shortName}>
                            {term.name}
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
    [numCriteria, numExperts, criteriaInputs, criteriaLabels, expertLabels]
  );

  const alternativeInputTables = useMemo(
    () => (
      <>
        {expertLabels.map((expertLabel, eIdx) => (
          <Paper key={eIdx} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Оцінки експерта: {expertLabel}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: '250px' }}>Альтернатива</TableCell>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableCell key={cIdx} align="center">
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alternativeLabels.map((label, aIdx) => (
                    <TableRow key={aIdx}>
                      <TableCell sx={{ width: '250px' }}>
                        <TextField
                          value={label}
                          onChange={handleLabelChange(
                            setAlternativeLabels,
                            aIdx
                          )}
                          size="small"
                        />
                      </TableCell>
                      {criteriaLabels.map((_, cIdx) => (
                        <TableCell key={cIdx} align="center">
                          <Select
                            value={
                              alternativeInputs[eIdx]?.[aIdx]?.[cIdx] || "G"
                            }
                            onChange={(e) =>
                              handleAlternativeChange(
                                eIdx,
                                aIdx,
                                cIdx,
                                e.target.value
                              )
                            }
                            variant="standard"
                            fullWidth
                            renderValue={(value) => value}
                          >
                            {ALTERNATIVE_TERMS.map((term) => (
                              <MenuItem
                                key={term.shortName}
                                value={term.shortName}
                              >
                                {term.name}
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
      numAlternatives,
      numCriteria,
      numExperts,
      alternativeInputs,
      alternativeLabels,
      expertLabels,
      criteriaLabels,
    ]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {page === "setup" && (
          <>
            <Typography variant="h4" gutterBottom>
              Метод Fuzzy ARAS (Налаштування)
            </Typography>
            {settingsPanel}
            {criteriaInputTable}
            {alternativeInputTables}
          </>
        )}

        {page === "results" && results && (
          <Paper sx={{ p: 0, overflow: "hidden" }}>
            <AppBar
              position="static"
              color="default"
              elevation={0}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                }}
              >
                <Button
                  color="primary"
                  onClick={() => setPage("setup")}
                  startIcon={<ArrowBackIosNewIcon />}
                >
                  Назад до налаштувань
                </Button>
                {/* Виправлення 4: Навігація по крокам */}
                <Box>
                  <IconButton
                    onClick={() => setResultPage((p) => p - 1)}
                    disabled={resultPage === 0}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <Typography
                    variant="button"
                    sx={{
                      display: "inline-block",
                      mx: 2,
                      minWidth: 100,
                      textAlign: "center",
                    }}
                  >
                    Крок {resultPage + 2}
                  </Typography>
                  <IconButton
                    onClick={() => setResultPage((p) => p + 1)}
                    disabled={resultPage === 7}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Box>
              </Box>
              <Tabs
                value={resultPage}
                onChange={(_, newValue) => setResultPage(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Крок 2: Агреговані оцінки" />
                <Tab label="Крок 3: Трикутні числа" />
                <Tab label="Крок 4: Нечіткі числа" />
                <Tab label="Крок 5: Оптимальні значення" />
                <Tab label="Крок 6: Нормалізація" />
                <Tab label="Крок 7: Зважування" />
                <Tab label="Крок 8: Загальна оцінка" />
                <Tab label="Крок 9-10: Результат" />
              </Tabs>
            </AppBar>

            <CustomTabPanel value={resultPage} index={0}>
              <Typography variant="h6" gutterBottom>
                Крок 2: Матриця агрегованих оцінок по альтернативам
              </Typography>
              <TableContainer>
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
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow key={aIdx}>
                        <TableCell>{label}</TableCell>
                        {criteriaLabels.map((_, cIdx) => (
                          <TableCell key={cIdx} align="center">
                            {results.step2_aggregated[aIdx][cIdx]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={1}>
              <Typography variant="h6" gutterBottom>
                Крок 3: Перетворення лінгвістичних термів в трикутні числа
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Важливість критеріїв
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
                    {expertLabels.map((label, eIdx) => (
                      <TableRow key={eIdx}>
                        <TableCell>{label}</TableCell>
                        {criteriaLabels.map((_, cIdx) => (
                          <TriangularNumberCell
                            key={cIdx}
                            t={results.step3_criteriaTri[eIdx][cIdx]}
                          />
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Оцінки альтернатив
              </Typography>
              {expertLabels.map((label, eIdx) => (
                <Box key={eIdx} sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Експерт: {label}
                  </Typography>
                  <TableContainer component={Paper} elevation={1}>
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
                        {alternativeLabels.map((altLabel, aIdx) => (
                          <TableRow key={aIdx}>
                            <TableCell>{altLabel}</TableCell>
                            {criteriaLabels.map((_, cIdx) => (
                              <TriangularNumberCell
                                key={cIdx}
                                t={
                                  results.step3_alternativeTri[eIdx][aIdx][cIdx]
                                }
                              />
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={2}>
              <Typography variant="h6" gutterBottom>
                Крок 4: Формування матриці нечітких чисел
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Матриця нечітких чисел по критеріям
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Критерій</TableCell>
                      <TableCell align="center">
                        Нечітке число (l, l', m, u', u)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableRow key={cIdx}>
                        <TableCell>{label}</TableCell>
                        <Fuzzy5NumberCell
                          f={results.step4_criteriaFuzzy[cIdx]}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Матриця нечітких чисел по альтернативам
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
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow key={aIdx}>
                        <TableCell>{label}</TableCell>
                        {criteriaLabels.map((_, cIdx) => (
                          <Fuzzy5NumberCell
                            key={cIdx}
                            f={results.step4_alternativeFuzzy[aIdx][cIdx]}
                          />
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={3}>
              <Typography variant="h6" gutterBottom>
                Крок 5: Матриця оптимальних значень критеріїв
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Критерій</TableCell>
                      <TableCell align="center">
                        Оптимальне нечітке число (l, l', m, u', u)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criteriaLabels.map((label, cIdx) => (
                      <TableRow key={cIdx}>
                        <TableCell>{label}</TableCell>
                        <Fuzzy5NumberCell
                          f={results.step5_optimalValues[cIdx]}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={4}>
              <Typography variant="h6" gutterBottom>
                Крок 6: Матриця нормованих значень
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
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell>Optimal alternative</TableCell>
                      {criteriaLabels.map((_, cIdx) => (
                        <Fuzzy5NumberCell
                          key={cIdx}
                          f={results.step6_normalized[0][cIdx]}
                          precision={5}
                        />
                      ))}
                    </TableRow>
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow key={aIdx}>
                        <TableCell>{label}</TableCell>
                        {criteriaLabels.map((_, cIdx) => (
                          <Fuzzy5NumberCell
                            key={cIdx}
                            f={results.step6_normalized[aIdx + 1][cIdx]}
                            precision={5}
                          />
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={5}>
              <Typography variant="h6" gutterBottom>
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
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell>Optimal alternative</TableCell>
                      {criteriaLabels.map((_, cIdx) => (
                        <Fuzzy5NumberCell
                          key={cIdx}
                          f={results.step7_weighted[0][cIdx]}
                          precision={5}
                        />
                      ))}
                    </TableRow>
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow key={aIdx}>
                        <TableCell>{label}</TableCell>
                        {criteriaLabels.map((_, cIdx) => (
                          <Fuzzy5NumberCell
                            key={cIdx}
                            f={results.step7_weighted[aIdx + 1][cIdx]}
                            precision={5}
                          />
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={6}>
              <Typography variant="h6" gutterBottom>
                Крок 8: Загальна оцінка оптимальності рішень
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Альтернатива</TableCell>
                      <TableCell align="center">
                        Загальне нечітке число (l, l', m, u', u)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell>Optimal alternative</TableCell>
                      <Fuzzy5NumberCell
                        f={results.step8_overall[0]}
                        precision={5}
                      />
                    </TableRow>
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow key={aIdx}>
                        <TableCell>{label}</TableCell>
                        <Fuzzy5NumberCell
                          f={results.step8_overall[aIdx + 1]}
                          precision={5}
                        />
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>

            <CustomTabPanel value={resultPage} index={7}>
              <Typography variant="h6" gutterBottom>
                Крок 9: Перетворення матриці нечітких чисел в чіткі
                (Defuzzification)
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Альтернатива</TableCell>
                      <TableCell align="center">
                        Чітке число оптимальності (S)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell>Optimal alternative</TableCell>
                      <TableCell align="center">
                        {results.step9_defuzzified[0].toFixed(8)}
                      </TableCell>
                    </TableRow>
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow key={aIdx}>
                        <TableCell>{label}</TableCell>
                        <TableCell align="center">
                          {results.step9_defuzzified[aIdx + 1].toFixed(8)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="h6" gutterBottom>
                Крок 10: Результат застосування методу (Degree of Utility)
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Альтернатива</TableCell>
                      <TableCell align="center">
                        Ступінь корисності (Q)
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alternativeLabels.map((label, aIdx) => (
                      <TableRow
                        key={aIdx}
                        sx={{
                          backgroundColor:
                            aIdx === results.bestAlternativeIndex
                              ? "success.lighter"
                              : "inherit",
                          "& > *": {
                            fontWeight:
                              aIdx === results.bestAlternativeIndex
                                ? 700
                                : "inherit",
                          },
                        }}
                      >
                        <TableCell>{label}</TableCell>
                        <TableCell align="center">
                          {results.step10_utility[aIdx].toFixed(8)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomTabPanel>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
