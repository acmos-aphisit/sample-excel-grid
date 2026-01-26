// メニューラベル管理画面（モーダル）
import React from 'react';
import { Api, getMessage } from "../../common/api";
import { Button } from '../common';
import * as Const from '../../common/const';
import * as Common from "../../common/common";

import { InputText, Select, MessageArea } from '../common';

import { useAtom, useAtomValue, useSetAtom, SetStateAction } from "jotai";

import { useLocation } from "react-router-dom";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomInspectionItemSetting from "../../stores/atomInspectionItemSetting";

import * as AtomWQM020 from "../../stores/atomWQM020";

// サイドメニュスタイル
import outlierListModal from '../../scss/modals/outlierListModal.module.scss'
import inspectionItemSettingModal from '../../scss/modals/inspectionItemSettingModal.module.scss'

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// 日時管理ライブラリー
import moment from "moment";

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

// ローディング
import Loading from "../../components/layouts/loading";

// ヘッダー
const HeaderArea = (): JSX.Element => {
    // 管理データ
    const useMenuLabelState = useAtomValue(AtomInspectionItemSetting.inspectionItemState);

    return (
        <div
            className={`${outlierListModal.outlier_list_modal_header}`}
        >
            <span>検査項目設定</span>
        </div>
    );
};

// 検査項目の検索条件
const InspItemSearchCondArea = (): JSX.Element => {
    // 管理データ
    const [useInspItemState, setInspItemState] = useAtom(AtomInspectionItemSetting.inspectionItemState);

    // 検査項目大分類マスタ
    const [useSelectDai, setSelectDai] = React.useState<{ label: string, value: string }[]>();

    // 検査項目中分類マスタ
    const [useSelectTyu, setSelectTyu] = React.useState<{ label: string, value: string }[]>();

    // メッセージ
    const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

    // 処理実施日時
    const [useDisplayTime, setDisplayTime] = useAtom(AtomInspectionItemSetting.menuLabelDisplayTime);

    // 初期化
    const inspItemSettingInit = async () => {
        // エラーメッセージ初期化
        setResultMessage([]);

        // 選択肢情報を取得
        Api.get("/getItemSettingSelection", setResultMessage)
            .then((data: any) => {
                if (data.length <= 0) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
                    setResultMessage(errorInfo);
                } else {
                    // 検査項目大分類選択肢を設定
                    let newSelectionDai: { label: string, value: string }[] = [{ label: "", value: "" }];
                    if (data.itemDaiCategoryData?.length > 0) {
                        data.itemDaiCategoryData?.forEach((item) => {
                            newSelectionDai.push({
                                label: item.item_dai_category_name,
                                value: item.item_dai_category_no,
                            });
                        });
                    }
                    setSelectDai(newSelectionDai);

                    // 検査項目中分類選択肢を設定
                    let newSelectionTyu: { label: string, value: string }[] = [{ label: "", value: "" }];
                    if (data.itemTyuCategoryData?.length > 0) {
                        data.itemTyuCategoryData?.forEach((item) => {
                            newSelectionTyu.push({
                                label: item.item_tyu_category_name,
                                value: item.item_tyu_category_no,
                            });
                        });
                    }
                    setSelectTyu(newSelectionTyu);
                    setDisplayTime(data.displayTime);
                }
            })
            .catch((error: Error) => {
                // 内部エラーメッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    setResultMessage(errorInfo);
                }
            });

        return true;
    };

    useQuery({
        queryKey: ["inspItemSettingInit"],
        queryFn: async () => {
            await inspItemSettingInit();
            return true;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });


    return (
        <>
            <div className={`container_row ${inspectionItemSettingModal.form_top_cond_container}`}>
                <div className={`${inspectionItemSettingModal.form_top_cond_input_form}`}>
                    <span className={`${inspectionItemSettingModal.form_cond_label}`} style={{ width: "130px" }}>検査項目番号</span>
                    <InputText
                        id='side-menu-name'
                        name='side-menu-name'
                        width='90%'
                        margin='0'
                        max={50}
                        contentsFlg={true}
                        value={useInspItemState.inspItemNo}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setInspItemState(prev => ({ ...prev, inspItemNo: value }));
                        }}
                    />
                </div>

                <div className={`${inspectionItemSettingModal.form_top_cond_input_form}`}>
                    <span className={`${inspectionItemSettingModal.form_cond_label}`} style={{ width: "80px" }}>名称画面</span>
                    <InputText
                        id='side-menu-name'
                        name='side-menu-name'
                        width='90%'
                        margin='0'
                        max={50}
                        contentsFlg={true}
                        value={useInspItemState.inspItemDspName}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setInspItemState(prev => ({ ...prev, inspItemDspName: value }));
                        }}
                    />
                </div>
                <div className={`${inspectionItemSettingModal.form_top_cond_input_form}`}>
                    <span className={`${inspectionItemSettingModal.form_cond_label}`} style={{ width: "105px" }}>大分類名称</span>
                    <Select
                        className="disabled_bg_color"
                        name="side-menu-parent"
                        value={useInspItemState.inspItemDaiCateName}
                        width="90%"
                        margin='0'
                        options={useSelectDai}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setInspItemState(prev => ({ ...prev, inspItemDaiCateName: value }));
                        }}
                    />
                </div>
                <div className={`${inspectionItemSettingModal.form_top_cond_input_form}`}>
                    <span className={`${inspectionItemSettingModal.form_cond_label}`} style={{ width: "105px" }}>中分類名称</span>
                    <Select
                        className="disabled_bg_color"
                        name="side-menu-parent"
                        value={useInspItemState.inspItemTyuCateName}
                        width="90%"
                        margin='0'
                        options={useSelectTyu}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setInspItemState(prev => ({ ...prev, inspItemTyuCateName: value }));
                        }}
                    />
                </div>



            </div>
        </>
    )

}

// メニューラベル管理
const InspItemSearchArea = (): JSX.Element => {
    // メッセージ
    const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

    // 親ラベルリスト
    const [useMenuLabelParentList, setMenuLabelParentList] = useAtom(
        AtomSideMasterMenu.sideMenuLabelParentState
    );

    // 所属課データ
    const [useAffiliationList, setAffiliationList] = useAtom(
        AtomSideMasterMenu.sideMenuAffiliationState
    );

    // 管理データ
    const [useMenuLabelState, setMenuLabelState] = useAtom(AtomInspectionItemSetting.inspectionItemState);

    // 編集用のメニュー
    const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
    const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

    React.useEffect(() => {
        if (dataSideEditMenuSelected) {
            setMenuEdit(prev => ({ ...prev, text: dataSideEditMenuSelected.textEdit, parentId: dataSideEditMenuSelected.parentIdEdit }));
        }
    }, [])

    // 所属課選択肢
    const [useSelectionAffiliation, setSelectAffiliation] = React.useState<{ label: string, value: string }[]>();

    // 親ラベル選択肢
    const [useSelectParentMenu, setSelectParentMenu] = React.useState<{ label: string, value: string }[]>();

    // 処理実施日時
    const [useDisplayTime, setDisplayTime] = useAtom(AtomInspectionItemSetting.menuLabelDisplayTime);

    // パス確認
    const url = useLocation();

    //
    const queryClient = useQueryClient();

    // 項目管理データ
    const [useInspectionItemManageState, setInspectionItemManageState] = useAtom(AtomInspectionItemSetting.inspectionItemManageState);

    return (
        <>
            <div id='inspection-item-setting-modal-search'>
                <div className={`container_row ${inspectionItemSettingModal.form_top_container}`}>
                    <span className={`${inspectionItemSettingModal.form_label}`}>設定済検査項目名称</span>
                    <InputText
                        id='side-menu-name'
                        name='side-menu-name'
                        width='50%'
                        margin='0'
                        contentsFlg={true}
                        value={useInspectionItemManageState.selectedItemName}
                    />
                </div>

                <div className={`${inspectionItemSettingModal.manage_area_container}`}>
                    <SearchArea
                        title="検索条件"
                        btnHeight="35px"
                        usingId="inspection-modal"
                        condition_contents={<InspItemSearchCondArea />}
                        onClick={() => {
                            // 再取得クエリキー
                            queryClient.invalidateQueries({ queryKey: ["searchInspectionData"] });
                        }}
                    />
                </div>
            </div>
        </>
    )
}

// 一覧部
const ListArea = (): JSX.Element => {
    const [listAreaheight, setListAreaheight] = useAtom(
        AtomCommon.listAreaheightState
    );
    // const setListAreaheight = useSetAtom(AtomCommon.listAreaheightState);
    const [useMessage, setMessage] = useAtom(AtomCommon.messageState); // メッセージ用
    const [listState, setListState] = useAtom(AtomWQM020.listState);
    const [calcState, setCalcState] = useAtom(AtomWQM020.calcState);
    const [searchHiddenCond, setSearchHiddenCond] = useAtom(
        AtomWQM020.searchHiddenCondState
    );
    const searchCond = useAtomValue(AtomWQM020.searchCondState);
    const [scrollFlg, setScrollFlg] = useAtom(AtomWQM020.scrollFlgState); // スクロールフラグ用
    const [barHeightState, setBarHeightState] = useAtom(
        AtomWQM020.barHeightState
    ); // スクロール位置用
    const [loadingState, setLoadingState] = useAtom(AtomCommon.loadingState); // ロード用

    // 管理データ
    const [useInspItemState, setInspItemState] = useAtom(AtomInspectionItemSetting.inspectionItemState);
    const [useInspItemHiddenState, setInspItemHiddenState] = useAtom(AtomInspectionItemSetting.inspectionItemHiddenState);

    // 
    const [useInspItemListState, setInspItemListState] = useAtom(AtomInspectionItemSetting.inspItemListState);

    // 項目管理データ
    const [useInspectionItemManageState, setInspectionItemManageState] = useAtom(AtomInspectionItemSetting.inspectionItemManageState);

    // メニューラベル管理子画面_表示フラグ
    const [useInspectionItemModalFlgState, setInspectionItemModalFlgState] = useAtom(AtomInspectionItemSetting.inspectionItemModalFlgState);

    // 一覧部の高さ自動調整
    const listHeightAjust = (
        setListAreaheight: (val: SetStateAction<string | number | boolean>) => void
    ) => {
        console.log("一覧部の高さ自動調整 *** ");

        // 画面全体の高さ
        const bodyHeight: number = document.documentElement.clientHeight;

        // ヘッダーの高さ
        const headerHeight: number =
            document.querySelector(".header_inner").clientHeight;

        // メッセージエリアの高さ
        let messageHeight = 0;
        if (document.querySelector(".message-area")) {
            messageHeight = document.querySelector(".message-area").clientHeight;
        }

        // 検索部の高さ
        const searchHeight: number =
            document.querySelector("#search_area").clientHeight -
            document.querySelector("#search_condition").clientHeight;

        // フッダーの高さ
        const footerHeight: number = document.querySelector(".foot-nav")
            ? document.querySelector(".foot-nav").clientHeight
            : 0;

        // 検索部の高さ
        const titleHeight: number = document.querySelector("#title").clientHeight;

        const calcHeight: number = document.querySelector("#calc_area")
            ? document.querySelector("#calc_area").clientHeight
            : 0;

        const marginHeight = 60; // マージン幅

        // 一覧部の高さ
        const listHeight: number =
            bodyHeight -
            // headerHeight -
            // searchHeight -
            marginHeight -
            footerHeight -
            messageHeight -
            calcHeight -
            // titleHeight -
            0;

        setListAreaheight(`${String(listHeight)}px`);
    };

    let barHeightValue: AtomWQM020.barHeight = barHeightState;

    let searchCondValue = useInspItemState;

    const bodyHtml: JSX.Element[] = [];
    const headHtml: JSX.Element = (
        <>
            <thead>
                <tr>
                    {/* 項目番号 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} item_no`}
                        onClick={() => {
                            setSort("item_no");
                        }}
                        style={{
                            width: "85px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>項目番号</div>
                    </th>
                    {/* 項目名称画面 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} item_dsp_name`}
                        onClick={() => {
                            setSort("item_dsp_name");
                        }}
                        style={{
                            width: "120px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>項目名称画面</div>
                    </th>
                    {/* 項目名称報告書 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} item_report_name`}
                        onClick={() => {
                            setSort("item_report_name");
                        }}
                        style={{
                            width: "125px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>項目名称報告書</div>
                    </th>
                    {/* 単位 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} item_unit`}
                        onClick={() => {
                            setSort("item_unit");
                        }}
                        style={{
                            width: "80px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>単位</div>
                    </th>
                    {/* データ区分名称 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} constant_qualitative_flg`}
                        onClick={() => {
                            setSort("constant_qualitative_flg");
                        }}
                        style={{
                            width: "125px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>データ区分名称</div>
                    </th>
                    {/* 入力タイプ */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} input_type`}
                        onClick={() => {
                            setSort("input_type");
                        }}
                        style={{
                            width: "100px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>入力タイプ</div>
                    </th>
                    {/* 項目大分類名称 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} item_dai_category_name`}
                        onClick={() => {
                            setSort("item_dai_category_name");
                        }}
                        style={{
                            width: "125px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>項目大分類名称</div>
                    </th>
                    {/* 項目中分類名称 */}
                    <th
                        className={`${inspectionItemSettingModal.sort_th} item_tyu_category_name`}
                        onClick={() => {
                            setSort("item_tyu_category_name");
                        }}
                        style={{
                            width: "125px",
                            fontSize: "10pt"
                        }}
                    >
                        <div style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>項目中分類名称</div>
                    </th>
                    {/* 選択ボタン */}
                    <th
                        className="select_btn"
                        style={{ width: "auto", borderRadius: "0 5px 0 0" }}
                    >
                        <div style={{ minWidth: "5em" }}></div>
                    </th>
                </tr>
            </thead>
        </>
    );

    if (useInspItemListState !== null && useInspItemListState.length > 0) {
        for (let i = 0; i < useInspItemListState.length; i++) {
            bodyHtml.push(
                <tr key={i}>
                    <td style={{ height: "40px", textAlign: "center" }}>{useInspItemListState[i].item_no}</td>
                    <td style={{ textAlign: "center" }}>{useInspItemListState[i].item_dsp_name}</td>
                    <td style={{ textAlign: "center" }}>{useInspItemListState[i].item_report_name}</td>
                    <td>{useInspItemListState[i].item_unit}</td>
                    <td>{(useInspItemListState[i].constant_qualitative_flg == "1") ? "定量" : "定性"}</td>
                    <td>{Const.INPUT_DATA_KBN_NAME[Number(useInspItemListState[i].input_type)]}</td>
                    <td>{useInspItemListState[i].item_dai_category_name}</td>
                    <td>{useInspItemListState[i].item_tyu_category_name}</td>
                    <td>
                        {/* 閉じるボタン */}
                        <Button
                            title="選択"
                            width="75px"
                            className={`table_select_btn ${(Number(useInspItemListState[i].item_no) == useInspectionItemManageState.selectedItemNo) ? `selected` : ``}`}
                            disabled={(Number(useInspItemListState[i].item_no) == useInspectionItemManageState.selectedItemNo)}
                            onClick={() => {
                                setInspectionItemManageState({
                                    ...useInspectionItemManageState,
                                    changedItemNo: useInspItemListState[i].item_no,
                                    changedItemName: useInspItemListState[i].item_dsp_name,
                                });
                                setInspectionItemModalFlgState(!useInspectionItemModalFlgState);

                            }}
                        />
                    </td>
                </tr>
            );
        }
    }

    if (useInspItemListState !== null && useInspItemListState.length > barHeightState.after) {
        barHeightValue = {
            before: barHeightState.after,
            after: useInspItemListState.length,
        };
        setBarHeightState(barHeightValue);
    }

    /**
     * ソート用条件設定
     * 
     * @param column 
     */
    const setSort = (column: string): void => {
        setMessage([]);
        let checkErrorCond: number = 0;
        if (useInspItemState.inspItemNo && Common.checkNumberAndDigits(useInspItemState.inspItemNo) == 1) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0004W", "検査項目番号"]));
            setMessage(errorInfo);
            setInspItemListState([]);

            checkErrorCond += 1;
        }

        if (checkErrorCond == 0) {
            let searchCondValue: AtomInspectionItemSetting.inspectionItemInterface = useInspItemState;
            if (column !== useInspItemState.sortColumn) {
                searchCondValue = {
                    ...searchCondValue,
                    sortColumn: column,
                    sortOrder: "DESC",
                };
            } else {
                searchCondValue = {
                    ...searchCondValue,
                    sortColumn: column,
                    sortOrder: (useInspItemState.sortOrder == "ASC") ? "DESC" : "ASC",
                };
            }

            setInspItemState(searchCondValue);
            setLoadingState(true);

            Api.post("/MNG050/searchInspItem", setMessage, searchCondValue)
                .then((result) => {
                    setInspItemListState(result.inspItemData);
                    // if (result !== null && result.list !== null && result.list.length > 0) {
                    //     setListState(result.list);
                    //     setCalcState(result.calc);
                    // } else {
                    //     setListState([]);
                    //     setCalcState(AtomWQM020.defaultCalcType);
                    // }
                })
                .catch((error: Error) => {
                    // 想定外のエラーの場合メッセージを表示
                    if (error.message !== Const.errorType["404"]) {
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0003E"]));
                        setMessage(errorInfo);
                    }
                })
                .finally(() => {
                    setLoadingState(false);
                });
        }
    };

    useQuery({
        queryKey: [
            "inspectItemSortClassAdd",
            searchCondValue.sortColumn,
            searchCondValue.sortOrder,
        ],
        queryFn: () => {
            // ソート時クラス切り替え
            if (useInspItemListState !== null && useInspItemListState.length != 0) {
                // ヘッダー押下時の処理
                const headerElem = document.querySelectorAll('#inspItemLists > thead > tr > th');
                console.log("headerElem", headerElem);

                // ソートによる検索が成功した場合のみ、ソートアイコンの表示を切替える
                if (headerElem?.length > 0) {
                    headerElem?.forEach((element) => {
                        element.classList.remove('sort_asc');
                        element.classList.remove('sort_desc');
                    });
                }

                let sortClass = `sort_asc`;
                if (searchCondValue.sortOrder === "DESC") {
                    sortClass = `sort_desc`;
                }
                document.querySelector(`#inspItemLists > thead > tr > th.${searchCondValue.sortColumn}`).classList.add(sortClass);
            }
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    /**
     * 再取得時に正しい位置へスクロールを移動
     * 
     */
    const scrollMove = () => {
        const list = document.getElementById("listArea");
        if (list !== undefined && list !== null) {
            const move =
                list.scrollHeight * (barHeightValue.before / barHeightValue.after) -
                list.clientHeight;
            if (move > 0) {
                list.scrollTop = move;
            }
        }
    };

    /**
     * 再検索処理
     * 
     */
    // const ReSearch = (): void => {
    //     // 初期化
    //     setMessage([]); // メッセージ

    //     Api.post("/WQM020/search", setMessage, searchHiddenCond)
    //         .then((result) => {
    //             setListState(listState.concat(result.list));
    //             if (result.list.length >= searchHiddenCond.limit) {
    //                 // ユーザの全件数が50の倍数だと、検索結果が0件になってしまうため、下記処理追加
    //                 let allcount = 0;
    //                 allcount = listState.concat(result.list).length;
    //                 if (allcount === Number(calcState.count)) {
    //                     setScrollFlg(false);
    //                 } else {
    //                     setScrollFlg(true);
    //                 }
    //             } else {
    //                 setScrollFlg(false);
    //             }
    //         })
    //         .catch((error: Error) => {
    //             // 想定外のエラーの場合メッセージを表示
    //             if (error.message !== Const.errorType["404"]) {
    //                 const errorInfo: AtomCommon.message[] = [];
    //                 errorInfo.push(getMessage(["WQ-0003E"]));
    //                 setMessage(errorInfo);
    //             }
    //         });
    // };

    useQuery({
        queryKey: ["wqm020scrollMove", barHeightState],
        queryFn: scrollMove,
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    useQuery({
        queryKey: ["wqm020ListChange", listState],
        queryFn: () => {
            listHeightAjust(setListAreaheight);
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    /**
     * 選択している日付に基づき、検査情報を取得
     * 
     */
    const searchInspectionData = async (): Promise<any> => {
        setMessage([]);
        setInspItemListState([]);
        let checkErrorCond: number = 0;
        if (useInspItemState.inspItemNo && Common.checkNumberAndDigits(useInspItemState.inspItemNo) == 1) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0004W", "検査項目番号"]));
            setMessage(errorInfo);

            checkErrorCond += 1;
        }

        if (checkErrorCond == 0) {
            Api.post("/MNG050/searchInspItem", setMessage, useInspItemState)
                .then((result) => {
                    setInspItemListState(result.inspItemData);
                })
                .catch((error: Error) => {
                    // 想定外のエラーの場合メッセージを表示
                    if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0003E"]));
                        setMessage(errorInfo);
                    }
                });
        }
    };

    // 選択している日付に基づき、検査情報を取得
    const { isFetching } = useQuery({
        queryKey: ["searchInspectionData"],
        queryFn: async () => {
            // テーブルサイズ初期化
            setListAreaheight("190px");

            // 検査情報を取得処理
            await searchInspectionData();
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    return (
        <>
            {isFetching ? (
                <div
                    style={{
                        width: 100,
                        justifySelf: "center",
                        marginTop: "10dvh",
                    }}
                >
                    <Loading />
                </div>
            ) : (
                <>
                    {useInspItemListState !== null && useInspItemListState.length !== 0 && (
                        <>
                            <div
                                id="listArea"
                                className={`${inspectionItemSettingModal.list_area} ${inspectionItemSettingModal.sticky_table} ${inspectionItemSettingModal.child_elements_width_auto}`}
                                style={{
                                    // maxHeight:
                                    //     typeof listAreaheight === "string" ? listAreaheight : "190px",
                                    overflow: "scroll",
                                    margin: "10px 0 40px 0",
                                    width: "100%",
                                }}
                            >
                                <table
                                    id="inspItemLists"
                                    className="parent neumorphic"
                                    style={{ minWidth: "100%", zIndex: "0" }}
                                >
                                    {headHtml}
                                    <tbody style={{ fontSize: "9pt" }}>{bodyHtml}</tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}

        </>
    );
};

// フッター
const FooterArea = (): JSX.Element => {
    // 処理結果メッセージ
    const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

    // 確認ダイアログ設定
    const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

    // 管理データ
    const [useMenuLabelState, setMenuLabelState] = useAtom(AtomInspectionItemSetting.inspectionItemState);

    // 編集用のメニュー
    const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
    const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

    // メニューラベル管理子画面_表示フラグ
    const [useInspectionItemModalFlgState, setInspectionItemModalFlgState] = useAtom(AtomInspectionItemSetting.inspectionItemModalFlgState);

    // 処理実施日時
    const [useDisplayTime, setDisplayTime] = useAtom(AtomInspectionItemSetting.menuLabelDisplayTime);

    // クエリクライアント
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // パス確認
    const url = useLocation();

    // メッセージ表示する時、GridTableの高さを調整
    useQuery({
        queryKey: ["adjustGridTableWithMessage", useResultMessage],
        queryFn: async () => {
            const extendHeight: string = String(40 * Number(useResultMessage.length));
            const inputArea: any = document.getElementById("menu_label_modal_panel_content");
            inputArea.style.height = 'calc(60vh + ' + extendHeight + 'px)';

            return true;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

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
                        setInspectionItemModalFlgState(!useInspectionItemModalFlgState);
                    }}
                />
            </div>
        </div>
    );
};

export const InspectionItemSettingModal = (): JSX.Element => {

    return (
        <div
            className='modal'
            style={{ zIndex: 999 }}
        >
            <div
                className='modal_content'
                style={{ width: "75vw" }}
            >
                <HeaderArea />
                <div
                    id='menu_label_modal_panel_content'
                    className={`contents_panel ${inspectionItemSettingModal.menu_label_modal_panel_content}`}
                >
                    <MessageArea />

                    {/* メニューラベル管理 */}
                    <InspItemSearchArea />
                    <ListArea />

                </div>
                <FooterArea />
            </div>
        </div>
    );
};

export default InspectionItemSettingModal;