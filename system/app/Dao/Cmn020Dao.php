<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * お知らせDAO
 *
 */
class Cmn020Dao
{
    /**
     * お知らせを取得
     * 
     * @return response 結果
     */
    public function fetchInfoData($request)
    {
        try {
            $bindValue = array(
                'dsp_flg' => "1",                                                   // 表示フラグ
                'per_page' => $request->perPage,                                    // 1ページに表示件数
                'off_set' => ($request->curPage - 1) * $request->perPage            // データの取得を行う最初の位置
            );

            $SQL = <<<SQL
                    SELECT
                        *
                    FROM
                        t_info
                    WHERE
                        dsp_flg = :dsp_flg
                    ORDER BY
                        info_date DESC
                    LIMIT :per_page
                    OFFSET :off_set
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            // ページネーション設定
            $bindValueCount = array(
                'dsp_flg' => "1",                                                   // 表示フラグ
            );
            
            $SQL_COUNT = <<<SQL
                    SELECT
                        COUNT(*) as count
                    FROM
                        t_info as temp
                    WHERE
                        dsp_flg = :dsp_flg
            SQL;

            $total = DB::connection('suishitsu_db')->selectOne($SQL_COUNT, $bindValueCount)->count;

            // ページネーション情報を生成
            $paginator = new LengthAwarePaginator(
                $result,
                $total,
                $request->perPage,
                $request->curPage,
                ['path' => request()->url(), 'query' => request()->query()]
            );

            return $paginator;
        } catch (\Exception $e) {
            // DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return false;
        }
    }
}
