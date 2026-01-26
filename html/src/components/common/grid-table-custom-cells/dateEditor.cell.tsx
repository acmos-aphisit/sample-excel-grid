import { Cell, CellTemplate, Compatible, getCellProperty, Uncertain, isNavigationKey, isAlphaNumericKey, keyCodes, UncertainCompatible } from "@silevis/reactgrid";
import moment from "moment";

// セレクトボックスセル
export interface DateEditorCell extends Cell {
    type: "dateEditor";
    text: string;
    value: any;
    date: Date | null;
}

export class DateEditorTemplate implements CellTemplate<Cell | DateEditorCell> {
    getCompatibleCell(uncertainCell: Uncertain<DateEditorCell>): Compatible<DateEditorCell> {
        // 貼り付けたデータを加工
        const clipBoardTextTrim: string = uncertainCell.text.trim();

        // グリッドテーブルの要素を設定
        const text = getCellProperty(uncertainCell, "text", "string") ?? "";
        const value = uncertainCell.value;
        const date = (typeof uncertainCell.date === 'object') ? getCellProperty(uncertainCell, "date", "object") : (clipBoardTextTrim !== "") ? new Date(clipBoardTextTrim) : Date();
        return {
            ...uncertainCell,
            type: "dateEditor",
            text,
            value,
            date
        };
    }
    render(cell: Compatible<DateEditorCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<DateEditorCell>, commit: boolean) => void): JSX.Element {
        // テキスト表示
        if (!isInEditMode) {
            return (
                <>
                    {<span className={`base-show-date-editor ${cell.className}`}>{cell.text}</span>}
                </>
            );
        }

        return (
            <input
                ref={(input) => {
                    input && input.focus();
                }}
                type="date"
                max="9999-12-31"
                defaultValue={(cell.text) ? moment(cell.text).format("YYYY-MM-DD") : ""}
                className={`base-date-editor ${cell.className}`}
                onBlur={(e) => {
                    const newDate = e.target.value;
                    onCellChanged(
                        this.getCompatibleCell({
                            ...cell,
                            date: new Date(newDate),
                            text: moment(newDate).format('YYYY/MM/DD'),
                            value: moment(newDate).format('YYYY/MM/DD'),
                        }),
                        true
                    );
                }}
                onChange={(e) => {
                    const newDate = e.target.value;
                    onCellChanged(
                        this.getCompatibleCell({
                            ...cell,
                            date: new Date(newDate),
                            text: moment(newDate).format('YYYY/MM/DD'),
                            value: moment(newDate).format('YYYY/MM/DD'),
                        }),
                        false
                    );
                }}
                onCopy={(e) => e.stopPropagation()}
                onCut={(e) => e.stopPropagation()}
                onPaste={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode)) e.stopPropagation();
                }}
            />
        );
    }

    handleKeyDown(cell: Compatible<DateEditorCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<DateEditorCell>; enableEditMode: boolean } {
        if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true };
        return {
            cell,
            enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
        };
    }

    update(cell: Compatible<DateEditorCell>, cellToMerge: UncertainCompatible<DateEditorCell>): Compatible<DateEditorCell> {
        return this.getCompatibleCell({ ...cell, date: cellToMerge.date, text: cellToMerge.text, value: cellToMerge.text });
    }
}
