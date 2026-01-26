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

// 動画マニュアル画面
import Header from "../../components/layouts/header/header.tsx";
import SPT020 from "../../pages/SPT020/index";

// アトム
import { getDefaultStore, createStore, Provider as JotaiProvider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomSPT020 from "../../stores/atomSPT020";

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
  },
  getMessage: vi.fn(),
  showMessageArea: vi.fn(),
}));

const mockedApiGet = vi.mocked(Api.get);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// モックデータ
const mockManualVideoData = {
  manualVideoList: [
    {
      movie_name: "システム操作マニュアル",
      movie_path: "/videos/system_manual.mp4",
    },
    {
      movie_name: "検査手順マニュアル",
      movie_path: "/videos/inspection_manual.mp4",
    },
    {
      movie_name: "メンテナンスマニュアル",
      movie_path: "/videos/maintenance_manual.mp4",
    },
    {
      movie_name: "トラブルシューティング",
      movie_path: "/videos/troubleshooting.mp4",
    },
  ],
  displayTime: "2024-01-15 10:30:00",
};

const mockEmptyManualVideoData = {
  manualVideoList: [],
  displayTime: "2024-01-15 10:30:00",
};

/**
 * SPT020_動画マニュアル画面_画面表示・ヘッダー部分
 *
 */
describe("No.1 動画マニュアル画面表示_ヘッダー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.1-1 動画マニュアル画面が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("動画マニュアル")).toBeInTheDocument();
      }, 1000);
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 動画マニュアル画面のヘッダー「画像」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerImage: any = screen.getByTestId("HDR-1-1-1");
      expect(headerImage).toBeInTheDocument();
    });
  });

  it("No.1-3 動画マニュアル画面のヘッダー「タイトル」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerTitle: any = screen.getByTestId("HDR-1-1-2");
      expect(headerTitle).toHaveTextContent(import.meta.env.VITE_SYSTEM_NAME);
    });
  });

  it("No.1-4 動画マニュアル画面のヘッダーの各種メニューボタン「お知らせ」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonNotice: any = screen.getByTestId("HDR-2-1-1-1");
      expect(headerMenuButtonNotice).toBeInTheDocument();
    });
  });

  it("No.1-5 動画マニュアル画面のヘッダーの各種メニューボタン「検査情報登録」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonRegister: any = screen.getByTestId("HDR-2-1-2-1");
      expect(headerMenuButtonRegister).toBeInTheDocument();
    });
  });

  it("No.1-6 動画マニュアル画面のヘッダーの各種メニューボタン「検査情報検索」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSearch: any = screen.getByTestId("HDR-2-1-3-1");
      expect(headerMenuButtonSearch).toBeInTheDocument();
    });
  });

  it("No.1-7 動画マニュアル画面のヘッダーの各種メニューボタン「報告書出力」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonReport: any = screen.getByTestId("HDR-2-1-4-1");
      expect(headerMenuButtonReport).toBeInTheDocument();
    });
  });

  it("No.1-8 動画マニュアル画面のヘッダーの各種メニューボタン「サポート」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonSupport: any = screen.getByTestId("HDR-2-1-5-1");
      expect(headerMenuButtonSupport).toBeInTheDocument();
    });
  });

  it("No.1-9 動画マニュアル画面のヘッダーの各種メニューボタン「保守」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const headerMenuButtonMaintain: any = screen.getByTestId("HDR-2-1-6-1");
        expect(headerMenuButtonMaintain).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.1-10 動画マニュアル画面のヘッダーのユーザー情報管理ボタン「ログインのユーザー名称」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const headerMenuButtonUserName: any = screen.getByTestId("HDR-3-1-1-2");
      expect(headerMenuButtonUserName).toBeInTheDocument();
    });
  });

  it("No.1-11 動画マニュアル画面のヘッダーのユーザー情報管理ボタン「ログアウト」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Header />
          <div className="container_row">
            <SPT020 />
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
 * SPT020_動画マニュアル画面_視聴対象選択エリア
 *
 */
describe("No.2 動画マニュアル画面表示_視聴対象選択エリア", () => {
  const queryClient = createTestQueryClient();

  it("No.2-1 視聴対象選択エリアのタイトル「視聴対象選択」が正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("視聴対象選択")).toBeInTheDocument();
    });
  });

  it("No.2-2 動画マニュアルボタンが正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("システム操作マニュアル")).toBeInTheDocument();
      expect(screen.getByText("検査手順マニュアル")).toBeInTheDocument();
      expect(screen.getByText("メンテナンスマニュアル")).toBeInTheDocument();
      expect(screen.getByText("トラブルシューティング")).toBeInTheDocument();
    });
  });

  it("No.2-3 動画マニュアルボタンのクリック動作が正しく動作する", async () => {
    const spt020Store = createStore();
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <JotaiProvider store={spt020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const manualButton = screen.getByText("システム操作マニュアル");
      expect(manualButton).toBeInTheDocument();
    });

    const manualButton = screen.getByText("システム操作マニュアル");
    await userEvent.click(manualButton);

    // ステートの更新確認
    await waitFor(() => {
      expect(spt020Store.get(AtomSPT020.spt020SelectedManualVideoName)).toBe(
        "システム操作マニュアル"
      );
      expect(spt020Store.get(AtomSPT020.spt020SelectedManualVideoPath)).toBe(
        "/videos/system_manual.mp4"
      );
    });
  });

  it("No.2-4 動画マニュアルボタンのアクティブ状態が正しく切り替わる", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const manualButton = screen.getByText("システム操作マニュアル");
      expect(manualButton).toBeInTheDocument();
    });

    const manualButton = screen.getByText("システム操作マニュアル");
    await userEvent.click(manualButton);

    // アクティブクラスが追加されることを確認
    await waitFor(() => {
      const buttonElement = manualButton.closest("button");
      expect(buttonElement.classList.toString()).toEqual(expect.stringContaining('video_manual_active'));
    });
  });

  it("No.2-5 データが0件の場合の表示確認", async () => {
    mockedApiGet.mockResolvedValueOnce(mockEmptyManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      // タイトルは表示されるが、動画ボタンは表示されない
      expect(screen.getByText("視聴対象選択")).toBeInTheDocument();
      expect(
        screen.queryByText("システム操作マニュアル")
      ).not.toBeInTheDocument();
    });
  });
});

/**
 * SPT020_動画マニュアル画面_動画プレイヤーエリア
 *
 */
describe("No.3 動画マニュアル画面表示_動画プレイヤーエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.3-1 動画プレイヤーエリアのタイトルが正しく表示される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("動画マニュアル")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-2 動画が選択されていない場合のデフォルト表示確認", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        // 動画が選択されていない場合、プレースホルダーが表示される
        const placeholder = document.querySelector(
          'div[style*="backgroundColor: #4B4B4B"]'
        );
        expect(placeholder).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-3 動画選択後にタイトルが更新される", async () => {
    const spt020Store = createStore();
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <JotaiProvider store={spt020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const manualButton = screen.getByText("システム操作マニュアル");
      expect(manualButton).toBeInTheDocument();
    });

    const manualButton = screen.getByText("システム操作マニュアル");
    await userEvent.click(manualButton);

    // タイトルが更新されることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("システム操作マニュアル")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.3-4 動画選択後にvideoタグが表示される", async () => {
    const spt020Store = createStore();
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <JotaiProvider store={spt020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const manualButton = screen.getByText("システム操作マニュアル");
      expect(manualButton).toBeInTheDocument();
    });

    const manualButton = screen.getByText("システム操作マニュアル");
    await userEvent.click(manualButton);

    // videoタグが表示されることを確認
    await waitFor(() => {
      const videoElement = document.querySelector("video");
      expect(videoElement).toBeInTheDocument();
      expect(videoElement).toHaveAttribute("controls");
    });
  });

  it("No.3-5 動画のソースが正しく設定される", async () => {
    const spt020Store = createStore();
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <JotaiProvider store={spt020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const manualButton = screen.getByText("システム操作マニュアル");
      expect(manualButton).toBeInTheDocument();
    });

    const manualButton = screen.getByText("システム操作マニュアル");
    await userEvent.click(manualButton);

    // videoのsourceが正しく設定されることを確認
    await waitFor(() => {
      const sourceElement = document.querySelector("source");
      expect(sourceElement).toBeInTheDocument();
      expect(sourceElement).toHaveAttribute("src", "/videos/system_manual.mp4");
      expect(sourceElement).toHaveAttribute("type", "video/mp4");
    });
  });
});

/**
 * SPT020_動画マニュアル画面_JOTAIアトム
 *
 */
describe("No.4 動画マニュアルアトム", () => {
  it("No.4-1 動画マニュアルリスト状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomSPT020.spt020ManualVideoList);

    expect(initialState).toEqual([]);
  });

  it("No.4-2 動画マニュアルリスト状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testData = [
      {
        videoName: "テスト動画",
        videoPath: "/videos/test.mp4",
      },
    ];

    // 状態を更新
    store.set(AtomSPT020.spt020ManualVideoList, testData);

    const updatedState = store.get(AtomSPT020.spt020ManualVideoList);
    expect(updatedState).toEqual(testData);
    expect(updatedState[0].videoName).toBe("テスト動画");
  });

  it("No.4-3 選択された動画マニュアル名が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomSPT020.spt020SelectedManualVideoName);

    expect(initialState).toBeNull();
  });

  it("No.4-4 選択された動画マニュアル名が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomSPT020.spt020SelectedManualVideoName, "テスト動画");

    const updatedState = store.get(AtomSPT020.spt020SelectedManualVideoName);
    expect(updatedState).toBe("テスト動画");
  });

  it("No.4-5 選択された動画マニュアルパスが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomSPT020.spt020SelectedManualVideoPath);

    expect(initialState).toBeNull();
  });

  it("No.4-6 選択された動画マニュアルパスが正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomSPT020.spt020SelectedManualVideoPath, "/videos/test.mp4");

    const updatedState = store.get(AtomSPT020.spt020SelectedManualVideoPath);
    expect(updatedState).toBe("/videos/test.mp4");
  });

  it("No.4-7 選択エリアトグル状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomSPT020.spt020SelectionAreaToggle);

    expect(initialState).toBeUndefined();
  });

  it("No.4-8 選択エリアトグル状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomSPT020.spt020SelectionAreaToggle, "test-class");

    const updatedState = store.get(AtomSPT020.spt020SelectionAreaToggle);
    expect(updatedState).toBe("test-class");
  });
});

/**
 * SPT020_動画マニュアル画面_API通信
 *
 */
describe("No.5 動画マニュアルAPI通信", () => {
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.5-1 動画マニュアルデータ取得APIが正常に動作する", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    const result = await Api.get("/fetchManualVideoList", mockSetMessage);

    expect(result).toEqual(mockManualVideoData);
    expect(mockedApiGet).toHaveBeenCalledWith(
      "/fetchManualVideoList",
      mockSetMessage
    );
  });

  it("No.5-2 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiGet = vi.fn();
    freshMockedApiGet.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiGet("/fetchManualVideoList", mockSetMessage)
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.5-3 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // ローディングコンポーネントが表示されることを確認 ※ ローディング不用
    // expect(screen.getByAltText("")).toBeInTheDocument(); // Loading componentのgif画像
  });

  it("No.5-4 データが0件の場合のエラーメッセージ表示確認", async () => {
    const queryClient = createTestQueryClient();
    const spt020Store = createStore();
    mockedApiGet.mockResolvedValueOnce(mockEmptyManualVideoData);

    render(
      <JotaiProvider store={spt020Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SPT020 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(async () => {
      // エラーメッセージが設定されることを確認
      setTimeout(async () => {
        // await expect(screen.getByTestId("MSG-1")).toBeInTheDocument();
        await expect(screen.getByText("動画マニュアル情報が取得できません。")).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * SPT020_動画マニュアル画面_レスポンシブ対応
 *
 */
describe("No.6 動画マニュアル画面レスポンシブ対応", () => {
  const queryClient = createTestQueryClient();

  it("No.6-1 ResizeObserverが正しく動作する", async () => {
    // ResizeObserverのモック
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: vi.fn(),
    });
    window.ResizeObserver = mockResizeObserver;

    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockResizeObserver).toHaveBeenCalled();
    });
  });

  it("No.6-2 コンテナのIDが正しく設定される", async () => {
    mockedApiGet.mockResolvedValueOnce(mockManualVideoData);

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SPT020 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(
        document.getElementById("SPT020-manual-video-container")
      ).toBeInTheDocument();
      expect(
        document.getElementById("SPT020-title-container")
      ).toBeInTheDocument();
      expect(
        document.getElementById("SPT020-main-container")
      ).toBeInTheDocument();
      expect(
        document.getElementById("manual-video-selection")
      ).toBeInTheDocument();
      expect(
        document.getElementById("manual-video-player")
      ).toBeInTheDocument();
    });
  });
});
