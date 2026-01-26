//【汎用】
import React from "react";
import { SetStateAction } from "jotai";
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

//【コンポネント】セレクトボックスセル
import {
    SelectCell,
    SelectCellTemplate,
} from "../../components/common/grid-table-custom-cells/select.cell.tsx";

//【ステート】汎用
import * as AtomDspConfigGridTable from "../../stores/atomDspConfigGridTable";


// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { GridTableStateContainer } from '../../components/containers/gridTableStateContainer';
import { DspConfigGridTableStateContainer } from '../../components/containers/dspConfigGridTableStateContainer';

// 属性
interface Props {
    dataGrid?: any;
    setterName?: (value: SetStateAction<any>) => void;
}

// コンポーネントエクスポート
export var DspConfigGridTable: React.FC<Props> = function ({
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

    // 引数のデータを指定
    const setDataToGrid = () => {
        // ステートクリア
        dspConfigGridTable.setInputDspConfigState(AtomDspConfigGridTable.defaultInputDspConfigState);
        dspConfigGridTable.setSelectInspectKbnState([]);
        // commonState.setInputEditingFlg(false); // 編集状態リセット

        let setNewColumn: any = []; // カラム情報
        let setNewColumnHeader: any = []; // カラムヘッダ情報

        // カラムデータを取得
        dataGrid.columnData?.forEach((column) => {
            // カラム情報
            setNewColumn.push({
                columnId: column.columnName,
                width: column.width,
                resizable: column.resizeAble,
            });

            // カラムヘッダ情報
            setNewColumnHeader.push({
                type: "header",
                text: column.columnTitle,
            });
        });

        // GridTable_カラム形
        const getColumns = (): ColumnSetting[] => setNewColumn;

        // 列設定
        setDataGridColumn(setNewColumn);
        setColumnSetting(getColumns());
        setDataGridColumnHdr(setNewColumnHeader);

        // 行設定
        setDataGridRow(dataGrid.rowData);
        dspConfigGridTable.setInputDspConfigState({
            ...dspConfigGridTable.useInputDspConfigState,
            inputDspNo: dataGrid.rowData[0].inputDspNo,
            inputDspName: dataGrid.rowData[0].inputDspName,
            inputDspInspKbnCode: dataGrid.rowData[0].inputDspInspKbnCode,
            inputDspInspKbnName: dataGrid.rowData[0].inputDspInspKbnName,
            inputDspPointCnt: dataGrid.rowData[0].inputDspPointCnt,
            inputDspItemCnt: dataGrid.rowData[0].inputDspItemCnt,
            inputDspConfFlg: dataGrid.rowData[0].inputDspConfFlg,
            inputSheetTitle: dataGrid.rowData[0].inputSheetTitle,
        });

        // 検査区分選択肢を指定
        dspConfigGridTable.setSelectInspectKbnState(dataGrid.inspectionKbnSelect);

        // データインターフェース設定
        setDataGridInterface(dataGrid.rowInterface);

        // データ内容_GridTable形
        setDataInTable(getRows(dataGrid.rowData));

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
                inputSheetTitle: gridDspConfData[6].text,
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

    return (
        <>
            <div
                className={(commonState.useResultMessage.length > 0) ? `${cssGridTable.grid_table_panel} mng050_grid_tabel_with_msg` : `${cssGridTable.grid_table_panel} mng050_grid_tabel_without_msg`}
                style={{ padding: 15 }}
            >
                {/* <ReactGrid
                    rows={useDataInTable}
                    columns={columnSetting}
                    onCellsChanged={handleChanges}
                    onColumnResized={handleColumnResize}
                    // stickyLeftColumns={1}
                    // stickyTopRows={1}
                    // enableRangeSelection
                    customCellTemplates={{
                        select: new SelectCellTemplate(),
                    }}
                /> */}

                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>入力画面番号</span>
                    <div style={{ width: "80%" }}>
                        <InputText
                            id="input-dsp-config-no"
                            name="input-dsp-config-no"
                            width="20%"
                            margin="0"
                            max={256}
                            contentsFlg={true}
                            value={dspConfigGridTable.useInputDspConfigState.inputDspNo}
                            disabled={true}
                            onChange={({
                                target: { value },
                            }: React.ChangeEvent<HTMLInputElement>) => {

                            }}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>入力画面名称</span>
                    <div style={{ width: "80%" }}>
                        <InputText
                            id="input-dsp-config-name"
                            name="input-dsp-config-name"
                            width="60%"
                            margin="0"
                            max={256}
                            contentsFlg={true}
                            value={dspConfigGridTable.useInputDspConfigState.inputDspName}
                            onChange={({
                                target: { value },
                            }: React.ChangeEvent<HTMLInputElement>) => {
                                // 登録用のステート
                                dspConfigGridTable.setInputDspConfigState({
                                    ...dspConfigGridTable.useInputDspConfigState,
                                    inputDspName: value,
                                });

                                // 編集状態を設定
                                commonState.setInputEditingFlg(true);
                            }}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>検査区分名称</span>
                    <div style={{ width: "80%" }}>
                        <Select
                            dataTestId="mng040-4-1"
                            className="disabled_bg_color"
                            id="input-dsp-config-kbn"
                            name="input-dsp-config-kbn"
                            defaultOption={true}
                            value={String(dspConfigGridTable.useInputDspConfigState.inputDspInspKbnCode)}
                            width="60%"
                            margin='0'
                            options={dspConfigGridTable.useSelectInspectKbnState}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                const findSelceted = dspConfigGridTable.useSelectInspectKbnState.find((selected) => selected.value == value);

                                // 登録用のステート
                                dspConfigGridTable.setInputDspConfigState({
                                    ...dspConfigGridTable.useInputDspConfigState,
                                    inputDspInspKbnCode: findSelceted.value,
                                    inputDspInspKbnName: findSelceted.label,
                                });

                                // 編集状態を設定
                                commonState.setInputEditingFlg(true);
                            }}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>地点数</span>
                    <div style={{ width: "80%" }}>
                        <InputText
                            id="input-dsp-config-point-ctn"
                            name="input-dsp-config-point-ctn"
                            width="20%"
                            margin="0"
                            max={256}
                            contentsFlg={true}
                            value={dspConfigGridTable.useInputDspConfigState.inputDspPointCnt}
                            disabled={true}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>項目数</span>
                    <div style={{ width: "80%" }}>
                        <InputText
                            id="input-dsp-config-item-ctn"
                            name="input-dsp-config-item-ctn"
                            width="20%"
                            margin="0"
                            max={256}
                            contentsFlg={true}
                            value={dspConfigGridTable.useInputDspConfigState.inputDspItemCnt}
                            disabled={true}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>確定ボタンフラグ</span>
                    <div style={{ width: "80%" }}>
                        <Select
                            dataTestId="mng040-4-1"
                            className="disabled_bg_color"
                            id="input-dsp-config-conf-flg"
                            name="input-dsp-config-conf-flg"
                            defaultOption={true}
                            value={String(dspConfigGridTable.useInputDspConfigState.inputDspConfFlg)}
                            width="20%"
                            margin='0'
                            options={Const.CONFIRM_BTN_FLG_LISTS}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                // 登録用のステート
                                dspConfigGridTable.setInputDspConfigState({
                                    ...dspConfigGridTable.useInputDspConfigState,
                                    inputDspConfFlg: (value == "1") ? 1 : 0,
                                });

                                // 編集状態を設定
                                commonState.setInputEditingFlg(true);
                            }}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 35 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 150 }}>取込シート名</span>
                    <div style={{ width: "80%" }}>
                        <InputText
                            id="input-dsp-sheet-title"
                            name="input-dsp-sheet-title"
                            width="60%"
                            margin="0"
                            max={256}
                            contentsFlg={true}
                            value={String(dspConfigGridTable.useInputDspConfigState.inputSheetTitle)}
                            onChange={({
                                target: { value },
                            }: React.ChangeEvent<HTMLInputElement>) => {
                                // 登録用のステート
                                dspConfigGridTable.setInputDspConfigState({
                                    ...dspConfigGridTable.useInputDspConfigState,
                                    inputSheetTitle: value,
                                });

                                // 編集状態を設定
                                commonState.setInputEditingFlg(true);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
