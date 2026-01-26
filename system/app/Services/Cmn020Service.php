<?php

namespace App\Services;

use App\Dao\Cmn020Dao;

/**
 * お知らせタ設定サービス
 *
 * @author
 */
class Cmn020Service
{
    // お知らせタDAO
    private $Cmn020Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Cmn020Dao = new Cmn020Dao();
    }

    /**
     * お知らせタを取得
     * 
     */
    public function fetchInfoData($request)
    {
        $fetchInfoData = $this->Cmn020Dao->fetchInfoData($request);

        return $fetchInfoData;
    }
}
