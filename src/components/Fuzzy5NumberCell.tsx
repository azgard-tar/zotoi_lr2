import TableCell from "@mui/material/TableCell";
import type { Fuzzy5Number } from "../types";

/**
 * Компонент для форматованого відображення 5-компонентного числа
 */
export const Fuzzy5NumberCell: React.FC<{ f: Fuzzy5Number; precision?: number }> = ({
  f,
  precision = 4,
}) => (
  <TableCell sx={{ whiteSpace: "nowrap" }} align="center">
    [{f.l.toFixed(precision)}, {f.lp.toFixed(precision)},{" "}
    {f.m.toFixed(precision)}, {f.up.toFixed(precision)},{" "}
    {f.u.toFixed(precision)}]
  </TableCell>
);