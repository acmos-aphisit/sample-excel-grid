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

// お知らせ管理画面
import Header from "../../components/layouts/header/header.tsx";
import SPT010 from "../../pages/SPT010/index";

// アトム
import { getDefaultStore, createStore, Provider as JotaiProvider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomSPT010 from "../../stores/atomSPT010";
import * as AtomOshiraseManage from "../../stores/atomOshiraseManage";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

window.scrollTo = vi.fn();
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

// Apiクラスのpostメソッドをモック
vi.mock("../../common/api", () => ({
  Api: {
    post: vi.fn(),
  },
  getMessage: vi.fn(),
  showMessageArea: vi.fn(),
}));

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
const mockOshiraseData = {
  oshirase: [
    {
      info_id: "1",
      info_text: "システムメンテナンスのお知らせ",
      info_date: "2024-01-15",
      info_link: "https://example.com/maintenance",
      unyou_id: "1",
      file_path: "/files/maintenance.pdf",
      dsp_flg: "1",
    },
    {
      info_id: "2",
      info_text: "新機能追加のお知らせ",
      info_date: "2024-01-10",
      info_link: "",
      unyou_id: "2",
      file_path: "",
      dsp_flg: "1",
    },
  ],
  displayTime: "2024-01-15 10:30:00",
};

const mockEmptyOshiraseData = {
  oshirase: [],
  displayTime: "2024-01-15 10:30:00",
};

/**
 * SPT010_お知らせ管理画面_画面表示・ヘッダー部分
 *
 */
describe("No.1 お知らせ管理画面表示_ヘッダー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.1-1 お知らせ管理画面が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("お知らせ")).toBeInTheDocument();
      }, 1000);
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 お知らせ管理画面のヘッダー「画像」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerImage: any = screen.getByTestId("HDR-1-1-1");
      expect(headerImage).toBeInTheDocument();
    });
  });

  it("No.1-3 お知らせ管理画面のヘッダー「タイトル」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerTitle: any = screen.getByTestId("HDR-1-1-2");
      expect(headerTitle).toHaveTextContent(import.meta.env.VITE_SYSTEM_NAME);
    });
  });

  it("No.1-4 お知らせ管理画面のヘッダーの各種メニューボタン「お知らせ」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonNotice: any = screen.getByTestId("HDR-2-1-1-1");
      expect(headerMenuButtonNotice).toBeInTheDocument();
    });
  });

  it("No.1-5 お知らせ管理画面のヘッダーの各種メニューボタン「検査情報登録」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonRegister: any = screen.getByTestId("HDR-2-1-2-1");
      expect(headerMenuButtonRegister).toBeInTheDocument();
    });
  });

  it("No.1-6 お知らせ管理画面のヘッダーの各種メニューボタン「検査情報検索」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSearch: any = screen.getByTestId("HDR-2-1-3-1");
      expect(headerMenuButtonSearch).toBeInTheDocument();
    });
  });

  it("No.1-7 お知らせ管理画面のヘッダーの各種メニューボタン「報告書出力」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonReport: any = screen.getByTestId("HDR-2-1-4-1");
      expect(headerMenuButtonReport).toBeInTheDocument();
    });
  });

  it("No.1-8 お知らせ管理画面のヘッダーの各種メニューボタン「サポート」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSupport: any = screen.getByTestId("HDR-2-1-5-1");
      expect(headerMenuButtonSupport).toBeInTheDocument();
    });
  });

  it("No.1-9 お知らせ管理画面のヘッダーの各種メニューボタン「保守」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        const headerMenuButtonMaintain: any = screen.getByTestId("HDR-2-1-6-1");
        await expect(headerMenuButtonMaintain).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.1-10 お知らせ管理画面のヘッダーのユーザー情報管理ボタン「ログインのユーザー名称」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonUserName: any = screen.getByTestId("HDR-3-1-1-2");
      expect(headerMenuButtonUserName).toBeInTheDocument();
    });
  });

  it("No.1-11 お知らせ管理画面のヘッダーのユーザー情報管理ボタン「ログアウト」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT010 />
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
 * SPT010_お知らせ管理画面_検索条件エリア
 *
 */
describe("No.2 お知らせ管理画面表示_検索条件エリア", () => {
  const queryClient = createTestQueryClient();

  it("No.2-1 検索条件エリアのタイトル「検索条件」が正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("検索条件")).toBeInTheDocument();
    });
  });

  it("No.2-2 掲載日の入力フィールドが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByTestId("spt010-4-1")).toBeInTheDocument();
        const dateInput = screen.getByDisplayValue("");
        expect(dateInput).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-3 備考の入力フィールドが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("spt010-4-2")).toBeInTheDocument();
      const textInput = document.querySelector('input[name="input-info-text"]');
      expect(textInput).toBeInTheDocument();
    });
  });

  it("No.2-4 状態の選択フィールドが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("spt010-4-3")).toBeInTheDocument();
      const selectInput = document.querySelector(
        'select[name="input-info-dsp-flg"]'
      );
      expect(selectInput).toBeInTheDocument();
    });
  });

  it("No.2-5 検索ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const searchButton = screen.getByRole("button", { name: "検索" });
      expect(searchButton).toBeInTheDocument();
    });
  });

  it("No.2-6 備考フィールドに文字入力ができる", async () => {
    const spt010Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <JotaiProvider store={spt010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const textInput = document.querySelector(
        'input[name="input-info-text"]'
      ) as HTMLInputElement;
      expect(textInput).toBeInTheDocument();
    });

    const textInput = document.querySelector(
      'input[name="input-info-text"]'
    ) as HTMLInputElement;
    await userEvent.type(textInput, "テストメッセージ");
    expect(textInput).toHaveValue("テストメッセージ");

    // ステートの保持データ更新確認
    expect(spt010Store.get(AtomSPT010.searchAndSortState).infoText).toBe(
      "テストメッセージ"
    );
  });

  it("No.2-7 検索ボタンのクリック動作が正しく動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData); // 検索実行時の2回目のAPI呼び出し

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const searchButton = screen.getByRole("button", { name: "検索" });
      expect(searchButton).toBeInTheDocument();
    });

    const searchButton = screen.getByRole("button", { name: "検索" });
    await userEvent.click(searchButton);

    // API呼び出しが行われることを確認
    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/SPT010/searchOshiraseData",
        expect.any(Function),
        expect.any(Object)
      );
    });
  });
});

/**
 * SPT010_お知らせ管理画面_一覧表示エリア
 *
 */
describe("No.3 お知らせ管理画面表示_一覧表示エリア", () => {
  const queryClient = createTestQueryClient();

  it("No.3-1 一覧のヘッダーが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("spt010-5-1")).toBeInTheDocument();     // No.
      expect(screen.getByTestId("spt010-5-2")).toBeInTheDocument();     // 掲載日
      expect(screen.getByTestId("spt010-5-3")).toBeInTheDocument();     // お知らせ内容
      expect(screen.getByTestId("spt010-5-4")).toBeInTheDocument();     // リンク
      expect(screen.getByTestId("spt010-5-5")).toBeInTheDocument();     // 添付ファイル
      expect(screen.getByTestId("spt010-5-6")).toBeInTheDocument();     // 表示フラグ
    });
  });

  it("No.3-2 お知らせデータが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(
          screen.getAllByText("システムメンテナンスのお知らせ")[0]
        ).toBeInTheDocument();
        expect(screen.getByText("新機能追加のお知らせ")).toBeInTheDocument();
        expect(screen.getByText("2024.01.15")).toBeInTheDocument();
        expect(screen.getByText("2024.01.10")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-3 編集ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const editButtons = screen.getAllByText("編集");
      expect(editButtons).toHaveLength(2);
      expect(editButtons[0]).toBeInTheDocument();
    });
  });

  it("No.3-4 編集ボタンのクリック動作が正しく動作する", async () => {
    const spt010Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <JotaiProvider store={spt010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const editButtons = screen.getAllByText("編集");
      expect(editButtons[0]).toBeInTheDocument();
    });

    const editButtons = screen.getAllByText("編集");
    await userEvent.click(editButtons[0]);

    // お知らせ管理モーダルが開くことを確認
    await waitFor(() => {
      expect(
        spt010Store.get(AtomOshiraseManage.oshiraseManageModalFlgState)
      ).toBe(true);
    });
  });

  it("No.3-5 ソート機能が正しく動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData); // ソート実行時の2回目のAPI呼び出し

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const sortHeader = screen.getByTestId("spt010-5-2");
      expect(sortHeader).toBeInTheDocument();
    });

    const sortHeader = screen.getByTestId("spt010-5-2");
    await userEvent.click(sortHeader);

    // ソート用のAPI呼び出しが行われることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/SPT010/searchOshiraseData",
          expect.any(Function),
          expect.objectContaining({
            sortColumn: "info_date",
            sortOrder: "ASC",
          })
        );
      }, 1000);
    });
  });

  it("No.3-6 データが0件の場合の表示確認", async () => {
    mockedApiPost.mockResolvedValueOnce(mockEmptyOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      // ヘッダーは表示されるが、データ行は表示されない
      setTimeout(async () => {
        await expect(screen.getByText("お知らせが取得できません。")).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * SPT010_お知らせ管理画面_フッターエリア
 *
 */
describe("No.4 お知らせ管理画面表示_フッターエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.4-1 新規登録ボタンが正しく表示される", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const newButton = screen.getByRole("button", { name: "新規登録" });
      expect(newButton).toBeInTheDocument();
    });
  });

  it("No.4-2 新規登録ボタンのクリック動作が正しく動作する", async () => {
    const spt010Store = createStore();
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    render(
      <JotaiProvider store={spt010Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT010 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const newButton = screen.getByRole("button", { name: "新規登録" });
      expect(newButton).toBeInTheDocument();
    });

    const newButton = screen.getByRole("button", { name: "新規登録" });
    await userEvent.click(newButton);

    // お知らせ管理モーダルが開くことを確認
    await waitFor(() => {
      expect(
        spt010Store.get(AtomOshiraseManage.oshiraseManageModalFlgState)
      ).toBe(true);
    });
  });
});

/**
 * SPT010_お知らせ管理画面_JOTAIアトム
 *
 */
describe("No.5 お知らせ管理アトム", () => {
  it("No.5-1 検索条件状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomSPT010.searchAndSortState);

    expect(initialState.sortColumn).toBe("");
    expect(initialState.sortOrder).toBe("ASC");
    expect(initialState.infoText).toBe("");
    expect(initialState.infoDate).toBe("");
    expect(initialState.infoDspFlg).toBe("1");
  });

  it("No.5-2 検索条件状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomSPT010.searchAndSortState, {
      sortColumn: "info_date",
      sortOrder: "DESC",
      infoText: "テスト",
      infoDate: "2024-01-15",
      infoDspFlg: "0",
    });

    const updatedState = store.get(AtomSPT010.searchAndSortState);
    expect(updatedState.sortColumn).toBe("info_date");
    expect(updatedState.sortOrder).toBe("DESC");
    expect(updatedState.infoText).toBe("テスト");
    expect(updatedState.infoDate).toBe("2024-01-15");
    expect(updatedState.infoDspFlg).toBe("0");
  });

  it("No.5-3 お知らせリスト状態が正しく初期化される", () => {
    const store = getDefaultStore();
    store.set(AtomSPT010.oshiraseListState, []);
    const initialState = store.get(AtomSPT010.oshiraseListState);

    expect(initialState).toEqual([]);
  });

  it("No.5-4 お知らせリスト状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testData: AtomSPT010.oshiraseListInterface[] = [
      {
        info_id: "1",
        info_text: "テストお知らせ",
        info_date: "2024-01-15",
        info_link: "https://example.com",
        unyou_id: "1",
        file_path: "/files/test.pdf",
        dsp_flg: "1",
      },
    ];

    // 状態を更新
    store.set(AtomSPT010.oshiraseListState, testData);

    const updatedState = store.get(AtomSPT010.oshiraseListState);
    expect(updatedState).toEqual(testData);
    expect(updatedState[0].info_text).toBe("テストお知らせ");
  });
});

/**
 * SPT010_お知らせ管理画面_API通信
 *
 */
describe("No.6 お知らせ管理API通信", () => {
  const dummyRequest = {
    sortColumn: "",
    sortOrder: "ASC",
    infoText: "",
    infoDate: "",
    infoDspFlg: "1",
  };
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.6-1 お知らせデータ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockOshiraseData);

    const result = await Api.post(
      "/SPT010/searchOshiraseData",
      mockSetMessage,
      dummyRequest
    );

    expect(result).toEqual(mockOshiraseData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/SPT010/searchOshiraseData",
      mockSetMessage,
      dummyRequest
    );
  });

  it("No.6-2 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost(
        "/SPT010/searchOshiraseData",
        mockSetMessage,
        dummyRequest
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.6-3 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT010 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    expect(screen.queryByTestId("spt010-loading-gif")).toBeInTheDocument();     // Loading componentのgif画像
  });
});
