import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button, MessageArea, ComboBoxSearch, InputText, MessageMutiLineArea } from '../../components/common';

// CSS
import cssMNG020 from "../../scss/pages/MNG020.module.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 入力画面構成マスタデータ
import { GridSimpleContextTable } from "../../components/common/gridSimpleContextTable";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Mng020StateContainer } from '../../components/containers/mng020StateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

// ローディング
import Loading from "../../components/layouts/loading";

// アトム
import * as Const from "../../common/const";
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";
import * as atomMng020 from "../../stores/atomMNG020";

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

const MNG020SearchArea = ({ commonState, mng020State }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    return (
        <>
            <div id='saisui-point-search'>
                <div className={`${cssMNG020.manage_area_container}`}>
                    <SearchArea
                        dataTestId="mng020-5-1"
                        title="検索条件"
                        btnHeight="35px"
                        condition_contents={<SaisuiPointSearchCondArea {...{ commonState, mng020State }} />}
                        onClick={async () => {
                            // 再取得クエリキー
                            await mng020State.setSaisuiPointState({
                                ...mng020State.useSaisuiPointState,
                                sortColumn: atomMng020.defaultSaisuiPointState.sortColumn,
                                sortOrder: atomMng020.defaultSaisuiPointState.sortOrder,
                            });
                            await queryClient.invalidateQueries({ queryKey: ["searchSaisuiPointData"] });
                        }}
                    />
                </div>
            </div>
        </>
    );
};

// 検査項目の検索条件
const SaisuiPointSearchCondArea = ({ commonState, mng020State }): JSX.Element => {
    // ローカルステート
    const [useSelectSisetu, setSelectSisetu] = React.useState<{ label: string, value: string }[]>();                // 施設マスタ  
    const [useSelectProcess, setSelectProcess] = React.useState<{ label: string, value: string }[]>();              // 処理過程マスタ
    const [useSelectSaisuiKbn, setSelectSaisuiKbn] = React.useState<{ label: string, value: string }[]>();          // 採水区分マスタ

    // 初期化
    const saisuiPointInit = async () => {
        // エラーメッセージ初期化
        commonState.setResultMessage([]);
        commonState.setMessageMutiLine([]);
        mng020State.setSaisuiPointState(atomMng020.defaultSaisuiPointState);

        // 選択肢情報を取得
        Api.get("/getSaisuiPointSelection", commonState.setMessageMutiLine)
            .then((data: any) => {
                if (data.length <= 0) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
                    commonState.setMessageMutiLine(errorInfo);
                } else {
                    // 施設マスタ
                    let newSelectionSisetu: { label: string, value: string }[] = [{ label: "", value: "" }];
                    if (data.sisetuData?.length > 0) {
                        data.sisetuData?.forEach((item) => {
                            newSelectionSisetu.push({
                                label: item.sisetu_name,
                                value: item.sisetu_no,
                            });
                        });
                    }
                    setSelectSisetu(newSelectionSisetu);

                    // 処理過程マスタ
                    let newSelectionProcess: { label: string, value: string }[] = [{ label: "", value: "" }];
                    if (data.processData?.length > 0) {
                        data.processData?.forEach((item) => {
                            newSelectionProcess.push({
                                label: item.process_name,
                                value: String(item.process_no),
                            });
                        });
                    }
                    setSelectProcess(newSelectionProcess);

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
                    mng020State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
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
        queryKey: ["saisuiPointInit"],
        queryFn: async () => {
            await saisuiPointInit();
            return true;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });


    return (
        <>
            <div className={`container_row ${cssMNG020.MNG020_form_top_cond_container}`}>
                <div className={`${cssMNG020.form_top_cond_input_form}`}>
                    <div className={`${cssMNG020.form_cond_label}`} style={{ width: "50px" }}>浄水場</div>
                    <div style={{ width: "75%" }}>
                        <ComboBoxSearch
                            className="disabled_bg_color"
                            id="mng020-combobox-sisetu"
                            dataTestId="mng020-4-1"
                            width="100%"
                            height="35px"
                            options={useSelectSisetu}
                            clearBotton={true}
                            value={mng020State.useSaisuiPointState.sisetuNo}
                            selectVal={mng020State.useSaisuiPointState.sisetuNo}
                            setterInfo={{
                                setterName: mng020State.setSaisuiPointState,
                                outputState: { ...mng020State.useSaisuiPointState },
                                selectedName: 'sisetuNo',
                                index: null,
                            }}
                        />
                    </div>
                </div>
                <div className={`${cssMNG020.form_top_cond_input_form}`}>
                    <div className={`${cssMNG020.form_cond_label}`} style={{ width: "60px" }}>処理過程</div>
                    <div style={{ width: "72%" }}>
                        <ComboBoxSearch
                            className="disabled_bg_color"
                            id="mng020-combobox-process"
                            dataTestId="mng020-4-2"
                            width="100%"
                            height="35px"
                            options={useSelectProcess}
                            clearBotton={true}
                            value={mng020State.useSaisuiPointState.processNo}
                            selectVal={mng020State.useSaisuiPointState.processNo}
                            setterInfo={{
                                setterName: mng020State.setSaisuiPointState,
                                outputState: { ...mng020State.useSaisuiPointState },
                                selectedName: 'processNo',
                                index: null,
                            }}
                        />
                    </div>
                </div>
                <div className={`${cssMNG020.form_top_cond_input_form}`}>
                    <div className={`${cssMNG020.form_cond_label}`} style={{ width: "50px" }}>地点名</div>
                    <div style={{ width: "72%" }}>
                        <InputText
                            id='input-info-text'
                            name='input-info-text'
                            dataTestId="spt010-4-2"
                            width='100%'
                            margin='0'
                            max={50}
                            contentsFlg={true}
                            value={mng020State.useSaisuiPointState.pointName}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                mng020State.setSaisuiPointState(prev => ({ ...prev, pointName: value }));
                            }}
                        />
                    </div>
                </div>
                <div className={`${cssMNG020.form_top_cond_input_form}`}>
                    <div className={`${cssMNG020.form_cond_label}`} style={{ width: "60px" }}>採水区分</div>
                    <div style={{ width: "50%" }}>
                        <ComboBoxSearch
                            className="disabled_bg_color"
                            id="mng020-combobox-saisui-kbn"
                            dataTestId="mng020-4-4"
                            width='100%'
                            height="35px"
                            options={useSelectSaisuiKbn}
                            clearBotton={true}
                            value={mng020State.useSaisuiPointState.saisuiKbnNo}
                            selectVal={mng020State.useSaisuiPointState.saisuiKbnNo}
                            setterInfo={{
                                setterName: mng020State.setSaisuiPointState,
                                outputState: { ...mng020State.useSaisuiPointState },
                                selectedName: 'saisuiKbnNo',
                                index: null,
                            }}
                        />
                    </div>
                </div>



            </div>
        </>
    )

};

const MNG020SaisuiPointLists = ({ commonState, mng020State }): JSX.Element => {
    // 採水地点設定データ
    const [useGridTableData, setGridTableData] = React.useState<any>();
    const [useInitGridTableData, setInitGridTableData] = React.useState<any>();

    // 採水地点マスタ_検索処理
    const searchSaisuiPointData = async (): Promise<any> => {
        commonState.setResultMessage([]);
        commonState.setMessageMutiLine([]);
        setGridTableData(null);

        let newRowObj: any = [];
        Api.post("/MNG020/searchSaisuiPoint", commonState.setMessageMutiLine, mng020State.useSaisuiPointState)
            .then((data) => {
                if (data.searchSaisuiPoint?.length > 0) {
                    // データ内容
                    data.searchSaisuiPoint?.forEach((item, key) => {
                        // 取得してきた検索結果を一覧に表示する。
                        newRowObj.push({
                            rowNo: String(key + 1),
                            pointNo: String(Common.checkNullAndReturnNumber(item.point_no)),
                            pointDspName: Common.checkNullAndReturnString(item.point_dsp_name),
                            pointReportName: Common.checkNullAndReturnString(item.point_report_name),
                            saisuiKbnNo: Common.checkNullAndReturnString(item.saisui_kbn_no),
                            sisetuNo: Common.checkNullAndReturnString(item.sisetu_no),
                            processNo: Common.checkNullAndReturnString(String(item.process_no)),
                        });
                    });

                    // ヘッダデータ
                    const newColumnObj: any = [
                        { id: 1, columnName: 'rowNo', columnTitle: 'No', width: parseInt(String((3.8 / 100) * window.innerWidth)), resizeAble: false },
                        { id: 2, columnName: 'pointNo', columnTitle: '地点番号', width: parseInt(String((7.40 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 3, columnName: 'pointDspName', columnTitle: '地点名称画面', width: parseInt(String((19 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 4, columnName: 'pointReportName', columnTitle: '地点名称報告書', width: parseInt(String((19 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 5, columnName: 'saisuiKbnNo', columnTitle: '採水区分名称', width: parseInt(String((16 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 6, columnName: 'sisetuNo', columnTitle: '浄水場', width: parseInt(String((16 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 7, columnName: 'processNo', columnTitle: '処理過程', width: parseInt(String((16 / 100) * window.innerWidth)), resizeAble: true },
                    ];

                    // 各データのインタフェース
                    const newRowDataInterface: any = [
                        { interfaceName: 'rowNo', interfaceType: 'string' },
                        { interfaceName: 'pointNo', interfaceType: 'string' },
                        { interfaceName: 'pointDspName', interfaceType: 'text' },
                        { interfaceName: 'pointReportName', interfaceType: 'text' },
                        { interfaceName: 'saisuiKbnNo', interfaceType: 'select' },
                        { interfaceName: 'sisetuNo', interfaceType: 'select' },
                        { interfaceName: 'processNo', interfaceType: 'select' },
                    ];

                    // 施設マスタで取得
                    let newSelectionSisetu: { label: string, value: string }[] = [];
                    if (data.sisetuData?.length > 0) {
                        data.sisetuData?.forEach((item) => {
                            newSelectionSisetu.push({
                                label: item.sisetu_name,
                                value: item.sisetu_no,
                            });
                        });
                    }


                    // 処理過程マスタ
                    let newSelectionProcess: { label: string, value: string }[] = [];
                    if (data.processData?.length > 0) {
                        data.processData?.forEach((item) => {
                            newSelectionProcess.push({
                                label: item.process_name,
                                value: item.process_no,
                            });
                        });
                    }

                    // 採水区分マスタ
                    let newSelectionSaisuiKbn: { label: string, value: string }[] = [];
                    if (data.saisuiKbnData?.length > 0) {
                        data.saisuiKbnData?.forEach((item) => {
                            newSelectionSaisuiKbn.push({
                                label: item.saisui_kbn_name,
                                value: item.saisui_kbn_no,
                            });
                        });
                    }


                    // 引数設定
                    setGridTableData({
                        mngNo: "MNG020",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        saisuiKbnSelect: newSelectionSaisuiKbn,
                        sisetuKbnSelect: newSelectionSisetu,
                        processKbnSelect: newSelectionProcess,
                        maxSaisuiPoint: data.maxSaisuiPoint,
                    });

                    // 初期化ステート設定
                    setInitGridTableData({
                        mngNo: "MNG020",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        saisuiKbnSelect: newSelectionSaisuiKbn,
                        sisetuKbnSelect: newSelectionSisetu,
                        processKbnSelect: newSelectionProcess,
                        maxSaisuiPoint: data.maxSaisuiPoint,
                    });

                    mng020State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
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
        queryKey: ["searchSaisuiPointData"],
        initialData: async () => {
            // 検索条件を初期化
            await mng020State.setSaisuiPointState(atomMng020.defaultSaisuiPointState);
            return [];
        },
        queryFn: async () => {
            // 検索処理を実施
            const data = await searchSaisuiPointData();
            return data;
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
                        <div data-testid="mng020-2" id="simple-grid-context-table" className={`${(commonState.useMessageMutiLine.length > 0) ? cssMNG020.MNG020_config_grid_table_with_msg : cssMNG020.MNG020_config_grid_table}`}>
                            <GridSimpleContextTable dataGrid={useGridTableData} />
                        </div>
                    )}
                </>
            )}
        </>
    );
};

const MNG020Footer = ({ commonState, mng020State, confirmDialog }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // 登録するデータ検証
    const validateSaveSaisuiPointData = async () => {
        // データ検証
        setValidatedData([]);
        commonState.setMessageMutiLine([]);
        const errorInfo: AtomCommon.message[] = [];

        let validateError = [];
        if (mng020State.useSaisuiPointRegistState && mng020State.useSaisuiPointRegistFlgState) {
            let errorCnt: number = 0;
            let dupPointNo: string[] = [];
            let dupPointDspName: string[] = [];
            let dupPointRptName: string[] = [];

            // 採水地点設定のバリデーション
            if (mng020State.useSaisuiPointRegistState?.length > 0) {
                mng020State.useSaisuiPointRegistState?.forEach(point => {
                    /**
                     * ########## 地点番号 ##########
                     */
                    // 地点番号が未入力の場合エラー
                    if (Common.checkNullOfString(point.pointNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + point.rowNo + "：地点番号"]));
                    }

                    // 地点番号が重複している場合エラー
                    if (dupPointNo.find((pointNo) => pointNo == point.pointNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0017W", "No." + point.rowNo + "：地点番号"]));
                    } else {
                        dupPointNo.push(point.pointNo);
                    }

                    // 地点番号が半角数字以外の場合エラー と 地点番号が9桁以上の場合エラー
                    if (Common.checkNumberAndDigits(point.pointNo, 8) !== 0) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const setErrMsg = (Common.checkNumberAndDigits(point.pointNo) == 1) ? getMessage(["WQ-0004W", "No." + point.rowNo + "：地点番号"]) : getMessage(["WQ-0011W", "地点番号", "8"]);
                        errorInfo.push(setErrMsg);
                    }

                    /**
                     * ########## 地点名称画面 ##########
                     */
                    // 地点名称画面が未入力の場合エラー
                    if (Common.checkNullOfString(point.pointDspName)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + point.rowNo + "：地点名称画面"]));
                    }

                    // 地点名称画面が重複している場合エラー
                    if (dupPointDspName.find((pointDspName) => pointDspName == point.pointDspName)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0017W", "No." + point.rowNo + "：地点名称画面"]));
                    } else {
                        dupPointDspName.push(point.pointDspName);
                    }

                    // 地点名称画面が51桁以上の場合エラー
                    if (Common.checkLengthOverOfString(point.pointDspName, 51)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0011W", "No." + point.rowNo + "：地点名称画面", "50"]));
                    }

                    /**
                     * ########## 地点名称報告書 ##########
                     */
                    // 地点名称報告書が未入力の場合エラー
                    if (Common.checkNullOfString(point.pointReportName)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + point.rowNo + "：地点名称報告書"]));
                    }

                    // 地点名称報告書が重複している場合エラー
                    if (dupPointRptName.find((pointReportName) => pointReportName == point.pointReportName)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0017W", "No." + point.rowNo + "：地点名称報告書"]));
                    } else {
                        dupPointRptName.push(point.pointReportName);
                    }

                    // 地点名称報告書が51桁以上の場合エラー
                    if (Common.checkLengthOverOfString(point.pointReportName, 51)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0011W", "No." + point.rowNo + "：地点名称報告書", "50"]));
                    }

                    /**
                     * ########## 採水区分名称 ##########
                     */
                    // 採水区分名称が未入力の場合エラー
                    if (Common.checkNullOfString(point.saisuiKbnNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + point.rowNo + "：採水区分名称"]));
                    }

                    /**
                     * ########## 浄水場 ##########
                     */
                    // 浄水場が未入力の場合エラー
                    if (Common.checkNullOfString(point.sisetuNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + point.rowNo + "：浄水場"]));
                    }

                    /**
                     * ########## 処理過程 ##########
                     */
                    // 処理過程が未入力の場合エラー
                    if (Common.checkNullOfString(point.processNo)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        errorInfo.push(getMessage(["WQ-0006W", "No." + point.rowNo + "：処理過程"]));
                    }
                });
            }

            // エラー発生を判定
            if (errorCnt === 0) {
                saveSaisuiPointMutation.mutate();
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
    const saveSaisuiPointMutation = useMutation({
        mutationFn: async (saveData) => {
            // リクエスト
            const request = {
                data_to_save: mng020State.useSaisuiPointRegistState,
                search_cond: mng020State.useSaisuiPointState,
                display_time: mng020State.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 選択している日付に基づき、検査情報を取得
            const response = await Api.post(
                "/MNG020/saveSaisuiPointData",
                commonState.setMessageMutiLine,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["searchSaisuiPointData"] });

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
                        data-testid="mng020-3-1"
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
                                message: getMessage(["WQ-0005Q", "採水地点設定した情報をすべて廃棄"]).message,
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
                        data-testid="mng020-3-2"
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
                                    const isValid = validateSaveSaisuiPointData();
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

const MNG020 = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                   // 汎用
    const mng020State = Mng020StateContainer();                   // 採水地点
    const confirmDialog = ConfirmDialogStateContainer();          // 確認ダイアログ

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        mng020State: mng020State,
        confirmDialog: confirmDialog,
    }

    // ページから離れる時、キャッシュをクリア
    const queryClient = useQueryClient();
    React.useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ["searchSaisuiPointData"] });
        };
    }, [queryClient]);

    return (
        <>
            <div id="MNG020-main-container" className={`${cssMNG020.MNG020_main_container}`}>
                <MessageMutiLineArea />
                <div
                    id="mng020-saisui-point-title"
                    className="container_row"
                    style={{
                        justifyContent: "left",
                        margin: "0px 0px 10px 0px",
                    }}
                >
                    <h2
                        data-testid="mng020-1"
                        style={{ width: "fit-content", alignContent: "center" }}
                    >
                        {"採水地点設定"}
                    </h2>
                </div>
                <MNG020SearchArea {...comblineProps} />
                <MNG020SaisuiPointLists {...comblineProps} />
                <MNG020Footer {...comblineProps} />
            </div>
        </>
    );
};

export default MNG020;