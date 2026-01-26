<?php

namespace Tests\Unit;

use App\Http\Controllers\Spt010Controller;
use App\Services\CommonService;
use App\Services\Spt010Service;
use App\Http\Requests\Spt010Request;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;
use ReflectionClass;

class Spt010Test extends TestCase
{
    protected $spt010Controller;
    protected $mockCommonService;
    protected $mockSpt010Service;

    protected function setUp(): void
    {
        parent::setUp();
        
        // サービスのモックを作成
        $this->mockCommonService = Mockery::mock(CommonService::class);
        $this->mockSpt010Service = Mockery::mock(Spt010Service::class);

        // コントローラーのインスタンスを作成
        $this->spt010Controller = new Spt010Controller();

        // リフレクションを使用してプライベートプロパティにモックを注入
        $reflection = new ReflectionClass($this->spt010Controller);

        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->spt010Controller, $this->mockCommonService);

        $spt010ServiceProperty = $reflection->getProperty('Spt010Service');
        $spt010ServiceProperty->setAccessible(true);
        $spt010ServiceProperty->setValue($this->spt010Controller, $this->mockSpt010Service);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function searchOshiraseData_【成功】お知らせ取得()
    {
        // テストデータ
        $mockData = [
            [
                'info_id' => 1,
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'info_link' => 'https://example.com',
                'file_path' => '/path/to/file.pdf',
                'dsp_flg' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ]
        ];

        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('searchOshiraseData')
            ->once()
            ->andReturn($mockData);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->spt010Controller->searchOshiraseData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockData, $responseData['oshirase']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function searchOshiraseData_【失敗】お知らせ取得()
    {
        // モックの設定（falseを返す）
        $this->mockSpt010Service
            ->shouldReceive('searchOshiraseData')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->spt010Controller->searchOshiraseData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchOshiraseData', $responseData['errors']);
    }

    #[Test]
    public function saveOshiraseData_【成功】お知らせ登録()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'info_link' => 'https://example.com',
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ',
            'info_link' => 'https://example.com',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】お知らせ登録_DBにデータ存在()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveOshiraseData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveOshiraseData']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】お知らせ登録_DBに対象データ存在しない()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '編集',
                'info_id' => 1,
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ更新',
                'dsp_flg' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ更新',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveOshiraseData']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】お知らせ登録_他のユーザが同一データを同時に更新()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '編集',
                'info_id' => 1,
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ更新',
                'dsp_flg' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ更新',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveOshiraseData']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】お知らせ削除_DBに対象データ存在しない()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '削除',
                'info_id' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ])
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveOshiraseData']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】お知らせ登録_その他エラー()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.OTHER_ERROR'));

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveOshiraseData']);
    }

    #[Test]
    public function saveOshiraseData_バリデーション_必須項目エラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt010Service
            ->shouldNotReceive('saveOshiraseData');

        // 必須項目が不足しているリクエストデータ
        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'info_text' => 'テストお知らせ',
                'info_link' => 'テストお知らせ',
                // info_date と dsp_flg が不足
            ])
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT010/saveOshiraseData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('info_date', $responseData['errors']);
        $this->assertArrayHasKey('dsp_flg', $responseData['errors']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】バリデーション_文字数制限エラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt010Service
            ->shouldNotReceive('saveOshiraseData');

        // 文字数制限を超えるリクエストデータ
        $longText = str_repeat('あ', 5001); // 5001文字
        $longLink = str_repeat('a', 256);   // 256文字

        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => $longText,
                'info_link' => $longLink,
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => $longText,
            'info_link' => $longLink,
            'dsp_flg' => 1
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT010/saveOshiraseData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('info_text', $responseData['errors']);
        $this->assertArrayHasKey('info_link', $responseData['errors']);
    }

    #[Test]
    public function saveOshiraseData_【成功】ファイルアップロード()
    {
        // モックの設定
        $this->mockSpt010Service
            ->shouldReceive('saveOshiraseData')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // ファイルのモック作成
        $file = UploadedFile::fake()->create('test.pdf', 1024); // 1MB

        // リクエストデータ
        $requestData = new Spt010Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'info_link' => 'テストお知らせ',
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ',
            'info_link' => 'テストお知らせ',
            'dsp_flg' => 1,
            'upload_file' => $file,
            'upload_file_name' => 'test.pdf'
        ]);

        // テスト実行
        $response = $this->spt010Controller->saveOshiraseData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】ファイルアップロード_拡張子エラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt010Service
            ->shouldNotReceive('saveOshiraseData');

        // 許可されていない拡張子のファイル
        $file = UploadedFile::fake()->create('test.txt', 1024);

        // リクエストデータ
        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'info_link' => 'テストお知らせ',
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ',
            'info_link' => 'テストお知らせ',
            'dsp_flg' => 1,
            'upload_file' => $file,
            'upload_file_name' => 'test.txt'
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT010/saveOshiraseData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('upload_file', $responseData['errors']);
    }

    #[Test]
    public function saveOshiraseData_【失敗】ファイルアップロード_サイズエラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt010Service
            ->shouldNotReceive('saveOshiraseData');

        // 100MBを超えるファイル（102401KB = 約100.001MB）
        $file = UploadedFile::fake()->create('test.pdf', 102401);

        // リクエストデータ
        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'info_date' => '2025-01-01',
                'info_text' => 'テストお知らせ',
                'info_link' => 'テストお知らせ',
                'dsp_flg' => 1
            ]),
            'info_date' => '2025-01-01',
            'info_text' => 'テストお知らせ',
            'info_link' => 'テストお知らせ',
            'dsp_flg' => 1,
            'upload_file' => $file,
            'upload_file_name' => 'test.pdf'
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT010/saveOshiraseData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());
        
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('upload_file', $responseData['errors']);
    }
}
