import { atom } from 'jotai';

// メニューラベル管理子画面_表示フラグ
export const inspectionItemModalFlgState = atom<boolean>(false);

// 
export const dataMenuEdited = atom<any>({ text: '', parentId: '' });

// 管理データ
export interface inspectionItemInterface {
    sortColumn: string;
    sortOrder: string;
    settingInspItem: string;
    inspItemNo: string;
    inspItemDspName: string;
    inspItemDaiCateName: string;
    inspItemTyuCateName: string;
}
export const defaultInspectionItemState: inspectionItemInterface = {
    sortColumn: "",
    sortOrder: "ASC",
    settingInspItem: "",
    inspItemNo: "",
    inspItemDspName: "",
    inspItemDaiCateName: "",
    inspItemTyuCateName: "",
};
export const inspectionItemState = atom<inspectionItemInterface>(
    defaultInspectionItemState
);

export const inspectionItemHiddenState = atom<inspectionItemInterface>(
    defaultInspectionItemState
);

// 処理実施日時
export const menuLabelDisplayTime = atom<any>();

// 検索結果 定義
export interface inspItemListInterface {
    item_no: string;                             // 項目番号
    item_dsp_name: string;                        // 項目名称画面
    item_report_name: string;                     // 項目名称報告書
    item_unit: string;                           // 単位
    constant_qualitative_flg: string;             // 定量定性識別フラグ
    input_type: string;                          // 入力タイプ
    item_dai_category_no: string;                  // 項目大分類番号
    item_dai_category_name: string;                // 項目大分類名称
    item_tyu_category_no: string;                  // 項目中分類番号
    item_tyu_category_name: string;                // 項目中分類名称
}

// 検索項目
export const inspItemListState = atom<inspItemListInterface[]>([]);


// 項目管理データ
export interface inspectionItemMangeInterface {
    selectedItemKey: number;
    selectedItemNo: number;
    selectedItemName: string;
    changedItemNo: string;
    changedItemName: string;
    changedConstantQualitativeFlg: string;
    changedReportName: string;
}
export const defaultInspectionItemManageState: inspectionItemMangeInterface = {
    selectedItemKey: null,
    selectedItemNo: null,
    selectedItemName: "",
    changedItemNo: "",
    changedItemName: "",
    changedConstantQualitativeFlg: "",
    changedReportName: "",
};
export const inspectionItemManageState = atom<inspectionItemMangeInterface>(
    defaultInspectionItemManageState
);