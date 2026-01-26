import { Cell, CellTemplate, Compatible, getCellProperty, Uncertain, isNavigationKey, isAlphaNumericKey, keyCodes, UncertainCompatible } from "@silevis/reactgrid";

// セレクトボックスセル
export interface TextAreaCell extends Cell {
  type: "text";
  text: string;
  value: any;
}

export class TextAreaCellTemplate implements CellTemplate<Cell | TextAreaCell> {
  getCompatibleCell(uncertainCell: Uncertain<TextAreaCell>): Compatible<TextAreaCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = getCellProperty(uncertainCell, "value", "string");
    return { ...uncertainCell, text, value };
  }
  render(cell: Compatible<TextAreaCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<TextAreaCell>, commit: boolean) => void): JSX.Element {
    // テキスト表示
    if (!isInEditMode) {
      const value = cell.text.toLocaleLowerCase();
      return (
        <>
          {<span className={`base-show-text-area ${cell.className}`}>{cell.text}</span>}
        </>
      );
    }

    console.log('textArea [cell] : ', cell);

    const inputValueRef = { current: cell.text };

    return (
      <textarea
        ref={(input) => {
          input && input.focus();
        }}
        className={`base-text-area ${cell.className}`}
        defaultValue={inputValueRef.current}
        // onChange={(e) => onCellChanged(this.getCompatibleCell({ ...cell, text: e.target.value, value: e.target.value }), true)}
        onChange={(e) => {
          console.log('textArea_onChange >>> ', e.target.value);

          inputValueRef.current = e.target.value;
        }}
        onBlur={() => {
          console.log('textArea_onBlur >>> ', inputValueRef.current);
          onCellChanged(
            this.getCompatibleCell({
              ...cell,
              text: inputValueRef.current,
              value: inputValueRef.current,
            }),
            true
          );
        }}
        onCopy={(e) => e.stopPropagation()}
        onCut={(e) => e.stopPropagation()}
        onPaste={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const value = (e.currentTarget as HTMLTextAreaElement).value;
            console.log('Enter value : ', value);

            setTimeout(() => {
              onCellChanged(
                this.getCompatibleCell({
                  ...cell,
                  text: value,
                  value: value,
                }),
                true
              );
            }, 0);

          } else {
            e.stopPropagation();
          }
        }}
      />
    );
  }

  handleKeyDown(cell: Compatible<TextAreaCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<TextAreaCell>; enableEditMode: boolean } {
    if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true };
    return {
      cell,
      enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  update(cell: Compatible<TextAreaCell>, cellToMerge: UncertainCompatible<TextAreaCell>): Compatible<TextAreaCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }
}
