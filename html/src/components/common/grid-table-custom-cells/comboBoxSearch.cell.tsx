import React, { useState, useRef, useCallback } from "react";
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
import { useQuery } from "@tanstack/react-query";

// 選択肢配列インタフェース
interface SelectOptions {
    value: string;
    label: string;
}

// 選択肢セルインタフェース
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

/**
 * コンボボックスのセルテンプレート
 */
export class ComboBoxCellTemplate implements CellTemplate<Cell | ComboBoxCell> {
    getCompatibleCell(
        uncertainCell: Uncertain<ComboBoxCell>
    ): Compatible<ComboBoxCell> {
        const text = getCellProperty(uncertainCell, "text", "string");
        const options = getCellProperty(uncertainCell, "options", "object");
        const value = parseFloat(text) || undefined;
        return { ...uncertainCell, text, value, options };
    }

    render(
        cell: Compatible<ComboBoxCell>,
        isInEditMode: boolean,
        onCellChanged: (cell: Compatible<ComboBoxCell>, commit: boolean) => void,
    ): JSX.Element {
        if (!isInEditMode) {
            return (
                <>
                    {<span className={`base-show-combobox ${cell.className}`}>{cell.text}</span>}
                </>
            );
        } else {
            return <ComboBoxEditor cell={cell} onCellChanged={onCellChanged} getCompatibleCell={this.getCompatibleCell} />
        }
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

/**
 * コンボボックス_子コンポネント
 * 
 * @param cell                  グリッドテーブルのセルデータ
 * @param onCellChanged         データ更新、更新したデータコミット
 * @param getCompatibleCell     セル更新
 * @returns 
 */
const ComboBoxEditor = ({
    cell,
    onCellChanged,
    getCompatibleCell
}: {
    cell: Compatible<ComboBoxCell>;
    onCellChanged: (cell: Compatible<ComboBoxCell>, commit: boolean) => void;
    getCompatibleCell(
        uncertainCell: Uncertain<ComboBoxCell>
    ): Compatible<ComboBoxCell>;
}) => {
    // ステートデータ
    const [useInputValue, setInputValue] = useState<any>(cell.text);
    const [useOptions, setOptions] = useState<any>(cell.options);
    const [useOptionHtml, setOptionHtml] = useState<any>();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // 選択肢のドロップダウンメニュー管理
    const [useDropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
    const [useDropdownSpace, setDropdownSpace] = useState<string>('100%');

    const image = "./img/dropdown.png";

    // セレクトボックス枠の参考値
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 初期化
    useQuery({
        queryKey: ["initComboboxCell", cell.text],
        queryFn: () => {
            setInputValue(cell.text || "");
        },
    });


    /**
     * リストを押下する処理 データコミット
     */
    const handleOptionClick = useCallback((option: IOption) => {
        if (option) {
            // 1. ステート更新
            setInputValue(option.label);
            setIsOpen(false);

            // 2. 選択したデータをコミット
            onCellChanged(
                getCompatibleCell({
                    ...cell,
                    text: option.label,
                }),
                true // コミット確定
            );
        }
    }, [cell, onCellChanged, getCompatibleCell]);

    /**
     * 選択肢を設定
     */
    const optionsSetting = useCallback(async () => {
        let optionHtml: Array<JSX.Element> = [];
        let arrOption: SelectOptions[] = useOptions || [];

        for (const option of arrOption) {
            const isSelected = option.label === useInputValue && useInputValue !== "";
            optionHtml.push(
                <li
                    className={isSelected ? "selected" : ""}
                    key={option.value}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        handleOptionClick(option);
                    }}
                >
                    {option.label}
                </li>
            );
        }

        setOptionHtml(optionHtml);
        return true;
    }, [useOptions, useInputValue, handleOptionClick]);

    useQuery({
        queryKey: ["optionsSetting", useOptions],
        queryFn: optionsSetting,
        refetchOnWindowFocus: false,
    });

    /**
     * リスト開閉処理
     * 2025/11/13 追加 選択肢のドロップダウンメニュー表示方向（上・下）
     */
    const toggleDropdown = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();

        if (isOpen) {
            setIsOpen(false);
            return;
        }

        // 選択肢のドロップダウンメニュー表示方向（上・下）
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const gridtableElm = document.getElementById('grid-table-panel');               // WQM010_検査情報登録
            const configTableElm = document.getElementById('configTable');                  // MNG060_報告書構成 ※ 不用
            const itemTableElm = document.getElementById('itemTable');                      // MNG060_検査項目
            const pointTableElm = document.getElementById('pointTable');                    // MNG060_測定地点
            const textTableElm = document.getElementById('textTable');                      // MNG060_固定文言
            const monthListTableElm = document.getElementById('monthListTable');            // MNG060_月報一覧
            const comboboxCompElm = document.getElementById('combobox_comp_container');
            const toggleStepSize = (comboboxCompElm.clientHeight > 24) ? 42 : 24;

            // 活性しているグリッドテーブルを確認 ※ 要素があり、高さも０ではない場合
            const setGridTableContainerSize = (gridtableElm && gridtableElm.clientHeight > 0) ? gridtableElm
                : (itemTableElm && itemTableElm.clientHeight > 0) ? itemTableElm
                    : (pointTableElm && pointTableElm.clientHeight > 0) ? pointTableElm
                        : (textTableElm && textTableElm.clientHeight > 0) ? textTableElm
                            : monthListTableElm;

            if (setGridTableContainerSize) {
                // 選択肢のドロップダウンメニューのスペースを計算
                const estimatedDropdownHeight = (cell.options.length * 23 <= 253) ? cell.options.length * 23 : 253;

                // 下の残りスペースを計算
                const spaceBelow = setGridTableContainerSize.clientHeight - (rect.bottom - 131);

                // 下の残りスペース < 選択肢のドロップダウンメニューのスペース の場合
                if (spaceBelow < estimatedDropdownHeight) {
                    setDropdownDirection('up');
                    setDropdownSpace((estimatedDropdownHeight + toggleStepSize) + "px");
                } else {
                    // デフォルト：下に表示
                    setDropdownDirection('down');
                    setDropdownSpace("100%");
                }
            }
        }

        setIsOpen(true);
    };

    /**
     * ステートに入力値を指定する処理
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setIsOpen(true);

        // 選択肢調整 (Filtering)
        const newOptionObj = cell.options.filter(
            (option) => option.label.includes(value)
        );

        setOptions(newOptionObj);
    };

    return (
        <>
            <div
                ref={wrapperRef}
                id="combobox_comp_container"
                className={`input_group ${cell.className}`}
                style={{ padding: 0 }}
            >
                <div className={`combobox_search`}>
                    <input
                        id={"combobox_input"}
                        name={"combobox_input"}
                        disabled={false}
                        type="text"
                        className={`combobox_search_input`}
                        autoComplete="off"
                        value={useInputValue}
                        onClick={toggleDropdown}
                        onChange={handleInputChange}
                        onBlur={() => {
                            // 期待時間を設定
                            onCellChanged(
                                getCompatibleCell({
                                    ...cell,
                                    text: useInputValue,
                                }),
                                true // コミット確定
                            );
                            setIsOpen(false); // コンボボックス閉じる
                        }}

                        // グリッドテーブルのイベント競合を防ぐ
                        onCopy={(e) => e.stopPropagation()}
                        onCut={(e) => e.stopPropagation()}
                        onPaste={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
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
                        <div
                            // グリッドテーブルのイベント競合を防ぐ
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                zIndex: 1000,
                                left: 0,
                                // 選択肢のドロップダウンメニューの方向を設定
                                [useDropdownDirection === 'up' ? 'bottom' : 'top']: useDropdownSpace,
                            }}
                        >
                            <ul
                                className={`options`}
                            >
                                {useOptionHtml}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}