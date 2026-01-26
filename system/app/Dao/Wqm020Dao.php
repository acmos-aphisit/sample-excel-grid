<?php

namespace App\Dao;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Facades\Hash;

use stdClass;

/**
 * 報告書出力DAO
 *
 */
class Wqm020Dao
{

    /**
     * 初期値取得 検査区分
     */
    public function getKbn() {
        
        try {
            // 初期化
            $where = "";

            $SQL = <<<SQL
                select
                    inspection_kbn_code as value
                    , inspection_kbn_name as label
                from
                    m_inspection_kbn
                order by
                    inspection_kbn_code
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }

    }

    /**
     * 初期値取得 施設
     */
    public function getSisetu($request = null) {
        
        try {
            // 初期化
            $bindValue['a'] = 1;
            $where = " 1 = :a";

            if($request !== null && isset($request->process)){
                $bindValue['process'] = $request->process;
                $where .= ' AND process.process_no = :process';
            }

            $SQL = <<<SQL
                select
                    sisetu.sisetu_no as value
                    , sisetu.sisetu_name as label 
                from
                    m_sisetu as sisetu
                left join
                    m_saisui_point as point
                    on
                        sisetu.sisetu_no = point.sisetu_no
                left join
                    m_process as process
                    on
                        process.process_no = point.process_no
                where
                    $where
                --     sisetu_type = 0 
                group by
                    sisetu.sisetu_no
                    ,sisetu.sisetu_name
                order by
                    sisetu.sisetu_order
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL,$bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }

    }

    /**
     * 初期値取得 処理過程
     */
    public function getProcess($request = null) {
        try {
            // 初期化
            $bindValue['a'] = 1;
            $where = " 1 = :a";

            if($request !== null && isset($request->sisetu)){
                $bindValue['sisetu'] = $request->sisetu;
                $where .= ' AND point.sisetu_no = :sisetu';
            }

            $SQL = <<<SQL
                select
                    process.process_no as value
                    , process.process_name as label
                from
                    m_process as process
                left join
                    m_saisui_point as point
                    on
                        process.process_no = point.process_no
                where
                    $where
                group by
                    process.process_no
                    , process.process_name
                order by
                    process.process_order asc
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL,$bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }

    }

    /**
     * 初期値取得 検査種類(大分類)
     */
    public function getCat() {
        
        try {
            // 初期化
            $where = "";

            $SQL = <<<SQL
                select
                    item_dai_category_no as value
                    , item_dai_category_name as label
                from
                    m_inspection_dai_category
                order by
                    item_dai_order
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }

    }

    /**
     * 初期値取得 採水地点
     */
    public function getPoint($request = null) {
        try {
            // 初期化
            $bindValue['a'] = 1;
            $where = " 1 = :a";

            if($request !== null && isset($request->sisetu)){
                $bindValue['sisetu'] = $request->sisetu;
                $where .= ' AND sisetu_no = :sisetu';
            }

            if($request !== null && isset($request->process)){
                $bindValue['process'] = $request->process;
                $where .= ' AND process_no = :process';
            }

            $SQL = <<<SQL
                select
                    point_no as value
                    , point_dsp_name as label
                from
                    m_saisui_point
                where
                    $where
                order by
                    point_no
                    
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL,$bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }

    }

    /**
     * 初期値取得 検査項目
     */
    public function getItem($request = null) {
        try {
            // 初期化
            $bindValue['a'] = 1;
            $where = " 1 = :a";

            if($request !== null && isset($request->cat)){
                $bindValue['cat'] = $request->cat;
                $where .= ' AND item_dai_category_no = :cat';
            }

            $SQL = <<<SQL
                select
                    item_no as value
                    , item_dsp_name as label
                    , constant_qualitative_flg as flg
                from
                    m_inspection_item
                where
                    $where
                order by
                    item_order
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL,$bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }

    }


    public function getCountSearchList($request)
    {
        try {
            // 初期化
            $where = "";
            $bindValue = array();

            // 条件
            // 日付 これだけは必ずある想定
            $bindValue = array(
                'date_from' => $request->date_from,
                'date_to'   => $request->date_to,
            );

            // 検査区分コード
            if(isset($request->kbn)){
                $where .= " AND ir.inspection_kbn_code = :kbn";
                $bindValue['kbn'] = $request->kbn;
            }
            
            // 浄水場 施設
            if(isset($request->sisetu)){
                $where .= " AND sisetu.sisetu_no = :sisetu";
                $bindValue['sisetu'] = $request->sisetu;
            }

            // 大分類
            if(isset($request->cat)){
                $where .= " AND dai.item_dai_category_no = :cat";
                $bindValue['cat'] = $request->cat;
            }

            // 処理過程(中分類)
            if(isset($request->process)){
                $where .= " AND process.process_no = :process";
                $bindValue['process'] = $request->process;
            }

            // 地点番号
            if(isset($request->point_no) && count($request->point_no) > 0){
                $where .= " AND point.point_no IN ( ";
                $points = '';
                foreach($request->point_no as $index => $value){
                    $bindValue['point'.(string)$index] = $value;
                    $points .= ':point'.(string)$index.',';
                }
                $points = substr($points,0,-1);
                $where .= $points." ) ";
            }

            // 項目番号
            if(isset($request->item_no) && count($request->item_no) > 0){
                $where .= " AND item.item_no IN ( ";
                $items = '';
                foreach($request->item_no as $index => $value){
                    $bindValue['item'.(string)$index] = $value;
                    $items .= ':item'.(string)$index.',';
                }
                $items = substr($items,0,-1);
                $where .= $items." ) ";
            }

            // 検索順
            if(isset($request->order_column)){
                switch($request->order_column){
                    case 'wqm020date':
                        $order = " ir.saisui_date";
                        break;
                    case 'wqm020time':
                        $order = " ir.saisui_time";
                        break;
                    case 'wqm020kbn':
                        $order = " kbn.inspection_kbn_name";
                        break;
                    case 'wqm020point':
                        $order = " point.point_dsp_name";
                        break;
                    case 'wqm020item':
                        $order = " item.item_dsp_name";
                        break;
                    case 'wqm020q_data':
                        $order = " ir.qualitative_data";
                        break;
                    case 'wqm020c_data':
                        $order = " ir.constant_data";
                        break;
                    default:
                        $order = " ir.saisui_date";
                        break;
                }
            }else{
                $order = " ir.saisui_date";
            }

            $SQL = <<<SQL
                select
                    count(ir.saisui_date)
                from
                    t_inspection_result as ir                   -- 検査結果
                    left join m_inspection_kbn as kbn           -- 検査区分マスタ
                        on ir.inspection_kbn_code = kbn.inspection_kbn_code 
                    left join m_saisui_point as point           -- 採水地点マスタ
                        on ir.point_no = point.point_no 
                    left join m_process as process              -- 処理過程マスタ
                        on point.process_no = process.process_no 
                    left join m_sisetu as sisetu                -- 施設マスタ
                        on point.sisetu_no = sisetu.sisetu_no 
                    left join m_inspection_item as item         -- 検査項目マスタ
                        on ir.item_no = item.item_no 
                    left join m_inspection_dai_category as dai  -- 検査項目大分類マスタ
                        on item.item_dai_category_no = dai.item_dai_category_no 
                where
                    ir.saisui_date between :date_from AND :date_to
                    $where
            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            
            if(count($result) > 0 && $result[0]->count > config('const.SEARCH_LIMIT')){
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error($e);
        }
        return true;
    }
    
    /**
     * 報告書構成 地点有無チェック
     * 
     * @return response 結果
     */
    public function getList($request, $limitFlg = true)
    {
        try {
            // 初期化
            $where = "";
            $order = "";
            $limit = "";
            $bindValue = array();

            // 条件
            // 日付 これだけは必ずある想定
            $bindValue = array(
                'date_from' => $request->date_from,
                'date_to'   => $request->date_to,
            );

            // 検査区分コード
            if(isset($request->kbn)){
                $where .= " AND ir.inspection_kbn_code = :kbn";
                $bindValue['kbn'] = $request->kbn;
            }
            
            // 浄水場 施設
            if(isset($request->sisetu)){
                $where .= " AND sisetu.sisetu_no = :sisetu";
                $bindValue['sisetu'] = $request->sisetu;
            }

            // 大分類
            if(isset($request->cat)){
                $where .= " AND dai.item_dai_category_no = :cat";
                $bindValue['cat'] = $request->cat;
            }

            // 処理過程(中分類)
            if(isset($request->process)){
                $where .= " AND process.process_no = :process";
                $bindValue['process'] = $request->process;
            }

            // 地点番号
            if(isset($request->point_no) && count($request->point_no) > 0){
                $where .= " AND point.point_no IN ( ";
                $points = '';
                foreach($request->point_no as $index => $value){
                    $bindValue['point'.(string)$index] = $value;
                    $points .= ':point'.(string)$index.',';
                }
                $points = substr($points,0,-1);
                $where .= $points." ) ";
            }

            // 項目番号
            if(isset($request->item_no) && count($request->item_no) > 0){
                $where .= " AND item.item_no IN ( ";
                $items = '';
                foreach($request->item_no as $index => $value){
                    $bindValue['item'.(string)$index] = $value;
                    $items .= ':item'.(string)$index.',';
                }
                $items = substr($items,0,-1);
                $where .= $items." ) ";
            }

            // 検索順
            if(isset($request->order_column)){
                switch($request->order_column){
                    case 'wqm020date':
                        $order = " ir.saisui_date";
                        break;
                    case 'wqm020time':
                        $order = " ir.saisui_time";
                        break;
                    case 'wqm020kbn':
                        $order = " kbn.inspection_kbn_name";
                        break;
                    case 'wqm020point':
                        $order = " point.point_dsp_name";
                        break;
                    case 'wqm020item':
                        $order = " item.item_dsp_name";
                        break;
                    case 'wqm020q_data':
                        $order = " ir.qualitative_data";
                        break;
                    case 'wqm020c_data':
                        $order = " ir.constant_data";
                        break;
                    default:
                        $order = " ir.saisui_date";
                        break;
                }
            }else{
                $order = " ir.saisui_date";
            }
            if($request->order_direction === false){
                $order .= " desc";
            }else{
                $order .= " asc";
            }
            $order .= " ,ir.point_no asc ,ir.item_no asc";

            // 制限
            if($limitFlg){
                $bindValue['offset'] = $request->offset;
                $limit = " limit 1000 offset :offset ";
            }else{
                $limit = " limit ".(string)config('const.SEARCH_LIMIT');
            }

            $SQL = <<<SQL
                select
                    to_char(ir.saisui_date, 'yyyy/mm/dd') as date
                    ,ir.saisui_time as time
                    ,point.point_dsp_name as point
                    ,item.item_dsp_name as item
                    ,kbn.inspection_kbn_name as kbn
                    -- ,ir.constant_data as c_data
                    ,REGEXP_REPLACE(TO_CHAR(ir.constant_data, 'FM999999999999999990.9999999'),'\.$','') as c_data
                    ,ir.qualitative_data as q_data
                from
                    t_inspection_result as ir                   -- 検査結果
                    left join m_inspection_kbn as kbn           -- 検査区分マスタ
                        on ir.inspection_kbn_code = kbn.inspection_kbn_code 
                    left join m_saisui_point as point           -- 採水地点マスタ
                        on ir.point_no = point.point_no 
                    left join m_process as process              -- 処理過程マスタ
                        on point.process_no = process.process_no 
                    left join m_sisetu as sisetu                -- 施設マスタ
                        on point.sisetu_no = sisetu.sisetu_no 
                    left join m_inspection_item as item         -- 検査項目マスタ
                        on ir.item_no = item.item_no 
                    left join m_inspection_dai_category as dai  -- 検査項目大分類マスタ
                        on item.item_dai_category_no = dai.item_dai_category_no 
                where
                    ir.saisui_date between :date_from AND :date_to
                    $where
                order by
                    $order 
                $limit

            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }
    
    /**
     * 報告書構成 地点有無チェック
     * 
     * @return response 結果
     */
    public function getCalcState($request)
    {
        try {
            // 初期化
            $where = "";
            $order = "";
            $bindValue = array();

            // 条件
            // 日付 これだけは必ずある想定
            $bindValue = array(
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            );

            // 検査区分コード
            if(isset($request->kbn)){
                $where .= " AND ir.inspection_kbn_code = :kbn";
                $bindValue['kbn'] = $request->kbn;
            }
            
            // 浄水場 施設
            if(isset($request->sisetu)){
                $where .= " AND sisetu.sisetu_no = :sisetu";
                $bindValue['sisetu'] = $request->sisetu;
            }

            // 大分類
            if(isset($request->cat)){
                $where .= " AND dai.item_dai_category_no = :cat";
                $bindValue['cat'] = $request->cat;
            }

            // 処理過程(中分類)
            if(isset($request->process)){
                $where .= " AND process.process_no = :process";
                $bindValue['process'] = $request->process;
            }

            // 地点番号
            if(isset($request->point_no) && count($request->point_no) > 0){
                $where .= " AND point.point_no IN ( ";
                $points = '';
                foreach($request->point_no as $index => $value){
                    $bindValue['point'.(string)$index] = $value;
                    $points .= ':point'.(string)$index.',';
                }
                $points = substr($points,0,-1);
                $where .= $points." ) ";
            }

            // 項目番号
            if(isset($request->item_no) && count($request->item_no) > 0){
                $where .= " AND item.item_no IN ( ";
                $items = '';
                foreach($request->item_no as $index => $value){
                    $bindValue['item'.(string)$index] = $value;
                    $items .= ':item'.(string)$index.',';
                }
                $items = substr($items,0,-1);
                $where .= $items." ) ";
            }

            $SQL = <<<SQL
                select
                    -- MAX(ir.constant_data) as max
                    -- ,MIN(ir.constant_data) as min
                    -- ,AVG(ir.constant_data) as avg
                    -- TRUNC(MAX(ir.constant_data), 0) as max
                    -- ,TRUNC(MAX(ir.constant_data), 0) as min
                    -- ,ROUND(AVG(ir.constant_data),2) as avg
                     REGEXP_REPLACE(TO_CHAR(MAX(ir.constant_data), 'FM999999999999999990.9999999'),'\.$','') as max
                    ,REGEXP_REPLACE(TO_CHAR(MIN(ir.constant_data), 'FM999999999999999990.9999999'),'\.$','') as min
                    ,REGEXP_REPLACE(TO_CHAR(AVG(ir.constant_data), 'FM999999999999999990.9999999'),'\.$','') as avg
                    -- TO_CHAR(TRUNC(MAX(ir.constant_data), 0), 'FM999999999999999999.#######') as max
                    -- ,TO_CHAR(TRUNC(MIN(ir.constant_data), 0), 'FM999999999999999999.#######') as min
                    -- ,TO_CHAR(TRUNC(AVG(ir.constant_data), 0), 'FM999999999999999999.#######') as avg
                    ,COUNT(ir.constant_data) as count
                from
                    t_inspection_result as ir                   -- 検査結果
                    left join m_inspection_kbn as kbn           -- 検査区分マスタ
                        on ir.inspection_kbn_code = kbn.inspection_kbn_code 
                    left join m_saisui_point as point           -- 採水地点マスタ
                        on ir.point_no = point.point_no 
                    left join m_process as process              -- 処理過程マスタ
                        on point.process_no = process.process_no 
                    left join m_sisetu as sisetu                -- 施設マスタ
                        on point.sisetu_no = sisetu.sisetu_no 
                    left join m_inspection_item as item         -- 検査項目マスタ
                        on ir.item_no = item.item_no 
                    left join m_inspection_dai_category as dai  -- 検査項目大分類マスタ
                        on item.item_dai_category_no = dai.item_dai_category_no 
                where
                    ir.saisui_date between :date_from AND :date_to
                    and ir.constant_qualitative_flg = 1
                    $where
                limit 50000

            SQL;

            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);

            if($result !== null && count($result) > 0 ){
            return $result[0];
            }

        } catch (\Exception $e) {
            Log::error($e);
        }
        return false;
    }

    
    /**
     * トレンド画面 検索処理
     * 
     * @return result 結果
     */
    public function getTrendData($request)
    {

        // 初期化
        $where = "";
        $bindValue = array();

        // 日付
        if(isset($request->date_from) && isset($request->date_to)){
            $bindValue['date_from'] = $request->date_from;
            $bindValue['date_to'] = $request->date_to;
            $where .= " AND saisui_date BETWEEN :date_from AND :date_to ";
        }else{
            return false;
        }

        // 検査区分
        if(isset($request->kensa)){
            $bindValue['kensa'] = $request->kensa;
            $where .= " AND i_result.inspection_kbn_code = :kensa ";
        }

        // 項目番号
        if(isset($request->item_no)){
            $bindValue['item_no'] = $request->item_no;
            $where .= " AND i_result.item_no = :item_no ";
        }

        // 採水地点
        if(isset($request->point_no)){
            $where .= " AND i_result.point_no IN ( ";
            $points = '';
            foreach($request->point_no as $index => $value){
                $bindValue['point'.(string)$index] = $value;
                $points .= ':point'.(string)$index.',';
            }
            $points = substr($points,0,-1);
            $where .= $points." ) ";
        }

        try {
            // 直近の100件までを取得(最大でも10年前まで)
            $SQL = <<<SQL
                SELECT
                    *
                FROM
                    ( 
                        SELECT
                            TO_CHAR(saisui_date, 'YYYY/MM/DD') AS date
                            , constant_data AS value
                            , point.point_dsp_name AS point_name 
                            , point.point_no
                            , ROW_NUMBER() OVER (PARTITION BY saisui_date, i_result.item_no, i_result.point_no  ORDER BY constant_data DESC) AS rn
                        FROM
                            t_inspection_result AS i_result 
                            LEFT JOIN m_saisui_point AS point 
                                ON i_result.point_no = point.point_no 
                        WHERE
                            1 = 1
                            $where
                        ORDER BY
                            saisui_date desc
                            , i_result.item_no
                            , i_result.point_no 
                    ) 
                where
                    rn = 1
                ORDER BY
                    date asc
            SQL;
            
            $result = array();
            $result = DB::connection('suishitsu_db')->select($SQL, $bindValue);
            if(count($result) == 0){
              return false;
            }

            return $result;
        } catch (\Exception $e) {
            Log::error($e);

            return false;
        }
    }
}