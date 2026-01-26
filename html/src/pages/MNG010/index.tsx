import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button, MessageArea } from '../../components/common';

// CSS
import cssMNG010 from "../../scss/pages/MNG010.module.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 入力画面構成マスタデータ
import { GridSimpleContextTable } from "../../components/common/gridSimpleContextTable";
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Mng010StateContainer } from '../../components/containers/mng010StateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

import * as Const from "../../common/const";
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";
import * as atomMng010 from "../../stores/atomMNG010";

// ローディング
import Loading from "../../components/layouts/loading";

// ユーザマスタ一覧
const MNG010UserMasterLists = ({ commonState, mng010State }): JSX.Element => {
    // 採水地点設定データ
    const [useGridTableData, setGridTableData] = React.useState<any>();
    const [useInitGridTableData, setInitGridTableData] = React.useState<any>();

    // 採水地点マスタ_検索処理
    const searchUserData = async (): Promise<any> => {
        setGridTableData(null);
        commonState.setResultMessage([]);
        mng010State.setAffiliationInfoState([]);

        let newRowObj: any = [];
        Api.post("/MNG010/fetchUserData", commonState.setResultMessage, mng010State.useSearchAndSortState)
            .then((data) => {
                if (data.userData.length > 0) {
                    // データ内容
                    data.userData.forEach((item, key) => {
                        // 取得してきた検索結果を一覧に表示する。
                        newRowObj.push({
                            rowNo: key + 1,
                            userNo: Common.checkNullAndReturnString(item.user_no),
                            userId: Common.checkNullAndReturnString(item.user_id),
                            userPassword: "",
                            userName: Common.checkNullAndReturnString(item.user_name),
                            userFurigana: Common.checkNullAndReturnString(item.user_furigana),
                            affiliationDept: Common.checkNullAndReturnString(item.affiliation_dept),
                            affiliationSectionNo: Common.checkNullAndReturnString(String(item.affiliation_section_no)),
                            securityLevel: Common.checkNullAndReturnString(String(item.security_level)),
                            fixFlg: Common.checkNullAndReturnString(String(item.fix_flg)),
                            registDate: Common.checkNullAndReturnString(item.regist_date),
                            endDate: Common.checkNullAndReturnString(item.end_date),
                            processFlg: "",
                        });
                    });

                    // ヘッダデータ 広さ
                    const newColumnObj: any = [
                        { id: 1, columnName: 'userNo', columnTitle: 'No', width: parseInt(String((3.74 / 100) * window.innerWidth)), resizeAble: false },
                        { id: 2, columnName: 'userId', columnTitle: 'ユーザID', width: parseInt(String((7.49 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 3, columnName: 'userPassword', columnTitle: 'パスワード', width: parseInt(String((11.24 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 4, columnName: 'userName', columnTitle: '氏名', width: parseInt(String((17.23 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 5, columnName: 'userFurigana', columnTitle: 'ふりがな', width: parseInt(String((16.85 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 6, columnName: 'affiliationDept', columnTitle: '所属部', width: parseInt(String((10 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 7, columnName: 'affiliationSectionNo', columnTitle: '所属課', width: parseInt(String((10.5 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 8, columnName: 'securityLevel', columnTitle: '権限', width: parseInt(String((5.99 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 9, columnName: 'fixFlg', columnTitle: '確定ボタン表示非表示', width: parseInt(String((11.99 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 10, columnName: 'registDate', columnTitle: '登録年月日', width: parseInt(String((7.49 / 100) * window.innerWidth)), resizeAble: true },
                        { id: 11, columnName: 'endDate', columnTitle: '終了年月日', width: parseInt(String((7.49 / 100) * window.innerWidth)), resizeAble: true },
                    ];

                    // 各データのインタフェース
                    const newRowDataInterface: any = [
                        { interfaceName: 'userNo', interfaceType: 'string' },
                        { interfaceName: 'userId', interfaceType: 'text' },
                        { interfaceName: 'userPassword', interfaceType: 'text' },
                        { interfaceName: 'userName', interfaceType: 'text' },
                        { interfaceName: 'userFurigana', interfaceType: 'text' },
                        { interfaceName: 'affiliationDept', interfaceType: 'select' },
                        { interfaceName: 'affiliationSectionNo', interfaceType: 'select' },
                        { interfaceName: 'securityLevel', interfaceType: 'select' },
                        { interfaceName: 'fixFlg', interfaceType: 'select' },
                        { interfaceName: 'registDate', interfaceType: 'date' },
                        { interfaceName: 'endDate', interfaceType: 'date' },
                    ];

                    // 所属部取得
                    let newSelectionAffiDept: { label: string, value: string }[] = Const.AFFI_DEPT_OPTIONS;

                    // 所属課取得
                    let newSelectionAffiSect: { label: string, value: string }[] = [];
                    data.affiliationData.forEach((item) => {
                        newSelectionAffiSect.push({
                            label: String(item.affiliation_section),
                            value: String(item.affiliation_section_no),
                        });
                    });
                    mng010State.setAffiliationInfoState(data.affiliationData);

                    // 権限取得
                    let newSelectionSecurity: { label: string, value: number }[] = Const.SECURITY_LEVEL_OPTIONS;

                    // 確定ボタン表示フラグ
                    let newSelectionFixFlg: { label: string, value: number }[] = Const.FIX_FLG_OPTIONS;

                    // 引数設定
                    setGridTableData({
                        mngNo: "MNG010",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        affiliaDeptSelect: newSelectionAffiDept,
                        affiliaSectSelect: newSelectionAffiSect,
                        securityLevelSelect: newSelectionSecurity,
                        fixFlgSelect: newSelectionFixFlg,
                    });

                    // 初期化ステート設定
                    setInitGridTableData({
                        mngNo: "MNG010",
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface,
                        affiliaDeptSelect: newSelectionAffiDept,
                        affiliaSectSelect: newSelectionAffiSect,
                        securityLevelSelect: newSelectionSecurity,
                        fixFlgSelect: newSelectionFixFlg,
                    });

                    mng010State.setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
                }
            })
            .catch((error: Error) => {
                // 想定外のエラーの場合メッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    commonState.setMessage(errorInfo);
                }
            });

        return true;
    };

    // 採水地点マスタ_検索処理
    const { isFetching } = useQuery({
        queryKey: ["searchUserDataMng010"],
        initialData: async () => {
            // 検索条件を初期化
            await mng010State.setSearchAndSortState(atomMng010.defaultSearchAndSortState);

            return [];
        },
        queryFn: async () => {
            // 検索処理を実施
            const $data = await searchUserData();

            return $data;
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
                        <div data-testid="mng010-2" id="simple-grid-context-table" className={`${cssMNG010.MNG010_config_grid_table}`}>
                            <GridSimpleContextTable dataGrid={useGridTableData} />
                        </div>
                    )}
                </>
            )}
        </>
    );
};

const MNG010Footer = ({ commonState, mng010State, confirmDialog }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // 登録するデータ検証
    const validateSaveUserMasterData = async () => {
        // データ検証
        setValidatedData([]);
        commonState.setResultMessage([]);

        if (mng010State.useUserMasterRegistState && mng010State.useUserMasterRegistFlgState) {
            let errorCnt: number = 0;
            let dupUserId: string[] = [];

            // ユーザマスタのバリデーション
            mng010State.useUserMasterRegistState.forEach(data => {
                /**
                 * ########## ユーザID ##########
                 */
                // ユーザIDが未入力の場合、エラー
                if (Common.checkNullOfString(data.userId)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "ユーザID"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                // ユーザIDが重複している場合エラー
                if (dupUserId.find((userId) => userId == data.userId)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0017W", "ユーザID"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                } else {
                    dupUserId.push(data.userId);
                }

                // ユーザIDに半角数字以外の値が入力されている場合、エラー
                if (Common.checkNumberAndDigits(data.userId, 9) !== 0) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const setErrMsg = (Common.checkNumberAndDigits(data.userId, 9) == 1)
                        ? getMessage(["WQ-0004W", "ユーザID"])
                        : getMessage(["WQ-0012W", "ユーザID", "9桁"]);
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(setErrMsg);
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                /**
                 * ########## パスワード ##########
                 */
                // パスワードが未入力の場合エラー
                if (data.processFlg == "NEW") {
                    if (Common.checkNullOfString(data.userPassword)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0006W", "パスワード"]));
                        commonState.setResultMessage(errorInfo);

                        return;
                    }

                    // パスワードに半角英数字以外の値が入力されている場合、エラー
                    if (!Common.checkLettersOrNumber(data.userPassword)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0002W", "パスワード"]));
                        commonState.setResultMessage(errorInfo);

                        return;
                    }
                } else if (data.processFlg == "EDIT" && !Common.checkNullOfString(data.userPassword)) {
                    // パスワードに半角英数字以外の値が入力されている場合、エラー
                    if (!Common.checkLettersOrNumber(data.userPassword)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0002W", "パスワード"]));
                        commonState.setResultMessage(errorInfo);

                        return;
                    }
                }

                /**
                 * ########## 氏名 ##########
                 */
                // 氏名が未入力の場合エラー
                if (Common.checkNullOfString(data.userName)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "氏名"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                // 氏名が51桁以上の場合エラー
                if (Common.checkLengthOverOfString(data.userName, 50)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0012W", "氏名", "50"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                /**
                 * ########## ふりがな ##########
                 */
                // ふりがなが未入力の場合エラー
                if (!Common.checkNullOfString(data.userFurigana)) {
                    // ふりがなが51桁以上の場合エラー
                    if (Common.checkLengthOverOfString(data.userFurigana, 50)) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0012W", "ふりがな", "50"]));
                        commonState.setResultMessage(errorInfo);

                        return;
                    }
                }

                /**
                 * ########## 所属部 ##########
                 */
                // 所属部が未選択の場合、エラー
                if (Common.checkNullOfString(data.affiliationDept)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "所属部"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                /**
                 * ########## 所属課 ##########
                 */
                // 所属課が未選択の場合、エラー
                if (Common.checkNullOfString(data.affiliationSectionNo)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "所属課"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                // 所属課マスタ.所属課番号に存在しない値が設定された場合、エラー
                const checkAffilationExist: any = mng010State.useAffiliationInfoState.find((aff) => aff.affiliation_section_no == data.affiliationSectionNo);
                if (!checkAffilationExist) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006E", "選択している所属課"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }


                /**
                 * ########## 権限 ##########
                 */
                // 権限が未選択の場合、エラー
                if (Common.checkNullOfString(String(data.securityLevel))) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "権限"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                } else {
                    if (data.securityLevel == 1 && (data.affiliationSectionNo !== "01" && data.affiliationSectionNo !== "99")) {
                        // エラー数える
                        errorCnt += 1;

                        // 必須項目のエラーメッセージを表示
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0021W"]));
                        commonState.setResultMessage(errorInfo);

                        return;
                    }
                }

                /**
                 * ########## 登録年月日 ##########
                 */
                // 登録年月日が未入力の場合エラー
                if (Common.checkNullOfString(data.registDate)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "登録年月日"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                /**
                 * ########## 終了年月日 ##########
                 */
                // 終了年月日が未入力の場合エラー
                if (Common.checkNullOfString(data.endDate)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006W", "終了年月日"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }

                // 登録年月日より終了年月日の方が前の日付である場合
                const sttDate = moment(data.registDate);
                const endDate = moment(data.endDate);
                if (endDate.diff(sttDate) < 0) {
                    // エラー数える
                    errorCnt += 1;

                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0010W", "登録年月日"]));
                    commonState.setResultMessage(errorInfo);

                    return;
                }
            });

            // エラー発生を判定
            if (errorCnt === 0) {
                saveUserMasterMutation.mutate();
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
    const saveUserMasterMutation = useMutation({
        mutationFn: async (saveData) => {
            // リクエスト
            const request = {
                data_to_save: mng010State.useUserMasterRegistState,
                display_time: mng010State.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 選択している日付に基づき、検査情報を取得
            const response = await Api.post(
                "/MNG010/saveUserMasterData",
                commonState.setResultMessage,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["searchUserDataMng010"] });

            // 処理正常終了のメッセージ
            const msgInfo: AtomCommon.message[] = [];
            msgInfo.push(getMessage(["WQ-0002I"]));
            commonState.setResultMessage(msgInfo);
        },
        // エラー発生
        onError: (error: Error) => {
            // エラーメッセージ
            if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0003E"]));
                commonState.setResultMessage(errorInfo);
            }
        },
    });

    return (
        <>
            <footer>
                <div className="foot_nav">
                    <Button
                        data-testid="mng010-3-1"
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
                                message: getMessage(["WQ-0005Q", "ユーザマスタ設定した情報をすべて廃棄"]).message,
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
                        data-testid="mng010-3-2"
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
                                    const isValid = validateSaveUserMasterData();
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

const MNG010 = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                   // 汎用
    const mng010State = Mng010StateContainer();                   // ユーザマスタ
    const confirmDialog = ConfirmDialogStateContainer();          // 確認ダイアログ

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        // ユーザマスタ
        mng010State: mng010State,
        // 確認ダイアログ
        confirmDialog: confirmDialog,
    }

    // ページから離れる時、キャッシュをクリア
    const queryClient = useQueryClient();
    React.useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ["searchUserDataMng010"] });
        };
    }, [queryClient]);

    return (
        <>
            <div id="MNG010-main-container" className={`${cssMNG010.MNG010_main_container}`}>
                <MessageArea />
                <div
                    id="mng010-user-data-title"
                    className="container_row"
                    style={{
                        justifyContent: "left",
                        margin: "0px 0px 10px 0px",
                    }}
                >
                    <h2
                        data-testid="mng010-1"
                        style={{ width: "fit-content", alignContent: "center" }}
                    >
                        {"ユーザマスタ"}
                    </h2>
                </div>
                <MNG010UserMasterLists {...comblineProps} />
                <MNG010Footer {...comblineProps} />
            </div>
        </>
    );
};

export default MNG010;