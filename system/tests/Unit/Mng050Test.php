<?php

namespace Tests\Unit;

use App\Http\Controllers\Mng050Controller;
use App\Services\CommonService;
use App\Services\Mng050Service;
use App\Http\Requests\Mng050Request;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Mng050Test extends TestCase
{
    protected $commonServiceMock;
    protected $mng050Controller;
    protected $mng050ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->mng050ServiceMock = Mockery::mock(Mng050Service::class);
        
        // コントローラーのインスタンス作成
        $this->mng050Controller = new Mng050Controller();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->mng050Controller);
        $mng050ServiceProperty = $reflection->getProperty('Mng050Service');
        $mng050ServiceProperty->setAccessible(true);
        $mng050ServiceProperty->setValue($this->mng050Controller, $this->mng050ServiceMock);
        
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->mng050Controller, $this->commonServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function getSelectedMenu_【成功】選択メニュー取得失敗()
    {
        // テストデータの準備
        $request = new Request(['input_dsp_no' => 1]);
        
        $selectedMenuData = [
            'input_dsp_no' => 1,
            'input_title' => 'テスト入力画面',
            'inspection_kbn' => '01'
        ];
        
        $inspectionLists = [
            ['inspection_kbn' => '01', 'inspection_name' => '水質検査'],
            ['inspection_kbn' => '02', 'inspection_name' => '大気検査']
        ];
        
        $inputItems = [
            (object) ['item_no' => 1, 'item_name' => 'pH'],
            (object) ['item_no' => 2, 'item_name' => 'DO']
        ];

        $inputItemsExpect = [
            ['item_no' => 1, 'item_name' => 'pH'],
            ['item_no' => 2, 'item_name' => 'DO']
        ];
        
        $inputInitItems = [
            ['item_no' => 1, 'init_value' => '7.0'],
            ['item_no' => 2, 'init_value' => '8.0']
        ];
        
        $inputPoints = [
            (object) ['point_no' => 1, 'point_name' => '地点A'],
            (object) ['point_no' => 2, 'point_name' => '地点B']
        ];

        $inputPointsExpect = [
            ['point_no' => 1, 'point_name' => '地点A'],
            ['point_no' => 2, 'point_name' => '地点B']
        ];
        
        $inputMask = [
            (object) ['item_no' => 1, 'point_no' => 1, 'mask_value' => '999.9'],
            (object) ['item_no' => 2, 'point_no' => 1, 'mask_value' => '999.9']
        ];

        $inputMaskExpect = [
            ['item_no' => 1, 'point_no' => 1, 'mask_value' => '999.9'],
            ['item_no' => 2, 'point_no' => 1, 'mask_value' => '999.9']
        ];
        
        $saisuiPointData = [
            ['point_no' => 1, 'point_name' => '採水地点A'],
            ['point_no' => 2, 'point_name' => '採水地点B']
        ];

        $displayTimeData = [];

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('getSelectedMenu')
            ->once()
            ->with($request)
            ->andReturn($selectedMenuData);

        $this->mng050ServiceMock
            ->shouldReceive('getInspectionLists')
            ->once()
            ->andReturn($inspectionLists);

        $this->mng050ServiceMock
            ->shouldReceive('fetchInputPoints')
            ->once()
            ->with($request)
            ->andReturn($inputPoints);

        $this->mng050ServiceMock
            ->shouldReceive('fetchInputItems')
            ->once()
            ->with($request)
            ->andReturn($inputItems);

        $this->mng050ServiceMock
            ->shouldReceive('fetchInputInitItems')
            ->once()
            ->with($request)
            ->andReturn($inputInitItems);

        $this->mng050ServiceMock
            ->shouldReceive('fetchInputMask')
            ->once()
            ->with($request, [1, 2], [1, 2])
            ->andReturn($inputMask);

        $this->mng050ServiceMock
            ->shouldReceive('fetchSelectionPoint')
            ->once()
            ->andReturn($saisuiPointData);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng050Controller->getSelectedMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($selectedMenuData, $responseData['configDspData']);
        $this->assertEquals($inspectionLists, $responseData['inspectionLists']);
        $this->assertEquals($inputItemsExpect, $responseData['itemData']);
        $this->assertEquals($inputInitItems, $responseData['initItemData']);
        $this->assertEquals($inputPointsExpect, $responseData['pointData']);
        $this->assertEquals($inputMaskExpect, $responseData['inputMask']);
        $this->assertEquals($saisuiPointData, $responseData['saisuiPointData']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function getSelectedMenu_【失敗】選択メニュー取得()
    {
        // テストデータの準備
        $request = new Request(['input_dsp_no' => 1]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('getSelectedMenu')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng050Controller->getSelectedMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getSelectedMenu', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['getSelectedMenu']);
    }

    #[Test]
    public function getSelectedMenu_【失敗】検査リスト取得()
    {
        // テストデータの準備
        $request = new Request(['input_dsp_no' => 1]);
        
        $selectedMenuData = [
            'input_dsp_no' => 1,
            'input_title' => 'テスト入力画面'
        ];

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('getSelectedMenu')
            ->once()
            ->with($request)
            ->andReturn($selectedMenuData);

        $this->mng050ServiceMock
            ->shouldReceive('getInspectionLists')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng050Controller->getSelectedMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getSelectedMenu', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['getSelectedMenu']);
    }

    #[Test]
    public function duplicateInputMenuDsp_【成功】類似入力画面作成処理()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'input_menu_no' => 1,
            'input_title' => '複製テスト画面'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('duplicateInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->duplicateInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function duplicateInputMenuDsp_【失敗】類似入力画面作成処理_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'input_menu_no' => 1,
            'input_title' => '複製テスト画面'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('duplicateInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->duplicateInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('duplicateInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['duplicateInputMenuDsp']);
    }

    #[Test]
    public function duplicateInputMenuDsp_【失敗】その他エラー()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'input_menu_no' => 1,
            'input_title' => '複製テスト画面'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('duplicateInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng050Controller->duplicateInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('duplicateInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['duplicateInputMenuDsp']);
    }

    #[Test]
    public function saveInputMenuDsp_【成功】入力画面登録処理()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'process_name' => 'dsp_add',
            'input_title' => '新規入力画面',
            'input_parent_menu_no' => 1,
            'affiliation_section_no' => 1
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveInputMenuDsp_【失敗】入力画面登録処理_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'process_name' => 'dsp_add',
            'input_title' => '新規入力画面',
            'input_parent_menu_no' => 1,
            'affiliation_section_no' => 1
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveInputMenuDsp']);
    }

    #[Test]
    public function saveInputMenuDsp_【失敗】入力画面登録処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'process_name' => 'dsp_edit',
            'input_title' => '更新入力画面',
            'input_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveInputMenuDsp']);
    }

    #[Test]
    public function saveInputMenuDsp_【失敗】入力画面登録処理_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'process_name' => 'dsp_edit',
            'input_title' => '更新入力画面',
            'input_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveInputMenuDsp']);
    }

    #[Test]
    public function saveInputMenuDsp_【失敗】入力画面削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'process_name' => 'dsp_delete',
            'input_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveInputMenuDsp')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveInputMenuDsp($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInputMenuDsp', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveInputMenuDsp']);
    }

    #[Test]
    public function saveMenuLabel_【成功】メニューラベル登録()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'process_name' => 'menu_add',
            'input_title' => '新規メニューラベル',
            'input_parent_menu_no' => 1,
            'affiliation_section_no' => 1
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveMenuLabel')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveMenuLabel($request);

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
        $request = new Mng050Request([
            'process_name' => 'menu_add',
            'input_title' => '新規メニューラベル',
            'input_parent_menu_no' => 1,
            'affiliation_section_no' => 1
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveMenuLabel')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveMenuLabel($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveMenuLabel', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveMenuLabel']);
    }

    #[Test]
    public function exchangeMenuOrder_【成功】メニューの順序更新処理()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'cur_menu_no' => 1,
            'target_menu_no' => 2,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('exchangeMenuOrder')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->exchangeMenuOrder($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function exchangeMenuOrder_【失敗】メニューの順序更新処理_他のユーザがを同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'cur_menu_no' => 1,
            'target_menu_no' => 2,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('exchangeMenuOrder')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->exchangeMenuOrder($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('exchangeMenuOrder', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['exchangeMenuOrder']);
    }

    #[Test]
    public function deleteInputMenu_【成功】メニュー削除処理()
    {
        // テストデータの準備
        $request = new Mng050Request([
            'input_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('deleteInputMenu')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->deleteInputMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.DELETE_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function deleteInputMenu_【失敗】メニュー削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Request([
            'input_menu_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('deleteInputMenu')
            ->once()
            ->with($request)
            ->andReturn(999);

        // テスト実行
        $response = $this->mng050Controller->deleteInputMenu($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('deleteInputMenu', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['deleteInputMenu']);
    }

    #[Test]
    public function searchInspItem_【成功】検索項目マスタ取得()
    {
        // テストデータの準備
        $request = new Request([
            'search_keyword' => 'pH'
        ]);
        
        $inspItemData = [
            ['item_no' => 1, 'item_name' => 'pH', 'unit' => ''],
            ['item_no' => 2, 'item_name' => 'pH(現場)', 'unit' => '']
        ];

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('searchInspItem')
            ->once()
            ->with($request)
            ->andReturn($inspItemData);

        // テスト実行
        $response = $this->mng050Controller->searchInspItem($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($inspItemData, $responseData['inspItemData']);
    }

    #[Test]
    public function searchInspItem_【失敗】検索項目マスタ取得()
    {
        // テストデータの準備
        $request = new Request([
            'search_keyword' => 'pH'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('searchInspItem')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng050Controller->searchInspItem($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchInspItem', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['searchInspItem']);
    }

    #[Test]
    public function saveDspConfigData_【成功】入力画面構成登録処理()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                'dsp_config_data' => [
                    'input_dsp_no' => 1,
                    'input_title' => '更新画面構成'
                ],
                'dsp_point_data' => [
                    ['input_dsp_no' => 1, 'point_no' => 1]
                ],
                'dsp_item_data' => [
                    ['input_dsp_no' => 1, 'item_no' => 1]
                ],
                'dsp_mask_data' => [
                    ['input_dsp_no' => 1, 'item_no' => 1, 'point_no' => 1]
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveDspConfigData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveDspConfigData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveDspConfigData_【失敗】入力画面構成登録処理_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                'dsp_config_data' => [
                    'input_dsp_no' => 1,
                    'input_title' => '更新画面構成'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('saveDspConfigData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->saveDspConfigData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveDspConfigData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveDspConfigData']);
    }

    #[Test]
    public function discardDspConfigData_【成功】入力画面構成取消処理()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_discard' => [
                'dsp_config_data' => [
                    'input_dsp_no' => 1
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('discardDspConfigData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->discardDspConfigData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function discardDspConfigData_【失敗】入力画面構成取消処理_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_discard' => [
                'dsp_config_data' => [
                    'input_dsp_no' => 1
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng050ServiceMock
            ->shouldReceive('discardDspConfigData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng050Controller->discardDspConfigData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('discardDspConfigData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['discardDspConfigData']);
    }
}
