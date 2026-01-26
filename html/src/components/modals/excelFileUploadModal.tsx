// 動画マニュアルサブ画面（モーダル）
import React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  BrowserRouter,
  Route,
  useLocation,
  Routes,
  Navigate,
} from "react-router-dom";

import * as Const from "../../common/const";
import { Api, getMessage } from "../../common/api";

import { InputText, Select } from "../common";

// サイドメニュスタイル
import cssExcelUpload from "../../scss/modals/excelFileUploadModal.module.scss";
import { Label } from "recharts";

import {
  Button,
  ModalMessageArea,
  CustomLineChart,
} from "../../components/common";

// ストア
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomUpload from "../../stores/atomExcelFileUpload";

// サイドメニュー_カレンダー
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";
//
import moment from "moment";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { url } from "inspector";

// ヘッダー
const HeaderArea = (): JSX.Element => {
  return (
    <div className={`${cssExcelUpload.modal_header}`}>
      <span>Excelファイル取込</span>
    </div>
  );
};

// メニュー構成編集
const FileSetArea = (): JSX.Element => {
  const [uploadData, setUploadData] = useAtom(AtomUpload.fileUploadState);

  return (
    <>
      <div
        className={` ${cssExcelUpload.panel_modal_content} contents_panel`}
        style={{ margin: 0 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "60px",
          }}
        >
          <div
            className={`${cssExcelUpload.label}`}
            style={{ width: "120px", margin: "0 10px 0 0" }}
          >
            取込ファイル
          </div>
          <input
            type="file"
            multiple
            id="fileUpload"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const getFile: any = e.target.files[0];
              setUploadData({
                ...uploadData,
                import_file: getFile,
              });
            }}
            accept=".xlsx"
          />
        </div>
      </div>
    </>
  );
};

// フッター
const FooterArea = (): JSX.Element => {
  const queryClient = useQueryClient();

  const location = useLocation();

  const [useModalMessage, setModalMessage] = useAtom(
    AtomCommon.modalMessageState
  );
  // 選択したメニューデータアトム
  const [useSideMenuSelected, setSideMenuSelected] =
    location.pathname === "/WQM010"
      ? useAtom(AtomSideMenu.sideMenuSelectedState)
      : useAtom(AtomSideMasterMenu.sideMenuSelectedState);
  // 現在の開いてるカレンダ―の月
  const [useCurrrentMonth, setCurrrentMonth] = useAtom(
    AtomSideMenuCalendar.sidemenuCurrentMonth
  );
  // カレンダー_日付
  const [useSidemenuSelectedDate, setSidemenuSelectedDate] = useAtom(
    AtomSideMenuCalendar.sidemenuSelectedDate
  );
  const [uploadData, setUploadData] = useAtom(AtomUpload.fileUploadState);
  // 入力データがある日付
  const [useDataExistDateLists, setDataExistDateLists] = useAtom(
    AtomSideMenuCalendar.sidemenuDataExistDateLists
  );

  // テンプレートファイル出力
  const exportImportTemplate = async (): Promise<any> => {
    // console.log(location);
    setModalMessage([]);
    // リクエスト
    const request =
      location.pathname === "/WQM010"
        ? {
            selected_menu_no: useSideMenuSelected.selectedMenuNo,
            selected_date:
              useSidemenuSelectedDate ?? moment().format("YYYY-MM-DD"),
            current_month: useCurrrentMonth ?? moment().format("YYYY-MM"),
          }
        : {
            report_no: useSideMenuSelected.report_no,
          };
    Api.postBuffer(
      location.pathname + "/exportImportTemplate",
      setModalMessage,
      request
    )
      .then((result: ArrayBuffer) => {
        const blob = new Blob([result], {
          // type: "application/octet-binary",
          type: "Content-Type:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");

        // const fileName = "テンプレート.xlsx";
        let fileName = "";
        if (location.pathname == "/MNG060") {
          fileName = "tmp_" + useSideMenuSelected.report_no + ".xlsx";
        } else {
          fileName =
            "テンプレート_" + useSideMenuSelected.selectedMenuName + ".xlsx";
        }
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setModalMessage(errorInfo);
        }
      });
  };

  // ファイル取込
  const fileImport = async (): Promise<any> => {
    setModalMessage([]);
    const header = {
      contentType: "multipart/form-data",
    };
    // リクエスト
    let formData = new FormData();
    formData.append("import_file", uploadData.import_file);
    formData.append("selected_menu_no", useSideMenuSelected.selectedMenuNo);
    formData.append("report_no", useSideMenuSelected.report_no);

    Api.post(
      location.pathname + "/fileImport",
      setModalMessage,
      formData,
      header
    )
      .then((response) => {
        // window.alert("取込確認");
        // 再取得クエリキー
        queryClient.invalidateQueries({ queryKey: ["fetchInputData"] });

        // 登録した後で、カレンダー背景色を調整
        if (
          response &&
          response.resultDateList &&
          response.resultDateList.length !== 0
        ) {
          response.resultDateList.forEach((element) => {
            useDataExistDateLists.push({
              date: moment(element).format("YYYY-MM-DD"),
            });
          });
          setDataExistDateLists(useDataExistDateLists);
        }

        // 処理正常終了のメッセージ
        const msgInfo: AtomCommon.message[] = [];
        msgInfo.push(getMessage(["WQ-0002I"]));
        setModalMessage(msgInfo);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setModalMessage(errorInfo);
        }
      })
      .finally(() => {
        let fileElem = document.getElementById(
          "fileUpload"
        ) as HTMLInputElement;
        fileElem.value = null;
      });
  };

  return (
    <div className={`${cssExcelUpload.modal_footer}`} id="modalFooter">
      <Button
        title="テンプレートダウンロード"
        width="300px"
        margin="0px 0px 0px 15px"
        className={`footer_btn_right ${cssExcelUpload.save_button}`}
        onClick={() => {
          // window.alert("未実装");
          exportImportTemplate();
        }}
      />
      <div className={`${cssExcelUpload.modal_footer_button}`}>
        {/*  */}
        <Button
          title="取込"
          // width="220px"
          margin="0px 0px 0px 15px"
          className={`footer_btn_right ${cssExcelUpload.save_button}`}
          onClick={() => {
            fileImport();
          }}
        />
        {/* キャンセルボタン */}
        <Button
          title="閉じる"
          // width="220px"
          margin="0px 0px 0px 15px"
          className={`footer_btn_right ${cssExcelUpload.close_button}`}
          onClick={() => {
            setModalMessage([]);
            setUploadData(AtomUpload.defaultUploadData);
            (document.getElementById("fileUpload") as HTMLInputElement).value =
              null;
            document.getElementById("excel_upload_modal_panel").style.display =
              "none";
          }}
        />
      </div>
    </div>
  );
};

export const ExcelFileUploadModal = (): JSX.Element => {
  return (
    <div
      id="excel_upload_modal_panel"
      className={`${cssExcelUpload.contents_panel}`}
    >
      <div className={`${cssExcelUpload.contents}`}>
        <HeaderArea />
        <div
          style={{ maxHeight: "200px", padding: "10px", overflowY: "scroll" }}
        >
          <ModalMessageArea />
        </div>
        <FileSetArea />
        <FooterArea />
      </div>
    </div>
  );
};

export default ExcelFileUploadModal;
