<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Exception;
use Illuminate\Contracts\Auth\Factory as Auth;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// ハッシュ不用
// use Illuminate\Support\Facades\Auth;


use App\Models\User;
use Illuminate\Support\Facades\Log;

final class LoginController extends Controller
{
    private $auth;

    /**
     * CookieAuthenticationController constructor.
     * @param Auth $auth
     */
    public function __construct(Auth $auth)
    {
        $this->auth = $auth;
    }

    /**
     * @param Request $request
     * @return JsonResponse
     * @throws Exception
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'user_id'   => 'required|regex:/^[0-9]+$/',
            'user_password' => 'required',
        ], [
            'user_id.required'   => ['WQ-0001W', 'ユーザID'],
            'user_id.regex'    => ['WQ-0001W', '正しいユーザID'],
            'user_password.required' => ['WQ-0001W', 'パスワード'],
        ]);

        $credentials = [
            'user_id'  => $request->user_id,
            'password' => $request->user_password,
        ];

        // 方法⓵：暗号化(Hash)のパスワード用
        if ($this->getGuard()->attempt($credentials)) {
            $request->session()->regenerate();

            $response = array(
                'status'   => 'success',
                'userInfo' => [
                    'userId'                    => $request->user()->user_id,                       // ユーザID
                    'userName'                  => $request->user()->user_name,                     // 氏名
                    'affiliationSectionNo'      => $request->user()->affiliation_section_no,        // 所属課番号
                    'securityLevel'             => $request->user()->security_level,                // 権限
                    'fixFlg'                    => $request->user()->fix_flg,                       // 確定フラグ
                ]
            );
          
            // ログイン成功
            return response()->json($response, config('const.HTTP_STATUS_OK'));
        }

        // ログイン失敗
        return response()->json(array('errors' => array('login' => [['WQ-0008W']])), config('const.HTTP_STATUS_UNAUTHORIZED'));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $this->getGuard()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $response = array(
            'status' => 'success'
        );
        return response()->json($response, 200);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function loginCheck(Request $request): JsonResponse
    {
        // ログイン状態を確認
        $status =  true;
        $response = array(
            'status' => $status
        );
        return response()->json($response, 200);
    }

    /**
     * @return StatefulGuard
     */
    private function getGuard(): StatefulGuard
    {
        return $this->auth->guard(config('auth.defaults.guard'));
    }
}
