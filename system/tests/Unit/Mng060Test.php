<?php

namespace Tests\Unit;

use App\Http\Controllers\Mng060Controller;
use App\Services\CommonService;
use App\Services\Mng060Service;
use App\Http\Requests\Mng060Request;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Mng060Test extends TestCase
{
    protected $commonServiceMock;
    protected $mng060Controller;
    protected $mng060ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->mng060ServiceMock = Mockery::mock(Mng060Service::class);
        
        // コントローラーのインスタンス作成
        $this->mng060Controller = new Mng060Controller();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->mng060Controller);
        $mng060ServiceProperty = $reflection->getProperty('Mng060Service');
        $mng060ServiceProperty->setAccessible(true);
        $mng060ServiceProperty->setValue($this->mng060Controller, $this->mng060ServiceMock);
        
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->mng060Controller, $this->commonServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function getReportMenu_【成功】報告書メニュー取得()
    {
        // テストデータの準備
        $request = new Request([
            'affiliation_section_no' => 1,
            'security_level' => 1
        ]);
        
        $reportMenuData = [
            ['report_no' => '001', 'report_name' => '日報'],
            ['report_no' => '002', 'report_name' => '週報']
        ];

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('getReportMenu')
            ->once()
            ->with(1, 1)
            ->andReturn($reportMenuData);

        // テスト実行
        $response = $this->mng060Controller->getReportMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals($reportMenuData, $responseData);
    }

    #[Test]
    public function getReportMenu_【失敗】報告書メニュー取得()
    {
        // テストデータの準備
        $request = new Request([
            'affiliation_section_no' => 1,
            'security_level' => 1
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('getReportMenu')
            ->once()
            ->with(1, 1)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng060Controller->getReportMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('報告書メニュー', $responseData['errors']);
        $this->assertEquals([['WQ-0006E']], $responseData['errors']['報告書メニュー']);
    }

    #[Test]
    public function saveMenuLabel_【成功】メニューラベル登録()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'process_name' => 'menu_add',
            'report_title' => '新規メニューラベル',
            'report_parent_menu_no' => 1
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('saveMenuLabel')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->saveMenuLabel($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveMenuLabel_【失敗】メニューラベル登録_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'process_name' => 'menu_add',
            'report_title' => '新規メニューラベル',
            'report_parent_menu_no' => 1
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('saveMenuLabel')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->saveMenuLabel($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('MNG060Controller_saveMenuLabel', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['MNG060Controller_saveMenuLabel']);
    }

    #[Test]
    public function saveMenuLabel_【失敗】メニューラベル登録_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'process_name' => 'menu_edit',
            'report_title' => '更新メニューラベル',
            'report_menu_no' => 1
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('saveMenuLabel')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->saveMenuLabel($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('MNG060Controller_saveMenuLabel', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['MNG060Controller_saveMenuLabel']);
    }

    #[Test]
    public function saveMenuLabel_【失敗】メニューラベル登録_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'process_name' => 'menu_edit',
            'report_title' => '更新メニューラベル',
            'report_menu_no' => 1
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('saveMenuLabel')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->saveMenuLabel($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('MNG060Controller_saveMenuLabel', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['MNG060Controller_saveMenuLabel']);
    }

    #[Test]
    public function exchangeMenuOrder_【成功】メニューの順序更新処理()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'cur_menu_no' => 1,
            'target_menu_no' => 2,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('exchangeMenuOrder')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->exchangeMenuOrder($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function exchangeMenuOrder_【失敗】メニューの順序更新処理_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'cur_menu_no' => 1,
            'target_menu_no' => 2,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('exchangeMenuOrder')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->exchangeMenuOrder($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('MNG060Controller_exchangeMenuOrder', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['MNG060Controller_exchangeMenuOrder']);
    }

    #[Test]
    public function getRptConfig_【成功】報告書情報取得()
    {
        // テストデータの準備
        $request = new Request(['report_no' => '001']);
        
        $configData = ['report_no' => '001', 'report_name' => 'テスト報告書'];
        $itemData = [['item_no' => 1, 'item_name' => 'pH']];
        $pointData = [['point_no' => 1, 'point_name' => '地点A']];
        $textData = [['text_no' => 1, 'text_content' => '固定文言']];
        $monthListData = [];
        $menuOpt = [['value' => 1, 'label' => 'メニュー1']];
        $pointOpt = [['value' => 1, 'label' => '地点1']];
        $kbnOpt = [['value' => '01', 'label' => '水質検査']];
        $typeOpt = [['value' => '1', 'label' => '日報']];
        $itemOpt = [['value' => 1, 'label' => 'pH']];
        $rptOpt = [['value' => '001', 'label' => '報告書1']];
        $displayTime = ['display_time' => '2025-01-01 10:00:00.000'];

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('getRptConfig')
            ->once()
            ->with($request)
            ->andReturn($configData);

        $this->mng060ServiceMock
            ->shouldReceive('getRptItem')
            ->once()
            ->with($request)
            ->andReturn($itemData);

        $this->mng060ServiceMock
            ->shouldReceive('getRptPoint')
            ->once()
            ->with($request)
            ->andReturn($pointData);

        $this->mng060ServiceMock
            ->shouldReceive('getRptText')
            ->once()
            ->with($request)
            ->andReturn($textData);

        // $this->mng060ServiceMock
        //     ->shouldReceive('getSisetuNo')
        //     ->once()
        //     ->with($request)
        //     ->andReturn('');

        $this->mng060ServiceMock
            ->shouldReceive('getRptMonthList')
            ->once()
            ->with('')
            ->andReturn($monthListData);

        $this->mng060ServiceMock
            ->shouldReceive('optionInputMenu')
            ->once()
            ->andReturn($menuOpt);

        $this->mng060ServiceMock
            ->shouldReceive('optionPoint')
            ->once()
            ->andReturn($pointOpt);

        $this->mng060ServiceMock
            ->shouldReceive('optionInspectionKbn')
            ->once()
            ->andReturn($kbnOpt);

        $this->mng060ServiceMock
            ->shouldReceive('optionRptType')
            ->once()
            ->andReturn($typeOpt);

        $this->mng060ServiceMock
            ->shouldReceive('optionRptItem')
            ->once()
            ->andReturn($itemOpt);

        $this->mng060ServiceMock
            ->shouldReceive('optionReport')
            ->once()
            ->andReturn($rptOpt);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->twice()
            ->andReturn($displayTime);

        // テスト実行
        $response = $this->mng060Controller->getRptConfig($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals($configData, $responseData['config']);
        $this->assertEquals($itemData, $responseData['item']);
        $this->assertEquals($pointData, $responseData['point']);
        $this->assertEquals($textData, $responseData['text']);
        $this->assertEquals($monthListData, $responseData['monthList']);
        $this->assertEquals($menuOpt, $responseData['menuOpt']);
        $this->assertEquals($pointOpt, $responseData['pointOpt']);
        $this->assertEquals($kbnOpt, $responseData['kbnOpt']);
        $this->assertEquals($typeOpt, $responseData['typeOpt']);
        $this->assertEquals($itemOpt, $responseData['itemOpt']);
        $this->assertEquals($rptOpt, $responseData['reportOpt']);
        $this->assertEquals($displayTime, $responseData['time']);
    }

    #[Test]
    public function getRptConfig_【失敗】報告書構成取得()
    {
        // テストデータの準備
        $request = new Request(['report_no' => '001']);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('getRptConfig')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng060Controller->getRptConfig($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getRptConfig_config', $responseData['errors']);
    }

    #[Test]
    public function duplicateInputMenuRpt_【成功】類似報告書作成処理()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'report_menu_no' => 1,
            'report_title' => '複製テスト報告書'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('duplicateInputMenuRpt')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->duplicateInputMenuRpt($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function duplicateInputMenuRpt_【失敗】類似報告書作成処理_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'report_menu_no' => 1,
            'report_title' => '複製テスト報告書'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('duplicateInputMenuRpt')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->duplicateInputMenuRpt($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('MNG060Controller_duplicateInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['MNG060Controller_duplicateInputMenuDsp']);
    }

    #[Test]
    public function saveInputMenuRpt_【成功】報告書新規登録()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'process_name' => 'rpt_add',
            'report_title' => '新規報告書'
        ]);

        $maxOrder = 10;
        $reportHierarchy = 1;
        $sisetuNo = 'S001';

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('getRptMenuOrder')
            ->once()
            ->andReturn($maxOrder);

        $this->mng060ServiceMock
            ->shouldReceive('getRptMenuParentHierarchy')
            ->once()
            ->with($request)
            ->andReturn($reportHierarchy);

        $this->mng060ServiceMock
            ->shouldReceive('getSisetuNo')
            ->once()
            ->with($request)
            ->andReturn($sisetuNo);

        $this->mng060ServiceMock
            ->shouldReceive('saveInputMenuRpt')
            ->once()
            ->with($request, $maxOrder, $reportHierarchy, $sisetuNo)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->saveInputMenuRpt($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveInputMenuRpt_【失敗】報告書新規登録_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Mng060Request([
            'process_name' => 'rpt_add',
            'report_title' => '新規報告書'
        ]);

        $maxOrder = 10;
        $reportHierarchy = 1;
        $sisetuNo = 'S001';

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('getRptMenuOrder')
            ->once()
            ->andReturn($maxOrder);

        $this->mng060ServiceMock
            ->shouldReceive('getRptMenuParentHierarchy')
            ->once()
            ->with($request)
            ->andReturn($reportHierarchy);

        $this->mng060ServiceMock
            ->shouldReceive('getSisetuNo')
            ->once()
            ->with($request)
            ->andReturn($sisetuNo);

        $this->mng060ServiceMock
            ->shouldReceive('saveInputMenuRpt')
            ->once()
            ->with($request, $maxOrder, $reportHierarchy, $sisetuNo)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->saveInputMenuRpt($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('排他チェック_新規登録➝データ存在', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['排他チェック_新規登録➝データ存在']);
    }

    #[Test]
    public function deleteReportMenu_【成功】メニュー削除処理()
    {
        // テストデータの準備
        $request = new Request([
            'report_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('deleteReportMenu')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->deleteReportMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.DELETE_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function deleteReportMenu_【失敗】メニュー削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Request([
            'report_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('deleteReportMenu')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng060Controller->deleteReportMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('MNG060Controller_deleteReportMenu', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['MNG060Controller_deleteReportMenu']);
    }

    #[Test]
    public function deleteReport_【成功】報告書削除処理()
    {
        // テストデータの準備
        $request = new Request([
            'sidemenu' => ['report_no' => '001'],
            'displayTime' => '2025-01-01 10:00:00.000'
        ]);

        $displayTime = ['display_time' => '2025-01-01 10:00:00.000'];

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('haitaCheck')
            ->once()
            ->with('001', '2025-01-01 10:00:00.000')
            ->andReturn(true);

        $this->mng060ServiceMock
            ->shouldReceive('deleteDataByReportNo')
            ->once()
            ->with('001')
            ->andReturn(true);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->twice()
            ->andReturn($displayTime);

        // テスト実行
        $response = $this->mng060Controller->deleteReport($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals($displayTime, $responseData['time']);
    }

    #[Test]
    public function deleteReport_【失敗】報告書削除処理_排他制御エラー()
    {
        // テストデータの準備
        $request = new Request([
            'sidemenu' => ['report_no' => '001'],
            'displayTime' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng060ServiceMock
            ->shouldReceive('haitaCheck')
            ->once()
            ->with('001', '2025-01-01 10:00:00.000')
            ->andReturn(false);

        // テスト実行
        $response = $this->mng060Controller->deleteReport($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('削除処理_排他制御', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['削除処理_排他制御']);
    }
}
