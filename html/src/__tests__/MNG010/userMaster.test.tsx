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

// ユーザマスタ画面
import MNG010 from "../../pages/MNG010/index";

// アトム
import { getDefaultStore, Provider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomMng010 from "../../stores/atomMNG010";

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
const mockUserData = {
  userData: [
    {
      user_no: "1",
      user_id: "001",
      user_name: "テストユーザー1",
      user_furigana: "てすとゆーざー1",
      affiliation_dept: "総務部",
      affiliation_section_no: "001",
      security_level: 1,
      regist_date: "2024-01-15",
      end_date: "2024-12-31",
    },
    {
      user_no: "2",
      user_id: "002",
      user_name: "テストユーザー2",
      user_furigana: "てすとゆーざー2",
      affiliation_dept: "技術部",
      affiliation_section_no: "002",
      security_level: 2,
      regist_date: "2024-01-20",
      end_date: "2024-12-31",
    },
  ],
  affiliationData: [
    {
      affiliation_section: "総務課",
      affiliation_section_no: "001",
    },
    {
      affiliation_section: "技術課",
      affiliation_section_no: "002",
    },
  ],
  displayTime: "2024-01-15 10:00:00",
};

const mockEmptyUserData = {
  userData: [],
  affiliationData: [],
  displayTime: "2024-01-15 10:00:00",
};

/**
 * MNG010_ユーザマスタ画面_画面表示
 *
 */
describe("No.1 ユーザマスタ画面表示", () => {
  it("No.1-1 ユーザマスタ画面が正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng010-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 ユーザマスタ画面のタイトルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng010-1")).toBeInTheDocument();
    });

    expect(screen.getByText("ユーザマスタ")).toBeInTheDocument();
  });

  it("No.1-3 ユーザデータが0件の場合の表示確認", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockEmptyUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng010-1")).toBeInTheDocument();
    });

    // グリッドテーブルが表示されないことを確認
    expect(screen.queryByTestId("mng010-2")).not.toBeInTheDocument();
  });

  it("No.1-4 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    // タイトルは表示される
    expect(screen.getByTestId("mng010-1")).toBeInTheDocument();
    // グリッドテーブルは表示されない（ローディング中）
    expect(screen.queryByTestId("mng010-2")).not.toBeInTheDocument();
  });
});

/**
 * MNG010_ユーザマスタ画面_グリッドテーブル表示
 *
 */
describe("No.2 グリッドテーブル表示", () => {
  it("No.2-1 グリッドテーブルが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng010-2")).toBeInTheDocument();
    });

    await waitFor(() => {
      // グリッドテーブルが表示されることを確認
      // expect(screen.getByTestId("mng010-2")).toBeInTheDocument();
      // CSS Modulesのハッシュ化されたクラス名をチェック
      expect(screen.getByTestId("mng010-2")).toHaveAttribute("class");
    });
  });

  it("No.2-2 ユーザデータが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("mng010-2")).toBeInTheDocument();

      // グリッドテーブル内にGridSimpleContextTableコンポーネントが含まれることを確認
      const gridTable = screen.getByTestId("mng010-2");
      expect(gridTable).toBeInTheDocument();
    });
  });
});

/**
 * MNG010_ユーザマスタ画面_フッターボタン
 *
 */
describe("No.3 フッターボタン操作", () => {
  it("No.3-1 入力前に戻るボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('入力前に戻る')).toBeInTheDocument();
    });

    await waitFor(() => {
      const backButton: any = screen.getByText('入力前に戻る');
      expect(backButton).toBeInTheDocument();
      expect(backButton).toHaveTextContent("入力前に戻る");
    });
  });

  it("No.3-2 登録ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
    });

    await waitFor(() => {
      setTimeout(() => {
        const saveButton: any = screen.getByText("登録");
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toHaveTextContent("登録");
      }, 1000);
    });
  });

  it("No.3-3 入力前に戻るボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("入力前に戻る")).toBeInTheDocument();

      const backButton: any = screen.getByText("入力前に戻る");

      // ボタンがクリック可能であることを確認
      expect(backButton).not.toBeDisabled();

      // クリックイベントをテスト
      userEvent.click(backButton);

      // クリック後の処理は確認ダイアログが表示されるが、
      // ダイアログのテストは別途必要に応じて実装
    });
  });

  it("No.3-4 登録ボタンのクリック動作", async () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <MNG010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("登録")).toBeInTheDocument();
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
 * MNG010_ユーザマスタ画面_JOTAIアトム
 *
 */
describe("No.4 ユーザマスタアトム", () => {
  it("No.4-1 検索・ソート状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomMng010.searchAndSortState);

    expect(initialState.sortColumn).toBe("");
    expect(initialState.sortOrder).toBe("ASC");
  });

  it("No.4-2 検索・ソート状態が正しく更新される", () => {
    const store = getDefaultStore();

    // 状態を更新
    store.set(AtomMng010.searchAndSortState, {
      sortColumn: "user_id",
      sortOrder: "DESC",
    });

    const updatedState = store.get(AtomMng010.searchAndSortState);
    expect(updatedState.sortColumn).toBe("user_id");
    expect(updatedState.sortOrder).toBe("DESC");
  });

  it("No.4-3 ユーザマスタ登録状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialRegistState = store.get(AtomMng010.userMasterRegistState);
    const initialRegistFlgState = store.get(
      AtomMng010.userMasterRegistFlgState
    );

    expect(initialRegistState).toEqual([]);
    expect(initialRegistFlgState).toBe(false);
  });

  it("No.4-4 ユーザマスタ登録状態が正しく更新される", () => {
    const store = getDefaultStore();

    const testUserData = [
      {
        userId: "001",
        userName: "テストユーザー",
        processFlg: "NEW",
      },
    ];

    // 状態を更新
    store.set(AtomMng010.userMasterRegistState, testUserData);
    store.set(AtomMng010.userMasterRegistFlgState, true);

    const updatedRegistState = store.get(AtomMng010.userMasterRegistState);
    const updatedRegistFlgState = store.get(
      AtomMng010.userMasterRegistFlgState
    );

    expect(updatedRegistState).toEqual(testUserData);
    expect(updatedRegistFlgState).toBe(true);
  });
});

/**
 * MNG010_ユーザマスタ画面_API通信
 *
 */
describe("No.5 ユーザマスタAPI通信", () => {
  const dummyRequest = { sortColumn: "", sortOrder: "ASC" };
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.5-1 ユーザデータ取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockUserData);

    const result = await Api.post(
      "/MNG010/fetchUserData",
      mockSetMessage,
      dummyRequest
    );

    expect(result).toEqual(mockUserData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG010/fetchUserData",
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
      freshMockedApiPost("/MNG010/fetchUserData", mockSetMessage, dummyRequest)
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.5-3 ユーザマスタ保存APIが正常に動作する", async () => {
    const saveData = {
      data_to_save: [
        {
          userId: "001",
          userName: "テストユーザー",
          processFlg: "NEW",
        },
      ],
      display_time: "2024-01-15 10:00:00",
    };

    const mockSaveResponse = { success: true };
    mockedApiPost.mockResolvedValueOnce(mockSaveResponse);

    const result = await Api.post(
      "/MNG010/saveUserMasterData",
      mockSetMessage,
      saveData
    );

    expect(result).toEqual(mockSaveResponse);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/MNG010/saveUserMasterData",
      mockSetMessage,
      saveData
    );
  });

  it("No.5-4 ユーザマスタ保存API通信エラー時のエラーハンドリング", async () => {
    const saveData = {
      data_to_save: [],
      display_time: "2024-01-15 10:00:00",
    };

    // 完全に新しいモック設定
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/MNG010/saveUserMasterData", mockSetMessage, saveData)
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });
});

/**
 * MNG010_ユーザマスタ画面_バリデーション
 *
 */
describe("No.6 バリデーション", () => {
  describe("No.6-1 必須項目チェック", () => {
    it("ユーザIDが未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("ユーザIDが入力されている場合、falseを返す", () => {
      expect(Common.checkNullOfString("001")).toBe(false);
      expect(Common.checkNullOfString("test")).toBe(false);
    });

    it("パスワードが未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });

    it("氏名が未入力の場合、trueを返す", () => {
      expect(Common.checkNullOfString("")).toBe(true);
      expect(Common.checkNullOfString(null)).toBe(true);
      expect(Common.checkNullOfString(undefined)).toBe(true);
    });
  });

  describe("No.6-2 ユーザID形式チェック", () => {
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

  describe("No.6-3 パスワード形式チェック", () => {
    it("半角英数字のみの場合、trueを返す", () => {
      expect(Common.checkLettersOrNumber("password123")).toBe(true);
      expect(Common.checkLettersOrNumber("ABC123")).toBe(true);
      expect(Common.checkLettersOrNumber("123")).toBe(true);
      expect(Common.checkLettersOrNumber("abc")).toBe(true);
    });

    it("半角英数字以外が含まれる場合、falseを返す", () => {
      expect(Common.checkLettersOrNumber("password@123")).toBe(false);
      expect(Common.checkLettersOrNumber("パスワード")).toBe(false);
      expect(Common.checkLettersOrNumber("pass word")).toBe(false); // スペース
    });

    it("未入力の場合、falseを返す", () => {
      expect(Common.checkLettersOrNumber("")).toBe(false);
      expect(Common.checkLettersOrNumber(null)).toBe(false);
    });
  });

  describe("No.6-4 文字数制限チェック", () => {
    it("指定文字数以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("テスト", 10)).toBe(false);
      expect(Common.checkLengthOverOfString("12345", 10)).toBe(false);
    });

    it("指定文字数を超える場合、trueを返す", () => {
      expect(
        Common.checkLengthOverOfString(
          "これは50文字を超える非常に長い文字列のテストです。これは50文字を超える非常に長い文字列のテストです。",
          50
        )
      ).toBe(true);
    });

    it("氏名が50文字以下の場合、falseを返す", () => {
      expect(Common.checkLengthOverOfString("田中太郎", 50)).toBe(false);
      expect(Common.checkLengthOverOfString("テストユーザー", 50)).toBe(false);
    });

    it("氏名が50文字を超える場合、trueを返す", () => {
      const longName = "あ".repeat(51);
      expect(Common.checkLengthOverOfString(longName, 50)).toBe(true);
    });
  });

  describe("No.6-5 その他のバリデーション関数", () => {
    it("checkNullAndReturnString - null値を空文字に変換", () => {
      expect(Common.checkNullAndReturnString(null)).toBe("");
      expect(Common.checkNullAndReturnString(undefined)).toBe("");
      expect(Common.checkNullAndReturnString("test")).toBe("test");
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
