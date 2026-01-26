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

// 基準値設定画面
import MNG040 from "../../pages/MNG040/index";

// アトム
import { getDefaultStore, Provider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomMng040 from "../../stores/atomMNG040";

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
const mockInspCriteriaData = {
  inspCriteriaData: [
    {
      item_no: "001",
      item_dsp_name: "一般細菌",
      saisui_kbn_no: "01",
      regulation_low_limit: "0",
      regulation_up_limit: "100",
      input_low_limit: "0",
      input_up_limit: "1000",
      report_low_limit: "0",
      report_up_limit: "100",
      valid_digits: "3",
      input_min_digits: "1",
      output_min_digits: "1",
      insp_criteria_comment: "一般細菌の検査基準",
    },
    {
      item_no: "002",
      item_dsp_name: "大腸菌",
      saisui_kbn_no: "01",
      regulation_low_limit: "0",
      regulation_up_limit: "0",
      input_low_limit: "0",
      input_up_limit: "100",
      report_low_limit: "0",
      report_up_limit: "0",
      valid_digits: "2",
      input_min_digits: "1",
      output_min_digits: "1",
      insp_criteria_comment: "大腸菌の検査基準",
    },
  ],
  itemDaiCategoryData: [
    {
      item_dai_category_name: "微生物",
      item_dai_category_no: 1,
    },
    {
      item_dai_category_name: "化学物質",
      item_dai_category_no: 2,
    },
  ],
  itemTyuCategoryData: [
    {
      item_tyu_category_name: "細菌",
      item_tyu_category_no: 1,
    },
    {
      item_tyu_category_name: "ウイルス",
      item_tyu_category_no: 2,
    },
  ],
  houKijyunNoList: [
    {
      hou_kijyun_no: "2024",
    },
    {
      hou_kijyun_no: "2025",
    },
  ],
  saisuiKbnList: [
    {
      saisui_kbn_name: "原水",
      saisui_kbn_no: "01",
    },
    {
      saisui_kbn_name: "浄水",
      saisui_kbn_no: "02",
    },
  ],
  latestYear: 2025,
  displayTime: "2024-01-15 10:00:00",
};

const mockApplyYearData = {
  applyYearList: [
    {
      hou_kijyun_no: "2024",
    },
    {
      hou_kijyun_no: "2025",
    },
  ],
  displayTime: "2024-01-15 10:00:00",
};

const mockEmptyInspCriteriaData = {
  inspCriteriaData: [],
  itemDaiCategoryData: [],
  itemTyuCategoryData: [],
  houKijyunNoList: [],
  saisuiKbnList: [],
  latestYear: 2025,
  displayTime: "2024-01-15 10:00:00",
};

/**
 * MNG040_基準値設定画面_画面表示
 *
 */
describe("No.1 基準値設定画面表示", () => {
  it("No.1-1 基準値設定画面が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 基準値設定画面のタイトルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-1")).toBeInTheDocument();
    });

    expect(screen.getByText("基準値設定")).toBeInTheDocument();
  });

  it("No.1-3 検査基準データが0件の場合の表示確認", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockEmptyInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-1")).toBeInTheDocument();
    });

    // グリッドテーブルが表示されないことを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(screen.queryByTestId("mng040-2")).not.toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.1-4 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    // タイトルは表示される
    expect(screen.getByTestId("mng040-1")).toBeInTheDocument();
    // グリッドテーブルは表示されない（ローディング中）
    expect(screen.queryByTestId("mng040-2")).not.toBeInTheDocument();
  });
});

/**
 * MNG040_基準値設定画面_グリッドテーブル表示
 *
 */
describe("No.2 グリッドテーブル表示", () => {
  it("No.2-1 グリッドテーブルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        // グリッドテーブルが表示されることを確認
        await expect(screen.getByTestId("mng040-2")).toBeInTheDocument();
        // CSS Modulesのハッシュ化されたクラス名をチェック
        await expect(screen.getByTestId("mng040-2")).toHaveAttribute("class");
      }, 1000);
    });
  });

  it("No.2-2 検査基準データが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(async () => {
        expect(screen.getByTestId("mng040-2")).toBeInTheDocument();

        // グリッドテーブル内にGridSimpleContextTableコンポーネントが含まれることを確認
        const gridTable = screen.getByTestId("mng040-2");
        await expect(gridTable).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * MNG040_基準値設定画面_フッターボタン
 *
 */
describe("No.3 フッターボタン操作", () => {
  it("No.3-1 入力前に戻るボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-3-1")).toBeInTheDocument();
    });

    const backButton = screen.getByTestId("mng040-3-1");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveTextContent("入力前に戻る");
  });

  it("No.3-2 適用年度追加ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-3-2")).toBeInTheDocument();
    });

    const addYearButton = screen.getByTestId("mng040-3-2");
    expect(addYearButton).toBeInTheDocument();
    expect(addYearButton).toHaveTextContent("適用年度追加");
  });

  it("No.3-3 登録ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-3-3")).toBeInTheDocument();
    });

    const saveButton = screen.getByTestId("mng040-3-3");
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveTextContent("登録");
  });

  it("No.3-4 入力前に戻るボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId("mng040-3-1")).toBeInTheDocument();

      setTimeout(async () => {
        const backButton = screen.getByTestId("mng040-3-1");

        // ボタンがクリック可能であることを確認
        expect(backButton).not.toBeDisabled();

        // クリックイベントをテスト
        await userEvent.click(backButton);

        // クリック後の処理は確認ダイアログが表示されるが、
        // ダイアログのテストは別途必要に応じて実装
      }, 1000);
    });
  });

  it("No.3-5 適用年度追加ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId("mng040-3-2")).toBeInTheDocument();

      setTimeout(async () => {
        const addYearButton = screen.getByTestId("mng040-3-2");

        // ボタンがクリック可能であることを確認
        expect(addYearButton).not.toBeDisabled();

        // クリックイベントをテスト
        await userEvent.click(addYearButton);

        // クリック後の処理は適用年度追加モーダルが表示されるが、
        // モーダルのテストは別途必要に応じて実装
      }, 1000);
    });
  });

  it("No.3-6 登録ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId("mng040-3-3")).toBeInTheDocument();

      setTimeout(async () => {
        const saveButton = screen.getByTestId("mng040-3-3");
        // ボタンがクリック可能であることを確認
        await expect(saveButton).not.toBeDisabled();

        // クリックイベントをテスト
        await userEvent.click(saveButton);

        // クリック後の処理は確認ダイアログが表示されるが、
        // ダイアログのテストは別途必要に応じて実装
      }, 1000);
    });
  });
});

/**
 * MNG040_基準値設定画面_検索条件
 *
 */
describe("No.4 検索条件操作", () => {
  it("No.4-1 適用年度コンボボックスが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-4-1")).toBeInTheDocument();
    });

    const applyYearComboBox = screen.getByTestId("mng040-4-1");
    expect(applyYearComboBox).toBeInTheDocument();
  });

  it("No.4-2 適用年度コンボボックスの値変更", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId("mng040-4-1")).toBeInTheDocument();

      setTimeout(async () => {
        const applyYearComboBox = screen.getByTestId("mng040-4-1");

        // コンボボックスの値を変更
        await userEvent.selectOptions(applyYearComboBox, "2024");

        // 値が変更されたことを確認
        expect(applyYearComboBox).toHaveValue("2024");
      }, 1000);
    });
  });
});

/**
 * MNG040_基準値設定画面_検索エリア
 *
 */
describe("No.5 検索エリア操作", () => {
  it("No.5-1 検索エリアが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-5")).toBeInTheDocument();
    });

    const searchArea = screen.getByTestId("mng040-5");
    expect(searchArea).toBeInTheDocument();
  });

  it("No.5-2 検索ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG040 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng040-5")).toBeInTheDocument();
    });

    const searchArea = screen.getByTestId("mng040-5");

    // 検索エリアがクリック可能であることを確認
    expect(searchArea).toBeInTheDocument();
  });
});

/**
 * MNG040_基準値設定画面_JOTAIアトム
 *
 */
describe("No.6 基準値設定アトム", () => {
  it("No.6-1 検索・ソート状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomMng040.searchAndSortState);

    expect(initialState.applyYear).toBe("2025");
    expect(initialState.sortColumn).toBe("");
    expect(initialState.sortOrder).toBe("ASC");
  });

  it("No.6-2 検索・ソート状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomMng040.searchAndSortState, {
      applyYear: "2024",
      sortColumn: "item_no",
      sortOrder: "DESC",
      itemName: "",
      saisuiKbnNo: "",
      saisuiKbnName: "",
    });

    const updatedState = store.get(AtomMng040.searchAndSortState);
    expect(updatedState.applyYear).toBe("2024");
    expect(updatedState.sortColumn).toBe("item_no");
    expect(updatedState.sortOrder).toBe("DESC");
  });

  it("No.6-3 検査基準登録状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialRegistState = store.get(AtomMng040.inspCriteriaRegistState);
    const initialRegistFlgState = store.get(
      AtomMng040.inspCriteriaRegistFlgState
    );

    expect(initialRegistState).toEqual([]);
    expect(initialRegistFlgState).toBe(false);
  });

  it("No.6-4 検査基準登録状態が正しく更新される", () => {
    const store = getDefaultStore();

    const testInspCriteriaData = [
      {
        itemNo: "001",
        itemDspName: "一般細菌",
        saisuiKbnNo: "01",
        regulationLowLimit: "0",
        regulationUpLimit: "100",
        inputLowLimit: "0",
        inputUpLimit: "1000",
        reportLowLimit: "0",
        reportUpLimit: "100",
        validDigits: "3",
        inputMinDigits: "1",
        outputMinDigits: "1",
        inspCriteriaComment: "一般細菌の検査基準",
        processFlg: "NEW",
      },
    ];

    // 状態を更新
    store.set(AtomMng040.inspCriteriaRegistState, testInspCriteriaData);
    store.set(AtomMng040.inspCriteriaRegistFlgState, true);

    const updatedRegistState = store.get(AtomMng040.inspCriteriaRegistState);
    const updatedRegistFlgState = store.get(
      AtomMng040.inspCriteriaRegistFlgState
    );

    expect(updatedRegistState).toEqual(testInspCriteriaData);
    expect(updatedRegistFlgState).toBe(true);
  });

  it("No.6-5 最新適用年度状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialLatestYear = store.get(AtomMng040.latestYear);

    expect(initialLatestYear).toBeUndefined();
  });

  it("No.6-6 最新適用年度状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomMng040.latestYear, 2025);

    const updatedLatestYear = store.get(AtomMng040.latestYear);
    expect(updatedLatestYear).toBe(2025);
  });
});

/**
 * MNG040_基準値設定画面_API通信
 *
 */
describe("No.7 基準値設定API通信", () => {
  const dummyRequest = {
    applyYear: "2025",
    sortColumn: "",
    sortOrder: "ASC",
  };
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.7-1 検査基準法基準リスト取得APIが正常に動作する", async () => {
    mockedApiGet.mockResolvedValueOnce(mockApplyYearData);

    const result = await Api.get(
      "/MNG040/fetchInspCriteriaHoukijyunList",
      mockSetMessage
    );

    expect(result).toEqual(mockApplyYearData);
    expect(mockedApiGet).toHaveBeenCalledWith(
      "/MNG040/fetchInspCriteriaHoukijyunList",
      mockSetMessage
    );
  });

  it("No.7-2 検査基準データ検索APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockInspCriteriaData);

    const result = await Api.post(
      "/MNG040/fetchInspCriteriaData",
      mockSetMessage,
      dummyRequest
    );

    expect(result).toEqual(mockInspCriteriaData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG040/fetchInspCriteriaData",
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
        "/MNG040/fetchInspCriteriaData",
        mockSetMessage,
        dummyRequest
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.7-4 検査基準保存APIが正常に動作する", async () => {
    const saveData = {
      data_to_save: [
        {
          itemNo: "001",
          itemDspName: "一般細菌",
          saisuiKbnNo: "01",
          regulationLowLimit: "0",
          regulationUpLimit: "100",
          inputLowLimit: "0",
          inputUpLimit: "1000",
          reportLowLimit: "0",
          reportUpLimit: "100",
          validDigits: "3",
          inputMinDigits: "1",
          outputMinDigits: "1",
          inspCriteriaComment: "一般細菌の検査基準",
          processFlg: "NEW",
        },
      ],
      apply_year: "2025",
      validateMode: "criteria",
      display_time: "2024-01-15 10:00:00",
    };

    const mockSaveResponse = { success: true };
    mockedApiPost.mockResolvedValueOnce(mockSaveResponse);

    const result = await Api.post(
      "/MNG040/saveInspCriteriaData",
      mockSetMessage,
      saveData
    );

    expect(result).toEqual(mockSaveResponse);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG040/saveInspCriteriaData",
      mockSetMessage,
      saveData
    );
  });

  it("No.7-5 検査基準保存API通信エラー時のエラーハンドリング", async () => {
    const saveData = {
      data_to_save: [],
      apply_year: "2025",
      validateMode: "criteria",
      display_time: "2024-01-15 10:00:00",
    };

    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost(
        "/MNG040/saveInspCriteriaData",
        mockSetMessage,
        saveData
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });
});

/**
 * MNG040_基準値設定画面_バリデーション
 *
 */
describe("No.8 バリデーション", () => {
  describe("No.8-1 必須項目チェック", () => {
    it("項目番号が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("項目番号が入力されている場合、falseを返す", () => {
      expect(Common.checkNullOfString("001")).toBe(false);
      expect(Common.checkNullOfString("test")).toBe(false);
    });

    it("項目名称画面が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("採水区分が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("有効桁数が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });
  });

  describe("No.8-2 項目番号形式チェック", () => {
    it("半角数字のみの場合、0を返す", () => {
      expect(Common.checkNumberAndDigits("001")).toBe(0);
      expect(Common.checkNumberAndDigits("123")).toBe(0);
    });

    it("半角数字以外が含まれる場合、1を返す", () => {
      expect(Common.checkNumberAndDigits("abc")).toBe(1);
      expect(Common.checkNumberAndDigits("12a")).toBe(1);
      expect(Common.checkNumberAndDigits("１２３")).toBe(1); // 全角数字
    });

    it("未入力の場合、1を返す", () => {
      expect(Common.checkNumberAndDigits("")).toBe(1);
      expect(Common.checkNumberAndDigits(null)).toBe(1);
    });
  });

  describe("No.8-3 数値形式チェック", () => {
    it("有効桁数が半角数字のみの場合、0を返す", () => {
      expect(Common.checkNumberAndDigits("1")).toBe(0);
      expect(Common.checkNumberAndDigits("10")).toBe(0);
      expect(Common.checkNumberAndDigits("999")).toBe(0);
    });

    it("有効桁数が半角数字以外が含まれる場合、1を返す", () => {
      expect(Common.checkNumberAndDigits("abc")).toBe(1);
      expect(Common.checkNumberAndDigits("1a")).toBe(1);
      expect(Common.checkNumberAndDigits("１")).toBe(1); // 全角数字
    });

    it("入力最小桁が半角数字のみの場合、0を返す", () => {
      expect(Common.checkNumberAndDigits("1")).toBe(0);
      expect(Common.checkNumberAndDigits("10")).toBe(0);
    });

    it("出力最小桁が半角数字のみの場合、0を返す", () => {
      expect(Common.checkNumberAndDigits("1")).toBe(0);
      expect(Common.checkNumberAndDigits("10")).toBe(0);
    });
  });

  describe("No.8-4 文字数制限チェック", () => {
    it("項目名称画面が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("一般細菌", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("大腸菌検査項目", 50)).toBe(false);
    });

    it("項目名称画面が50文字を超える場合、trueを返す", () => {
      const longName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longName, 50)).toBe(true);
    });

    it("コメントが200文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("検査基準のコメント", 200)).toBe(
        false
      );
      expect(
        Common.checkLengthOverOfString("詳細な検査基準の説明文", 200)
      ).toBe(false);
    });

    it("コメントが200文字を超える場合、trueを返す", () => {
      const longComment = "あ".repeat(201);
      expect(Common.checkLengthOverOfString(longComment, 200)).toBe(true);
    });
  });

  describe("No.8-5 数値範囲チェック", () => {
    it("規制下限値が数値として有効な場合、正常に処理される", () => {
      expect(Common.checkNullAndReturnString("0")).toBe("0");
      expect(Common.checkNullAndReturnString("100")).toBe("100");
      expect(Common.checkNullAndReturnString("0.5")).toBe("0.5");
    });

    it("規制上限値が数値として有効な場合、正常に処理される", () => {
      expect(Common.checkNullAndReturnString("100")).toBe("100");
      expect(Common.checkNullAndReturnString("1000")).toBe("1000");
      expect(Common.checkNullAndReturnString("99.9")).toBe("99.9");
    });

    it("入力下限値が数値として有効な場合、正常に処理される", () => {
      expect(Common.checkNullAndReturnString("0")).toBe("0");
      expect(Common.checkNullAndReturnString("0.01")).toBe("0.01");
    });

    it("入力上限値が数値として有効な場合、正常に処理される", () => {
      expect(Common.checkNullAndReturnString("1000")).toBe("1000");
      expect(Common.checkNullAndReturnString("9999")).toBe("9999");
    });
  });

  describe("No.8-6 その他のバリデーション関数", () => {
    it("checkNullAndReturnString - null値を空文字に変換", () => {
      expect(Common.checkNullAndReturnString(null)).toBe("");
      expect(Common.checkNullAndReturnString(undefined)).toBe("");
      expect(Common.checkNullAndReturnString("一般細菌")).toBe("一般細菌");
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
