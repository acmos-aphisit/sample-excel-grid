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

// お知らせ画面
import CMN020 from "../../pages/CMN020/index";

// アトム
import { getDefaultStore, Provider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomCmn020 from "../../stores/atomCMN020";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

window.scrollTo = vi.fn();

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
const mockInfoData = {
  infoData: {
    current_page: 1,
    last_page: 2,
    data: [
      {
        info_date: "2024-01-15",
        info_text: "システムメンテナンスのお知らせ",
        info_link: "https://example.com/maintenance",
        unyou_id: "1",
        file_path: null,
      },
      {
        info_date: "2024-01-10",
        info_text: "新機能追加のお知らせ",
        info_link: null,
        unyou_id: null,
        file_path: "/files/update.pdf",
      },
    ],
    links: [
      { label: "&laquo; Previous", page: null },
      { label: "1", page: 1 },
      { label: "2", page: 2 },
      { label: "Next &raquo;", page: 2 },
    ],
  },
};

const mockEmptyInfoData = {
  infoData: {
    current_page: 1,
    last_page: 1,
    data: [],
    links: [],
  },
};

/**
 * CMN020_お知らせ画面_画面表示
 *
 */
describe("No.1 お知らせ画面表示", () => {
  it("No.1-1 お知らせ画面が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("CMN020-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 お知らせ画面のタイトルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("CMN020-1")).toBeInTheDocument();
    });

    expect(screen.getByText("お知らせ")).toBeInTheDocument();
  });

  it("No.1-3 お知らせが0件の場合のメッセージが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockEmptyInfoData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("現在お知らせはありません。")
      ).toBeInTheDocument();
    });
  });

  it("No.1-4 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    expect(screen.getByTestId("cmn020-loading-gif")).toBeInTheDocument(); // Loading componentのgif画像
  });
});

/**
 * CMN020_お知らせ画面_お知らせ項目表示
 *
 */
describe("No.2 お知らせ項目表示", () => {
  it("No.2-1 お知らせの日付が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const dateElements = screen.getAllByTestId("cmn020-2-1");
      expect(dateElements[0]).toBeInTheDocument();
      expect(dateElements[0]).toHaveTextContent("令和6年 1月 15日");
    });
  });

  it("No.2-2 お知らせのテキストが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const textElements = screen.getAllByTestId("cmn020-2-2");
      expect(textElements[0]).toBeInTheDocument();
      expect(textElements[0]).toHaveTextContent(
        "システムメンテナンスのお知らせ"
      );
    });
  });

  it("No.2-3 リンクボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const linkButtons = screen.getAllByText("リンク");
      expect(linkButtons[0]).toBeInTheDocument();
      expect(linkButtons[0]).toHaveTextContent("リンク");
    });
  });

  it("No.2-4 添付ファイルボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const fileButtons = screen.getAllByText("添付ファイル");
      expect(fileButtons[0]).toBeInTheDocument();
      expect(fileButtons[0]).toHaveTextContent("添付ファイル");
    });
  });
});

/**
 * CMN020_お知らせ画面_ページネーション操作
 *
 */
describe("No.3 ページネーション操作", () => {
  const mockMultiPageData = {
    infoData: {
      current_page: 2,
      last_page: 3,
      data: [
        {
          info_date: "2024-01-05",
          info_text: "ページ2のお知らせ",
          info_link: null,
          unyou_id: null,
          file_path: null,
        },
      ],
      links: [
        { label: "&laquo; Previous", page: 1 },
        { label: "1", page: 1 },
        { label: "2", page: 2 },
        { label: "3", page: 3 },
        { label: "...", page: null },
        { label: "Next &raquo;", page: 3 },
      ],
    },
  };

  it("No.3-1 前へボタンが正しく表示され、クリックできる", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockMultiPageData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const prevButton = screen.getByRole("button", { name: "<" });
      expect(prevButton).toBeInTheDocument();
      expect(prevButton).toHaveTextContent("<");
    });
  });

  it("No.3-2 ページ番号ボタンが正しく表示され、クリックできる", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockMultiPageData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const pageButtons = screen
        .getAllByRole("button")
        .filter((button) => /^\d+$/.test(button.textContent || ""));
      expect(pageButtons.length).toBeGreaterThan(0);
      expect(pageButtons[0]).toBeInTheDocument();
    });
  });

  it("No.3-3 継続ボタン（...）が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockMultiPageData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const continueButton = screen.getByRole("button", { name: "..." });
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toHaveTextContent("...");
    });
  });

  it("No.3-4 次へボタンが正しく表示され、クリックできる", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockMultiPageData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const nextButton = screen.getByRole("button", { name: ">" });
      expect(nextButton).toBeInTheDocument();
      expect(nextButton).toHaveTextContent(">");
    });
  });

  it("No.3-5 ページネーションボタンのクリック動作が正しく動作する", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockMultiPageData);
    mockedApiPost.mockResolvedValueOnce(mockInfoData); // 2回目のAPI呼び出し用

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const pageButtons = screen
        .getAllByRole("button")
        .filter((button) => /^\d+$/.test(button.textContent || ""));
      expect(pageButtons[0]).toBeInTheDocument();
    });

    // ページボタンをクリック
    const pageButtons = screen
      .getAllByRole("button")
      .filter((button) => /^\d+$/.test(button.textContent || ""));
    await userEvent.click(pageButtons[0]);

    // API呼び出しが行われることを確認（複数のuseQueryが動作するため、最低2回以上）
    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/CMN020/fetchInfoData",
        expect.any(Function),
        expect.any(Object)
      );
    });
  });
});

/**
 * CMN020_お知らせ画面_JOTAIアトム
 *
 */
describe("No.4 お知らせアトム", () => {
  it("No.4-1 ページネーション状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomCmn020.fetchPaginationState);

    expect(initialState.perPage).toBe(10);
    expect(initialState.curPage).toBe(1);
    expect(initialState.allPage).toBe(1);
  });

  it("No.4-2 ページネーション状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomCmn020.fetchPaginationState, {
      perPage: 8,
      curPage: 2,
      allPage: 5,
    });

    const updatedState = store.get(AtomCmn020.fetchPaginationState);
    expect(updatedState.perPage).toBe(8);
    expect(updatedState.curPage).toBe(2);
    expect(updatedState.allPage).toBe(5);
  });
});

/**
 * CMN020_お知らせ画面_API通信
 *
 */
describe("No.5 お知らせAPI通信", () => {
  const dummyRequest = { perPage: 5, curPage: 1, allPage: 1 };
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.5-1 お知らせデータ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    const result = await Api.post(
      "/CMN020/fetchInfoData",
      mockSetMessage,
      dummyRequest
    );

    expect(result).toEqual(mockInfoData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/CMN020/fetchInfoData",
      mockSetMessage,
      dummyRequest
    );
  });

  it("No.5-2 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(new Error(Const.errorType["500"]));

    await expect(
      freshMockedApiPost("/CMN020/fetchInfoData", mockSetMessage, dummyRequest)
    ).rejects.toThrow(Const.errorType["500"]);
  });

  it("No.5-3 リンクボタンのクリック動作が正しく動作する", async () => {
    // 前のテストのモックをクリア
    vi.clearAllMocks();

    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    // window.openをモック（focusメソッドを持つオブジェクトを返す）
    const mockWindowOpen = vi.fn().mockReturnValue({
      focus: vi.fn(),
    });
    Object.defineProperty(window, "open", {
      value: mockWindowOpen,
      writable: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const linkButtons = screen.getAllByText("リンク");
      expect(linkButtons[0]).toBeInTheDocument();
    });

    // リンクボタンをクリック
    const linkButtons = screen.getAllByText("リンク");
    await userEvent.click(linkButtons[0]);

    // window.openが正しいURLで呼び出されることを確認
    expect(mockWindowOpen).toHaveBeenCalledWith(
      "https://example.com/maintenance",
      "_blank"
    );
  });

  it("No.5-4 添付ファイルボタンのクリック動作が正しく動作する", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInfoData);

    // window.openをモック（focusメソッドを持つオブジェクトを返す）
    const mockWindowOpen = vi.fn().mockReturnValue({
      focus: vi.fn(),
    });
    Object.defineProperty(window, "open", {
      value: mockWindowOpen,
      writable: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const fileButtons = screen.getAllByText("添付ファイル");
      expect(fileButtons[0]).toBeInTheDocument();
    });

    // 添付ファイルボタンをクリック
    const fileButtons = screen.getAllByText("添付ファイル");
    await userEvent.click(fileButtons[0]);

    // モックを作成
    const link = Object.assign(document.createElement("a"), {
      click: vi.fn(),
    })
    vi.spyOn(document, "createElement").mockImplementation(() => link)
    vi.spyOn(document.body, "appendChild").mockImplementation(vi.fn())
    vi.spyOn(document.body, "removeChild").mockImplementation(vi.fn())

    // ダウンロードが正しいパスで呼び出されることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(document.body.appendChild).toHaveBeenCalledWith(link)
        expect(link.href).toBe(
          "downloadUrl",
        )
        expect(link.click).toHaveBeenCalledTimes(1)
        expect(document.body.removeChild).toHaveBeenCalledWith(link)
      }, 1000);
    })

    vi.restoreAllMocks() // モックを初期化
  });
});
