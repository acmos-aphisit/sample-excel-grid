import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button, MessageArea, InputText, MessageMutiLineArea } from '../../components/common';

// CSS
import cssMNG030 from "../../scss/pages/MNG030.module.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 入力画面構成マスタデータ
import { GridSimpleContextTable } from "../../components/common/gridSimpleContextTable";

import * as Const from "../../common/const";
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";
import * as atomMng030 from "../../stores/atomMNG030";

// ローディング
import Loading from "../../components/layouts/loading";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Mng030StateContainer } from '../../components/containers/mng030StateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

const MNG030SearchArea = ({ commonState, mng030State }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    return (
        <>
            <div id='inspection-item-search'>
                <div className={`${cssMNG030.manage_area_container}`}>
                    <SearchArea
                        dataTestId="mng030-5-1"
                        title="検索条件"
                        btnHeight="35px"
                        condition_contents={<InspectionItemSearchCondArea {...{ commonState, mng030State }} />}
                        onClick={async () => {
                            // 再取得クエリキー
                            await mng030State.setMng030SearchAndSortState({
                                ...mng030State.useMng030SearchAndSortState,
                                sortColumn: atomMng030.defaultSearchAndSortState.sortColumn,
                                sortOrder: atomMng030.defaultSearchAndSortState.sortOrder,
                            });
                            await queryClient.invalidateQueries({ queryKey: ["searchInspItemMng030"] });
                        }}
                    />
                </div>
            </div>
        </>
    );
};

// 検査項目の検索条件
const InspectionItemSearchCondArea = ({ commonState, mng030State }): JSX.Element => {
    return (
        <>
            <div className={`container_row ${cssMNG030.MNG030_form_top_cond_container}`}>
                <div className={`${cssMNG030.form_top_cond_input_form}`}>
                    <div className={`${cssMNG030.form_cond_label}`} style={{ width: "50px" }}>項目名</div>
                    <div style={{ width: "72%" }}>
                        <InputText
                            id='input-insp-item'
                            name='input-insp-item'
                            dataTestId="mng030-4-1"
                            width='100%'
                            margin='0'
                            max={50}
                            contentsFlg={true}
                            value={mng030State.useMng030SearchAndSortState.itemName}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                mng030State.setMng030SearchAndSortState(prev => ({ ...prev, itemName: value }));
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
};

// 検査項目マスタ一覧
const MNG030InspItemLists = ({ commonState, mng030State }): JSX.Element => {
    // 採水地点設定データ
    const [useGridTableData, setGridTableData] = React.useState<any>();
    const [useInitGridTableData, setInitGridTableData] = React.useState<any>();

    // 採水地点マスタ_検索処理
    const searchInspItemData = async (): Promise<any> => {
        commonState.setResultMessage([]);
        commonState.setMessageMutiLine([]);
        setGridTableData(null);

        let newRowObj: any = [];
        Api.post("/MNG030/fetchInspItemData", commonState.setMessageMutiLine, mng030State.useMng030SearchAndSortState)
            .then((data) => {
                if (data.inspItemData.length > 0) {
                    // データ内容
                    if (data.inspItemData?.length > 0) {
                        data.inspItemData?.forEach((item, key) => {
                            // 取得してきた検索結果を一覧に表示する。
                            newRowObj.push({
                                rowNo: String(key + 1),
                                itemNo: Common.checkNullAndReturnString(item.item_no),
                                itemDspName: Common.checkNullAndReturnString(item.item_dsp_name),
                                itemReportName: Common.checkNullAndReturnString(item.item_report_name),
                                itemUnit: Common.checkNullAndReturnString(item.item_unit),
                                constantQualitativeFlg: Common.checkNullAndReturnString(item.constant_qualitative_flg),
                                inputType: Common.checkNullAndReturnString(item.input_type),
                                itemDaiCategoryNo: Common.checkNullAndReturnString(item.item_dai_category_no),
                                itemTyuCategoryNo: Common.checkNullAndReturnString(item.item_tyu_category_no),
                                inspectionItemComment: Common.checkNullAndReturnString(item.inspection_item_comment),
                                processFlg: "",
                            });
                        });
                    }

                    // ヘッダデータ
                    const newColumnObj: any = [
                        { id: 1, columnName: 'rowNo', columnTitle: 'No', width: parseInt(String((3.8 / 100) * window.innerWidth)), resizeAble: false },
                        { id: 2, columnName: 'itemNo', columnTitle: '項目番号', width: parseInt(String((6 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 3, columnName: 'itemDspName', columnTitle: '項目名称画面', width: parseInt(String((17 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 4, columnName: 'itemReportName', columnTitle: '項目名称報告書', width: parseInt(String((17 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 5, columnName: 'itemUnit', columnTitle: '単位', width: parseInt(String((5 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 6, columnName: 'constantQualitativeFlg', columnTitle: 'データ区分名称', width: parseInt(String((8 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 7, columnName: 'inputType', columnTitle: '入力タイプ', width: parseInt(String((9 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 8, columnName: 'itemDaiCategoryNo', columnTitle: '項目大分類名称', width: parseInt(String((10 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 9, columnName: 'itemTyuCategoryNo', columnTitle: '項目中分類名称', width: parseInt(String((10 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 10, columnName: 'inspectionItemComment', columnTitle: 'コメント', width: parseInt(String((12 / 100) * window.innerWidth)), resizeAble: true },
                    ];

                    // 各データのインタフェース
                    const newRowDataInterface: any = [
                        { interfaceName: 'rowNo', interfaceType: 'string' },
                        { interfaceName: 'itemNo', interfaceType: 'string' },
                        { interfaceName: 'itemDspName', interfaceType: 'text' },
                        { interfaceName: 'itemReportName', interfaceType: 'text' },
                        { interfaceName: 'itemUnit', interfaceType: 'text' },
                        { interfaceName: 'constantQualitativeFlg', interfaceType: 'select' },
                        { interfaceName: 'inputType', interfaceType: 'select' },
                        { interfaceName: 'itemDaiCategoryNo', interfaceType: 'select' },
                        { interfaceName: 'itemTyuCategoryNo', interfaceType: 'select' },
                        { interfaceName: 'inspectionItemComment', interfaceType: 'text' },
                    ];

                    // 検査項目大分類マスタ取得
                    let newSelectionItemDai: { label: string, value: number }[] = [];
                    if (data.itemDaiCategoryData?.length > 0) {
                        data.itemDaiCategoryData?.forEach((item) => {
                            newSelectionItemDai.push({
                                label: item.item_dai_category_name,
                                value: item.item_dai_category_no,
                            });
                        });
                    }

                    // 検査項目中分類マスタ取得
                    let newSelectionItemTyu: { label: string, value: number }[] = [];
                    if (data.itemTyuCategoryData?.length > 0) {
                        data.itemTyuCategoryData?.forEach((item) => {
                            newSelectionItemTyu.push({
                                label: item.item_tyu_category_name,
                                value: item.item_tyu_category_no,
                            });
                        });
                    }

                    // データ区分名称
                    let newSelectionConstantQualitativeFlg: { label: string, value: number }[] = Const.DATA_KBN_NAME_OPTIONS;

                    // 入力タイプ
                    let newSelectionInputType: { label: string, value: number }[] = Const.INPUT_TYPE_NAME_OPTIONS;

                    // 引数設定
                    setGridTableData({
                        mngNo: "MNG030",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        itemDaiCategorySelect: newSelectionItemDai,
                        itemTyuCategorySelect: newSelectionItemTyu,
                        ConstantQualitativeSelect: newSelectionConstantQualitativeFlg,
                        InputTypeSelect: newSelectionInputType,
                        maxItemNo: data.maxItemNo,
                    });

                    // 初期化ステート設定
                    setInitGridTableData({
                        mngNo: "MNG030",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        itemDaiCategorySelect: newSelectionItemDai,
                        itemTyuCategorySelect: newSelectionItemTyu,
                        ConstantQualitativeSelect: newSelectionConstantQualitativeFlg,
                        InputTypeSelect: newSelectionInputType,
                        maxItemNo: data.maxItemNo,
                    });

                    mng030State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
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

    // 採水地点マスタ_検索処理
    const { isFetching } = useQuery({
        queryKey: ["searchInspItemMng030"],
        initialData: async () => {
            // 検索条件を初期化
            await mng030State.setMng030SearchAndSortState(atomMng030.defaultSearchAndSortState);
            await mng030State.setDisplayTime(moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"));
        },
        queryFn: async () => {
            // 検索処理を実施
            await searchInspItemData();
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    return (
        <>
            {isFetching ? (
                <div
                    style={{
                        width: 150,
                        justifySelf: "center",
                        marginTop: "35dvh",
                    }}
                >
                    <Loading />
                </div>
            ) : (
                <>
                    {/* 入力画面構成マスタ */}
                    {useGridTableData && (
                        <div data-testid="mng030-2" id="simple-grid-context-table" className={`${(commonState.useMessageMutiLine.length > 0) ? cssMNG030.MNG030_config_grid_table_with_msg : cssMNG030.MNG030_config_grid_table}`}>

                            <GridSimpleContextTable dataGrid={useGridTableData} />
                        </div>
                    )}
                </>
            )}
        </>
    );
};

const MNG030Footer = ({ commonState, mng030State, confirmDialog }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // 登録するデータ検証
    const validateSaveInspectionItemData = async () => {
        // データ検証
        setValidatedData([]);
        commonState.setResultMessage([]);
        commonState.setMessageMutiLine([]);
        const errorInfo: AtomCommon.message[] = [];

        if (mng030State.useMng030InspItemRegist && mng030State.useMng030InspItemRegistFlgState) {
            let errorCnt: number = 0;

            // 検査項目マスタのバリデーション
            if (mng030State.useMng030InspItemRegist?.length > 0) {
                mng030State.useMng030InspItemRegist?.forEach(data => {
                    /**
                     * ########## 項目名称画面 ##########
                     */
                    // 項目名称画面が入力の場合エラー
                    if (!Common.checkNullOfString(data.itemDspName)) {
                        // 項目名称画面が51桁以上の場合エラー
                        if (Common.checkLengthOverOfString(data.itemDspName, 50)) {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            errorInfo.push(getMessage(["WQ-0011W", "No." + data.rowNo + "：項目名称画面", "50"]));
                        }
                    }
                    /**
                     * ########## 項目名称報告書 ##########
                     */
                    // 項目名称報告書が未入力の場合エラー
                    if (!Common.checkNullOfString(data.itemReportName)) {
                        // 項目名称報告書が51桁以上の場合エラー
                        if (Common.checkLengthOverOfString(data.itemReportName, 50)) {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            errorInfo.push(getMessage(["WQ-0011W", "No." + data.rowNo + "：項目名称報告書", "50"]));
                        }
                    }
                    /**
                     * ########## 単位 ##########
                     */
                    // 単位が未入力の場合エラー
                    if (!Common.checkNullOfString(data.itemUnit)) {
                        // 単位が10桁以上の場合エラー
                        if (Common.checkLengthOverOfString(data.itemUnit, 10)) {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            errorInfo.push(getMessage(["WQ-0011W", "No." + data.rowNo + "：単位", "10"]));
                        }
                    }
                    /**
                     * ########## コメント ##########
                     */
                    // コメント未入力の場合エラー
                    if (!Common.checkNullOfString(data.inspectionItemComment)) {
                        // コメント51桁以上の場合エラー
                        if (Common.checkLengthOverOfString(data.inspectionItemComment, 50)) {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            errorInfo.push(getMessage(["WQ-0011W", "No." + data.rowNo + "：コメント", "50"]));
                        }
                    }

                });
            }

            // エラー発生を判定
            if (errorCnt === 0) {
                saveInspectionItemMutation.mutate();
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
    const saveInspectionItemMutation = useMutation({
        mutationFn: async (saveData) => {
            // リクエスト
            const request = {
                data_to_save: mng030State.useMng030InspItemRegist,
                validateMode: "inspection",
                display_time: mng030State.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 登録実施
            const response = await Api.post(
                "/MNG030/saveInspItemData",
                commonState.setMessageMutiLine,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["searchInspItemMng030"] });

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
                        data-testid="mng030-3-1"
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
                                message: getMessage(["WQ-0005Q", "検査項目設定した情報をすべて廃棄"]).message,
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
                        data-testid="mng030-3-2"
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
                                    const isValid = validateSaveInspectionItemData();
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                </div>
            </footer>
        </>
    );
};

const MNG030 = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                   // 汎用
    const mng030State = Mng030StateContainer();                   // 採水地点
    const confirmDialog = ConfirmDialogStateContainer();          // 確認ダイアログ

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        mng030State: mng030State,
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
            <div id="MNG030-main-container" className={`${cssMNG030.MNG030_main_container}`}>
                <MessageMutiLineArea />
                <div
                    id="mng030-inspection-item-title"
                    className="container_row"
                    style={{
                        justifyContent: "left",
                        margin: "0px 0px 10px 0px",
                    }}
                >
                    <h2
                        data-testid="mng030-1"
                        style={{ width: "fit-content", alignContent: "center" }}
                    >
                        {"検査項目設定"}
                    </h2>
                </div>
                <MNG030SearchArea {...comblineProps} />
                <MNG030InspItemLists {...comblineProps} />
                <MNG030Footer {...comblineProps} />
            </div>
        </>
    );
};

export default MNG030;