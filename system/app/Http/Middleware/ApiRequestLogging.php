<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ApiRequestLogging
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $ip = $request->ip();
        $method = $request->method();
        $url = $request->fullUrl();
        $user_name = $request->user()->user_id;
        $pc_name = gethostname();
        if (str_contains($url, 'spt020/insert') || str_contains($url, 'spt030/insert') || str_contains($url, 'spt020/update') || str_contains($url, 'spt030/update')) {
            $body = json_encode($request->all(), JSON_UNESCAPED_UNICODE);
        } else {
            $body = $request->getContent();
        }

        Log::channel('request')->info(
            "ip : " . $ip . "\n"
                . "method : " . $method . "\n"
                . "url : " . $url . "\n"
                . "user-name : " . $user_name . "\n"
                . "pc-name : " . $pc_name . "\n"
                . $body
        );
        return $next($request);
    }

    public function terminate($request, $response)
    {
        // サイズが100KBを超えたりするので途中まで出力します。
        if (env('LOG_LEVEL') == 'info') {
            Log::channel('response')->info(
                mb_substr(response()->json(
                    $response,
                    $response->status(),
                    [],
                    JSON_UNESCAPED_UNICODE
                ), 1, 5000)
            );
        } else if (env('LOG_LEVEL') == 'debug') {
            Log::channel('response')->debug(
                response()->json(
                    $response,
                    $response->status(),
                    [],
                    JSON_UNESCAPED_UNICODE
                )
            );
        }
    }
}
