// 動画マニュアルサブ画面（モーダル）
import React from 'react';
import { Button, GridTable } from '../../components/common';
import * as Const from '../../common/const';

import { InputText, Select } from '../common';

import { useAtom, useSetAtom } from "jotai";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";

// サイドメニュスタイル
import outlierListModal from '../../scss/modals/outlierListModal.module.scss'
import { Label } from 'recharts';

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";

// 
import {
    ReactGrid,
    Column,
    Row,
    CellChange,
    CheckboxCell,
    DropdownCell,
    NumberCell,
    TextCell,
    DateCell,
    TimeCell
} from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

interface Outlier {
    abnormalType: string;
    pointName: string;
    itemName: string;
    itemValue: string;
    itemUnit: string;
    saisuiKbnName: string;
    inputLowLimit: string;
    reportLowLimit: string;
    statisticValue: string;
}

const getColumns = (): Column[] => [
    { columnId: "abnormalType", width: 200, resizable: true},
    { columnId: "pointName", width: 200, resizable: true },
    { columnId: "itemName", width: 200, resizable: true },
    { columnId: "itemValue", width: 150, resizable: true },
    { columnId: "itemUnit", width: 100, resizable: true },
    { columnId: "saisuiKbnName", width: 100, resizable: true },
    { columnId: "inputLowLimit", width: 150, resizable: true },
    { columnId: "reportLowLimit", width: 150, resizable: true },
    { columnId: "statisticValue", width: 150, resizable: true },
];

const headerRow: Row = {
    rowId: "header",
    height: 35,
    cells: [
        { type: "header", text: "異常値種類"},
        { type: "header", text: "地点" },
        { type: "header", text: "検査項目" },
        { type: "header", text: "値" },
        { type: "header", text: "単位" },
        { type: "header", text: "採水区分" },
        { type: "header", text: "定量下限値" },
        { type: "header", text: "報告下限値" },
        { type: "header", text: "統計値" },
    ]
};

const getRows = (people: Outlier[]): Row[] => [
    headerRow,
    ...people.map<Row>((person, idx) => ({
        rowId: idx,
        cells: [
            { type: "text", text: person.abnormalType, nonEditable: true, className: (person.abnormalType == "下限値") ? "outlier-over-item" : "outlier-c-over-item"},
            { type: "text", text: person.pointName, nonEditable: true },
            { type: "text", text: person.itemName, nonEditable: true },
            { type: "text", text: person.itemValue, nonEditable: true },
            { type: "text", text: person.itemUnit, nonEditable: true },
            { type: "text", text: person.saisuiKbnName, nonEditable: true },
            { type: "text", text: person.inputLowLimit, nonEditable: true },
            { type: "text", text: person.reportLowLimit, nonEditable: true },
            { type: "text", text: person.statisticValue, nonEditable: true },
        ]
    }))
];

// ヘッダー
const HeaderArea = (): JSX.Element => {
    return (
        <div
            className={`${outlierListModal.outlier_list_modal_header}`}
        >
            <span>異常値一覧</span>
        </div>
    );
};

// 異常値一覧表
const OurlierListTableArea = (): JSX.Element => {
    // 編集用のメニュー
    const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
    const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

    const [useOutlinerModalDataLists, setOutlinerModalDataLists] = useAtom(AtomCommon.outlinerModalDataLists);

    React.useEffect(() => {
        if (dataSideEditMenuSelected) {
            setMenuEdit(prev => ({ ...prev, text: dataSideEditMenuSelected.textEdit, parentId: dataSideEditMenuSelected.parentIdEdit }));
        }
    }, [])

    let newRowObj: any = [];
    useOutlinerModalDataLists.forEach(item => {
        newRowObj.push({
            abnormalType: item.abnormalType ?? '',
            pointName: item.pointName ?? '',
            itemName: item.itemName ?? '',
            itemValue: item.data ?? '',
            itemUnit: item.inputUnit ?? '',
            saisuiKbnName: (item.saisuiKbnName) ? item.saisuiKbnName : '',
            inputLowLimit: (item.inputLowLimit ? item.inputLowLimit : ''),
            reportLowLimit: (item.reportLowLimit) ? item.reportLowLimit : '',
            statisticValue: (item.calUpLow) ? item.calUpLow : '',
        });
    });

    const getOutLier = (): Outlier[] => newRowObj;

    const [people] = React.useState<Outlier[]>(getOutLier());
    const [columns, setColumns] = React.useState<Column[]>(getColumns());

    const rows = getRows(people);

    // カラムサイズ調整
    const handleColumnResize = (ci: any, width: number) => {
        setColumns((prevColumns) => {
            const columnIndex = prevColumns.findIndex(el => el.columnId === ci);
            const resizedColumn = prevColumns[columnIndex];
            const updatedColumn = { ...resizedColumn, width };
            prevColumns[columnIndex] = updatedColumn;
            return [...prevColumns];
        });
    }
    return (
        <>
            <div id='outlier_list_modal_table_panel' className={`contents_panel ${outlierListModal.outlier_list_modal_table_panel}`}>
                <ReactGrid
                    rows={rows}
                    columns={columns}
                    stickyTopRows={1}
                    enableRowSelection={true}
                    onColumnResized={handleColumnResize}
                    enableFullWidthHeader
                />
            </div>
        </>
    )
}

// フッター
const FooterArea = (): JSX.Element => {
    // 編集用のメニュー
    const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
    const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

    // 異常値一覧モダールの開閉フラグ
    const [useOutlinerModalShowFlg, setOutlinerModalShowFlg] = useAtom(AtomCommon.outlinerModalShowFlg);

    const saveEditMenu = () => {
        // メッセージ
        if (!window.confirm('編集を実行してもよろしいですか？')) {
            return;
        }

        setSideEditMenuSelected(prev => ({ ...prev, parentIdEdit: dataMenuEdit.parentId, textEdit: dataMenuEdit.text }));
        setMenuEdit(prev => ({ ...prev, text: '', parentId: '' }));
    }

    return (
        <div
            className={`${outlierListModal.outlier_list_modal_footer}`}
            id="modalFooter">
            <div className={`${outlierListModal.outlier_list_modal_footer_button}`}>
                {/* 閉じるボタン */}
                <Button
                    title="閉じる"
                    width="100px"
                    margin="0px 0px 0px 15px"
                    className="footer_cencel_btn footer_btn_left button_active_white"
                    onClick={() => {
                        setOutlinerModalShowFlg(!useOutlinerModalShowFlg);
                    }}
                />
            </div>
        </div>
    );
};

export const OutlierListModal = (): JSX.Element => {

    return (
        <div
            className='modal'
        >
            <div
                className='modal_content'
            >
                <HeaderArea />
                <div
                    className={`contents_panel ${outlierListModal.outlier_list_modal_panel_content}`}
                >
                    {/* 異常値一覧表 */}
                    <OurlierListTableArea />

                </div>
                <FooterArea />
            </div>
        </div>
    );
};

export default OutlierListModal;
