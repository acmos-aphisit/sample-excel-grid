<?php

namespace App\Services;

use App\Dao\Mng050Dao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;


/**
 * 入力画面設定サービス
 *
 * @author
 */
class Mng050Service
{
    // 検査情報登録DAO
    private $Mng050Dao;

    /**
     * コンストラクタ
     * 
     */
    public function __construct()
    {
        $this->Mng050Dao = new Mng050Dao();
    }

    /**
     * 入力画面情報の表示内容取得
     * 
     */
    public function getSelectedMenu($request)
    {
        $getSelectedMenu = $this->Mng050Dao->getSelectedMenu($request->input_dsp_no);

        return $getSelectedMenu;
    }

    /**
     * 検査区分をリストで取得
     * 
     */
    public function getInspectionLists()
    {
        $getInspectionLists = $this->Mng050Dao->getInspectionLists();

        return $getInspectionLists;
    }

    /**
     * 類似入力画面作成
     * 
     */
    public function duplicateInputMenuDsp($request)
    {
        DB::beginTransaction();
        try {
            // 入力画面番号の取得
            $getInputMenuData = $this->Mng050Dao->getInputMenuData($request->input_menu_no);
            if (!$getInputMenuData) {
                return config('const.OTHER_ERROR');
            }

            // 登録されている順序の最大値 + 10の値を取得する。
            $getMaxOrder = $this->Mng050Dao->getInputMenuMaxOrder();
            $setMaxOrder = intval($getMaxOrder[0]->max) + 10;

            // 選択された親メニューの階層を取得する。
            $getCurHierarchy = $this->Mng050Dao->getInputMenuHierarchy($getInputMenuData[0]->input_parent_menu_no);
            $setCurHierarchy = intval($getCurHierarchy[0]->input_hierarchy) + 1;

            // 
            $getRefInputMenu = $this->Mng050Dao->getInputMenuReferenceNextVal();
            $setDspNo = $getRefInputMenu[0]->input_dsp_no_seq;

            // ➁-2 入力画面構成マスタの登録 m_input_dsp_config
            $duplicateDspConfig = $this->Mng050Dao->duplicateDspConfig($setDspNo, $getInputMenuData[0]);

            // エラー発生
            if (!$duplicateDspConfig) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // ➁-3 入力画面構成地点マスタの登録 m_input_dsp_point
            $duplicateDspPoint = $this->Mng050Dao->duplicateDspPoint($setDspNo, $getInputMenuData[0]->input_dsp_no);

            // エラー発生
            if (!$duplicateDspPoint) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // ➁-4 入力画面構成項目マスタの登録 m_input_dsp_item
            $duplicateDspItem = $this->Mng050Dao->duplicateDspItem($setDspNo, $getInputMenuData[0]->input_dsp_no);

            // エラー発生
            if (!$duplicateDspItem) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // ➁-5 入力マスクNマスタの登録 m_input_n_mask
            $duplicateInputMask = $this->Mng050Dao->duplicateInputMask($setDspNo, $getInputMenuData[0]->input_dsp_no);

            // エラー発生
            if (!$duplicateInputMask) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // ➁-7 入力画面メニューの登録 m_input_menu
            $duplicateInputMenu = $this->Mng050Dao->duplicateInputMenu($setDspNo, $getInputMenuData[0], $setMaxOrder);

            // エラー発生
            if (!$duplicateInputMenu) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }


            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 入力画面を登録
     * 
     */
    public function saveInputMenuDsp($request)
    {
        DB::beginTransaction();
        try {
            // 新規登録
            if ($request->process_name == "dsp_add") {
                // 登録されている順序の最大値 + 10の値を取得する。
                $getMaxOrder = $this->Mng050Dao->getInputMenuMaxOrder();
                $setMaxOrder = intval($getMaxOrder[0]->max) + 10;

                // 選択された親メニューの階層を取得する。
                $getCurHierarchy = $this->Mng050Dao->getInputMenuHierarchy($request->input_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->input_hierarchy) + 1;

                // 参照画面が選択されている場合、選択した参照画面から入力画面構成マスタを取得する。
                if ($request->input_ref_menu) {
                    $getRefInputMenu = $this->Mng050Dao->getInputMenuReference($request->input_ref_menu);
                    $setRefInputMenu = $getRefInputMenu[0]->input_dsp_no;
                } else {
                    // 選択されていない場合、入力画面番号を入力画面構成マスタシーケンスから取得する。
                    $getRefInputMenu = $this->Mng050Dao->getInputMenuReferenceNextVal();
                    $setRefInputMenu = $getRefInputMenu[0]->input_dsp_no_seq;

                    // 入力画面メニュー登録処理 m_input_dsp_config
                    // ※ 取得した入力番号がシーケンスから取得されている場合
                    $saveNewDspConfig = $this->Mng050Dao->saveNewDspConfig($setRefInputMenu, $request->input_title);

                    // エラー発生
                    if (!$saveNewDspConfig) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }

                // 入力画面メニュー登録処理 m_input_menu
                $saveNewInputMenu = $this->Mng050Dao->saveNewInputMenu($request->input_parent_menu_no, $request->affiliation_section_no, $setRefInputMenu, $setCurHierarchy, $request->input_title, $setMaxOrder);

                // エラー発生
                if (!$saveNewInputMenu) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            } else if ($request->process_name == "dsp_edit") {
                // 更新

                // 排他チェック_入力画面メニュー  
                $haitaInputMenuData = $this->Mng050Dao->haitaInputMenuData($request->input_menu_no, $request->display_time);
                if (!$haitaInputMenuData) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // 排他チェック_入力画面構成マスタ        
                $haitaInputMenuDspData = $this->Mng050Dao->haitaInputMenuDspData($request->input_ref_menu, $request->display_time);
                if (!$haitaInputMenuDspData) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // 選択された親メニューの階層を取得する。 ※ 親ラベル編集した時、階層を更新
                $getCurHierarchy = $this->Mng050Dao->getInputMenuHierarchy($request->input_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->input_hierarchy) + 1;

                // 更新処理
                $saveUpdateMenuLabel = $this->Mng050Dao->saveUpdateInputMenu($request->input_menu_no, $request->input_parent_menu_no, $request->affiliation_section_no, $request->input_ref_menu, $setCurHierarchy, $request->input_title);

                // エラー発生
                if (!$saveUpdateMenuLabel) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }


    /**
     * メニューラベルを登録
     * 
     */
    public function saveMenuLabel($request)
    {
        DB::beginTransaction();
        try {
            // 新規登録
            if ($request->process_name == "menu_add") {
                // 登録されている順序の最大値 + 10の値を取得する。
                $getMaxOrder = $this->Mng050Dao->getInputMenuMaxOrder();
                $setMaxOrder = intval($getMaxOrder[0]->max) + 10;

                // 選択された親メニューの階層を取得する。
                $getCurHierarchy = $this->Mng050Dao->getInputMenuHierarchy($request->input_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->input_hierarchy) + 1;

                // 新規登録処理
                $saveNewMenuLabel = $this->Mng050Dao->saveNewMenuLabel($request->input_parent_menu_no, $request->affiliation_section_no, $setCurHierarchy, $request->input_title, $setMaxOrder);

                // エラー発生
                if (!$saveNewMenuLabel) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            } else if ($request->process_name == "menu_edit") {
                // 更新

                // 排他チェック                
                $haitaInputMenuData = $this->Mng050Dao->haitaInputMenuData($request->input_menu_no, $request->display_time);
                if (!$haitaInputMenuData) {
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // 選択された親メニューの階層を取得する。 ※ 親ラベル編集した時、階層を更新
                $getCurHierarchy = $this->Mng050Dao->getInputMenuHierarchy($request->input_parent_menu_no);
                $setCurHierarchy = intval($getCurHierarchy[0]->input_hierarchy) + 1;

                // 更新処理
                $saveUpdateMenuLabel = $this->Mng050Dao->saveUpdateInputMenu($request->input_menu_no, $request->input_parent_menu_no, $request->affiliation_section_no, null, $setCurHierarchy, $request->input_title);

                // エラー発生
                if (!$saveUpdateMenuLabel) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * メニューの順序を取替
     * 
     */
    public function exchangeMenuOrder($request)
    {
        DB::beginTransaction();
        try {
            // 順序取替

            // 排他チェック                
            $haitaCurInputMenuData = $this->Mng050Dao->haitaInputMenuData($request->cur_menu_no, $request->display_time);
            if (!$haitaCurInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            $haitaTargetInputMenuData = $this->Mng050Dao->haitaInputMenuData($request->target_menu_no, $request->display_time);
            if (!$haitaTargetInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 移動対象の順序更新
            $saveUpdateCurMenuLabelOrder = $this->Mng050Dao->exchangeMenuOrder($request->cur_menu_no, $haitaTargetInputMenuData[0]->input_order);

            // エラー発生
            if (!$saveUpdateCurMenuLabelOrder) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            // 移動先の順序更新
            $saveUpdateTargetMenuLabelOrder = $this->Mng050Dao->exchangeMenuOrder($request->target_menu_no, $haitaCurInputMenuData[0]->input_order);

            // エラー発生
            if (!$saveUpdateTargetMenuLabelOrder) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * メニュー削除処理
     * 
     */
    public function deleteInputMenu($request)
    {
        DB::beginTransaction();
        try {
            // 排他チェック                
            $haitaCurInputMenuData = $this->Mng050Dao->haitaInputMenuData($request->input_menu_no, $request->display_time);
            if (!$haitaCurInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 
            $set_input_dsp_no = ($haitaCurInputMenuData[0]->input_dsp_no) ? $haitaCurInputMenuData[0]->input_dsp_no : null;

            // if ($set_input_dsp_no) {
            //     // ➄-1 排他制御 入力画面構成マスタ              
            //     $haitaInputMenuDspData = $this->Mng050Dao->haitaInputMenuDspData($set_input_dsp_no, $request->display_time);
            //     if (!$haitaInputMenuDspData) {
            //         return config('const.UPDATE_UPDATED_ERROR');
            //     }

            //     // ➄-2 排他制御 入力画面構成地点マスタ               
            //     $haitaInputDspPointData = $this->Mng050Dao->haitaInputDspPointData($set_input_dsp_no, $request->display_time);
            //     if ($haitaInputDspPointData) {
            //         if ($haitaInputDspPointData[0]->lastes_update_date > $request->display_time) {
            //             return config('const.UPDATE_UPDATED_ERROR');
            //         }
            //     }

            //     // ➄-3 排他制御 入力画面構成項目マスタ            
            //     $haitaInputDspItemData = $this->Mng050Dao->haitaInputDspItemData($set_input_dsp_no, $request->display_time);
            //     if ($haitaInputDspItemData) {
            //         if ($haitaInputDspItemData[0]->lastes_update_date > $request->display_time) {
            //             return config('const.UPDATE_UPDATED_ERROR');
            //         }
            //     }

            //     // ➄-4 排他制御 入力マスクNマスタ              
            //     $haitaInputDspMaskData = $this->Mng050Dao->haitaInputDspMaskData($set_input_dsp_no, $request->display_time);
            //     if ($haitaInputDspMaskData) {
            //         if ($haitaInputDspMaskData[0]->lastes_update_date > $request->display_time) {
            //             return config('const.UPDATE_UPDATED_ERROR');
            //         }
            //     }
            // }

            // 移動先の順序更新
            $deleteInputMenu = $this->Mng050Dao->deleteInputMenu($request->input_menu_no, $set_input_dsp_no);

            // エラー発生
            if (!$deleteInputMenu) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            DB::commit();

            return config('const.DELETE_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 検査情報の地点を取得
     * 
     */
    public function fetchInputPoints($request)
    {
        $fetchInputPoints = $this->Mng050Dao->fetchInputPoints($request);

        return $fetchInputPoints;
    }

    /**
     * 検査情報の項目を取得
     * 
     */
    public function fetchInputItems($request)
    {
        $fetchInputItems = $this->Mng050Dao->fetchInputItems($request);

        return $fetchInputItems;
    }

    /**
     * 検査情報の項目を取得_初期化項目[1,2]
     * 
     */
    public function fetchInputInitItems($request)
    {
        $fetchInputInitItems = $this->Mng050Dao->fetchInputInitItems($request);

        return $fetchInputInitItems;
    }

    /**
     * 検査情報の入力マスクデータを取得
     * 
     */
    public function fetchInputMask($request, $item_filters, $point_filters)
    {
        $fetchInputMask = $this->Mng050Dao->fetchInputMask($request, $item_filters, $point_filters);

        return $fetchInputMask;
    }

    /**
     * 採水地点マスタデータを取得
     * 
     */
    public function fetchSelectionPoint()
    {
        $fetchSelectionPoint = $this->Mng050Dao->fetchSelectionPoint();

        return $fetchSelectionPoint;
    }

    /**
     * 検索項目マスタを取得
     * 
     */
    public function searchInspItem($request)
    {
        $searchInspItem = $this->Mng050Dao->searchInspItem($request);

        return $searchInspItem;
    }

    /**
     * 入力画面構成登録処理
     * ※ 手順番号は「詳細設計書_MNG050_入力画面設定画面」通りに設定
     * 
     */
    public function saveDspConfigData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $data_to_save = json_decode(json_encode($request->data_to_save));   // リクエスト
            $dsp_config_data = $data_to_save->dsp_config_data;                  // 構成マスタデータ
            $dsp_point_data = $data_to_save->dsp_point_data;                    // 地点マスタデータ
            $dsp_item_data = $data_to_save->dsp_item_data;                      // 項目マスタデータ
            $dsp_mask_data = $data_to_save->dsp_mask_data;                      // Nマスクマスタデータ

            // ##### 入力画面構成マスタ処理 #####
            // (7)-1 排他制御 入力画面構成マスタ
            $checkDspConfigDataBefore = $this->Mng050Dao->checkDspConfigDataBefore($dsp_config_data);
            if (count((array) $checkDspConfigDataBefore) > 0) {
                if ($checkDspConfigDataBefore[0]->update_date > $request->display_time) {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }
            } else {
                // 排他エラー
                DB::rollback();
                return config('const.UPDATE_NO_DATA_ERROR');
            }

            // (7)-2 入力画面構成マスタ更新処理
            $updateDspConfigData = $this->Mng050Dao->updateDspConfigData($dsp_config_data);

            // エラー発生
            if (!$updateDspConfigData) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            } else if (!is_bool($updateDspConfigData) && $updateDspConfigData == config('const.UPDATE_UPDATED_MASTER_ERROR')) {
                DB::rollback();
                return config('const.UPDATE_UPDATED_MASTER_ERROR');
            }


            // ##### 入力画面構成地点マスタ処理 #####
            // (7)-3 排他制御 入力画面構成地点マスタ
            if (count((array) $dsp_point_data) > 0) {
                $checkDspPointDataBefore = $this->Mng050Dao->checkDspPointDataBefore($dsp_config_data);
                if (count((array) $checkDspPointDataBefore) > 0) {
                    if ($checkDspPointDataBefore[0]->update_date > $request->display_time) {
                        // 排他エラー
                        DB::rollback();
                        return config('const.UPDATE_UPDATED_ERROR');
                    }

                    // (7)-4 入力画面構成地点マスタ削除処理
                    $deleteDspPointData = $this->Mng050Dao->deleteDspPointData($dsp_config_data);

                    // エラー発生
                    if (!$deleteDspPointData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }

                foreach ($dsp_point_data as $key => $value) {
                    // (7)-5 入力画面構成地点マスタ登録処理
                    $insertDspPointData = $this->Mng050Dao->insertDspPointData($value);

                    // エラー発生
                    if (!$insertDspPointData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    } else if (!is_bool($insertDspPointData) && $insertDspPointData == config('const.UPDATE_UPDATED_MASTER_ERROR')) {
                        DB::rollback();
                        return config('const.UPDATE_UPDATED_MASTER_ERROR');
                    }
                }
            }



            // ##### 入力画面構成項目マスタ #####
            // (7)-6 排他制御 入力画面構成項目マスタ
            if (count((array) $dsp_item_data) > 0) {
                $checkDspItemDataBefore = $this->Mng050Dao->checkDspItemDataBefore($dsp_config_data);
                if (count((array) $checkDspItemDataBefore) > 0) {
                    if ($checkDspItemDataBefore[0]->update_date > $request->display_time) {
                        // 排他エラー
                        DB::rollback();
                        return config('const.UPDATE_UPDATED_ERROR');
                    }

                    // (7)-7 入力画面構成項目マスタ削除処理
                    $deleteDspItemData = $this->Mng050Dao->deleteDspItemData($dsp_config_data);

                    // エラー発生
                    if (!$deleteDspItemData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }

                foreach ($dsp_item_data as $key => $value) {
                    // (7)-8 入力画面構成項目マスタ登録処理
                    $insertDspItemData = $this->Mng050Dao->insertDspItemData($value);

                    // エラー発生
                    if (!$insertDspItemData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    } else if (!is_bool($insertDspItemData) && $insertDspItemData == config('const.UPDATE_UPDATED_MASTER_ERROR')) {
                        DB::rollback();
                        return config('const.UPDATE_UPDATED_MASTER_ERROR');
                    }
                }
            }


            // ##### 入力マスクNマスタ #####
            // (7)-9 排他制御 入力マスクNマスタ
            if (count((array) $dsp_mask_data) > 0) {
                $checkDspMaskDataBefore = $this->Mng050Dao->checkDspMaskDataBefore($dsp_config_data);
                if (count((array) $checkDspMaskDataBefore) > 0) {
                    if ($checkDspMaskDataBefore[0]->update_date > $request->display_time) {
                        // 排他エラー
                        DB::rollback();
                        return config('const.UPDATE_UPDATED_ERROR');
                    }

                    // (7)-10 入力マスクNマスタ削除処理
                    $deleteDspMaskData = $this->Mng050Dao->deleteDspMaskData($dsp_config_data);

                    // エラー発生
                    if (!$deleteDspMaskData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }

                foreach ($dsp_mask_data as $key => $value) {
                    // (7)-11 入力マスクNマスタ登録処理
                    $insertDspMaskData = $this->Mng050Dao->insertDspMaskData($value);

                    // エラー発生
                    if (!$insertDspMaskData) {
                        DB::rollback();
                        return config('const.OTHER_ERROR');
                    }
                }
            }

            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 入力画面構成取消処理
     * ※ 手順番号は「詳細設計書_MNG050_入力画面設定画面」通りに設定
     * 
     */
    public function discardDspConfigData($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $data_to_discard = json_decode(json_encode($request->data_to_discard));     // リクエスト
            $dsp_config_data = $data_to_discard->dsp_config_data;                       // 構成マスタデータ

            // ##### 入力画面メニュー削除処理 #####
            // (6)-5 排他制御 入力画面メニューを実施する。
            $checkInputMenuDataBefore = $this->Mng050Dao->checkInputMenuDataBefore($dsp_config_data);
            if (count((array) $checkInputMenuDataBefore) > 0) {
                if ($checkInputMenuDataBefore[0]->update_date > $request->display_time) {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (5)-6 削除処理
                $deleteInputMenuData = $this->Mng050Dao->deleteInputMenuData($dsp_config_data);

                // エラー発生
                if (!$deleteInputMenuData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            // ##### 入力画面構成マスタ削除処理 #####
            // (6)-1 排他制御 入力画面構成マスタを実施する。
            $checkDspConfigDataBefore = $this->Mng050Dao->checkDspConfigDataBefore($dsp_config_data);
            if (count((array) $checkDspConfigDataBefore) > 0) {
                if ($checkDspConfigDataBefore[0]->update_date > $request->display_time) {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (5)-6 削除処理
                $deleteDspConfigData = $this->Mng050Dao->deleteDspConfigData($dsp_config_data);

                // エラー発生
                if (!$deleteDspConfigData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            // ##### 入力画面構成地点マスタ削除処理 #####
            // (6)-2 排他制御 入力画面構成地点マスタを実施する。
            $checkDspPointDataBefore = $this->Mng050Dao->checkDspPointDataBefore($dsp_config_data);
            if (count((array) $checkDspPointDataBefore) > 0) {
                if ($checkDspPointDataBefore[0]->update_date > $request->display_time) {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (5)-6 削除処理
                $deleteDspPointData = $this->Mng050Dao->deleteDspPointData($dsp_config_data);

                // エラー発生
                if (!$deleteDspPointData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            // ##### 入力画面構成項目マスタ削除処理 #####
            // (6)-3 排他制御 入力画面構成項目マスタを実施する。
            $checkDspItemDataBefore = $this->Mng050Dao->checkDspItemDataBefore($dsp_config_data);
            if (count((array) $checkDspItemDataBefore) > 0) {
                if ($checkDspItemDataBefore[0]->update_date > $request->display_time) {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (5)-6 削除処理
                $deleteDspItemData = $this->Mng050Dao->deleteDspItemData($dsp_config_data);

                // エラー発生
                if (!$deleteDspItemData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            // ##### 入力マスクNマスタ削除処理 #####
            // (6)-4 排他制御 入力マスクNマスタを実施する。
            $checkDspMaskDataBefore = $this->Mng050Dao->checkDspMaskDataBefore($dsp_config_data);
            if (count((array) $checkDspMaskDataBefore) > 0) {
                if ($checkDspMaskDataBefore[0]->update_date > $request->display_time) {
                    // 排他エラー
                    DB::rollback();
                    return config('const.UPDATE_UPDATED_ERROR');
                }

                // (5)-6 削除処理
                $deleteDspMaskData = $this->Mng050Dao->deleteDspMaskData($dsp_config_data);

                // エラー発生
                if (!$deleteDspMaskData) {
                    DB::rollback();
                    return config('const.OTHER_ERROR');
                }
            }


            DB::commit();

            return config('const.INSERT_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }

    /**
     * 入力画面構成取消処理
     * ※ 入力画面メニューのみ削除
     * 
     */
    public function discardInputMenu($request)
    {
        DB::beginTransaction();
        try {
            // 引数取得
            $data_to_discard = json_decode(json_encode($request->data_to_discard));     // リクエスト
            $dsp_config_data = $data_to_discard->dsp_config_data;                       // 構成マスタデータ
            
            // 排他チェック                
            $haitaCurInputMenuData = $this->Mng050Dao->haitaInputMenuData($dsp_config_data->input_menu_no, $request->display_time);
            if (!$haitaCurInputMenuData) {
                return config('const.UPDATE_UPDATED_ERROR');
            }

            // 入力画面情報の画面番号
            $set_input_dsp_no = ($haitaCurInputMenuData[0]->input_dsp_no) ? $haitaCurInputMenuData[0]->input_dsp_no : null;

            // 移動先の順序更新
            $deleteInputMenu = $this->Mng050Dao->deleteInputMenu($dsp_config_data->input_menu_no, $set_input_dsp_no);

            // エラー発生
            if (!$deleteInputMenu) {
                DB::rollback();
                return config('const.OTHER_ERROR');
            }

            DB::commit();

            return config('const.DELETE_NO_ERROR');
        } catch (\Exception $e) {
            DB::rollback();
            Log::error($e->getMessage());
            Log::error($e->getTraceAsString());

            return config('const.OTHER_ERROR');
        }
    }
}
