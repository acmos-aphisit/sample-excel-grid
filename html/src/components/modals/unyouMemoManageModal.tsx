// メニューラベル管理画面（モーダル）
import React from "react";
import { Api, getMessage } from "../../common/api";
import { Button } from "../common";
import * as Const from "../../common/const";
import * as Common from '../../common/common';
import DatePicker from 'react-date-picker';

import { InputText, Select, ModalMessageArea } from "../common";

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";
import * as AtomUnyouMemoManage from "../../stores/atomUnyouMemoManage";

import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Spt030StateContainer } from '../../components/containers/spt030StateContainer';
import { UnyouManageStateContainer } from '../../components/containers/unyouManageStateContainer';
import { SideEditMenuModalStateContainer } from '../../components/containers/sideEditMenuModalStateContainer';
import { ConfirmDialogStateContainer } from '../../components/containers/confirmDialogStateContainer';


// サイドメニュスタイル
import outlierListModal from "../../scss/modals/outlierListModal.module.scss";
import inputMenuManageModal from "../../scss/modals/inputMenuManageModal.module.scss";
import "react-date-picker/dist/DatePicker.css";     // ライブラリー_CSS_react-date-picker
import "react-calendar/dist/Calendar.css";          // ライブラリー_CSS_react-date-picker_カレンダー
import "../../scss/reactDatePicker.scss";

// サイドメニューアトム
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 日時管理ライブラリー
import moment from "moment";

// ヘッダー
const HeaderArea = (): JSX.Element => {
  return (
    <div className={`${outlierListModal.outlier_list_modal_header}`}>
      <span>運用メモ登録・更新</span>
    </div>
  );
};

// 運用メモ管理
const UnyouMemoManageArea = ({unyouManageState, sideMenuEditModalState}): JSX.Element => {

  React.useEffect(() => {
    if (sideMenuEditModalState.useSideEditMenuSelected) {
      sideMenuEditModalState.setMenuEdit((prev) => ({
        ...prev,
        text: sideMenuEditModalState.useSideEditMenuSelected.textEdit,
        parentId: sideMenuEditModalState.useSideEditMenuSelected.parentIdEdit,
      }));
    }
  }, []);

  // ※画面上クリアのみ、削除データの反映は登録処理で実施する
  const clearUploadFile = () => {
    unyouManageState.setUnyouMemoManage({
      ...unyouManageState.useUnyouMemoManage,
      unyouFile: null,
      unyouFileName: "",
      unyouFileSize: "",
      unyouFileExt: "",
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
          <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>タイトル</span>
          <div style={{ width: "80%" }}>
            <InputText
              id="side-input-menu-name"
              name="side-input-menu-name"
              width="40%"
              margin="0"
              max={256}
              contentsFlg={true}
              value={unyouManageState.useUnyouMemoManage.unyouTitle}
              onChange={({
                target: { value },
              }: React.ChangeEvent<HTMLInputElement>) => {
                unyouManageState.setUnyouMemoManage((prev) => ({
                  ...prev,
                  unyouTitle: value,
                }));
              }}
            />
          </div>
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 42 }}>
          <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>作成日</span>
          <div style={{ width: "80%" }}>
            {/* <InputDate
              id='input-unyou-date-end'
              name='input-unyou-date-end'
              width="120px"
              height="35px"
              margin="0 30px 0 0"
              autoComplete={"off"}
              value={useUnyouMemoManage.unyouDate}
              setterInfo={{
                setterName: setUnyouMemoManage,
                outputState: { ...useUnyouMemoManage },
                seirekiName: "",
                selectedName: "unyouDate",
                index: null,
              }}
            /> */}
            <DatePicker
              id="date_from"
              value={unyouManageState.useUnyouMemoManage.unyouDate}
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
                unyouManageState.setUnyouMemoManage({ ...unyouManageState.useUnyouMemoManage, unyouDate: setDate });
              }}
            />
          </div>
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>メモ</span>
          <div style={{ width: "calc(100% - 120px)" }}>
            <textarea
              id={`modal_column_`}
              placeholder=""
              rows={3}
              maxLength={5000}
              value={unyouManageState.useUnyouMemoManage.unyouMemo ?? ''}
              onChange={({
                target: { value },
              }: React.ChangeEvent<HTMLTextAreaElement>) => {
                unyouManageState.setUnyouMemoManage({ ...unyouManageState.useUnyouMemoManage, 'unyouMemo': value });
              }}
            />
          </div>
        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`}>
          <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>備考</span>
          <div style={{ width: "calc(100% - 120px)" }}>
            <textarea
              id={`modal_column_`}
              placeholder=""
              rows={3}
              maxLength={5000}
              value={unyouManageState.useUnyouMemoManage.unyouBikou ?? ''}
              onChange={({
                target: { value },
              }: React.ChangeEvent<HTMLTextAreaElement>) => {
                unyouManageState.setUnyouMemoManage({ ...unyouManageState.useUnyouMemoManage, 'unyouBikou': value });
              }}
            />
          </div>

        </div>
        <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 50 }}>
          <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}>添付ファイル</span>
          <div style={{ width: "calc(100% - 120px)" }}>

            {(unyouManageState.useUnyouMemoManage.dataMode !== "参照") ? (
              <>
                {/* ファイル */}
                <input
                  type="file"
                  multiple
                  id="fileUpload"
                  style={{ width: "calc(100% - 130px)" }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const getFile: any = e.target.files[0];
                    console.log("getFile +++ ", getFile);

                    unyouManageState.setUnyouMemoManage({
                      ...unyouManageState.useUnyouMemoManage,
                      unyouFile: getFile,
                      unyouFileName: getFile.name,
                      unyouFileSize: getFile.size,
                      unyouFileExt: Common.getFileExtension(getFile.name),
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
              </>
            ) : (
              <>
                {(unyouManageState.useUnyouMemoManage.unyouFilePath && !unyouManageState.useUnyouMemoManage.infoClearFileFlg && !unyouManageState.useUnyouMemoManage.unyouFile) && (
                  <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 30 }}>
                    <div style={{ width: "100%" }}>
                      <a target="_blank" href={unyouManageState.useUnyouMemoManage.unyouFilePath}>{unyouManageState.useUnyouMemoManage.currentShowFileName ?? ""}</a>
                    </div>
                  </div>
                )}
              </>
            )
            }
          </div>
        </div>

        {(unyouManageState.useUnyouMemoManage.dataMode !== "参照") ? (
          <>
            {(unyouManageState.useUnyouMemoManage.unyouFilePath && !unyouManageState.useUnyouMemoManage.infoClearFileFlg && !unyouManageState.useUnyouMemoManage.unyouFile) && (
              <div className={`container_row ${inputMenuManageModal.form_container}`} style={{ justifyContent: "left", height: 30 }}>
                <span className={`${inputMenuManageModal.form_label}`} style={{ width: 120 }}></span>
                <div style={{ width: "80%" }}>
                  <a target="_blank" href={unyouManageState.useUnyouMemoManage.unyouFilePath}>{unyouManageState.useUnyouMemoManage.currentShowFileName ?? ""}</a>
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
                  value={unyouManageState.useUnyouMemoManage.unyouDspFlg}
                  width="20%"
                  margin="0"
                  options={Const.FLG_OPTIONS}
                  onChange={({
                    target: { value },
                  }: React.ChangeEvent<HTMLInputElement>) => {
                    unyouManageState.setUnyouMemoManage((prev) => ({
                      ...prev,
                      unyouDspFlg: value,
                    }));
                  }}
                />
              </div>
            </div>
          </>

        ) : (<></>)
        }

      </div>
    </>
  );
};

// フッター
const FooterArea = ({commonState, unyouManageState, confirmDialog}): JSX.Element => {
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
      inputArea.style.height = "calc(75vh + " + extendHeight + "px)";

      return true;
    },
  });

  // 登録するデータ検証
  const validateSaveUnyouData = async () => {
    // データ検証
    setValidatedData([]);
    commonState.setResultModalMessage([]);

    if (unyouManageState.useUnyouMemoManage) {
      let errorCnt: number = 0;

      /**
       * ########## タイトル ##########
       */
      // タイトルが未入力の場合エラー
      if (!Common.checkNullOfString(unyouManageState.useUnyouMemoManage.unyouTitle)) {
        // タイトルが255桁以上の場合エラー
        if (Common.checkLengthOverOfString(unyouManageState.useUnyouMemoManage.unyouTitle, 255)) {
          // エラー数える
          errorCnt += 1;

          // 必須項目のエラーメッセージを表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0011W", "タイトル", "255"]));
          commonState.setResultModalMessage(errorInfo);

          return;
        }
      }

      /**
       * ########## 作成日 ##########
       */
      // 作成日が未入力の場合、エラー
      if (Common.checkNullOfString(unyouManageState.useUnyouMemoManage.unyouDate)) {
        // エラー数える
        errorCnt += 1;

        // 必須項目のエラーメッセージを表示
        const errorInfo: AtomCommon.message[] = [];
        errorInfo.push(getMessage(["WQ-0006W", "作成日"]));
        commonState.setResultModalMessage(errorInfo);

        return;
      }

      /**
       * ########## メモ ##########
       */
      // メモが入力の場合
      if (!Common.checkNullOfString(unyouManageState.useUnyouMemoManage.unyouMemo)) {
        // メモが5000桁以上の場合エラー
        if (Common.checkLengthOverOfString(unyouManageState.useUnyouMemoManage.unyouMemo, 5000)) {
          // エラー数える
          errorCnt += 1;

          // 必須項目のエラーメッセージを表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0011W", "メモ", "5000"]));
          commonState.setResultModalMessage(errorInfo);

          return;
        }
      }

      /**
       * ########## 備考 ##########
       */
      // 備考が入力の場合
      if (!Common.checkNullOfString(unyouManageState.useUnyouMemoManage.unyouBikou)) {
        // 備考が5000桁以上の場合エラー
        if (Common.checkLengthOverOfString(unyouManageState.useUnyouMemoManage.unyouBikou, 5000)) {
          // エラー数える
          errorCnt += 1;

          // 必須項目のエラーメッセージを表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0011W", "備考", "5000"]));
          commonState.setResultModalMessage(errorInfo);

          return;
        }
      }

      /**
       * ########## 添付ファイル ##########
       */
      // 添付ファイルがある場合
      if (unyouManageState.useUnyouMemoManage.unyouFile) {
        // 添付ファイルが255桁以上の場合エラー
        if (Common.checkLengthOverOfString(String(unyouManageState.useUnyouMemoManage.unyouFileName), 255)) {
          // エラー数える
          errorCnt += 1;

          // 必須項目のエラーメッセージを表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0011W", "添付ファイル", "255"]));
          commonState.setResultModalMessage(errorInfo);

          return;
        }

        // 添付ファイルのサイズが100MB以上だった場合、エラー
        if (Number(unyouManageState.useUnyouMemoManage.unyouFileSize) > Const.ALLOWED_UNYOU_FILE_SIZE) {
          // エラー数える
          errorCnt += 1;

          // 必須項目のエラーメッセージを表示
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0015W", "添付ファイル", "100MB"]));
          commonState.setResultModalMessage(errorInfo);

          return;
        }

        // 添付ファイルの拡張子が指定しているもの以外だった場合、エラー
        if (!Common.checkFileExtension(unyouManageState.useUnyouMemoManage.unyouFileName, Const.ALLOWED_UNYOU_FILE_EXT)) {
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
      if (Common.checkNullOfString(unyouManageState.useUnyouMemoManage.unyouDspFlg)) {
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
        setTimeout(() => {
          // 確認ダイアログ
          confirmDialog.setDialog((prev) => ({
            ...prev,
            isOpen: true,
            cancelBtnName: "いいえ",
            message: getMessage(["WQ-0005Q", "お知らせに掲載"]).message,
            onConfirm: () => {
              unyouManageState.setUnyouMemoManage({ ...unyouManageState.useUnyouMemoManage, infoRegistFlg: true });
              saveUnyouWithFileUploadMutation.mutate();
            },
            onCancel: () => {
              saveUnyouWithFileUploadMutation.mutate();
            },
          }));
        }, 100);

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
  const saveUnyouWithFileUploadMutation = useMutation({
    mutationFn: async () => {
      // エラーメッセージ初期化
      commonState.setResultMessage([]);
      commonState.setResultModalMessage([]);

      // フォームデータを設定
      const formData = new FormData(document.forms[0]);

      // 添付ファイルを設定
      formData.append('upload_file', unyouManageState.useUnyouMemoManage.unyouFile);
      formData.append('upload_file_name', unyouManageState.useUnyouMemoManage.unyouFileName);

      // バリデーション用
      formData.append('unyou_date', unyouManageState.useUnyouMemoManage.unyouDate);
      formData.append('unyou_title', unyouManageState.useUnyouMemoManage.unyouTitle);
      formData.append('unyou_memo', unyouManageState.useUnyouMemoManage.unyouMemo);
      formData.append('unyou_bikou', unyouManageState.useUnyouMemoManage.unyouBikou);
      formData.append('dsp_flg', unyouManageState.useUnyouMemoManage.unyouDspFlg);

      // ファイル種類を設定
      const data_info = {
        data_mode: unyouManageState.useUnyouMemoManage.dataMode,
        unyou_id: unyouManageState.useUnyouMemoManage.unyouID,
        unyou_title: unyouManageState.useUnyouMemoManage.unyouTitle,
        unyou_date: unyouManageState.useUnyouMemoManage.unyouDate,
        unyou_memo: unyouManageState.useUnyouMemoManage.unyouMemo,
        unyou_bikou: unyouManageState.useUnyouMemoManage.unyouBikou,
        file_path: unyouManageState.useUnyouMemoManage.unyouFileName,
        dsp_flg: unyouManageState.useUnyouMemoManage.unyouDspFlg,
        info_regist_flg: unyouManageState.useUnyouMemoManage.infoRegistFlg,
        info_clear_file_flg: unyouManageState.useUnyouMemoManage.infoClearFileFlg,
        display_time: unyouManageState.useDisplayTime || moment(new Date()).format("YYYY-MM-DD HH:mm:ss.SSS"),
      };

      // フォームデータを生成
      formData.append('data', JSON.stringify(data_info));

      // 運用メモを登録
      const response = await Api.post('/SPT030/saveUnyouMemoData', commonState.setResultMessage, formData, {
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
      queryClient.invalidateQueries({ queryKey: ["searchUnyouMemoData"] });

      // 処理正常終了のメッセージ
      const msgInfo: AtomCommon.message[] = [];
      const setMsgInfo: any = (unyouManageState.useUnyouMemoManage.dataMode == "登録") ? getMessage(["WQ-0002I"]) : (unyouManageState.useUnyouMemoManage.dataMode == "編集") ? getMessage(["WQ-0003I"]) : getMessage(["WQ-0004I"]);
      msgInfo.push(setMsgInfo);
      commonState.setResultMessage(msgInfo);

      // 子画面を閉じる
      unyouManageState.setUnyouMemoManage(AtomUnyouMemoManage.defaultUnyouMemoManageState);
      unyouManageState.setUnyouMemoManageModalFlg(false);
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
        {(unyouManageState.useUnyouMemoManage.dataMode === "編集") ? (
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
                  unyouManageState.setUnyouMemoManage({
                    ...unyouManageState.useUnyouMemoManage,
                    dataMode: "削除",
                    unyouFile: null,
                    unyouFileName: "",
                    unyouFileSize: "",
                    unyouFileExt: "",
                  });

                  saveUnyouWithFileUploadMutation.mutate();
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
        {(unyouManageState.useUnyouMemoManage.dataMode !== "参照") ? (
          < Button
            title={(unyouManageState.useUnyouMemoManage.dataMode == "登録") ? "登録" : "更新"}
            width="100px"
            margin="0px 0px 0px 15px"
            className="footer_btn_right button_hover_green"
            onClick={() => {
              // 確認ダイアログ
              confirmDialog.setDialog((prev) => ({
                ...prev,
                isOpen: true,
                cancelBtnName: "いいえ",
                message: (unyouManageState.useUnyouMemoManage.dataMode === "登録") ? getMessage(["WQ-0001Q"]).message : getMessage(["WQ-0002Q"]).message,
                onConfirm: () => {
                  const isValid = validateSaveUnyouData();
                },
                onCancel: () => {
                  // 処理なし
                },
              }));
            }}
          />
        ) : (<></>)
        }

        {/* 閉じるボタン */}
        <Button
          title="閉じる"
          width="100px"
          margin="0px 0px 0px 15px"
          className="footer_cencel_btn footer_btn_left button_active_white"
          onClick={() => {
            // データクリア
            unyouManageState.setUnyouMemoManage(AtomUnyouMemoManage.defaultUnyouMemoManageState);

            // 子画面を閉じる
            unyouManageState.setUnyouMemoManageModalFlg(!unyouManageState.useUnyouMemoManageModalFlg);
          }}
        />
      </div>
    </div>
  );
};

export const UnyouMemoManageModal = (): JSX.Element => {
  /**
   * ステートコンテナーからステートを呼び出す
   * 
   */
  const commonState = CommonStateContainer();                                 // 汎用
  const spt030State = Spt030StateContainer();                                 // 運用メモ管理
  const unyouManageState = UnyouManageStateContainer()                        // 運用メモ管理子画面
  const sideMenuEditModalState = SideEditMenuModalStateContainer()            // 編集用のメニュー
  const confirmDialog = ConfirmDialogStateContainer();                        // 確認ダイアログ

  // 引数に各ステート管理を組み合わせる
  const comblineProps = {
    // 汎用
    commonState: commonState,
    // 運用メモ管理
    spt030State: spt030State,
    unyouManageState: unyouManageState,
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
        >
          <ModalMessageArea />

          {/* 運用メモ管理 */}
          <UnyouMemoManageArea {...comblineProps} />
        </div>
        <FooterArea {...comblineProps} />
      </div>
    </div>
  );
};

export default UnyouMemoManageModal;
