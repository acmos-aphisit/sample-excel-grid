<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class LoginTest extends TestCase
{
    #[Test]
    public function 【成功】ログイン()
    {
        $user = User::factory()->create([
            'user_id' => 99999,
            'user_password' => Hash::make('password123'),
        ]);

        $response = $this->post('/api/login', [
            'user_id' => 99999,
            'user_password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'userInfo' => [
                    'userId',
                    'userName',
                    'affiliationSectionNo',
                    'securityLevel',
                ],
            ]);

        // これにより、Authガードがログイン処理を完了したことは保証されます。
        $this->assertAuthenticated();
        $authenticatedUser = auth('sanctum')->user();

        // auth('sanctum')->user() が null ではないことを確認
        $this->assertNotNull($authenticatedUser, "認証後に「auth('sanctum')->user()」がnullを返しています。");

        // ログインIDも一致するか確認できます
        $this->assertEquals($user->user_id, $authenticatedUser->user_id);
    }

    #[Test]
    public function 【失敗】ログイン()
    {
        $user = User::factory()->create([
            'user_id' => 99999,
            'user_password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'user_id' => 99999,
            'user_password' => 'wrongpassword',
        ]);

        $response->assertStatus(config('const.HTTP_STATUS_UNAUTHORIZED'))
            ->assertJsonStructure([
                'errors' => [
                    'login' // 'PM-0009W'
                ]
            ]);

        $this->assertGuest();
    }

    #[Test]
    public function 【失敗】入力情報_バリデーション()
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['user_id', 'user_password']);
    }

    #[Test]
    public function 【成功】ログアウト()
    {
        $user = User::factory()->create([
            'user_id' => 99999,
            'user_password' => Hash::make('password123'),
        ]);

        // ログイン
        $response = $this->post('/api/login', [
            'user_id' => 99999,
            'user_password' => 'password123',
        ]);

        $this->assertAuthenticated();
        $authenticatedUser = auth('sanctum')->user();

        // ログアウト
        $response = $this->post('/api/logout');

        // ステータスの確認 (通常は200 OKまたは204 No Content)
        $response->assertStatus(200)
                 ->assertJson([
                     'status' => 'success',
                 ]);

        // 最重要チェック: ユーザーが認証されていないことを確認
        // ガードで認証されていないことをアサートします。
        $this->assertGuest();
    }
}
