import parse from 'html-react-parser';
import { Cell, CellTemplate, Compatible, getCellProperty, Uncertain, isNavigationKey, isAlphaNumericKey, keyCodes, UncertainCompatible } from "@silevis/reactgrid";

// セレクトボックスセル
export interface HtmlToTextCell extends Cell {
  type: "text";
  text: string;
  value: any;
}

export class HtmlToTextCellTemplate implements CellTemplate<Cell | HtmlToTextCell> {
  getCompatibleCell(uncertainCell: Uncertain<HtmlToTextCell>): Compatible<HtmlToTextCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const value = getCellProperty(uncertainCell, "value", "string");
    return { ...uncertainCell, text, value };
  }
  render(cell: Compatible<HtmlToTextCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<HtmlToTextCell>, commit: boolean) => void): JSX.Element {
    // テキスト表示
    if (!isInEditMode) {
      const value = cell.text.toLocaleLowerCase();
      return (
        <>
          {<span className={`base-show-text-area ${cell.className}`}>{parse(cell.text)}</span>}
        </>
      );
    }
  }

//   handleKeyDown(cell: Compatible<HtmlToTextCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean): { cell: Compatible<HtmlToTextCell>; enableEditMode: boolean } {
//     if (!ctrl && !alt && isAlphaNumericKey(keyCode)) return { cell, enableEditMode: true };
//     return {
//       cell,
//       enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
//     };
//   }

//   update(cell: Compatible<HtmlToTextCell>, cellToMerge: UncertainCompatible<HtmlToTextCell>): Compatible<HtmlToTextCell> {
//     return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
//   }
}
