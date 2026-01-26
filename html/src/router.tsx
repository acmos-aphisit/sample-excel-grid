import React from "react";
import { Api } from "./common/api";
import {
  BrowserRouter,
  Route,
  useLocation,
  Routes,
  Navigate,
} from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import Header from "./components/layouts/header/header.tsx";
import "./scss/common.scss";
import "./scss/layouts/header.scss";

import * as AtomCommon from "./stores/atom";
import * as AtomConfirmDialog from "./stores/atomConfirmDialog";
import * as AtomSideMasterMenu from "./stores/atomSideMenuMaster";

// 汎用画面
import CMN010 from "./pages/CMN010/index.tsx"; // ログイン画面
import CMN020 from "./pages/CMN020/index.tsx"; // お知らせ画面
// 検査・報告書画面
import WQM010 from "./pages/WQM010/index.tsx"; // 検査情報登録画面
import WQM020 from "./pages/WQM020/index.tsx"; // 検査結果検索画面
import WQM030 from "./pages/WQM030/index.tsx"; // 報告書出力画面
import ACMOS101 from "./pages/ACMOS101/indexSample.tsx"; // 報告書出力画面
// サポート画面
import SPT010 from "./pages/SPT010/index.tsx"; // お知らせ管理画面
import SPT020 from "./pages/SPT020/index.tsx"; // 動画マニュアル
import SPT030 from "./pages/SPT030/index.tsx"; // 運用メモ
// 保守画面
import MNG010 from "./pages/MNG010/index.tsx"; // ユーザマスタ画面
import MNG020 from "./pages/MNG020/index.tsx"; // 採水地点設定画面
import MNG030 from "./pages/MNG030/index.tsx"; // 検査項目設定画面
import MNG040 from "./pages/MNG040/index.tsx"; // 基準値設定画面
import MNG050 from "./pages/MNG050/index.tsx"; // 入力画面設定画面
import MNG060 from "./pages/MNG060/index.tsx"; // 報告書設定画面
// データ移行
import CMN090 from "./pages/CMN090/index.tsx"; // データ移行処理画面（CSV取込）
// 帳票出力処理開発用
import ReportDev from "./pages/ReportDev/index.tsx"; // データ移行処理画面（CSV取込）

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PageRouter = (): JSX.Element => (
  <>
    <Header />
    <div className="container_row">
      <Routes>
        {/* 汎用画面 */}
        <Route path="/CMN020" element={<CMN020 />} />
        {/* 検査・報告書画面 */}
        <Route path="/WQM010" element={<WQM010 />} />
        <Route path="/WQM020" element={<WQM020 />} />
        <Route path="/WQM030" element={<WQM030 />} />
        {/* サポート画面 */}
        <Route path="/SPT010" element={<SPT010 />} />
        <Route path="/SPT020" element={<SPT020 />} />
        <Route path="/SPT030" element={<SPT030 />} />
        {/* 保守画面 */}
        <Route path="/MNG010" element={<MNG010 />} />
        <Route path="/MNG020" element={<MNG020 />} />
        <Route path="/MNG030" element={<MNG030 />} />
        <Route path="/MNG040" element={<MNG040 />} />
        <Route path="/MNG050" element={<MNG050 />} />
        <Route path="/MNG060" element={<MNG060 />} />
        {/* 共通コンポネントサンプル */}
        <Route path="/ACMOS101" element={<ACMOS101 />} />
      </Routes>
      {/* <MessageArea /> */}
    </div>
  </>
);

type RouterGuard = { children: JSX.Element };
const RouterGuard: React.FC<RouterGuard> = ({ children }): JSX.Element => {
  const location = useLocation();
  const [main, setMain] = React.useState<JSX.Element>(<> </>);

  // 確認ダイアログ設定
  const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);
  const setSideMenuSelected = useSetAtom(AtomSideMasterMenu.sideMenuSelectedState);

  // メッセージステート
  const [getMessage, setMessage] = useAtom(AtomCommon.messageState);

  const queryClient = new QueryClient();


  // 初期化処理
  React.useEffect(() => {
    // クエリクライアントをクリア
    queryClient.clear();
    setDialog(AtomConfirmDialog.defaultConfirmDialogAtom);
    setSideMenuSelected(AtomSideMasterMenu.defaultInputSelectedMenuState);
    setMessage([]);

    if (location.pathname === "/") {
      setMain(<Navigate to="/login" />);
      // Api.get('/logout', setMessage)
      //   .then(() => {
      //     setMain(<Navigate to="/login" />);
      //   })
      //   .catch(() => {
      //     setMain(<Navigate to="/login" />);
      //   });
    } else {
      // setMain(<> {children} </>);
      Api.get('/loginCheck', setMessage)
        .then((data) => {
          if (data.status) {
            const securityLevel: string = localStorage.getItem("securityLevel");
            const affiliationSectionNo: string = localStorage.getItem("affiliationSectionNo")

            if (securityLevel == "0" && affiliationSectionNo !== "01") {
              if (location.pathname.includes("MNG")) {
                setMain(<Navigate to="/CMN020" />);
              } else {
                setMain(<> {children} </>);
              }
            } else {
              setMain(<> {children} </>);
            }

          } else {
            setMain(<Navigate to="/login" />);
          }
        })
        .catch(() => {
          setMain(<Navigate to="/login" />);
        });
    }
  }, [location.pathname]);

  return <>{main}</>;
};

const Router = (): JSX.Element => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<CMN010 />} />
      {/* データ移行 */}
      <Route path="/CMN090" element={<CMN090 />} />
      {/* 帳票開発用 */}
      <Route path="/ReportDev" element={<ReportDev />} />
      <Route
        path="*"
        element={
          <RouterGuard>
            <PageRouter />
          </RouterGuard>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default Router;
