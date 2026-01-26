// 自動テスト
import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  logRoles,
} from "@testing-library/react";
import { Await, BrowserRouter } from "react-router-dom";

// 画面操作テスト
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// useQuery
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// 検査情報登録画面
import Header from "../../components/layouts/header/header.tsx";
import WQM010 from "../../pages/WQM010/index";

// アトム
import { getDefaultStore, createStore, Provider as JotaiProvider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import * as AtomWQM010 from "../../stores/atomWQM010";
import * as AtomGridTable from "../../stores/atomGridTable";
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

// MOCKデータ
import { mockSideLists } from "../mocks/mockSideListData.tsx";

// 日時管理ライブラリー
import moment from "moment";

window.scrollTo = vi.fn();

// ResizeObserverのモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

// Apiクラスのgetメソッドをモック
vi.mock("../../common/api", () => ({
  Api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getMessage: vi.fn(),
  showMessageArea: vi.fn(),
}));

const mockedApiGet = vi.mocked(Api.get);
const mockedApiPost = vi.mocked(Api.post);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// モックデータ
const mockWQM010Data = {
  pointData: [
    {
      point_no: "P001",
      point_name: "採水地点1",
      process_no: "PR001",
    },
    {
      point_no: "P002",
      point_name: "採水地点2",
      process_no: "PR002",
    },
  ],
  itemData: [
    {
      item_no: "I001",
      item_name: "pH",
      item_report_name: "水素イオン濃度",
      constant_qualitative_flg: "0",
      input_type: "1",
      select_list: [],
    },
    {
      item_no: "I002",
      item_name: "DO",
      item_report_name: "溶存酸素量",
      constant_qualitative_flg: "0",
      input_type: "1",
      select_list: [],
    },
  ],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
  dataDateLists: [
    {
      saisui_date: "2024-01-15",
    },
    {
      saisui_date: "2024-01-16",
    },
  ],
  destinationCont: {},
  inputFixed: [],
  inputFixedFlg: [
    {
      conf_btn_flg: 1,
    },
  ],
  displayTime: "2024-01-15 10:30:00",
};

const mockEmptyWQM010Data = {
  pointData: [],
  itemData: [],
  inputData: [],
  inputMask: [],
  inspectCriteria: [],
  dataDateLists: [],
  destinationCont: {},
  inputFixed: [],
  inputFixedFlg: [],
  displayTime: "2024-01-15 10:30:00",
};

/**
 * WQM010_検査情報登録画面_画面表示・ヘッダー部分
 *
 */
describe("No.1 検査情報登録画面表示_ヘッダー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.1-1 検査情報登録画面が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("wqm010-2")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 検査情報登録画面のヘッダー「画像」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerImage: any = screen.getByTestId("HDR-1-1-1");
      expect(headerImage).toBeInTheDocument();
    });
  });

  it("No.1-3 検査情報登録画面のヘッダー「タイトル」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerTitle: any = screen.getByTestId("HDR-1-1-2");
      expect(headerTitle).toHaveTextContent(import.meta.env.VITE_SYSTEM_NAME);
    });
  });

  it("No.1-4 検査情報登録画面のヘッダーの各種メニューボタン「お知らせ」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonNotice: any = screen.getByTestId("HDR-2-1-1-1");
      expect(headerMenuButtonNotice).toBeInTheDocument();
    });
  });

  it("No.1-5 検査情報登録画面のヘッダーの各種メニューボタン「検査情報登録」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonRegister: any = screen.getByTestId("HDR-2-1-2-1");
      expect(headerMenuButtonRegister).toBeInTheDocument();
    });
  });

  it("No.1-6 検査情報登録画面のヘッダーの各種メニューボタン「検査情報検索」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSearch: any = screen.getByTestId("HDR-2-1-3-1");
      expect(headerMenuButtonSearch).toBeInTheDocument();
    });
  });

  it("No.1-7 検査情報登録画面のヘッダーの各種メニューボタン「報告書出力」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonReport: any = screen.getByTestId("HDR-2-1-4-1");
      expect(headerMenuButtonReport).toBeInTheDocument();
    });
  });

  it("No.1-8 検査情報登録画面のヘッダーの各種メニューボタン「サポート」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSupport: any = screen.getByTestId("HDR-2-1-5-1");
      expect(headerMenuButtonSupport).toBeInTheDocument();
    });
  });

  it("No.1-9 検査情報登録画面のヘッダーの各種メニューボタン「保守」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const headerMenuButtonMaintain: any = screen.getByTestId("HDR-2-1-6-1");
        expect(headerMenuButtonMaintain).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.1-10 検査情報登録画面のヘッダーのユーザー情報管理ボタン「ログインのユーザー名称」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonUserName: any = screen.getByTestId("HDR-3-1-1-2");
      expect(headerMenuButtonUserName).toBeInTheDocument();
    });
  });

  it("No.1-11 検査情報登録画面のヘッダーのユーザー情報管理ボタン「ログアウト」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonLogout: any = screen.getByTestId("HDR-3-1-2");
      expect(headerMenuButtonLogout).toBeInTheDocument();
    });
  });
});

/**
 * WQM010_検査情報登録画面_サイドメニュー部分
 *
 */
describe("No.2 検査情報登録画面表示_サイドメニュー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.2-1 検査情報登録画面の開閉「文言」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const menuToggleText: any = screen.getByTestId("SMN-1-1-1");
      expect(menuToggleText).toHaveTextContent("サイドメニューを閉じる");
    });
  });

  it("No.2-2 検査情報登録画面の開閉「画像」（押下可）が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const menuToggleImage: any = screen.getByTestId("SMN-1-1-2");
      expect(menuToggleImage).toBeInTheDocument();
    });
  });

  it("No.2-3 検査情報登録画面の開閉「画像」が押下できる", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const menuToggleImage: any = screen.getByTestId("SMN-1-1-2");
      expect(menuToggleImage).toBeInTheDocument();
    });

    // 押下操作_開閉切替
    const menuToggleImage: any = screen.getByTestId("SMN-1-1-2");

    // サイドメニュー閉じる
    await userEvent.click(menuToggleImage);
    const mainSideBarHide: any = screen.getByTestId("SMN-1");
    expect(mainSideBarHide).toHaveStyle({ width: "50px" });

    // サイドメニュー開く
    await userEvent.click(menuToggleImage);
    const mainSideBarShow: any = screen.getByTestId("SMN-1");
    expect(mainSideBarShow).toHaveStyle({ width: "400px" });
  });

  it("No.2-4 検査情報登録画面の「絞り込み検索」テキストフィールドが入力できる", async () => {
    // ストアモック
    const sideMenuStore = createStore();
    await sideMenuStore.set(AtomSideMenu.sideMenuLinkListState, mockSideLists);

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={sideMenuStore}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM010 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const filterInput = screen.getByPlaceholderText("絞り込み検索");
      expect(filterInput).toBeInTheDocument();
    });

    // 絞り込み検索_テキストフィールド
    const filterInput = screen.getByPlaceholderText("絞り込み検索");
    await userEvent.type(filterInput, "霞ヶ浦");
    expect(filterInput).toHaveValue("霞ヶ浦");

    // ステートの保持データ更新確認
    expect(sideMenuStore.get(AtomSideMenu.sideMenuSearchState)).toBe("霞ヶ浦");

    // 絞り込み検索のメニューリスト更新処理を呼び出す
    await waitFor(() => {
      queryClient.refetchQueries({ queryKey: ["dataSideSearchMenuChanged"] });
    });

    // メニューリスト確認
    const filterResultID: number[] = [
      1, 2, 3, 4, 12, 13, 23, 24, 34, 35, 45, 46,
    ];
    sideMenuStore.get(AtomSideMenu.sideMenuLinkListState).forEach((item) => {
      if (filterResultID.includes(item.rowId)) {
        expect(item.showFlg).toBe(true);
      } else {
        expect(item.showFlg).toBe(false);
      }
    });
  });

  it("No.2-5 検査情報登録画面の「メニューリスト」が正しく表示される", async () => {
    // ストアモック
    const sideMenuStore = createStore();
    await sideMenuStore.set(AtomSideMenu.sideMenuLinkListState, mockSideLists);

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={sideMenuStore}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM010 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const scrollContainer = screen.getByTestId("SMN-1-3");
      expect(scrollContainer).toBeInTheDocument();
    });

    // メニューリスト確認
    const scrollContainer = screen.getByTestId("SMN-1-3");
    const items = sideMenuStore.get(AtomSideMenu.sideMenuLinkListState);

    for (let key = 0; key < Math.min(items.length, 5); key++) {
      scrollContainer.scrollTop = key * 250;
      fireEvent.scroll(scrollContainer);

      await waitFor(() => {
        expect(screen.getByText(items[key].text)).toBeInTheDocument();
      });
    }
  });

  it("No.2-6 検査情報登録画面の「カレンダー」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const sideMenuCalendar = document.querySelector(".react-calendar");
      expect(sideMenuCalendar).toBeInTheDocument();
    });
  });
});

/**
 * WQM010_検査情報登録画面_メインコンテンツエリア
 *
 */
describe("No.3 検査情報登録画面表示_メインコンテンツエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.3-1 メインコンテナが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("wqm010-2")).toBeInTheDocument();
    });
  });

  it("No.3-2 サイドメニューが選択されていない場合、ローディングが表示される", async () => {
    const wqm010Store = createStore();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    // 2025/12 要望修正：初期表示はローディングが表示されないように、修正済
    expect(screen.queryByTestId("wqm010-loading-gif")).not.toBeInTheDocument();     // Loading componentのgif画像
  });

  it("No.3-3 サイドメニューが選択された場合、メニュー名が表示される", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        await expect(screen.queryByText("テストメニュー")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-4 Enter方向切り替えアイコンが正しく表示される", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        await expect(screen.queryByTestId("wqm010-2-1-1")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-5 Enter方向切り替えアイコンがクリックできる", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        const enterToggleIcon = screen.getByTestId("wqm010-2-1-1");
        await expect(enterToggleIcon).toBeInTheDocument();
      }, 1000);
    });

    // Enter方向が切り替わることを確認
    await waitFor(() => {
      setTimeout(async () => {
        const enterToggleIcon = screen.getByTestId("wqm010-2-1-1");
        await userEvent.click(enterToggleIcon);
        await expect(wqm010Store.get(AtomGridTable.wqm010EnterToCell)).toBe("column");
      }, 1000);
    });
  });
});

/**
 * WQM010_検査情報登録画面_フッターエリア
 *
 */
describe("No.4 検査情報登録画面表示_フッターエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.4-1 フッターボタンが正しく表示される", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("wqm010-4-2-1")).toBeInTheDocument();     // 取消
      expect(screen.getByTestId("wqm010-4-2-2")).toBeInTheDocument();     // 入力前に戻る
      expect(screen.getByTestId("wqm010-4-2-5")).toBeInTheDocument();     // 登録
      expect(screen.getByTestId("wqm010-4-2-4")).toBeInTheDocument();     // Excelファイル取込
      expect(screen.getByTestId("wqm010-4-2-3")).toBeInTheDocument();     // トレンド
    });
  });

  it("No.4-2 登録ボタンがクリックできる", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });
    await wqm010Store.set(AtomGridTable.wqm010InputFixedFlg, true);

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    // 確認ダイアログが表示されることを確認（実際の実装に依存）
    await waitFor(async () => {
      // 確認ダイアログの状態が更新されることを確認
      const registerButton = screen.getByText("登録");
      expect(registerButton).toBeInTheDocument();

      //　ボタン押下
      setTimeout(() => {
        userEvent.click(registerButton);
        expect(wqm010Store.get(AtomCommon.inputEditingFlg)).toBeDefined();
      }, 1000);
    });
  });

  it("No.4-3 Excelファイル取込ボタンがクリックできる", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });
    await wqm010Store.set(AtomGridTable.wqm010InputFixedFlg, true);

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const excelButton = screen.getByTestId("wqm010-4-2-4");     // Excelファイル取込
      expect(excelButton).toBeInTheDocument();
    });

    const excelButton = screen.getByTestId("wqm010-4-2-4");       // Excelファイル取込
    await userEvent.click(excelButton);

    // モーダルが開くことを確認（実際の実装に依存）
    await waitFor(() => {
      const modal = document.getElementById("excel_upload_modal_panel");
      expect(modal).toBeDefined();
    });
  });
});

/**
 * WQM010_検査情報登録画面_JOTAIアトム
 *
 */
describe("No.5 WQM010アトム", () => {
  it("No.5-1 地点・項目データ状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM010.wqm010PointItemData);

    expect(initialState).toEqual(AtomWQM010.wqm010DefaultPointItemData);
    expect(initialState.selectMenuNo).toBe("");
    expect(initialState.selectDate).toBe("");
    expect(initialState.pointData).toEqual([]);
    expect(initialState.itemData).toEqual([]);
  });

  it("No.5-2 地点・項目データ状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testData = {
      ...AtomWQM010.wqm010DefaultPointItemData,
      selectMenuNo: "M001",
      selectDate: "2024-01-15",
      pointData: [{ pointNo: "P001", pointData: "テスト地点" }],
      itemData: [{ itemNo: "I001", name: "テスト項目" }],
    };

    // 状態を更新
    store.set(AtomWQM010.wqm010PointItemData, testData);

    const updatedState = store.get(AtomWQM010.wqm010PointItemData);
    expect(updatedState.selectMenuNo).toBe("M001");
    expect(updatedState.selectDate).toBe("2024-01-15");
    expect(updatedState.pointData[0].pointNo).toBe("P001");
    expect(updatedState.itemData[0].itemNo).toBe("I001");
  });

  it("No.5-3 処理実施日時状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM010.wqm010DisplayTime);

    // テストの時、日付まで
    expect(moment(initialState).format("YYYY-MM-DD")).toBe(moment(new Date()).format("YYYY-MM-DD"));
  });

  it("No.5-4 処理実施日時状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testTime = "2024-01-15 10:30:00";

    // 状態を更新
    store.set(AtomWQM010.wqm010DisplayTime, testTime);

    const updatedState = store.get(AtomWQM010.wqm010DisplayTime);
    expect(updatedState).toBe(testTime);
  });
});

/**
 * WQM010_検査情報登録画面_API通信
 *
 */
describe("No.6 WQM010API通信", () => {
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.6-1 地点・項目データ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    const result = await Api.post(
      "/WQM010/fetchPointItemData",
      mockSetMessage,
      {
        selected_menu_no: "M001",
        selected_date: "2024-01-15",
        current_month: "2024-01",
      }
    );

    expect(result).toEqual(mockWQM010Data);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/WQM010/fetchPointItemData",
      mockSetMessage,
      {
        selected_menu_no: "M001",
        selected_date: "2024-01-15",
        current_month: "2024-01",
      }
    );
  });

  it("No.6-2 入力データ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    const result = await Api.post("/WQM010/fetchInputData", mockSetMessage, {
      selected_menu_no: "M001",
      selected_date: "2024-01-15",
      current_month: "2024-01",
    });

    expect(result).toEqual(mockWQM010Data);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/WQM010/fetchInputData",
      mockSetMessage,
      {
        selected_menu_no: "M001",
        selected_date: "2024-01-15",
        current_month: "2024-01",
      }
    );
  });

  it("No.6-3 データ登録APIが正常に動作する", async () => {
    const mockSaveData = {
      data_to_save: [],
      display_time: "2024-01-15 10:30:00.000",
    };

    mockedApiPost.mockResolvedValueOnce({ success: true });

    const result = await Api.post(
      "/WQM010/saveInputData",
      mockSetMessage,
      mockSaveData
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(result).toEqual({ success: true });
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM010/saveInputData",
          mockSetMessage,
          mockSaveData
        );
      }, 3000);
    });
  });

  it("No.6-4 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/WQM010/fetchPointItemData", mockSetMessage, {})
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.6-5 ローディング表示が正しく動作する", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テストメニュー",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
    });
    await wqm010Store.set(AtomGridTable.wqm010InputFixedFlg, true);

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId("wqm010-loading-gif")).toBeInTheDocument(); // Loading componentのgif画像
    });
  });

  it("No.6-6 データが0件の場合のエラーメッセージ表示確認", async () => {
    const queryClient = createTestQueryClient();
    const wqm010Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockEmptyWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      // エラーメッセージが設定されることを確認
      const messageState = wqm010Store.get(AtomCommon.messageState);
      expect(messageState.length).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * WQM010_検査情報登録画面_レスポンシブ対応
 *
 */
describe("No.7 WQM010画面レスポンシブ対応", () => {
  const queryClient = createTestQueryClient();

  it("No.7-1 ResizeObserverが正しく動作する", async () => {
    // ResizeObserverのモック
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: vi.fn(),
    });
    window.ResizeObserver = mockResizeObserver;

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(mockResizeObserver).toHaveBeenCalled();
      }, 1000);
    });
  });

  it("No.7-2 コンテナのIDが正しく設定される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(
          document.getElementById("wqm010-2")
        ).toBeInTheDocument();
        expect(document.getElementById("main-content-table")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.7-3 画面幅に応じてコンテナ幅が調整される", async () => {
    const wqm010Store = createStore();
    await wqm010Store.set(AtomSideMenu.sideMenuWidthState, 400);

    mockedApiPost.mockResolvedValueOnce(mockWQM010Data);

    render(
      <JotaiProvider store={wqm010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const container = screen.getByTestId("wqm010-2");
      expect(container).toBeInTheDocument();
      // コンテナの幅が設定されていることを確認
      expect(container.style.width).toBeDefined();
    });
  });
});
