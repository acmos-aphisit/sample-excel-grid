<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CommonController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Cmn020Controller;
use App\Http\Controllers\Wqm010Controller;
use App\Http\Controllers\Wqm020Controller;
use App\Http\Controllers\Wqm030Controller;
use App\Http\Controllers\Spt010Controller;
use App\Http\Controllers\Spt030Controller;
use App\Http\Controllers\Mng010Controller;
use App\Http\Controllers\Mng020Controller;
use App\Http\Controllers\Mng030Controller;
use App\Http\Controllers\Mng040Controller;
use App\Http\Controllers\Mng050Controller;
use App\Http\Controllers\Mng060Controller;
use App\Http\Controllers\Report3SigmaController;

// トップ
Route::post('/common/migrateCsvToDb', [CommonController::class, 'migrateCsvToDb'])->name('migrateCsvToDb');

// 認証情報ルータ
// Route::post('/login', [LoginController::class, 'login'])->name('login');
// Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::post('/login', [LoginController::class, 'login'])->name('login');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

// 認証必須ルータ
// Route::middleware(['web'])->get('/loginCheck', [LoginController::class, 'loginCheck'])->name('loginCheck');
// Route::group(['middleware' => ['auth:sanctum', 'request.logging']], function () {
//     Route::get('/loginCheck', [LoginController::class, 'loginCheck'])->name('loginCheck');
// });

//Route::get('/loginCheck', [LoginController::class, 'loginCheck'])->name('loginCheck');

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/loginCheck', [LoginController::class, 'loginCheck'])->name('loginCheck');

    // 共通処理
    Route::post('/checkSideMenuInputOrReport', [CommonController::class, 'checkSideMenuInputOrReport'])->name('checkSideMenuInputOrReport');
    Route::get('/getInputMenu', [CommonController::class, 'getInputMenu'])->name('getInputMenu');
    Route::post('/getReportMenu', [CommonController::class, 'getReportMenu'])->name('getReportMenu');
    Route::get('/getMenuLabelSelection', [CommonController::class, 'getMenuLabelSelection'])->name('getMenuLabelSelection');
    Route::get('/getItemSettingSelection', [CommonController::class, 'getItemSettingSelection'])->name('getItemSettingSelection');
    Route::get('/getSaisuiPointSelection', [CommonController::class, 'getSaisuiPointSelection'])->name('getSaisuiPointSelection');

    // お知らせ
    Route::post('/CMN020/fetchInfoData', [Cmn020Controller::class, 'fetchInfoData'])->name('fetchInfoData');

    // 検査情報登録
    Route::post('/WQM010/fetchPointItemData', [Wqm010Controller::class, 'fetchPointItemData'])->name('fetchPointItemData');
    Route::post('/WQM010/fetchInputData', [Wqm010Controller::class, 'fetchInputData'])->name('fetchInputData');
    Route::post('/WQM010/fetchDataExistDate', [Wqm010Controller::class, 'fetchDataExistDate'])->name('fetchDataExistDate');
    Route::post('/WQM010/saveInputData', [Wqm010Controller::class, 'saveInputData'])->name('saveInputData');
    Route::post('/WQM010/getTrendData', [Wqm010Controller::class, 'getTrendData'])->name('getTrendData');
    Route::post('/WQM010/exportTrend', [Wqm010Controller::class, 'exportTrend'])->name('exportTrend');
    Route::post('/WQM010/exportImportTemplate', [Wqm010Controller::class, 'exportImportTemplate'])->name('exportImportTemplate');
    Route::post('/WQM010/fileImport', [Wqm010Controller::class, 'fileImport'])->name('fileImport');
    Route::post('/WQM010/manageInputFixedDate', [Wqm010Controller::class, 'manageInputFixedDate'])->name('manageInputFixedDate');

    Route::post('/getSelectedDspInfo', [CommonController::class, 'getSelectedDspInfo'])->name('getSelectedDspInfo');
    Route::post('/getPointInfo', [CommonController::class, 'getPointInfo'])->name('getPointInfo');

    // 検索画面
    Route::post('/WQM020/index', [Wqm020Controller::class, 'index'])->name('index');
    Route::post('/WQM020/getPointAndProcess', [Wqm020Controller::class, 'getPointAndProcess'])->name('getPointAndProcess');
    Route::post('/WQM020/getSaisuiPoint', [Wqm020Controller::class, 'getSaisuiPoint'])->name('getSaisuiPoint');
    Route::post('/WQM020/getItem', [Wqm020Controller::class, 'getItem'])->name('getItem');
    Route::post('/WQM020/search', [Wqm020Controller::class, 'search'])->name('search');
    Route::post('/WQM020/exportSearchData', [Wqm020Controller::class, 'exportSearchData'])->name('exportSearchData');
    Route::post('/WQM020/getTrendData', [Wqm020Controller::class, 'getTrendData'])->name('getTrendData');
    Route::post('/WQM020/exportTrend', [Wqm020Controller::class, 'exportTrend'])->name('exportTrend');

    // 報告書出力
    Route::post('/WQM030/getDspOutputList', [Wqm030Controller::class, 'getDspOutputList'])->name('getDspOutputList');

    // お知らせ管理
    Route::post('/SPT010/searchOshiraseData', [Spt010Controller::class, 'searchOshiraseData'])->name('searchOshiraseData');
    Route::post('/SPT010/saveOshiraseData', [Spt010Controller::class, 'saveOshiraseData'])->name('saveOshiraseData');

    // 運用メモ
    Route::post('/SPT030/searchUnyouMemoData', [Spt030Controller::class, 'searchUnyouMemoData'])->name('searchUnyouMemoData');
    Route::post('/SPT030/saveUnyouMemoData', [Spt030Controller::class, 'saveUnyouMemoData'])->name('saveUnyouMemoData');

    // ユーザマスタ
    Route::post('/MNG010/fetchUserData', [Mng010Controller::class, 'fetchUserData'])->name('fetchUserData');
    Route::post('/MNG010/saveUserMasterData', [Mng010Controller::class, 'saveUserMasterData'])->name('saveUserMasterData');

    // 採水地点設定画面
    Route::post('/MNG020/searchSaisuiPoint', [Mng020Controller::class, 'searchSaisuiPoint'])->name('searchSaisuiPoint');
    Route::post('/MNG020/saveSaisuiPointData', [Mng020Controller::class, 'saveSaisuiPointData'])->name('saveSaisuiPointData');

    // 検査項目
    Route::post('/MNG030/fetchInspItemData', [Mng030Controller::class, 'fetchInspItemData'])->name('fetchInspItemData');
    Route::post('/MNG030/saveInspItemData', [Mng030Controller::class, 'saveInspItemData'])->name('saveInspItemData');
    Route::post('/MNG030/searchSelectOptionData', [Mng030Controller::class, 'searchSelectOptionData'])->name('searchSelectOptionData');
    Route::post('/MNG030/saveSelectionOptionData', [Mng030Controller::class, 'saveSelectionOptionData'])->name('saveSelectionOptionData');

    // 検査基準
    Route::post('/MNG040/fetchInspCriteriaData', [Mng040Controller::class, 'fetchInspCriteriaData'])->name('fetchInspCriteriaData');
    Route::get('/MNG040/fetchInspCriteriaHoukijyunList', [Mng040Controller::class, 'fetchInspCriteriaHoukijyunList'])->name('fetchInspCriteriaHoukijyunList');
    Route::post('/MNG040/addNextYearInspCriteria', [Mng040Controller::class, 'addNextYearInspCriteria'])->name('addNextYearInspCriteria');
    Route::post('/MNG040/saveInspCriteriaData', [Mng040Controller::class, 'saveInspCriteriaData'])->name('saveInspCriteriaData');

    // 入力画面設定
    Route::post('/MNG050/getSelectedMenu', [Mng050Controller::class, 'getSelectedMenu'])->name('getSelectedMenu');
    Route::post('/MNG050/duplicateInputMenuDsp', [Mng050Controller::class, 'duplicateInputMenuDsp'])->name('duplicateInputMenuDsp');
    Route::post('/MNG050/saveInputMenuDsp', [Mng050Controller::class, 'saveInputMenuDsp'])->name('saveInputMenuDsp');
    Route::post('/MNG050/saveMenuLabel', [Mng050Controller::class, 'saveMenuLabel'])->name('saveMenuLabel');
    Route::post('/MNG050/exchangeMenuOrder', [Mng050Controller::class, 'exchangeMenuOrder'])->name('exchangeMenuOrder');
    Route::post('/MNG050/deleteInputMenu', [Mng050Controller::class, 'deleteInputMenu'])->name('deleteInputMenu');
    Route::post('/MNG050/searchInspItem', [Mng050Controller::class, 'searchInspItem'])->name('searchInspItem');
    Route::post('/MNG050/saveDspConfigData', [Mng050Controller::class, 'saveDspConfigData'])->name('saveDspConfigData');
    Route::post('/MNG050/discardDspConfigData', [Mng050Controller::class, 'discardDspConfigData'])->name('discardDspConfigData');

    // 報告書設定
    Route::post('/MNG060/index', [Mng060Controller::class, 'index'])->name('index');
    Route::post('/MNG060/duplicateInputMenuRpt', [Mng060Controller::class, 'duplicateInputMenuRpt'])->name('duplicateInputMenuRpt');
    Route::post('/MNG060/saveMenuLabel', [Mng060Controller::class, 'saveMenuLabel'])->name('saveMenuLabel');
    Route::post('/MNG060/exchangeMenuOrder', [Mng060Controller::class, 'exchangeMenuOrder'])->name('exchangeMenuOrder');
    Route::post('/MNG060/deleteReportMenu', [Mng060Controller::class, 'deleteReportMenu'])->name('deleteReportMenu');
    Route::post('/MNG060/getReportMenu', [Mng060Controller::class, 'getReportMenu'])->name('getReportMenu');
    Route::post('/MNG060/getRptConfig', [Mng060Controller::class, 'getRptConfig'])->name('getRptConfig');
    Route::post('/MNG060/regist', [Mng060Controller::class, 'regist'])->name('regist');
    Route::post('/MNG060/deleteReport', [Mng060Controller::class, 'deleteReport'])->name('deleteReport');
    Route::post('/MNG060/exportImportTemplate', [Mng060Controller::class, 'exportImportTemplate'])->name('exportImportTemplate');
    Route::post('/MNG060/saveInputMenuRpt', [Mng060Controller::class, 'saveInputMenuRpt'])->name('saveInputMenuRpt');
    Route::post('/MNG060/fileImport', [Mng060Controller::class, 'fileImport'])->name('fileImport');

    // 動画マニュアル
    Route::get('/fetchManualVideoList', [CommonController::class, 'fetchManualVideoList'])->name('fetchManualVideoList');

    // 報告書ダウンロード
    Route::post('/report/export', [ReportController::class, 'export'])->name('export');
    // 報告書(3σ関連)ダウンロード
    Route::post('/report/export3Sigma', [Report3SigmaController::class, 'export3Sigma'])->name('export3Sigma');
});
