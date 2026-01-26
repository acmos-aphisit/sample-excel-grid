<?php

namespace Tests\Unit;

use App\Http\Controllers\CommonController;
use App\Services\CommonService;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class CommonTest extends TestCase
{
    protected $commonController;
    protected $commonServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        
        // コントローラーのインスタンス作成
        $this->commonController = new CommonController();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->commonController);
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->commonController, $this->commonServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function index_【成功】初期処理()
    {
        // テストデータの準備
        $request = new Request();

        // テスト実行
        $response = $this->commonController->index($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertIsArray($responseData);
    }

    #[Test]
    public function getInputMenu_【成功】入力メニュー取得()
    {
        // テストデータの準備
        $inputMenuData = [
            [
                'input_menu_no' => 1,
                'input_title' => '水質検査入力',
                'input_hierarchy' => 1,
                'input_order' => 10
            ],
            [
                'input_menu_no' => 2,
                'input_title' => '大気検査入力',
                'input_hierarchy' => 1,
                'input_order' => 20
            ]
        ];
        
        $affiliationData = [
            [
                'affiliation_section_no' => 1,
                'affiliation_section_name' => '水質課'
            ],
            [
                'affiliation_section_no' => 2,
                'affiliation_section_name' => '大気課'
            ]
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getInputMenu')
            ->once()
            ->andReturn($inputMenuData);

        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn($affiliationData);

        // テスト実行
        $response = $this->commonController->getInputMenu();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($inputMenuData, $responseData['menuData']);
        $this->assertEquals($affiliationData, $responseData['affiliationData']);
    }

    #[Test]
    public function getInputMenu_【失敗】入力メニュー取得()
    {
        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getInputMenu')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getInputMenu();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getInputMenu', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '入力メニュー']], $responseData['errors']['getInputMenu']);
    }

    #[Test]
    public function getInputMenu_【失敗】所属課取得()
    {
        // テストデータの準備
        $inputMenuData = [
            [
                'input_menu_no' => 1,
                'input_title' => '水質検査入力'
            ]
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getInputMenu')
            ->once()
            ->andReturn($inputMenuData);

        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getInputMenu();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getAffiliationData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '所属課']], $responseData['errors']['getAffiliationData']);
    }

    #[Test]
    public function getReportMenu_【成功】報告書出力メニュー取得()
    {
        // テストデータの準備
        $request = new Request([
            'affiliation_section_no' => 1,
            'security_level' => 1
        ]);
        
        $reportMenuData = [
            [
                'report_menu_no' => 1,
                'report_title' => '水質検査報告書',
                'report_hierarchy' => 1,
                'report_order' => 10
            ],
            [
                'report_menu_no' => 2,
                'report_title' => '月次報告書',
                'report_hierarchy' => 1,
                'report_order' => 20
            ]
        ];
        
        $affiliationData = [
            [
                'affiliation_section_no' => 1,
                'affiliation_section_name' => '水質課'
            ]
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getReportMenu')
            ->once()
            ->with(1, 1)
            ->andReturn($reportMenuData);

        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn($affiliationData);

        // テスト実行
        $response = $this->commonController->getReportMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($reportMenuData, $responseData['menuData']);
        $this->assertEquals($affiliationData, $responseData['affiliationData']);
    }

    #[Test]
    public function getReportMenu_【失敗】報告書出力メニュー取得()
    {
        // テストデータの準備
        $request = new Request([
            'affiliation_section_no' => 1,
            'security_level' => 1
        ]);

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getReportMenu')
            ->once()
            ->with(1, 1)
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getReportMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getReportMenu', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '報告書メニュー']], $responseData['errors']['getReportMenu']);
    }

    #[Test]
    public function getSelectedDspInfo_【成功】選択している入力画面情報取得()
    {
        // テストデータの準備
        $request = new Request([
            'input_menu_no' => 1
        ]);
        
        $dspInfo = [
            [
                'input_dsp_no' => 1,
                'input_title' => 'テスト入力画面',
                'inspection_kbn' => '01'
            ]
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getSelectedDspInfo')
            ->once()
            ->with(1)
            ->andReturn($dspInfo);

        // テスト実行
        $response = $this->commonController->getSelectedDspInfo($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($dspInfo[0], $responseData['dspInfo']);
    }

    #[Test]
    public function getSelectedDspInfo_【失敗】選択している入力画面情報取得()
    {
        // テストデータの準備
        $request = new Request([
            'input_menu_no' => 1
        ]);

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getSelectedDspInfo')
            ->once()
            ->with(1)
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getSelectedDspInfo($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getSelectedDspInfo', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '画面情報']], $responseData['errors']['getSelectedDspInfo']);
    }

    #[Test]
    public function getPointInfo_【成功】採水地点情報取得()
    {
        // テストデータの準備
        $request = new Request([
            'point_no' => 1
        ]);
        
        $pointInfo = [
            [
                'point_no' => 1,
                'point_name' => 'テスト地点',
                'latitude' => '36.123456',
                'longitude' => '140.123456'
            ]
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getPointInfo')
            ->once()
            ->with(1)
            ->andReturn($pointInfo);

        // テスト実行
        $response = $this->commonController->getPointInfo($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($pointInfo[0], $responseData['pointInfo']);
    }

    #[Test]
    public function getPointInfo_【失敗】採水地点情報取得()
    {
        // テストデータの準備
        $request = new Request([
            'point_no' => 1
        ]);

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getPointInfo')
            ->once()
            ->with(1)
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getPointInfo($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getPointInfo', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '地点情報']], $responseData['errors']['getPointInfo']);
    }

    #[Test]
    public function getMenuLabelSelection_【成功】メニューラベルの選択肢取得()
    {
        // テストデータの準備
        $parentMenuData = [
            ['parent_menu_no' => 1, 'parent_menu_name' => '親メニュー1']
        ];
        
        $parentMenuReportData = [
            ['parent_menu_no' => 1, 'parent_menu_name' => '報告書親メニュー1']
        ];
        
        $affiliationData = [
            ['affiliation_section_no' => 1, 'affiliation_section_name' => '水質課']
        ];
        
        $refMenuData = [
            ['ref_menu_no' => 1, 'ref_menu_name' => '参照画面1']
        ];
        
        $refRptMenuData = [
            ['ref_rpt_menu_no' => 1, 'ref_rpt_menu_name' => '参照報告書1']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getParentMenuData')
            ->once()
            ->andReturn($parentMenuData);

        $this->commonServiceMock
            ->shouldReceive('getParentMenuReportData')
            ->once()
            ->andReturn($parentMenuReportData);

        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn($affiliationData);

        $this->commonServiceMock
            ->shouldReceive('getRefMenuData')
            ->once()
            ->andReturn($refMenuData);

        $this->commonServiceMock
            ->shouldReceive('getRefRptMenuListData')
            ->once()
            ->andReturn($refRptMenuData);

        // テスト実行
        $response = $this->commonController->getMenuLabelSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($parentMenuData, $responseData['parentMenuData']);
        $this->assertEquals($parentMenuReportData, $responseData['getParentMenuReportData']);
        $this->assertEquals($affiliationData, $responseData['affiliationData']);
        $this->assertEquals($refMenuData, $responseData['refMenuData']);
        $this->assertEquals($refRptMenuData, $responseData['refRptMenuData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function getMenuLabelSelection_【失敗】メニューラベルの選択肢取得()
    {
        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getParentMenuData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getMenuLabelSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getParentMenuData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '入力画面用の親ラベル']], $responseData['errors']['getParentMenuData']);
    }

    #[Test]
    public function getItemSettingSelection_【成功】検査項目設定子画面表示処理()
    {
        // テストデータの準備
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目'],
            ['dai_category_no' => '02', 'dai_category_name' => '化学項目']
        ];
        
        $itemTyuCategoryData = [
            ['tyu_category_no' => '01', 'tyu_category_name' => '基本項目'],
            ['tyu_category_no' => '02', 'tyu_category_name' => '金属項目']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn($itemDaiCategoryData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemTyuCategoryData')
            ->once()
            ->andReturn($itemTyuCategoryData);

        // テスト実行
        $response = $this->commonController->getItemSettingSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($itemDaiCategoryData, $responseData['itemDaiCategoryData']);
        $this->assertEquals($itemTyuCategoryData, $responseData['itemTyuCategoryData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function getItemSettingSelection_【失敗】検査項目設定子画面表示処理()
    {
        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getItemSettingSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchItemDaiCategoryData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査項目大分類マスタ']], $responseData['errors']['fetchItemDaiCategoryData']);
    }

    #[Test]
    public function getSaisuiPointSelection_【成功】採水地点一覧に使用するセレクトボックス処理()
    {
        // テストデータの準備
        $sisetuData = [
            ['sisetu_no' => 1, 'sisetu_name' => '施設A'],
            ['sisetu_no' => 2, 'sisetu_name' => '施設B']
        ];
        
        $processData = [
            ['process_no' => 1, 'process_name' => '処理過程A'],
            ['process_no' => 2, 'process_name' => '処理過程B']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchSisetuData')
            ->once()
            ->andReturn($sisetuData);

        $this->commonServiceMock
            ->shouldReceive('fetchProcessData')
            ->once()
            ->andReturn($processData);

        // テスト実行
        $response = $this->commonController->getSaisuiPointSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($sisetuData, $responseData['sisetuData']);
        $this->assertEquals($processData, $responseData['processData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function getSaisuiPointSelection_【失敗】採水地点一覧に使用するセレクトボックス処理()
    {
        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchSisetuData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->getSaisuiPointSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchSisetuData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '施設マスタ']], $responseData['errors']['fetchSisetuData']);
    }

    #[Test]
    public function fetchManualVideoList_【成功】動画マニュアル情報取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $manualVideoList = [
            [
                'video_no' => 1,
                'video_title' => '操作マニュアル1',
                'video_url' => 'https://example.com/video1',
                'video_description' => '基本操作について'
            ],
            [
                'video_no' => 2,
                'video_title' => '操作マニュアル2',
                'video_url' => 'https://example.com/video2',
                'video_description' => '応用操作について'
            ]
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchManualVideoList')
            ->once()
            ->andReturn($manualVideoList);

        // テスト実行
        $response = $this->commonController->fetchManualVideoList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($manualVideoList, $responseData['manualVideoList']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function fetchManualVideoList_【失敗】動画マニュアル情報取得()
    {
        // テストデータの準備
        $request = new Request();

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchManualVideoList')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->commonController->fetchManualVideoList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchManualVideoList', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '動画マニュアルマスタ']], $responseData['errors']['fetchManualVideoList']);
    }

    #[Test]
    public function getMenuLabelSelection_【成功】レスポンス構造確認()
    {
        // テストデータの準備
        $parentMenuData = [
            ['parent_menu_no' => 1, 'parent_menu_name' => '親メニュー1']
        ];
        
        $parentMenuReportData = [
            ['parent_menu_no' => 1, 'parent_menu_name' => '報告書親メニュー1']
        ];
        
        $affiliationData = [
            ['affiliation_section_no' => 1, 'affiliation_section_name' => '水質課']
        ];
        
        $refMenuData = [
            ['ref_menu_no' => 1, 'ref_menu_name' => '参照画面1']
        ];
        
        $refRptMenuData = [
            ['ref_rpt_menu_no' => 1, 'ref_rpt_menu_name' => '参照報告書1']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getParentMenuData')
            ->once()
            ->andReturn($parentMenuData);

        $this->commonServiceMock
            ->shouldReceive('getParentMenuReportData')
            ->once()
            ->andReturn($parentMenuReportData);

        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn($affiliationData);

        $this->commonServiceMock
            ->shouldReceive('getRefMenuData')
            ->once()
            ->andReturn($refMenuData);

        $this->commonServiceMock
            ->shouldReceive('getRefRptMenuListData')
            ->once()
            ->andReturn($refRptMenuData);

        // テスト実行
        $response = $this->commonController->getMenuLabelSelection();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        
        // レスポンス構造の確認
        $this->assertArrayHasKey('status', $responseData);
        $this->assertArrayHasKey('parentMenuData', $responseData);
        $this->assertArrayHasKey('getParentMenuReportData', $responseData);
        $this->assertArrayHasKey('affiliationData', $responseData);
        $this->assertArrayHasKey('refMenuData', $responseData);
        $this->assertArrayHasKey('refRptMenuData', $responseData);
        $this->assertArrayHasKey('displayTime', $responseData);
        
        // displayTimeの形式確認（YYYY-MM-DD HH:MM:SS）
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $responseData['displayTime']);
    }
}
