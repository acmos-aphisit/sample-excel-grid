<?php

namespace Tests\Unit;

use App\Http\Controllers\Cmn020Controller;
use App\Services\CommonService;
use App\Services\Cmn020Service;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

use Illuminate\Support\Facades\Log;

class Cmn020Test extends TestCase
{
    protected $cmn020Controller;
    protected $commonServiceMock;
    protected $cmn020ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->cmn020ServiceMock = Mockery::mock(Cmn020Service::class);
        
        // コントローラーのインスタンス作成
        $this->cmn020Controller = new Cmn020Controller();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->cmn020Controller);
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->cmn020Controller, $this->commonServiceMock);
        
        $cmn020ServiceProperty = $reflection->getProperty('Cmn020Service');
        $cmn020ServiceProperty->setAccessible(true);
        $cmn020ServiceProperty->setValue($this->cmn020Controller, $this->cmn020ServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function fetchInfoData_成功()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);
        
        $infoData = [
            [
                'info_no' => 1,
                'info_title' => 'システムメンテナンスのお知らせ',
                'info_content' => 'システムメンテナンスを実施します。',
                'info_date' => '2025-01-01',
                'priority' => 1,
                'display_start_date' => '2025-01-01 00:00:00',
                'display_end_date' => '2025-01-31 23:59:59'
            ],
            [
                'info_no' => 2,
                'info_title' => '新機能追加のお知らせ',
                'info_content' => '新しい機能が追加されました。',
                'info_date' => '2025-01-02',
                'priority' => 2,
                'display_start_date' => '2025-01-02 00:00:00',
                'display_end_date' => '2025-02-01 23:59:59'
            ]
        ];

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn($infoData);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($infoData, $responseData['infoData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function fetchInfoData_お知らせ取得失敗()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchInfoData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', 'お知らせ']], $responseData['errors']['fetchInfoData']);
    }

    #[Test]
    public function fetchInfoData_空のお知らせリスト()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);
        
        $infoData = [];

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn($infoData);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($infoData, $responseData['infoData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function fetchInfoData_単一のお知らせ()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);
        
        $infoData = [
            [
                'info_no' => 1,
                'info_title' => '重要なお知らせ',
                'info_content' => '重要な内容です。',
                'info_date' => '2025-01-01',
                'priority' => 1,
                'display_start_date' => '2025-01-01 00:00:00',
                'display_end_date' => '2025-01-31 23:59:59'
            ]
        ];

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn($infoData);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($infoData, $responseData['infoData']);
        $this->assertArrayHasKey('displayTime', $responseData);
        $this->assertCount(1, $responseData['infoData']);
    }

    #[Test]
    public function fetchInfoData_パラメータなしリクエスト()
    {
        // テストデータの準備
        $request = new Request();
        
        $infoData = [
            [
                'info_no' => 1,
                'info_title' => '全体お知らせ',
                'info_content' => '全体向けのお知らせです。',
                'info_date' => '2025-01-01',
                'priority' => 1,
                'display_start_date' => '2025-01-01 00:00:00',
                'display_end_date' => '2025-01-31 23:59:59'
            ]
        ];

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn($infoData);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($infoData, $responseData['infoData']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function fetchInfoData_優先度順のお知らせ()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);
        
        $infoData = [
            [
                'info_no' => 1,
                'info_title' => '緊急お知らせ',
                'info_content' => '緊急の内容です。',
                'info_date' => '2025-01-01',
                'priority' => 1,
                'display_start_date' => '2025-01-01 00:00:00',
                'display_end_date' => '2025-01-31 23:59:59'
            ],
            [
                'info_no' => 2,
                'info_title' => '通常お知らせ',
                'info_content' => '通常の内容です。',
                'info_date' => '2025-01-02',
                'priority' => 2,
                'display_start_date' => '2025-01-02 00:00:00',
                'display_end_date' => '2025-02-01 23:59:59'
            ],
            [
                'info_no' => 3,
                'info_title' => '参考お知らせ',
                'info_content' => '参考情報です。',
                'info_date' => '2025-01-03',
                'priority' => 3,
                'display_start_date' => '2025-01-03 00:00:00',
                'display_end_date' => '2025-02-02 23:59:59'
            ]
        ];

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn($infoData);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($infoData, $responseData['infoData']);
        $this->assertArrayHasKey('displayTime', $responseData);
        $this->assertCount(3, $responseData['infoData']);
        
        // 優先度順に並んでいることを確認
        $this->assertEquals(1, $responseData['infoData'][0]['priority']);
        $this->assertEquals(2, $responseData['infoData'][1]['priority']);
        $this->assertEquals(3, $responseData['infoData'][2]['priority']);
    }

    #[Test]
    public function fetchInfoData_nullが返された場合()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn(null);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchInfoData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', 'お知らせ']], $responseData['errors']['fetchInfoData']);
    }

    #[Test]
    public function fetchInfoData_レスポンス構造確認()
    {
        // テストデータの準備
        $request = new Request([
            'perPage' => 10,
            'curPage' => 1
        ]);
        
        $infoData = [
            [
                'info_no' => 1,
                'info_title' => 'テストお知らせ',
                'info_content' => 'テスト内容',
                'info_date' => '2025-01-01',
                'priority' => 1,
                'display_start_date' => '2025-01-01 00:00:00',
                'display_end_date' => '2025-01-31 23:59:59'
            ]
        ];

        // モックの設定
        $this->cmn020ServiceMock
            ->shouldReceive('fetchInfoData')
            ->once()
            ->with($request)
            ->andReturn($infoData);

        // テスト実行
        $response = $this->cmn020Controller->fetchInfoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        
        // レスポンス構造の確認
        $this->assertArrayHasKey('status', $responseData);
        $this->assertArrayHasKey('infoData', $responseData);
        $this->assertArrayHasKey('displayTime', $responseData);
        
        // displayTimeの形式確認（YYYY-MM-DD HH:MM:SS）
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $responseData['displayTime']);
        
        // infoDataの構造確認
        $this->assertIsArray($responseData['infoData']);
        if (!empty($responseData['infoData'])) {
            $firstInfo = $responseData['infoData'][0];
            $this->assertArrayHasKey('info_no', $firstInfo);
            $this->assertArrayHasKey('info_title', $firstInfo);
            $this->assertArrayHasKey('info_content', $firstInfo);
            $this->assertArrayHasKey('info_date', $firstInfo);
            $this->assertArrayHasKey('priority', $firstInfo);
            $this->assertArrayHasKey('display_start_date', $firstInfo);
            $this->assertArrayHasKey('display_end_date', $firstInfo);
        }
    }
}
