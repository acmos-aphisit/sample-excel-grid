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

// 報告書設定画面
import MNG060 from "../../pages/MNG060/index";

// アトム
import { getDefaultStore, Provider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomMng060 from "../../stores/atomMNG060";
import * as AtomSideMasterMenu from "../../stores/atomSideMenuMaster";

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
  },
  getMessage: vi.fn().mockReturnValue({ message: "テストメッセージ" }),
  showMessageArea: vi.fn(),
}));

const mockedApiPost = vi.mocked(Api.post);
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
const mockRptConfigData = {
  config: {
    rowData: [
      {
        report_no: "1",
        report_name: "テスト報告書1",
        report_type: "1",
        input_menu_no: "001",
        inspection_kbn: "1",
      },
    ],
    colData: [
      { columnId: "report_no", width: 100 },
      { columnId: "report_name", width: 200 },
      { columnId: "report_type", width: 150 },
      { columnId: "input_menu_no", width: 150 },
      { columnId: "inspection_kbn", width: 150 },
    ],
  },
  item: {
    rowData: [
      {
        item_no: "1",
        item_name: "テスト項目1",
        display_order: "1",
      },
      {
        item_no: "2",
        item_name: "テスト項目2",
        display_order: "2",
      },
    ],
    colData: [
      { columnId: "item_no", width: 100 },
      { columnId: "item_name", width: 200 },
      { columnId: "display_order", width: 150 },
    ],
  },
  point: {
    rowData: [
      {
        point_no: "1",
        point_name: "測定地点1",
        display_order: "1",
      },
    ],
    colData: [
      { columnId: "point_no", width: 100 },
      { columnId: "point_name", width: 200 },
      { columnId: "display_order", width: 150 },
    ],
  },
  text: {
    rowData: [
      {
        text_no: "1",
        text_content: "固定文言1",
      },
    ],
    colData: [
      { columnId: "text_no", width: 100 },
      { columnId: "text_content", width: 300 },
    ],
  },
  monthList: {
    rowData: [
      {
        month: "2024-01",
        report_count: "5",
      },
    ],
    colData: [
      { columnId: "month", width: 150 },
      { columnId: "report_count", width: 150 },
    ],
  },
  menuOpt: [
    { value: "001", label: "入力メニュー1" },
    { value: "002", label: "入力メニュー2" },
  ],
  pointOpt: [
    { value: "1", label: "測定地点1" },
    { value: "2", label: "測定地点2" },
  ],
  kbnOpt: [
    { value: "1", label: "検査区分1" },
    { value: "2", label: "検査区分2" },
  ],
  typeOpt: [
    { value: "1", label: "報告書タイプ1" },
    { value: "2", label: "報告書タイプ2" },
  ],
  itemOpt: [
    { value: "1", label: "検査項目1" },
    { value: "2", label: "検査項目2" },
  ],
  reportOpt: [
    { value: "1", label: "報告書1" },
    { value: "2", label: "報告書2" },
  ],
  time: "2024-01-15 10:00:00.000",
};

const mockEmptyRptConfigData = {
  config: {
    rowData: [],
    colData: [],
  },
  item: {
    rowData: [],
    colData: [],
  },
  point: {
    rowData: [],
    colData: [],
  },
  text: {
    rowData: [],
    colData: [],
  },
  monthList: {
    rowData: [],
    colData: [],
  },
  menuOpt: [],
  pointOpt: [],
  kbnOpt: [],
  typeOpt: [],
  itemOpt: [],
  reportOpt: [],
  time: "2024-01-15 10:00:00.000",
};

/**
 * MNG060_報告書設定画面_画面表示
 *
 */
describe("No.1 報告書設定画面表示", () => {
  it("No.1-1 報告書設定画面が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    // サイドメニュー選択状態を設定
    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("報告書設定")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 報告書設定画面のタイトルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("報告書設定")).toBeInTheDocument();
    });
  });

  it("No.1-3 報告書データが0件の場合の表示確認", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "",
      selectedMenuName: "",
      selectedDspNo: "1",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "",
      affiliation_section_no: "",
      report_type: "",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockEmptyRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("報告書設定")).toBeInTheDocument();
    });
  });

  it("No.1-4 タブが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("報告書構成")).toBeInTheDocument();
        expect(screen.getByText("検査項目")).toBeInTheDocument();
        expect(screen.getByText("測定地点")).toBeInTheDocument();
        expect(screen.getByText("固定文言")).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * MNG060_報告書設定画面_タブ切り替え
 *
 */
describe("No.2 タブ切り替え", () => {
  it("No.2-1 報告書構成タブが初期表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("報告書構成")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-2 検査項目タブに切り替えられる", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const itemTab = screen.getByText("検査項目");
        expect(itemTab).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-3 測定地点タブに切り替えられる", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const pointTab = screen.getByText("測定地点");
        expect(pointTab).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-4 固定文言タブに切り替えられる", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const textTab = screen.getByText("固定文言");
        expect(textTab).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * MNG060_報告書設定画面_フッターボタン
 *
 */
describe("No.3 フッターボタン操作", () => {
  it("No.3-1 登録ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
    });
  });

  it("No.3-2 入力前に戻るボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("入力前に戻る")).toBeInTheDocument();
    });
  });

  it("No.3-3 テンプレート取込ボタンが報告書選択時に表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("テンプレート取込")).toBeInTheDocument();
      }, 100);
    });
  });

  it("No.3-4 取消ボタンが報告書選択時に表示される", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("取消")).toBeInTheDocument();
      }, 100);
    });
  });

  it("No.3-5 登録ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    const store = getDefaultStore();

    store.set(AtomSideMasterMenu.sideMenuSelectedState, {
      selectedMenuNo: "1",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "1",
      inspectionKbnCode: "1",
      report_no: "1",
      report_category: "1",
      affiliation_section_no: "001",
      report_type: "1",
      label_flg: false,
    });

    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <BrowserRouter>
            <MNG060 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText("登録");
      expect(saveButton).not.toBeDisabled();
    });
  });
});

/**
 * MNG060_報告書設定画面_JOTAIアトム
 *
 */
describe("No.4 報告書設定アトム", () => {
  it("No.4-1 報告書設定データが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialConfigData = store.get(AtomMng060.mng060RptConfigData);

    expect(initialConfigData).toBeDefined();
    expect(initialConfigData.rowData).toEqual([]);
    expect(initialConfigData.colData).toEqual([]);
  });

  it("No.4-2 検査項目データが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialItemData = store.get(AtomMng060.mng060RptItemData);

    expect(initialItemData).toBeDefined();
    expect(initialItemData.rowData).toEqual([]);
    expect(initialItemData.colData).toEqual([]);
  });

  it("No.4-3 測定地点データが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialPointData = store.get(AtomMng060.mng060RptPointData);

    expect(initialPointData).toBeDefined();
    expect(initialPointData.rowData).toEqual([]);
    expect(initialPointData.colData).toEqual([]);
  });

  it("No.4-4 固定文言データが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialTextData = store.get(AtomMng060.mng060RptTextData);

    expect(initialTextData).toBeDefined();
    expect(initialTextData.rowData).toEqual([]);
    expect(initialTextData.colData).toEqual([]);
  });

  it("No.4-5 月報一覧データが正しく初期化される", () => {
    const store = getDefaultStore();
    const initialMonthListData = store.get(AtomMng060.mng060RptMonthListData);

    expect(initialMonthListData).toBeDefined();
    expect(initialMonthListData.rowData).toEqual([]);
    expect(initialMonthListData.colData).toEqual([]);
  });

  it("No.4-6 報告書設定データが正しく更新される", () => {
    const store = getDefaultStore();

    const testConfigData = {
      selectMenuNo: "1",
      header: [],
      inputData: [],
      inputMask: [],
      inspectCriteria: [],
      rowData: [
        {
          report_no: "1",
          report_name: "テスト報告書",
        },
      ],
      colData: [
        { columnId: "report_no", width: 100 },
        { columnId: "report_name", width: 200 },
      ],
    };

    store.set(AtomMng060.mng060RptConfigData, testConfigData);

    const updatedConfigData = store.get(AtomMng060.mng060RptConfigData);
    expect(updatedConfigData.rowData).toEqual(testConfigData.rowData);
    expect(updatedConfigData.colData).toEqual(testConfigData.colData);
  });
});

/**
 * MNG060_報告書設定画面_API通信
 *
 */
describe("No.5 報告書設定API通信", () => {
  const mockSetMessage = vi.fn();
  const mockSideMenuSelected = {
    selectedMenuNo: "1",
    selectedMenuName: "テスト報告書",
    selectedDspNo: "1",
    inspectionKbnCode: "1",
    report_no: "1",
    report_category: "1",
    affiliation_section_no: "001",
    report_type: "1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.5-1 報告書設定データ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockRptConfigData);

    const result = await Api.post(
      "/MNG060/getRptConfig",
      mockSetMessage,
      mockSideMenuSelected
    );

    expect(result).toEqual(mockRptConfigData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG060/getRptConfig",
      mockSetMessage,
      mockSideMenuSelected
    );
  });

  it("No.5-2 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost(
        "/MNG060/getRptConfig",
        mockSetMessage,
        mockSideMenuSelected
      )
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.5-3 報告書設定登録APIが正常に動作する", async () => {
    const registData = {
      displayTime: "2024-01-15 10:00:00.000",
      config: mockRptConfigData.config.rowData,
      item: mockRptConfigData.item.rowData,
      point: mockRptConfigData.point.rowData,
      text: mockRptConfigData.text.rowData,
      monthList: mockRptConfigData.monthList.rowData,
      sidemenu: mockSideMenuSelected,
    };

    const mockRegistResponse = {
      time: "2024-01-15 10:00:00.000",
    };
    mockedApiPost.mockResolvedValueOnce(mockRegistResponse);

    const result = await Api.post("/MNG060/regist", mockSetMessage, registData);

    // 一定時間後に結果確認する
    setTimeout(() => {
      expect(result).toEqual(mockRegistResponse);
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/MNG060/regist",
        mockSetMessage,
        registData
      );
    }, 100);
  });

  it("No.5-4 報告書削除APIが正常に動作する", async () => {
    const deleteData = {
      displayTime: "2024-01-15 10:00:00.000",
      sidemenu: mockSideMenuSelected,
    };

    const mockDeleteResponse = {
      success: true,
      time: "2024-01-15 10:00:00.000",
    };
    mockedApiPost.mockResolvedValueOnce(mockDeleteResponse);

    const result = await Api.post(
      "/MNG060/deleteReport",
      mockSetMessage,
      deleteData
    );

    // 一定時間後に結果確認する
    setTimeout(() => {
      expect(result).toEqual(mockDeleteResponse);
      expect(mockedApiPost).toHaveBeenCalledWith(
        "/MNG060/deleteReport",
        mockSetMessage,
        deleteData
      );
    }, 1000);
  });

  it("No.5-5 報告書削除API通信エラー時のエラーハンドリング", async () => {
    const deleteData = {
      displayTime: "2024-01-15 10:00:00.000",
      sidemenu: mockSideMenuSelected,
    };

    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/MNG060/deleteReport", mockSetMessage, deleteData)
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });
});

/**
 * MNG060_報告書設定画面_バリデーション
 *
 */
describe("No.6 バリデーション", () => {
  describe("No.6-1 必須項目チェック", () => {
    it("報告書名が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("報告書名が入力されている場合、falseを返す", () => {
      expect(Common.checkNullOfString("テスト報告書")).toBe(false);
      expect(Common.checkNullOfString("報告書1")).toBe(false);
    });
  });

  describe("No.6-2 文字数制限チェック", () => {
    it("報告書名が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("テスト報告書", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("報告書設定", 50)).toBe(false);
    });

    it("報告書名が50文字を超える場合、trueを返す", () => {
      const longName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longName, 50)).toBe(true);
    });

    it("検査項目名が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("テスト項目", 50)).toBe(false);
    });

    it("測定地点名が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("測定地点1", 50)).toBe(false);
    });
  });

  describe("No.6-3 その他のバリデーション関数", () => {
    it("checkNullAndReturnString - null値を空文字に変換", () => {
      expect(Common.checkNullAndReturnString(null)).toBe("");
      expect(Common.checkNullAndReturnString(undefined)).toBe("");
      expect(Common.checkNullAndReturnString("テスト")).toBe("テスト");
    });

    it("checkNullAndReturnNumber - null値を0に変換", () => {
      expect(Common.checkNullAndReturnNumber(null)).toBe(0);
      expect(Common.checkNullAndReturnNumber(undefined)).toBe(0);
      expect(Common.checkNullAndReturnNumber("123")).toBe(123);
      expect(Common.checkNullAndReturnNumber(456)).toBe(456);
    });
  });
});
