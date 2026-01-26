<?php

namespace Tests\Unit;

use App\Http\Controllers\Wqm020Controller;
use App\Services\Wqm020Service;
use App\Http\Requests\Wqm020Request;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;
use ReflectionClass;

class Wqm020Test extends TestCase
{
    protected $controller;
    protected $mockService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Wqm020Serviceのモックを作成
        $this->mockService = Mockery::mock(Wqm020Service::class);
        
        // コントローラーのインスタンスを作成
        $this->controller = new Wqm020Controller();
        
        // リフレクションを使用してプライベートプロパティにモックを注入
        $reflection = new ReflectionClass($this->controller);
        $property = $reflection->getProperty('Wqm020Service');
        $property->setAccessible(true);
        $property->setValue($this->controller, $this->mockService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function index_【成功】初期値取得()
    {
        // テストデータ
        $mockKbn = [
            (object)['kbn_cd' => 1, 'kbn_name' => '検査区分1']
        ];

        $mockKbnExpect = [
            ['kbn_cd' => 1, 'kbn_name' => '検査区分1']
        ];
        
        $mockSisetu = [
            (object)['sisetu_cd' => 1, 'sisetu_name' => '浄水場1']
        ];

        $mockSisetuExpect = [
            ['sisetu_cd' => 1, 'sisetu_name' => '浄水場1']
        ];
        
        $mockProcess = [
            (object)['process_cd' => 1, 'process_name' => '処理過程1']
        ];

        $mockProcessExpect = [
            ['process_cd' => 1, 'process_name' => '処理過程1']
        ];
        
        $mockCat = [
            (object)['cat_cd' => 1, 'cat_name' => '大分類1']
        ];

        $mockCatExpect = [
            ['cat_cd' => 1, 'cat_name' => '大分類1']
        ];
        
        $mockPoint = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockPointExpect = [
            ['point_no' => 1, 'point_name' => '地点1']
        ];
        
        $mockItem = [
            (object)['item_no' => 1, 'item_name' => '項目1']
        ];

        $mockItemExpect = [
            ['item_no' => 1, 'item_name' => '項目1']
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getKbn')
            ->once()
            ->andReturn($mockKbn);
            
        $this->mockService
            ->shouldReceive('getSisetu')
            ->once()
            ->andReturn($mockSisetu);
            
        $this->mockService
            ->shouldReceive('getProcess')
            ->once()
            ->andReturn($mockProcess);
            
        $this->mockService
            ->shouldReceive('getCat')
            ->once()
            ->andReturn($mockCat);
            
        $this->mockService
            ->shouldReceive('getPoint')
            ->once()
            ->andReturn($mockPoint);
            
        $this->mockService
            ->shouldReceive('getItem')
            ->once()
            ->andReturn($mockItem);

        // テスト実行
        $response = $this->controller->index();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockKbnExpect, $responseData['kbn']);
        $this->assertEquals($mockSisetuExpect, $responseData['sisetu']);
        $this->assertEquals($mockProcessExpect, $responseData['process']);
        $this->assertEquals($mockCatExpect, $responseData['cat']);
        $this->assertEquals($mockPointExpect, $responseData['point']);
        $this->assertEquals($mockItemExpect, $responseData['item']);
    }

    #[Test]
    public function index_【失敗】初期値取得_検査区分エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getKbn')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->controller->index();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['index_kbn']);
    }

    #[Test]
    public function index_【失敗】初期値取得_浄水場エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getKbn')
            ->once()
            ->andReturn([]);
            
        $this->mockService
            ->shouldReceive('getSisetu')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->controller->index();

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['index_sisetu']);
    }

    #[Test]
    public function getPointAndProcess_【成功】処理過程と地点取得()
    {
        // テストデータ
        $mockProcess = [
            (object)['process_cd' => 1, 'process_name' => '処理過程1']
        ];

        $mockProcessExpect = [
            ['process_cd' => 1, 'process_name' => '処理過程1']
        ];
        
        $mockPoint = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockPointExpect = [
            ['point_no' => 1, 'point_name' => '地点1']
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getProcess')
            ->once()
            ->andReturn($mockProcess);
            
        $this->mockService
            ->shouldReceive('getPoint')
            ->once()
            ->andReturn($mockPoint);

        // リクエストの作成
        $request = new Request(['sisetu_cd' => 1]);

        // テスト実行
        $response = $this->controller->getPointAndProcess($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockProcessExpect, $responseData['process']);
        $this->assertEquals($mockPointExpect, $responseData['point']);
    }

    #[Test]
    public function getPointAndProcess_【失敗】処理過程と地点取得_処理過程エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getProcess')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request(['sisetu_cd' => 1]);

        // テスト実行
        $response = $this->controller->getPointAndProcess($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['getSaisuiPoint_process']);
    }

    #[Test]
    public function getSaisuiPoint【成功】採水地点取得()
    {
        // テストデータ
        $mockSisetu = [
            (object)['sisetu_cd' => 1, 'sisetu_name' => '浄水場1']
        ];

        $mockSisetuExpect = [
            ['sisetu_cd' => 1, 'sisetu_name' => '浄水場1']
        ];
        
        $mockPoint = [
            (object)['point_no' => 1, 'point_name' => '地点1']
        ];

        $mockPointExpect = [
            ['point_no' => 1, 'point_name' => '地点1']
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getSisetu')
            ->once()
            ->andReturn($mockSisetu);
            
        $this->mockService
            ->shouldReceive('getPoint')
            ->once()
            ->andReturn($mockPoint);

        // リクエストの作成
        $request = new Request(['process_cd' => 1]);

        // テスト実行
        $response = $this->controller->getSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockSisetuExpect, $responseData['sisetu']);
        $this->assertEquals($mockPointExpect, $responseData['point']);
    }

    #[Test]
    public function getSaisuiPoint_【失敗】採水地点取得_浄水場エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getSisetu')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request(['process_cd' => 1]);

        // テスト実行
        $response = $this->controller->getSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['getSaisuiPoint_sisetu']);
    }

    #[Test]
    public function getItem_【成功】検査項目取得()
    {
        // テストデータ
        $mockItem = [
            (object)['item_no' => 1, 'item_name' => '項目1'],
            (object)['item_no' => 2, 'item_name' => '項目2']
        ];

        $mockItemExpect = [
            ['item_no' => 1, 'item_name' => '項目1'],
            ['item_no' => 2, 'item_name' => '項目2']
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getItem')
            ->once()
            ->andReturn($mockItem);

        // リクエストの作成
        $request = new Request(['kbn_cd' => 1]);

        // テスト実行
        $response = $this->controller->getItem($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockItemExpect, $responseData['item']);
    }

    #[Test]
    public function getItem_【失敗】検査項目取得_エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getItem')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request(['kbn_cd' => 1]);

        // テスト実行
        $response = $this->controller->getItem($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['index_item']);
    }

    #[Test]
    public function search_【成功】出力一覧表示検索()
    {
        // テストデータ
        $mockList = [
            (object)[
                'date' => '2025-01-01',
                'time' => '10:00',
                'point' => '地点1',
                'item' => '項目1',
                'kbn' => '検査区分1',
                'c_data' => '10.5',
                'q_data' => null
            ]
        ];

        $mockListExpect = [
            [
                'date' => '2025-01-01',
                'time' => '10:00',
                'point' => '地点1',
                'item' => '項目1',
                'kbn' => '検査区分1',
                'c_data' => '10.5',
                'q_data' => null
            ]
        ];
        
        $mockCalc = [
            (object)['calc_type' => 'avg', 'value' => '10.5']
        ];

        $mockCalcExpect = [
            ['calc_type' => 'avg', 'value' => '10.5']
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getCountSearchList')
            ->once()
            ->andReturn(false); // 制限以下
            
        $this->mockService
            ->shouldReceive('getList')
            ->once()
            ->andReturn($mockList);
            
        $this->mockService
            ->shouldReceive('getCalcState')
            ->once()
            ->andReturn($mockCalc);

        // リクエストの作成
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31',
            'point_no' => [1],
            'item_no' => [1]
        ]);

        // リクエストデータ
        $requestData = new Wqm020Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31',
            'point_no' => [1],
            'item_no' => [1]
        ]);

        // テスト実行
        $response = $this->controller->search($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockListExpect, $responseData['list']);
        $this->assertEquals($mockCalcExpect, $responseData['calc']);
    }

    #[Test]
    public function search_【失敗】出力一覧表示検索_件数制限エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getCountSearchList')
            ->once()
            ->andReturn(true); // 制限超過

        // リクエストの作成
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-12-31',
            'point_no' => [1, 2, 3],
            'item_no' => [1, 2, 3]
        ]);

        // リクエストデータ
        $requestData = new Wqm020Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-12-31',
            'point_no' => [1, 2, 3],
            'item_no' => [1, 2, 3]
        ]);

        // テスト実行
        $response = $this->controller->search($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0015W', '検索結果', config('const.SEARCH_LIMIT', '50000') . '件']], $responseData['errors']['search_count']);
    }

    #[Test]
    public function search_【失敗】出力一覧表示検索_リスト取得エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getCountSearchList')
            ->once()
            ->andReturn(false);
            
        $this->mockService
            ->shouldReceive('getList')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31'
        ]);

        // リクエストデータ
        $requestData = new Wqm020Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31'
        ]);

        // テスト実行
        $response = $this->controller->search($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['search_list']);
    }

    #[Test]
    public function exportSearchData_【成功】検索データ出力()
    {
        // テストデータ
        $mockList = [
            (object)[
                'date' => '2025-01-01',
                'time' => '10:00',
                'point' => '地点1',
                'item' => '項目1',
                'kbn' => '検査区分1',
                'c_data' => '10.5',
                'q_data' => null
            ]
        ];

        // テンプレートファイルのパスを作成
        $tempFile = tempnam(sys_get_temp_dir(), 'test_export');
        file_put_contents($tempFile, 'test content');

        // モックの設定
        $this->mockService
            ->shouldReceive('getCountSearchList')
            ->once()
            ->andReturn(false);
            
        $this->mockService
            ->shouldReceive('getList')
            ->once()
            ->andReturn($mockList);
            
        $this->mockService
            ->shouldReceive('exportSearchData')
            ->once()
            ->andReturn($tempFile);

        // リクエストの作成
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31'
        ]);

        // テスト実行
        $response = $this->controller->exportSearchData($request);

        // アサーション
        $this->assertEquals(200, $response->getStatusCode());
        $this->assertInstanceOf(\Symfony\Component\HttpFoundation\BinaryFileResponse::class, $response);

        // テンプレートファイルを削除
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }
    }

    #[Test]
    public function exportSearchData_【失敗】検索データ出力_件数制限エラー()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getCountSearchList')
            ->once()
            ->andReturn(true);

        // リクエストの作成
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-12-31'
        ]);

        // テスト実行
        $response = $this->controller->exportSearchData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0015W', '検索結果', config('const.SEARCH_LIMIT', '50000') . '件']], $responseData['errors']['export_search_count']);
    }

    #[Test]
    public function exportSearchData_【失敗】検索データ出力_ファイル生成エラー()
    {
        // テストデータ
        $mockList = [
            (object)[
                'date' => '2025-01-01',
                'time' => '10:00',
                'point' => '地点1',
                'item' => '項目1',
                'kbn' => '検査区分1',
                'c_data' => '10.5',
                'q_data' => null
            ]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getCountSearchList')
            ->once()
            ->andReturn(false);
            
        $this->mockService
            ->shouldReceive('getList')
            ->once()
            ->andReturn($mockList);
            
        $this->mockService
            ->shouldReceive('exportSearchData')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31'
        ]);

        // テスト実行
        $response = $this->controller->exportSearchData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['export_file']);
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
        $request = new Request([
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31',
            'point_no' => [1, 2],
            'item_no' => 1
        ]);

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
            'point_no' => [1, 2],
            'point_name' => ['地点1', '地点2'],
            'item_name' => '項目1',
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31'
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
            'point_no' => [1, 2],
            'point_name' => ['地点1', '地点2'],
            'item_name' => '項目1',
            'date_from' => '2025-01-01',
            'date_to' => '2025-01-31'
        ]);

        // テスト実行
        $response = $this->controller->exportTrend($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['export']);
    }
}
