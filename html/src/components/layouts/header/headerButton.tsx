import React from "react";
import { Api, getMessage } from "../../../common/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import * as Const from "../../../common/const";
import { ConfirmDialog } from "../../common/index";
import { useQuery } from "@tanstack/react-query";

// ヘッダアトム
import * as AtomHeader from "../../../stores/atomHeader";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../../stores/atomConfirmDialog";
import * as AtomCommon from "../../../stores/atom";

// ヘッダー
const DropDownSupportArea = (showFlg): JSX.Element => {
  const navigate = useNavigate();
  const url = useLocation();

  // ステート
  const [openSupportFlg, setOpenSupportFlg] = useAtom(
    AtomHeader.dropDownSupportFlg
  );
  const [openMainTainFlg, setOpenMainTainFlg] = useAtom(
    AtomHeader.dropDownMainTainFlg
  );

  // 開閉フラグ
  const [toggleShowFlg, setToggleShowFlg] = React.useState<boolean>(false);
  React.useEffect(() => {
    setToggleShowFlg(showFlg.showFlg);
  }, [showFlg]);

  const reDirectTo = (page: string) => {
    setOpenSupportFlg(false);
    setOpenMainTainFlg(false);

    navigate(page);
  };

  // 開閉管理_外部クリック
  const supportRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supportRef.current &&
        !supportRef.current.contains(event.target as Node)
      ) {
        console.log(
          "divRef.current && !divRef.current.contains(event.target as Node)"
        );
        setOpenSupportFlg(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // マニュアルダウンロード処理
  const downloadManual = () => {
    const fileUrl = Const.PDF_MANUAL_USER_PATH;

    // ダウンロードエレメント作成
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = '水質管理データベースシステム操作マニュアル(一般用).pdf';

    // ファイルダウンロードクリック
    a.click();

    setTimeout(() => {
      if (localStorage.getItem("securityLevel") == '1' || localStorage.getItem("affiliationSectionNo") == '01') {
        const fileUrlMange = Const.PDF_MANUAL_PATH;

        // ダウンロードエレメント作成
        const aManage = document.createElement('a');
        aManage.href = fileUrlMange;
        aManage.download = '水質管理データベースシステム操作マニュアル(管理者用).pdf';

        // ファイルダウンロードクリック
        aManage.click();
      }
    }, 100);
  };

  return (
    <div
      ref={supportRef}
      className={`header_dropdown_panel support ${toggleShowFlg ? "show" : ""}`}
    >
      <div className="header_dropdown_content">
        <h3>サポート</h3>
        <div className="header_button_sub_menu_panel">
          <button className="header_button_sub_menu notice_manage"
            onClick={() => {
              reDirectTo("/SPT010");
            }}
          >
            お知らせ管理
          </button>
          <button className="header_button_sub_menu video_manual"
            onClick={() => {
              reDirectTo("/SPT020");
            }}
          >
            動画マニュアル
          </button>
          <button className="header_button_sub_menu manual_download"
            onClick={() => {
              // ファイルをダウンロードする処理　↓
              downloadManual();
            }}
          >
            マニュアルダウンロード
          </button>
          <button className="header_button_sub_menu memo_manage"
            onClick={() => {
              reDirectTo("/SPT030");
            }}
          >
            運用メモ管理
          </button>
        </div>
      </div>
    </div>
  );
};

// ヘッダー
const DropDownMainTainArea = (showFlg): JSX.Element => {
  const navigate = useNavigate();
  const url = useLocation();

  // ステート
  const [openSupportFlg, setOpenSupportFlg] = useAtom(
    AtomHeader.dropDownSupportFlg
  );
  const [openMainTainFlg, setOpenMainTainFlg] = useAtom(
    AtomHeader.dropDownMainTainFlg
  );

  // 開閉フラグ
  const [toggleShowFlg, setToggleShowFlg] = React.useState<boolean>(false);
  React.useEffect(() => {
    setToggleShowFlg(showFlg.showFlg);
  }, [showFlg]);

  const reDirectTo = (page: string) => {
    setOpenSupportFlg(false);
    setOpenMainTainFlg(false);

    navigate(page);
  };

  // 開閉管理_外部クリック
  const maintainRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        maintainRef.current &&
        !maintainRef.current.contains(event.target as Node)
      ) {
        setOpenMainTainFlg(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={maintainRef}
      className={`header_dropdown_panel maintain ${toggleShowFlg ? "show" : ""
        }`}
    >
      <div className="header_dropdown_content">
        <h3>保守</h3>
        <div className="header_button_sub_menu_panel">
          <button className="header_button_sub_menu user_manage"
            onClick={() => {
              reDirectTo("/MNG010");
            }}
          >
            ユーザマスタ
          </button>
          <button className="header_button_sub_menu location"
            onClick={() => {
              reDirectTo("/MNG020");
            }}
          >
            採水地点設定
          </button>
          <button className="header_button_sub_menu items_setting"
            onClick={() => {
              reDirectTo("/MNG030");
            }}
          >
            検査項目設定
          </button>
          <button className="header_button_sub_menu statndart_setting"
            onClick={() => {
              reDirectTo("/MNG040");
            }}
          >
            基準値設定
          </button>
          <button
            className="header_button_sub_menu input_page"
            onClick={() => {
              reDirectTo("/MNG050");
            }}
          >
            入力画面設定
          </button>
          <button
            className="header_button_sub_menu report_page"
            onClick={() => {
              reDirectTo("/MNG060");
            }}
          >
            報告書設定
          </button>
        </div>
      </div>
    </div>
  );
};

// ヘッダ用のボタン_コンポーネント
const HeaderButton = (): JSX.Element => {
  const navigate = useNavigate();
  const url = useLocation();

  // 開閉フラグ
  const [openSupportFlg, setOpenSupportFlg] = useAtom(
    AtomHeader.dropDownSupportFlg
  );
  const [openMainTainFlg, setOpenMainTainFlg] = useAtom(
    AtomHeader.dropDownMainTainFlg
  );

  // 編集状態フラグ
  const [useInputEditingFlg, setInputEditingFlg] = useAtom(
    AtomCommon.inputEditingFlg
  );

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

  // 変更したロケーションを保持
  const [useChangedLocation, setChangedLocation] = React.useState<any>();

  React.useEffect(() => {
    //
    setOpenSupportFlg(false);
    setOpenMainTainFlg(false);
  }, []);

  /**
   * ヘッダの画面表示ボタンをクリックする処理
   *
   * @param menu
   */
  const ChangeSelectedMenu = (menu: string) => {
    // ヘッダークリア
    setOpenSupportFlg(false);
    setOpenMainTainFlg(false);

    // メッセージ
    if (useInputEditingFlg) {
      // 確認ダイアログ
      setDialog((prev) => ({
        ...prev,
        isOpen: true,
        message: getMessage(["WQ-0006Q"]).message,
        onConfirm: () => {
          setInputEditingFlg(false);
          redirectToLocation(menu);
        },
        onCancel: () => {
          // 処理なし
        },
      }));
    } else {
      redirectToLocation(menu);
    }
  };

  const redirectToLocation = async (menu) => {
    // ヘッダークリア
    setOpenSupportFlg(false);
    setOpenMainTainFlg(false);

    switch (menu) {
      // お知らせ画面
      case "notice":
        // お知らせ画面に遷移
        navigate("/CMN020");
        break;
      // 検査情報登録画面
      case "register":
        // 検査情報登録画面に遷移
        navigate("/WQM010");
        break;
      // 検査情報検索画面
      case "search":
        // 検査情報検索画面に遷移
        navigate("/WQM020");
        break;
      // 報告書出力画面
      case "export":
        // 報告書出力画面に遷移
        navigate("/WQM030");
        break;
      // サポート画面
      case "support":
        // サポート画面に遷移
        // navigate('/SPT010')
        setOpenSupportFlg(!openSupportFlg);
        break;
      // 保守画面
      case "maintain":
        // 保守画面に遷移
        // navigate('/menuSetting')
        setOpenMainTainFlg(!openMainTainFlg);
        break;

      default:
        break;
    }
  };

  // JSXリターン
  return (
    <>
      <div data-testid="HDR-2-1" className="header_button">
        {/* お知らせボタン */}
        <div data-testid="HDR-2-1-1" className="header_button_div top">
          <button
            data-testid="HDR-2-1-1-1"
            className={
              Const.HEADER_URL_NOTICE.test(url.pathname)
                ? "header_button_btn top selected_top"
                : "header_button_btn top"
            }
            onClick={() => {
              ChangeSelectedMenu("notice");
            }}
          >
            {Const.HEADER_BTN_NOTICE}
          </button>
        </div>

        {/* 検査情報登録ボタン */}
        <div data-testid="HDR-2-1-2" className="header_button_div middle">
          <button
            data-testid="HDR-2-1-2-1"
            className={
              Const.HEADER_URL_REGISTER.test(url.pathname)
                ? "header_button_btn middle selected_middle"
                : "header_button_btn middle"
            }
            onClick={() => {
              ChangeSelectedMenu("register");
            }}
          >
            {Const.HEADER_BTN_REGISTER}
          </button>
        </div>

        {/* 検査情報検索ボタン */}
        <div data-testid="HDR-2-1-3" className="header_button_div middle">
          <button
            data-testid="HDR-2-1-3-1"
            className={
              Const.HEADER_URL_SEARCH.test(url.pathname)
                ? "header_button_btn middle selected_middle"
                : "header_button_btn middle"
            }
            onClick={() => {
              ChangeSelectedMenu("search");
            }}
          >
            {Const.HEADER_BTN_SEARCH}
          </button>
        </div>

        {/* 報告書出力ボタン */}
        <div data-testid="HDR-2-1-4" className="header_button_div middle">
          <button
            data-testid="HDR-2-1-4-1"
            className={
              Const.HEADER_URL_EXPORT.test(url.pathname)
                ? "header_button_btn middle selected_middle"
                : "header_button_btn middle"
            }
            onClick={() => {
              ChangeSelectedMenu("export");
            }}
          >
            {Const.HEADER_BTN_EXPORT}
          </button>
        </div>




        {(localStorage.getItem("securityLevel") == '1' || localStorage.getItem("affiliationSectionNo") == '01') ? (
          <>
            {/* サポートボタン */}
            <div data-testid="HDR-2-1-5" className="header_button_div middle">
              <button
                data-testid="HDR-2-1-5-1"
                className={`${Const.HEADER_URL_SUPPORT.test(url.pathname)
                  ? "header_button_btn middle selected_middle"
                  : "header_button_btn middle "
                  } ${openSupportFlg ? "dropdown_opened" : "dropdown"}`}
                onClick={() => {
                  ChangeSelectedMenu("support");
                }}
              >
                {Const.HEADER_BTN_SUPPORT}
              </button>
            </div>

            {/* 保守ボタン */}
            <div data-testid="HDR-2-1-6" className="header_button_div last">
              <button
                data-testid="HDR-2-1-6-1"
                className={`${Const.HEADER_URL_MAINTAIN.test(url.pathname)
                  ? "header_button_btn last selected_last"
                  : "header_button_btn last "
                  } ${openMainTainFlg ? "dropdown_opened" : "dropdown"}`}
                onClick={() => {
                  ChangeSelectedMenu("maintain");
                }}
              >
                {Const.HEADER_BTN_MAINTAIN}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* サポートボタン */}
            <div data-testid="HDR-2-1-6" className="header_button_div last">
              <button
                data-testid="HDR-2-1-5-1"
                className={`${Const.HEADER_URL_SUPPORT.test(url.pathname)
                  ? "header_button_btn last selected_last"
                  : "header_button_btn last "
                  } ${openSupportFlg ? "dropdown_opened" : "dropdown"}`}
                onClick={() => {
                  ChangeSelectedMenu("support");
                }}
              >
                {Const.HEADER_BTN_SUPPORT}
              </button>
            </div>
          </>
        )}




      </div>
      {openSupportFlg && <DropDownSupportArea showFlg={openSupportFlg} />}
      {openMainTainFlg && <DropDownMainTainArea showFlg={openMainTainFlg} />}
    </>
  );
};

export default HeaderButton;
