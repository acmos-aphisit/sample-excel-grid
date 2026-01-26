import { Cell, CellTemplate, Compatible, getCellProperty, Uncertain, isNavigationKey, isAlphaNumericKey, keyCodes, UncertainCompatible } from "@silevis/reactgrid";

// インタフェース
interface IOption {
  value: string;
  label: string;
}

// セレクトボックスセル
export interface SelectCell extends Cell {
  type: "select";
  text: string;
  options: IOption[];
  defaultOption: boolean;
}

export class SelectCellTemplate implements CellTemplate<Cell | SelectCell> {
  getCompatibleCell(uncertainCell: Uncertain<SelectCell>): Compatible<SelectCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const options = getCellProperty(uncertainCell, "options", "object");
    const value = parseFloat(text);
    const defaultOption = getCellProperty(uncertainCell, "defaultOption", "boolean");
    return { ...uncertainCell, text, value, options, defaultOption };
  }
  render(cell: Compatible<SelectCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<SelectCell>, commit: boolean) => void): JSX.Element {
    // テキスト表示
    if (!isInEditMode) {
      const value = cell.text.toLocaleLowerCase();
      return (
        <>
          {<span className={`base-show-select ${cell.className}`}>{cell.text}</span>}
        </>
      );
    }

    // 選択しているデータを取得
    const getSelectedValue: any = cell.options.find((option) => option.label == cell.text);

    return (
      <select
        ref={(input) => {
          input && input.focus();
        }}
        className={`base-select ${cell.className}`}
        defaultValue={(getSelectedValue) ? getSelectedValue.value : ''}
        onChange={(e) => {
          onCellChanged(this.getCompatibleCell({ ...cell, text: e.currentTarget.options[e.currentTarget.selectedIndex].value }), true);
        }}
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode)) e.stopPropagation();
        }}
      >
        {(cell.defaultOption) && (
          <option key={0} value={''}>
            {''}
          </option>
        )}

        {cell.options.map((opt, idx) => (
          <>
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          </>

        ))}
      </select>
    );
  }

  handleKeyDown(cell: Compatible<SelectCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<SelectCell>; enableEditMode: boolean } {
    if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true };
    return {
      cell,
      enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  update(cell: Compatible<SelectCell>, cellToMerge: UncertainCompatible<SelectCell>): Compatible<SelectCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }
}
