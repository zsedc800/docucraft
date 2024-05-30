export interface CellAttrs {
    colspan: number;
    rowspan: number;
    colwidth: number[] | null;
}
export type MutableAttrs = Record<string, unknown>;
