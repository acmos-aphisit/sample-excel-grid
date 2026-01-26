import React, { useState } from "react";
import {
  Cell,
  CellTemplate,
  Compatible,
  getCellProperty,
  Uncertain,
  isNavigationKey,
  isAlphaNumericKey,
  keyCodes,
  UncertainCompatible,
} from "@silevis/reactgrid";
import { SelectOptions } from "../../../common/interface";
import cssInput from "../../../scss/common/inputComponents.module.scss";
import { useQuery } from "@tanstack/react-query";

// インタフェース
interface IOption {
  value: string;
  label: string;
}

// セレクトボックスセル
export interface ComboBoxCell extends Cell {
  type: "select";
  text: any;
  options: IOption[];
}

export class ComboBoxCellTemplate implements CellTemplate<Cell | ComboBoxCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<ComboBoxCell>
  ): Compatible<ComboBoxCell> {
    const text = getCellProperty(uncertainCell, "text", "string");
    const options = getCellProperty(uncertainCell, "options", "object");
    const value = parseFloat(text);
    return { ...uncertainCell, text, value, options };
  }
  render(
    cell: Compatible<ComboBoxCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<ComboBoxCell>, commit: boolean) => void
  ): JSX.Element {
    const datalistId = `datalist-${Math.random().toString(36).substr(2, 9)}`;

    // if (!isInEditMode) {
    //     return (
    //         <>
    //             {<span className={`base-show-select ${cell.className}`}>{cell.text}</span>}
    //         </>
    //     );
    // }

    const [useInputValue, setInputValue] = useState<any>(cell.text);
    const [useOptions, setOptions] = useState<any>(cell.options);

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const image = "./img/dropdown.png";

    const wrapperRef = React.useRef(null);
    useOutsideAlerter(wrapperRef);

    // データ初期化
    useQuery({
      queryKey: ["initComboboxCell", cell.text],
      queryFn: () => {
        setInputValue(cell.text || "");
      },
    });

    const [useOptionHtml, setOptionHtml] = useState<any>();
    const [positionX, setPositionX] = useState<number>(0); // 選択したセルの左端X座標
    /**
     *
     *
     */
    const optionsSetting = async () => {
      let optionHtml: Array<JSX.Element> = [];

      let arrOption: SelectOptions[] = [];
      if (useOptions !== undefined) {
        arrOption = useOptions;
      }

      let colourOptions: any = [];

      for (let i = 0; i < arrOption.length; i += 1) {
        if (arrOption[i].label == cell.text && cell.text !== "") {
          optionHtml.push(
            <li
              className="selected"
              key={arrOption[i].value}
              onClick={() => handleOptionClick(arrOption[i])}
            >
              {arrOption[i].label}
            </li>
          );
          colourOptions.push({
            value: arrOption[i].value,
            label: arrOption[i].label,
          });
        } else {
          optionHtml.push(
            <li
              key={arrOption[i].value}
              onClick={() => handleOptionClick(arrOption[i])}
            >
              {arrOption[i].label}
            </li>
          );
          colourOptions.push({
            value: arrOption[i].value,
            label: arrOption[i].label,
          });
        }
      }

      setOptionHtml(optionHtml);

      return true;
    };

    useQuery({
      queryKey: ["optionsSetting", useOptions],
      queryFn: async () => {
        await optionsSetting();
        return true;
      },
      refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    /**
     * リスト開閉処理
     *
     */
    const toggleDropdown = (e: React.MouseEvent<HTMLInputElement>) => {
      let rect = e.currentTarget.getBoundingClientRect();
      setPositionX(rect.left);
      setIsOpen(!isOpen);
    };

    useQuery({
      queryKey: ["optionsReset", isOpen],
      queryFn: async () => {
        if (!isOpen) {
          setOptions(cell.options);
        }
        return true;
      },
      refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    /**
     * リストを押下する処理
     *
     * @param option
     */
    const handleOptionClick = (option: any) => {
      console.log("option >>> ", option);

      if (option) {
        setInputValue(option.label);
        onCellChanged(
          this.getCompatibleCell({
            ...cell,
            text: option.label,
          }),
          true
        );
        setIsOpen(false);
      } else {
        setInputValue("");
        onCellChanged(
          this.getCompatibleCell({
            ...cell,
            text: "",
          }),
          true
        );
        setIsOpen(false);
      }
    };

    /**
     * ステートに入力値を指定する処理
     *
     * @param event
     */
    const handleInputChange = (e: any) => {
      setInputValue(e.target.value);
      setIsOpen(true);

      // 選択肢調整
      let newOptionObj = [];
      [...Object.values(cell.options)].map((option, key) => {
        if (option.label.includes(e.target.value)) {
          newOptionObj.push(option);
        }
      });

      console.log(newOptionObj);
      setOptions(newOptionObj);
    };

    /**
     * コンボボックス領域以外の押下処理
     *
     * @param ref
     */
    function useOutsideAlerter(ref: any) {
      React.useEffect(() => {
        /**
         * テキストボックスとリスト以外をクリックする場合
         */
        function handleClickOutside(event: any) {
          if (ref.current && !ref.current.contains(event.target)) {
            setIsOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [ref]);
    }

    return (
      <>
        <div
          ref={wrapperRef}
          id="combobox_comp_container"
          className={`input_group ${cell.className}`}
        >
          <div className={`combo_box`}>
            <input
              id={"combobox_input"}
              name={"combobox_input"}
              disabled={false}
              type="text"
              className={`combobox_input`}
              autoComplete="off"
              value={useInputValue}
              onClick={(e) => toggleDropdown(e)}
              onChange={handleInputChange}
              onCopy={(e) => e.stopPropagation()}
              onCut={(e) => e.stopPropagation()}
              onPaste={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onBlur={() => {
                const checkSelected = cell.options.find(
                  (option) => option.label == useInputValue
                );
                const setOnBlurData = checkSelected ? checkSelected.label : "";
                setInputValue(setOnBlurData);
                onCellChanged(
                  this.getCompatibleCell({
                    ...cell,
                    text: setOnBlurData,
                  }),
                  true
                );
              }}
              onKeyDown={(e) => {
                if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode))
                  e.stopPropagation();
              }}
              style={{
                backgroundImage: `url(${image})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "calc(100% - 10px) center",
              }}
            />
            {isOpen && (
              <ul
                className={`options`}
                // style={{ marginLeft: left, width: width }}
                style={{ left: positionX }}
              >
                {useOptionHtml}
              </ul>
            )}
          </div>
        </div>
      </>
    );
  }

  handleKeyDown(
    cell: Compatible<ComboBoxCell>,
    keyCode: number,
    ctrl: boolean,
    shift: boolean,
    alt: boolean
  ): { cell: Compatible<ComboBoxCell>; enableEditMode: boolean } {
    if (!ctrl && !alt && isAlphaNumericKey(keyCode))
      return { cell, enableEditMode: true };
    return {
      cell,
      enableEditMode:
        keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER,
    };
  }

  update(
    cell: Compatible<ComboBoxCell>,
    cellToMerge: UncertainCompatible<ComboBoxCell>
  ): Compatible<ComboBoxCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }
}
