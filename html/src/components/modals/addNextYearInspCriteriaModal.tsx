// 動画マニュアルサブ画面（モーダル）
import { Api, getMessage } from "../../common/api";
import { InputText, Button, ModalMessageArea } from '../common';
import { useMutation, useQueryClient, useIsMutating } from '@tanstack/react-query';

// 日時管理ライブラリー
import moment from "moment";

// スタイル
import cssEditMenuModal from '../../scss/modals/editMenuModal.module.scss'
import selectOptionSettingModal from '../../scss/modals/selectOptionSettingModal.module.scss'
import addNextYearInspCriteria from "../../scss/modals/addNextYearInspCriteria.module.scss";

//【ステート】共通
import * as AtomCommon from "../../stores/atom";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Mng040StateContainer } from '../../components/containers/mng040StateContainer';
import { AddNextYearStateContainer } from '../../components/containers/addNextYearInspCriteriaModalStateContainer';
import { InspectionItemSettingStateContainer } from '../../components/containers/inspectionItemSettingStateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';


//【ライブラリー】ReactGrid
import "@silevis/reactgrid/styles.css";

// ローディング
import Loading from "../../components/layouts/loading";

// ヘッダー
const HeaderArea = (): JSX.Element => {
    return (
        <div
            className={`${selectOptionSettingModal.select_option_modal_header}`}
        >
            <span>適用年度追加画面</span>
        </div>
    );
};

// メニュー構成編集
const EditMenuArea = ({ mng040State, addNextYearState }): JSX.Element => {

    return (
        <>
            <div
                id="add-next-year-insp-criteria"
                className={`${addNextYearInspCriteria.input_form_area}`}
            >
                <div className={`container_row ${addNextYearInspCriteria.form_container}`}>
                    <span className={`${addNextYearInspCriteria.form_label}`}>最新の適用年度</span>
                    <InputText
                        id="side-input-menu-name"
                        name="side-input-menu-name"
                        width="100%"
                        margin="0"
                        max={50}
                        contentsFlg={true}
                        disabled={true}
                        value={mng040State.useMng040LatestYear}
                    />
                </div>
                <div className={`container_row ${addNextYearInspCriteria.form_container}`}>
                    <span className={`${addNextYearInspCriteria.form_label}`}>追加する適用年度</span>
                    <InputText
                        id="side-input-menu-name"
                        name="side-input-menu-name"
                        width="100%"
                        margin="0"
                        max={50}
                        contentsFlg={true}
                        disabled={true}
                        value={mng040State.useMng040AddNextYear}
                    />
                </div>
                {!addNextYearState.useAddNextYearAvailableFlg && (
                    <div className={`message_area neumorphism item alert`} style={{ bottom: 0, position: "absolute", width: "95%" }}>
                        次々年度の適用年度の追加はできません。
                    </div>
                )}
            </div>

        </>
    )
}

// フッター
const FooterArea = ({ commonState, mng040State, addNextYearState, confirmDialog }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // データ登録
    const { mutate: addNextYearInspCriteria, isPending } = useMutation({
        mutationFn: async () => {
            // 子画面のメッセージをクリア
            commonState.setResultModalMessage([]);

            // リクエスト
            const request = {
                latestYear: mng040State.useMng040LatestYear,
                addNextYear: mng040State.useMng040AddNextYear,
                display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
            };

            // 登録実施
            const response = await Api.post(
                "/MNG040/addNextYearInspCriteria",
                commonState.setResultMessage,
                request
            );

            return response;
        },
        // 正常終了
        onSuccess: () => {
            // 最新年度を更新
            mng040State.setMng040LatestYear(Number(mng040State.useMng040LatestYear) + 1);
            mng040State.setMng040AddNextYear(Number(mng040State.useMng040AddNextYear) + 1);

            //　適用年度追加フラグを設定 ※ 2025/04/01 - 2026/03/31 現年度は 2025年度となる。
            const availableFlg = ((Number(mng040State.useMng040LatestYear) + 1) <= Number(moment(new Date()).subtract(3, 'months').format("YYYY"))) ? true : false;
            addNextYearState.setAddNextYearAvailableFlg(availableFlg);

            // 再取得クエリキー
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ["inspCriteriaSearchInit"] });
                // queryClient.invalidateQueries({ queryKey: ["searchInspCriteriaData"] });
            }, 100);

            // 処理正常終了のメッセージ
            const msgInfo: AtomCommon.message[] = [];
            msgInfo.push(getMessage(["WQ-0002I"]));
            commonState.setResultModalMessage(msgInfo);

            // 適用年度追加子画面を閉じる
            // addNextYearState.setAddNextYearInspCriteriaModalToggleFlg(false);
        },
        // エラー発生
        onError: (error) => {
            // エラーメッセージ
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0003E"]));
            commonState.setResultModalMessage(errorInfo);
        },
    });

    return (
        <div
            className={`${selectOptionSettingModal.select_option_modal_footer}`}
            id="selectOptionModalFooter"
        >
            <div className={`${cssEditMenuModal.modal_footer_button}`}>

                {/* 閉じるボタン */}
                <Button
                    title="閉じる"
                    width="100px"
                    margin="0px 0px 0px 15px"
                    className={`footer_cencel_btn button_active_white ${selectOptionSettingModal.footer_btn_right}`}
                    onClick={() => {
                        // 子画面閉じる
                        addNextYearState.setAddNextYearInspCriteriaModalToggleFlg(false);
                    }}
                />
                {/* 追加ボタン */}

                {addNextYearState.useAddNextYearAvailableFlg && (
                    <Button
                        title="追加"
                        width="100px"
                        margin="0px 0px 0px 15px"
                        className={`button_hover_green ${selectOptionSettingModal.footer_btn_right}`}
                        onClick={() => {
                            // 確認ダイアログ
                            confirmDialog.setDialog((prev) => ({
                                ...prev,
                                isOpen: true,
                                message: getMessage(["WQ-0001Q"]).message,
                                onConfirm: () => {
                                    addNextYearInspCriteria();
                                },
                                onCancel: () => {
                                    // 処理なし
                                },
                            }));
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export const AddNextYearInspCriteriaModal = (): JSX.Element => {
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

    const isMutating = useIsMutating();

    return (
        <div
            className='modal'
            style={{ zIndex: 999 }}
        >
            <div
                className='modal_content'
                style={{ width: 400 }}
            >
                <HeaderArea />
                <div
                    className={`contents_panel 
                        ${(addNextYearState.useAddNextYearAvailableFlg)
                            ? (commonState.useResultModalMessage.length > 0)
                                ? addNextYearInspCriteria.panel_modal_content_with_msg
                                : addNextYearInspCriteria.panel_modal_content_without_msg
                            : (commonState.useResultModalMessage.length > 0)
                                ? addNextYearInspCriteria.panel_modal_content_with_msg_with_proc
                                : addNextYearInspCriteria.panel_modal_content_with_msg_without_proc
                        }
                    `}
                >
                    {isMutating ? (
                        <div
                            className={`${addNextYearInspCriteria.loading_position}`}
                            style={{
                                width: 100,
                                justifySelf: "center",
                            }}
                        >
                            <Loading />
                        </div>
                    ) : (
                        <>
                            <ModalMessageArea />
                            <EditMenuArea {...comblineProps} />
                        </>
                    )}


                </div>
                <FooterArea {...comblineProps} />
            </div>
        </div>
    );
};

export default AddNextYearInspCriteriaModal;
