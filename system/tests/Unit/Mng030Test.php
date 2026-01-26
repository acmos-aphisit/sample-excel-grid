<?php

namespace Tests\Unit;

use App\Http\Controllers\Mng030Controller;
use App\Services\CommonService;
use App\Services\Mng030Service;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Mng030Test extends TestCase
{
    protected $mng030Controller;
    protected $commonServiceMock;
    protected $mng030ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->mng030ServiceMock = Mockery::mock(Mng030Service::class);
        
        // コントローラーのインスタンス作成
        $this->mng030Controller = new Mng030Controller();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->mng030Controller);
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->mng030Controller, $this->commonServiceMock);
        
        $mng030ServiceProperty = $reflection->getProperty('Mng030Service');
        $mng030ServiceProperty->setAccessible(true);
        $mng030ServiceProperty->setValue($this->mng030Controller, $this->mng030ServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function fetchInspItemData_【成功】検査項目大分類マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目'],
            ['dai_category_no' => '02', 'dai_category_name' => '化学項目']
        ];
        
        $itemTyuCategoryData = [
            ['tyu_category_no' => '01', 'tyu_category_name' => '基本項目'],
            ['tyu_category_no' => '02', 'tyu_category_name' => '金属項目']
        ];
        
        $inspItemData = [
            [
                'item_no' => 1,
                'item_dsp_name' => 'pH',
                'item_report_name' => 'pH値',
                'item_unit' => '',
                'dai_category_no' => '01',
                'tyu_category_no' => '01'
            ]
        ];
        
        $maxItemNo = [
            (object)['max_item_no' => 100]
        ];

        $displayTimeData = [];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn($itemDaiCategoryData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemTyuCategoryData')
            ->once()
            ->andReturn($itemTyuCategoryData);

        $this->mng030ServiceMock
            ->shouldReceive('fetchInspItemData')
            ->once()
            ->with($request)
            ->andReturn($inspItemData);

        $this->mng030ServiceMock
            ->shouldReceive('searchMaxItemNo')
            ->once()
            ->andReturn($maxItemNo);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng030Controller->fetchInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($inspItemData, $responseData['inspItemData']);
        $this->assertEquals($itemDaiCategoryData, $responseData['itemDaiCategoryData']);
        $this->assertEquals($itemTyuCategoryData, $responseData['itemTyuCategoryData']);
        $this->assertEquals(100, $responseData['maxItemNo']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function fetchInspItemData_【失敗】検査項目大分類マスタ取得()
    {
        // テストデータの準備
        $request = new Request();

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng030Controller->fetchInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchItemDaiCategoryData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査項目大分類マスタ']], $responseData['errors']['fetchItemDaiCategoryData']);
    }

    #[Test]
    public function fetchInspItemData_【失敗】検査項目中分類マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn($itemDaiCategoryData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemTyuCategoryData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng030Controller->fetchInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchItemTyuCategoryData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査項目中分類マスタ']], $responseData['errors']['fetchItemTyuCategoryData']);
    }

    #[Test]
    public function fetchInspItemData_【失敗】検査項目マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目']
        ];
        
        $itemTyuCategoryData = [
            ['tyu_category_no' => '01', 'tyu_category_name' => '基本項目']
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

        $this->mng030ServiceMock
            ->shouldReceive('fetchInspItemData')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng030Controller->fetchInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchInspItemData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査項目マスタ']], $responseData['errors']['fetchInspItemData']);
    }

    #[Test]
    public function fetchInspItemData_【失敗】最大検査項目番号取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目']
        ];
        
        $itemTyuCategoryData = [
            ['tyu_category_no' => '01', 'tyu_category_name' => '基本項目']
        ];
        
        $inspItemData = [
            [
                'item_no' => 1,
                'item_dsp_name' => 'pH',
                'item_report_name' => 'pH値',
                'item_unit' => '',
                'dai_category_no' => '01',
                'tyu_category_no' => '01'
            ]
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

        $this->mng030ServiceMock
            ->shouldReceive('fetchInspItemData')
            ->once()
            ->with($request)
            ->andReturn($inspItemData);

        $this->mng030ServiceMock
            ->shouldReceive('searchMaxItemNo')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng030Controller->fetchInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchMaxItemNo', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '最大の検査項目番号']], $responseData['errors']['searchMaxItemNo']);
    }

    #[Test]
    public function searchSelectOptionData_【成功】選択肢マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $selectOptionData = [
            [
                'selection_no' => 1,
                'selection_name' => '適合',
                'sort_value' => 1
            ],
            [
                'selection_no' => 2,
                'selection_name' => '不適合',
                'sort_value' => 2
            ]
        ];

        $displayTimeData = [];

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('searchSelectOptionData')
            ->once()
            ->with($request)
            ->andReturn($selectOptionData);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng030Controller->searchSelectOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($selectOptionData, $responseData['selectOptionList']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function searchSelectOptionData_【失敗】選択肢マスタ取得()
    {
        // テストデータの準備
        $request = new Request();

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('searchSelectOptionData')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng030Controller->searchSelectOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchSelectOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['searchSelectOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【成功】選択肢マスタ登録処理()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'selection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】選択肢マスタ登録処理_DBにデータ存在()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'selection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】選択肢マスタ登録処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'selection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】選択肢マスタ登録処理_他の検査項目が同一データを同時に更新()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'selection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】選択肢マスタ削除処理_対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'selection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】その他エラー()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'selection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng030Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveInspItemData_【成功】検査項目マスタ登録処理()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'itemDspName' => 'pH',
                    'itemReportName' => 'pH値',
                    'itemUnit' => '',
                    'daiCategoryNo' => '01',
                    'tyuCategoryNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'inspection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveInspItemData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveInspItemData_【失敗】検査項目マスタ登録処理_DBにデータ存在()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'itemDspName' => 'pH',
                    'itemReportName' => 'pH値',
                    'itemUnit' => '',
                    'daiCategoryNo' => '01',
                    'tyuCategoryNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'inspection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveInspItemData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspItemData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveInspItemData']);
    }

    #[Test]
    public function saveInspItemData_【失敗】検査項目マスタ登録処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'itemDspName' => 'pH',
                    'itemReportName' => 'pH値',
                    'itemUnit' => '',
                    'daiCategoryNo' => '01',
                    'tyuCategoryNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'inspection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveInspItemData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspItemData', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveInspItemData']);
    }

    #[Test]
    public function saveInspItemData_【失敗】検査項目マスタ登録処理_他の検査項目が同一データを同時に更新()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'itemDspName' => 'pH',
                    'itemReportName' => 'pH値',
                    'itemUnit' => '',
                    'daiCategoryNo' => '01',
                    'tyuCategoryNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'inspection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveInspItemData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspItemData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveInspItemData']);
    }

    #[Test]
    public function saveInspItemData_【失敗】検査項目マスタ削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'itemDspName' => 'pH',
                    'itemReportName' => 'pH値',
                    'itemUnit' => '',
                    'daiCategoryNo' => '01',
                    'tyuCategoryNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'inspection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveInspItemData')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng030Controller->saveInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspItemData', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveInspItemData']);
    }

    #[Test]
    public function saveInspItemData_【失敗】その他エラー()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'itemDspName' => 'pH',
                    'itemReportName' => 'pH値',
                    'itemUnit' => '',
                    'daiCategoryNo' => '01',
                    'tyuCategoryNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00',
            'validateMode' => 'inspection'
        ];

        $request = new \App\Http\Requests\Mng030Request($requestData);

        // モックの設定
        $this->mng030ServiceMock
            ->shouldReceive('saveInspItemData')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng030Controller->saveInspItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspItemData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveInspItemData']);
    }
}
