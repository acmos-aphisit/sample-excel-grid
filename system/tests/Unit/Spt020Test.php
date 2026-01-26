<?php

namespace Tests\Unit;

use App\Http\Controllers\CommonController;
use App\Services\CommonService;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Spt020Test extends TestCase
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
}
