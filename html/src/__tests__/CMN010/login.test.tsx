// 自動テスト
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, logRoles } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

// 画面操作テスト
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// useQuery
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ログイン画面
import CMN010 from '../../pages/CMN010/index';

// アトム
import { getDefaultStore, Provider } from 'jotai';
import * as AtomCommon from "../../stores/atom";
import * as AtomCmn010 from "../../stores/atomCmn010";

// Api通信テスト_モック
import axios from 'axios'
import { vi } from 'vitest'
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

window.scrollTo = vi.fn();
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

/**
 * CMN010_ログイン画面_画面表示
 * 
 */
describe("No.1 ログイン画面表示", () => {
  it("No.1-1 ログイン画面が正しく表示される", () => {
    const queryClient = createTestQueryClient()
    const { asFragment } = render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    )

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 ログイン画面の画像が正しく表示される", () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const headerImage: any = screen.getByTestId('CMN010-1-2');
    expect(headerImage).toBeInTheDocument();
  });

  it("No.1-3 ログイン画面のタイトルが正しく表示される", () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByText(import.meta.env.VITE_SYSTEM_NAME)).toBeInTheDocument()
  });

  it("No.1-4 ログイン画面の「ユーザID」ラベルが正しく表示される", () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const idLabel: any = screen.getByTestId('CMN010-1-4');
    expect(idLabel).toBeInTheDocument();
  });

  it("No.1-5 ログイン画面の「ユーザID」テキストフィールドが正しく表示される", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const idInput: any = screen.getByPlaceholderText('ユーザーID');
    expect(idInput).toBeInTheDocument();
  });

  it("No.1-6 ログイン画面の「パスワード」ラベルが正しく表示される", () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const idLabel: any = screen.getByTestId('CMN010-1-4');
    expect(idLabel).toBeInTheDocument();
  });

  it("No.1-7 ログイン画面の「パスワード」テキストフィールドが正しく表示される", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const idInput: any = screen.getByPlaceholderText('パスワード');
    expect(idInput).toBeInTheDocument();
  });

  it("No.1-8 ログイン画面の「ログイン」ボタンが正しく表示される", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const loginBtn: any = screen.getByText('ログイン');
    expect(loginBtn).toBeInTheDocument();
  });
});

/**
 * CMN010_ログイン画面_画面操作
 * 
 */
describe("No.2 ログイン画面操作", () => {
  it("No.2-1 ログイン画面の「ユーザID」テキストフィールドが入力きる", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const idInput: any = screen.getByPlaceholderText('ユーザーID');

    // 入力操作
    await userEvent.type(idInput, 'ユーザーID')
    expect(idInput).toHaveValue('ユーザーID')
  });

  it("No.2-2 ログイン画面の「パスワード」テキストフィールドが入力できる", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const idInput: any = screen.getByPlaceholderText('パスワード');

    // 入力操作
    await userEvent.type(idInput, 'パスワード')
    expect(idInput).toHaveValue('パスワード')
  });

  it("No.2-3 ログイン画面の「パスワード非表示」ボタンが押下できる", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const passwordToggleBtn: any = screen.getByTestId('CMN010-1-8');

    // 押下操作_テキスト切替
    await userEvent.click(passwordToggleBtn)
    const passwordInputText: any = screen.getByPlaceholderText('パスワード');
    expect(passwordInputText.type).to.equal('text');

    // 押下操作_パスワード切替
    await userEvent.click(passwordToggleBtn)
    const passwordInputPassword: any = screen.getByPlaceholderText('パスワード');
    expect(passwordInputPassword.type).to.equal('password');
  });
});

/**
 * CMN010_ログイン画面_JOTAIアトム
 * 
 */
describe("No.3 ログインアトム", () => {
  it("No.3-1 ログイン画面の「ユーザID」テキストフィールドが入力きる", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const store = getDefaultStore()
    const idInput: any = screen.getByPlaceholderText('ユーザーID');

    // 入力操作・アトム
    await userEvent.clear(idInput);
    await userEvent.type(idInput, 'acmos-id');

    // 更新確認
    expect(store.get(AtomCmn010.userIdState)).toBe('acmos-id');
  });

  it("No.3-2 ログイン画面の「パスワード」テキストフィールドが入力きる", async () => {
    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CMN010 />
        </BrowserRouter>
      </QueryClientProvider>
    );
    const store = getDefaultStore()
    const passwordInput: any = screen.getByPlaceholderText('パスワード');

    // 入力操作・アトム
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'acmos-password-123');

    // 更新確認
    expect(store.get(AtomCmn010.passwordState)).toBe('acmos-password-123');
  });
});

// TODO Api通信
/**
 * CMN010_ログイン画面_API通信
 * 
 */
describe("No.4 ログインAPI通信", () => {
  const dummyRequest = { user_id: '12312312', user_password: '' };
  const mockSetMessage = vi.fn();

  // beforeEach(() => {
  //   vi.clearAllMocks();
  // });

  it("No.4-1 ログイン画面の「ログイン」ボタンが押下できる", async () => {
    const queryClient = createTestQueryClient()
    mockedAxios.get.mockResolvedValueOnce({}); // csrf ok
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 404,
        data: {
          errors: {
            user_id: [['PM-0001W', 'ユーザID']],
          },
          message: '404 error',
        },
      },
      status: 404,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Provider>
          <BrowserRouter>
            <CMN010 />
          </BrowserRouter>
        </Provider>
      </QueryClientProvider>
    );

    // const idInput: any = screen.getByPlaceholderText('ユーザーID');
    // await userEvent.type(idInput, '');
    // const passwordInput: any = screen.getByPlaceholderText('パスワード');
    // await userEvent.type(passwordInput, '');
    // await userEvent.click(screen.getByText('ログイン'));

    await expect(Api.login(mockSetMessage, dummyRequest)).rejects.toThrow(Const.HTTP_STATUS_CODE['404']);

  });
});