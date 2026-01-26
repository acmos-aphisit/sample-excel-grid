<?php

namespace Tests\Unit;

use App\Http\Controllers\Mng040Controller;
use App\Services\CommonService;
use App\Services\Mng040Service;
use Illuminate\Http\Request;
use App\Http\Requests\Mng040Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Mng040Test extends TestCase
{
    protected $mng040Controller;
    protected $commonServiceMock;
    protected $mng040ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->mng040ServiceMock = Mockery::mock(Mng040Service::class);
        
        // コントローラーのインスタンス作成
        $this->mng040Controller = new Mng040Controller();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->mng040Controller);
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->mng040Controller, $this->commonServiceMock);
        
        $mng040ServiceProperty = $reflection->getProperty('Mng040Service');
        $mng040ServiceProperty->setAccessible(true);
        $mng040ServiceProperty->setValue($this->mng040Controller, $this->mng040ServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function fetchInspCriteriaData_【成功】検査基準マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $houkijyunList = [
            ['hou_kijyun_no' => '2023', 'hou_kijyun_name' => '2023年度'],
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期'],
            ['saisui_kbn_no' => '02', 'saisui_kbn_name' => '臨時']
        ];
        
        $inspCriteriaData = [
            [
                'item_no' => 1,
                'point_no' => 1,
                'regulation_up_limit' => '8.5',
                'regulation_low_limit' => '5.8',
                'apply_year' => '2024'
            ]
        ];
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目'],
            ['dai_category_no' => '02', 'dai_category_name' => '化学項目']
        ];
        
        $itemTyuCategoryData = [
            ['tyu_category_no' => '01', 'tyu_category_name' => '基本項目'],
            ['tyu_category_no' => '02', 'tyu_category_name' => '金属項目']
        ];
        
        $latestYear = [
            (object)['latest_year' => 2024]
        ];

        $displayTimeData = [];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng040ServiceMock
            ->shouldReceive('searchInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn($inspCriteriaData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn($itemDaiCategoryData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemTyuCategoryData')
            ->once()
            ->andReturn($itemTyuCategoryData);

        $this->mng040ServiceMock
            ->shouldReceive('getLatestYear')
            ->once()
            ->andReturn($latestYear);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($inspCriteriaData, $responseData['inspCriteriaData']);
        $this->assertEquals($houkijyunList, $responseData['houKijyunNoList']);
        $this->assertEquals($saisuiKbnData, $responseData['saisuiKbnList']);
        $this->assertEquals($itemDaiCategoryData, $responseData['itemDaiCategoryData']);
        $this->assertEquals($itemTyuCategoryData, $responseData['itemTyuCategoryData']);
        $this->assertEquals(2024, $responseData['latestYear']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function fetchInspCriteriaData_【失敗】法基準リスト取得()
    {
        // テストデータの準備
        $request = new Request();

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchInspCriteriaHoukijyunList', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査基準マスタ']], $responseData['errors']['fetchInspCriteriaHoukijyunList']);
    }

    #[Test]
    public function fetchInspCriteriaData_【失敗】採水区分マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $houkijyunList = [
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchSaisuiKbnData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '採水区分マスタ']], $responseData['errors']['fetchSaisuiKbnData']);
    }

    #[Test]
    public function fetchInspCriteriaData_【失敗】検査基準マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $houkijyunList = [
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期']
        ];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng040ServiceMock
            ->shouldReceive('searchInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchInspCriteriaData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査基準マスタ']], $responseData['errors']['searchInspCriteriaData']);
    }

    #[Test]
    public function fetchInspCriteriaData_【失敗】検査項目大分類マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $houkijyunList = [
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期']
        ];
        
        $inspCriteriaData = [
            [
                'item_no' => 1,
                'point_no' => 1,
                'regulation_up_limit' => '8.5',
                'regulation_low_limit' => '5.8',
                'apply_year' => '2024'
            ]
        ];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng040ServiceMock
            ->shouldReceive('searchInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn($inspCriteriaData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchItemDaiCategoryData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査項目大分類マスタ']], $responseData['errors']['fetchItemDaiCategoryData']);
    }

    #[Test]
    public function fetchInspCriteriaData_【失敗】検査項目中分類マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $houkijyunList = [
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期']
        ];
        
        $inspCriteriaData = [
            [
                'item_no' => 1,
                'point_no' => 1,
                'regulation_up_limit' => '8.5',
                'regulation_low_limit' => '5.8',
                'apply_year' => '2024'
            ]
        ];
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目']
        ];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng040ServiceMock
            ->shouldReceive('searchInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn($inspCriteriaData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn($itemDaiCategoryData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemTyuCategoryData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchItemTyuCategoryData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査項目中分類マスタ']], $responseData['errors']['fetchItemTyuCategoryData']);
    }

    #[Test]
    public function fetchInspCriteriaData_【失敗】最新年度取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $houkijyunList = [
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期']
        ];
        
        $inspCriteriaData = [
            [
                'item_no' => 1,
                'point_no' => 1,
                'regulation_up_limit' => '8.5',
                'regulation_low_limit' => '5.8',
                'apply_year' => '2024'
            ]
        ];
        
        $itemDaiCategoryData = [
            ['dai_category_no' => '01', 'dai_category_name' => '物理項目']
        ];
        
        $itemTyuCategoryData = [
            ['tyu_category_no' => '01', 'tyu_category_name' => '基本項目']
        ];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng040ServiceMock
            ->shouldReceive('searchInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn($inspCriteriaData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemDaiCategoryData')
            ->once()
            ->andReturn($itemDaiCategoryData);

        $this->commonServiceMock
            ->shouldReceive('fetchItemTyuCategoryData')
            ->once()
            ->andReturn($itemTyuCategoryData);

        $this->mng040ServiceMock
            ->shouldReceive('getLatestYear')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('getLatestYear', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['getLatestYear']);
    }

    #[Test]
    public function fetchInspCriteriaHoukijyunList_【成功】法基準選択肢マスタ取得()
    {
        // テストデータの準備
        $houkijyunList = [
            ['hou_kijyun_no' => '2023', 'hou_kijyun_name' => '2023年度'],
            ['hou_kijyun_no' => '2024', 'hou_kijyun_name' => '2024年度']
        ];

        $displayTimeData = [];

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn($houkijyunList);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaHoukijyunList();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($houkijyunList, $responseData['applyYearList']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function fetchInspCriteriaHoukijyunList_【失敗】法基準選択肢マスタ取得()
    {
        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('fetchInspCriteriaHoukijyunList')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng040Controller->fetchInspCriteriaHoukijyunList();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchInspCriteriaHoukijyunList', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '検査基準マスタ']], $responseData['errors']['fetchInspCriteriaHoukijyunList']);
    }

    #[Test]
    public function saveSelectionOptionData_【成功】検査基準マスタ登録処理()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】検査基準マスタ登録処理_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】検査基準マスタ登録処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】検査基準マスタ登録処理_他の検査項目が同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveSelectionOptionData_【失敗】検査基準マスタ削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveSelectionOptionData($request);

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
        $request = new Request([
            'data_to_save' => [
                [
                    'selectionNo' => 1,
                    'selectionName' => '適合',
                    'sortValue' => 1
                ]
            ],
            'item_no' => 1,
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveSelectionOptionData')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng040Controller->saveSelectionOptionData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSelectionOptionData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveSelectionOptionData']);
    }

    #[Test]
    public function saveInspCriteriaData_【成功】検査基準マスタ登録処理()
    {
        // テストデータの準備
        $request = new Mng040Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8',
                    'applyYear' => '2024'
                ]
            ],
            'apply_year' => '2024',
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveInspCriteriaData_【失敗】検査基準マスタ登録処理_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Mng040Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8',
                    'applyYear' => '2024'
                ]
            ],
            'apply_year' => '2024',
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspCriteriaData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveInspCriteriaData']);
    }

    #[Test]
    public function saveInspCriteriaData_【失敗】検査基準マスタ登録処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Mng040Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8',
                    'applyYear' => '2024'
                ]
            ],
            'apply_year' => '2024',
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspCriteriaData', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveInspCriteriaData']);
    }

    #[Test]
    public function saveInspCriteriaData_【失敗】検査基準マスタ登録処理_他の検査項目が同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Mng040Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8',
                    'applyYear' => '2024'
                ]
            ],
            'apply_year' => '2024',
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspCriteriaData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveInspCriteriaData']);
    }

    #[Test]
    public function saveInspCriteriaData_【失敗】検査基準マスタ削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Mng040Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8',
                    'applyYear' => '2024'
                ]
            ],
            'apply_year' => '2024',
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->saveInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspCriteriaData', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveInspCriteriaData']);
    }

    #[Test]
    public function saveInspCriteriaData_【失敗】その他エラー()
    {
        // テストデータの準備
        $request = new Mng040Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8',
                    'applyYear' => '2024'
                ]
            ],
            'apply_year' => '2024',
            'display_time' => '2025-01-01 10:00:00.000'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('saveInspCriteriaData')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng040Controller->saveInspCriteriaData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveInspCriteriaData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveInspCriteriaData']);
    }

    #[Test]
    public function addNextYearInspCriteria_【成功】適用年度追加処理()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8'
                ]
            ],
            'addNextYear' => '2025',
            'latestYear' => '2024'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('addNextYearInspCriteria')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->addNextYearInspCriteria($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function addNextYearInspCriteria_【失敗】適用年度追加処理_DBにデータ存在()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8'
                ]
            ],
            'addNextYear' => '2025',
            'latestYear' => '2024'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('addNextYearInspCriteria')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->addNextYearInspCriteria($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('addNextYearInspCriteria', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['addNextYearInspCriteria']);
    }

    #[Test]
    public function addNextYearInspCriteria_【失敗】適用年度追加処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8'
                ]
            ],
            'addNextYear' => '2025',
            'latestYear' => '2024'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('addNextYearInspCriteria')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->addNextYearInspCriteria($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('addNextYearInspCriteria', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['addNextYearInspCriteria']);
    }

    #[Test]
    public function addNextYearInspCriteria_【失敗】適用年度追加処理_他の検査項目が同一データを同時に更新()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8'
                ]
            ],
            'addNextYear' => '2025',
            'latestYear' => '2024'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('addNextYearInspCriteria')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->addNextYearInspCriteria($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('addNextYearInspCriteria', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['addNextYearInspCriteria']);
    }

    #[Test]
    public function addNextYearInspCriteria_【失敗】適用年度削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8'
                ]
            ],
            'addNextYear' => '2025',
            'latestYear' => '2024'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('addNextYearInspCriteria')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng040Controller->addNextYearInspCriteria($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('addNextYearInspCriteria', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['addNextYearInspCriteria']);
    }

    #[Test]
    public function addNextYearInspCriteria_【失敗】その他エラー()
    {
        // テストデータの準備
        $request = new Request([
            'data_to_save' => [
                [
                    'itemNo' => 1,
                    'pointNo' => 1,
                    'regulationUpLimit' => '8.5',
                    'regulationLowLimit' => '5.8'
                ]
            ],
            'addNextYear' => '2025',
            'latestYear' => '2024'
        ]);

        // モックの設定
        $this->mng040ServiceMock
            ->shouldReceive('addNextYearInspCriteria')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng040Controller->addNextYearInspCriteria($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('addNextYearInspCriteria', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['addNextYearInspCriteria']);
    }
}
