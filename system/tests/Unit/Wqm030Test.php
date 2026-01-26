<?php

namespace Tests\Unit;

use App\Http\Controllers\Wqm030Controller;
use App\Services\Wqm030Service;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Http\Request;
use Tests\TestCase;
use Mockery;
use ReflectionClass;

class Wqm030Test extends TestCase
{
    protected $controller;
    protected $mockService;

    protected function setUp(): void
    {
        parent::setUp();

        // Wqm030Serviceのモックを作成
        $this->mockService = Mockery::mock(Wqm030Service::class);

        // コントローラーのインスタンスを作成
        $this->controller = new Wqm030Controller();

        // リフレクションを使用してプライベートプロパティにモックを注入
        $reflection = new ReflectionClass($this->controller);
        $property = $reflection->getProperty('Wqm030Service');
        $property->setAccessible(true);
        $property->setValue($this->controller, $this->mockService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function getDspOutputList_【成功】出力一覧表示（週報）()
    {
        // テストデータ
        $mockGridTableData = [
            (object)[
                'report_no' => '320',
                'report_name' => '週報テスト',
                'output_date' => '2025-01-06',
                'status' => '出力済み'
            ]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getDspWeekOutputList')
            ->once()
            ->with('320', '2025-01-01', "", "ASC")
            ->andReturn($mockGridTableData);

        // リクエストの作成
        $request = new Request([
            'report_no' => '320',
            'report_category' => config("const.report_category.week_report"),
            'selected_date' => '2025-01-01',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('gridTableData', $responseData);
        $this->assertCount(1, $responseData['gridTableData']);
        $this->assertEquals('320', $responseData['gridTableData'][0]['report_no']);
        $this->assertEquals('週報テスト', $responseData['gridTableData'][0]['report_name']);
    }

    #[Test]
    public function getDspOutputList_【失敗】出力一覧表示取得（週報）()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getDspWeekOutputList')
            ->once()
            ->with('320', '2025-01-01', "", "ASC")
            ->andReturn(false);

        // リクエストの作成
        $request = new Request([
            'report_no' => '320',
            'report_category' => config("const.report_category.week_report"),
            'selected_date' => '2025-01-01',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['getDspWeekOutputList']);
    }

    #[Test]
    public function getDspOutputList_【失敗】出力一覧表示（週報）_データなし()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getDspWeekOutputList')
            ->once()
            ->with('320', '2025-01-01', "", "ASC")
            ->andReturn([]);

        // リクエストの作成
        $request = new Request([
            'report_no' => '320',
            'report_category' => config("const.report_category.week_report"),
            'selected_date' => '2025-01-01',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0018E']], $responseData['errors']['getDspWeekOutputList']);
    }

    #[Test]
    public function getDspOutputList_【成功】出力一覧表示_通常報告書()
    {
        // テストデータ
        $mockGridTableData = [
            (object)[
                'report_no' => '14',
                'report_name' => '月報テスト',
                'output_date' => '2025-01-31',
                'status' => '出力済み'
            ]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getDspOutputList')
            ->once()
            ->andReturn($mockGridTableData);

        // リクエストの作成
        $request = new Request([
            'report_no' => '14',
            'report_category' => config("const.report_category.month_report"),
            'selected_date' => '2025-01-15'
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('gridTableData', $responseData);
        $this->assertCount(1, $responseData['gridTableData']);
        $this->assertEquals('14', $responseData['gridTableData'][0]['report_no']);
        $this->assertEquals('月報テスト', $responseData['gridTableData'][0]['report_name']);
    }

    #[Test]
    public function getDspOutputList_【失敗】出力一覧表示_通常報告書取得()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getDspOutputList')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request([
            'report_no' => '14',
            'report_category' => config("const.report_category.month_report"),
            'selected_date' => '2025-01-15'
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['getDspOutputList']);
    }

    #[Test]
    public function getDspOutputList_【失敗】出力一覧表示_通常報告書_データなし()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getDspOutputList')
            ->once()
            ->andReturn([]);

        // リクエストの作成
        $request = new Request([
            'report_no' => '14',
            'report_category' => config("const.report_category.month_report"),
            'selected_date' => '2025-01-15'
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0018E']], $responseData['errors']['getDspOutputList']);
    }

    #[Test]
    public function getDspOutputList_【成功】出力一覧表示_月報報告書()
    {
        // テストデータ
        $mockGridTableData = [
            (object)[
                'report_no' => null,
                'report_name' => '月報報告書',
                'output_date' => '2025-01-31',
                'status' => '出力済み'
            ]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getDspMonthlyOutputList')
            ->once()
            ->with(1, '2025-01-15', "", "ASC")
            ->andReturn($mockGridTableData);

        // リクエストの作成（report_noが空の場合）
        $request = new Request([
            'report_no' => '',
            'affiliation_section_no' => 1,
            'selected_date' => '2025-01-15',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('gridTableData', $responseData);
        $this->assertCount(1, $responseData['gridTableData']);
        $this->assertNull($responseData['gridTableData'][0]['report_no']);
        $this->assertEquals('月報報告書', $responseData['gridTableData'][0]['report_name']);
    }

    #[Test]
    public function getDspOutputList_【失敗】出力一覧表示_月報報告書取得()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getDspMonthlyOutputList')
            ->once()
            ->with(1, '2025-01-15', "", "ASC")
            ->andReturn(false);

        // リクエストの作成（report_noが空の場合）
        $request = new Request([
            'report_no' => '',
            'affiliation_section_no' => 1,
            'selected_date' => '2025-01-15',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0009E']], $responseData['errors']['getDspMonthlyOutputList']);
    }

    #[Test]
    public function getDspOutputList_【失敗】出力一覧表示_月報報告書_データなし()
    {
        // モックの設定
        $this->mockService
            ->shouldReceive('getDspMonthlyOutputList')
            ->once()
            ->with(1, '2025-01-15', "", "ASC")
            ->andReturn([]);

        // リクエストの作成（report_noが空の場合）
        $request = new Request([
            'report_no' => '',
            'affiliation_section_no' => 1,
            'selected_date' => '2025-01-15',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0018E']], $responseData['errors']['getDspMonthlyOutputList']);
    }

    #[Test]
    public function getDspOutputList_【成功】出力一覧表示_report_noがnull_月報報告書として処理()
    {
        // テストデータ
        $mockGridTableData = [
            (object)[
                'report_no' => null,
                'report_name' => '月報報告書',
                'output_date' => '2025-01-31',
                'status' => '出力済み'
            ]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getDspMonthlyOutputList')
            ->once()
            ->with(1, '2025-01-15', "", "ASC")
            ->andReturn($mockGridTableData);

        // リクエストの作成（report_noがnullの場合）
        $request = new Request([
            'report_no' => null,
            'affiliation_section_no' => 1,
            'selected_date' => '2025-01-15',
            'sort_column' => '',
            'sort_order' => 'ASC',
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('gridTableData', $responseData);
        $this->assertCount(1, $responseData['gridTableData']);
        $this->assertNull($responseData['gridTableData'][0]['report_no']);
        $this->assertEquals('月報報告書', $responseData['gridTableData'][0]['report_name']);
    }

    #[Test]
    public function getDspOutputList_【成功】出力一覧表示（年報）()
    {
        // テストデータ
        $mockGridTableData = [
            (object)[
                'report_no' => '416',
                'report_name' => '年報テスト',
                'output_date' => '2025-03-31',
                'status' => '出力済み'
            ]
        ];

        // モックの設定
        $this->mockService
            ->shouldReceive('getDspOutputList')
            ->once()
            ->andReturn($mockGridTableData);

        // リクエストの作成
        $request = new Request([
            'report_no' => '416',
            'report_category' => config("const.report_category.year_report"),
            'selected_date' => '2025-01-15'
        ]);

        // テスト実行
        $response = $this->controller->getDspOutputList($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('gridTableData', $responseData);
        $this->assertCount(1, $responseData['gridTableData']);
        $this->assertEquals('416', $responseData['gridTableData'][0]['report_no']);
        $this->assertEquals('年報テスト', $responseData['gridTableData'][0]['report_name']);
    }
}
