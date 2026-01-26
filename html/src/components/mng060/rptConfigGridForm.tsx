//【汎用】
import React from "react";
import { SetStateAction, useAtomValue, useAtom } from "jotai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { InputText, Select } from "../common";
import * as Const from "../../common/const";

//【スタイル】グリッドテーブルスタイル
import cssGridTable from "../../scss/common/gridTable.module.scss";
import inputMenuManageModal from "../../scss/modals/inputMenuManageModal.module.scss";

//【ライブラリー】ReactGrid
import {
    ReactGrid,
    Row,
    CellChange,
    TextCell,
    Id,
    CheckboxCell,
    DropdownCell,
    NumberCell,
    DateCell,
    TimeCell,
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";


// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { GridTableStateContainer } from '../../components/containers/gridTableStateContainer';
import { DspConfigGridTableStateContainer } from '../../components/containers/dspConfigGridTableStateContainer';

import * as AtomMng060 from "../../stores/atomMNG060";


// 属性
interface Props {
    id?: string;
    dataGrid?: any;
    setterName?: (value: SetStateAction<any>) => void;
}

// コンポーネントエクスポート
export var RptConfigGridForm: React.FC<Props> = function ({
    id,
    dataGrid,
    setterName,
}) {
    /**
     * 1.カラムヘッダ設定
     *
     */
    interface ColumnSetting {
        columnId: string;
        width: number;
        resizable?: boolean;
    }

    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                                         // 汎用
    const gridTableState = GridTableStateContainer();                                   // グリッドテーブル
    const dspConfigGridTable = DspConfigGridTableStateContainer();                      // 入力画面構成マスタ

    /**
     * ローカルステート
     * 
     */
    const [columnSetting, setColumnSetting] = React.useState<ColumnSetting[]>([]);
    const [useDataGridColumn, setDataGridColumn] = React.useState<any>();                                       // カラム情報
    const [useDataGridColumnHdr, setDataGridColumnHdr] = React.useState<any>();                                 // カラムヘッダ情報
    const [useDataGridInterface, setDataGridInterface] = React.useState<any>();                                 // データ型
    const [useDataInTable, setDataInTable] = React.useState<any[]>([]);                                         // GridTable形
    const [useDataGridRow, setDataGridRow] = React.useState<any>();                                             // データ情報

    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    const [useEditingData, setEditingData] = useAtom(
        AtomMng060.mng060EditData(id)
    );

    /** セレクトボックス 入力メニュー */
    const optionInputMenu = useAtomValue(AtomMng060.mng060Options("input_menu"));
    /** セレクトボックス 採水地点 */
    const optionPoint = useAtomValue(AtomMng060.mng060Options("point"));
    /** セレクトボックス 検査区分 */
    const optionKbn = useAtomValue(AtomMng060.mng060Options("inspection_kbn"));
    /** セレクトボックス 報告書タイプ */
    const optionType = useAtomValue(AtomMng060.mng060Options("report_type"));
    /** セレクトボックス 検査項目 */
    const optionItem = useAtomValue(AtomMng060.mng060Options("item"));
    /** セレクトボックス 報告書 */
    const optionReport = useAtomValue(AtomMng060.mng060Options("report"));

    // 引数のデータを指定
    const setDataToGrid = () => {
        setEditingData(dataGrid.rowData);

        return true;
    };

    // 引数のデータを指定
    const { isFetching, data } = useQuery({
        queryKey: ["dataGrid", dataGrid],
        queryFn: setDataToGrid,
    });

    useQuery({
        queryKey: ["useInputDspConfigStateUpdate", dspConfigGridTable.useInputDspConfigState],
        queryFn: () => {
            // データ内容_GridTable形
            setDataInTable(getRows(dataGrid.rowData));

            return true;
        },
    });

    // データ内容を設定_GridTable形
    const getRows = (rows: any[]): Row[] => [
        {
            rowId: "header",
            height: 50,
            cells: useDataGridColumnHdr,
        },
        ...rows.map<Row>((row, index) => {
            const setRowCells = useDataGridInterface.map((item) => {
                const cellValue = dspConfigGridTable.useInputDspConfigState[item.interfaceName];
                let setDefaultOption: boolean = true;
                switch (item.interfaceType) {
                    case "string":
                        // 表示のみ
                        return {
                            type: "text",
                            text: cellValue ?? "",
                            nonEditable: true,
                            className: "text_align_center disabled"
                        };
                    case "text":
                        // テキスト
                        return {
                            type: "text",
                            text: cellValue ?? "",
                        };
                    case "select":
                        // セレクトボックス
                        let setText = "";
                        let setOptions = [];

                        if (item.interfaceName == "inputDspInspKbnCode") {
                            setText = (dspConfigGridTable.useSelectInspectKbnState.find(({ value }) => value == cellValue)) ? dspConfigGridTable.useSelectInspectKbnState.find(({ value }) => value == cellValue).label : "";
                            setOptions = dspConfigGridTable.useSelectInspectKbnState ?? [];
                        } else {
                            setText = (Const.CONFIRM_BTN_FLG_LISTS.find(({ value }) => value == cellValue)) ? Const.CONFIRM_BTN_FLG_LISTS.find(({ value }) => value == cellValue).label : "";
                            setOptions = Const.CONFIRM_BTN_FLG_LISTS ?? [];
                            setDefaultOption = false;
                        }

                        return {
                            type: "select",
                            selectedValue: cellValue,
                            value: cellValue,
                            text: setText,
                            options: setOptions,
                            defaultOption: setDefaultOption,
                        };
                    default:
                        // セル型不明
                        console.warn("Unknown cell type:", item.interfaceType);
                        return {
                            type: "text",
                            text: cellValue ?? "",
                        };
                }
            });

            // セル設定
            return {
                rowId: index,
                cells: setRowCells,
            };
        }),
    ];

    // データ内容を更新
    const applyChanges = (
        changes: CellChange<
            TextCell | NumberCell | CheckboxCell | DropdownCell | DateCell | TimeCell
        >[],
        prevData: any[]
    ): any[] => {
        changes.forEach((change: any) => {
            const dataRowId = change.rowId;
            const fieldName = change.columnId;
            let dataRow = prevData.find((d) => d.rowId === dataRowId);

            const dataColumnIdx = useDataGridColumn.findIndex(
                (column) => column.columnId == fieldName
            );

            if (change.type === "text") {
                dataRow.cells[dataColumnIdx].text = change.newCell.text as never;
            } else if (change.type === "number") {
                dataRow.cells[dataColumnIdx].value = change.newCell.value as never;
            } else if (change.type === "checkbox") {
                dataRow.cells[dataColumnIdx].checked = change.newCell.checked as never;
            } else if (change.type === "dropdown") {
                dataRow.cells[dataColumnIdx].inputValue = change.newCell
                    .inputValue as never;
            } else if (change.type === "select") {
                dataRow.cells[dataColumnIdx].selectedValue = change.newCell.value as never;
                dataRow.cells[dataColumnIdx].value = change.newCell.value as never;

                // 項目確認
                if (fieldName == "inputDspInspKbnCode") {
                    if (dspConfigGridTable.useSelectInspectKbnState.find(({ value }) => value == change.newCell.value)) {
                        dataRow.cells[dataColumnIdx].text = dspConfigGridTable.useSelectInspectKbnState.find(({ value }) => value == change.newCell.value).label as never;
                    } else {
                        dataRow.cells[dataColumnIdx].text = "";
                    }
                } else {
                    if (Const.CONFIRM_BTN_FLG_LISTS.find(({ value }) => value == change.newCell.value)) {
                        dataRow.cells[dataColumnIdx].text = Const.CONFIRM_BTN_FLG_LISTS.find(({ value }) => value == change.newCell.value).label as never;
                    } else {
                        dataRow.cells[dataColumnIdx].text = "";
                    }
                }
            } else if (change.type === "date") {
                dataRow.cells[dataColumnIdx].date = change.newCell.date as never;
            } else if (change.type === "time") {
                dataRow.cells[dataColumnIdx].time = change.newCell.time as never;
            } else {
                console.log("ERROR", change.type, dataRow.cells[dataColumnIdx]);
            }
        });
        return [...prevData];
    };

    // データ変更
    const handleChanges = (changes: CellChange<any>[]) => {
        setDataInTable((useDataInTable) => applyChanges(changes, useDataInTable));
    };

    // データ変更した後、登録用のステートも更新
    useQuery({
        queryKey: ["useDataInTable", useDataInTable],
        queryFn: () => {
            // データ設定
            const gridDspConfData: any = useDataInTable[1].cells;

            // 登録用のステート
            dspConfigGridTable.setInputDspConfigState({
                ...dspConfigGridTable.useInputDspConfigState,
                inputDspNo: gridDspConfData[0].text,
                inputDspName: gridDspConfData[1].text,
                inputDspInspKbnCode: gridDspConfData[2].value,
                inputDspInspKbnName: gridDspConfData[2].text,
                inputDspPointCnt: gridDspConfData[3].text,
                inputDspItemCnt: gridDspConfData[4].text,
                inputDspConfFlg: (gridDspConfData[5].text == "表示") ? 1 : 0,
            });

            // 編集状態を設定
            commonState.setInputEditingFlg(true);

            return true;
        },
    });

    const handleColumnResize = (ci: Id, width: number) => {
        setColumnSetting((prevColumns) => {
            const columnIndex = prevColumns.findIndex((el) => el.columnId === ci);
            const resizedColumn = prevColumns[columnIndex];
            const updatedColumn = { ...resizedColumn, width };
            prevColumns[columnIndex] = updatedColumn;
            return [...prevColumns];
        });
    };

    // 入力前に戻る
    const discardAllEditingData = async () => {
        queryClient.invalidateQueries({ queryKey: ["dataGrid"] });

        commonState.setInputEditingFlg(false); // 編集状態リセット
        gridTableState.setGridTableFooterBtnClick("");
    };

    // ボタン押下操作
    const checkFooterButtonClick = async () => {
        if (gridTableState.useGridTableFooterBtnClick == "入力前に戻る") {
            discardAllEditingData();
        }
        return true;
    };

    useQuery({
        queryKey: ["checkFooterButtonClick", gridTableState.useGridTableFooterBtnClick],
        queryFn: checkFooterButtonClick,
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    // 入力：テキストボックスを更新
    const changeInputText = (value: any, index: number) => {
        // 登録用のステート
        let setNewObj = [];
        useEditingData[0].forEach((element, key) => {
            if (key == index) {
                setNewObj.push({
                    colName: element.colName,
                    colNo: element.colNo,
                    text: value,
                    type: element.type,
                    value: value
                })
            } else {
                setNewObj.push(element);
            }
        });
        setEditingData([setNewObj]);
    };

    // 入力：セレクトボックスを更新
    const changeSelectData = (selected: any, index: number) => {
        // 登録用のステート
        let setNewObj = [];
        useEditingData[0].forEach((element, key) => {
            if (key == index) {
                setNewObj.push({
                    colName: element.colName,
                    colNo: element.colNo,
                    text: selected.label,
                    type: element.type,
                    value: selected.value
                })
            } else {
                setNewObj.push(element);
            }
        });
        setEditingData([setNewObj]);
    };

    return (
        <>
            <div style={{ display: "flex", width: "100%" }}>
                {/* 左フォーム */}
                <div
                    className={(commonState.useResultMessage.length > 0) ? `${cssGridTable.grid_table_panel} mng050_grid_tabel_with_msg` : `${cssGridTable.grid_table_panel} mng050_grid_tabel_without_msg`}
                    style={{ padding: 15 }}
                >
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>報告書番号</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][0].value : null}
                                disabled={true}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>報告書名称</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][1].value : null}
                                onChange={({
                                    target: { value },
                                }: React.ChangeEvent<HTMLInputElement>) => {
                                    changeInputText(value, 1);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>報告書タイプ</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][2].value : null}
                                width="100%"
                                margin='0'
                                options={optionType}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = optionType.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 2);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>報告書分類</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][3].value : null}
                                width="100%"
                                margin='0'
                                options={Const.rptCategoryOptions}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = Const.rptCategoryOptions.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 3);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>データシートタイプ</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][4].value : null}
                                width="100%"
                                margin='0'
                                options={Const.dataSheetOptions}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = Const.dataSheetOptions.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 4);
                                }}
                            />
                        </div>
                    </div>
                    {/* 2025/12 ※ 不用 */}
                    {/* <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>入力画面</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][5].value : null}
                                width="100%"
                                margin='0'
                                options={optionInputMenu}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = optionInputMenu.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 5);
                                }}
                            />
                        </div>
                    </div> */}
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>地点</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][6].value : null}
                                width="100%"
                                margin='0'
                                options={optionPoint}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = optionPoint.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 6);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>項目</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][7].value : null}
                                width="100%"
                                margin='0'
                                options={optionItem}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = optionItem.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 7);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 右フォーム */}
                <div
                    className={(commonState.useResultMessage.length > 0) ? `${cssGridTable.grid_table_panel} mng050_grid_tabel_with_msg` : `${cssGridTable.grid_table_panel} mng050_grid_tabel_without_msg`}
                    style={{ padding: 20 }}
                >
                    {/* 2025/12 ※ 不用 */}
                    {/* <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>マスクパターン</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][8].value : null}
                                width="100%"
                                margin='0'
                                options={Const.maskPatternOptions}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = Const.maskPatternOptions.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 8);
                                }}
                            />
                        </div>
                    </div> */}
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>縦開始セル名</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][9].value : null}
                                onChange={({
                                    target: { value },
                                }: React.ChangeEvent<HTMLInputElement>) => {
                                    changeInputText(value, 9);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>横開始セル名</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][10].value : null}
                                onChange={({
                                    target: { value },
                                }: React.ChangeEvent<HTMLInputElement>) => {
                                    changeInputText(value, 10);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>検査区分</span>
                        <div style={{ width: "80%" }}>
                            <Select
                                dataTestId="mng040-4-1"
                                className="disabled_bg_color"
                                name="mng040-search-year"
                                defaultOption={true}
                                value={(useEditingData[0]) ? useEditingData[0][11].value : null}
                                width="100%"
                                margin='0'
                                options={optionKbn}
                                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                    const findSelceted = optionKbn.find((selected) => selected.value == value);
                                    changeSelectData(findSelceted, 11);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>上限表示</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][12].value : null}
                                onChange={({
                                    target: { value },
                                }: React.ChangeEvent<HTMLInputElement>) => {
                                    changeInputText(value, 12);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>下限表示</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][13].value : null}
                                onChange={({
                                    target: { value },
                                }: React.ChangeEvent<HTMLInputElement>) => {
                                    changeInputText(value, 13);
                                }}
                            />
                        </div>
                    </div>
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>空白表示</span>
                        <div style={{ width: "80%" }}>
                            <InputText
                                id="side-input-menu-name"
                                name="side-input-menu-name"
                                width="100%"
                                margin="0"
                                max={256}
                                contentsFlg={true}
                                value={(useEditingData[0]) ? useEditingData[0][14].value : null}
                                onChange={({
                                    target: { value },
                                }: React.ChangeEvent<HTMLInputElement>) => {
                                    changeInputText(value, 14);
                                }}
                            />
                        </div>
                    </div>
                    {(useEditingData[0] && String(useEditingData[0][15].value) !== "") && (
                        <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                            <span className={`${inputMenuManageModal.form_label}`} style={{ width: 190 }}>自動様式更新</span>
                            <div style={{ width: "80%" }}>
                                <Select
                                    dataTestId="mng040-4-1"
                                    className="disabled_bg_color"
                                    name="mng040-search-year"
                                    defaultOption={false}
                                    value={(useEditingData[0]) ? useEditingData[0][15].value : null}
                                    width="100%"
                                    margin='0'
                                    options={Const.TEMPLATE_AUTO_UPDATE_FLG_LISTS}
                                    onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                        const findSelceted = Const.TEMPLATE_AUTO_UPDATE_FLG_LISTS.find((selected) => selected.value == value);
                                        changeSelectData(findSelceted, 15);
                                    }}
                                />
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </>
    );
};
