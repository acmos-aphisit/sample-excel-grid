import React from "react";
import { Api, getMessage } from "../../common/api";
import { Select, Button, MessageArea, InputText, MessageMutiLineArea } from '../../components/common';

// CSS
import cssMNG040 from "../../scss/pages/MNG040.module.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 入力画面構成マスタデータ
import { GridSimpleContextTable } from "../../components/common/gridSimpleContextTable";

//【コンポネント】適用年度追加子画面
import { AddNextYearInspCriteriaModal } from "../../components/modals/index";
import { InspectionItemSettingModal } from "../../components/modals/index";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Mng040StateContainer } from '../../components/containers/mng040StateContainer';
import { AddNextYearStateContainer } from '../../components/containers/addNextYearInspCriteriaModalStateContainer';
import { InspectionItemSettingStateContainer } from '../../components/containers/inspectionItemSettingStateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

import * as Const from "../../common/const";
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";
import * as atomMng040 from "../../stores/atomMNG040";

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

const MNG040SearchArea = ({ commonState, mng040State }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    return (
        <>
            <div id='inspection-criteria-search'>
                <div className={`${cssMNG040.manage_area_container}`}>
                    <SearchArea
                        dataTestId="mng040-5"
                        title="検索条件"
                        usingId="mng040"
                        btnHeight="35px"
                        condition_contents={<InspCriteriaSearchCondArea {...{ commonState, mng040State }} />}
                        onClick={async () => {
                            // 再取得クエリキー
                            await mng040State.setSearchAndSortState({
                                ...mng040State.useSearchAndSortState,
                                sortColumn: atomMng040.defaultSearchAndSortState.sortColumn,
                                sortOrder: atomMng040.defaultSearchAndSortState.sortOrder,
                            });
                            await queryClient.invalidateQueries({ queryKey: ["searchInspCriteriaData"] });
                        }}
                    />
                </div>
            </div>
        </>
    );
};

// 検査項目の検索条件
const InspCriteriaSearchCondArea = ({ commonState, mng040State }): JSX.Element => {
    // ローカルステート
    const [useSelectApplyYear, setSelectApplyYear] = React.useState<{ label: string, value: string }[]>();    // 適用年度
    const [useSelectSaisuiKbn, setSelectSaisuiKbn] = React.useState<{ label: string, value: string }[]>();    // 採水区分マスタ

    // 初期化
    const inspCriteriaSearchInit = async () => {
        // エラーメッセージ初期化
        // setResultMessage([]);

        // 選択肢情報を取得
        Api.get("/MNG040/fetchInspCriteriaHoukijyunList", commonState.setMessageMutiLine)
            .then((data: any) => {
                if (data.length <= 0) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
                    commonState.setMessageMutiLine(errorInfo);
                } else {
                    // 施設マスタ
                    let newSelectionApplyYear: { label: string, value: string }[] = [];
                    if (data.applyYearList?.length > 0) {
                        data.applyYearList?.forEach((item) => {
                            newSelectionApplyYear.push({
                                label: item.hou_kijyun_no,
                                value: item.hou_kijyun_no,
                            });
                        });
                    }
                    setSelectApplyYear(newSelectionApplyYear);

                    // 採水区分マスタ
                    let newSelectionSaisuiKbn: { label: string, value: string }[] = [{ label: "", value: "" }];
                    if (data.saisuiKbnData?.length > 0) {
                        data.saisuiKbnData?.forEach((item) => {
                            newSelectionSaisuiKbn.push({
                                label: item.saisui_kbn_name,
                                value: item.saisui_kbn_no,
                            });
                        });
                    }
                    setSelectSaisuiKbn(newSelectionSaisuiKbn);
                    mng040State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
                }
            })
            .catch((error: Error) => {
                // 想定外のエラーの場合メッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    commonState.setMessageMutiLine(errorInfo);
                }
            });

        return true;
    };

    useQuery({
        queryKey: ["inspCriteriaSearchInit"],
        queryFn: async () => {
            await inspCriteriaSearchInit();
            return true;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    return (
        <>
            <div className={`container_row ${cssMNG040.MNG040_form_top_cond_container}`}>
                <div className={`${cssMNG040.form_top_cond_input_form}`}>
                    <div className={`${cssMNG040.form_cond_label}`} style={{ width: "70px" }}>適用年度</div>
                    <div style={{ width: "75%" }}>
                        <Select
                            dataTestId="mng040-4-1"
                            className="disabled_bg_color"
                            name="mng040-search-year"
                            value={mng040State.useSearchAndSortState.applyYear}
                            width="100%"
                            margin='0'
                            options={useSelectApplyYear}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                mng040State.setSearchAndSortState(prev => ({ ...prev, applyYear: value }));
                            }}
                        />
                    </div>
                </div>
                <div className={`${cssMNG040.form_top_cond_input_form}`}>
                    <div className={`${cssMNG040.form_cond_label}`} style={{ width: "55px" }}>項目名</div>
                    <div style={{ width: "75%" }}>
                        <InputText
                            id='input-info-text'
                            name='input-info-text'
                            dataTestId="spt010-4-2"
                            width='100%'
                            margin='0'
                            max={50}
                            contentsFlg={true}
                            value={mng040State.useSearchAndSortState.itemName}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                mng040State.setSearchAndSortState(prev => ({ ...prev, itemName: value }));
                            }}
                        />
                    </div>
                </div>
                <div className={`${cssMNG040.form_top_cond_input_form}`}>
                    <div className={`${cssMNG040.form_cond_label}`} style={{ width: "70px" }}>採水区分</div>
                    <div style={{ width: "50%" }}>
                        <Select
                            dataTestId="mng040-4-3"
                            className="disabled_bg_color"
                            name="mng040-search-year-saisui-kbn"
                            value={mng040State.useSearchAndSortState.saisuiKbnNo}
                            width="100%"
                            margin='0'
                            options={useSelectSaisuiKbn}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                mng040State.setSearchAndSortState(prev => ({ ...prev, saisuiKbnNo: value }));
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )

};

// 検査基準マスタ一覧
const MNG040InspCriteriaLists = ({ commonState, mng040State }): JSX.Element => {
    // 検査基準設定データ
    const [useGridTableData, setGridTableData] = React.useState<any>();
    const [useInitGridTableData, setInitGridTableData] = React.useState<any>();

    // 検査基準マスタ_検索処理
    const searchInspCriteriaData = async (): Promise<any> => {
        commonState.setResultMessage([]);
        commonState.setMessageMutiLine([]);
        setGridTableData(null);

        let newRowObj: any = [];
        Api.post("/MNG040/fetchInspCriteriaData", commonState.setMessageMutiLine, mng040State.useSearchAndSortState)
            .then((data) => {
                if (data.inspCriteriaData.length > 0) {
                    // データ内容
                    if (data.inspCriteriaData?.length > 0) {
                        data.inspCriteriaData?.forEach((item, key) => {
                            // 取得してきた検索結果を一覧に表示する。
                            newRowObj.push({
                                rowNo: String(key + 1),
                                itemNo: Common.checkNullAndReturnString(item.item_no),
                                itemDspName: Common.checkNullAndReturnString(item.item_dsp_name),
                                saisuiKbnNo: Common.checkNullAndReturnString(item.saisui_kbn_no),
                                regulationLowLimit: Common.checkNullAndReturnString(item.regulation_low_limit),
                                regulationUpLimit: Common.checkNullAndReturnString(item.regulation_up_limit),
                                inputLowLimit: Common.checkNullAndReturnString(item.input_low_limit),
                                inputUpLimit: Common.checkNullAndReturnString(item.input_up_limit),
                                reportLowLimit: Common.checkNullAndReturnString(item.report_low_limit),
                                reportUpLimit: Common.checkNullAndReturnString(item.report_up_limit),
                                validDigits: Common.checkNullAndReturnString(item.valid_digits),
                                inputMinDigits: Common.checkNullAndReturnString(item.input_min_digits),
                                outputMinDigits: Common.checkNullAndReturnString(item.output_min_digits),
                                inspCriteriaComment: Common.checkNullAndReturnString(item.insp_criteria_comment),
                                processFlg: "",
                            });
                        });
                    }

                    // ヘッダデータ
                    const newColumnObj: any = [
                        { id: 1, columnName: 'rowNo', columnTitle: 'No', width: parseInt(String((3.6 / 100) * window.innerWidth)), resizeAble: false },
                        { id: 2, columnName: 'itemNo', columnTitle: '項目番号', width: parseInt(String((6.2 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 3, columnName: 'itemDspName', columnTitle: '項目名称画面', width: parseInt(String((17.2 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 4, columnName: 'saisuiKbnNo', columnTitle: '採水区分', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 5, columnName: 'regulationLowLimit', columnTitle: '規制下限値', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 6, columnName: 'regulationUpLimit', columnTitle: '規制上限値\n(目標値)', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 7, columnName: 'inputLowLimit', columnTitle: '入力下限値\n(定量下限値)', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 8, columnName: 'inputUpLimit', columnTitle: '入力上限値', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 9, columnName: 'reportLowLimit', columnTitle: '帳票下限値', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 10, columnName: 'reportUpLimit', columnTitle: '帳票上限値', width: parseInt(String((8.7 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 11, columnName: 'validDigits', columnTitle: '有効桁数', width: parseInt(String((8 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 12, columnName: 'inputMinDigits', columnTitle: '入力最小桁', width: parseInt(String((8 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 13, columnName: 'outputMinDigits', columnTitle: '出力最小桁', width: parseInt(String((8 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 14, columnName: 'inspCriteriaComment', columnTitle: 'コメント', width: parseInt(String((12 / 100) * window.innerWidth)), resizeAble: true },
                    ];

                    // 各データのインタフェース
                    const newRowDataInterface: any = [
                        { interfaceName: 'rowNo', interfaceType: 'string' },
                        { interfaceName: 'itemNo', interfaceType: 'string' },
                        { interfaceName: 'itemDspName', interfaceType: 'string' },
                        { interfaceName: 'saisuiKbnNo', interfaceType: 'select' },
                        { interfaceName: 'regulationLowLimit', interfaceType: 'text' },
                        { interfaceName: 'regulationUpLimit', interfaceType: 'text' },
                        { interfaceName: 'inputLowLimit', interfaceType: 'text' },
                        { interfaceName: 'inputUpLimit', interfaceType: 'text' },
                        { interfaceName: 'reportLowLimit', interfaceType: 'text' },
                        { interfaceName: 'reportUpLimit', interfaceType: 'text' },
                        { interfaceName: 'validDigits', interfaceType: 'select' },
                        { interfaceName: 'inputMinDigits', interfaceType: 'select' },
                        { interfaceName: 'outputMinDigits', interfaceType: 'select' },
                        { interfaceName: 'inspCriteriaComment', interfaceType: 'text' },
                    ];


                    // 検査基準大分類マスタ取得
                    let newSelectionItemDai: { label: string, value: number }[] = [];
                    if (data.itemDaiCategoryData?.length > 0) {
                        data.itemDaiCategoryData?.forEach((item) => {
                            newSelectionItemDai.push({
                                label: item.item_dai_category_name,
                                value: item.item_dai_category_no,
                            });
                        });
                    }

                    // 検査基準中分類マスタ取得
                    let newSelectionItemTyu: { label: string, value: number }[] = [];
                    if (data.itemTyuCategoryData?.lenth > 0) {
                        data.itemTyuCategoryData?.forEach((item) => {
                            newSelectionItemTyu.push({
                                label: item.item_tyu_category_name,
                                value: item.item_tyu_category_no,
                            });
                        });
                    }

                    // 検査基準マスタ取得
                    let newSelectionHouKijyunNo: { label: string, value: number }[] = [];
                    if (data.houKijyunNoList?.lenth > 0) {
                        data.houKijyunNoList?.forEach((item) => {
                            newSelectionHouKijyunNo.push({
                                label: item.hou_kijyun_no,
                                value: item.hou_kijyun_no,
                            });
                        });
                    }

                    // 採水区分マスタ取得
                    let newSelectionSaisuiKbn: { label: string, value: number }[] = [];
                    if (data.saisuiKbnList?.length > 0) {
                        data.saisuiKbnList?.forEach((item) => {
                            newSelectionSaisuiKbn.push({
                                label: item.saisui_kbn_name,
                                value: item.saisui_kbn_no,
                            });
                        });
                    }

                    // 有効桁数の選択肢を設定
                    let newSelectionValidDigits: { label: string, value: number }[] = [];
                    for (let index = 1; index <= 18; index++) {
                        newSelectionValidDigits.push({
                            label: String(index),
                            value: index,
                        });
                    }

                    // [入力最小桁・出力最小桁]の選択肢を設定
                    let newSelectionInputDigits: { label: string, value: number }[] = [{ label: "0", value: 0 }];
                    let newSelectionOutputDigits: { label: string, value: number }[] = [{ label: "0", value: 0 }];
                    for (let index = 1; index <= 7; index++) {
                        // 入力最小桁
                        newSelectionInputDigits.push({
                            label: String(-Math.abs(index)),
                            value: -Math.abs(index),
                        });

                        // 出力最小桁
                        newSelectionOutputDigits.push({
                            label: String(-Math.abs(index)),
                            value: -Math.abs(index),
                        });
                    }

                    // 引数設定
                    setGridTableData({
                        mngNo: "MNG040",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        itemDaiCategorySelect: newSelectionItemDai,
                        itemTyuCategorySelect: newSelectionItemTyu,
                        houKijyunNoSelect: newSelectionHouKijyunNo,
                        saisuiKbnSelect: newSelectionSaisuiKbn,
                        latestYear: data.latestYear,
                        validDigitsSelect: newSelectionValidDigits,
                        inputDigitsSelect: newSelectionInputDigits,
                        outputDigitsSelect: newSelectionOutputDigits,
                    });

                    // 初期化ステート設定
                    setInitGridTableData({
                        mngNo: "MNG040",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        itemDaiCategorySelect: newSelectionItemDai,
                        itemTyuCategorySelect: newSelectionItemTyu,
                        houKijyunNoSelect: newSelectionHouKijyunNo,
                        saisuiKbnSelect: newSelectionSaisuiKbn,
                        latestYear: data.latestYear,
                        validDigitsSelect: newSelectionValidDigits,
                        inputDigitsSelect: newSelectionInputDigits,
                        outputDigitsSelect: newSelectionOutputDigits,
                    });

                    mng040State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
                } else {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0011E"]));
                    commonState.setMessageMutiLine(errorInfo);
                }
            })
            .catch((error: Error) => {
                // 想定外のエラーの場合メッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    commonState.setMessageMutiLine(errorInfo);
                }
            });

        return true;
    };

    // 検査基準マスタ_検索処理
    const { isFetching } = useQuery({
        queryKey: ["searchInspCriteriaData"],
        initialData: async () => {
            // 検索条件を初期化
            await mng040State.setSearchAndSortState(atomMng040.defaultSearchAndSortState);
        },
        queryFn: async () => {
            // 検索処理を実施
            await searchInspCriteriaData();
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    return (
        <>
            {/* 入力画面構成マスタ */}
            {useGridTableData && (
                <div data-testid="mng040-2" id="simple-grid-context-table" className={`${(commonState.useMessageMutiLine.length > 0) ? cssMNG040.MNG040_config_grid_table_with_msg : cssMNG040.MNG040_config_grid_table}`}>
                    <GridSimpleContextTable dataGrid={useGridTableData} />
                </div>
            )}
        </>
    );
};

const MNG040Footer = ({ commonState, mng040State, confirmDialog, addNextYearState }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // 登録するデータ検証
    const validateSaveInspectionCriteriaData = async () => {
        // データ検証
        setValidatedData([]);
        commonState.setResultMessage([]);
        commonState.setMessageMutiLine([]);
        const errorInfo: AtomCommon.message[] = [];

        if (mng040State.useMng040InspCriteriaRegist && mng040State.useMng040InspCriteriaRegistFlg) {
            let errorCnt: number = 0;
            let dupItem: { itemNo: string, saisuiKbnNo: string }[] = [];

            // 検査基準マスタのバリデーション
            if (mng040State.useMng040InspCriteriaRegist?.length > 0) {
                mng040State.useMng040InspCriteriaRegist?.forEach(data => {
                    /**
                     * ########## 項目番号 ##########
                     */
                    // 項目番号が未入力の場合エラー
                    if (Common.checkNullOfString(data.itemNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + data.rowNo + "：項目番号"]));
                    }

                    /**
                     * ########## 項目名称画面 ##########
                     */
                    // 項目名称画面が未入力の場合エラー
                    if (Common.checkNullOfString(data.itemDspName)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + data.rowNo + "：項目名称画面"]));
                    }

                    /**
                     * ########## 採水区分 ##########
                     */
                    // 採水区分が未入力の場合エラー
                    if (Common.checkNullOfString(data.saisuiKbnNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + data.rowNo + "：採水区分"]));
                    }

                    /**
                     * ########## 規制下限値 ##########
                     */
                    // 規制下限値データ型
                    if (data.regulationLowLimit && Common.checkIntDecDigits(data.regulationLowLimit, 10, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkIntDecDigits(data.regulationLowLimit, 10, 8) == 1)
                            ? getMessage(["WQ-0004W", "No." + data.rowNo + "：規制下限値"])
                            : (Common.checkIntDecDigits(data.regulationLowLimit, 10, 8) == 2)
                                ? getMessage(["WQ-0012W", "No." + data.rowNo + "：規制下限値の整数部", "10桁"])
                                : getMessage(["WQ-0012W", "No." + data.rowNo + "：規制下限値の小数部", "8桁"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 規制上限値(目標値) ##########
                     */
                    // 規制上限値(目標値)データ型
                    if (data.regulationUpLimit && Common.checkIntDecDigits(data.regulationUpLimit, 10, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkIntDecDigits(data.regulationUpLimit, 10, 8) == 1)
                            ? getMessage(["WQ-0004W", "No." + data.rowNo + "：規制上限値(目標値)"])
                            : (Common.checkIntDecDigits(data.regulationUpLimit, 10, 8) == 2)
                                ? getMessage(["WQ-0012W", "No." + data.rowNo + "：規制上限値(目標値)の整数部", "10桁"])
                                : getMessage(["WQ-0012W", "No." + data.rowNo + "：規制上限値(目標値)の小数部", "8桁"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 入力下限値(定量下限値) ##########
                     */
                    // 入力下限値(定量下限値)データ型
                    if (data.inputLowLimit && Common.checkIntDecDigits(data.inputLowLimit, 10, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkIntDecDigits(data.inputLowLimit, 10, 8) == 1)
                            ? getMessage(["WQ-0004W", "No." + data.rowNo + "：入力下限値(定量下限値)"])
                            : (Common.checkIntDecDigits(data.inputLowLimit, 10, 8) == 2)
                                ? getMessage(["WQ-0012W", "No." + data.rowNo + "：入力下限値(定量下限値)の整数部", "10桁"])
                                : getMessage(["WQ-0012W", "No." + data.rowNo + "：入力下限値(定量下限値)の小数部", "8桁"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 入力上限値 ##########
                     */
                    // 入力上限値データ型
                    if (data.inputUpLimit && Common.checkIntDecDigits(data.inputUpLimit, 10, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkIntDecDigits(data.inputUpLimit, 10, 8) == 1)
                            ? getMessage(["WQ-0004W", "No." + data.rowNo + "：入力上限値"])
                            : (Common.checkIntDecDigits(data.inputUpLimit, 10, 8) == 2)
                                ? getMessage(["WQ-0012W", "No." + data.rowNo + "：入力上限値の整数部", "10桁"])
                                : getMessage(["WQ-0012W", "No." + data.rowNo + "：入力上限値の小数部", "8桁"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 帳票下限値 ##########
                     */
                    // 帳票下限値データ型
                    if (data.reportLowLimit && Common.checkIntDecDigits(data.reportLowLimit, 10, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkIntDecDigits(data.reportLowLimit, 10, 8) == 1)
                            ? getMessage(["WQ-0004W", "No." + data.rowNo + "：帳票下限値"])
                            : (Common.checkIntDecDigits(data.reportLowLimit, 10, 8) == 2)
                                ? getMessage(["WQ-0012W", "No." + data.rowNo + "：帳票下限値の整数部", "10桁"])
                                : getMessage(["WQ-0012W", "No." + data.rowNo + "：帳票下限値の小数部", "8桁"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 帳票上限値 ##########
                     */
                    // 帳票上限値データ型
                    if (data.reportUpLimit && Common.checkIntDecDigits(data.reportUpLimit, 10, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkIntDecDigits(data.reportUpLimit, 10, 8) == 1)
                            ? getMessage(["WQ-0004W", "No." + data.rowNo + "：帳票上限値"])
                            : (Common.checkIntDecDigits(data.reportUpLimit, 10, 8) == 2)
                                ? getMessage(["WQ-0012W", "No." + data.rowNo + "：帳票上限値の整数部", "10桁"])
                                : getMessage(["WQ-0012W", "No." + data.rowNo + "：帳票上限値の小数部", "8桁"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 有効桁数 ##########
                     */
                    // 有効桁数が未入力の場合エラー
                    if (Common.checkNullOfString(data.validDigits)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + data.rowNo + "：有効桁数"]));
                    }

                    // 項目番号及び採水区分の値が重複していた場合、エラー
                    if (dupItem.find((item) => (item.itemNo == data.itemNo && item.saisuiKbnNo == data.saisuiKbnNo))) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0017W", "No." + data.rowNo + "：項目番号と採水区分の組み合わせ"]));
                    } else {
                        dupItem.push({
                            itemNo: data.itemNo,
                            saisuiKbnNo: data.saisuiKbnNo,
                        });
                    }

                    /**
                     * ########## コメント ##########
                     */
                    // コメント未入力の場合エラー
                    if (!Common.checkNullOfString(data.inspCriteriaComment)) {
                        // コメント51桁以上の場合エラー
                        if (Common.checkLengthOverOfString(data.inspCriteriaComment, 128)) {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            errorInfo.push(getMessage(["WQ-0011W", "No." + data.rowNo + "：コメント", "128"]));
                        }
                    }

                });
            }

            // エラー発生を判定
            if (errorCnt === 0) {
                saveInspectionCriteriaMutation.mutate();
                return true;
            } else {
                commonState.setMessageMutiLine(errorInfo);
                return false;
            }
        } else {
            // エラーメッセージ
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0019W"]));
            commonState.setMessageMutiLine(errorInfo);
            commonState.setInputEditingFlg(false);

            return false;
        }
    };

    // データ登録
    const saveInspectionCriteriaMutation = useMutation({
        mutationFn: async (saveData) => {
            // リクエスト
            const request = {
                data_to_save: mng040State.useMng040InspCriteriaRegist,
                apply_year: mng040State.useSearchAndSortState.applyYear,
                validateMode: "criteria",
                display_time: mng040State.seDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 登録実施
            const response = await Api.post(
                "/MNG040/saveInspCriteriaData",
                commonState.setMessageMutiLine,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["searchInspCriteriaData"] });

            // 処理正常終了のメッセージ
            const msgInfo: AtomCommon.message[] = [];
            msgInfo.push(getMessage(["WQ-0002I"]));
            commonState.setMessageMutiLine(msgInfo);
        },
        // エラー発生
        onError: (error) => {
            // 想定外のエラーの場合メッセージを表示
            if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0003E"]));
                commonState.setMessageMutiLine(errorInfo);
            }
        },
    });

    return (
        <>
            <footer>
                <div className="foot_nav">
                    <Button
                        dataTestId="mng040-3-1"
                        title="入力前に戻る"
                        width="120px"
                        color="#a7a7a7"
                        margin="0px 0px 0px 15px"
                        className="footer_prev_btn footer_btn_left button_hover_gray"
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                message: getMessage(["WQ-0005Q", "検査基準設定した情報をすべて廃棄"]).message,
                                onConfirm: async () => {
                                    await queryClient.invalidateQueries({ queryKey: ["backToInitSetting"] });
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                    <Button
                        dataTestId="mng040-3-3"
                        title="登録"
                        width="100px"
                        margin="0px 0px 0px 15px"
                        className="footer_btn_right button_hover_green"
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                message: getMessage(["WQ-0001Q"]).message,
                                onConfirm: () => {
                                    const isValid = validateSaveInspectionCriteriaData();
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                    <Button
                        dataTestId="mng040-3-2"
                        title="適用年度追加"
                        width="120px"
                        margin="0px 0px 0px 15px"
                        className="footer_btn_right button_hover_blue"
                        onClick={() => {
                            //　適用年度追加フラグを設定 ※ 2025/04/01 - 2026/03/31 現年度は 2025年度となる。
                            const availableFlg = (mng040State.useMng040LatestYear <= Number(moment(new Date()).subtract(3, 'months').format("YYYY"))) ? true : false;
                            addNextYearState.setAddNextYearAvailableFlg(availableFlg);

                            // 適用年度追加子画面
                            commonState.setResultModalMessage([]);
                            addNextYearState.setAddNextYearInspCriteriaModalToggleFlg(true);
                        }}
                    />
                </div>
            </footer>
        </>
    );
};

const MNG040 = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                                       // 汎用
    const mng040State = Mng040StateContainer();                                       // 基準値
    const addNextYearState = AddNextYearStateContainer();                             //  適用年度追加
    const confirmDialog = ConfirmDialogStateContainer();                              // 確認ダイアログ
    const InspectionItemSettingState = InspectionItemSettingStateContainer();         // 採水項目設定

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        mng040State: mng040State,
        addNextYearState: addNextYearState,
        confirmDialog: confirmDialog,
    }

    // ページから離れる時、キャッシュをクリア
    const queryClient = useQueryClient();
    React.useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ["searchInspItemMng030"] });
        };
    }, [queryClient]);

    return (
        <>
            <div id="MNG040-main-container" className={`${cssMNG040.MNG040_main_container}`}>
                <MessageMutiLineArea />
                <div
                    id="mng040-inspection-criteria-title"
                    className="container_row"
                    style={{
                        justifyContent: "left",
                        margin: "0px 0px 10px 0px",
                    }}
                >
                    <h2
                        data-testid="mng040-1"
                        style={{ width: "fit-content", alignContent: "center" }}
                    >
                        {"基準値設定"}
                    </h2>
                </div>
                <MNG040SearchArea {...comblineProps} />
                <MNG040InspCriteriaLists {...comblineProps} />
                <MNG040Footer {...comblineProps} />
            </div>
            {InspectionItemSettingState.useInspectionItemModalFlgState && (<InspectionItemSettingModal />)}
            {addNextYearState.useAddNextYearInspCriteriaModalToggleFlg && (<AddNextYearInspCriteriaModal />)}
        </>
    );
};

export default MNG040;