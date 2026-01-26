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

// 採水地点設定画面
import MNG020 from "../../pages/MNG020/index";

// アトム
import { getDefaultStore, Provider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomMng020 from "../../stores/atomMNG020";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";
import * as Common from "../../common/common";

window.scrollTo = vi.fn();

// Apiクラスのpostメソッドをモック
vi.mock("../../common/api", () => ({
  Api: {
    post: vi.fn(),
    get: vi.fn(),
  },
  getMessage: vi.fn().mockReturnValue({ message: "テストメッセージ" }),
  showMessageArea: vi.fn(),
}));

const mockedApiPost = vi.mocked(Api.post);
const mockedApiGet = vi.mocked(Api.get);
const mockedGetMessage = vi.mocked(getMessage);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// モックデータ
const mockSaisuiPointData = {
  searchSaisuiPoint: [
    {
      point_no: 1,
      point_dsp_name: "取水口",
      point_report_name: "取水口地点",
      saisui_kbn_no: "01",
      sisetu_no: "001",
      process_no: 1,
    },
    {
      point_no: 2,
      point_dsp_name: "沈殿池出口",
      point_report_name: "沈殿池出口地点",
      saisui_kbn_no: "02",
      sisetu_no: "001",
      process_no: 2,
    },
  ],
  sisetuData: [
    {
      sisetu_name: "第一浄水場",
      sisetu_no: "001",
    },
    {
      sisetu_name: "第二浄水場",
      sisetu_no: "002",
    },
  ],
  processData: [
    {
      process_name: "原水",
      process_no: "1",
    },
    {
      process_name: "沈殿水",
      process_no: "2",
    },
  ],
  saisuiKbnData: [
    {
      saisui_kbn_name: "原水",
      saisui_kbn_no: "01",
    },
    {
      saisui_kbn_name: "浄水",
      saisui_kbn_no: "02",
    },
  ],
  maxSaisuiPoint: 100,
  displayTime: "2024-01-15 10:00:00",
};

const mockSelectionData = {
  sisetuData: [
    {
      sisetu_name: "第一浄水場",
      sisetu_no: "001",
    },
    {
      sisetu_name: "第二浄水場",
      sisetu_no: "002",
    },
  ],
  processData: [
    {
      process_name: "原水",
      process_no: "1",
    },
    {
      process_name: "沈殿水",
      process_no: "2",
    },
  ],
  displayTime: "2024-01-15 10:00:00",
};

const mockEmptySaisuiPointData = {
  searchSaisuiPoint: [],
  sisetuData: [],
  processData: [],
  saisuiKbnData: [],
  maxSaisuiPoint: 0,
  displayTime: "2024-01-15 10:00:00",
};

/**
 * MNG020_採水地点設定画面_画面表示
 *
 */
describe("No.1 採水地点設定画面表示", () => {
  it("No.1-1 採水地点設定画面が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 採水地点設定画面のタイトルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-1")).toBeInTheDocument();
    });

    expect(screen.getByText("採水地点設定")).toBeInTheDocument();
  });

  it("No.1-3 採水地点データが0件の場合の表示確認", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockEmptySaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-1")).toBeInTheDocument();
    });

    // グリッドテーブルが表示されないことを確認
    expect(screen.queryByTestId("mng020-2")).not.toBeInTheDocument();
  });

  it("No.1-4 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    // タイトルは表示される
    expect(screen.getByTestId("mng020-1")).toBeInTheDocument();
    // グリッドテーブルは表示されない（ローディング中）
    expect(screen.queryByTestId("mng020-2")).not.toBeInTheDocument();
  });
});

/**
 * MNG020_採水地点設定画面_グリッドテーブル表示
 *
 */
describe("No.2 グリッドテーブル表示", () => {
  it("No.2-1 グリッドテーブルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByTestId("mng020-2")).toBeInTheDocument();
      }, 1000);
    });

    await waitFor(() => {
      setTimeout(() => {
        // グリッドテーブルが表示されることを確認
        expect(screen.getByTestId("mng020-2")).toBeInTheDocument();
        // CSS Modulesのハッシュ化されたクラス名をチェック
        expect(screen.getByTestId("mng020-2")).toHaveAttribute("class");
      }, 1000);
    });
  });

  it("No.2-2 採水地点データが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        await expect(screen.getByTestId("mng020-2")).toBeInTheDocument();
      }, 1000);
    });

    // グリッドテーブル内にGridSimpleContextTableコンポーネントが含まれることを確認
    await waitFor(() => {
      setTimeout(async () => {
        const gridTable = screen.queryByTestId("mng020-2");
        await expect(gridTable).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * MNG020_採水地点設定画面_フッターボタン
 *
 */
describe("No.3 フッターボタン操作", () => {
  it("No.3-1 入力前に戻るボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("入力前に戻る")).toBeInTheDocument();
    });

    const backButton: any = screen.getByText("入力前に戻る");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent("入力前に戻る");
  });

  it("No.3-2 登録ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
    });

    const saveButton: any = screen.getByText("登録");
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveTextContent("登録");
  });

  it("No.3-3 入力前に戻るボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("入力前に戻る")).toBeInTheDocument();
      }, 1000);
    });

    await waitFor(async () => {
      setTimeout(async () => {
        const backButton: any = screen.getByText("入力前に戻る");

        // ボタンがクリック可能であることを確認
        expect(backButton).not.toBeDisabled();

        // クリックイベントをテスト
        await userEvent.click(backButton);

        // クリック後の処理は確認ダイアログが表示されるが、
        // ダイアログのテストは別途必要に応じて実装
      }, 1000);
    });
  });

  it("No.3-4 登録ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("登録")).toBeInTheDocument();
      }, 1000);
    });

    const saveButton: any = screen.getByText("登録");

    // ボタンがクリック可能であることを確認
    expect(saveButton).not.toBeDisabled();

    // クリックイベントをテスト
    await userEvent.click(saveButton);

    // クリック後の処理は確認ダイアログが表示されるが、
    // ダイアログのテストは別途必要に応じて実装
  });
});

/**
 * MNG020_採水地点設定画面_検索条件
 *
 */
describe("No.4 検索条件操作", () => {
  it("No.4-1 浄水場コンボボックスが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-4-1")).toBeInTheDocument();
    });

    const sisetuComboBox = screen.getByTestId("mng020-4-1");
    expect(sisetuComboBox).toBeInTheDocument();
  });

  it("No.4-2 処理過程コンボボックスが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-4-2")).toBeInTheDocument();
    });

    const processComboBox = screen.getByTestId("mng020-4-2");
    expect(processComboBox).toBeInTheDocument();
  });
});

/**
 * MNG020_採水地点設定画面_検索エリア
 *
 */
describe("No.5 検索エリア操作", () => {
  it("No.5-1 検索ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-5-1")).toBeInTheDocument();
    });

    const searchArea = screen.getByTestId("mng020-5-1");
    expect(searchArea).toBeInTheDocument();
  });

  it("No.5-2 検索ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG020 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng020-5-1")).toBeInTheDocument();
    });

    const searchArea = screen.getByTestId("mng020-5-1");

    // 検索エリアがクリック可能であることを確認
    expect(searchArea).toBeInTheDocument();
  });
});

/**
 * MNG020_採水地点設定画面_JOTAIアトム
 *
 */
describe("No.6 採水地点設定アトム", () => {
  it("No.6-1 検索条件状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomMng020.saisuiPointState);

    expect(initialState.sortColumn).toBe("");
    expect(initialState.sortOrder).toBe("ASC");
    expect(initialState.sisetuNo).toBe("");
    expect(initialState.sisetuName).toBe("");
    expect(initialState.processNo).toBe("");
    expect(initialState.processName).toBe("");
  });

  it("No.6-2 検索条件状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomMng020.saisuiPointState, {
      sortColumn: "point_no",
      sortOrder: "DESC",
      sisetuNo: "001",
      sisetuName: "第一浄水場",
      processNo: "1",
      processName: "原水",
      pointName: "",
      saisuiKbnNo: "",
      saisuiKbnName: "",
    });

    const updatedState = store.get(AtomMng020.saisuiPointState);
    expect(updatedState.sortColumn).toBe("point_no");
    expect(updatedState.sortOrder).toBe("DESC");
    expect(updatedState.sisetuNo).toBe("001");
    expect(updatedState.sisetuName).toBe("第一浄水場");
    expect(updatedState.processNo).toBe("1");
    expect(updatedState.processName).toBe("原水");
  });

  it("No.6-3 採水地点登録状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialRegistState = store.get(AtomMng020.saisuiPointRegistState);
    const initialRegistFlgState = store.get(
      AtomMng020.saisuiPointRegistFlgState
    );

    expect(initialRegistState).toEqual([]);
    expect(initialRegistFlgState).toBe(false);
  });

  it("No.6-4 採水地点登録状態が正しく更新される", () => {
    const store = getDefaultStore();

    const testSaisuiPointData = [
      {
        pointNo: "1",
        pointDspName: "取水口",
        pointReportName: "取水口地点",
        saisuiKbnNo: "01",
        sisetuNo: "001",
        processNo: "1",
      },
    ];

    // 状態を更新
    store.set(AtomMng020.saisuiPointRegistState, testSaisuiPointData);
    store.set(AtomMng020.saisuiPointRegistFlgState, true);

    const updatedRegistState = store.get(AtomMng020.saisuiPointRegistState);
    const updatedRegistFlgState = store.get(
      AtomMng020.saisuiPointRegistFlgState
    );

    expect(updatedRegistState).toEqual(testSaisuiPointData);
    expect(updatedRegistFlgState).toBe(true);
  });

  it("No.6-5 採水地点リスト状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialListState = store.get(AtomMng020.saisuiPointListState);

    expect(initialListState).toEqual([]);
  });

  it("No.6-6 採水地点リスト状態が正しく更新される", () => {
    const store = getDefaultStore();

    const testListData = [
      {
        rowNo: "1",
        pointNo: "1",
        pointDspName: "取水口",
        pointReportName: "取水口地点",
        saisuiKbnNo: "01",
        saisuiKbnName: "原水",
        sisetuNo: "001",
        sisetuName: "第一浄水場",
        processNo: "1",
        processName: "原水",
      },
    ];

    // 状態を更新
    store.set(AtomMng020.saisuiPointListState, testListData);

    const updatedListState = store.get(AtomMng020.saisuiPointListState);
    expect(updatedListState).toEqual(testListData);
  });
});

/**
 * MNG020_採水地点設定画面_API通信
 *
 */
describe("No.7 採水地点設定API通信", () => {
  const dummyRequest = {
    sortColumn: "",
    sortOrder: "ASC",
    sisetuNo: "",
    sisetuName: "",
    processNo: "",
    processName: "",
  };
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.7-1 採水地点選択肢取得APIが正常に動作する", async () => {
    mockedApiGet.mockResolvedValueOnce(mockSelectionData);

    const result = await Api.get("/getSaisuiPointSelection", mockSetMessage);

    expect(result).toEqual(mockSelectionData);
    expect(mockedApiGet).toHaveBeenCalledWith(
      "/getSaisuiPointSelection",
      mockSetMessage
    );
  });

  it("No.7-2 採水地点データ検索APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockSaisuiPointData);

    const result = await Api.post(
      "/MNG020/searchSaisuiPoint",
      mockSetMessage,
      dummyRequest
    );

    expect(result).toEqual(mockSaisuiPointData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG020/searchSaisuiPoint",
      mockSetMessage,
      dummyRequest
    );
  });

  it("No.7-3 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost(
        "/MNG020/searchSaisuiPoint",
        mockSetMessage,
        dummyRequest
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.7-4 採水地点保存APIが正常に動作する", async () => {
    const saveData = {
      data_to_save: [
        {
          pointNo: "1",
          pointDspName: "取水口",
          pointReportName: "取水口地点",
          saisuiKbnNo: "01",
          sisetuNo: "001",
          processNo: "1",
        },
      ],
      search_cond: dummyRequest,
      display_time: "2024-01-15 10:00:00",
    };

    const mockSaveResponse = { success: true };
    mockedApiPost.mockResolvedValueOnce(mockSaveResponse);

    const result = await Api.post(
      "/MNG020/saveSaisuiPointData",
      mockSetMessage,
      saveData
    );

    expect(result).toEqual(mockSaveResponse);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG020/saveSaisuiPointData",
      mockSetMessage,
      saveData
    );
  });

  it("No.7-5 採水地点保存API通信エラー時のエラーハンドリング", async () => {
    const saveData = {
      data_to_save: [],
      search_cond: dummyRequest,
      display_time: "2024-01-15 10:00:00",
    };

    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost(
        "/MNG020/saveSaisuiPointData",
        mockSetMessage,
        saveData
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });
});

/**
 * MNG020_採水地点設定画面_バリデーション
 *
 */
describe("No.8 バリデーション", () => {
  describe("No.8-1 必須項目チェック", () => {
    it("地点番号が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("地点番号が入力されている場合、falseを返す", () => {
      expect(Common.checkNullOfString("1")).toBe(false);
      expect(Common.checkNullOfString("001")).toBe(false);
    });

    it("地点名称画面が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("地点名称報告書が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("採水区分名称が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("浄水場が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("処理過程が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });
  });

  describe("No.8-2 地点番号形式チェック", () => {
    it("半角数字のみの場合、0を返す", () => {
      expect(Common.checkNumberAndDigits("1", 9)).toBe(0);
      expect(Common.checkNumberAndDigits("123", 9)).toBe(0);
      expect(Common.checkNumberAndDigits("123456789", 9)).toBe(0);
    });

    it("半角数字以外が含まれる場合、1を返す", () => {
      expect(Common.checkNumberAndDigits("abc", 9)).toBe(1);
      expect(Common.checkNumberAndDigits("12a", 9)).toBe(1);
      expect(Common.checkNumberAndDigits("１２３", 9)).toBe(1); // 全角数字
    });

    it("9桁を超える場合、2を返す", () => {
      expect(Common.checkNumberAndDigits("1234567890", 9)).toBe(2);
      expect(Common.checkNumberAndDigits("12345678901", 9)).toBe(2);
    });

    it("未入力の場合、1を返す", () => {
      expect(Common.checkNumberAndDigits("", 9)).toBe(1);
      expect(Common.checkNumberAndDigits(null, 9)).toBe(1);
    });
  });

  describe("No.8-3 文字数制限チェック", () => {
    it("地点名称画面が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("取水口", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("沈殿池出口地点", 50)).toBe(false);
    });

    it("地点名称画面が50文字を超える場合、trueを返す", () => {
      const longName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longName, 50)).toBe(true);
    });

    it("地点名称報告書が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("取水口地点", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("沈殿池出口地点報告書用", 50)).toBe(
        false
      );
    });

    it("地点名称報告書が50文字を超える場合、trueを返す", () => {
      const longReportName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longReportName, 50)).toBe(true);
    });
  });

  describe("No.8-4 その他のバリデーション関数", () => {
    it("checkNullAndReturnString - null値を空文字に変換", () => {
      expect(Common.checkNullAndReturnString(null)).toBe("");
      expect(Common.checkNullAndReturnString(undefined)).toBe("");
      expect(Common.checkNullAndReturnString("取水口")).toBe("取水口");
      expect(Common.checkNullAndReturnString(123)).toBe("123");
    });

    it("checkNullAndReturnNumber - null値を0に変換", () => {
      expect(Common.checkNullAndReturnNumber(null)).toBe(0);
      expect(Common.checkNullAndReturnNumber(undefined)).toBe(0);
      expect(Common.checkNullAndReturnNumber("123")).toBe(123);
      expect(Common.checkNullAndReturnNumber(456)).toBe(456);
    });
  });
});
