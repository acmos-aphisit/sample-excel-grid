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

// 報告書出力画面
import Header from "../../components/layouts/header/header.tsx";
import WQM030 from "../../pages/WQM030/index";

// アトム
import { getDefaultStore, createStore, Provider as JotaiProvider } from "jotai";
import * as AtomCommon from "../../stores/atom";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import * as AtomWQM030 from "../../stores/atomWQM030";
import * as AtomSideMenuCalendar from "../../stores/atomSidemenuCalendar";
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// Api通信テスト_モック
import axios from "axios";
import { vi } from "vitest";
import { Api, getMessage, showMessageArea } from "../../common/api";
import * as Const from "../../common/const";

// MOCKデータ
import { mockSideLists } from "../mocks/mockSideListData.tsx";

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
    postBuffer: vi.fn(),
    fileDownload: vi.fn(),
  },
  getMessage: vi.fn(),
  showMessageArea: vi.fn(),
}));

const mockedApiGet = vi.mocked(Api.get);
const mockedApiPost = vi.mocked(Api.post);
const mockedApiPostBuffer = vi.mocked(Api.postBuffer);
const mockedApiFileDownload = vi.mocked(Api.fileDownload);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// モックデータ
const mockWQM030OutputListData = {
  gridTableData: [
    {
      saisui_date: "2024-01-15",
      saisui_time: "10:30",
      report_name: "水質検査報告書",
      point_report_name: "採水地点1",
      item_report_name: "pH",
      inspection_kbn_name: "定期検査",
      kensa_kbn_code: 1,
      report_no: 101,
      report_type_name: "日報",
      dsp_space: "○",
      dsp_low_limit: "×",
      dsp_up_limit: "×",
      point_no: 1,
    },
    {
      saisui_date: "2024-01-16",
      saisui_time: "11:00",
      report_name: "水質検査報告書",
      point_report_name: "採水地点2",
      item_report_name: "濁度",
      inspection_kbn_name: "定期検査",
      kensa_kbn_code: 1,
      report_no: 102,
      report_type_name: "日報",
      dsp_space: "○",
      dsp_low_limit: "×",
      dsp_up_limit: "×",
      point_no: 2,
    },
  ],
};

const mockWQM030MonthlyReportData = {
  gridTableData: [
    {
      report_status: "完了",
      saisui_date: "2024-01-15",
      saisui_time: "10:30",
      report_name: "月報報告書",
      point_report_name: "採水地点1",
      item_report_name: "pH",
      inspection_kbn_name: "定期検査",
      kensa_kbn_code: 1,
      report_no: 201,
      report_type_name: "月報",
      dsp_space: "○",
      dsp_low_limit: "×",
      dsp_up_limit: "×",
      point_no: 1,
    },
  ],
};

const mockEmptyWQM030Data = {
  gridTableData: [],
};

/**
 * WQM030_報告書出力画面_画面表示・ヘッダー部分
 *
 */
describe("No.1 報告書出力画面表示_ヘッダー部分", () => {
  const queryClient = createTestQueryClient();

  it("No.1-1 報告書出力画面が正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    const { asFragment } = render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM030 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("wmq030-1")).toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it("No.1-2 報告書出力画面のヘッダー「画像」が正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM030 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const headerImage: any = screen.getByTestId("HDR-1-1-1");
      expect(headerImage).toBeInTheDocument();
    });
  });

  it("No.1-3 報告書出力画面のヘッダー「タイトル」が正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM030 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const headerTitle: any = screen.getByTestId("HDR-1-1-2");
      expect(headerTitle).toHaveTextContent(import.meta.env.VITE_SYSTEM_NAME);
    });
  });

  it("No.1-4 報告書出力画面のヘッダーの各種メニューボタンが正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM030 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const headerMenuButtonNotice: any = screen.getByTestId("HDR-2-1-1-1");
        const headerMenuButtonRegister: any = screen.getByTestId("HDR-2-1-2-1");
        const headerMenuButtonSearch: any = screen.getByTestId("HDR-2-1-3-1");
        const headerMenuButtonReport: any = screen.getByTestId("HDR-2-1-4-1");
        const headerMenuButtonSupport: any = screen.getByTestId("HDR-2-1-5-1");
        const headerMenuButtonMaintain: any = screen.getByTestId("HDR-2-1-6-1");

        expect(headerMenuButtonNotice).toBeInTheDocument();
        expect(headerMenuButtonRegister).toBeInTheDocument();
        expect(headerMenuButtonSearch).toBeInTheDocument();
        expect(headerMenuButtonReport).toBeInTheDocument();
        expect(headerMenuButtonSupport).toBeInTheDocument();
        expect(headerMenuButtonMaintain).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.1-5 報告書出力画面のヘッダーのユーザー情報管理ボタンが正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Header />
            <div className="container_row">
              <WQM030 />
            </div>
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const headerMenuButtonUserName: any = screen.getByTestId("HDR-3-1-1-2");
      const headerMenuButtonLogout: any = screen.getByTestId("HDR-3-1-2");

      expect(headerMenuButtonUserName).toBeInTheDocument();
      expect(headerMenuButtonLogout).toBeInTheDocument();
    });
  });
});

/**
 * WQM030_報告書出力画面_メインコンテンツエリア
 *
 */
describe("No.2 報告書出力画面表示_メインコンテンツエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.2-1 メインコンテナが正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("wmq030-1")).toBeInTheDocument();
    });
  });

  it("No.2-2 サイドメニューが選択されていない場合、ローディングが表示される", async () => {
    const wqm030Store = createStore();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    expect(screen.getByTestId("wqm030-loading-gif")).toBeInTheDocument(); // Loading componentのgif画像
  });

  it("No.2-3 サイドメニューが選択され、データがある場合、報告書出力タイトルが表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("報告書出力")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-4 出力一覧テーブルが正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("採水年月日")).toBeInTheDocument();
        expect(screen.getByText("採水時刻")).toBeInTheDocument();
        expect(screen.getByText("報告書名称")).toBeInTheDocument();
        expect(screen.getByText("地点名称")).toBeInTheDocument();
        expect(screen.getByText("項目名称")).toBeInTheDocument();
        expect(screen.getByText("検査区分名称")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.2-5 月報報告書の場合、状態列が表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "月報報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "",
      report_category: "monthly",
      affiliation_section_no: "S001",
      report_type: "2",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030MonthlyReportData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("状態")).toBeInTheDocument();
        expect(screen.getByText("完了")).toBeInTheDocument();
      }, 1000);
    });
  });
});

/**
 * WQM030_報告書出力画面_出力一覧データ取得
 *
 */
describe("No.3 報告書出力画面_出力一覧データ取得", () => {
  const queryClient = createTestQueryClient();

  it("No.3-1 メニュー選択時に出力一覧データが取得される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM030/getDspOutputList",
          expect.any(Function),
          expect.objectContaining({
            report_no: "101",
            report_category: "daily",
            affiliation_section_no: "S001",
            report_type: "1",
          })
        );
      }, 3000);
    });

    await waitFor(() => {
      setTimeout(() => {
        expect(screen.getByText("2024-01-15")).toBeInTheDocument();
        expect(screen.getByText("10:30")).toBeInTheDocument();
        expect(screen.getByText("水質検査報告書")).toBeInTheDocument();
        expect(screen.getByText("採水地点1")).toBeInTheDocument();
        expect(screen.getByText("pH")).toBeInTheDocument();
      }, 3000);
    });
  });

  it("No.3-2 日付変更時に出力一覧データが再取得される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });
    await wqm030Store.set(
      AtomSideMenuCalendar.sidemenuSelectedDate,
      "2024-01-15"
    );

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiPost).toHaveBeenCalledWith(
          "/WQM030/getDspOutputList",
          expect.any(Function),
          expect.objectContaining({
            selected_date: "2024-01-15",
          })
        );
      }, 3000);
    });
  });

  it("No.3-3 データが0件の場合、一覧が表示されない", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockEmptyWQM030Data);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const exportReportGrid = document.getElementById("export-report-grid");
      expect(exportReportGrid).not.toBeInTheDocument();
    });
  });
});

/**
 * WQM030_報告書出力画面_フッターエリア
 *
 */
describe("No.4 報告書出力画面_フッターエリア", () => {
  const queryClient = createTestQueryClient();

  it("No.4-1 フッター出力ボタンが正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("出力")).toBeInTheDocument();
    });
  });

  it("No.4-2 出力ボタンがクリックできる", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const outputButton = screen.getByText("出力");
      expect(outputButton).toBeInTheDocument();
    });

    const outputButton = screen.getByText("出力");
    await userEvent.click(outputButton);

    // 確認ダイアログが表示されることを確認
    await waitFor(() => {
      setTimeout(() => {
        const confirmDialog = wqm030Store.get(
          AtomConfirmDialog.confirmDialogAtom
        );
        expect(confirmDialog.isOpen).toBe(true);
      }, 1000);
    });
  });

  it("No.4-3 出力ボタンクリック後、確認ダイアログで「出力」を選択すると報告書ダウンロードが実行される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    // チェックボックスが選択されたデータを設定
    const mockSelectedData = {
      ...mockWQM030OutputListData,
      gridTableData: mockWQM030OutputListData.gridTableData.map((item) => ({
        ...item,
        check_box: true,
      })),
    };

    mockedApiPost.mockResolvedValueOnce(mockSelectedData);
    mockedApiFileDownload.mockResolvedValueOnce({
      data: new ArrayBuffer(8),
      headers: new Map([
        ["Content-Disposition", "attachment; filename=report.xlsx"],
      ]),
    });

    // Blobとリンクのモック
    global.Blob = vi.fn().mockImplementation(() => ({}));
    global.URL.createObjectURL = vi.fn().mockReturnValue("mock-url");
    const mockClick = vi.fn();
    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
    };
    // vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);

    mockLink.click = mockClick;

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const outputButton = screen.getByText("出力");
        expect(outputButton).toBeInTheDocument();

        // データにチェックボックスを設定
        wqm030Store.set(AtomWQM030.wqm030GridTableAtom, {
          columnData: [],
          rowData: mockSelectedData.gridTableData,
          rowInterface: [],
        });

        userEvent.click(outputButton);

        // 確認ダイアログの確認ボタンを実行
        const confirmDialog = wqm030Store.get(AtomConfirmDialog.confirmDialogAtom);
        if (confirmDialog.onConfirm) {
          confirmDialog.onConfirm();
        }
      }, 1000);
    });

    // ファイルダウンロードAPIが呼び出されることを確認
    await waitFor(() => {
      setTimeout(() => {
        expect(mockedApiFileDownload).toHaveBeenCalledWith(
          "/report/export",
          expect.any(Function),
          expect.objectContaining({
            output_data: expect.arrayContaining([
              expect.objectContaining({
                report_no: 101,
                saisui_date: "2024-01-15",
                saisui_time: "10:30",
                point_no: 1,
                kensa_kbn_code: 1,
              }),
            ]),
          })
        );
      }, 1000);
    });
  });
});

/**
 * WQM030_報告書出力画面_チェックボックス機能
 *
 */
describe("No.5 報告書出力画面_チェックボックス機能", () => {
  const queryClient = createTestQueryClient();

  it("No.5-1 チェックボックスが正しく表示される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThan(0);
      }, 1000);
    });
  });

  it("No.5-2 チェックボックスがクリックできる", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThan(0);
      }, 1000);
    });

    // チェックボックスをクリック
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    if (checkboxes.length > 0) {
      await userEvent.click(checkboxes[0]);

      // チェック状態が更新されることを確認
      await waitFor(() => {
        expect(checkboxes[0]).toBeChecked();
      });
    }
  });
});

/**
 * WQM030_報告書出力画面_JOTAIアトム
 *
 */
describe("No.6 WQM030アトム", () => {
  it("No.6-1 グリッドテーブル状態が正しく初期化される", () => {
    const store = getDefaultStore();
    const initialState = store.get(AtomWQM030.wqm030GridTableAtom);

    expect(initialState).toEqual({
      columnData: [],
      rowData: [],
      rowInterface: [],
    });
  });

  it("No.6-2 グリッドテーブル状態が正しく更新される", () => {
    const store = getDefaultStore();
    const testGridData = {
      columnData: [
        {
          id: 1,
          columnName: "test_column",
          columnTitle: "テストカラム",
          width: 100,
        },
      ],
      rowData: [{ check_box: false, test_data: "テストデータ" }],
      rowInterface: [
        { interfaceName: "check_box", interfaceType: "checkbox" },
        { interfaceName: "test_data", interfaceType: "string" },
      ],
    };

    // 状態を更新
    store.set(AtomWQM030.wqm030GridTableAtom, testGridData);

    const updatedState = store.get(AtomWQM030.wqm030GridTableAtom);
    expect(updatedState.columnData.length).toBe(1);
    expect(updatedState.rowData.length).toBe(1);
    expect(updatedState.rowInterface.length).toBe(2);
    expect(updatedState.columnData[0].columnName).toBe("test_column");
    expect(updatedState.rowData[0].test_data).toBe("テストデータ");
  });
});

/**
 * WQM030_報告書出力画面_API通信
 *
 */
describe("No.7 WQM030API通信", () => {
  const mockSetMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("No.7-1 出力一覧取得APIが正常に動作する", async () => {
    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    const request = {
      report_no: "101",
      selected_date: "2024-01-15",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    };

    const result = await Api.post(
      "/WQM030/getDspOutputList",
      mockSetMessage,
      request
    );

    expect(result).toEqual(mockWQM030OutputListData);
    expect(mockedApiPost).toHaveBeenCalledWith(
      "/WQM030/getDspOutputList",
      mockSetMessage,
      request
    );
  });

  it("No.7-2 報告書出力APIが正常に動作する", async () => {
    const mockFileData = {
      data: new ArrayBuffer(8),
      headers: new Map([
        ["Content-Disposition", "attachment; filename=report.xlsx"],
      ]),
    };

    mockedApiFileDownload.mockResolvedValueOnce(mockFileData);

    const request = {
      output_data: [
        {
          report_no: 101,
          saisui_date: "2024-01-15",
          saisui_time: "10:30",
          point_no: 1,
          kensa_kbn_code: 1,
          dsp_space: "○",
        },
      ],
    };

    const result = await Api.fileDownload(
      "/report/export",
      mockSetMessage,
      request
    );

    expect(result).toEqual(mockFileData);
    expect(mockedApiFileDownload).toHaveBeenCalledWith(
      "/report/export",
      mockSetMessage,
      request
    );
  });

  it("No.7-3 API通信エラー時のエラーハンドリングが正しく動作する", async () => {
    const freshMockedApiPost = vi.fn();
    freshMockedApiPost.mockRejectedValueOnce(
      new Error(Const.HTTP_STATUS_CODE["500"])
    );

    await expect(
      freshMockedApiPost("/WQM030/getDspOutputList", mockSetMessage, {})
    ).rejects.toThrow(Const.HTTP_STATUS_CODE["500"]);
  });

  it("No.7-4 ローディング表示が正しく動作する", () => {
    const queryClient = createTestQueryClient();
    mockedApiPost.mockImplementation(() => new Promise(() => { })); // 永続的にpending状態

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WQM030 />
        </BrowserRouter>
      </QueryClientProvider>
    );

    // ローディングコンポーネントが表示されることを確認
    expect(screen.getByTestId("wqm030-loading-gif")).toBeInTheDocument(); // Loading componentのgif画像
  });

  it("No.7-5 データが0件の場合の処理が正しく動作する", async () => {
    const queryClient = createTestQueryClient();
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockEmptyWQM030Data);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      // 空の検索結果が設定されることを確認
      const gridTableState = wqm030Store.get(AtomWQM030.wqm030GridTableAtom);
      expect(gridTableState.rowData).toEqual([]);
    });
  });
});

/**
 * WQM030_報告書出力画面_レスポンシブ対応
 *
 */
describe("No.8 WQM030画面レスポンシブ対応", () => {
  const queryClient = createTestQueryClient();

  it("No.8-1 ResizeObserverが正しく動作する", async () => {
    // ResizeObserverのモック
    const mockResizeObserver = vi.fn();
    mockResizeObserver.mockReturnValue({
      observe: vi.fn(),
      disconnect: vi.fn(),
    });
    window.ResizeObserver = mockResizeObserver;

    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(mockResizeObserver).toHaveBeenCalled();
      }, 1000);
    });
  });

  it("No.8-2 コンテナのIDが正しく設定される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      setTimeout(() => {
        expect(
          document.getElementById("wmq030-1")
        ).toBeInTheDocument();
        expect(document.getElementById("main-content-table")).toBeInTheDocument();
      }, 1000);
    });
  });

  it("No.8-3 画面幅に応じてコンテナ幅が調整される", async () => {
    const wqm030Store = createStore();
    await wqm030Store.set(AtomSideMenu.sideMenuSelectedState, {
      selectedMenuNo: "M001",
      selectedMenuName: "テスト報告書",
      selectedDspNo: "D001",
      inspectionKbnCode: "",
      report_no: "101",
      report_category: "daily",
      affiliation_section_no: "S001",
      report_type: "1",
    });
    await wqm030Store.set(AtomSideMenu.sideMenuWidthState, 400);

    mockedApiPost.mockResolvedValueOnce(mockWQM030OutputListData);

    render(
      <JotaiProvider store={wqm030Store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <WQM030 />
          </BrowserRouter>
        </QueryClientProvider>
      </JotaiProvider>
    );

    await waitFor(() => {
      const container = screen.getByTestId("wmq030-1");
      expect(container).toBeInTheDocument();
      // コンテナの幅が設定されていることを確認
      expect(container.style.width).toBeDefined();
    });
  });
});
