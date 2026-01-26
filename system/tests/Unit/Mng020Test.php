<?php

namespace Tests\Unit;

use App\Http\Controllers\Mng020Controller;
use App\Services\CommonService;
use App\Services\Mng020Service;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Mng020Test extends TestCase
{
    protected $mng020Controller;
    protected $commonServiceMock;
    protected $mng020ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        
        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->mng020ServiceMock = Mockery::mock(Mng020Service::class);
        
        // コントローラーのインスタンス作成
        $this->mng020Controller = new Mng020Controller();
        
        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->mng020Controller);
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->mng020Controller, $this->commonServiceMock);
        
        $mng020ServiceProperty = $reflection->getProperty('Mng020Service');
        $mng020ServiceProperty->setAccessible(true);
        $mng020ServiceProperty->setValue($this->mng020Controller, $this->mng020ServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function searchSaisuiPoint_【成功】採水地点マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $sisetuData = [
            ['sisetu_no' => '01', 'sisetu_name' => '霞ヶ浦浄水場'],
            ['sisetu_no' => '02', 'sisetu_name' => '水質管理センター']
        ];
        
        $processData = [
            ['process_no' => '01', 'process_name' => '原水'],
            ['process_no' => '02', 'process_name' => '浄水']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期'],
            ['saisui_kbn_no' => '02', 'saisui_kbn_name' => '臨時']
        ];
        
        $searchSaisuiPoint = [
            [
                'point_no' => 1,
                'point_dsp_name' => '地点1',
                'point_report_name' => '地点1報告書',
                'saisui_kbn_no' => '01',
                'sisetu_no' => '01',
                'process_no' => '01'
            ]
        ];
        
        $maxSaisuiPoint = [
            (object)['max_point_no' => 10]
        ];

        $displayTimeData = [];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchSisetuData')
            ->once()
            ->andReturn($sisetuData);

        $this->commonServiceMock
            ->shouldReceive('fetchProcessData')
            ->once()
            ->andReturn($processData);

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng020ServiceMock
            ->shouldReceive('searchSaisuiPoint')
            ->once()
            ->with($request)
            ->andReturn($searchSaisuiPoint);

        $this->mng020ServiceMock
            ->shouldReceive('searchMaxSaisuiPoint')
            ->once()
            ->andReturn($maxSaisuiPoint);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng020Controller->searchSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($sisetuData, $responseData['sisetuData']);
        $this->assertEquals($processData, $responseData['processData']);
        $this->assertEquals($saisuiKbnData, $responseData['saisuiKbnData']);
        $this->assertEquals($searchSaisuiPoint, $responseData['searchSaisuiPoint']);
        $this->assertEquals(10, $responseData['maxSaisuiPoint']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function searchSaisuiPoint_【失敗】施設マスタ取得失敗()
    {
        // テストデータの準備
        $request = new Request();

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchSisetuData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng020Controller->searchSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchSisetuData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '施設マスタ']], $responseData['errors']['fetchSisetuData']);
    }

    #[Test]
    public function searchSaisuiPoint_【失敗】処理過程マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $sisetuData = [
            ['sisetu_no' => '01', 'sisetu_name' => '霞ヶ浦浄水場']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('fetchSisetuData')
            ->once()
            ->andReturn($sisetuData);

        $this->commonServiceMock
            ->shouldReceive('fetchProcessData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng020Controller->searchSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchProcessData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '処理過程マスタ']], $responseData['errors']['fetchProcessData']);
    }

    #[Test]
    public function searchSaisuiPoint_【失敗】採水区分マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $sisetuData = [
            ['sisetu_no' => '01', 'sisetu_name' => '霞ヶ浦浄水場']
        ];
        
        $processData = [
            ['process_no' => '01', 'process_name' => '原水']
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

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng020Controller->searchSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchSaisuiKbnData', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '採水区分マスタ']], $responseData['errors']['fetchSaisuiKbnData']);
    }

    #[Test]
    public function searchSaisuiPoint_【失敗】採水地点マスタ取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $sisetuData = [
            ['sisetu_no' => '01', 'sisetu_name' => '霞ヶ浦浄水場']
        ];
        
        $processData = [
            ['process_no' => '01', 'process_name' => '原水']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期']
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

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng020ServiceMock
            ->shouldReceive('searchSaisuiPoint')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng020Controller->searchSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchSaisuiPoint', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '採水地点マスタ']], $responseData['errors']['searchSaisuiPoint']);
    }

    #[Test]
    public function searchSaisuiPoint_【失敗】最大採水地点番号取得()
    {
        // テストデータの準備
        $request = new Request();
        
        $sisetuData = [
            ['sisetu_no' => '01', 'sisetu_name' => '霞ヶ浦浄水場']
        ];
        
        $processData = [
            ['process_no' => '01', 'process_name' => '原水']
        ];
        
        $saisuiKbnData = [
            ['saisui_kbn_no' => '01', 'saisui_kbn_name' => '定期']
        ];
        
        $searchSaisuiPoint = [
            [
                'point_no' => 1,
                'point_dsp_name' => '地点1',
                'point_report_name' => '地点1報告書',
                'saisui_kbn_no' => '01',
                'sisetu_no' => '01',
                'process_no' => '01'
            ]
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

        $this->commonServiceMock
            ->shouldReceive('fetchSaisuiKbnData')
            ->once()
            ->andReturn($saisuiKbnData);

        $this->mng020ServiceMock
            ->shouldReceive('searchSaisuiPoint')
            ->once()
            ->with($request)
            ->andReturn($searchSaisuiPoint);

        $this->mng020ServiceMock
            ->shouldReceive('searchMaxSaisuiPoint')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng020Controller->searchSaisuiPoint($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchMaxSaisuiPoint', $responseData['errors']);
        $this->assertEquals([['WQ-0006E', '最大の採水地点番号']], $responseData['errors']['searchMaxSaisuiPoint']);
    }

    #[Test]
    public function saveSaisuiPointData_【成功】採水地点設定登録処理()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'pointNo' => 1,
                    'pointDspName' => '地点1',
                    'pointReportName' => '地点1報告書',
                    'saisuiKbnNo' => '01',
                    'sisetuNo' => '01',
                    'processNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000',
            'search_cond' => []
        ];

        $request = new \App\Http\Requests\Mng020Request($requestData);

        // モックの設定
        $this->mng020ServiceMock
            ->shouldReceive('saveSaisuiPointData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng020Controller->saveSaisuiPointData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveSaisuiPointData_【失敗】採水地点設定登録処理_DBにデータ存在()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'pointNo' => 1,
                    'pointDspName' => '地点1',
                    'pointReportName' => '地点1報告書',
                    'saisuiKbnNo' => '01',
                    'sisetuNo' => '01',
                    'processNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000',
            'search_cond' => []
        ];

        $request = new \App\Http\Requests\Mng020Request($requestData);

        // モックの設定
        $this->mng020ServiceMock
            ->shouldReceive('saveSaisuiPointData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng020Controller->saveSaisuiPointData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSaisuiPointData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveSaisuiPointData']);
    }

    #[Test]
    public function saveSaisuiPointData_【失敗】採水地点設定登録処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'pointNo' => 1,
                    'pointDspName' => '地点1',
                    'pointReportName' => '地点1報告書',
                    'saisuiKbnNo' => '01',
                    'sisetuNo' => '01',
                    'processNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000',
            'search_cond' => []
        ];

        $request = new \App\Http\Requests\Mng020Request($requestData);

        // モックの設定
        $this->mng020ServiceMock
            ->shouldReceive('saveSaisuiPointData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng020Controller->saveSaisuiPointData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSaisuiPointData', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveSaisuiPointData']);
    }

    #[Test]
    public function saveSaisuiPointData_【失敗】採水地点設定登録処理_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'pointNo' => 1,
                    'pointDspName' => '地点1',
                    'pointReportName' => '地点1報告書',
                    'saisuiKbnNo' => '01',
                    'sisetuNo' => '01',
                    'processNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000',
            'search_cond' => []
        ];

        $request = new \App\Http\Requests\Mng020Request($requestData);

        // モックの設定
        $this->mng020ServiceMock
            ->shouldReceive('saveSaisuiPointData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng020Controller->saveSaisuiPointData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSaisuiPointData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveSaisuiPointData']);
    }

    #[Test]
    public function saveSaisuiPointData_【失敗】採水地点設定削除処理_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'pointNo' => 1,
                    'pointDspName' => '地点1',
                    'pointReportName' => '地点1報告書',
                    'saisuiKbnNo' => '01',
                    'sisetuNo' => '01',
                    'processNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000',
            'search_cond' => []
        ];

        $request = new \App\Http\Requests\Mng020Request($requestData);

        // モックの設定
        $this->mng020ServiceMock
            ->shouldReceive('saveSaisuiPointData')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng020Controller->saveSaisuiPointData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSaisuiPointData', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveSaisuiPointData']);
    }

    #[Test]
    public function saveSaisuiPointData_【失敗】その他エラー()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'pointNo' => 1,
                    'pointDspName' => '地点1',
                    'pointReportName' => '地点1報告書',
                    'saisuiKbnNo' => '01',
                    'sisetuNo' => '01',
                    'processNo' => '01'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000',
            'search_cond' => []
        ];

        $request = new \App\Http\Requests\Mng020Request($requestData);

        // モックの設定
        $this->mng020ServiceMock
            ->shouldReceive('saveSaisuiPointData')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng020Controller->saveSaisuiPointData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveSaisuiPointData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveSaisuiPointData']);
    }
}
