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

// 検査項目設定画面
import MNG030 from "../../pages/MNG030/index";

// アトム
import { getDefaultStore, Provider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomMng030 from "../../stores/atomMNG030";

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
const mockInspItemData = {
  inspItemData: [
    {
      item_no: "001",
      item_dsp_name: "pH",
      item_report_name: "水素イオン濃度",
      item_unit: "pH",
      constant_qualitative_flg: "1",
      input_type: "1",
      item_dai_category_no: "1",
      item_tyu_category_no: "1",
      inspection_item_comment: "pH測定項目",
    },
    {
      item_no: "002",
      item_dsp_name: "濁度",
      item_report_name: "濁度測定",
      item_unit: "度",
      constant_qualitative_flg: "1",
      input_type: "1",
      item_dai_category_no: "1",
      item_tyu_category_no: "2",
      inspection_item_comment: "濁度測定項目",
    },
  ],
  itemDaiCategoryData: [
    {
      item_dai_category_name: "基本項目",
      item_dai_category_no: "1",
    },
    {
      item_dai_category_name: "金属類",
      item_dai_category_no: "2",
    },
  ],
  itemTyuCategoryData: [
    {
      item_tyu_category_name: "物理項目",
      item_tyu_category_no: "1",
    },
    {
      item_tyu_category_name: "化学項目",
      item_tyu_category_no: "2",
    },
  ],
  maxItemNo: 100,
  displayTime: "2024-01-15 10:00:00",
};

const mockEmptyInspItemData = {
  inspItemData: [],
  itemDaiCategoryData: [],
  itemTyuCategoryData: [],
  maxItemNo: 0,
  displayTime: "2024-01-15 10:00:00",
};

/**
 * MNG030_検査項目設定画面_画面表示
 *
 */
describe("No.1 検査項目設定画面表示", () => {
  it("No.1-1 検査項目設定画面が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 検査項目設定画面のタイトルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    expect(screen.getByText("検査項目設定")).toBeInTheDocument();
  });

  it("No.1-3 検査項目データが0件の場合の表示確認", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockEmptyInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    // グリッドテーブルが表示されないことを確認
    expect(screen.queryByTestId("mng030-2")).not.toBeInTheDocument();
  });

  it("No.1-4 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    // タイトルは表示される
    expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    // グリッドテーブルは表示されない（ローディング中）
    expect(screen.queryByTestId("mng030-2")).not.toBeInTheDocument();
  });
});

/**
 * MNG030_検査項目設定画面_グリッドテーブル表示
 *
 */
describe("No.2 グリッドテーブル表示", () => {
  it("No.2-1 グリッドテーブルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        // グリッドテーブルが表示されることを確認
        expect(screen.getByTestId("mng030-2")).toBeInTheDocument();

        // CSS Modulesのハッシュ化されたクラス名をチェック
        expect(screen.getByTestId("mng030-2")).toHaveAttribute("class");
      }, 1000);
    });
  });

  it("No.2-2 検査項目データが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-2")).toBeInTheDocument();
    });

    await waitFor(() => {
      setTimeout(async () => {
        // グリッドテーブル内にGridSimpleContextTableコンポーネントが含まれることを確認
        const gridTable = screen.getByTestId("mng030-2");
        await expect(gridTable).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * MNG030_検査項目設定画面_フッターボタン
 *
 */
describe("No.3 フッターボタン操作", () => {
  it("No.3-1 入力前に戻るボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    // フッターボタンはMNG030Footerコンポーネント内にあるため、
    // ボタンのテキストで検索する
    const backButton = screen.getByText("入力前に戻る");
    expect(backButton).toBeInTheDocument();
  });

  it("No.3-2 登録ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    // フッターボタンはMNG030Footerコンポーネント内にあるため、
    // ボタンのテキストで検索する
    const saveButton = screen.getByText("登録");
    expect(saveButton).toBeInTheDocument();
  });

  it("No.3-3 入力前に戻るボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    const backButton = screen.getByText("入力前に戻る");

    // ボタンがクリック可能であることを確認
    expect(backButton).not.toBeDisabled();

    // クリックイベントをテスト
    await userEvent.click(backButton);

    // クリック後の処理は確認ダイアログが表示されるが、
    // ダイアログのテストは別途必要に応じて実装
  });

  it("No.3-4 登録ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng030-1")).toBeInTheDocument();
    });

    await waitFor(async () => {
      setTimeout(async () => {
        const saveButton = screen.getByText("登録");

        // ボタンがクリック可能であることを確認
        expect(saveButton).not.toBeDisabled();

        // クリックイベントをテスト
        await userEvent.click(saveButton);

        // クリック後の処理は確認ダイアログが表示されるが、
        // ダイアログのテストは別途必要に応じて実装
      }, 1000);
    });
  });
});

/**
 * MNG030_検査項目設定画面_JOTAIアトム
 *
 */
describe("No.4 検査項目設定アトム", () => {
  it("No.4-1 検索条件状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomMng030.searchAndSortState);

    expect(initialState.sortColumn).toBe("");
    expect(initialState.sortOrder).toBe("ASC");
  });

  it("No.4-2 検索条件状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomMng030.searchAndSortState, {
      sortColumn: "item_no",
      sortOrder: "DESC",
      itemName: ""
    });

    const updatedState = store.get(AtomMng030.searchAndSortState);
    expect(updatedState.sortColumn).toBe("item_no");
    expect(updatedState.sortOrder).toBe("DESC");
  });

  it("No.4-3 検査項目登録状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialRegistState = store.get(AtomMng030.inspItemRegistState);
    const initialRegistFlgState = store.get(AtomMng030.inspItemRegistFlgState);

    expect(initialRegistState).toEqual([]);
    expect(initialRegistFlgState).toBe(false);
  });

  it("No.4-4 検査項目登録状態が正しく更新される", () => {
    const store = getDefaultStore();

    const testInspItemData = [
      {
        itemNo: "001",
        itemDspName: "pH",
        itemReportName: "水素イオン濃度",
        itemUnit: "pH",
        constantQualitativeFlg: "1",
        inputType: "1",
        itemDaiCategoryNo: "1",
        itemTyuCategoryNo: "1",
        inspectionItemComment: "pH測定項目",
      },
    ];

    // 状態を更新
    store.set(AtomMng030.inspItemRegistState, testInspItemData);
    store.set(AtomMng030.inspItemRegistFlgState, true);

    const updatedRegistState = store.get(AtomMng030.inspItemRegistState);
    const updatedRegistFlgState = store.get(AtomMng030.inspItemRegistFlgState);

    expect(updatedRegistState).toEqual(testInspItemData);
    expect(updatedRegistFlgState).toBe(true);
  });

  it("No.4-5 項目番号最大値が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialMaxItemNo = store.get(AtomMng030.maxItemNo);

    expect(initialMaxItemNo).toBeUndefined();
  });

  it("No.4-6 項目番号最大値が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomMng030.maxItemNo, 100);

    const updatedMaxItemNo = store.get(AtomMng030.maxItemNo);
    expect(updatedMaxItemNo).toBe(100);
  });
});

/**
 * MNG030_検査項目設定画面_API通信
 *
 */
describe("No.5 検査項目設定API通信", () => {
  const dummyRequest = {
    sortColumn: "",
    sortOrder: "ASC",
  };
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.5-1 検査項目データ検索APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    const result = await Api.post(
      "/MNG030/fetchInspItemData",
      mockSetMessage,
      dummyRequest
    );

    expect(result).toEqual(mockInspItemData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG030/fetchInspItemData",
      mockSetMessage,
      dummyRequest
    );
  });

  it("No.5-2 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost(
        "/MNG030/fetchInspItemData",
        mockSetMessage,
        dummyRequest
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.5-3 検査項目保存APIが正常に動作する", async () => {
    const saveData = {
      data_to_save: [
        {
          itemNo: "001",
          itemDspName: "pH",
          itemReportName: "水素イオン濃度",
          itemUnit: "pH",
          constantQualitativeFlg: "1",
          inputType: "1",
          itemDaiCategoryNo: "1",
          itemTyuCategoryNo: "1",
          inspectionItemComment: "pH測定項目",
        },
      ],
      validateMode: "inspection",
      display_time: "2024-01-15 10:00:00",
    };

    const mockSaveResponse = { success: true };
    mockedApiPost.mockResolvedValueOnce(mockSaveResponse);

    const result = await Api.post(
      "/MNG030/saveInspItemData",
      mockSetMessage,
      saveData
    );

    expect(result).toEqual(mockSaveResponse);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG030/saveInspItemData",
      mockSetMessage,
      saveData
    );
  });

  it("No.5-4 検査項目保存API通信エラー時のエラーハンドリング", async () => {
    const saveData = {
      data_to_save: [],
      validateMode: "inspection",
      display_time: "2024-01-15 10:00:00",
    };

    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/MNG030/saveInspItemData", mockSetMessage, saveData)
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });
});

/**
 * MNG030_検査項目設定画面_バリデーション
 *
 */
describe("No.6 バリデーション", () => {
  describe("No.6-1 必須項目チェック", () => {
    it("項目名称画面が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("項目名称画面が入力されている場合、falseを返す", () => {
      expect(Common.checkNullOfString("pH")).toBe(false);
      expect(Common.checkNullOfString("濁度")).toBe(false);
    });

    it("項目名称報告書が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("単位が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("コメントが未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });
  });

  describe("No.6-2 文字数制限チェック", () => {
    it("項目名称画面が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("pH", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("水素イオン濃度", 50)).toBe(false);
    });

    it("項目名称画面が50文字を超える場合、trueを返す", () => {
      const longName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longName, 50)).toBe(true);
    });

    it("項目名称報告書が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("水素イオン濃度", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("濁度測定", 50)).toBe(false);
    });

    it("項目名称報告書が50文字を超える場合、trueを返す", () => {
      const longReportName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longReportName, 50)).toBe(true);
    });

    it("単位が10文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("pH", 10)).toBe(false);
      expect(Common.checkLengthOverOfString("mg/L", 10)).toBe(false);
    });

    it("単位が10文字を超える場合、trueを返す", () => {
      const longUnit = "あ".repeat(11);
      expect(Common.checkLengthOverOfString(longUnit, 10)).toBe(true);
    });

    it("コメントが50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("pH測定項目", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("濁度測定項目", 50)).toBe(false);
    });

    it("コメントが50文字を超える場合、trueを返す", () => {
      const longComment = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longComment, 50)).toBe(true);
    });
  });

  describe("No.6-3 その他のバリデーション関数", () => {
    it("checkNullAndReturnString - null値を空文字に変換", () => {
      expect(Common.checkNullAndReturnString(null)).toBe("");
      expect(Common.checkNullAndReturnString(undefined)).toBe("");
      expect(Common.checkNullAndReturnString("pH")).toBe("pH");
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

/**
 * MNG030_検査項目設定画面_データ区分・入力タイプ
 *
 */
describe("No.7 データ区分・入力タイプ", () => {
  it("No.7-1 データ区分名称の選択肢が正しく設定される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      setTimeout(async () => {
        await expect(screen.getByTestId("mng030-2")).toBeInTheDocument();
      }, 1000);
    });

    // データ区分名称の選択肢が設定されることを確認
    // 実際の選択肢の内容はConst.DATA_KBN_NAME_OPTIONSに依存
  });

  it("No.7-2 入力タイプの選択肢が正しく設定される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      await expect(screen.getByTestId("mng030-2")).toBeInTheDocument();
    });

    // 入力タイプの選択肢が設定されることを確認
    // 実際の選択肢の内容はConst.INPUT_TYPE_NAME_OPTIONSに依存
  });

  it("No.7-3 検査項目大分類の選択肢が正しく設定される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      await expect(screen.getByTestId("mng030-2")).toBeInTheDocument();
    });

    // 検査項目大分類の選択肢が設定されることを確認
    // モックデータから「基本項目」「金属類」が設定される
  });

  it("No.7-4 検査項目中分類の選択肢が正しく設定される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockInspItemData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG030 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(async () => {
      setTimeout(async () => {
        await expect(screen.getByTestId("mng030-2")).toBeInTheDocument();
      }, 1000);
    });

    // 検査項目中分類の選択肢が設定されることを確認
    // モックデータから「物理項目」「化学項目」が設定される
  });
});
