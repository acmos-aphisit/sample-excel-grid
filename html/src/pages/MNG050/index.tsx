import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button, MessageArea } from '../../components/common';
import { InspectionItemSettingModal } from "../../components/modals/index";

// サイドメニュー
import SideMenuMaster from '../../components/layouts/sidemenuMaster';

// CSS
import cssMNG050 from "../../scss/pages/MNG050/MNG050.module.scss";
import "../../scss/pages/MNG050/MNG050.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 入力画面構成マスタデータ
import { DspConfigGridTable } from "../../components/mng050/dspConfigGridTable";
import { DspItemPointGridTable } from "../../components/mng050/dspItemPointGridTable";

// ローディング
import Loading from "../../components/layouts/loading";
import TitleArea from "../../components/layouts/title";

import * as Const from "../../common/const";
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { GridTableStateContainer } from '../../components/containers/gridTableStateContainer';
import { SideMenuMasterStateContainer } from '../../components/containers/sideMenuMasterStateContainer';
import { DspConfigGridTableStateContainer } from '../../components/containers/dspConfigGridTableStateContainer';
import { Mng050StateContainer } from '../../components/containers/mng050StateContainer';
import { InspectionItemSettingStateContainer } from '../../components/containers/inspectionItemSettingStateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

// タブライブラリー
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const MNG050Footer = ({ commonState, gridTableState, dspConfigGridTableState, SideMenuMasterState, Mng050State, confirmDialog }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // 登録するデータ検証
    const validateSaveInputData = async () => {
        // データ検証
        setValidatedData([]);
        commonState.setResultMessage([]);

        // 登録引数
        let setDspConfigData: any = [];
        let setDspPointData: any = [];
        let setDspItemData: any = [];
        let setDspMaskData: any = [];

        if (commonState.useInputEditingFlg) {
            // if (useInputDspConfigState && useTempSaveData && useInputEditingFlg) {
            let errorCnt: number = 0;
            let dupItem: { itemNo: string }[] = [];
            let dupPoint: { pointNo: string }[] = [];

            /**
             * ########## 入力画面名称 ##########
             */
            // 入力画面名称が未入力の場合エラー
            if (Common.checkNullOfString(dspConfigGridTableState.useInputDspConfigState.inputDspName)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "入力画面名称"]));
                commonState.setResultMessage(errorInfo);

                return;
            }

            if (Common.checkLengthOverOfString(dspConfigGridTableState.useInputDspConfigState.inputDspName, 50)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0011W", "入力画面名称", "50"]));
                commonState.setResultMessage(errorInfo);

                return;
            }


            /**
             * ########## 検査区分名称 ##########
             */
            // 検査区分名称が未入力の場合エラー
            if (Common.checkNullOfString(dspConfigGridTableState.useInputDspConfigState.inputDspInspKbnCode)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "検査区分名称"]));
                commonState.setResultMessage(errorInfo);

                return;
            }

            /**
             * ########## 確定ボタンフラグ ##########
             */
            // 確定ボタンフラグが未入力の場合エラー
            if (Common.checkNullOfString(String(dspConfigGridTableState.useInputDspConfigState.inputDspConfFlg))) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "確定ボタンフラグ"]));
                commonState.setResultMessage(errorInfo);

                return;
            }

            // 入力画面構成マスタ指定
            setDspConfigData = {
                input_dsp_no: dspConfigGridTableState.useInputDspConfigState.inputDspNo,
                input_dsp_name: dspConfigGridTableState.useInputDspConfigState.inputDspName,
                inspection_kbn_code: dspConfigGridTableState.useInputDspConfigState.inputDspInspKbnCode,
                point_num: dspConfigGridTableState.useInputDspConfigState.inputDspPointCnt,
                item_num: dspConfigGridTableState.useInputDspConfigState.inputDspItemCnt,
                conf_btn_flg: dspConfigGridTableState.useInputDspConfigState.inputDspConfFlg,
                sheet_title: dspConfigGridTableState.useInputDspConfigState.inputSheetTitle,
            };

            // 地点情報のバリデーション
            if (gridTableState.useTempSaveData[0] && gridTableState.useTempSaveData[0].inputEditingData.length > 0) {
                if (gridTableState.useTempSaveData[0].inputEditingData[0].data) {
                    gridTableState.useTempSaveData[0].inputEditingData[0].data.forEach((point, key) => {
                        // 採水地点
                        if (!point.pointNo || point.pointName == "") {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            const errorInfo: AtomCommon.message[] = [];
                            errorInfo.push(getMessage(["WQ-0001W", "採水地点"]));
                            commonState.setResultMessage(errorInfo);
                        } else if (dupPoint.find((dup) => (String(dup.pointNo) == String(point.pointNo)))) {
                            // エラー数える
                            errorCnt += 1;

                            // 必須項目のエラーメッセージを表示
                            const errorInfo: AtomCommon.message[] = [];
                            errorInfo.push(getMessage(["WQ-0017W", "採水地点"]));
                            commonState.setResultMessage(errorInfo);

                            return;
                        } else {
                            // 重複チェックデータ設定
                            dupPoint.push({
                                pointNo: point.pointNo,
                            });

                            setDspPointData.push({
                                input_dsp_no: dspConfigGridTableState.useInputDspConfigState.inputDspNo,
                                point_no: point.pointNo,
                                dsp_order: (key + 1),
                            })
                        }
                    });

                    // 項目データのバリデーション
                    if (errorCnt == 0) {
                        gridTableState.useTempSaveData[0].inputEditingData.forEach((item, key) => {
                            // 検査項目
                            if (item.itemNo >= 0 && (!item.itemNo || item.name == "")) {
                                // エラー数える
                                errorCnt += 1;

                                // 必須項目のエラーメッセージを表示
                                const errorInfo: AtomCommon.message[] = [];
                                errorInfo.push(getMessage(["WQ-0006W", "検査項目"]));
                                commonState.setResultMessage(errorInfo);

                                return;
                            } else if (dupItem.find((dup) => (String(dup.itemNo) == String(item.itemNo)))) {
                                // エラー数える
                                errorCnt += 1;

                                // 必須項目のエラーメッセージを表示
                                const errorInfo: AtomCommon.message[] = [];
                                errorInfo.push(getMessage(["WQ-0017W", "検査項目"]));
                                commonState.setResultMessage(errorInfo);

                                return;
                            } else {
                                if (item.itemNo >= 0) {
                                    // 重複チェックデータ設定
                                    dupItem.push({
                                        itemNo: item.itemNo,
                                    });

                                    // マスク設定がある場合
                                    item.data.forEach(point => {
                                        if (point.dataDisable) {
                                            setDspMaskData.push({
                                                input_dsp_no: dspConfigGridTableState.useInputDspConfigState.inputDspNo,
                                                point_no: point.pointNo,
                                                item_no: item.itemNo,
                                            });
                                        }
                                    });

                                    // 項目情報設定
                                    setDspItemData.push({
                                        input_dsp_no: dspConfigGridTableState.useInputDspConfigState.inputDspNo,
                                        item_no: item.itemNo,
                                        dsp_order: (key),
                                    });
                                }
                            }
                        });
                    }
                }
            }

            const saveData: any = {
                dsp_config_data: setDspConfigData,
                dsp_point_data: setDspPointData,
                dsp_item_data: setDspItemData,
                dsp_mask_data: setDspMaskData,
            };


            // エラー発生を判定
            if (errorCnt === 0) {
                saveInputDspMutation.mutate(saveData);
                setValidatedData(saveData);
                return true;
            } else {
                return false;
            }
        } else {
            // エラーメッセージ
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0019W"]));
            commonState.setResultMessage(errorInfo);
            commonState.setInputEditingFlg(false);

            return false;
        }
    };

    // データ登録
    const saveInputDspMutation = useMutation({
        mutationFn: async (saveData) => {
            // リクエスト
            const request = {
                data_to_save: saveData,
                display_time: Mng050State.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 選択している日付に基づき、検査情報を取得
            const response = await Api.post(
                "/MNG050/saveDspConfigData",
                commonState.setResultMessage,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            // queryClient.invalidateQueries({ queryKey: ["initInputManage"] });

            // 処理正常終了のメッセージ
            setTimeout(() => {
                const msgInfo: AtomCommon.message[] = [];
                msgInfo.push(getMessage(["WQ-0002I"]));
                commonState.setResultMessage(msgInfo);
            }, 500);
        },
        // エラー発生
        onError: (error) => {
            // エラーメッセージ
            // const errorInfo: AtomCommon.message[] = [];
            // errorInfo.push(getMessage(["WQ-0003E"]));
            // commonState.setResultMessage(errorInfo);
        },
    });

    /**
     * 取消
     * 202601 修正
     * ※ サイドメニューの「削除」処理と同処
     * 
     */
    const discardInputDspMutation = useMutation({
        mutationFn: async (discardData) => {
            // リクエスト
            const request = {
                data_to_discard: discardData,
                display_time: Mng050State.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 選択している日付に基づき、検査情報を取得
            const response = await Api.post(
                "/MNG050/discardDspConfigData",
                commonState.setResultMessage,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // すべてクリア
            commonState.setResultMessage([]);
            gridTableState.setTempSaveData(null);
            SideMenuMasterState.setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);

            // サイドメニュー初期化
            queryClient.invalidateQueries({ queryKey: ["getInitMenuLists"] });

            // 処理正常終了のメッセージ
            setTimeout(() => {
                const msgInfo: AtomCommon.message[] = [];
                msgInfo.push(getMessage(["WQ-0007I", "取消処理"]));
                commonState.setResultMessage(msgInfo);
            }, 1000);
        },
        // エラー発生
        onError: (error) => {
            // エラーメッセージ
            // const errorInfo: AtomCommon.message[] = [];
            // errorInfo.push(getMessage(["WQ-0003E"]));
            // commonState.setResultMessage(errorInfo);
        },
    });

    return (
        <>
            <footer>
                <div className="foot_nav">
                    <Button
                        title="取消"
                        width="120px"
                        margin="0px 0px 0px 15px"
                        className="footer_cencel_btn footer_btn_left button_hover_orange"
                        disabled={!SideMenuMasterState.useSideMenuSelected.selectedDspNo}
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                message: getMessage(["WQ-0005Q", "現在の入力画面設定をすべて削除"]).message,
                                onConfirm: () => {
                                    gridTableState.setGridTableFooterBtnClick("取消");
                                    // 入力画面構成マスタ指定

                                    // 登録引数
                                    let setDspConfigData: any = {
                                        input_menu_no: SideMenuMasterState.useSideMenuSelected.selectedMenuNo,
                                        input_dsp_no: dspConfigGridTableState.useInputDspConfigState.inputDspNo,
                                        input_dsp_name: dspConfigGridTableState.useInputDspConfigState.inputDspName,
                                        inspection_kbn_code: null,
                                        point_num: 1,
                                        item_num: 2,
                                        conf_btn_flg: null,
                                        sheet_title: "",
                                    };

                                    const discardData: any = {
                                        dsp_config_data: setDspConfigData,
                                    };

                                    discardInputDspMutation.mutate(discardData);
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                    <Button
                        title="入力前に戻る"
                        width="120px"
                        color="#a7a7a7"
                        margin="0px 0px 0px 15px"
                        className="footer_prev_btn footer_btn_left button_hover_gray"
                        disabled={!SideMenuMasterState.useSideMenuSelected.selectedDspNo}
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                message: getMessage(["WQ-0005Q", "入力画面設定した情報をすべて廃棄"]).message,
                                onConfirm: () => {
                                    gridTableState.setGridTableFooterBtnClick("入力前に戻る");
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                    <Button
                        title="登録"
                        width="100px"
                        margin="0px 0px 0px 15px"
                        className="footer_btn_right button_hover_green"
                        disabled={!SideMenuMasterState.useSideMenuSelected.selectedDspNo}
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                message: getMessage(["WQ-0001Q"]).message,
                                onConfirm: () => {
                                    const isValid = validateSaveInputData();
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

const MNG050 = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                                       // 汎用
    const gridTableState = GridTableStateContainer();                                 // グリッドテーブル
    const dspConfigGridTable = DspConfigGridTableStateContainer();                    // 入力画面構成マスタ
    const SideMenuMasterState = SideMenuMasterStateContainer();                       // サイドメニューマスタ
    const Mng050State = Mng050StateContainer();                                       // 入力画面設定
    const InspectionItemSettingState = InspectionItemSettingStateContainer();         // 採水項目設定
    const confirmDialog = ConfirmDialogStateContainer();                              // 確認ダイアログ

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        // グリッドテーブル
        gridTableState: gridTableState,
        dspConfigGridTableState: dspConfigGridTable,
        // 入力画面設定
        Mng050State: Mng050State,
        // サイドメニューマスタ
        SideMenuMasterState: SideMenuMasterState,
        // 確認ダイアログ
        confirmDialog: confirmDialog,
    }

    // ローカルステート
    const [useGridTableData, setGridTableData] = React.useState<any>();                 // メニュー構成データ
    const [useInputPointItemData, setInputPointItemData] = React.useState<any>();       // 地点項目ステート
    const [containerWidth, setcontainerWidth] = React.useState(window.outerWidth - SideMenuMasterState.barWidth - 1);

    useQuery({
        queryKey: ["mng050ContainerWidth", SideMenuMasterState.barWidth],
        queryFn: () => {
            setcontainerWidth(window.outerWidth - SideMenuMasterState.barWidth - 1);
            console.log("window.outerWidth - barWidth - 10 >>>>>>> ", window.outerWidth - SideMenuMasterState.barWidth - 1);


            return true;
        },
    });

    // グリッドテーブルサイズを調整
    const handleResizeGridTable = () => {
        // サイドメニュー側のサイズ調整関数を実行
        queryClient.invalidateQueries({ queryKey: ["mng050ContainerWidth"] });
    }

    // 画面サイズを変更するごとに処理を呼び出す関数を設定
    React.useEffect(() => {
        window.addEventListener('resize', handleResizeGridTable);
    });

    // 初期化
    useQuery({
        queryKey: ["initMng050"],
        queryFn: () => {
            // 選択サイドメニュー
            SideMenuMasterState.setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);

            return true;
        },
    });

    const initInputManage = async () => {
        // メッセージクリア
        commonState.setResultMessage([]);
        setGridTableData([]);
        gridTableState.setTempSaveData(null);
        commonState.setInputEditingFlg(false);

        if (SideMenuMasterState.useSideMenuSelected.selectedDspNo) {
            // リクエスト
            const request = {
                input_dsp_no: SideMenuMasterState.useSideMenuSelected.selectedDspNo,
            };

            let newRowObj: any = [];
            Api.post("/MNG050/getSelectedMenu", commonState.setResultMessage, request)
                .then((data: any) => {
                    if (data.configDspData.length > 0) {
                        // データ内容
                        data.configDspData.forEach(item => {
                            // 地点数_初期か既存か確認
                            let setPointCnt: string = String(Common.checkNullAndReturnNumber(item.point_num));
                            if (!item.point_num) {
                                // 初期化に設定
                                setPointCnt = "1";
                            }

                            // 項目数_初期か既存か確認
                            let setItemCnt: string = String(Common.checkNullAndReturnNumber(item.item_num));
                            if (!item.item_num) {
                                // 初期化に設定
                                setItemCnt = "2";
                            }

                            newRowObj.push({
                                inputDspNo: String(Common.checkNullAndReturnNumber(item.input_dsp_no)),
                                inputDspName: Common.checkNullAndReturnString(item.input_dsp_name),
                                inputDspInspKbnCode: Common.checkNullAndReturnString(item.inspection_kbn_code),
                                inputDspInspKbnName: Common.checkNullAndReturnString(item.inspection_kbn_name),
                                inputDspPointCnt: setPointCnt,
                                inputDspItemCnt: setItemCnt,
                                inputDspConfFlg: Common.checkNullAndReturnString(item.conf_btn_flg),
                                inputSheetTitle: Common.checkNullAndReturnString(item.sheet_title),
                            });
                        });

                        // ヘッダデータ
                        const newColumnObj: any = [
                            { id: 1, columnName: 'inputDspNo', columnTitle: '入力画面番号', width: parseInt(String((7.3 / 100) * window.innerWidth)), resizeAble: true },
                            { id: 2, columnName: 'inputDspName', columnTitle: '入力画面名称', width: parseInt(String((18 / 100) * window.innerWidth)), resizeAble: true },
                            { id: 3, columnName: 'inputDspInspKbnCode', columnTitle: '検査区分名称', width: parseInt(String((18 / 100) * window.innerWidth)), resizeAble: true },
                            { id: 4, columnName: 'inputDspPointCnt', columnTitle: '地点数', width: parseInt(String((7.3 / 100) * window.innerWidth)), resizeAble: true },
                            { id: 5, columnName: 'inputDspItemCnt', columnTitle: '項目数', width: parseInt(String((7.3 / 100) * window.innerWidth)), resizeAble: true },
                            { id: 6, columnName: 'inputDspConfFlg', columnTitle: '確定ボタンフラグ', width: parseInt(String((9.1 / 100) * window.innerWidth)), resizeAble: true },
                            { id: 2, columnName: 'inputSheetTitle', columnTitle: '取込シート名', width: parseInt(String((18 / 100) * window.innerWidth)), resizeAble: true },
                        ];

                        // 各データのインタフェース
                        const newRowDataInterface: any = [
                            { interfaceName: 'inputDspNo', interfaceType: 'string' },
                            { interfaceName: 'inputDspName', interfaceType: 'text' },
                            { interfaceName: 'inputDspInspKbnCode', interfaceType: 'select' },
                            { interfaceName: 'inputDspPointCnt', interfaceType: 'string' },
                            { interfaceName: 'inputDspItemCnt', interfaceType: 'string' },
                            { interfaceName: 'inputDspConfFlg', interfaceType: 'select' },
                            { interfaceName: 'inputSheetTitle', interfaceType: 'text' },
                        ]

                        // 検査区分をリストで取得
                        let newSelectionKbn: { label: string, value: string }[] = [];
                        data.inspectionLists.forEach((item) => {
                            newSelectionKbn.push({
                                label: item.inspection_kbn_name,
                                value: item.inspection_kbn_code,
                            });
                        });

                        // 引数設定
                        setGridTableData({
                            columnData: newColumnObj,
                            rowData: newRowObj,
                            rowInterface: newRowDataInterface,
                            inspectionKbnSelect: newSelectionKbn,
                        });

                        // 地点情報を指定
                        let setPointDataForGrid: any = [];
                        data.pointData.forEach((item) => {
                            setPointDataForGrid.push({
                                pointNo: item.point_no,
                                pointData: item.point_name,
                                processNo: item.process_no,
                            });
                        });

                        // 初期化の時
                        if (setPointDataForGrid.length == 0) {
                            setPointDataForGrid.push({
                                pointNo: null,
                                pointData: "",
                                processNo: null,
                            });
                        }

                        // 項目情報を指定
                        let setItemDataForGrid: any = [];

                        // 先頭に地点情報を挿入
                        setItemDataForGrid.push({
                            itemNo: -1,
                            name: "",
                            reportName: "地点名称変更",
                            constantQualitativeFlg: null,
                            type: "combobox",
                            checkFlg: false,
                            status: "",
                            isOpen: false,
                            selectorList: null,
                            data: [],
                        });

                        // 項目指定
                        data.itemData.forEach((item) => {
                            setItemDataForGrid.push({
                                itemNo: item.item_no,
                                name: item.item_name,
                                reportName: item.item_report_name,
                                constantQualitativeFlg: item.constant_qualitative_flg,
                                type: Const.INPUT_DATA_KBN[item.input_type],
                                checkFlg: false,
                                status: "",
                                isOpen: false,
                                selectorList: item.select_list,
                                data: [],
                            });
                        });

                        // 初期化の時
                        if (setItemDataForGrid.length == 1) {
                            data.initItemData.forEach((intiItem) => {
                                setItemDataForGrid.push({
                                    itemNo: intiItem.item_no,
                                    name: intiItem.item_name,
                                    reportName: intiItem.item_report_name,
                                    constantQualitativeFlg: intiItem.constant_qualitative_flg,
                                    type: Const.INPUT_DATA_KBN[intiItem.input_type],
                                    checkFlg: false,
                                    status: "",
                                    isOpen: false,
                                    selectorList: intiItem.select_list,
                                    data: [],
                                });
                            });
                        }

                        setInputPointItemData({
                            selectMenuNo: SideMenuMasterState.useSideMenuSelected.selectedMenuNo,
                            itemData: setItemDataForGrid,
                            pointData: setPointDataForGrid,
                            inputMask: data.inputMask,
                            saisuiPointData: data.saisuiPointData,
                        })

                        Mng050State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
                        gridTableState.setTempSaveData([]);
                    }
                })
                .catch((error: Error) => {
                    // 内部エラーメッセージを表示
                    if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0003E"]));
                        commonState.setResultMessage(errorInfo);
                    }
                });
        } else {
            // 登録保持初期化
            gridTableState.setTempSaveData([]);
        }

        // 登録保持初期化
        gridTableState.setTempSaveData([]);
        return true;
    };

    const { isFetching } = useQuery({
        queryKey: ["initInputManage", SideMenuMasterState.useSideMenuSelected],
        queryFn: async () => {
            await initInputManage();

            return true;
        },
    });

    // ページから離れる時、キャッシュをクリア
    const queryClient = useQueryClient();
    React.useEffect(() => {
        return () => {
            // クエリキャッシュをクリア
            queryClient.removeQueries({ queryKey: ["initInputManage"] });

            // 選択しているメニューをクリア
            SideMenuMasterState.setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);
        };
    }, [queryClient]);

    return (
        <>
            <div className="container_row" style={{ justifyContent: "flex-end" }}>
                <SideMenuMaster />
                <div
                    id="MNG050-main-container"
                    className="container_grid_table"
                    style={{
                        height: "100%",
                        width: `${containerWidth}px`,
                    }}
                >
                    <div
                        className="container_range"
                        style={{
                            zIndex: "0",
                            display: "flex",
                            flexDirection: "column",
                            width: `${containerWidth}px`,
                        }}
                    >
                        <div
                            id="main-content-table"
                            style={{ width: `${containerWidth}px` }}
                            className={`${cssMNG050.MNG050_input_container} ${(commonState.useResultMessage.length > 0) ? " MNG050_input_container_with_msg" : ""}`}
                        >
                            <>
                                <MessageArea />

                                <>
                                    <div
                                        className="container_row"
                                        style={{
                                            justifyContent: "left",
                                        }}
                                    >

                                        <TitleArea title="入力画面設定" />
                                    </div>


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
                                        SideMenuMasterState.useSideMenuSelected.selectedMenuNo && (
                                            <>
                                                {/* <div
                                                    className="container_row"
                                                    style={{
                                                        justifyContent: "left",
                                                        margin: "0px 0px 10px 0px",
                                                    }}
                                                >
                                                    <h2
                                                    style={{ width: "fit-content", alignContent: "center" }}
                                                >
                                                    {useSideMenuSelected.selectedMenuName}
                                                </h2>
                                                </div> */}
                                                {SideMenuMasterState.useSideMenuSelected.selectedDspNo &&
                                                    (
                                                        <>
                                                            <Tabs>
                                                                <TabList>
                                                                    <Tab>入力画面構成</Tab>
                                                                    <Tab id="mng050-point-item-tab">入力画面構成地点・項目</Tab>
                                                                </TabList>

                                                                <TabPanel forceRender={true}>
                                                                    {/* 入力画面構成マスタ */}
                                                                    {useGridTableData && (
                                                                        <div id="MNG050-config-grid-table">
                                                                            <DspConfigGridTable dataGrid={useGridTableData} />
                                                                        </div>
                                                                    )}
                                                                </TabPanel>
                                                                <TabPanel >
                                                                    {/* 入力画面構成地点・項目マスタ */}
                                                                    {useInputPointItemData && (
                                                                        <div id="MNG050-item-point-grid-table" className={(commonState.useResultMessage.length > 0) ? `mng050_grid_tabel_with_msg` : `mng050_grid_tabel_without_msg`}>
                                                                            <DspItemPointGridTable dataGrid={useInputPointItemData} />
                                                                        </div>
                                                                    )}
                                                                </TabPanel>
                                                            </Tabs>
                                                        </>
                                                    )}
                                            </>
                                        )
                                    )}
                                </>
                            </>
                        </div>
                    </div>
                    <MNG050Footer {...comblineProps} />
                </div>
            </div>
            {InspectionItemSettingState.useInspectionItemModalFlgState && (<InspectionItemSettingModal />)}
            {/* <InspectionItemSettingModal /> */}
        </>
    );
}

export default MNG050;