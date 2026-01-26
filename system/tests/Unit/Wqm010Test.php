<?php

namespace Tests\Unit;

use App\Http\Controllers\Wqm010Controller;
use App\Services\CommonService;
use App\Services\Wqm010Service;
use App\Http\Requests\Wqm010Request;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;
use ReflectionClass;
use Illuminate\Support\Facades\Log;

class Wqm010Test extends TestCase
{
    protected $commonServiceMock;
    protected $controller;
    protected $mockService;

    protected function setUp(): void
    {
        parent::setUp();

        // Wqm010Serviceのモックを作成
        $this->mockService = Mockery::mock(Wqm010Service::class);
        $this->commonServiceMock = Mockery::mock(CommonService::class);

        // コントローラーのインスタンスを作成
        $this->controller = new Wqm010Controller();

        // リフレクションを使用してプライベートプロパティにモックを注入
        $reflection = new ReflectionClass($this->controller);
        $property = $reflection->getProperty('Wqm010Service');
        $property->setAccessible(true);
        $property->setValue($this->controller, $this->mockService);

        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->controller, $this->commonServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function fetchPointItemData_【成功】検査情報項目地点取得()
    {
        // テストデータ
        $mockPoints = [
            (object)['point_no' => 1, 'point_name' => '地点1'],
            (object)['point_no' => 2, 'point_name' => '地点2']
        ];

        $mockItems = [
            (object)['item_no' => 1, 'item_name' => '項目1'],
            (object)['item_no' => 2, 'item_name' => '項目2']
        ];

        $mockItemsSelector = [];
        $mockInspectCriteria = [];
        $mockInspectCriteriaDataKbnCorrection = [];
        $mockCriteriaCorrection = [];
        $mockInputData = [];
        $mockInputDataExistDate = [];
        $mockInputMask = [];
        $mockInputFixedDate = [];
        $mockInputFixedFlg = true;
        $displayTimeData = [];

        // モックの設定
        $this->mockService
            ->shouldReceive('fetchInputPoints')
            ->once()
            ->andReturn($mockPoints);

        $this->mockService
            ->shouldReceive('fetchInputItems')
            ->once()
            ->andReturn($mockItems);

        $this->mockService
            ->shouldReceive('fetchInputItemsSelector')
            ->once()
            ->andReturn($mockItemsSelector);

        $this->mockService
            ->shouldReceive('fetchInspectCriteriaData')
            ->once()
            ->andReturn($mockInspectCriteria);

        $this->mockService
            ->shouldReceive('fetchInspectCriteriaDataKbnCorrection')
            ->once()
            ->andReturn($mockInspectCriteriaDataKbnCorrection);

        $this->mockService
            ->shouldReceive('fetchCriteriaCorrection')
            ->once()
            ->andReturn($mockCriteriaCorrection);

        $this->mockService
            ->shouldReceive('fetchInputData')
            ->once()
            ->andReturn($mockInputData);

        $this->mockService
            ->shouldReceive('fetchAllInputDataExistDate')
            ->once()
            ->andReturn($mockInputDataExistDate);

        $this->mockService
            ->shouldReceive('fetchInputMask')
            ->once()
            ->andReturn($mockInputMask);

        $this->mockService
            ->shouldReceive('getInputFixedDate')
            ->once()
            ->andReturn($mockInputFixedDate);

        $this->mockService
            ->shouldReceive('getInputFixedFlg')
            ->once()
            ->andReturn($mockInputFixedFlg);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->controller->fetchPointItemData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertArrayHasKey('itemData', $responseData);
        $this->assertArrayHasKey('pointData', $responseData);
        $this->assertArrayHasKey('inspectCriteria', $responseData);
        $this->assertArrayHasKey('inspectCriteriaDataKbnCorrection', $responseData);
        $this->assertArrayHasKey('criteriaCorrection', $responseData);
        $this->assertArrayHasKey('inputData', $responseData);
        $this->assertArrayHasKey('destinationCont', $responseData);
    }

    #[Test]
    public function fetchDataExistDate_【成功】データ存在日付取得()
    {
        // テストデータ
        $mockPoints = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockItems = [
            (object)['item_no' => 1, 'item_name' => '項目1']
        ];

        $mockDataExistDate = [
            '2025-01-01',
            '2025-01-02'
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('fetchInputPoints')
            ->once()
            ->andReturn($mockPoints);

        $this->mockService
            ->shouldReceive('fetchInputItems')
            ->once()
            ->andReturn($mockItems);

        $this->mockService
            ->shouldReceive('fetchAllInputDataExistDate')
            ->once()
            ->andReturn($mockDataExistDate);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->controller->fetchDataExistDate($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockDataExistDate, $responseData['dataDateLists']);
    }

    #[Test]
    public function fetchInputData_【成功】検査情報取得()
    {
        // テストデータ
        $mockPoints = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockItems = [
            (object)['item_no' => 1, 'item_name' => '項目1']
        ];

        $mockInputData = [
            (object)['point_no' => 1, 'item_no' => 1, 'value' => '10.5']
        ];

        $mockInputDataExpect = [
            ['point_no' => 1, 'item_no' => 1, 'value' => '10.5']
        ];

        $mockInputFixedDate = [];
        $mockInputFixedFlg = true;
        $displayTimeData = [];
        

        // モックの設定
        $this->mockService
            ->shouldReceive('fetchInputPoints')
            ->once()
            ->andReturn($mockPoints);

        $this->mockService
            ->shouldReceive('fetchInputItems')
            ->once()
            ->andReturn($mockItems);

        $this->mockService
            ->shouldReceive('fetchInputData')
            ->once()
            ->andReturn($mockInputData);

        $this->mockService
            ->shouldReceive('getInputFixedDate')
            ->once()
            ->andReturn($mockInputFixedDate);

        $this->mockService
            ->shouldReceive('getInputFixedFlg')
            ->once()
            ->andReturn($mockInputFixedFlg);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->controller->fetchInputData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockInputDataExpect, $responseData['inputData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function saveInputData_【成功】検査情報登録()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('saveInputData')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'data_to_save' => json_encode([
                [
                    'input_select_date' => '2025-01-01',
                    'data_by_item' => [
                        [
                            'item_no' => 1,
                            'data' => [
                                [
                                    'point_no' => 1,
                                    'data' => '10.5',
                                    'handle_data' => false,
                                    'inspection_kbn_code' => 1,
                                    'constant_qualitative_flg' => 1
                                ]
                            ]
                        ]
                    ]
                ]
            ])
        ]);

        // テスト実行
        $response = $this->controller->saveInputData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveInputData_【失敗】検査情報登録_DBにデータ存在()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('saveInputData')
            ->once()
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'data_to_save' => json_encode([
                [
                    'input_select_date' => '2025-01-01',
                    'data_by_item' => [
                        [
                            'item_no' => 1,
                            'data' => [
                                [
                                    'point_no' => 1,
                                    'data' => '10.5',
                                    'handle_data' => false,
                                    'inspection_kbn_code' => 1,
                                    'constant_qualitative_flg' => 1
                                ]
                            ]
                        ]
                    ]
                ]
            ])
        ]);

        // テスト実行
        $response = $this->controller->saveInputData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveInputData']);
    }

    #[Test]
    public function saveInputData_【失敗】検査情報登録_DBに対象データ存在しない()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('saveInputData')
            ->once()
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'data_to_save' => json_encode([
                [
                    'input_select_date' => '2025-01-01',
                    'data_by_item' => [
                        [
                            'item_no' => 1,
                            'data' => [
                                [
                                    'point_no' => 1,
                                    'data' => '10.5',
                                    'handle_data' => true,
                                    'inspection_kbn_code' => 1,
                                    'constant_qualitative_flg' => 1
                                ]
                            ]
                        ]
                    ]
                ]
            ])
        ]);

        // テスト実行
        $response = $this->controller->saveInputData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveInputData']);
    }

    #[Test]
    public function saveInputData_【失敗】検査情報登録_他のユーザが同一データを同時に更新()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('saveInputData')
            ->once()
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'data_to_save' => json_encode([
                [
                    'input_select_date' => '2025-01-01',
                    'data_by_item' => [
                        [
                            'item_no' => 1,
                            'data' => [
                                [
                                    'point_no' => 1,
                                    'data' => '10.5',
                                    'handle_data' => true,
                                    'inspection_kbn_code' => 1,
                                    'constant_qualitative_flg' => 1
                                ]
                            ]
                        ]
                    ]
                ]
            ])
        ]);

        // テスト実行
        $response = $this->controller->saveInputData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveInputData']);
    }

    #[Test]
    public function manageInputFixedDate_【成功】入力データ確定管理（登録）()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('manageInputFixedDate')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'procress' => 'save',
            'selected_menu_no' => 600,
            'selected_date' => '2025-01-01'
        ]);

        // テスト実行
        $response = $this->controller->manageInputFixedDate($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function manageInputFixedDate_【成功】入力データ確定管理（削除）()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('manageInputFixedDate')
            ->once()
            ->andReturn(config('const.DELETE_NO_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'procress' => 'delete',
            'selected_menu_no' => 600,
            'selected_date' => '2025-01-01'
        ]);

        // テスト実行
        $response = $this->controller->manageInputFixedDate($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.DELETE_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function manageInputFixedDate_【失敗】入力データ確定管理_DBにデータ存在()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('manageInputFixedDate')
            ->once()
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // リクエストデータ
        $requestData = new Request([
            'procress' => 'save',
            'selected_menu_no' => 600,
            'selected_date' => '2025-01-01'
        ]);

        // テスト実行
        $response = $this->controller->manageInputFixedDate($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['manageInputFixedDate']);
    }

    #[Test]
    public function getTrendData_【成功】トレンドデータ取得()
    {
        // テストデータ
        $mockTrendData = [
            ['XAxisName' => '2025-01-01', '地点1' => 10.5, '地点2' => 12.3],
            ['XAxisName' => '2025-01-02', '地点1' => 11.0, '地点2' => 13.1]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getTrendData')
            ->once()
            ->andReturn($mockTrendData);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->controller->getTrendData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockTrendData, $responseData['trendData']);
    }

    #[Test]
    public function exportTrend_【成功】トレンド出力()
    {
        // テンプレートファイルのパスを作成
        $tempFile = tempnam(sys_get_temp_dir(), 'test_trend');
        file_put_contents($tempFile, 'test content');

        // モックの設定
        $this->mockService
            ->shouldReceive('exportTrend')
            ->once()
            ->andReturn($tempFile);

        // リクエストの作成
        $request = new Request([
            'point_name' => ['地点1'],
            'item_name' => '項目1'
        ]);

        // テスト実行
        $response = $this->controller->exportTrend($request);

        // アサーション
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertInstanceOf(\Symfony\Component\HttpFoundation\BinaryFileResponse::class, $response);

        // テンプレートファイルを削除
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }
    }

    #[Test]
    public function exportTrend_【失敗】トレンド出力()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('exportTrend')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request([
            'point_name' => ['地点1'],
            'item_name' => '項目1'
        ]);

        // テスト実行
        $response = $this->controller->exportTrend($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['export']);
    }

    #[Test]
    public function fileImport【成功】_ファイル取込()
    {
        // テストデータ
        $mockPoints = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockItems = [
            (object)['item_no' => 1, 'item_name' => '項目1', 'constant_qualitative_flg' => 1, 'input_type' => 1]
        ];

        $mockInputMask = [];
        $mockImportData = [
            'import_data' => [
                1 => [
                    1 => ['value' => '10.5', 'flg' => 1, 'name' => '項目1']
                ]
            ],
            'create_date' => '2025-01-01'
        ];

        $mockResultDateList = ['2025-01-01'];

        // モックの設定
        $this->mockService
            ->shouldReceive('fetchInputItems')
            ->twice()
            ->andReturn($mockItems);

        $this->mockService
            ->shouldReceive('fetchInputPoints')
            ->once()
            ->andReturn($mockPoints);

        $this->mockService
            ->shouldReceive('fetchInputMask')
            ->once()
            ->andReturn($mockInputMask);

        $this->mockService
            ->shouldReceive('fileImportHaitaCheck')
            ->once()
            ->andReturn(false);

        $this->mockService
            ->shouldReceive('saveFileInputData')
            ->once()
            ->andReturn($mockResultDateList);

        $this->mockService
            ->shouldReceive('fileImport')
            ->once()
            ->andReturn($mockImportData);

        // Excelファイルのモック作成
        $file = UploadedFile::fake()->create('test.xlsx', 1024);

        // リクエストデータ
        $requestData = new Wqm010Request([
            'selected_menu_no' => 600,
            'import_file' => $file
        ]);

        // $_FILESをモック
        $_FILES['import_file'] = [
            'name' => 'test.xlsx',
            'type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'tmp_name' => $file->getPathname(),
            'error' => 0,
            'size' => 1024
        ];

        // テスト実行
        $response = $this->controller->fileImport($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockResultDateList, $responseData['resultDateList']);
    }

    #[Test]
    public function fileImport_【失敗】ファイル取込_拡張子エラー()
    {
        // 不正な拡張子のファイル
        $file = UploadedFile::fake()->create('test.txt', 1024);

        // リクエストデータ
        $requestData = new Wqm010Request([
            'selected_menu_no' => 600,
            'import_file' => $file
        ]);

        // $_FILESをモック
        $_FILES['import_file'] = [
            'name' => 'test.txt',
            'type' => 'text/plain',
            'tmp_name' => $file->getPathname(),
            'error' => 0,
            'size' => 1024
        ];

        // テスト実行
        $response = $this->controller->fileImport($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0017E']], $responseData['errors']['fileImport']);
    }

    #[Test]
    public function fileImport_【失敗】ファイル取込_排他チェックエラー()
    {
        // テストデータ
        $mockPoints = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockItems = [
            (object)['item_no' => 1, 'item_name' => '項目1', 'constant_qualitative_flg' => 1, 'input_type' => 1]
        ];

        $mockInputMask = [];
        $mockImportData = [
            'import_data' => [
                1 => [
                    1 => ['value' => '10.5', 'flg' => 1, 'name' => '項目1']
                ]
            ],
            'create_date' => '2025-01-01'
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('fetchInputItems')
            ->twice()
            ->andReturn($mockItems);

        $this->mockService
            ->shouldReceive('fetchInputPoints')
            ->once()
            ->andReturn($mockPoints);

        $this->mockService
            ->shouldReceive('fetchInputMask')
            ->once()
            ->andReturn($mockInputMask);

        $this->mockService
            ->shouldReceive('fileImport')
            ->once()
            ->andReturn($mockImportData);

        $this->mockService
            ->shouldReceive('fileImportHaitaCheck')
            ->once()
            ->andReturn(true); // 排他チェックでエラー

        // Excelファイルのモック作成
        $file = UploadedFile::fake()->create('test.xlsx', 1024);

        // リクエストデータ
        $requestData = new Wqm010Request([
            'selected_menu_no' => 600,
            'import_file' => $file
        ]);

        // $_FILESをモック
        $_FILES['import_file'] = [
            'name' => 'test.xlsx',
            'type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'tmp_name' => $file->getPathname(),
            'error' => 0,
            'size' => 1024
        ];

        // テスト実行
        $response = $this->controller->fileImport($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        Log::info($responseData);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['fileImport_haita']);
    }
}
