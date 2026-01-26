<?php

namespace Tests\Unit;

use App\Http\Controllers\Mng010Controller;
use App\Services\CommonService;
use App\Services\Mng010Service;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;

class Mng010Test extends TestCase
{
    protected $mng010Controller;
    protected $commonServiceMock;
    protected $mng010ServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // モックの作成
        $this->commonServiceMock = Mockery::mock(CommonService::class);
        $this->mng010ServiceMock = Mockery::mock(Mng010Service::class);

        // コントローラーのインスタンス作成
        $this->mng010Controller = new Mng010Controller();

        // プライベートプロパティにモックを注入
        $reflection = new \ReflectionClass($this->mng010Controller);
        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->mng010Controller, $this->commonServiceMock);

        $mng010ServiceProperty = $reflection->getProperty('Mng010Service');
        $mng010ServiceProperty->setAccessible(true);
        $mng010ServiceProperty->setValue($this->mng010Controller, $this->mng010ServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function fetchUserData_【成功】ユーザデータ取得()
    {
        // テストデータの準備
        $request = new Request();

        $affiliationData = [
            ['section_no' => '01', 'section_name' => '水質管理センター'],
            ['section_no' => '02', 'section_name' => '霞ヶ浦浄水場']
        ];

        $userData = [
            [
                'user_id' => 12345,
                'user_name' => 'テストユーザー',
                'affiliation_section_no' => '01',
                'security_level' => 1
            ]
        ];

        $displayTimeData = [];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn($affiliationData);

        $this->mng010ServiceMock
            ->shouldReceive('fetchUserData')
            ->once()
            ->with($request)
            ->andReturn($userData);

        $this->commonServiceMock
            ->shouldReceive('getCurrentDisplayTime')
            ->once()
            ->andReturn($displayTimeData);

        // テスト実行
        $response = $this->mng010Controller->fetchUserData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($userData, $responseData['userData']);
        $this->assertEquals($affiliationData, $responseData['affiliationData']);
        $this->assertEquals($displayTimeData, $responseData['displayTime']);
    }

    #[Test]
    public function fetchUserData_【失敗】所属課データ取得()
    {
        // テストデータの準備
        $request = new Request();

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn(false);

        // テスト実行
        $response = $this->mng010Controller->fetchUserData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('メニューラベル', $responseData['errors']);
    }

    #[Test]
    public function fetchUserData_【失敗】ユーザデータ取得()
    {
        // テストデータの準備
        $request = new Request();

        $affiliationData = [
            ['section_no' => '01', 'section_name' => '水質管理センター']
        ];

        // モックの設定
        $this->commonServiceMock
            ->shouldReceive('getAffiliationData')
            ->once()
            ->andReturn($affiliationData);

        $this->mng010ServiceMock
            ->shouldReceive('fetchUserData')
            ->once()
            ->with($request)
            ->andReturn(false);

        // テスト実行
        $response = $this->mng010Controller->fetchUserData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('fetchUserData', $responseData['errors']);
    }

    #[Test]
    public function saveUserMasterData_【成功】ユーザ新規登録()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'processFlg' => 'NEW',
                    'userId' => 12345,
                    'userPassword' => 'password123',
                    'userName' => 'テストユーザー',
                    'userFurigana' => 'テストユーザー',
                    'affiliationSectionNo' => '01',
                    'securityLevel' => 1,
                    'registDate' => '2025-01-01',
                    'endDate' => '2025-12-31'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ];

        $request = new \App\Http\Requests\Mng010Request($requestData);

        // モックの設定
        $this->mng010ServiceMock
            ->shouldReceive('saveUserMasterData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // テスト実行
        $response = $this->mng010Controller->saveUserMasterData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveUserMasterData_【失敗】ユーザ新規登録()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'processFlg' => 'NEW',
                    'userId' => 12345,
                    'userPassword' => 'password123',
                    'userName' => 'テストユーザー',
                    'affiliationSectionNo' => '01',
                    'securityLevel' => 1,
                    'registDate' => '2025-01-01',
                    'endDate' => '2025-12-31'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ];

        $request = new \App\Http\Requests\Mng010Request($requestData);

        // モックの設定
        $this->mng010ServiceMock
            ->shouldReceive('saveUserMasterData')
            ->once()
            ->with($request)
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // テスト実行
        $response = $this->mng010Controller->saveUserMasterData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveUserMasterData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveUserMasterData']);
    }

    #[Test]
    public function saveUserMasterData_【失敗】ユーザ更新_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'processFlg' => 'EDIT',
                    'userId' => 12345,
                    'userName' => 'テストユーザー',
                    'affiliationSectionNo' => '01',
                    'securityLevel' => 1,
                    'registDate' => '2025-01-01',
                    'endDate' => '2025-12-31'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ];

        $request = new \App\Http\Requests\Mng010Request($requestData);

        // モックの設定
        $this->mng010ServiceMock
            ->shouldReceive('saveUserMasterData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng010Controller->saveUserMasterData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveUserMasterData', $responseData['errors']);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveUserMasterData']);
    }

    #[Test]
    public function saveUserMasterData_【失敗】ユーザ更新_他のユーザが同一データを同時に更新()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'processFlg' => 'EDIT',
                    'userId' => 12345,
                    'userName' => 'テストユーザー',
                    'affiliationSectionNo' => '01',
                    'securityLevel' => 1,
                    'registDate' => '2025-01-01',
                    'endDate' => '2025-12-31'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ];

        $request = new \App\Http\Requests\Mng010Request($requestData);

        // モックの設定
        $this->mng010ServiceMock
            ->shouldReceive('saveUserMasterData')
            ->once()
            ->with($request)
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // テスト実行
        $response = $this->mng010Controller->saveUserMasterData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveUserMasterData', $responseData['errors']);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveUserMasterData']);
    }

    #[Test]
    public function saveUserMasterData_【失敗】ユーザ削除_DBに対象データ存在しない()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'processFlg' => 'DELETE',
                    'userId' => 12345
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ];

        $request = new \App\Http\Requests\Mng010Request($requestData);

        // モックの設定
        $this->mng010ServiceMock
            ->shouldReceive('saveUserMasterData')
            ->once()
            ->with($request)
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // テスト実行
        $response = $this->mng010Controller->saveUserMasterData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveUserMasterData', $responseData['errors']);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveUserMasterData']);
    }

    #[Test]
    public function saveUserMasterData_【失敗】その他エラー()
    {
        // テストデータの準備
        $requestData = [
            'data_to_save' => [
                [
                    'processFlg' => 'NEW',
                    'userId' => 12345,
                    'userPassword' => 'password123',
                    'userName' => 'テストユーザー',
                    'affiliationSectionNo' => '01',
                    'securityLevel' => 1,
                    'registDate' => '2025-01-01',
                    'endDate' => '2025-12-31'
                ]
            ],
            'display_time' => '2025-01-01 10:00:00.000'
        ];

        $request = new \App\Http\Requests\Mng010Request($requestData);

        // モックの設定
        $this->mng010ServiceMock
            ->shouldReceive('saveUserMasterData')
            ->once()
            ->with($request)
            ->andReturn(999); // 未定義のエラーコード

        // テスト実行
        $response = $this->mng010Controller->saveUserMasterData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveUserMasterData', $responseData['errors']);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveUserMasterData']);
    }
}
