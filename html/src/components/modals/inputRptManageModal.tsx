// メニューラベル管理画面（モーダル）
import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button } from "../common";
import * as Const from "../../common/const";

import { InputText, Select, ModalMessageArea, Icon } from "../common";

import { useAtom, useAtomValue, useSetAtom } from "jotai";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomInputRptManage from "../../stores/atomInputRptManage";

// サイドメニュスタイル
import outlierListModal from "../../scss/modals/outlierListModal.module.scss";
import inputMenuManageModal from "../../scss/modals/inputMenuManageModal.module.scss";

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// 日時管理ライブラリー
import moment from "moment";

// ヘッダー
const HeaderArea = (): JSX.Element => {
  // 管理データ
  const useMenuLabelState = useAtomValue(AtomInputRptManage.inputMenuState);

  return (
    <div className={`${outlierListModal.outlier_list_modal_header}`}>
      <span>
        報告書名・構成　登録/編集
        {/* {useMenuLabelState.inputRptMode} */}
      </span>
    </div>
  );
};

// メニューラベル管理
const MenuReportManageArea = (): JSX.Element => {
  // メッセージ
  const [getResultMessage, setResultModalMessage] = useAtom(
    AtomCommon.modalMessageState
  );
  const [useMessageMutiLine, setMessageMutiLine] = useAtom(AtomCommon.messageMutiLineState);      // 複数メッセージ用

  // 親ラベルリスト
  const [useMenuLabelParentList, setMenuLabelParentList] = useAtom(
    AtomSideMasterMenu.sideMenuLabelParentState
  );

  // 所属課データ
  const [useAffiliationList, setAffiliationList] = useAtom(
    AtomSideMasterMenu.sideMenuAffiliationState
  );

  // 所属課データ
  const [useRefMenuList, setRefMenuList] = useAtom(
    AtomSideMasterMenu.sideRefMenuState
  );

  // 管理データ
  const [useInputMenuRptState, setInputMenuRptState] = useAtom(
    AtomInputRptManage.inputMenuState
  );

  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );
  const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

  React.useEffect(() => {
    if (dataSideEditMenuSelected) {
      setMenuEdit((prev) => ({
        ...prev,
        text: dataSideEditMenuSelected.textEdit,
        parentId: dataSideEditMenuSelected.parentIdEdit,
      }));
    }
  }, []);

  // 所属課選択肢
  const [useSelectionAffiliation, setSelectAffiliation] =
    React.useState<{ label: string; value: string }[]>();

  // 親ラベル選択肢
  const [useSelectParentMenu, setSelectParentMenu] =
    React.useState<{ label: string; value: string }[]>();

  // 参照画面選択肢
  const [useSelectRefMenu, setSelectRefMenu] =
    React.useState<{ label: string; value: string }[]>();

  // 処理実施日時
  const [useDisplayTime, setDisplayTime] = useAtom(
    AtomInputRptManage.inputRptDisplayTime
  );

  // 初期化
  const menuLabelInit = async () => {
    // エラーメッセージ初期化
    setResultModalMessage([]);
    setMessageMutiLine([]);

    // 選択肢情報を取得
    Api.get("/getMenuLabelSelection", setResultModalMessage)
      .then((data: any) => {
        console.log("sidemenuMaster_data", data);

        if (data.length <= 0) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
          setResultModalMessage(errorInfo);
          setMessageMutiLine(errorInfo);
        } else {
          // 所属課データ
          setAffiliationList(data.affiliationData);
          setMenuLabelParentList(data.getParentMenuReportData);
          setRefMenuList(data.refRptMenuData);

          // 親ラベル選択肢を設定
          let newSelectionParentMenu: { label: string; value: string }[] = [
            { label: "", value: "" },
          ];
          data.getParentMenuReportData.forEach((item) => {
            newSelectionParentMenu.push({
              label: item.report_title.replace(".txt", ""),
              value: item.report_menu_no,
            });
          });
          setSelectParentMenu(newSelectionParentMenu);

          // 参照画面選択肢を設定
          let newSelectionRefMenu: { label: string; value: string }[] = [
            { label: "", value: "" },
          ];
          console.log("test", data.refRptMenuData);
          data.refRptMenuData.forEach((item) => {
            newSelectionRefMenu.push({
              label: item.report_name.replace(".txt", ""),
              value: item.report_no,
            });
          });
          setSelectRefMenu(newSelectionRefMenu);

          // 所属課選択肢を設定
          let newSelectionAffiliation: { label: string; value: string }[] = [
            { label: "", value: "" },
          ];
          data.affiliationData.forEach((item) => {
            // 2025/12 設定条件を追加（施設番号）
            // ※「企業局施設課」と「システム保守」は使用不可
            if (item.sisetu_no) {
              newSelectionAffiliation.push({
                label: item.affiliation_section,
                value: item.affiliation_section_no,
              });
            }

          });
          setSelectAffiliation(newSelectionAffiliation);
          setDisplayTime(moment(data.displayTime).format("YYYY-MM-DD HH:mm:ss.SSS"));
        }
      })
      .catch((error: Error) => {
        // 内部エラーメッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setResultModalMessage(errorInfo);
          setMessageMutiLine(errorInfo);
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
      <div className={`${inputMenuManageModal.manage_area_container}`}>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>
            報告書名称
          </span>
          <InputText
            id="side-input-report-name"
            name="side-input-report-name"
            width="100%"
            margin="0"
            max={50}
            contentsFlg={true}
            value={useInputMenuRptState.inputRptName}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuRptState((prev) => ({
                ...prev,
                inputRptName: value,
              }));
            }}
          />
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>親ラベル</span>
          <Select
            className="disabled_bg_color"
            name="side-input-report-parent"
            labelWidth="120px"
            value={useInputMenuRptState.inputRptParent}
            width="70%"
            margin="0"
            options={useSelectParentMenu}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuRptState((prev) => ({
                ...prev,
                inputRptParent: value,
              }));
            }}
          />
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>
            参照報告書
          </span>
          <Select
            className="disabled_bg_color"
            name="side-input-report-ref"
            labelWidth="120px"
            value={useInputMenuRptState.inputRptRef}
            width="70%"
            margin="0"
            disabled={useInputMenuRptState.inputRptMonth || (useInputMenuRptState.inputRptMode == "編集" && useInputMenuRptState.inputRptMonthFlg)}
            options={useSelectRefMenu}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuRptState((prev) => ({ ...prev, inputRptRef: value }));
            }}
          />
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>所属課</span>
          <Select
            className="disabled_bg_color"
            name="side-input-report-affilation"
            labelWidth="120px"
            value={useInputMenuRptState.inputRptAffiliation}
            width="70%"
            margin="0"
            options={useSelectionAffiliation}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuRptState((prev) => ({
                ...prev,
                inputRptAffiliation: value,
              }));
            }}
          />
        </div>

        {/* 月報フラグは新規登録のみ表示されている */}
        {(useInputMenuRptState.inputRptMode !== "編集") && (
          <div className={`container_row ${inputMenuManageModal.form_container}`}>
            <span className={`${inputMenuManageModal.form_label}`}>
              月報フラグ
            </span>
            {/* <Select
            className="disabled_bg_color"
            name="side-input-menu-affilation"
            labelWidth="120px"
            value={useInputMenuRptState.inputRptMonth}
            width="100px"
            margin="0"
            options={Const.FLG_OPTIONS}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {

            }}
          /> */}
            <Icon.InputCheckbox
              name={`ref_only_count`}
              checked={useInputMenuRptState.inputRptMonth}
              onChange={(e) => {
                const { checked } = e.target;
                let value = false;
                if (checked) {
                  value = true;
                  setInputMenuRptState((prev) => ({ ...prev, inputRptRef: "" })); // 参照報告書クリア
                }

                setInputMenuRptState((prev) => ({
                  ...prev,
                  inputRptMonth: value,
                }));
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

// フッター
const FooterArea = (): JSX.Element => {
  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

  // 処理結果メッセージ
  const [useResultModalMessage, setResultModalMessage] = useAtom(
    AtomCommon.modalMessageState
  );
  const [useMessageMutiLine, setMessageMutiLine] = useAtom(AtomCommon.messageMutiLineState);      // 複数メッセージ用

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // 管理データ
  const [useInputMenuRptState, setInputMenuRptState] = useAtom(
    AtomInputRptManage.inputMenuState
  );

  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );
  const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

  // メニュー管理子画面_表示フラグ
  const [useInputMenuManageModalFlg, setInputMenuManageModalFlg] = useAtom(
    AtomInputRptManage.inputMenuManageModalFlgState
  );

  // 処理実施日時
  const [useDisplayTime, setDisplayTime] = useAtom(
    AtomInputRptManage.inputRptDisplayTime
  );

  // クエリクライアント
  const queryClient = useQueryClient();

  // 検証完了の登録データ
  const [useValidatedData, setValidatedData] = React.useState<any>([]);

  // メッセージ表示する時、GridTableの高さを調整
  useQuery({
    queryKey: ["adjustGridTableWithMessage", useResultModalMessage],
    queryFn: async () => {
      const extendHeight: string = String(
        40 * Number(useResultModalMessage.length)
      );
      const inputArea: any = document.getElementById(
        "input_menu_modal_panel_content"
      );
      inputArea.style.height = "calc(55vh + " + extendHeight + "px)";
      // inputArea.style.height = "calc(45vh + " + extendHeight + "px)";

      return true;
    },
  });

  // データ登録
  const saveMenuReportMutation = useMutation({
    mutationFn: async () => {
      // エラーメッセージ初期化
      setResultMessage([]);
      setResultModalMessage([]);
      setMessageMutiLine([]);

      // リクエスト
      const request = {
        report_menu_no: useInputMenuRptState.inputRptNo,
        report_title: useInputMenuRptState.inputRptName,
        input_parent_menu_no: useInputMenuRptState.inputRptParent,
        input_ref_menu: useInputMenuRptState.inputRptRef,
        affiliation_section_no: useInputMenuRptState.inputRptAffiliation,
        report_month: useInputMenuRptState.inputRptMonth,
        display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        process_name:
          useInputMenuRptState.inputRptNo &&
            useInputMenuRptState.inputRptNo !== ""
            ? "rpt_edit"
            : "rpt_add",
        report_month_flg: useInputMenuRptState.inputRptMonthFlg
      };

      // 選択している日付に基づき、検査情報を取得
      const response = await Api.post(
        "/MNG060/saveInputMenuRpt",
        setResultModalMessage,
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
      const msgCode =
        useInputMenuRptState.inputRptNo &&
          useInputMenuRptState.inputRptNo !== ""
          ? "WQ-0003I"
          : "WQ-0002I";
      msgInfo.push(getMessage([msgCode]));
      setResultMessage(msgInfo);
      setMessageMutiLine(msgInfo);

      // データクリア
      setInputMenuRptState(AtomInputRptManage.defaultInputRptState);

      // 子画面を閉じる
      setInputMenuManageModalFlg(false);
    },
    // エラー発生
    onError: (error) => {
      // エラーメッセージ
      // const errorInfo: AtomCommon.message[] = [];
      // errorInfo.push(getMessage(["WQ-0003E"]));
      // setResultModalMessage(errorInfo);
    },
  });

  return (
    <div
      className={`${outlierListModal.outlier_list_modal_footer}`}
      id="modalFooter"
    >
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
                saveMenuReportMutation.mutate();
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
            setInputMenuRptState(AtomInputRptManage.defaultInputRptState);

            // 子画面を閉じる
            setInputMenuManageModalFlg(!useInputMenuManageModalFlg);
          }}
        />
      </div>
    </div>
  );
};

export const InputRptManageModal = (): JSX.Element => {
  return (
    <div className="modal">
      <div className="modal_content">
        <HeaderArea />
        <div
          id="input_report_modal_panel_content"
          className={`contents_panel ${inputMenuManageModal.input_report_modal_panel_content}`}
        >
          <ModalMessageArea />

          {/* メニューラベル管理 */}
          <MenuReportManageArea />
        </div>
        <FooterArea />
      </div>
    </div>
  );
};

export default InputRptManageModal;
