<?php

namespace Tests\Unit;

use App\Http\Controllers\Spt030Controller;
use App\Services\CommonService;
use App\Services\Spt030Service;
use App\Http\Requests\Spt030Request;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Mockery;
use ReflectionClass;

class Spt030Test extends TestCase
{
    protected $spt030Controller;
    protected $mockCommonService;
    protected $mockSpt030Service;

    protected function setUp(): void
    {
        parent::setUp();

        // サービスのモックを作成
        $this->mockCommonService = Mockery::mock(CommonService::class);
        $this->mockSpt030Service = Mockery::mock(Spt030Service::class);

        // コントローラーのインスタンスを作成
        $this->spt030Controller = new Spt030Controller();

        // リフレクションを使用してプライベートプロパティにモックを注入
        $reflection = new ReflectionClass($this->spt030Controller);

        $commonServiceProperty = $reflection->getProperty('commonService');
        $commonServiceProperty->setAccessible(true);
        $commonServiceProperty->setValue($this->spt030Controller, $this->mockCommonService);

        $spt030ServiceProperty = $reflection->getProperty('Spt030Service');
        $spt030ServiceProperty->setAccessible(true);
        $spt030ServiceProperty->setValue($this->spt030Controller, $this->mockSpt030Service);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function searchUnyouMemoData_【成功】運用メモ取得()
    {
        // テストデータ
        $mockData = [
            [
                'unyou_id' => 1,
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'unyou_memo' => '運用メモの内容',
                'unyou_bikou' => '備考',
                'file_path' => '/path/to/file.pdf',
                'dsp_flg' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ]
        ];

        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('searchUnyouMemoData')
            ->once()
            ->andReturn($mockData);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->spt030Controller->searchUnyouMemoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals($mockData, $responseData['unyouMemo']);
        $this->assertArrayHasKey('displayTime', $responseData);
    }

    #[Test]
    public function searchUnyouMemoData_【失敗】運用メモ取得()
    {
        // モックの設定（falseを返す）
        $this->mockSpt030Service
            ->shouldReceive('searchUnyouMemoData')
            ->once()
            ->andReturn(false);

        // リクエストの作成
        $request = new Request();

        // テスト実行
        $response = $this->spt030Controller->searchUnyouMemoData($request);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('searchUnyouMemoData', $responseData['errors']);
    }

    #[Test]
    public function saveUnyouMemoData_【成功】運用メモ登録()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'unyou_memo' => '運用メモの内容',
                'unyou_bikou' => '備考',
                'dsp_flg' => 1,
                'info_regist_flg' => 0
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'unyou_memo' => '運用メモの内容',
            'unyou_bikou' => '備考',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】運用メモ登録_DBにデータ存在()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.INSERT_NEW_ERROR'));

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'dsp_flg' => 1
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('saveUnyouMemoData', $responseData['errors']);
        $this->assertEquals([['WQ-0024E']], $responseData['errors']['saveUnyouMemoData']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】運用メモ更新_DBに対象データ存在しない()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.UPDATE_NO_DATA_ERROR'));

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '編集',
                'unyou_id' => 1,
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ更新',
                'dsp_flg' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ更新',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0026E']], $responseData['errors']['saveUnyouMemoData']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】運用メモ更新_他のユーザがを同一データを同時に更新()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.UPDATE_UPDATED_ERROR'));

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '編集',
                'unyou_id' => 1,
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ更新',
                'dsp_flg' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ更新',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0005E']], $responseData['errors']['saveUnyouMemoData']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】運用メモ削除_DBに対象データ存在しない()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.DELETE_NO_DATA_ERROR'));

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '削除',
                'unyou_id' => 1,
                'display_time' => '2025-01-01 10:00:00'
            ])
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0025E']], $responseData['errors']['saveUnyouMemoData']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】運用メモ登録_その他エラー()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.OTHER_ERROR'));

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'dsp_flg' => 1
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_INTERNAL_SERVER_ERROR'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertEquals([['WQ-0002E']], $responseData['errors']['saveUnyouMemoData']);
    }

    #[Test]
    public function saveUnyouMemoData_バリデーション_必須項目エラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt030Service
            ->shouldNotReceive('saveUnyouMemoData');

        // 必須項目が不足しているリクエストデータ
        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_title' => 'テスト運用メモ',
                'unyou_memo' => 'テスト運用メモ',
                'unyou_bikou' => 'テスト運用メモ',
                // unyou_date と dsp_flg が不足
            ])
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT030/saveUnyouMemoData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('unyou_date', $responseData['errors']);
        $this->assertArrayHasKey('dsp_flg', $responseData['errors']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】バリデーション_文字数制限エラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt030Service
            ->shouldNotReceive('saveUnyouMemoData');

        // 文字数制限を超えるリクエストデータ
        $longTitle = str_repeat('あ', 2570);  // 257文字
        $longMemo = str_repeat('あ', 5001);  // 5001文字
        $longBikou = str_repeat('あ', 5001); // 5001文字

        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => $longTitle,
                'unyou_memo' => $longMemo,
                'unyou_bikou' => $longBikou,
                'dsp_flg' => 1
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => $longTitle,
            'unyou_memo' => $longMemo,
            'unyou_bikou' => $longBikou,
            'dsp_flg' => 1
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT030/saveUnyouMemoData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('unyou_title', $responseData['errors']);
        $this->assertArrayHasKey('unyou_memo', $responseData['errors']);
        $this->assertArrayHasKey('unyou_bikou', $responseData['errors']);
    }

    #[Test]
    public function saveUnyouMemoData_【成功】ファイルアップロード()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // ファイルのモック作成
        $file = UploadedFile::fake()->create('test.pdf', 1024); // 1MB

        // リクエストデータ
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'dsp_flg' => 1
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'dsp_flg' => 1,
            'upload_file' => $file,
            'upload_file_name' => 'test.pdf'
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】ファイルアップロード_拡張子エラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt030Service
            ->shouldNotReceive('saveUnyouMemoData');

        // 許可されていない拡張子のファイル
        $file = UploadedFile::fake()->create('test.txt', 1024);

        // リクエストデータ
        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'unyou_memo' => 'テスト運用メモ',
                'unyou_bikou' => 'テスト運用メモ',
                'dsp_flg' => 1
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'unyou_memo' => 'テスト運用メモ',
            'unyou_bikou' => 'テスト運用メモ',
            'dsp_flg' => 1,
            'upload_file' => $file,
            'upload_file_name' => 'test.txt'
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT030/saveUnyouMemoData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('upload_file', $responseData['errors']);
    }

    #[Test]
    public function saveUnyouMemoData_【失敗】ファイルアップロード_サイズエラー()
    {
        // Dummy ユーザ
        $user = User::where('user_id', '9999')->first();

        // 登録処理を実行しないように設定
        $this->mockSpt030Service
            ->shouldNotReceive('saveUnyouMemoData');

        // 100MBを超えるファイル（102401KB = 約100.001MB）
        $file = UploadedFile::fake()->create('test.pdf', 102401);

        // リクエストデータ
        $requestData = [
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'unyou_memo' => 'テスト運用メモ',
                'unyou_bikou' => 'テスト運用メモ',
                'dsp_flg' => 1
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'unyou_memo' => 'テスト運用メモ',
            'unyou_bikou' => 'テスト運用メモ',
            'dsp_flg' => 1,
            'upload_file' => $file,
            'upload_file_name' => 'test.pdf'
        ];

        // テスト実行
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/SPT030/saveUnyouMemoData', $requestData);

        // アサーション
        $this->assertEquals(422, $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('errors', $responseData);
        $this->assertArrayHasKey('upload_file', $responseData['errors']);
    }

    #[Test]
    public function saveUnyouMemoData_【成功】お知らせ掲載フラグ付き登録()
    {
        // モックの設定
        $this->mockSpt030Service
            ->shouldReceive('saveUnyouMemoData')
            ->once()
            ->andReturn(config('const.INSERT_NO_ERROR'));

        // リクエストデータ（お知らせ掲載フラグ = 1）
        $requestData = new Spt030Request([
            'data' => json_encode([
                'data_mode' => '登録',
                'unyou_date' => '2025-01-01',
                'unyou_title' => 'テスト運用メモ',
                'unyou_memo' => '運用メモの内容',
                'dsp_flg' => 1,
                'info_regist_flg' => 1  // お知らせに掲載
            ]),
            'unyou_date' => '2025-01-01',
            'unyou_title' => 'テスト運用メモ',
            'unyou_memo' => '運用メモの内容',
            'dsp_flg' => 1
        ]);

        // テスト実行
        $response = $this->spt030Controller->saveUnyouMemoData($requestData);

        // アサーション
        $this->assertEquals(config('const.HTTP_STATUS_OK'), $response->getStatusCode());

        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertEquals(config('const.INSERT_NO_ERROR'), $responseData['result']);
    }
}
