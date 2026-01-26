import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Api, getMessage } from "../../common/api";
import * as Const from "../../common/const.tsx";
import { useAtom, useSetAtom } from "jotai";
import {
  InputText,
  ListCollapse,
  SideListMaster,
  ConfirmDialog,
} from "../common/";
import {
  EditMenuModal,
  MenuLabelManageModal,
  InputMenuManageModal,
  InputRptManageModal,
} from "../modals/index.ts";

// サイドメニュスタイル
import cssSideMenu from "../../scss/layouts/sidemenu.module.scss";
import cssSideMenuMaster from "../../scss/layouts/sidemenuMaster.module.scss";

// サイドメニューアトム
import * as AtomCommon from "../../stores/atom.tsx";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";
import * as AtomMenuLabelManage from "../../stores/atomMenuLabelManage";
import * as AtomInputMenuManage from "../../stores/atomInputDspManage.tsx";
import * as AtomInputRptManage from "../../stores/atomInputRptManage.tsx";
import * as AtomMng060 from "../../stores/atomMNG060";

// グリッドテーブルスタイル
import cssGridTable from "../../scss/common/gridTable.module.scss";

// useQuery
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 日付管理
import moment from "moment";

/**
 * サイドメニュー閉じる
 *
 */
const SideMenuToggleArea = (): JSX.Element => {
  // ナビゲーション
  const navigate = useNavigate();
  const url = useLocation();

  // 開閉フラグ
  const [openMenuFlg, setOpenMenuFlg] = React.useState<boolean>(true);

  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

  // メニューデータ
  const [useDataSideMenuLink, setDataSideMenuLink] = useAtom(
    AtomSideMasterMenu.sideMenuLinkListState
  );

  const [barWidth, setBarWidth] = useAtom(
    AtomSideMasterMenu.sideMenuWidthState
  );

  /**
   * 開閉ボタンの処理
   *
   */
  const toggleOpenMenu = async () => {
    if (openMenuFlg) {
      // サイドバーのサイズが伸びる
      setBarWidth(400);
      // if (document.getElementById("main-content-table")) {
      //   document.getElementById("main-content-table")!.style.width =
      //     "calc(100% - 415px)";
      // }
      if (document.getElementById("main-content-table")) {
        document.getElementById("main-content-table")!.style.width =
          "calc(100% - 0px)";
      }

      // 絞り込み検索・リストメニュー・カレンダー_表示
      if (document.getElementById("main-sidebar-top")) {
        document.getElementById("side-search-menu")!.style.visibility =
          "visible";
        document.getElementById("main-sidebar-top")!.style.visibility =
          "visible";
      }
      document.getElementById("main-sidebar-middle")!.style.visibility =
        "visible";
      if (document.getElementById("main-sidebar-bottom")) {
        document.getElementById("main-sidebar-bottom")!.style.visibility =
          "visible";
      }
    } else {
      // サイドバーのサイズが縮む
      setBarWidth(50);
      // if (document.getElementById("main-content-table")) {
      //   document.getElementById("main-content-table")!.style.width =
      //     "calc(100% - 65px)";
      // }
      if (document.getElementById("main-content-table")) {
        document.getElementById("main-content-table")!.style.width =
          "calc(100% - 65px)";
      }

      // 絞り込み検索・リストメニュー・カレンダー_非表示
      if (document.getElementById("main-sidebar-top")) {
        document.getElementById("side-search-menu")!.style.visibility =
          "hidden";
        document.getElementById("main-sidebar-top")!.style.visibility =
          "hidden";
      }
      document.getElementById("main-sidebar-middle")!.style.visibility =
        "hidden";
      if (document.getElementById("main-sidebar-bottom")) {
        document.getElementById("main-sidebar-bottom")!.style.visibility =
          "hidden";
      }
    }
    setBarWidth(openMenuFlg ? 400 : 50);
  };

  useQuery({
    queryKey: ["openMenuFlg", openMenuFlg],
    queryFn: () => {
      toggleOpenMenu();
      return true;
    },
  });

  return (
    <div
      id="main-sidebar-toggle"
      className={`container_row ${cssSideMenu.sidemenu_top}`}
      onClick={() => {
        setOpenMenuFlg(!openMenuFlg);
      }}
    >
      <div
        id="sidemenu-toggle-text"
        className={
          openMenuFlg
            ? `${cssSideMenu.sidemenu_top_text_open}`
            : `${cssSideMenu.sidemenu_top_text_close}`
        }
      >
        サイドメニューを閉じる
      </div>
      <div
        id="sidemenu-toggle-icon"
        title={openMenuFlg ? `サイドメニューを閉じる` : `サイドメニューを開く`}
        className={
          openMenuFlg
            ? `${cssSideMenu.sidemenu_open}`
            : `${cssSideMenu.sidemenu_close}`
        }
      ></div>
    </div>
  );
};

// サイドメニュ_中部
const SideMenuArea = (): JSX.Element => {
  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
  // ##### Jotai ステート #####
  // サイドリストメニュー
  const [useDataSideMenu, setDataSideMenu] = useAtom(
    AtomSideMasterMenu.sideMenuListState
  );
  const [useDataSideMenuMaster, setDataSideMenuMaster] = useAtom(
    AtomSideMasterMenu.sideMenuMasterListState
  );

  // 選択したメニューデータ
  const [useDataSideMenuSelected, setSideMenuSelected] = useAtom(
    AtomSideMasterMenu.sideMenuSelectedState
  );

  // 編集用のメニュー_ステート
  const [useDataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );

  // メニューデータ
  const [useDataSideMenuLink, setDataSideMenuLink] = useAtom(
    AtomSideMasterMenu.sideMenuLinkListState
  );

  // 所属課データ
  const [useAffiliationList, setAffiliationList] = useAtom(
    AtomSideMasterMenu.sideMenuAffiliationState
  );

  const [rptConfigData, setRptConfigData] = useAtom(
      AtomMng060.mng060RptConfigData
    ); // 報告書設定用
    const [rptItemData, setRptItemData] = useAtom(AtomMng060.mng060RptItemData); // 検査項目用
    const [rptPointData, setRptPointData] = useAtom(
      AtomMng060.mng060RptPointData
    ); // 測定地点用
    const [rptTextData, setRptTextData] = useAtom(AtomMng060.mng060RptTextData); // 固定文言用
    const [rptMonthListData, setRptMonthListData] = useAtom(
      AtomMng060.mng060RptMonthListData
    ); // 月報報告書一覧用

  const url = useLocation();

  /**
   * 初期表示_初期データを設定
   *
   * */
  const getInitMenuList = async () => {
    // 選択しているメニューをクリア
    setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);

    if (url.pathname == "/MNG060") {
      setRptConfigData(AtomMng060.mng060DefaultRptConfigData);
      setRptItemData(AtomMng060.mng060DefaultRptItemData);
      setRptPointData(AtomMng060.mng060DefaultPointData);
      setRptTextData(AtomMng060.mng060DefaultTextData);

      // if (false) {
      // 報告書画面系のメニュー一覧を取得
      const params = {
        affiliation_section_no: localStorage.getItem("affiliationSectionNo"),
        security_level: localStorage.getItem("securityLevel"),
      };

      Api.post("/getReportMenu", setResultMessage, params)
        .then((data: any) => {
          if (data.menuData.length <= 0) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0006E", "報告書メニュー"]));
            setResultMessage(errorInfo);
          } else {
            let newMenuLists: any = [];
            data.menuData.forEach((menu) => {
              const adjMenuText: string = menu.report_title.replace(
                ".xlsx",
                ""
              );
              newMenuLists.push({
                rowId: menu.report_menu_no,
                parentId:
                  menu.report_parent_menu_no !== menu.report_menu_no
                    ? menu.report_parent_menu_no
                    : null,
                isParent: menu.label_flg === 1 ? true : false,
                text: adjMenuText,
                type: "chevron",
                isExpanded: true,
                showFlg: true,
                level: menu.report_hierarchy ? menu.report_hierarchy : 1,
                order: menu.report_order,
                dspNo: null,
                reportNo: menu.report_no,
                affiliationSectionNo: menu.affiliation_section_no,
                inspectionKbnCode: null,
                inspectionKbnName: null,
                reportCategory: menu.report_category,
                reportType: menu.report_type,
              });
            });

            // 設定用のメニュー構成_ステート
            setDataSideMenuMaster(newMenuLists);
            setDataSideMenuLink(newMenuLists);

            // 所属課データ
            setAffiliationList(data.affiliationData);
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
    } else if (url.pathname == "/MNG050") {
      Api.get("/getInputMenu", setResultMessage)
        .then((data: any) => {
          if (data.menuData.length <= 0) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0006E", "入力メニュー"]));
            setResultMessage(errorInfo);
          } else {
            let newMenuLists: any = [];
            data.menuData.forEach((menu) => {
              const adjMenuText: string = menu.input_title.replace(".txt", "");
              newMenuLists.push({
                rowId: menu.input_menu_no,
                parentId:
                  menu.input_parent_menu_no !== menu.input_menu_no
                    ? menu.input_parent_menu_no
                    : null,
                isParent: menu.label_flg === 1 ? true : false,
                text: adjMenuText,
                type: "chevron",
                isExpanded: true,
                showFlg: true,
                level: menu.input_hierarchy ? menu.input_hierarchy : 1,
                order: menu.input_order,
                dspNo: menu.input_dsp_no,
                reportNo: null,
                affiliationSectionNo: menu.affiliation_section_no,
                inspectionKbnCode: menu.inspection_kbn_code,
                inspectionKbnName: menu.inspection_kbn_name,
                reportCategory: null,
                reportType: null,
              });
            });

            // 設定用のメニュー構成_ステート
            setDataSideMenuMaster(newMenuLists);
            setDataSideMenuLink(newMenuLists);

            // 所属課データ
            setAffiliationList(data.affiliationData);
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
    }
  };

  useQuery({
    queryKey: ["getInitMenuLists"],
    queryFn: () => {
      getInitMenuList();
      return true;
    },
    refetchOnWindowFocus: false,
  });

  return (
    // 折り畳みリストメニュー
    <div
      id="main-sidebar-middle"
      className={`container_row ${cssSideMenuMaster.sidemenu_middle}`}
    >
      <SideListMaster />
    </div>
  );
};

const SideMenuMaster = (): JSX.Element => {
  // メッセージ
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

  // メニューラベル管理子画面_表示フラグ
  const [useMenuLabelManageModalFlg, setMenuLabelManageModalFlg] = useAtom(
    AtomMenuLabelManage.menuLabelManageModalFlgState
  );

  // メニュー管理子画面_表示フラグ
  const [useInputMenuManageModalFlg, setInputMenuManageModalFlg] = useAtom(
    AtomInputMenuManage.inputMenuManageModalFlgState
  );

  // メニュー管理子画面_表示フラグ
  const [useInputRptManageModalFlg, setInputRptManageModalFlg] = useAtom(
    AtomInputRptManage.inputMenuManageModalFlgState
  );

  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(
    AtomSideEditMenu.sideEditMenuState
  );

  const [barWidth, setBarWidth] = useAtom(
    AtomSideMasterMenu.sideMenuWidthState
  );
  const [mousePosition, setMousePosition] = React.useState(0);
  const [mouseMove, setMouseMove] = React.useState<boolean>(false);

  const handleMouseDown = (e) => {
    if (!mouseMove) {
      setMouseMove(true);
      setMousePosition(e.clientX);

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleMouseMove = (e) => {
    // window以上の幅にはならないように
    // 左クリック中のみ発動するように
    if (e.clientX < window.outerWidth - 40 && (e.buttons & 1) !== 0) {
      setBarWidth(e.clientX);
    }
  };

  const handleMouseUp = (e) => {
    setMouseMove(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <>
      <div
        style={{
          width: barWidth + 10,
          height: "100vh",
          position: "fixed",
          top: 45,
          left: 0,
        }}
        className="cursor_resize"
        onPointerDown={handleMouseDown}
      ></div>
      <div
        id="top-sidebar"
        className={`${cssSideMenuMaster.top_sidebar}`}
        style={{ width: barWidth }}
      ></div>

      <div
        id="main-sidebar"
        className={`${cssSideMenuMaster.sidemenu}`}
        style={{ width: barWidth }}
      >
        {/* 開閉エリア */}
        <SideMenuToggleArea />

        {/* サイドメニュ_中部 */}
        <SideMenuArea />
      </div>
      {dataSideEditMenuSelected && <EditMenuModal />}
      {useMenuLabelManageModalFlg && <MenuLabelManageModal />}
      {useInputMenuManageModalFlg && <InputMenuManageModal />}
      {useInputRptManageModalFlg && <InputRptManageModal />}
    </>
  );
};

export default SideMenuMaster;
