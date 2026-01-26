// メニューラベル管理画面（モーダル）
import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button } from "../common";
import * as Const from "../../common/const";

import { InputText, Select, ModalMessageArea } from "../common";

import { useAtom, useAtomValue, useSetAtom } from "jotai";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomInputDspManage from "../../stores/atomInputDspManage";

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
  const useMenuLabelState = useAtomValue(AtomInputDspManage.inputMenuState);

  return (
    <div className={`${outlierListModal.outlier_list_modal_header}`}>
      <span>　画面名称・構成編集{useMenuLabelState.inputDspMode}</span>
    </div>
  );
};

// メニューラベル管理
const MenuLabelManageArea = (): JSX.Element => {
  // メッセージ
  const [getResultMessage, setResultModalMessage] = useAtom(
    AtomCommon.modalMessageState
  );

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
  const [useInputMenuDspState, setInputMenuDspState] = useAtom(
    AtomInputDspManage.inputMenuState
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
    AtomInputDspManage.inputDspDisplayTime
  );

  // 初期化
  const menuLabelInit = async () => {
    // エラーメッセージ初期化
    setResultModalMessage([]);

    // 選択肢情報を取得
    Api.get("/getMenuLabelSelection", setResultModalMessage)
      .then((data: any) => {
        console.log("sidemenuMaster_data", data);

        if (data.length <= 0) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
          setResultModalMessage(errorInfo);
        } else {
          // 所属課データ
          setAffiliationList(data.affiliationData);
          setMenuLabelParentList(data.parentMenuData);
          setRefMenuList(data.refMenuData);

          // 親ラベル選択肢を設定
          let newSelectionParentMenu: { label: string; value: string }[] = [
            { label: "", value: "" },
          ];
          data.parentMenuData.forEach((item) => {
            newSelectionParentMenu.push({
              label: item.input_title.replace(".txt", ""),
              value: item.input_menu_no,
            });
          });
          setSelectParentMenu(newSelectionParentMenu);

          // 参照画面選択肢を設定
          let newSelectionRefMenu: { label: string; value: string }[] = [
            { label: "", value: "" },
          ];
          data.refMenuData.forEach((item) => {
            newSelectionRefMenu.push({
              label: item.input_dsp_name.replace(".txt", ""),
              value: item.input_dsp_no,
            });
          });
          setSelectRefMenu(newSelectionRefMenu);

          // 所属課選択肢を設定
          let newSelectionAffiliation: { label: string; value: string }[] = [
            { label: "", value: "" },
          ];
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
          setResultModalMessage(errorInfo);
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
          <span className={`${inputMenuManageModal.form_label}`}>画面名称</span>
          <InputText
            id="side-input-menu-name"
            name="side-input-menu-name"
            width="100%"
            margin="0"
            max={50}
            contentsFlg={true}
            value={useInputMenuDspState.inputDspName}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuDspState((prev) => ({
                ...prev,
                inputDspName: value,
              }));
            }}
          />
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>親ラベル</span>
          <Select
            className="disabled_bg_color"
            name="side-input-menu-parent"
            labelWidth="120px"
            value={useInputMenuDspState.inputDspParent}
            width="70%"
            margin="0"
            options={useSelectParentMenu}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuDspState((prev) => ({
                ...prev,
                inputDspParent: value,
              }));
            }}
          />
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>参照画面</span>
          <Select
            className="disabled_bg_color"
            name="side-input-menu-ref"
            labelWidth="120px"
            value={useInputMenuDspState.inputDspRef}
            width="70%"
            margin="0"
            options={useSelectRefMenu}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuDspState((prev) => ({ ...prev, inputDspRef: value }));
            }}
          />
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`}>所属課</span>
          <Select
            className="disabled_bg_color"
            name="side-input-menu-affilation"
            labelWidth="120px"
            value={useInputMenuDspState.inputDspAffiliation}
            width="70%"
            margin="0"
            options={useSelectionAffiliation}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              setInputMenuDspState((prev) => ({
                ...prev,
                inputDspAffiliation: value,
              }));
            }}
          />
        </div>
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

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // 管理データ
  const [useInputMenuDspState, setInputMenuDspState] = useAtom(
    AtomInputDspManage.inputMenuState
  );

  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );
  const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

  // メニュー管理子画面_表示フラグ
  const [useInputMenuManageModalFlg, setInputMenuManageModalFlg] = useAtom(
    AtomInputDspManage.inputMenuManageModalFlgState
  );

  // 処理実施日時
  const [useDisplayTime, setDisplayTime] = useAtom(
    AtomInputDspManage.inputDspDisplayTime
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
      inputArea.style.height = "calc(45vh + " + extendHeight + "px)";

      return true;
    },
  });

  // データ登録
  const saveMenuLabelMutation = useMutation({
    mutationFn: async () => {
      // エラーメッセージ初期化
      setResultMessage([]);
      setResultModalMessage([]);

      // リクエスト
      const request = {
        input_menu_no: useInputMenuDspState.inputDspNo,
        input_title: useInputMenuDspState.inputDspName,
        input_parent_menu_no: useInputMenuDspState.inputDspParent,
        input_ref_menu: useInputMenuDspState.inputDspRef,
        affiliation_section_no: useInputMenuDspState.inputDspAffiliation,
        display_time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        process_name:
          useInputMenuDspState.inputDspNo &&
            useInputMenuDspState.inputDspNo !== ""
            ? "dsp_edit"
            : "dsp_add",
      };

      // 選択している日付に基づき、検査情報を取得
      const response = await Api.post(
        "/MNG050/saveInputMenuDsp",
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
        useInputMenuDspState.inputDspNo &&
          useInputMenuDspState.inputDspNo !== ""
          ? "WQ-0003I"
          : "WQ-0002I";
      msgInfo.push(getMessage([msgCode]));
      setResultMessage(msgInfo);

      // データクリア
      setInputMenuDspState(AtomInputDspManage.defaultInputDspState);

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
                saveMenuLabelMutation.mutate();
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
            setInputMenuDspState(AtomInputDspManage.defaultInputDspState);

            // 子画面を閉じる
            setInputMenuManageModalFlg(!useInputMenuManageModalFlg);
          }}
        />
      </div>
    </div>
  );
};

export const InputMenuManageModal = (): JSX.Element => {
  return (
    <div className="modal"
      style={{ zIndex: 4 }}
    >
      <div className="modal_content">
        <HeaderArea />
        <div
          id="input_menu_modal_panel_content"
          className={`contents_panel ${inputMenuManageModal.input_menu_modal_panel_content}`}
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

export default InputMenuManageModal;
