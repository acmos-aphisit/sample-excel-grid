import { Cell, CellTemplate, Compatible, getCellProperty, Uncertain, isNavigationKey, isAlphaNumericKey, keyCodes, UncertainCompatible } from "@silevis/reactgrid";

// セレクトボックスセル
export interface TimeCell extends Cell {
  type: "time";
  text: string;
  value: any;
}

export class TimeCellTemplate implements CellTemplate<Cell | TimeCell> {
  getCompatibleCell(uncertainCell: Uncertain<TimeCell>): Compatible<TimeCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = getCellProperty(uncertainCell, "value", "string");
    return { ...uncertainCell, text, value };
  }
  render(cell: Compatible<TimeCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<TimeCell>, commit: boolean) => void): JSX.Element {
    // テキスト表示
    if (!isInEditMode) {
      
    }

    return (
      <input
        // ref={(input) => {
        //   input && input.focus();
        // }}
        type="time"
        step={1}
        className={`base-time ${cell.className}`}
        onChange={(e) => onCellChanged(this.getCompatibleCell({ ...cell, text: e.target.value, value: e.target.value }), true)}
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

  handleKeyDown(cell: Compatible<TimeCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<TimeCell>; enableEditMode: boolean } {
    if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true };
    return {
      cell,
      enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  update(cell: Compatible<TimeCell>, cellToMerge: UncertainCompatible<TimeCell>): Compatible<TimeCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }
}
