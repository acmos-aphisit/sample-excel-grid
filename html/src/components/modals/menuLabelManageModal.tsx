// メニューラベル管理画面（モーダル）
import React from 'react';
import { Api, getMessage } from "../../common/api";
import { Button } from '../../components/common';
import * as Const from '../../common/const';

import { InputText, Select, MessageArea, ModalMessageArea } from '../common';

import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { useLocation } from "react-router-dom";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomMenuLabelManage from "../../stores/atomMenuLabelManage";

// サイドメニュスタイル
import outlierListModal from '../../scss/modals/outlierListModal.module.scss'
import menuLabelManageModal from '../../scss/modals/menuLabelManageModal.module.scss'

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// 日時管理ライブラリー
import moment from "moment";

// ヘッダー
const HeaderArea = (): JSX.Element => {
    // 管理データ
    const useMenuLabelState = useAtomValue(AtomMenuLabelManage.menuLabelState);

    return (
        <div
            className={`${outlierListModal.outlier_list_modal_header}`}
        >
            <span>メニューラベル{useMenuLabelState.menuLabelMode}</span>
        </div>
    );
};

// メニューラベル管理
const MenuLabelManageArea = (): JSX.Element => {
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
    const [useMenuLabelState, setMenuLabelState] = useAtom(AtomMenuLabelManage.menuLabelState);

    // 編集用のメニュー
    const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
    const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

    React.useEffect(() => {
        if (dataSideEditMenuSelected) {
            setMenuEdit(prev => ({ ...prev, text: dataSideEditMenuSelected.textEdit, parentId: dataSideEditMenuSelected.parentIdEdit }));
        }
    }, [])

    // 所属課選択肢
    const [useSelectionAffiliation, setSelectAffiliation] = useAtom(AtomMenuLabelManage.selectionAffiliation);

    // 親ラベル選択肢
    const [useSelectParentMenu, setSelectParentMenu] = useAtom(AtomMenuLabelManage.selectParentMenu);

    // 処理実施日時
    const [useDisplayTime, setDisplayTime] = useAtom(AtomMenuLabelManage.menuLabelDisplayTime);

    // パス確認
    const url = useLocation();

    // 初期化
    const menuLabelInit = async () => {
        // エラーメッセージ初期化
        setResultMessage([]);

        // 選択肢情報を取得
        Api.get("/getMenuLabelSelection", setResultMessage)
            .then((data: any) => {
                console.log("sidemenuMaster_data", data);

                if (data.length <= 0) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
                    setResultMessage(errorInfo);
                } else {
                    // 所属課データ
                    setAffiliationList(data.affiliationData);

                    // 親ラベル選択肢を設定
                    let newSelectionParentMenu: { label: string, value: string }[] = [{ label: "", value: "" }];
                    if (url.pathname == "/MNG050") {
                        // 親ラベル_検査情報入力
                        setMenuLabelParentList(data.parentMenuData);
                        data.parentMenuData.forEach((item) => {
                            newSelectionParentMenu.push({
                                label: item.input_title,
                                value: item.input_menu_no,
                            });
                        });
                    } else if (url.pathname == "/MNG060") {
                        // 親ラベル_帳票出力
                        setMenuLabelParentList(data.getParentMenuReportData);
                        data.getParentMenuReportData.forEach((item) => {
                            newSelectionParentMenu.push({
                                label: item.report_title,
                                value: item.report_menu_no,
                            });
                        });
                    }
                    setSelectParentMenu(newSelectionParentMenu);

                    // 所属課選択肢を設定
                    let newSelectionAffiliation: { label: string, value: string }[] = [{ label: "", value: "" }];
                    data.affiliationData.forEach((item) => {
                        newSelectionAffiliation.push({
                            label: item.affiliation_section,
                            value: item.affiliation_section_no,
                        });
                    });
                    setSelectAffiliation(newSelectionAffiliation);
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
    };

    useQuery({
        queryKey: ["menuLabelInit"],
        queryFn: () => {
            menuLabelInit();
        },
    });

    return (
        <>
            <div className={`${menuLabelManageModal.manage_area_container}`}>
                <div className={`container_row ${menuLabelManageModal.form_container}`}>
                    <span className={`${menuLabelManageModal.form_label}`}>メニュー名称</span>
                    <InputText
                        id='side-menu-name'
                        name='side-menu-name'
                        width='100%'
                        margin='0'
                        max={50}
                        contentsFlg={true}
                        value={useMenuLabelState.menuLabelName}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setMenuLabelState(prev => ({ ...prev, menuLabelName: value }));
                        }}
                    />
                </div>
                <div className={`container_row ${menuLabelManageModal.form_container}`}>
                    <span className={`${menuLabelManageModal.form_label}`}>親ラベル</span>
                    <Select
                        className="disabled_bg_color"
                        name="side-menu-parent"
                        labelWidth="120px"
                        value={useMenuLabelState.menuLabelParent}
                        width="70%"
                        margin='0'
                        options={useSelectParentMenu}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setMenuLabelState(prev => ({ ...prev, menuLabelParent: value }));
                        }}
                    />
                </div>
                <div className={`container_row ${menuLabelManageModal.form_container}`}>
                    <span className={`${menuLabelManageModal.form_label}`}>所属課</span>
                    <Select
                        className="disabled_bg_color"
                        name="side-menu-affiliation"
                        labelWidth="120px"
                        value={useMenuLabelState.menuLabelAffiliation}
                        width="70%"
                        margin='0'
                        options={useSelectionAffiliation}
                        onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                            setMenuLabelState(prev => ({ ...prev, menuLabelAffiliation: value }));
                        }}
                    />
                </div>
            </div>

        </>
    )
}

// フッター
const FooterArea = (): JSX.Element => {
    // 処理結果メッセージ
    const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
    const [useModalResultMessage, setModalResultMessage] = useAtom(AtomCommon.modalMessageState);


    // 確認ダイアログ設定
    const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

    // 管理データ
    const [useMenuLabelState, setMenuLabelState] = useAtom(AtomMenuLabelManage.menuLabelState);

    // 編集用のメニュー
    const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
    const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

    // メニューラベル管理子画面_表示フラグ
    const [useMenuLabelManageModalFlg, setMenuLabelManageModalFlg] = useAtom(AtomMenuLabelManage.menuLabelManageModalFlgState);

    // 処理実施日時
    const [useDisplayTime, setDisplayTime] = useAtom(AtomMenuLabelManage.menuLabelDisplayTime);

    // 所属課選択肢
    const [useSelectionAffiliation, setSelectAffiliation] = useAtom(AtomMenuLabelManage.selectionAffiliation);

    // 親ラベル選択肢
    const [useSelectParentMenu, setSelectParentMenu] = useAtom(AtomMenuLabelManage.selectParentMenu);

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
            inputArea.style.height = 'calc(40vh + ' + extendHeight + 'px)';

            return true;
        },
    });
    // 登録するデータ検証
    const validateSaveInputData = async () => {
        if (!useMenuLabelState.menuLabelParent) {
            // 必須項目のエラーメッセージを表示
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0006W", "親ラベル"]));
            setModalResultMessage(errorInfo);

            return false;
        }

        // 選択している親ラベルを確認
        const checkCorrectSelectedPar = useSelectParentMenu.find((par) => String(par.value) == String(useMenuLabelState.menuLabelParent));
        if (!checkCorrectSelectedPar) {
            // エラーメッセージ
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0024W", "親ラベル"]));
            setModalResultMessage(errorInfo);

            return false;
        }

        // 選択している所属課を確認
        const checkCorretSelectedAff = useSelectionAffiliation.find((aff) => String(aff.value) == String(useMenuLabelState.menuLabelAffiliation));
        if (!checkCorretSelectedAff) {
            // エラーメッセージ
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0024W", "所属課"]));
            setModalResultMessage(errorInfo);

            return false;
        }

        saveMenuLabel050Mutation.mutate();
    };

    // データ登録
    const saveMenuLabel050Mutation = useMutation({
        mutationFn: async () => {
            // エラーメッセージ初期化
            setResultMessage([]);
            setModalResultMessage([]);

            // リクエスト
            let request;
            let requestApiUrl;
            if (url.pathname == "/MNG050") {
                // 入力画面
                request = {
                    input_menu_no: useMenuLabelState.menuLabelNo,
                    input_title: useMenuLabelState.menuLabelName,
                    input_parent_menu_no: useMenuLabelState.menuLabelParent,
                    affiliation_section_no: useMenuLabelState.menuLabelAffiliation,
                    display_time: useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                    process_name: (useMenuLabelState.menuLabelNo && useMenuLabelState.menuLabelNo !== "") ? "menu_edit" : "menu_add",
                };

                requestApiUrl = "/MNG050/saveMenuLabel";
            } else {
                // 報告書の処理
                request = {
                    report_menu_no: useMenuLabelState.menuLabelNo,
                    report_title: useMenuLabelState.menuLabelName,
                    report_parent_menu_no: useMenuLabelState.menuLabelParent,
                    affiliation_section_no: useMenuLabelState.menuLabelAffiliation,
                    display_time: useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
                    process_name: (useMenuLabelState.menuLabelNo && useMenuLabelState.menuLabelNo !== "") ? "menu_edit" : "menu_add",
                };

                requestApiUrl = "/MNG060/saveMenuLabel";
            }

            // 選択している日付に基づき、検査情報を取得
            const response = await Api.post(
                requestApiUrl,
                setModalResultMessage,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["getInitMenuLists"] });

            // 処理正常終了のメッセージ
            const msgInfo: AtomCommon.message[] = [];
            const msgCode = (useMenuLabelState.menuLabelNo && useMenuLabelState.menuLabelNo !== "") ? "WQ-0003I" : "WQ-0002I";
            msgInfo.push(getMessage([msgCode]));
            setResultMessage(msgInfo);

            // 子画面を閉じる
            setMenuLabelManageModalFlg(false);
        },
        // エラー発生
        onError: (error) => {
            // エラーメッセージ
            // const errorInfo: AtomCommon.message[] = [];
            // errorInfo.push(getMessage(["WQ-0003E"]));
            // setResultMessage(errorInfo);
        },
    });

    return (
        <div
            className={`${outlierListModal.outlier_list_modal_footer}`}
            id="modalFooter">
            <div className={`${outlierListModal.outlier_list_modal_footer_button}`}>
                {/* 登録ボタン */}
                <Button
                    title="登録"
                    width="100px"
                    margin="0px 0px 0px 15px"
                    className="footer_btn_right button_hover_green"
                    onClick={() => {
                        // 確認ダイアログ
                        setDialog((prev) => ({
                            ...prev,
                            isOpen: true,
                            message: getMessage(["WQ-0001Q"]).message,
                            onConfirm: () => {
                                // saveMenuLabel050Mutation.mutate();
                                validateSaveInputData();
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
                        setMenuLabelManageModalFlg(!useMenuLabelManageModalFlg);
                    }}
                />
            </div>
        </div>
    );
};

export const MenuLabelManageModal = (): JSX.Element => {

    return (
        <div
            className='modal'
            style={{ zIndex: 4 }}
        >
            <div
                className='modal_content'
            >
                <HeaderArea />
                <div
                    id='menu_label_modal_panel_content'
                    className={`contents_panel ${menuLabelManageModal.menu_label_modal_panel_content}`}
                >
                    <ModalMessageArea />

                    {/* メニューラベル管理 */}
                    <MenuLabelManageArea />

                </div>
                <FooterArea />
            </div>
        </div>
    );
};

export default MenuLabelManageModal;
