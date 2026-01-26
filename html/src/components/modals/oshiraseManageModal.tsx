// メニューラベル管理画面（モーダル）
import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button } from "../common";
import * as Const from "../../common/const";
import * as Common from '../../common/common';
import DatePicker from 'react-date-picker';

import { InputText, Select, ModalMessageArea } from "../common";

import { useAtom } from "jotai";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomOshiraseManage from "../../stores/atomOshiraseManage";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Spt010StateContainer } from '../../components/containers/spt010StateContainer';
import { OshiraseManageStateContainer } from '../../components/containers/oshiraseManageStateContainer';
import { SideEditMenuModalStateContainer } from '../../components/containers/sideEditMenuModalStateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';

// サイドメニュスタイル
import outlierListModal from "../../scss/modals/outlierListModal.module.scss";
import inputMenuManageModal from "../../scss/modals/inputMenuManageModal.module.scss";
import "react-date-picker/dist/DatePicker.css";     // ライブラリー_CSS_react-date-picker
import "react-calendar/dist/Calendar.css";          // ライブラリー_CSS_react-date-picker_カレンダー
import "../../scss/reactDatePicker.scss";

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 日時管理ライブラリー
import moment from "moment";

// ヘッダー
const HeaderArea = (): JSX.Element => {

    return (
        <div className={`${outlierListModal.outlier_list_modal_header}`}>
            <span>お知らせ管理</span>
        </div>
    );
};

// お知らせ管理
const OshiraseManageArea = ({ commonState, oshiraseManageState, sideMenuEditModalState }): JSX.Element => {
    
    React.useEffect(() => {
        if (sideMenuEditModalState.dataSideEditMenuSelected) {
            sideMenuEditModalState.setMenuEdit((prev) => ({
                ...prev,
                text: sideMenuEditModalState.dataSideEditMenuSelected.textEdit,
                parentId: sideMenuEditModalState.dataSideEditMenuSelected.parentIdEdit,
            }));
        }
    }, []);

    // ※画面上クリアのみ、削除データの反映は登録処理で実施する
    const clearUploadFile = () => {
        oshiraseManageState.setOshiraseManage({
            ...oshiraseManageState.useOshiraseManage,
            infoFile: null,
            infoFileName: "",
            infoFileSize: "",
            infoFileExt: "",
            infoClearFileFlg: true,
        });
    };

    const [useDelayStyle, setDelayStyle] = React.useState<string>("modal_date_picker_hide");

    React.useEffect(() => {
        setTimeout(() => {
            setDelayStyle("modal_date_picker_show");
        }, 10);
    }, []);

    return (
        <>
            <div className={`${inputMenuManageModal.unyou_manage_area_container}`}>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 42 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>掲載日</span>
                    <div style={{ width: "80%" }}>
                        {/* <InputDate
                            id='input-info-date'
                            name='input-info-date'
                            width="120px"
                            height="35px"
                            margin="0 30px 0 0"
                            autoComplete={"off"}
                            value={useOshiraseManage.infoDate}
                            setterInfo={{
                                setterName: setOshiraseManage,
                                outputState: { ...useOshiraseManage },
                                seirekiName: "",
                                selectedName: "infoDate",
                                index: null,
                            }}
                        /> */}
                        <DatePicker
                            id="date_from"
                            value={oshiraseManageState.useOshiraseManage.infoDate}
                            showLeadingZeros={true}
                            openCalendarOnFocus={true}
                            closeCalendar={true}
                            calendarIcon={null}
                            className={useDelayStyle}
                            calendarProps={{
                                'calendarType': "gregory"
                            }}
                            minDate={new Date("1000/01/01")}
                            maxDate={new Date("9999/12/31")}
                            onChange={(value: any) => {
                                const setDate = (value) ? moment(value).format("YYYY/MM/DD") : null;
                                oshiraseManageState.setOshiraseManage({ ...oshiraseManageState.useOshiraseManage, infoDate: setDate });
                            }}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>お知らせ内容</span>
                    <div style={{ width: "calc(100% - 120px)" }}>
                        <textarea
                            id={`modal_column_`}
                            placeholder=""
                            rows={9}
                            maxLength={5000}
                            value={oshiraseManageState.useOshiraseManage.infoText ?? ''}
                            onChange={({
                                target: { value },
                            }: React.ChangeEvent<HTMLTextAreaElement>) => {
                                oshiraseManageState.setOshiraseManage({ ...oshiraseManageState.useOshiraseManage, 'infoText': value });
                            }}
                        />
                    </div>
                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>リンク</span>
                    <div style={{ width: "calc(100% - 120px)" }}>
                        <InputText
                            id='input-info-link'
                            name='input-info-link'
                            width='100%'
                            margin="0 30px 0 0"
                            contentsFlg={true}
                            disabled={(oshiraseManageState.useOshiraseManage.unyouId) ? true : false}
                            value={oshiraseManageState.useOshiraseManage.infoLink}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                oshiraseManageState.setOshiraseManage({ ...oshiraseManageState.useOshiraseManage, 'infoLink': value });
                            }}
                        />
                    </div>

                </div>
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 50 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>添付ファイル</span>
                    <div style={{ width: "calc(100% - 120px)" }}>
                        {/* ファイル */}
                        <input
                            type="file"
                            multiple
                            id="fileUpload"
                            style={{ width: "calc(100% - 130px)" }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const getFile: any = e.target.files[0];
                                console.log("getFile +++ ", getFile);

                                oshiraseManageState.setOshiraseManage({
                                    ...oshiraseManageState.useOshiraseManage,
                                    infoFile: getFile,
                                    infoFileName: getFile.name,
                                    infoFileSize: getFile.size,
                                    infoFileExt: Common.getFileExtension(getFile.name),
                                    infoClearFileFlg: false,
                                });
                            }}
                            accept=".*"
                        />

                        {/* 閉じるボタン */}
                        <Button
                            title="ファイル削除"
                            width="120px"
                            height="52px"
                            className="button_hover_gray button_float_right"
                            onClick={() => {
                                // ※画面上クリアのみ、削除データの反映は登録処理で実施する
                                clearUploadFile();
                            }}
                        />
                    </div>
                </div>
                {(oshiraseManageState.useOshiraseManage.infoFilePath && !oshiraseManageState.useOshiraseManage.infoClearFileFlg && !oshiraseManageState.useOshiraseManage.infoFile) && (
                    <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 30 }}>
                        <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}></span>
                        <div style={{ width: "80%" }}>
                            <a target="_blank" href={oshiraseManageState.useOshiraseManage.infoFilePath}>{oshiraseManageState.useOshiraseManage.currentShowFileName ?? ""}</a>
                        </div>
                    </div>
                )}
                <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 42 }}>
                    <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>表示フラグ</span>
                    <div style={{ width: "calc(100% - 120px)" }}>
                        <Select
                            className="disabled_bg_color"
                            name="side-input-menu-affilation"
                            labelWidth="120px"
                            value={oshiraseManageState.useOshiraseManage.infoDspFlg}
                            width="20%"
                            margin="0"
                            options={Const.FLG_OPTIONS}
                            onChange={({
                                target: { value },
                            }: React.ChangeEvent<HTMLInputElement>) => {
                                oshiraseManageState.setOshiraseManage((prev) => ({
                                    ...prev,
                                    infoDspFlg: value,
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

// フッター
const FooterArea = ({ commonState, oshiraseManageState, confirmDialog }): JSX.Element => {
    // クエリクライアント
    const queryClient = useQueryClient();

    // 検証完了の登録データ
    const [useValidatedData, setValidatedData] = React.useState<any>([]);

    // メッセージ表示する時、GridTableの高さを調整
    useQuery({
        queryKey: ["adjustGridTableWithMessage", commonState.useResultModalMessage],
        queryFn: async () => {
            const extendHeight: string = String(
                40 * Number(commonState.useResultModalMessage.length)
            );
            const inputArea: any = document.getElementById(
                "input_menu_modal_panel_content"
            );
            // inputArea.style.height = "calc(75vh + " + extendHeight + "px)";

            return true;
        },
    });

    // 登録するデータ検証
    const validateSaveOshiraseData = async () => {
        // データ検証
        setValidatedData([]);
        commonState.setResultModalMessage([]);

        if (oshiraseManageState.useOshiraseManage) {
            let errorCnt: number = 0;

            /**
             * ########## お知らせ内容 ##########
             */
            // お知らせ内容が未入力の場合エラー
            if (!Common.checkNullOfString(oshiraseManageState.useOshiraseManage.infoText)) {
                // お知らせ内容が5001桁以上で入力されている場合エラー
                if (Common.checkLengthOverOfString(oshiraseManageState.useOshiraseManage.infoText, 5000)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0011W", "お知らせ内容", "255"]));
                    commonState.setResultModalMessage(errorInfo);

                    return;
                }
            }

            /**
             * ########## 掲載日 ##########
             */
            // 掲載日が未入力の場合、エラー
            if (Common.checkNullOfString(oshiraseManageState.useOshiraseManage.infoDate)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "掲載日"]));
                commonState.setResultModalMessage(errorInfo);

                return;
            }

            /**
             * ########## リンク ##########
             */
            // リンクが未入力の場合エラー
            if (!Common.checkNullOfString(oshiraseManageState.useOshiraseManage.infoLink)) {
                // リンクが256桁以上入力されている場合エラー
                if (Common.checkLengthOverOfString(oshiraseManageState.useOshiraseManage.infoLink, 255)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0011W", "リンク", "255"]));
                    commonState.setResultModalMessage(errorInfo);

                    return;
                }
            }

            /**
             * ########## 添付ファイル ##########
             */
            // 添付ファイルがある場合
            if (oshiraseManageState.useOshiraseManage.infoFile) {
                // 添付ファイルが255桁以上の場合エラー
                if (Common.checkLengthOverOfString(String(oshiraseManageState.useOshiraseManage.infoFileName), 255)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0011W", "添付ファイル", "255"]));
                    commonState.setResultModalMessage(errorInfo);

                    return;
                }

                // 添付ファイルのサイズが100MB以上だった場合、エラー
                if (Number(oshiraseManageState.useOshiraseManage.infoFileSize) > Const.ALLOWED_UNYOU_FILE_SIZE) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0015W", "添付ファイル", "100MB"]));
                    commonState.setResultModalMessage(errorInfo);

                    return;
                }

                // 添付ファイルの拡張子が指定しているもの以外だった場合、エラー
                if (!Common.checkFileExtension(oshiraseManageState.useOshiraseManage.infoFileName, Const.ALLOWED_UNYOU_FILE_EXT)) {
                    // エラー数える
                    errorCnt += 1;

                    // 必須項目のエラーメッセージを表示
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0016W", ".pdf, .docx, .xlsx, .jpg, .png"]));
                    commonState.setResultModalMessage(errorInfo);

                    return;
                }
            }

            /**
             * ########## 表示フラグ ##########
             */
            // 表示フラグが未選択の場合エラー
            if (Common.checkNullOfString(oshiraseManageState.useOshiraseManage.infoDspFlg)) {
                // エラー数える
                errorCnt += 1;

                // 必須項目のエラーメッセージを表示
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0006W", "表示フラグ"]));
                commonState.setResultModalMessage(errorInfo);

                return;
            }

            // エラー発生を判定
            if (errorCnt === 0) {
                saveInfoWithFileUploadMutation.mutate();

                return true;
            } else {
                return false;
            }
        } else {
            // エラーメッセージ
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0019W"]));
            commonState.setResultModalMessage(errorInfo);

            return false;
        }
    };

    // データ登録
    const saveInfoWithFileUploadMutation = useMutation({
        mutationFn: async () => {
            // エラーメッセージ初期化
            commonState.setResultMessage([]);
            commonState.setResultModalMessage([]);

            // フォームデータを設定
            const formData = new FormData(document.forms[0]);

            // 添付ファイルを設定
            formData.append('upload_file', oshiraseManageState.useOshiraseManage.infoFile);
            formData.append('upload_file_name', oshiraseManageState.useOshiraseManage.infoFileName);

            // バリデーション用
            formData.append('info_date', oshiraseManageState.useOshiraseManage.infoDate);
            formData.append('info_text', oshiraseManageState.useOshiraseManage.infoText);
            formData.append('info_link', oshiraseManageState.useOshiraseManage.infoLink);
            formData.append('dsp_flg', oshiraseManageState.useOshiraseManage.infoDspFlg);

            // ファイル種類を設定
            const data_info = {
                data_mode: oshiraseManageState.useOshiraseManage.dataMode,
                info_id: oshiraseManageState.useOshiraseManage.infoID,
                info_text: oshiraseManageState.useOshiraseManage.infoText,
                info_date: oshiraseManageState.useOshiraseManage.infoDate,
                info_link: oshiraseManageState.useOshiraseManage.infoLink,
                file_path: oshiraseManageState.useOshiraseManage.infoFileName,
                dsp_flg: oshiraseManageState.useOshiraseManage.infoDspFlg,
                info_regist_flg: oshiraseManageState.useOshiraseManage.infoRegistFlg,
                info_clear_file_flg: oshiraseManageState.useOshiraseManage.infoClearFileFlg,
                display_time: oshiraseManageState.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // フォームデータを生成
            formData.append('data', JSON.stringify(data_info));

            // お知らせを登録
            const response = await Api.post('/SPT010/saveOshiraseData', commonState.setResultModalMessage, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["searchOshiraseData"] });

            // 処理正常終了のメッセージ
            const msgInfo: AtomCommon.message[] = [];
            const setMsgInfo: any = (oshiraseManageState.useOshiraseManage.dataMode == "登録") ? getMessage(["WQ-0002I"]) : (oshiraseManageState.useOshiraseManage.dataMode == "編集") ? getMessage(["WQ-0003I"]) : getMessage(["WQ-0004I"]);
            msgInfo.push(setMsgInfo);
            commonState.setResultMessage(msgInfo);

            // 子画面を閉じる
            oshiraseManageState.setDisplayTime(moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
            oshiraseManageState.setOshiraseManage(AtomOshiraseManage.defaultOshiraseManageState);
            oshiraseManageState.setOshiraseManageModalFlg(false);
        },
        // エラー発生
        onError: (error) => {
            // 内部エラーメッセージを表示
            if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                const errorInfo: AtomCommon.message[] = [];
                errorInfo.push(getMessage(["WQ-0003E"]));
                commonState.setResultMessage(errorInfo);
            }
        },
    });

    return (
        <div
            className={`${outlierListModal.outlier_list_modal_footer}`}
            id="modalFooter"
        >
            <div className={`${outlierListModal.outlier_list_modal_footer_button}`}>
                {/* 削除ボタン */}
                {(oshiraseManageState.useOshiraseManage.dataMode === "編集") ? (
                    <Button
                        title="削除"
                        width="100px"
                        margin="0px 0px 0px 15px"
                        className="footer_cencel_btn footer_modal_btn_left button_hover_red"
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                cancelBtnName: "いいえ",
                                message: getMessage(["WQ-0003Q"])
                                    .message,
                                onConfirm: () => {
                                    // データクリア
                                    oshiraseManageState.setOshiraseManage({
                                        ...oshiraseManageState.useOshiraseManage,
                                        dataMode: "削除",
                                        infoFile: null,
                                        infoFileName: "",
                                        infoFileSize: "",
                                        infoFileExt: "",
                                    });

                                    saveInfoWithFileUploadMutation.mutate();
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                ) : (<></>)
                }

                {/* 登録ボタン */}
                <Button
                    title={(oshiraseManageState.useOshiraseManage.dataMode == "登録") ? "登録" : "更新"}
                    width="100px"
                    margin="0px 0px 0px 15px"
                    className="footer_btn_right button_hover_green"
                    onClick={() => {
                        // 確認ダイアログ
                        confirmDialog.setDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                            cancelBtnName: "いいえ",
                            message: (oshiraseManageState.useOshiraseManage.dataMode === "登録") ? getMessage(["WQ-0001Q"]).message : getMessage(["WQ-0002Q"]).message,
                            onConfirm: () => {
                                const isValid = validateSaveOshiraseData();
                            },
                            onCancel: () => {
                                // 処理なし
                            },
                        }));
                    }}
                />
                {/* 閉じるボタン */}
                <Button
                    title="閉じる"
                    width="100px"
                    margin="0px 0px 0px 15px"
                    className="footer_cencel_btn footer_btn_left button_active_white"
                    onClick={() => {
                        // データクリア
                        oshiraseManageState.setOshiraseManage(AtomOshiraseManage.defaultOshiraseManageState);

                        // 子画面を閉じる
                        oshiraseManageState.setOshiraseManageModalFlg(!oshiraseManageState.useOshiraseManageModalFlg);

                        // モダールメッセージをクリア
                        commonState.setResultModalMessage([]);
                    }}
                />
            </div>
        </div>
    );
};

export const OshiraseManageModal = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                                 // 汎用
    const spt010State = Spt010StateContainer();                                 // お知らせ管理
    const oshiraseManageState = OshiraseManageStateContainer()                  // お知らせ管理
    const sideMenuEditModalState = SideEditMenuModalStateContainer()            // 編集用のメニュー
    const confirmDialog = ConfirmDialogStateContainer();                        // 確認ダイアログ

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        // お知らせ管理
        spt010State: spt010State,
        oshiraseManageState: oshiraseManageState,
        // 編集用のメニュー
        sideMenuEditModalState,
        // 確認ダイアログ
        confirmDialog: confirmDialog,
    }

    return (
        <div className="modal">
            <div className="modal_content" style={{ marginTop: "1%" }}>
                <HeaderArea />
                <div
                    id="input_menu_modal_panel_content"
                    className={`contents_panel ${inputMenuManageModal.input_menu_modal_panel_content}`}
                    style={{ height: 480, overflow: "auto" }}
                >
                    <ModalMessageArea />

                    {/* お知らせ管理 */}
                    <OshiraseManageArea {...comblineProps} />
                </div>
                <FooterArea {...comblineProps} />
            </div>
        </div>
    );
};

export default OshiraseManageModal;
