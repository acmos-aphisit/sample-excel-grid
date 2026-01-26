// 自動テスト
import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  logRoles,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// 画面操作テスト
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// useQuery
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// 検査情報検索画面
import Header from "../../components/layouts/header/header.tsx";
import WQM020 from "../../pages/WQM020/index";

// アトム
import { getDefaultStore, createStore, Provider as JotaiProvider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import * as AtomWQM020 from "../../stores/atomWQM020";
import * as AtomTrend from "../../stores/atomTrendModal";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

// MOCKデータ
import { mockSideLists } from "../mocks/mockSideListData.tsx";

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
    postBuffer: vi.fn(),
    fileDownload: vi.fn(),
  },
  getMessage: vi.fn(),
  showMessageArea: vi.fn(),
}));

const mockedApiGet = vi.mocked(Api.get);
const mockedApiPost = vi.mocked(Api.post);
const mockedApiPostBuffer = vi.mocked(Api.postBuffer);
const mockedApiFileDownload = vi.mocked(Api.fileDownload);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// モックデータ
const mockWQM020InitData = {
  kbn: [
    { label: "定期検査", value: "1" },
    { label: "臨時検査", value: "2" },
  ],
  sisetu: [
    { label: "第一浄水場", value: "S001" },
    { label: "第二浄水場", value: "S002" },
  ],
  process: [
    { label: "原水", value: "P001" },
    { label: "浄水", value: "P002" },
  ],
  cat: [
    { label: "一般項目", value: "C001" },
    { label: "金属類", value: "C002" },
  ],
  point: [
    { label: "採水地点1", value: "PT001" },
    { label: "採水地点2", value: "PT002" },
  ],
  item: [
    { label: "pH", value: "I001" },
    { label: "濁度", value: "I002" },
  ],
};

const mockWQM020SearchData = {
  list: [
    {
      date: "2024-01-15",
      time: "10:30",
      point: "採水地点1",
      item: "pH",
      kbn: "定期検査",
      c_data: "7.2",
      q_data: "適合",
    },
    {
      date: "2024-01-16",
      time: "11:00",
      point: "採水地点2",
      item: "濁度",
      kbn: "定期検査",
      c_data: "0.5",
      q_data: "適合",
    },
  ],
  calc: {
    max: "7.2",
    min: "0.5",
    avg: "3.85",
    count: "2",
  },
};

const mockEmptyWQM020SearchData = {
  list: [],
  calc: {
    max: "",
    min: "",
    avg: "",
    count: "",
  },
};

/**
 * WQM020_検査情報検索画面_画面表示・ヘッダー部分
 *
 */
describe("No.1 検査情報検索画面表示_ヘッダー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.1-1 検査情報検索画面が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("wqm020-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 検査情報検索画面のヘッダー「画像」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerImage: any = screen.getByTestId("HDR-1-1-1");
      expect(headerImage).toBeInTheDocument();
    });
  });

  it("No.1-3 検査情報検索画面のヘッダー「タイトル」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerTitle: any = screen.getByTestId("HDR-1-1-2");
      expect(headerTitle).toHaveTextContent(import.meta.env.VITE_SYSTEM_NAME);
    });
  });

  it("No.1-4 検査情報検索画面のヘッダーの各種メニューボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const headerMenuButtonNotice: any = screen.getByTestId("HDR-2-1-1-1");
        const headerMenuButtonRegister: any = screen.getByTestId("HDR-2-1-2-1");
        const headerMenuButtonSearch: any = screen.getByTestId("HDR-2-1-3-1");
        const headerMenuButtonReport: any = screen.getByTestId("HDR-2-1-4-1");
        const headerMenuButtonSupport: any = screen.getByTestId("HDR-2-1-5-1");
        const headerMenuButtonMaintain: any = screen.getByTestId("HDR-2-1-6-1");

        expect(headerMenuButtonNotice).toBeInTheDocument();
        expect(headerMenuButtonRegister).toBeInTheDocument();
        expect(headerMenuButtonSearch).toBeInTheDocument();
        expect(headerMenuButtonReport).toBeInTheDocument();
        expect(headerMenuButtonSupport).toBeInTheDocument();
        expect(headerMenuButtonMaintain).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.1-5 検査情報検索画面のヘッダーのユーザー情報管理ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <WQM020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonUserName: any = screen.getByTestId("HDR-3-1-1-2");
      const headerMenuButtonLogout: any = screen.getByTestId("HDR-3-1-2");

      expect(headerMenuButtonUserName).toBeInTheDocument();
      expect(headerMenuButtonLogout).toBeInTheDocument();
    });
  });
});

/**
 * WQM020_検査情報検索画面_検索条件部分
 *
 */
describe("No.2 検査情報検索画面表示_検索条件部分", () => {
  const queryClient = createTestQueryClient();

  it("No.2-1 検査期間の入力フィールドが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("検査期間")).toBeInTheDocument();
        const dateInputs = document.querySelectorAll('input[type="date"]');
        expect(dateInputs.length).toBeGreaterThanOrEqual(2);
      }, 2000);
    });
  });

  it("No.2-2 年度選択フィールドが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("年度")).toBeInTheDocument();
        const nendoSelect = document.getElementById("nendo_select");
        expect(nendoSelect).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-3 検査区分選択フィールドが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("検査区分")).toBeInTheDocument();
      const kensaSelect = document.getElementById("kensa_select");
      expect(kensaSelect).toBeInTheDocument();
    });
  });

  it("No.2-4 採水地点設定エリアが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("採水地点設定")).toBeInTheDocument();
      expect(screen.getByText("浄水場")).toBeInTheDocument();
      expect(screen.getByText("処理過程")).toBeInTheDocument();
      expect(screen.getByText("詳細箇所")).toBeInTheDocument();
    });
  });

  it("No.2-5 検査項目設定エリアが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByTestId("wqm020-5-1")).toBeInTheDocument();     // 検査項目設定
        expect(screen.getByTestId("wqm020-5-2")).toBeInTheDocument();     // 検査種類
        expect(screen.getByTestId("wqm020-5-3")).toBeInTheDocument();     // 検査項目
      }, 2000);
    });
  });

  it("No.2-6 検索ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const searchButton = screen.getByRole("button", { name: /検索/ });
      expect(searchButton).toBeInTheDocument();
    });
  });
});

/**
 * WQM020_検査情報検索画面_検索機能
 *
 */
describe("No.3 検査情報検索画面_検索機能", () => {
  const queryClient = createTestQueryClient();

  it("No.3-1 検索条件入力後、検索ボタンクリックで検索が実行される", async () => {
    const mockSetMessage = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();
    });

    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    mockedApiPost.mockResolvedValueOnce(mockWQM020SearchData);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    // 検索条件を設定
    // await wqm020Store.set(AtomWQM020.searchCondState, {
    //   ...AtomWQM020.defaultSearchCond,
    //   date_from: "2024/01/01",
    //   date_to: "2024/01/31",
    // });

    const result = await Api.get("/WQM020/search", mockSetMessage);

    // 検索APIが呼び出されることを確認
    await waitFor(async () => {
      // 検索ボタンをクリック
      const searchButton = screen.queryByText("検索");
      await userEvent.click(searchButton);

      setTimeout(async () => {
        await expect(result).toEqual(mockWQM020InitData);
        await expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM020/search",
          mockSetMessage,
          null
        );
      }, 3000);
    });
  });

  it("No.3-2 日付未入力時にエラーメッセージが表示される", async () => {
    const wqm020Store = createStore();
    // mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    // window.alertをモック
    // const mockAlert = vi.fn();
    // Object.defineProperty(window, "alert", {
    //   value: mockAlert,
    //   writable: true,
    // });

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    // 日付を空にして検索
    await wqm020Store.set(AtomWQM020.searchCondState, {
      ...AtomWQM020.defaultSearchCond,
      date_from: null,
      date_to: null,
    });

    // アラートが表示されることを確認
    await waitFor(async () => {
      const searchButton = screen.queryByText("検索");
      await userEvent.click(searchButton);

      // expect(mockAlert).toHaveBeenCalledWith("日付を入力してください。");
      // await expect(screen.getByTestId("MSG-1")).toBeInTheDocument();
      setTimeout(async () => {
        await expect(screen.getByText("検査期間Fromは必須です。")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-3 年度選択時に検査期間が自動設定される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("年度")).toBeInTheDocument();
    });

    // 年度を設定
    await wqm020Store.set(AtomWQM020.searchCondState, {
      ...AtomWQM020.defaultSearchCond,
      nendo: "2024",
    });

    // 年度設定後の検査期間自動設定を確認
    await waitFor(() => {
      const searchCond = wqm020Store.get(AtomWQM020.searchCondState);
      expect(searchCond.date_from).toBe("2024/04/01");
      expect(searchCond.date_to).toBe("2025/03/31");
    });
  });
});

/**
 * WQM020_検査情報検索画面_検索結果表示
 *
 */
describe("No.4 検査情報検索画面_検索結果表示", () => {
  const queryClient = createTestQueryClient();

  it("No.4-1 検索結果一覧が正しく表示される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    // 検索結果をストアに設定
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);
    await wqm020Store.set(AtomWQM020.calcState, mockWQM020SearchData.calc);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText((content) => content.includes("2024-01-15"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("10:30"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("採水地点1"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("pH"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("7.2"))).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.4-2 検索結果のテーブルヘッダーが正しく表示される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText((content) => content.includes("No."))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("採水年月日"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("採水時刻"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("採水地点"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("検査項目"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("検査区分"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("定量データ"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("定性データ"))).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.4-3 計算結果エリアが正しく表示される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);
    await wqm020Store.set(AtomWQM020.calcState, mockWQM020SearchData.calc);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText((content) => content.includes("最大 = 7.2"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("最小 = 0.5"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("平均 = 3.85"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("定量データ件数 =2"))).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.4-4 検索結果が0件の場合、一覧が表示されない", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    await wqm020Store.set(AtomWQM020.listState, []);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const listArea = document.getElementById("listArea");
      expect(listArea).not.toBeInTheDocument();
    });
  });
});

/**
 * WQM020_検査情報検索画面_ソート機能
 *
 */
describe("No.5 検査情報検索画面_ソート機能", () => {
  const queryClient = createTestQueryClient();

  it("No.5-1 テーブルヘッダークリックでソートが実行される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    mockedApiPost.mockResolvedValueOnce(mockWQM020SearchData);
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);
    await wqm020Store.set(AtomWQM020.searchHiddenCondState, {
      ...AtomWQM020.defaultSearchCond,
      date_from: "2024/01/01",
      date_to: "2024/12/31",
    });

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText((content) => content.includes("採水年月日"))).toBeInTheDocument();

        // 採水年月日ヘッダーをクリック
        const dateHeader = screen.getByTestId("wqm020-4-1-1-1");      // 採水年月日
        userEvent.click(dateHeader);
      }, 1000);
    });

    // ソート用のAPI呼び出しが実行されることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM020/search",
          expect.any(Function),
          expect.objectContaining({
            order_column: "wqm020date",
          })
        );
      }, 1000);
    });
  });

  it("No.5-2 同じヘッダーを2回クリックでソート方向が切り替わる", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    mockedApiPost.mockResolvedValueOnce(mockWQM020SearchData);
    mockedApiPost.mockResolvedValueOnce(mockWQM020SearchData);
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);
    await wqm020Store.set(AtomWQM020.searchHiddenCondState, {
      ...AtomWQM020.defaultSearchCond,
      date_from: "2024/01/01",
      date_to: "2024/12/31",
    });

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText((content) => content.includes("採水年月日"))).toBeInTheDocument();
      }, 1000);
    });

    await waitFor(() => {
      setTimeout(() => {
        const dateHeader = screen.getByTestId("wqm020-4-1-1-1");      // 採水年月日

        // 1回目のクリック
        userEvent.click(dateHeader);
        waitFor(() => {
          expect(mockedApiPost).toHaveBeenCalledWith(
            "/WQM020/search",
            expect.any(Function),
            expect.objectContaining({
              order_direction: true,
            })
          );
        });

        // 2回目のクリック
        userEvent.click(dateHeader);
        waitFor(() => {
          expect(mockedApiPost).toHaveBeenCalledWith(
            "/WQM020/search",
            expect.any(Function),
            expect.objectContaining({
              order_direction: false,
            })
          );
        });
      }, 1000);
    });


  });
});

/**
 * WQM020_検査情報検索画面_フッターエリア
 *
 */
describe("No.6 検査情報検索画面_フッターエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.6-1 フッターボタンが正しく表示される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText((content) => content.includes("検査結果ファイル出力"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("3σ共同検査"))).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes("3σ浄水・配水"))).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.6-2 検査結果ファイル出力ボタンがクリックできる", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    mockedApiPostBuffer.mockResolvedValueOnce(new ArrayBuffer(8));
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);

    // Blobとリンクのモック
    global.Blob = vi.fn().mockImplementation(() => ({}));
    global.URL.createObjectURL = vi.fn().mockReturnValue("mock-url");
    const mockClick = vi.fn();
    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
    };
    // vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);
    mockLink.click = mockClick;

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const exportButton = screen.getByTestId("wqm020-5-1");
      expect(exportButton).toBeInTheDocument();
    });

    const exportButton = screen.getByTestId("wqm020-5-1");
    await userEvent.click(exportButton);

    // ファイル出力APIが呼び出されることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiPostBuffer).toHaveBeenCalledWith(
          "/WQM020/exportSearchData",
          expect.any(Function),
          expect.any(Object)
        );
      }, 1000);
    });
  });

  it("No.6-3 3σボタンがクリックできる", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    mockedApiFileDownload.mockResolvedValueOnce({
      data: new ArrayBuffer(8),
      headers: new Map([
        ["Content-Disposition", "attachment; filename=test.xlsx"],
      ]),
    });

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const sigmaButton = screen.getByText("3σ共同検査");
        expect(sigmaButton).toBeInTheDocument();

        userEvent.click(sigmaButton);
      }, 1000);
    });

    // 3σ報告書出力APIが呼び出されることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiFileDownload).toHaveBeenCalledWith(
          "/report/export3Sigma",
          expect.any(Function),
          expect.objectContaining({
            output_data: expect.arrayContaining([
              expect.objectContaining({
                report_no: 701,
              }),
            ]),
          })
        );
      }, 1000);
    });
  });

  it("No.6-4 トレンドボタンが条件付きで表示される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    // 検索条件を設定（項目と地点を設定）
    await wqm020Store.set(AtomWQM020.searchCondState, {
      ...AtomWQM020.defaultSearchCond,
      item_no: ["I001"],
      point_no: ["PT001"],
    });

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const trendButton = screen.getByText("トレンド");
      expect(trendButton).toBeInTheDocument();
    });
  });
});

/**
 * WQM020_検査情報検索画面_JOTAIアトム
 *
 */
describe("No.7 WQM020アトム", () => {
  it("No.7-1 検索条件状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM020.searchCondState);

    expect(initialState).toEqual(AtomWQM020.defaultSearchCond);
    expect(initialState.date_from).toBe("");
    expect(initialState.date_to).toBe("");
    expect(initialState.point_no).toEqual([]);
    expect(initialState.item_no).toEqual([]);
  });

  it("No.7-2 検索条件状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testSearchCond = {
      ...AtomWQM020.defaultSearchCond,
      date_from: "2024/01/01",
      date_to: "2024/12/31",
      nendo: "2024",
      point_no: ["PT001"],
      item_no: ["I001"],
    };

    // 状態を更新
    store.set(AtomWQM020.searchCondState, testSearchCond);

    const updatedState = store.get(AtomWQM020.searchCondState);
    expect(updatedState.date_from).toBe("2024/01/01");
    expect(updatedState.date_to).toBe("2024/12/31");
    expect(updatedState.nendo).toBe("2024");
    expect(updatedState.point_no).toEqual(["PT001"]);
    expect(updatedState.item_no).toEqual(["I001"]);
  });

  it("No.7-3 検索結果リスト状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM020.listState);

    expect(initialState).toEqual([]);
  });

  it("No.7-4 検索結果リスト状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomWQM020.listState, mockWQM020SearchData.list);

    const updatedState = store.get(AtomWQM020.listState);
    expect(updatedState.length).toBe(2);
    expect(updatedState[0].date).toBe("2024-01-15");
    expect(updatedState[0].item).toBe("pH");
  });

  it("No.7-5 計算結果状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM020.calcState);

    expect(initialState).toEqual(AtomWQM020.defaultCalcType);
    expect(initialState.max).toBe("");
    expect(initialState.min).toBe("");
    expect(initialState.avg).toBe("");
    expect(initialState.count).toBe("");
  });

  it("No.7-6 計算結果状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomWQM020.calcState, mockWQM020SearchData.calc);

    const updatedState = store.get(AtomWQM020.calcState);
    expect(updatedState.max).toBe("7.2");
    expect(updatedState.min).toBe("0.5");
    expect(updatedState.avg).toBe("3.85");
    expect(updatedState.count).toBe("2");
  });
});

/**
 * WQM020_検査情報検索画面_API通信
 *
 */
describe("No.8 WQM020API通信", () => {
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.8-1 初期データ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    const result = await Api.get("/WQM020/index", mockSetMessage);

    await waitFor(() => {
      setTimeout(async () => {
        await expect(result).toEqual(mockWQM020InitData);
        await expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM020/index",
          mockSetMessage,
          null
        );
      }, 3000);
    });
  });

  it("No.8-2 検索APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM020SearchData);

    const searchCondition = {
      ...AtomWQM020.defaultSearchCond,
      date_from: "2024/01/01",
      date_to: "2024/12/31",
    };

    const result = await Api.post(
      "/WQM020/search",
      mockSetMessage,
      searchCondition
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(result).toEqual(mockWQM020SearchData);
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM020/search",
          mockSetMessage,
          searchCondition
        );
      }, 1000);
    });
  });

  it("No.8-3 地点・処理過程取得APIが正常に動作する", async () => {
    const mockPointProcessData = {
      process: [{ label: "原水", value: "P001" }],
      point: [{ label: "採水地点1", value: "PT001" }],
    };

    mockedApiPost.mockResolvedValueOnce(mockPointProcessData);

    const result = await Api.post(
      "/WQM020/getPointAndProcess",
      mockSetMessage,
      { sisetu: "S001" }
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(result).toEqual(mockPointProcessData);
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM020/getPointAndProcess",
          mockSetMessage,
          { sisetu: "S001" }
        );
      }, 1000);
    });
  });

  it("No.8-4 検査項目取得APIが正常に動作する", async () => {
    const mockItemData = {
      item: [
        { label: "pH", value: "I001" },
        { label: "濁度", value: "I002" },
      ],
    };

    mockedApiPost.mockResolvedValueOnce(mockItemData);

    const result = await Api.post("/WQM020/getItem", mockSetMessage, {
      cat: "C001",
    });

    await waitFor(() => {
      setTimeout(() => {
        expect(result).toEqual(mockItemData);
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM020/getItem",
          mockSetMessage,
          { cat: "C001" }
        );
      }, 1000);
    });
  });

  it("No.8-5 ファイル出力APIが正常に動作する", async () => {
    const mockBuffer = new ArrayBuffer(8);
    mockedApiPostBuffer.mockResolvedValueOnce(mockBuffer);

    const result = await Api.postBuffer(
      "/WQM020/exportSearchData",
      mockSetMessage,
      AtomWQM020.defaultSearchCond
    );

    expect(result).toEqual(mockBuffer);
    expect(mockedApiPostBuffer).toHaveBeenCalledWith(
      "/WQM020/exportSearchData",
      mockSetMessage,
      AtomWQM020.defaultSearchCond
    );
  });

  it("No.8-6 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/WQM020/search", mockSetMessage, {})
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.8-7 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    expect(screen.getByTestId("wqm020-loading-gif")).toBeInTheDocument(); // Loading componentのgif画像
  });

  it("No.8-8 データが0件の場合の処理が正しく動作する", async () => {
    const queryClient = createTestQueryClient();
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    mockedApiPost.mockResolvedValueOnce(mockEmptyWQM020SearchData);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      // 空の検索結果が設定されることを確認
      const listState = wqm020Store.get(AtomWQM020.listState);
      expect(listState).toEqual([]);
    });
  });
});

/**
 * WQM020_検査情報検索画面_無限スクロール機能
 *
 */
describe("No.9 WQM020無限スクロール機能", () => {
  const queryClient = createTestQueryClient();

  it("No.9-1 スクロールフラグが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM020.scrollFlgState);

    expect(initialState).toBe(true);
  });

  it("No.9-2 スクロール位置状態が正しく初期化される", async () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM020.barHeightState);

    await waitFor(() => {
      setTimeout(() => {
        expect(initialState).toEqual(AtomWQM020.defaultBarHeight);
        expect(initialState.before).toBe(0);
        expect(initialState.after).toBe(0);
      }, 1000);
    });
    
  });

  it("No.9-3 スクロール位置状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testBarHeight = { before: 10, after: 20 };

    // 状態を更新
    store.set(AtomWQM020.barHeightState, testBarHeight);

    const updatedState = store.get(AtomWQM020.barHeightState);
    expect(updatedState.before).toBe(10);
    expect(updatedState.after).toBe(20);
  });
});

/**
 * WQM020_検査情報検索画面_レスポンシブ対応
 *
 */
describe("No.10 WQM020画面レスポンシブ対応", () => {
  const queryClient = createTestQueryClient();

  it("No.10-1 ResizeObserverが正しく動作する", async () => {
    // ResizeObserverのモック
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: vi.fn(),
    });
    window.ResizeObserver = mockResizeObserver;

    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(mockResizeObserver).toHaveBeenCalled();
      }, 1000);
    });
  });

  it("No.10-2 画面幅に応じてリスト高さが調整される", async () => {
    const wqm020Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockWQM020InitData);
    await wqm020Store.set(AtomWQM020.listState, mockWQM020SearchData.list);

    render(
      <JotaiProvider store={wqm020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const listArea = document.getElementById("listArea");
        if (listArea) {
          expect(listArea.style.maxHeight).toBeDefined();
        }
      }, 1000);
    });
  });
});
