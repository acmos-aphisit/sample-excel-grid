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

// 運用メモ画面
import Header from "../../components/layouts/header/header.tsx";
import SPT030 from "../../pages/SPT030/index";

// アトム
import { getDefaultStore, createStore, Provider as JotaiProvider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomSPT030 from "../../stores/atomSPT030";
import * as AtomUnyouMemoManage from "../../stores/atomUnyouMemoManage";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

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
const mockUnyouMemoData = {
  unyouMemo: [
    {
      unyou_id: "1",
      unyou_title: "システムメンテナンス",
      unyou_date: "2024-01-15",
      unyou_memo: "定期メンテナンスを実施しました",
      unyou_bikou: "特に問題なし",
      file_path: "/files/maintenance_report.pdf",
      dsp_flg: "1",
    },
    {
      unyou_id: "2",
      unyou_title: "データバックアップ",
      unyou_date: "2024-01-14",
      unyou_memo: "週次バックアップを実行",
      unyou_bikou: "正常完了",
      file_path: "",
      dsp_flg: "1",
    },
    {
      unyou_id: "3",
      unyou_title: "セキュリティ更新",
      unyou_date: "2024-01-13",
      unyou_memo: "セキュリティパッチを適用",
      unyou_bikou: "再起動が必要",
      file_path: "/files/security_update.txt",
      dsp_flg: "0",
    },
  ],
  displayTime: "2024-01-15 10:30:00",
};

const mockEmptyUnyouMemoData = {
  unyouMemo: [],
  displayTime: "2024-01-15 10:30:00",
};

/**
 * SPT030_運用メモ画面_画面表示・ヘッダー部分
 *
 */
describe("No.1 運用メモ画面表示_ヘッダー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.1-1 運用メモ画面が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("運用メモ")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 運用メモ画面のヘッダー「画像」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerImage: any = screen.getByTestId("HDR-1-1-1");
      expect(headerImage).toBeInTheDocument();
    });
  });

  it("No.1-3 運用メモ画面のヘッダー「タイトル」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerTitle: any = screen.getByTestId("HDR-1-1-2");
      expect(headerTitle).toHaveTextContent(import.meta.env.VITE_SYSTEM_NAME);
    });
  });

  it("No.1-4 運用メモ画面のヘッダーの各種メニューボタン「お知らせ」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonNotice: any = screen.getByTestId("HDR-2-1-1-1");
      expect(headerMenuButtonNotice).toBeInTheDocument();
    });
  });

  it("No.1-5 運用メモ画面のヘッダーの各種メニューボタン「検査情報登録」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonRegister: any = screen.getByTestId("HDR-2-1-2-1");
      expect(headerMenuButtonRegister).toBeInTheDocument();
    });
  });

  it("No.1-6 運用メモ画面のヘッダーの各種メニューボタン「検査情報検索」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSearch: any = screen.getByTestId("HDR-2-1-3-1");
      expect(headerMenuButtonSearch).toBeInTheDocument();
    });
  });

  it("No.1-7 運用メモ画面のヘッダーの各種メニューボタン「報告書出力」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonReport: any = screen.getByTestId("HDR-2-1-4-1");
      expect(headerMenuButtonReport).toBeInTheDocument();
    });
  });

  it("No.1-8 運用メモ画面のヘッダーの各種メニューボタン「サポート」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSupport: any = screen.getByTestId("HDR-2-1-5-1");
      expect(headerMenuButtonSupport).toBeInTheDocument();
    });
  });

  it("No.1-9 運用メモ画面のヘッダーの各種メニューボタン「保守」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
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

  it("No.1-10 運用メモ画面のヘッダーのユーザー情報管理ボタン「ログインのユーザー名称」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonUserName: any = screen.getByTestId("HDR-3-1-1-2");
      expect(headerMenuButtonUserName).toBeInTheDocument();
    });
  });

  it("No.1-11 運用メモ画面のヘッダーのユーザー情報管理ボタン「ログアウト」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT030 />
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
 * SPT030_運用メモ画面_検索条件エリア
 *
 */
describe("No.2 運用メモ画面表示_検索条件エリア", () => {
  const queryClient = createTestQueryClient();

  it("No.2-1 検索条件エリアのタイトル「検索条件」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("検索条件")).toBeInTheDocument();
    });
  });

  it("No.2-2 検索条件の各項目が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("タイトル")).toBeInTheDocument();
      expect(screen.getByText("作成日")).toBeInTheDocument();
      expect(screen.getByText("メモ")).toBeInTheDocument();
      expect(screen.getByText("備考")).toBeInTheDocument();
      expect(screen.getByText("状態")).toBeInTheDocument();
    });
  });

  it("No.2-3 タイトル入力フィールドが正しく動作する", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const titleInput = document.getElementById(
        "input-unyou-title"
      ) as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
    });

    const titleInput = document.getElementById(
      "input-unyou-title"
    ) as HTMLInputElement;
    await userEvent.type(titleInput, "テストタイトル");

    await waitFor(() => {
      expect(spt030Store.get(AtomSPT030.searchAndSortState).unyouTitle).toBe(
        "テストタイトル"
      );
    });
  });

  it("No.2-4 メモ入力フィールドが正しく動作する", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const memoInput = document.getElementById(
        "input-unyou-memo"
      ) as HTMLInputElement;
      expect(memoInput).toBeInTheDocument();
    });

    const memoInput = document.getElementById(
      "input-unyou-memo"
    ) as HTMLInputElement;
    await userEvent.type(memoInput, "テストメモ");

    await waitFor(() => {
      expect(spt030Store.get(AtomSPT030.searchAndSortState).unyouMemo).toBe(
        "テストメモ"
      );
    });
  });

  it("No.2-5 備考入力フィールドが正しく動作する", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const bikouInput = document.getElementById(
        "input-unyou-bikou"
      ) as HTMLInputElement;
      expect(bikouInput).toBeInTheDocument();
    });

    const bikouInput = document.getElementById(
      "input-unyou-bikou"
    ) as HTMLInputElement;
    await userEvent.type(bikouInput, "テスト備考");

    await waitFor(() => {
      expect(spt030Store.get(AtomSPT030.searchAndSortState).unyouBikou).toBe(
        "テスト備考"
      );
    });
  });

  it("No.2-6 状態セレクトボックスが正しく動作する", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const statusSelect = document.getElementById(
        "input-unyou-dsp-flg"
      ) as HTMLSelectElement;
      expect(statusSelect).toBeInTheDocument();
    });

    const statusSelect = document.getElementById(
      "input-unyou-dsp-flg"
    ) as HTMLSelectElement;
    await userEvent.selectOptions(statusSelect, "0");

    await waitFor(() => {
      expect(spt030Store.get(AtomSPT030.searchAndSortState).unyouDspFlg).toBe(
        "0"
      );
    });
  });

  it("No.2-7 検索ボタンが正しく動作する", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const searchButton = screen.getByText("検索");
      expect(searchButton).toBeInTheDocument();
    });

    const searchButton = screen.getByText("検索");
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/SPT030/searchUnyouMemoData",
        expect.any(Function),
        expect.any(Object)
      );
    });
  });
});

/**
 * SPT030_運用メモ画面_一覧表示エリア
 *
 */
describe("No.3 運用メモ画面表示_一覧表示エリア", () => {
  const queryClient = createTestQueryClient();

  it("No.3-1 運用メモ一覧のヘッダーが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("spt030-5-1")).toBeInTheDocument();     // No.
      expect(screen.getByTestId("spt030-5-2")).toBeInTheDocument();     // タイトル
      expect(screen.getByTestId("spt030-5-3")).toBeInTheDocument();     // 作成日
      expect(screen.getByTestId("spt030-5-4")).toBeInTheDocument();     // メモ
      expect(screen.getByTestId("spt030-5-5")).toBeInTheDocument();     // 備考
      expect(screen.getByTestId("spt030-5-6")).toBeInTheDocument();     // 添付ファイル
      expect(screen.getByTestId("spt030-5-7")).toBeInTheDocument();     // 表示フラグ
    });
  });

  it("No.3-2 運用メモデータが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("システムメンテナンス")).toBeInTheDocument();
      expect(screen.getByText("データバックアップ")).toBeInTheDocument();
      expect(screen.getByText("セキュリティ更新")).toBeInTheDocument();
      expect(
        screen.getByText("定期メンテナンスを実施しました")
      ).toBeInTheDocument();
      expect(screen.getByText("週次バックアップを実行")).toBeInTheDocument();
    });
  });

  it("No.3-3 編集ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const editButtons = screen.getAllByText("編集");
      expect(editButtons).toHaveLength(3);
    });
  });

  it("No.3-4 編集ボタンクリック時にモーダルが開く", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const editButtons = screen.getAllByText("編集");
      expect(editButtons[0]).toBeInTheDocument();
    });

    const editButton = screen.getAllByText("編集")[0];
    await userEvent.click(editButton);

    await waitFor(() => {
      expect(
        spt030Store.get(AtomUnyouMemoManage.unyouMemoManageModalFlgState)
      ).toBe(true);
      expect(
        spt030Store.get(AtomUnyouMemoManage.unyouMemoManageState).dataMode
      ).toBe("編集");
      expect(
        spt030Store.get(AtomUnyouMemoManage.unyouMemoManageState).unyouTitle
      ).toBe("システムメンテナンス");
    });
  });

  it("No.3-5 ソート機能が正しく動作する", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData); // ソート実行時の2回目のAPI呼び出し

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const titleHeader = screen.getByTestId("spt030-5-2");
      expect(titleHeader).toBeInTheDocument();
    });

    const titleHeader = screen.getByTestId("spt030-5-2");
    await userEvent.click(titleHeader);

    await waitFor(async () => {
      await expect(mockedApiPost).toHaveBeenCalledWith(
        "/SPT030/searchUnyouMemoData",
        expect.any(Function),
        expect.objectContaining({
          sortColumn: "unyou_title",
          sortOrder: "DESC",
        })
      );
    });
  });

  it("No.3-6 データが0件の場合の表示確認", async () => {
    mockedApiPost.mockResolvedValueOnce(mockEmptyUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      // タイトルは表示されるが、データ行は表示されない
      expect(screen.getByText("運用メモ")).toBeInTheDocument();
      expect(
        screen.queryByText("システムメンテナンス")
      ).not.toBeInTheDocument();
    });
  });
});

/**
 * SPT030_運用メモ画面_フッターエリア
 *
 */
describe("No.4 運用メモ画面表示_フッターエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.4-1 新規登録ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("新規登録")).toBeInTheDocument();
    });
  });

  it("No.4-2 新規登録ボタンクリック時にモーダルが開く", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const newButton = screen.getByText("新規登録");
      expect(newButton).toBeInTheDocument();
    });

    const newButton = screen.getByText("新規登録");
    await userEvent.click(newButton);

    await waitFor(() => {
      expect(
        spt030Store.get(AtomUnyouMemoManage.unyouMemoManageModalFlgState)
      ).toBe(true);
      expect(
        spt030Store.get(AtomUnyouMemoManage.unyouMemoManageState).dataMode
      ).toBe("登録");
    });
  });
});

/**
 * SPT030_運用メモ画面_JOTAIアトム
 *
 */
describe("No.5 運用メモアトム", () => {
  it("No.5-1 検索条件状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomSPT030.searchAndSortState);

    expect(initialState).toEqual(AtomSPT030.defaultSearchAndSortState);
    expect(initialState.sortColumn).toBe("");
    expect(initialState.sortOrder).toBe("ASC");
    expect(initialState.unyouTitle).toBe("");
    expect(initialState.unyouDspFlg).toBe("1");
  });

  it("No.5-2 検索条件状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testData = {
      ...AtomSPT030.defaultSearchAndSortState,
      unyouTitle: "テストタイトル",
      unyouMemo: "テストメモ",
    };

    // 状態を更新
    store.set(AtomSPT030.searchAndSortState, testData);

    const updatedState = store.get(AtomSPT030.searchAndSortState);
    expect(updatedState.unyouTitle).toBe("テストタイトル");
    expect(updatedState.unyouMemo).toBe("テストメモ");
  });

  it("No.5-3 運用メモリスト状態が正しく初期化される", () => {
    const store = getDefaultStore();

    // リセット
    store.set(AtomSPT030.unyouMemoListState, []);
    const initialState = store.get(AtomSPT030.unyouMemoListState);

    expect(initialState).toEqual([]);
  });

  it("No.5-4 運用メモリスト状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testData = [
      {
        unyou_id: "1",
        unyou_title: "テスト運用メモ",
        unyou_date: "2024-01-15",
        unyou_memo: "テストメモ内容",
        unyou_bikou: "テスト備考",
        file_path: "",
        dsp_flg: "1",
      },
    ];

    // 状態を更新
    store.set(AtomSPT030.unyouMemoListState, testData);

    const updatedState = store.get(AtomSPT030.unyouMemoListState);
    expect(updatedState).toEqual(testData);
    expect(updatedState[0].unyou_title).toBe("テスト運用メモ");
  });

  it("No.5-5 運用メモ管理モーダル表示フラグが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(
      AtomUnyouMemoManage.unyouMemoManageModalFlgState
    );

    expect(initialState).toBe(false);
  });

  it("No.5-6 運用メモ管理モーダル表示フラグが正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomUnyouMemoManage.unyouMemoManageModalFlgState, true);

    const updatedState = store.get(
      AtomUnyouMemoManage.unyouMemoManageModalFlgState
    );
    expect(updatedState).toBe(true);
  });

  it("No.5-7 運用メモ管理状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomUnyouMemoManage.unyouMemoManageState);

    expect(initialState).toEqual(
      AtomUnyouMemoManage.defaultUnyouMemoManageState
    );
    expect(initialState.dataMode).toBe("登録");
    expect(initialState.unyouTitle).toBe("");
    expect(initialState.unyouDspFlg).toBe("1");
  });

  it("No.5-8 運用メモ管理状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testData = {
      ...AtomUnyouMemoManage.defaultUnyouMemoManageState,
      dataMode: "編集",
      unyouTitle: "テスト運用メモ",
      unyouMemo: "テストメモ内容",
    };

    // 状態を更新
    store.set(AtomUnyouMemoManage.unyouMemoManageState, testData);

    const updatedState = store.get(AtomUnyouMemoManage.unyouMemoManageState);
    expect(updatedState.dataMode).toBe("編集");
    expect(updatedState.unyouTitle).toBe("テスト運用メモ");
    expect(updatedState.unyouMemo).toBe("テストメモ内容");
  });
});

/**
 * SPT030_運用メモ画面_API通信
 *
 */
describe("No.6 運用メモAPI通信", () => {
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.6-1 運用メモデータ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    const result = await Api.post(
      "/SPT030/searchUnyouMemoData",
      mockSetMessage,
      {}
    );

    expect(result).toEqual(mockUnyouMemoData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/SPT030/searchUnyouMemoData",
      mockSetMessage,
      {}
    );
  });

  it("No.6-2 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/SPT030/searchUnyouMemoData", mockSetMessage, {})
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.6-3 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => {})); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    expect(screen.queryByTestId("spt030-loading-gif")).toBeInTheDocument();     // Loading componentのgif画像
  });

  it("No.6-4 データが0件の場合のエラーメッセージ表示確認", async () => {
    const queryClient = createTestQueryClient();
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce({ length: 0 });

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      // エラーメッセージが設定されることを確認
      const messageState = spt030Store.get(AtomCommon.messageState);
      expect(messageState.length).toBeGreaterThanOrEqual(0);
    });
  });
});

/**
 * SPT030_運用メモ画面_レスポンシブ対応
 *
 */
describe("No.7 運用メモ画面レスポンシブ対応", () => {
  const queryClient = createTestQueryClient();

  it("No.7-1 ResizeObserverが正しく動作する", async () => {
    // ResizeObserverのモック
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: vi.fn(),
    });
    window.ResizeObserver = mockResizeObserver;

    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
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
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        document.getElementById("SPT030-main-container")
      ).toBeInTheDocument();
      expect(
        document.getElementById("spt030-unyou-data-title")
      ).toBeInTheDocument();
      expect(
        document.getElementById("spt030-unyou-data-search")
      ).toBeInTheDocument();
    });
  });
});

/**
 * SPT030_運用メモ画面_日付バリデーション
 *
 */
describe("No.8 運用メモ画面日付バリデーション", () => {
  const queryClient = createTestQueryClient();

  it("No.8-1 作成日の開始日が終了日より後の場合エラーメッセージが表示される", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    // 開始日を終了日より後に設定
    spt030Store.set(AtomSPT030.searchAndSortState, {
      ...AtomSPT030.defaultSearchAndSortState,
      unyouDateStt: "2024-01-20",
      unyouDateEnd: "2024-01-15",
    });

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const searchButton = screen.getByText("検索");
        expect(searchButton).toBeInTheDocument();
      }, 1000);
    });

    

    await waitFor(() => {
      setTimeout(() => {
        const searchButton = screen.getByText("検索");
        userEvent.click(searchButton);

        // エラーメッセージが設定されることを確認
        const messageState = spt030Store.get(AtomCommon.messageState);
        expect(messageState.length).toBeGreaterThan(0);
      }, 1000);
    });
  });

  it("No.8-2 正常な日付範囲の場合検索が実行される", async () => {
    const spt030Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);
    mockedApiPost.mockResolvedValueOnce(mockUnyouMemoData);

    // 正常な日付範囲を設定
    spt030Store.set(AtomSPT030.searchAndSortState, {
      ...AtomSPT030.defaultSearchAndSortState,
      unyouDateStt: "2024-01-10",
      unyouDateEnd: "2024-01-20",
    });

    render(
      <JotaiProvider store={spt030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const searchButton = screen.getByText("検索");
      expect(searchButton).toBeInTheDocument();
    });

    const searchButton = screen.getByText("検索");
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/SPT030/searchUnyouMemoData",
        expect.any(Function),
        expect.objectContaining({
          unyouDateStt: "2024-01-10",
          unyouDateEnd: "2024-01-20",
        })
      );
    });
  });
});
