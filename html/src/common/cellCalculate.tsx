// Jotaiストア
import { getDefaultStore } from "jotai";
const store = getDefaultStore();

//【共通】定数値
import * as Const from "./const";

//【ステート】共通ステート管理
import { destinationConst } from "../stores/atom";

// 日時管理ライブラリー
import moment from "moment";

/**
 * データ編集処理
 *
 * @param columnId                  列index
 * @param rowId                     行index
 * @param inputMenuNo               メニュー番号
 * @param dspNo                     入力画面番号
 * @param dspName                   入力画面名称
 * @param inspectionKbnCode         検査区分CD
 * @param itemNo                    項目番号
 * @param pointNo                   地点番号
 * @param itemDaiCategoryNo         項目大分類番号
 * @param itemTyuCategoryNo         項目中分類番号
 * @param bodyData                  データ[Object]
 * @param changedData               編集データ[Object]
 * @returns
 */
export const checkCalculateFunction = async (
  columnId: any,
  rowId: any,
  inputMenuNo: number,
  dspNo: number,
  dspName: string,
  inspectionKbnCode: number,
  itemNo: number,
  pointNo: number,
  itemDaiCategoryNo: number,
  itemTyuCategoryNo: number,
  bodyData: any,
  changedData: any
) => {
  // console.log("列index：", columnId);
  // console.log("行index：", rowId);
  // console.log("画面番号：", inputMenuNo);
  // console.log("画面名称：", dspName);
  // console.log("項目番号：", itemNo);
  // console.log("地点番号：", pointNo);
  // console.log("検査区分CD", inspectionKbnCode);
  // console.log("項目中分類番号", itemTyuCategoryNo);
  // console.log("データ", bodyData);
  // console.log("更新データ", changedData);

  // リターンデータ
  let returnAdjData: any = null;

  /**
   * 対応対象項目を確認
   * ※ 2025/12 対象可能な項目：総トリハロメタン、腐食性（ランゲリア指数）
   * ※ 総トリハロメタン：クロロホルム、ブロモジクロロメタン、ジブロモクロロメタン、ブロモホルム
   * ※ 腐食性（ランゲリア指数）：水温、ｐＨ値、総アルカリ度、蒸発残留物、カルシウム硬度
   *
   */
  const targetItem: number[] = [
    2210, 2230, 2270, 2280, 2380, 2450, 5010, 5160, 5200, 2, 1152, 1153, 1154, 1204
  ];
  if (!targetItem.includes(itemNo)) {
    return returnAdjData;
  }

  // 項目中分類番号が81：藍藻類、82：珪藻類、83：緑藻類
  if (
    itemTyuCategoryNo == Const.RANSOU_TYU_CATEGORY_NO ||
    itemTyuCategoryNo == Const.KEISOU_TYU_CATEGORY_NO ||
    itemTyuCategoryNo == Const.RYOKUSOU_TYU_CATEGORY_NO
  ) {
    returnAdjData = ItemSouRuiAutoInput(
      bodyData,
      columnId,
      pointNo,
      itemTyuCategoryNo
    );
  }

  // 1152：受付番号
  if (itemNo == 1152) {
    // １列目に入力、数字確認
    if (
      columnId === 0 &&
      changedData[0].newCell.text &&
      Number.isInteger(Number(changedData[0].newCell.text))
    ) {
      returnAdjData = Item1152AutoInput(
        Number(changedData[0].newCell.text),
        bodyData,
        dspNo,
        inspectionKbnCode
      );
    }
  }

  // 1153：受付年月日
  if (itemNo == 1153) {
    // １列目に入力確認
    if (
      columnId === 0 &&
      moment(changedData[0].newCell.date, "YYYY-MM-DD", true).isValid()
    ) {
      returnAdjData = Item1153AutoInput(changedData[0].newCell.date, bodyData);
    }
  }

  // 1154：結果書番号
  if (itemNo == 1154) {
    // １列目に入力、数字確認
    if (
      columnId === 0 &&
      changedData[0].newCell.text &&
      Number.isInteger(Number(changedData[0].newCell.text))
    ) {
      returnAdjData = Item1154AutoInput(
        Number(changedData[0].newCell.text),
        bodyData
      );
    }
  }

  // 1156：藻類備考
  if (itemNo == 1157) {
    // 1157:藻類備考のテンプレート
    returnAdjData = Item1156AutoInput(changedData, bodyData, columnId);
  }

  // 1204：<文書番号>
  if (itemNo == 1204 && columnId == 0) {
    returnAdjData = Item1204AutoInput(changedData, bodyData, columnId, rowId);
  }

  // 1274:硫酸注入率平均
  if ((itemNo == 1271 || itemNo == 1273) && (dspNo == 1101 || dspNo == 1385)) {
    const setItemSet: number = 1274;
    returnAdjData = Item1271AutoInput(columnId, bodyData, setItemSet);
  }

  // 2250：総トリハロメタン
  if (itemNo == 2210 || itemNo == 2230 || itemNo == 2270 || itemNo == 2280) {
    // 2210:クロロホルム、2230:ジブロモクロロメタン、2270:ブロモジクロロメタン、2280:ブロモホルム
    const setItemArr: number[] = [2210, 2230, 2270, 2280];
    const setExtMutiple: number[] = [1, 1, 1, 1];
    const setItemSet: number = 2250;
    returnAdjData = Item2250TotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 6010:トリハロメタン(生成能)
  if (itemNo == 2212 || itemNo == 2232 || itemNo == 2272 || itemNo == 2282) {
    // 2212:クロロホルム(生成能)、2232:ジブロモクロロメタン(生成能)、2272:ブロモジクロロメタン(生成能)、2282:ブロモホルム(生成能)
    const setItemArr: number[] = [2212, 2232, 2272, 2282];
    const setExtMutiple: number[] = [1, 1, 1, 1];
    const setItemSet: number = 6010;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7003:1,3-ジクロロプロペン（Ｄ-Ｄ）
  if (itemNo == 7113 || itemNo == 7114) {
    // 7113:シス-1,3－ジクロロプロペン、7114:トランス-1,3-ジクロロプロペン
    const setItemArr: number[] = [7113, 7114];
    const setExtMutiple: number[] = [1, 1];
    const setItemSet: number = 7003;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7015:ＥＰＮ
  if (itemNo == 7104 || itemNo == 7201) {
    // 7104:EPNオキソン、7201:EPN（検査値）
    const setItemArr: number[] = [7104, 7201];
    const setExtMutiple: number[] = [1.05, 1];
    const setItemSet: number = 7015;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7004:イソキサチオン
  if (itemNo == 7101 || itemNo == 7203) {
    // 7101:イソキサチオンオキソン、7203:イソキサチオン（検査値）
    const setItemArr: number[] = [7101, 7203];
    const setExtMutiple: number[] = [1.05, 1];
    const setItemSet: number = 7004;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7021:イソフェンホス
  if (itemNo == 7105 || itemNo == 7204) {
    // 7105:イソフェンホスオキソン、7204:イソフェンホス（検査値）
    const setItemArr: number[] = [7105, 7204];
    const setExtMutiple: number[] = [1.05, 1];
    const setItemSet: number = 7021;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7129:エンドスルファン（ベンゾエピン）
  if (itemNo == 7115 || itemNo == 7116 || itemNo == 7117) {
    // 7115:α－エンドスルファン（α－ベンゾエピン）、7116:β－エンドスルファン（β－ベンゾエピン）、7117:エンドスルフェート（ベンゾエピンスルフェート）
    const setItemArr: number[] = [7115, 7116, 7117];
    const setExtMutiple: number[] = [1, 1, 0.962];
    const setItemSet: number = 7129;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7071:グリホサート
  if (itemNo == 7200 || itemNo == 7112) {
    // 7200:グリホサート（検査値）、7112:アミノメチルリン酸（AMPA）
    const setItemArr: number[] = [7200, 7112];
    const setExtMutiple: number[] = [1, 1.52];
    const setItemSet: number = 7071;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7012:フェニトロチオン（ＭＥＰ）
  if (itemNo == 7013 || itemNo == 7025) {
    // 7013:ＣＮＰ-アミノ体、7025:クロルニトロフェン（検査値）
    const setItemArr: number[] = [7013, 7025];
    const setExtMutiple: number[] = [1.1, 1];
    const setItemSet: number = 7012;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7022:クロルピリホス
  if (itemNo == 7106 || itemNo == 7206) {
    // 7106:クロルピリホスオキソン、7206:クロルピリホス（検査値）
    const setItemArr: number[] = [7106, 7206];
    const setExtMutiple: number[] = [1.05, 1];
    const setItemSet: number = 7022;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7005:ダイアジノン
  if (itemNo == 7102 || itemNo == 7207) {
    // 7102:ダイアジノンオキソン、7207:ダイアジノン（検査値）
    const setItemArr: number[] = [7102, 7207];
    const setExtMutiple: number[] = [1.06, 1];
    const setItemSet: number = 7005;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7006:フェニトロチオン（ＭＥＰ）
  if (itemNo == 7156 || itemNo == 7208) {
    // 7156:フェニトロチオンオキソン（ＭＥＰオキソン）、7208:フェニトロチオン（検査値）
    const setItemArr: number[] = [7156, 7208];
    const setExtMutiple: number[] = [1.06, 1];
    const setItemSet: number = 7006;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7070:フェンチオン（ＭＰＰ）
  if (
    itemNo == 7118 ||
    itemNo == 7119 ||
    itemNo == 7120 ||
    itemNo == 7121 ||
    itemNo == 7122 ||
    itemNo == 7109
  ) {
    // 7118:フェンチオンスルホキシド、7119:フェンチオンスルホン、7120:フェンチオンオキソン、7121:フェンチオンオキソンスルホキシド、7122:フェンチオンオキソンスルホン、7209:フェンチオン（検査値）
    const setItemArr: number[] = [7118, 7119, 7120, 7121, 7122, 7109];
    const setExtMutiple: number[] = [0.946, 0.897, 1.06, 1.0, 0.946, 1];
    const setItemSet: number = 7070;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7040:ブタミホス
  if (itemNo == 7108 || itemNo == 7210) {
    // 7108:ブタミホスオキソン、7210:ブタミホス（検査値）
    const setItemArr: number[] = [7108, 7210];
    const setExtMutiple: number[] = [1.05, 1];
    const setItemSet: number = 7040;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7074:ベノミル
  if (itemNo == 7111) {
    // 7111:ベンツイミダゾールカルバメート（ＭＢＣ）
    const setItemArr: number[] = [7111];
    const setExtMutiple: number[] = [1.52];
    const setItemSet: number = 7074;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7056:メチダチオン（ＤＭＴＰ）
  if (itemNo == 7214 || itemNo == 7213) {
    // 7214:メチダチオンオキソン、7213:メチダチオン（検査値）
    const setItemArr: number[] = [7214, 7213];
    const setExtMutiple: number[] = [1.06, 1];
    const setItemSet: number = 7056;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 7132:オリサストロビン
  if (itemNo == 7215 || itemNo == 7216) {
    // 7215:(5Z)-オリサストロビン、7216:オリサストロビン（測定値）
    const setItemArr: number[] = [7215, 7216];
    const setExtMutiple: number[] = [1, 1];
    const setItemSet: number = 7132;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 8997：微小動物合計
  if (itemNo == 8994 || itemNo == 8995 || itemNo == 8996) {
    // 8994:線虫類、8995:輪虫類、8996:その他微小動物
    const setItemArr: number[] = [8994, 8995, 8996];
    const setExtMutiple: number[] = [1, 1, 1];
    const setItemSet: number = 8997;
    returnAdjData = ItemTotalAutoCalculation(
      columnId,
      bodyData,
      setItemArr,
      setExtMutiple,
      setItemSet
    );
  }

  // 3210:腐食性（ランゲリア指数）
  if (
    itemNo == 2380 ||
    itemNo == 2450 ||
    itemNo == 5010 ||
    itemNo == 5160 ||
    itemNo == 5200
  ) {
    const setItemSet: number = 3210;
    returnAdjData = Item3210AutoInput(columnId, bodyData, setItemSet);
  }

  // 3190:KMnO4消費量
  if (
    (itemNo == 3197 || itemNo == 3198 || itemNo == 3199) &&
    (dspNo == 1101 || dspNo == 1385)
  ) {
    const setItemSet: number = 3190;
    returnAdjData = Item3190AutoInput(columnId, bodyData, setItemSet);
  }

  // 2360:塩化物イオン
  if (
    (itemNo == 2361 || itemNo == 2362 || itemNo == 2363) &&
    (dspNo == 1101 || dspNo == 1385)
  ) {
    const setItemSet: number = 2360;
    returnAdjData = Item2360AutoInput(columnId, bodyData, setItemSet);
  }

  // 5080：COD
  if (
    (itemNo == 5081 || itemNo == 5082 || itemNo == 5083) &&
    (dspNo == 1101 || dspNo == 1385)
  ) {
    const setItemSet: number = 5080;
    returnAdjData = Item5080AutoInput(columnId, bodyData, setItemSet);
  }

  // 1101:(阿見浄水場（毎日検査）)
  if (dspNo == 1101 && pointNo == 148) {
    if (
      itemNo == 5010 ||
      itemNo == 2450 ||
      itemNo == 3190 ||
      itemNo == 2360 ||
      itemNo == 2470 ||
      itemNo == 3200 ||
      itemNo == 2480 ||
      itemNo == 5050 ||
      itemNo == 5160
    ) {
      const setUseData: any = (await returnAdjData)
        ? await returnAdjData
        : bodyData;
      returnAdjData = ItemDuplicateAutoInput(setUseData, columnId, itemNo);
    }
  }

  // 3140:農薬類（検出指標値） ※ 入力画面に”農薬"を含んでいる画面
  if (dspName.includes("農薬")) {
    const setUseData: any = (await returnAdjData)
      ? await returnAdjData
      : bodyData;
    returnAdjData = ItemNouyakuAllAutoInput(setUseData, columnId, itemNo);
  }

  // 1172:検査対象　※6000:農薬類検査 or 7200:霞ヶ浦水源農薬類のみ
  if (itemNo == 2 && (inspectionKbnCode == 6000 || inspectionKbnCode == 7200)) {
    returnAdjData = Item1172AutoInput(bodyData, dspName);
  }

  return returnAdjData;
};

/**
 * フォーカスが外れた場合の処理
 *
 * @param useSidemenuSelectedDate   処理実施日
 * @param columnId                  列index
 * @param rowId                     行index
 * @param inputMenuNo               メニュー番号
 * @param dspNo                     入力画面番号
 * @param dspName                   入力画面名称
 * @param itemNo                    項目番号
 * @param pointNo                   地点番号
 * @param processNo                 処理過程番号
 * @param bodyData                  データ[Object]
 * @returns
 */
export const checkOutOfFocusFunction = async (
  useSidemenuSelectedDate,
  columnId,
  rowId,
  inputMenuNo,
  dspNo,
  dspName,
  itemNo,
  pointNo,
  processNo,
  bodyData
) => {
  // console.log("処理実施日：", useSidemenuSelectedDate);
  // console.log("列index：", columnId);
  // console.log("行index：", rowId);
  // console.log("画面番号：", inputMenuNo);
  // console.log("項目番号：", itemNo);
  // console.log("地点番号：", pointNo);
  // console.log("データ", bodyData);

  // リターンデータ
  let returnAdjData: any = null;

  // 画面名に"共同検査"が含まれている画面
  const kyoudouKensa: string = "共同検査";
  if (dspName.includes(kyoudouKensa)) {
    returnAdjData = await DisplayJointInspectSetCell(
      useSidemenuSelectedDate,
      columnId,
      rowId,
      dspNo,
      pointNo,
      processNo,
      bodyData
    );
  }

  return returnAdjData;
};

/**
 * 藻類計算
 *
 * @param bodyData            データ[Object]
 * @param columnId            列index
 * @param pointNo             地点番号
 * @param itemTyuCategoryNo   項目中分類番号
 * @returns
 */
export const ItemSouRuiAutoInput = async (
  bodyData: any,
  columnId: number,
  pointNo: number,
  itemTyuCategoryNo: number
) => {
  // 除く配列
  const checkExcludeItems: number[] = [
    8090, 8105, 8170, 8172, 8174, 8520, 8900,
  ];

  // 藻類合計の対象項目
  const checkIncludeTotal: number[] = [8172, 8174, 8520, 8900];

  // 上書きの対象項目
  const setTargetItems: number[] =
    itemTyuCategoryNo == Const.RANSOU_TYU_CATEGORY_NO
      ? [8172, 8174] // 8172:藍藻類合計_1、8174:藍藻類合計_2
      : itemTyuCategoryNo == Const.KEISOU_TYU_CATEGORY_NO
      ? [8520] // 8520:珪藻類合計
      : [8900]; // 8900:緑藻類合計

  // 項目中分類番号を設定
  const setAllTyuCategory: number[] = [
    Const.RANSOU_TYU_CATEGORY_NO,
    Const.KEISOU_TYU_CATEGORY_NO,
    Const.RYOKUSOU_TYU_CATEGORY_NO,
  ];

  // 合計
  let totalCal: number = 0;
  let totalSouRui1: number = 0;
  let totalSouRui2: number = 0;

  // 入力値と項目名称 (最大)
  let maxCalData: number = 0;
  let maxCalDataName: string = "";

  // 除く配列
  // ※ 8090:Microcystis(cell)、8105:Microcystis(colony cell)、8160:その他藍藻類、8170:藍藻類合計、8172:藍藻類合計_1、8174:藍藻類合計_2、8510:その他珪藻類、8520:珪藻類合計、8890:その他緑藻類、8900:緑藻類合計、8988:藻類合計_1、8989:藻類合計_2、8990:藻類合計
  const checkExcludeInputItems: number[] = [
    8090, 8105, 8160, 8170, 8172, 8174, 8510, 8520, 8890, 8900, 8988, 8989,
    8990,
  ];

  // 合計計算
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (!checkExcludeItems.includes(item.itemNo)) {
      item.data.forEach((point, pointKey) => {
        if (
          point.pointNo === pointNo &&
          point.itemTyuCategoryNo == itemTyuCategoryNo
        ) {
          const setCalData: number = point.data ? Number(point.data) : 0;
          totalCal += setCalData;
        }

        // 最大のデータを設定
        if (
          point.pointNo === pointNo &&
          !checkExcludeInputItems.includes(item.itemNo) &&
          setAllTyuCategory.includes(Number(point.itemTyuCategoryNo))
        ) {
          const setCurCalData: number = point.data ? Number(point.data) : 0;
          if (setCurCalData > maxCalData) {
            maxCalData = setCurCalData;
            maxCalDataName = item.reportName;
          }
        }
      });
    }

    return item;
  });

  // 藻類合計計算
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (checkIncludeTotal.includes(item.itemNo)) {
      item.data.forEach((point, pointKey) => {
        if (point.pointNo === pointNo) {
          let useTotalCal: number = 0;
          switch (item.itemNo) {
            case 8172:
              useTotalCal =
                itemTyuCategoryNo == Const.RANSOU_TYU_CATEGORY_NO
                  ? totalCal
                  : point.data
                  ? Number(point.data)
                  : 0;
              totalSouRui1 += useTotalCal;
              break;
            case 8174:
              useTotalCal =
                itemTyuCategoryNo == Const.RANSOU_TYU_CATEGORY_NO
                  ? totalCal
                  : point.data
                  ? Number(point.data)
                  : 0;
              totalSouRui2 += useTotalCal;
              break;
            case 8520:
              useTotalCal =
                itemTyuCategoryNo == Const.KEISOU_TYU_CATEGORY_NO
                  ? totalCal
                  : point.data
                  ? Number(point.data)
                  : 0;
              totalSouRui1 += useTotalCal;
              totalSouRui2 += useTotalCal;
              break;
            case 8900:
              useTotalCal =
                itemTyuCategoryNo == Const.RYOKUSOU_TYU_CATEGORY_NO
                  ? totalCal
                  : point.data
                  ? Number(point.data)
                  : 0;
              totalSouRui1 += useTotalCal;
              totalSouRui2 += useTotalCal;
              break;

            default:
              break;
          }
        }
      });
    }

    return item;
  });

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    // 上書きの対象項目を確認
    if (setTargetItems.includes(item.itemNo)) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string =
              totalCal == 0
                ? ""
                : String(
                    processJisRoundingNumber(
                      totalCal,
                      null,
                      null,
                      innerItem.validDigits,
                      innerItem.inputMinDigits * -1
                    )
                  );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else if (item.itemNo == 8988 || item.itemNo == 8989) {
      const setTotalSouRui: number =
        item.itemNo == 8988 ? totalSouRui1 : totalSouRui2;

      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string =
              setTotalSouRui == 0
                ? ""
                : String(
                    processJisRoundingNumber(
                      setTotalSouRui,
                      null,
                      null,
                      innerItem.validDigits,
                      innerItem.inputMinDigits * -1
                    )
                  );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else if (item.itemNo == 9110) {
      // 9110:優占種名
      if (maxCalDataName !== "") {
        // コラム名を指定
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            // 対象のデータと活性データを判定
            if (innerIndex == columnId) {
              return {
                ...innerItem,
                data: maxCalDataName,
                handleEditData: true,
              };
            } else {
              return innerItem;
            }
          }),
        };
      } else {
        return item;
      }
    } else if (item.itemNo == 9111) {
      // 9111:優占種藻類数
      if (maxCalData !== 0) {
        // コラム名を指定
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            // 対象のデータと活性データを判定
            if (innerIndex == columnId) {
              return {
                ...innerItem,
                data: String(maxCalData),
                handleEditData: true,
              };
            } else {
              return innerItem;
            }
          }),
        };
      } else {
        return item;
      }
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 同じ値を自動で入力
 *
 * @param bodyData    データ[Object]
 * @param columnId    列index
 * @param itemNo      項目番号
 * @returns
 */
export const ItemDuplicateAutoInput = async (
  bodyData: any,
  columnId: number,
  itemNo: number
) => {
  let inputTimeArr: any = [];
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == 2) {
      item.data.forEach((timeItem) => {
        inputTimeArr.push(timeItem.data);
      });
    }

    if (item.itemNo === itemNo) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          if (innerItem.pointNo == 1200 && inputTimeArr[innerIndex]) {
            return {
              ...innerItem,
              data: String(item.data[columnId].data),
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 1152：受付番号
 *
 * @param inputData            入力データ
 * @param bodyData             データ[Object]
 * @param dspNo                入力画面番号
 * @param inspectionKbnCode    検査区分CD
 * @returns
 */
export const Item1152AutoInput = async (
  inputData: number,
  bodyData: any,
  dspNo: number,
  inspectionKbnCode: number
) => {
  const checkInspectionType: number[] = [12000, 12010, 12030, 12040];
  if (dspNo == 1416) {
    // 1416：共同検査（浄水）（阿見_河内町）
    if (checkInspectionType.includes(inspectionKbnCode)) {
      let setCurInput: number = inputData;
      let inputTimeArr: any = [];
      bodyData = [...Object.values(bodyData)].map((item: any, key) => {
        if (item.itemNo == 2) {
          item.data.forEach((timeItem) => {
            inputTimeArr.push(timeItem.data);
          });
        }

        if (item.itemNo === 1152) {
          // コラム名を指定
          return {
            ...item,
            data: item.data.map((innerItem: any, innerIndex: any) => {
              if (innerIndex !== 0 && inputTimeArr[innerIndex]) {
                setCurInput += 1;
                return {
                  ...innerItem,
                  data: String(setCurInput),
                  handleEditData: true,
                };
              } else {
                return innerItem;
              }
            }),
          };
        } else {
          return item;
        }
      });
    }

    return bodyData;
  } else {
    // 1416:共同検査（浄水）（阿見_河内町）以外
    const setCurInput: string = String(inputData);
    let inputTimeArr: any = [];
    bodyData = [...Object.values(bodyData)].map((item: any, key) => {
      if (item.itemNo == 2) {
        item.data.forEach((timeItem) => {
          inputTimeArr.push(timeItem.data);
        });
      }

      if (item.itemNo === 1152) {
        // コラム名を指定
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            if (innerIndex !== 0 && inputTimeArr[innerIndex]) {
              return {
                ...innerItem,
                data: setCurInput,
                handleEditData: true,
              };
            } else {
              return innerItem;
            }
          }),
        };
      } else {
        return item;
      }
    });

    return bodyData;
  }
};

/**
 * 1153：受付年月日
 *
 * @param inputData   入力データ
 * @param bodyData    データ[Object]
 * @returns
 */
export const Item1153AutoInput = async (inputData: any, bodyData: any) => {
  let inputTimeArr: any = [];
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == 2) {
      item.data.forEach((timeItem) => {
        inputTimeArr.push(timeItem.data);
      });
    }

    if (item.itemNo === 1153) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          if (innerIndex !== 0 && inputTimeArr[innerIndex]) {
            return {
              ...innerItem,
              data: inputData,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 1154：結果書番号
 *
 * @param inputData           入力データ
 * @param bodyData            データ[Object]
 * @param dspNo               画面番号
 * @param inspectionKbnCode   検査区分CD
 * @returns
 */
export const Item1154AutoInput = async (inputData: number, bodyData: any) => {
  let setCurInput: number = inputData;
  let inputTimeArr: any = [];
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == 2) {
      item.data.forEach((timeItem) => {
        inputTimeArr.push(timeItem.data);
      });
    }

    if (item.itemNo === 1154) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          if (innerIndex !== 0 && inputTimeArr[innerIndex]) {
            setCurInput += 1;
            return {
              ...innerItem,
              data: String(setCurInput),
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 1156：藻類備考
 *
 * @param changedData   編集データ[Object]
 * @param bodyData      データ[Object]
 * @param columnId      列index
 * @returns
 */
export const Item1156AutoInput = async (
  changedData: any,
  bodyData: any,
  columnId: number
) => {
  const patternNo: number = changedData[0].newCell.value;
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == 1156) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータ
          if (innerIndex == columnId) {
            return {
              ...innerItem,
              data: patternNo ? Const.SORUI_NOTES_PATTERN[patternNo] : "",
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * '1204：<文書番号>
 *
 * @param changedData   編集データ[Object]
 * @param bodyData      データ[Object]
 * @param columnId      列index
 * @param rowId         行index
 * @returns
 */
export const Item1204AutoInput = async (
  changedData: any,
  bodyData: any,
  columnId: number,
  rowId: number
) => {
  // 入力された文字列の中にハイフン(-)が存在するかつ、ハイフンの後の文字列が数値の場合
  const match = changedData[0].newCell.text.match(/[-ー](\d+)/);
  if (match) {
    let number: number = Number(match[1]);
    const parts = changedData[0].newCell.text.split(/[-ー]/);
    let inputTimeArr: any = [];
    bodyData = [...Object.values(bodyData)].map((item: any, key) => {
      if (item.itemNo == 2) {
        item.data.forEach((timeItem) => {
          inputTimeArr.push(timeItem.data);
        });
      }

      if (key === rowId) {
        // コラム名を指定
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            if (innerIndex !== columnId && inputTimeArr[innerIndex]) {
              number += 1;
              return { ...innerItem, data: parts[0] + "-" + number };
            } else {
              return innerItem;
            }
          }),
        };
      } else {
        return item;
      }
    });
  }

  return bodyData;
};

/**
 * 3210:腐食性（ランゲリア指数）
 * ※ 2025/12 使用開始
 *
 * @param columnId      列index
 * @param bodyData      データ[Object]
 * @param chkItemSet    合計を設定する対象項目
 * @returns
 */
export const Item3210AutoInput = async (
  columnId: number,
  bodyData: any,
  chkItemSet: number
) => {
  // 各入力データ
  let inputItem5010: number = 0;
  let inputItem2450: number = 0;
  let inputItem2380: number = 0;
  let inputItem5160: number = 0;
  let inputItem5210: number = 0;

  [...Object.values(bodyData)].forEach((item: any, key) => {
    if (item.itemNo == 5010) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        // 5010:水温
        inputItem5010 = Number(item.data[columnId].data);
      } else {
        return null;
      }
    } else if (item.itemNo == 2450) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        // 2450:ｐＨ値
        inputItem2450 = Number(item.data[columnId].data);
      } else {
        return null;
      }
    } else if (item.itemNo == 2380) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        // 2380:蒸発残留物
        inputItem2380 = Number(item.data[columnId].data);
      } else {
        return null;
      }
    } else if (item.itemNo == 5160) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        // 5160:総アルカリ度
        inputItem5160 = Number(item.data[columnId].data);
      } else {
        return null;
      }
    } else if (item.itemNo == 5200) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        // 5200:カルシウム硬度
        inputItem5210 = Number(item.data[columnId].data);
      } else {
        return null;
      }
    }
  });

  // 下記項目のいずれかの値が空または数値以外の場合は処理を行わない。
  if (
    inputItem5010 <= 0 ||
    inputItem2450 <= 0 ||
    inputItem2380 <= 0 ||
    inputItem5160 <= 0 ||
    inputItem5210 <= 0
  ) {
    return null;
  }

  // (1) 8.313
  const constCalPhs: number = 8.313;

  // (2) log(($カルシウム硬度 * 0.4004 / 20.05), 10)
  const calLogCaHardness: number = Math.log10((inputItem5210 * 0.4004) / 20.05);

  // (3) log($準アルカリ度 / 50, 10)
  const calLogSubAlkali: number = Math.log10(inputItem5160 / 50);

  // (4) 2.0 * sqrt(2.5E-5 * $蒸発物残留) / (1.0 + sqrt(2.5E-5 * $蒸発物残留))
  const calSqrtEvaResidue: number =
    (2.0 * Math.sqrt(2.5e-5 * inputItem2380)) /
    (1.0 + Math.sqrt(2.5e-5 * inputItem2380));

  // (5) 0.015 * ($水温 - 25)
  const calWaterTemp: number = 0.015 * (inputItem5010 - 25);

  // 結果計算 ※ $pH - ((1) - (2) - (3) + (4)) + (5)
  const calResultPhs: number =
    inputItem2450 -
    (constCalPhs - calLogCaHardness - calLogSubAlkali + calSqrtEvaResidue) +
    calWaterTemp;

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string = String(
              calResultPhs.toFixed(innerItem.inputMinDigits)
            );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 3190:KMnO4消費量
 *
 * @param columnId      列index
 * @param bodyData      データ[Object]
 * @param chkItemSet    合計を設定する対象項目
 * @returns
 */
export const Item3190AutoInput = async (
  columnId: number,
  bodyData: any,
  chkItemSet: number
) => {
  // 各入力データ
  let inputItem3197: number = 0;
  let inputItem3198: number = 0;
  let inputItem3199: number = 0;

  [...Object.values(bodyData)].forEach((item: any, key) => {
    if (item.itemNo == 3197) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem3197 = Number(item.data[columnId].data); // 3197:滴定値（有機物等）
      } else {
        return null;
      }
    } else if (item.itemNo == 3198) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem3198 = Number(item.data[columnId].data); // 3198:ファクター滴定値
      } else {
        return null;
      }
    } else if (item.itemNo == 3199) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem3199 = Number(item.data[columnId].data); // 3199:検水量
      } else {
        return null;
      }
    }
  });

  // 下記項目のいずれかの値が空または数値以外の場合は処理を行わない。
  if (inputItem3197 <= 0 || inputItem3198 <= 0 || inputItem3199 <= 0) {
    return null;
  }

  // 結果計算 ※ (((滴定値 + 10) * 10 / (5 + ファクター滴定値) - 10) * 1000 / 検水量) * 0.316
  const calResultKmno4: number =
    (((((inputItem3197 + 10) * 10) / (5 + inputItem3198) - 10) * 1000) /
      inputItem3199) *
    0.316;

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string = String(
              calResultKmno4.toFixed(innerItem.inputMinDigits)
            );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 2360:塩化物イオン
 *
 * @param columnId      列index
 * @param bodyData      データ[Object]
 * @param chkItemSet    合計を設定する対象項目
 * @returns
 */
export const Item2360AutoInput = async (
  columnId: number,
  bodyData: any,
  chkItemSet: number
) => {
  // 各入力データ
  let inputItem2361: number = 0;
  let inputItem2362: number = 0;
  let inputItem2363: number = 0;

  [...Object.values(bodyData)].forEach((item: any, key) => {
    if (item.itemNo == 2361) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem2361 = Number(item.data[columnId].data); // 2361:滴定値（塩化物イオン）
      } else {
        return null;
      }
    } else if (item.itemNo == 2362) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem2362 = Number(item.data[columnId].data); // 2362:空試験
      } else {
        return null;
      }
    } else if (item.itemNo == 2363) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem2363 = Number(item.data[columnId].data); // 2363:ファクター（塩化物イオン）
      } else {
        return null;
      }
    }
  });

  // 下記項目のいずれかの値が空または数値以外の場合は処理を行わない。
  if (inputItem2361 <= 0 || inputItem2362 <= 0 || inputItem2363 <= 0) {
    return null;
  }

  // 結果計算 ※ (滴定値 - ($空試験 - (5 / ファクター))) * ファクター * 3.55
  const calResultChlorideIon: number =
    (inputItem2361 - (inputItem2362 - 5 / inputItem2363)) *
    inputItem2363 *
    3.55;

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string = String(
              calResultChlorideIon.toFixed(innerItem.inputMinDigits)
            );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 5080：COD
 *
 * @param columnId      列index
 * @param bodyData      データ[Object]
 * @param chkItemSet    合計を設定する対象項目
 * @returns
 */
export const Item5080AutoInput = async (
  columnId: number,
  bodyData: any,
  chkItemSet: number
) => {
  // 各入力データ
  let inputItem5081: number = 0;
  let inputItem5082: number = 0;
  let inputItem5083: number = 0;

  [...Object.values(bodyData)].forEach((item: any, key) => {
    if (item.itemNo == 5081) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem5081 = Number(item.data[columnId].data); // 5081:滴定値（COD）
      } else {
        return null;
      }
    } else if (item.itemNo == 5082) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem5082 = Number(item.data[columnId].data); // 5082:空試験
      } else {
        return null;
      }
    } else if (item.itemNo == 2363) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem5083 = Number(item.data[columnId].data); // 5083:ファクター（COD）
      } else {
        return null;
      }
    }
  });

  // 下記項目のいずれかの値が空または数値以外の場合は処理を行わない。
  if (inputItem5081 <= 0 || inputItem5082 <= 0 || inputItem5083 <= 0) {
    return null;
  }

  // 結果計算 ※ (cod滴定値 - cod空試験) * codファクター * 2
  const calResultCod: number =
    (inputItem5081 - inputItem5082) * inputItem5083 * 2;

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string = String(
              calResultCod.toFixed(innerItem.inputMinDigits)
            );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 1274:硫酸注入率平均
 *
 * @param columnId      列index
 * @param bodyData      データ[Object]
 * @param chkItemSet    合計を設定する対象項目
 * @returns
 */
export const Item1271AutoInput = async (
  columnId: number,
  bodyData: any,
  chkItemSet: number
) => {
  // 各入力データ
  let inputItem1272: number = 0;
  let inputItem1273: number = 0;

  [...Object.values(bodyData)].forEach((item: any, key) => {
    if (item.itemNo == 1272) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem1272 = Number(item.data[columnId].data); // 1272:1系硫酸注入率
      } else {
        return null;
      }
    } else if (item.itemNo == 1273) {
      if (
        item.data[columnId].data ||
        isIntOrFloatNumber(item.data[columnId].data)
      ) {
        inputItem1273 = Number(item.data[columnId].data); // 1273:2系硫酸注入率
      } else {
        return null;
      }
    }
  });

  // 下記項目のいずれかの値が空または数値以外の場合は処理を行わない。
  if (1272 <= 0 || 1273 <= 0) {
    return null;
  }

  // 結果計算 ※ (1系硫酸注入率 + 2系硫酸注入率) / 2
  const calResultSultAcidRate: number = (inputItem1272 + inputItem1273) / 2;

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string = String(
              calResultSultAcidRate.toFixed(innerItem.inputMinDigits)
            );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 1212：宛先（共同水質）
 *
 * @param useSidemenuSelectedDate     選択している日付
 * @param columnId                    列index
 * @param rowId                       行index
 * @param dspNo                       入力画面番号
 * @param pointNo                     地点番号
 * @param processNo                   処理過程番号
 * @param bodyData                    データ[Object]
 * @returns
 */
export const DisplayJointInspectSetCell = async (
  useSidemenuSelectedDate: any,
  columnId: number,
  rowId: number,
  dspNo: number,
  pointNo: number,
  processNo: number,
  bodyData: any
) => {
  try {
    // 宛先自動入力用の定数値管理ステート
    const useDestinationConst = store.get(destinationConst);

    // 項目番号：1212
    const findData1212: any = bodyData.find(
      (item) => item.itemNo == 1212
    ).selectorList;

    // 項目番号：1155
    const findData1155: any = bodyData.find(
      (item) => item.itemNo == 1155
    ).selectorList;

    // 項目番号：1132
    const findData1132: any = bodyData.find(
      (item) => item.itemNo == 1132
    ).selectorList;

    // 選択肢番号　※ 宛先のみ
    const setPersonSelection: number =
      processNo == 20
        ? 2
        : processNo == 21
        ? 3
        : processNo == 22
        ? 4
        : processNo == 23
        ? 5
        : processNo == 24
        ? 6
        : processNo == 25
        ? 8
        : 1;

    // 選択肢番号
    const setSelection: number =
      processNo == 20
        ? 2
        : processNo == 21
        ? 3
        : processNo == 22
        ? 4
        : processNo == 23
        ? 5
        : processNo == 24
        ? 6
        : processNo == 25
        ? 7
        : 1;

    // データ指定
    let Item1212Data: string =
      (
        Object.values(findData1212).find(
          (list: any) => list.selection_no == setPersonSelection
        ) as any
      )?.selection_name || "";
    let Item1155Data: string =
      (
        Object.values(findData1155).find(
          (list: any) => list.selection_no == setSelection
        ) as any
      )?.selection_name || "";
    let Item1132Data: string =
      (
        Object.values(findData1132).find(
          (list: any) => list.selection_no == setSelection
        ) as any
      )?.selection_name || "";

    // 過去の宛先を確認
    useDestinationConst.forEach((process) => {
      if (process.processNo == processNo) {
        // DBからの最新データを使用_宛先
        process.desAddress.forEach((data) => {
          if (
            moment(useSidemenuSelectedDate, "YYYY/MM/DD") <
            moment(data.date, "YYYY/MM/DD")
          ) {
            Item1212Data = data.data;
          }
        });

        // DBからの最新データを使用_給水事業体
        process.desCity.forEach((data) => {
          Item1155Data = data;
        });

        // DBからの最新データを使用_所属（共同水質）
        process.desOffice.forEach((data) => {
          Item1132Data = data;
        });
      }
    });

    // 選択肢番号
    const setKbnSelection: number = 1;
    const checkTargetItemNo: number[] = [1132, 1155, 1212, 1903, 1904, 1905];

    const newList = [...Object.values(bodyData)].map((item: any, key) => {
      if (checkTargetItemNo.includes(item.itemNo)) {
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            if (innerIndex == columnId) {
              switch (item.itemNo) {
                case 1212:
                  if (innerItem.data) {
                    return innerItem;
                  } else {
                    return {
                      ...innerItem,
                      data: Item1212Data,
                      handleEditData: true,
                    };
                  }
                  break;
                case 1155:
                  if (innerItem.data) {
                    return innerItem;
                  } else {
                    return {
                      ...innerItem,
                      data: Item1155Data,
                      handleEditData: true,
                    };
                  }
                  break;
                case 1132:
                  if (innerItem.data || processNo == 25) {
                    return innerItem;
                  } else {
                    return {
                      ...innerItem,
                      data: Item1132Data,
                      handleEditData: true,
                    };
                  }
                  break;
                case 1903:
                  if (innerItem.data) {
                    return innerItem;
                  } else {
                    // 項目番号：1903
                    const findData1903: any = bodyData.find(
                      (item) => item.itemNo == 1903
                    )
                      ? bodyData.find((item) => item.itemNo == 1903)
                          .selectorList
                      : [];
                    const Item1903Data: string =
                      (
                        Object.values(findData1903).find(
                          (list: any) => list.selection_no == setKbnSelection
                        ) as any
                      )?.selection_name || "水質管理目標全項目";
                    return {
                      ...innerItem,
                      data: Item1903Data,
                      handleEditData: true,
                    };
                  }
                  break;
                case 1904:
                  if (innerItem.data) {
                    return innerItem;
                  } else {
                    // 項目番号：1904
                    const findData1904: any = bodyData.find(
                      (item) => item.itemNo == 1904
                    )
                      ? bodyData.find((item) => item.itemNo == 1904)
                          .selectorList
                      : [];
                    const Item1904Data: string =
                      (
                        Object.values(findData1904).find(
                          (list: any) => list.selection_no == setKbnSelection
                        ) as any
                      )?.selection_name || "嫌気性芽胞菌";
                    return {
                      ...innerItem,
                      data: Item1904Data,
                      handleEditData: true,
                    };
                  }
                  break;
                case 1905:
                  if (innerItem.data) {
                    return innerItem;
                  } else {
                    // 項目番号：1904
                    const findData1905: any = bodyData.find(
                      (item) => item.itemNo == 1905
                    )
                      ? bodyData.find((item) => item.itemNo == 1905)
                          .selectorList
                      : [];
                    const Item1905Data: string =
                      (
                        Object.values(findData1905).find(
                          (list: any) => list.selection_no == setKbnSelection
                        ) as any
                      )?.selection_name || "クリプトスポリジウム指標菌";
                    return {
                      ...innerItem,
                      data: Item1905Data,
                      handleEditData: true,
                    };
                  }
                  break;

                default:
                  return innerItem;
                  break;
              }
            } else {
              return innerItem;
            }
          }),
        };
      } else if (item.itemNo == 1902) {
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            if (innerIndex == columnId) {
              switch (dspNo) {
                case 1540:
                  // 項目番号：1902
                  const Item1902Of1540Data: string =
                    (
                      Object.values(item.selectorList).find(
                        (list: any) => list.selection_no == 1
                      ) as any
                    )?.selection_name || "浄水全項目";
                  return {
                    ...innerItem,
                    data: Item1902Of1540Data,
                    handleEditData: true,
                  };
                  break;
                case 1542:
                  // 項目番号：1902
                  const Item1902Of1542Data: string =
                    (
                      Object.values(item.selectorList).find(
                        (list: any) => list.selection_no == 2
                      ) as any
                    )?.selection_name || "省略不可能項目";
                  return {
                    ...innerItem,
                    data: Item1902Of1542Data,
                    handleEditData: true,
                  };
                  break;
                default:
                  return innerItem;
                  break;
              }
            } else {
              return innerItem;
            }
          }),
        };
      } else {
        return item;
      }
    });

    return newList;
  } catch (error) {
    return bodyData;
  }
};

/**
 * 自動計算関数
 *
 * @param columnId        列index
 * @param bodyData        データ[Object]
 * @param calItemArr      計算対象項目[配列]
 * @param calExtMutiple   かける用の数字[配列]
 * @param chkItemSet      合計を設定する対象項目
 * @param
 */
export const ItemTotalAutoCalculation = async (
  columnId: number,
  bodyData: any,
  calItemArr: number[],
  calExtMutiple: number[],
  chkItemSet: number
) => {
  // 合計
  let totalCal: number = 0;

  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    calItemArr.forEach((calItem, key) => {
      if (calItem === item.itemNo) {
        totalCal += item.data[columnId].data
          ? Number(item.data[columnId].data) * calExtMutiple[key]
          : 0;
      }
    });

    return item;
  });

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          if (innerIndex == columnId) {
            const totalCalAdj: string =
              totalCal == 0
                ? String(Number(0).toFixed(innerItem.inputMinDigits))
                : String(
                    processJisRoundingNumber(
                      totalCal,
                      null,
                      null,
                      innerItem.validDigits,
                      innerItem.inputMinDigits * -1
                    )
                  );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

/**
 * 自動計算関数_総取りはロメタン
 * ※ 2025/12 使用開始
 *
 * @param columnId        列index
 * @param bodyData        データ[Object]
 * @param calItemArr      計算対象項目[配列]
 * @param calExtMutiple   かける用の数字[配列]
 * @param chkItemSet      合計を設定する対象項目
 * @param
 */
export const Item2250TotalAutoCalculation = async (
  columnId: number,
  bodyData: any,
  calItemArr: number[],
  calExtMutiple: number[],
  chkItemSet: number
) => {
  // 合計
  let totalCal: number = 0;
  let checkAllInput: number = 0;
  let checkLessDigits: number = 0;

  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    calItemArr.forEach((calItem, key) => {
      if (calItem === item.itemNo) {
        if (item.data[columnId].data) {
          totalCal += item.data[columnId].data
            ? Number(item.data[columnId].data) * calExtMutiple[key]
            : 0;

          const partDecimal = item.data[columnId].data.split(".");

          // 合算値について、最小の小数位が最も小さい項目を使用
          if (partDecimal[1] && checkLessDigits == 0) {
            checkLessDigits = partDecimal[1].length;
          } else if (
            partDecimal[1] &&
            checkLessDigits !== 0 &&
            partDecimal[1].length < checkLessDigits
          ) {
            checkLessDigits = partDecimal[1].length;
          }

          checkAllInput += 1;
        }
      }
    });

    return item;
  });

  // クロロホルム、ブロモジクロロメタン、ジブロモクロロメタン、ブロモホルムのいずれかの値が空または数値以外の場合は処理を行わない。
  if (checkAllInput !== 4) {
    return null;
  }

  // 自動計算値を設定
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == chkItemSet) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          // 対象のデータと活性データを判定
          let setValidDigits: number = innerItem.validDigits;
          let setInputMinDigits: number = checkLessDigits;

          if (innerIndex == columnId) {
            const totalCalAdj: string =
              totalCal == 0
                ? String(Number(0).toFixed(setInputMinDigits))
                : String(
                    processJisRoundingNumber(
                      totalCal,
                      null,
                      null,
                      setValidDigits,
                      setInputMinDigits * -1
                    )
                  );
            return {
              ...innerItem,
              data: totalCalAdj,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};

export const ItemNouyakuAllAutoInput = async (
  bodyData: any,
  columnId: number,
  itemNo: number
) => {
  // 合計
  let totalCal: number = 0;

  // 計算有無フラグ
  let calFlg: boolean = false;

  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (
      item.constantQualitativeFlg == 1 &&
      item.data[columnId].data &&
      item.data[columnId].regulationUpLimit &&
      item.data[columnId].itemDaiCategoryNo ===
        Const.INSPECTION_DAI_CATEGORY_NOUYAKU
    ) {
      const useDataValue: number = item.data[columnId].data
        ? item.data[columnId].data
        : 0;
      const useRegulationUpLimit: number =
        item.data[columnId].regulationUpLimit;
      const calDataValue: number = useDataValue / useRegulationUpLimit;
      const jisCalDataValue: number = Number(
        processJisRoundingNumber(
          calDataValue,
          null,
          null,
          item.data[columnId].validDigits,
          item.data[columnId].inputMinDigits * -1
        )
      );
      totalCal += jisCalDataValue > 0 ? jisCalDataValue : 0.000000001;

      calFlg = true;
    }
    return item;
  });

  // 自動計算値を設定
  if (calFlg) {
    bodyData = [...Object.values(bodyData)].map((item: any, key) => {
      if (item.itemNo == 3140) {
        // コラム名を指定
        return {
          ...item,
          data: item.data.map((innerItem: any, innerIndex: any) => {
            // 対象のデータと活性データを判定
            if (innerIndex == columnId) {
              const totalCalAdj: string = String(
                processJisRoundingNumber(
                  totalCal,
                  null,
                  null,
                  innerItem.validDigits,
                  innerItem.inputMinDigits * -1
                )
              );
              return {
                ...innerItem,
                data: totalCalAdj,
                handleEditData: true,
              };
            } else {
              return innerItem;
            }
          }),
        };
      } else {
        return item;
      }
    });
  }

  return bodyData;
};

/**
 * 異常値チェック処理
 * ※ 検査結果入力表表示処理時及び、セルの値を変更時に下記表に従って異常値チェックを実施する。(定量定性識別フラグ = 1:定量の場合のみ)
 * ※ (入力値の変更の場合、セル値の自動設定処理の後に実施)
 * ※ 入力セル.基準値上限がNULLの場合、基準値 =1000000として判定を行う。
 *
 * @param inputData             入力データ
 * @param itemNo                項目番号
 * @param inspectionKbnCode     検査区分CD
 * @param inputLowLimit         入力下限値
 * @param regulationUpLimit     規制上限値
 * @param cUpper                C_Upper
 * @param cLower                C_Lower
 * @param saisuiKbnName         採水区分名称
 * @returns                     0:異常値なし、1:一般異常値(赤文字)、2:統計量の異常値(紫色文字)
 */
export const checkCellDataOver = (
  inputData: number,
  itemNo: number,
  inspectionKbnCode: number,
  inputLowLimit: number = 0,
  regulationUpLimit: number,
  cUpper: number,
  cLower: number,
  saisuiKbnName: string = ""
) => {
  let result: number = 0;

  // 200:毎日検査、5000:藻類検査、7100:霞ヶ浦水源調査藻類、3000:取水原水全項目検査、12000:共同水質検査原水、12040:共同水質検査クリプト、12030:共同水質検査嫌気性
  const condKbnArray: any = [200, 5000, 7100, 3000, 12000, 12040, 12030];

  // すべての項目
  const condRegulation: number = regulationUpLimit
    ? Number(regulationUpLimit)
    : 1000000;
  const condAdjRegulation: number = Number(condRegulation) * 0.7;
  const condInputLowLimit: number = Number(inputLowLimit);

  // 下記条件をすべて満たさない場合、異常値になる。
  // ※ 詳細設計書_WQM010_[異常値チェック処理]_条件 ➀
  // ※※ EDIT 2026/01 原水以外の場合の判定
  if (saisuiKbnName !== "原水") {
    const compareResult =
        inputData < condInputLowLimit
          ? 1
          : inputData < condAdjRegulation
            ? 2
            : inputData < condRegulation
              ? 3
              : 4;
              if (compareResult === 4) {
                result = 1;
              }
    
  }

  // 2450:pH値、2452:計器ｐＨ値、6150:水素イオン濃度（ｐＨ）
  // ※ 詳細設計書_WQM010_[異常値チェック処理]_条件 ➁
  // ※※ EDIT 2026/01 原水以外の場合の判定
  if (saisuiKbnName !== "原水") {
    if (itemNo == 2450 || itemNo == 2452 || itemNo == 6150) {
      if (inputData < Const.INPUT_PH_LOW || inputData > Const.INPUT_PH_UP) {
        result = 1;
      }
    } else if (itemNo == 3200 && inputData <= 0) {
      // 3200:臭気強度
      // ※ 詳細設計書_WQM010_[異常値チェック処理]_条件 ➂
      result = 1;
    }
  }
  

  // EDIT 2025/10/15 ※ タスク管理
  // 200:毎日検査、5000:藻類検査、7100:霞ヶ浦水源調査藻類、3000:取水原水全項目検査、12000:共同水質検査原水、12040:共同水質検査クリプト、12030:共同水質検査嫌気性
  // ※ EDIT 2026/01
  if (!condKbnArray.includes(inspectionKbnCode)) {
    // ※ 詳細設計書_WQM010_[異常値チェック処理]_条件 ➃
    if (
      itemNo !== 5000 &&
      itemNo !== 5010 &&
      itemNo !== 3150 &&
      inspectionKbnCode == 12010
    ) {
      // 気温、水温、残留塩素以外
      if (cUpper && !isNaN(cUpper)) {
        if (inputData > cUpper || inputData < cLower) {
          result = 2;
        }
      }
    } else {
      // ADD 2026/01 
      // ※ 詳細設計書_WQM010_[異常値チェック処理]_条件 ➄
      if (cUpper && !isNaN(cUpper)) {
        if (inputData > cUpper || inputData < cLower) {
          result = 2;
        }
      }
    }
  }

  return result;
};

/**
 * JIS丸め
 *
 * @param inputData             入力番号
 * @param itemNo                項目番号
 * @param inspectionKbnCode     検査区分CD
 * @param validDigits           有効桁数
 * @param inputMinDigits        入力最小桁
 * @returns
 */
export const processJisRoundingNumber = (
  inputData: any,
  itemNo: number,
  inspectionKbnCode: number,
  validDigits: number,
  inputMinDigits: number,
  outputMinDigits: number = null,
  inputLowLimit: number = null
) => {
  // 丸め処理を行う対象の数値
  if (isNaN(inputData)) {
    return "";
  }

  // マイナス値フラグ
  const minusFlg: boolean = Number(inputData) < 0 ? true : false;
  const roundingNumber: string = Math.abs(Number(inputData)).toFixed(8);

  // 丸め処理の結果
  let roundingRes: string = "";
  let digitsPaternA: number = 0;
  let digitsPaternB: number = 0;
  let outputDigits: number = 0;

  let intIndex: number = 0;
  let digitToRounding: number = 0; // 【丸める桁】
  let roundingLeft: number = 0;
  let roundingRight: number = 0;

  let roundingProcess: string = "";
  let roundedNumber: string = "";

  let roundingStr: string = ""; // 丸め対象文字列
  let ceilingStr: string = "";

  //  引数チェックを行う。
  //　(1)-1 sInDataが数値以外、またはi有効桁数が0未満、またはi最小入力桁が0より大きい場合W、処理を終了する。
  if (isIntOrFloatNumber(roundingNumber)) {
    // (1)-2 i有効桁数が0の場合、以下の判定に従いsOutDataを設定し、処理を終了する
    // (1)-2-1 sInDataに小数点が含まれる場合
    if (Number(roundingNumber) % 1 !== 0) {
      // sInDataを小数第8位までを有効桁(0表示する)となるように編集した値をsOutDataに設定し、処理を終了する。
      roundingRes = Number(roundingNumber).toFixed(8);
    } else {
      // (1)-2-2 上記以外の場合
      // sInDataをsOutDataに設定し、処理を終了する。
      roundingRes = roundingNumber;
    }
  }

  // (2) i有効桁数、i最小入力桁を考慮して【出力桁数】を算出し、計算用の数値を用意する。
  // (2)-1 sInDataについて、i有効桁数を考慮したときの【出力桁数】(桁数Aとする)を算出する。
  const checkNumberDigits: any = String(roundingRes).split(".");
  const integerDigit: string = checkNumberDigits[0]; // 整数桁
  const floatingDigit: string = checkNumberDigits[1]; // 小数点

  // 【丸める桁】_配列位置
  intIndex = integerDigit.length - 1;

  const arrToRounding: any = String(integerDigit + floatingDigit).split("");
  // ※i有効桁数が3でsInDataが0.0012345の場合、出力される桁は1の位～小数第5位となるため、桁数Aは6桁。
  let findValidKey: number = -1;
  arrToRounding.forEach((number, key) => {
    if (Number(number) > 0 && findValidKey === -1) {
      findValidKey = key;
    }
  });
  digitsPaternA = validDigits + findValidKey;

  // ※ NEW
  // digitToRounding = setValidDigits[digitsPaternA];
  // roundingLeft = setValidDigits[digitsPaternA - 1];
  // roundingRight = setValidDigits[digitsPaternA + 1];

  // (2)-2 下記の計算式にて、i最小入力桁を考慮したときの【出力桁数】(桁数Bとする)の算出を行う。
  // sInDataの整数部分の文字数 - i最小入力桁
  // ※sInDataの整数部分の文字数は以降、sInData整数桁数と記載。
  digitsPaternB = Number(integerDigit.length) - Number(inputMinDigits);

  // (2)-3 以下の判定に従い、i有効桁数とi最小入力桁を考慮した【出力桁数】を算出する。
  if (digitsPaternA <= digitsPaternB) {
    // (2)-3-1 桁数Aが桁数B以下の場合
    // 桁数Aを【出力桁数】に設定する。
    outputDigits = digitsPaternA;
  } else {
    // (2)-3-2 上記以外の場合
    // 桁数Bを【出力桁数】に設定する。
    outputDigits = digitsPaternB;
  }

  // (2)-4 以下の判定に従い、sInDataについて丸め処理を行うための文字列と、切り上げ処理を行う際に加算する文字列を用意する。
  if (arrToRounding.length <= outputDigits) {
    // (2)-4-1 sInDataの数字のみの文字数が【出力桁数】を超えない場合
    for (let index = 0; index < outputDigits; index++) {
      // 文字数が【出力桁数】と同じになるように、sInDataの数字のみの文字列の最後尾に"0"を追加した文字列を、【丸め対象文字列】に設定する。
      roundingStr += arrToRounding[index] ? arrToRounding[index] : "0";

      // 文字数が【出力桁数】と同じになるように、sInDataの数字のみの最後の文字位置が"1"、それ以外が"0"となる文字列を【切上加算文字列】に設定する。
      ceilingStr += index == outputDigits - 1 ? "1" : "0";
    }
  } else {
    // (2)-4-2 上記以外の場合
    // sInDataの数字のみを、【丸め対象文字列】に設定する。
    const setFloatingDigit = floatingDigit ? floatingDigit : "";
    roundingStr = String(integerDigit + setFloatingDigit);

    // 最後の文字が"1"、それ以外が"0"で文字数が【出力桁数】となる文字列を【切上加算文字列】に設定する。
    for (let index = 0; index < outputDigits; index++) {
      ceilingStr += index == outputDigits - 1 ? "1" : "0";
    }
  }

  // (3) 丸め処理の切り捨て/切り上げの判定を行う。
  // (3)-1 【丸め対象文字列】の左から(【出力桁数】 + 1)番目の文字(以降、【丸める桁】と記載)が未設定の場合
  digitToRounding = Number(roundingStr[outputDigits]); // ※ 位置【出力桁数】+ 1はインデックス【出力桁数】となる

  // 判定結果を「切り捨て」とする。
  if (roundingProcess === "") {
    roundingProcess = "切り捨て";
  }

  if (digitToRounding >= 0 && digitToRounding <= 4) {
    // (3)-2 【丸める桁】が"0"、"1"、"2"、"3"、"4"のいずれかの場合
    // 判定結果を「切り捨て」とする。
    roundingProcess = "切り捨て";
  } else if (digitToRounding === 5) {
    // (3)-4 【丸める桁】が"5"の場合、【丸め対象文字列】の左から(【出力桁数】 + 2)番目の文字(以降、【丸める桁】の1つ下位の桁と記載)で判定を行う。
    roundingRight = Number(roundingStr[outputDigits + 1]);

    // (3)-4-1 【丸める桁】の1つ下位の桁が"0"または未設定の場合、【丸め対象文字列】の左から(【出力桁数】 - 1)番目の文字(以降、【丸める桁】の1つ上位の桁と記載)で判定を行う。
    if (!roundingRight || roundingRight === 0) {
      roundingLeft = Number(roundingStr[outputDigits - 1]);
      if (roundingLeft % 2 !== 0) {
        // (3)-4-1-1 【丸める桁】の1つ上位の桁が奇数の場合
        // 判定結果を「切り上げ」とする。
        roundingProcess = "切り上げ";
      } else {
        // (3)-4-1-2 【丸める桁】の1つ上位の桁が偶数の場合
        // 判定結果を「切り捨て」とする。
        roundingProcess = "切り捨て";
      }
    } else {
      // (3)-4-2 上記以外(【丸める桁】の1つ下位の桁が"0"以外の数値)の場合
      // 判定結果を「切り上げ」とする。
      roundingProcess = "切り上げ";
    }
  } else if (digitToRounding > 5 && digitToRounding <= 9) {
    // (3)-3 【丸める桁】が"6"、"7"、"8"、"9"のいずれかの場合
    // 判定結果を「切り上げ」とする。
    roundingProcess = "切り上げ";
  }

  // (4) 切り捨て / 切り上げの判定に従い、丸め計算処理を行う。
  if (roundingProcess === "切り捨て") {
    // (4)-1 (3)の判定で切り捨てとなった場合
    if (integerDigit.length >= outputDigits) {
      // (4)-1-1 sInData整数桁数が【出力桁数】以上の場合
      //【丸め対象文字列】の【丸める桁】以降を"0"に置き換えた文字列を、丸めた文字列に設定する。
      for (let index = 0; index < outputDigits; index++) {
        roundedNumber += roundingStr[index] ? roundingStr[index] : "0";
      }

      roundedNumber = roundedNumber.padEnd(integerDigit.length, "0");
    } else {
      // (4)-1-2 上記以外の場合
      //【丸め対象文字列】のsInData整数桁数までの文字とそれ以降の文字との間に"."を挿入し、【出力桁数】に足りない数だけ"0"を最後尾に追加した文字列を、丸めた文字列に設定する。
      for (let index = 0; index < outputDigits; index++) {
        if (index === intIndex + 1) {
          roundedNumber +=
            "." + String(roundingStr[index] ? roundingStr[index] : "0");
        } else {
          roundedNumber += roundingStr[index] ? roundingStr[index] : "0";
        }
      }
    }
  } else {
    // (4)-2 (3)の判定で切り上げとなった場合
    if (integerDigit.length >= outputDigits) {
      // (4)-2-1 sInData整数桁数が【出力桁数】以上の場合
      //【丸め対象文字列】の【丸める桁】以降を"0"に置き換えた文字列を、【丸め対象文字列】に設定する。
      //【切上加算文字列】の【丸める桁】以降を"0"に置き換えた文字列を、【切上加算文字列】に設定する。
      //【丸め対象文字列】と【切上加算文字列】を数値として加算した値を、文字列として丸めた文字列に設定する。
      // EDIT 2025-10-27 整数部の切り上げ
      for (let index = 0; index < outputDigits; index++) {
        // for (let index = 0; index < integerDigit.length; index++) {
        roundedNumber += String(Number(roundingStr[index]));
      }

      roundedNumber = String(Number(roundedNumber) + 1);
      roundedNumber = roundedNumber.padEnd(integerDigit.length, "0");
    } else {
      // (4)-2-2 上記以外の場合
      //【丸め対象文字列】のsInData整数桁数までの文字とそれ以降の文字との間に"."を挿入した文字列を、【丸め対象文字列】に設定する。
      //【切上加算文字列】のsInData整数桁数までの文字とそれ以降の文字との間に"."を挿入した文字列を、【切上加算文字列】に設定する。
      //【丸め対象文字列】と【切上加算文字列】を数値として加算した値を、文字列として丸めた文字列に設定する。
      let setCeilingStr = "";
      for (let index = 0; index < outputDigits; index++) {
        roundedNumber += String(Number(roundingStr[index]));
        setCeilingStr += String(Number(ceilingStr[index]));
      }

      // 0を含む文字列の桁数を設定 ※ [00029] : ５桁
      const maxLength = Math.max(roundedNumber.length, setCeilingStr.length);

      // 丸め対象文字列 + 切上加算文字列 ※ [00029] + [00001] = [00030]
      roundedNumber = String(Number(roundedNumber) + Number(setCeilingStr));

      // 計算した時、先頭に０を設定 ※ [30] ➝ [00030]
      roundedNumber = roundedNumber.padStart(maxLength, "0");

      //「.」を設定
      roundedNumber =
        roundedNumber.slice(0, intIndex + 1) +
        "." +
        roundedNumber.slice(intIndex + 1);
    }
  }

  // (5) 終了処理を行う。
  // (5)-1 丸めた文字列について、【出力桁数】を考慮し"0"の文字列を追加する。

  // (5)-2 丸めた文字列にsInDataと同じ符号を追加し、sOutDataに設定して処理を終了する。
  if (minusFlg) {
    roundedNumber = "-" + roundedNumber;
  }
  return roundedNumber;
};

// 初期表示の小数設定【有効桁 と 最小桁】
export const jisRoundedInitShow = (
  inputData: any,
  validDigits: number,
  inputMinDigits: number
) => {
  // 丸め処理を行う対象の数値
  if (isNaN(inputData)) {
    return "";
  }

  // マイナス値フラグ
  const minusFlg: boolean = Number(inputData) < 0 ? true : false;
  const roundingNumber: string = Math.abs(Number(inputData)).toFixed(8);

  // 丸め処理の結果
  let roundingRes: string = "";
  let digitsPaternA: number = 0;
  let digitsPaternB: number = 0;
  let outputDigits: number = 0;
  let intIndex: number = 0;
  let roundedNumber: string = "";
  let roundingStr: string = ""; // 丸め対象文字列
  let ceilingStr: string = "";

  //  引数チェックを行う。
  //　(1)-1 sInDataが数値以外、またはi有効桁数が0未満、またはi最小入力桁が0より大きい場合W、処理を終了する。
  if (isIntOrFloatNumber(roundingNumber)) {
    // (1)-2 i有効桁数が0の場合、以下の判定に従いsOutDataを設定し、処理を終了する
    // (1)-2-1 sInDataに小数点が含まれる場合
    if (Number(roundingNumber) % 1 !== 0) {
      // sInDataを小数第8位までを有効桁(0表示する)となるように編集した値をsOutDataに設定し、処理を終了する。
      roundingRes = Number(roundingNumber).toFixed(8);
    } else {
      // (1)-2-2 上記以外の場合
      // sInDataをsOutDataに設定し、処理を終了する。
      roundingRes = roundingNumber;
    }
  }

  // (2) i有効桁数、i最小入力桁を考慮して【出力桁数】を算出し、計算用の数値を用意する。
  // (2)-1 sInDataについて、i有効桁数を考慮したときの【出力桁数】(桁数Aとする)を算出する。
  const checkNumberDigits: any = String(roundingRes).split(".");
  const integerDigit: string = checkNumberDigits[0]; // 整数桁
  const floatingDigit: string = checkNumberDigits[1]; // 小数点

  // 【丸める桁】_配列位置
  intIndex = integerDigit.length - 1;

  const arrToRounding: any = String(integerDigit + floatingDigit).split("");
  // ※i有効桁数が3でsInDataが0.0012345の場合、出力される桁は1の位～小数第5位となるため、桁数Aは6桁。
  let findValidKey: number = -1;
  arrToRounding.forEach((number, key) => {
    if (Number(number) > 0 && findValidKey === -1) {
      findValidKey = key;
    }
  });
  digitsPaternA = validDigits + findValidKey;

  // (2)-2 下記の計算式にて、i最小入力桁を考慮したときの【出力桁数】(桁数Bとする)の算出を行う。
  // sInDataの整数部分の文字数 - i最小入力桁
  // ※sInDataの整数部分の文字数は以降、sInData整数桁数と記載。
  digitsPaternB = Number(integerDigit.length) - Number(inputMinDigits);

  // (2)-3 以下の判定に従い、i有効桁数とi最小入力桁を考慮した【出力桁数】を算出する。
  outputDigits = digitsPaternA;

  // (2)-4 以下の判定に従い、sInDataについて丸め処理を行うための文字列と、切り上げ処理を行う際に加算する文字列を用意する。
  if (arrToRounding.length <= outputDigits) {
    // (2)-4-1 sInDataの数字のみの文字数が【出力桁数】を超えない場合
    for (let index = 0; index < outputDigits; index++) {
      // 文字数が【出力桁数】と同じになるように、sInDataの数字のみの文字列の最後尾に"0"を追加した文字列を、【丸め対象文字列】に設定する。
      roundingStr += arrToRounding[index] ? arrToRounding[index] : "0";

      // 文字数が【出力桁数】と同じになるように、sInDataの数字のみの最後の文字位置が"1"、それ以外が"0"となる文字列を【切上加算文字列】に設定する。
      ceilingStr += index == outputDigits - 1 ? "1" : "0";
    }
  } else {
    // (2)-4-2 上記以外の場合
    // sInDataの数字のみを、【丸め対象文字列】に設定する。
    const setFloatingDigit = floatingDigit ? floatingDigit : "";
    roundingStr = String(integerDigit + setFloatingDigit);

    // 最後の文字が"1"、それ以外が"0"で文字数が【出力桁数】となる文字列を【切上加算文字列】に設定する。
    for (let index = 0; index < outputDigits; index++) {
      ceilingStr += index == outputDigits - 1 ? "1" : "0";
    }
  }

  for (let index = 0; index < outputDigits; index++) {
    if (index === intIndex + 1) {
      roundedNumber +=
        "." + String(roundingStr[index] ? roundingStr[index] : "0");
    } else {
      roundedNumber += roundingStr[index] ? roundingStr[index] : "0";
    }
  }

  const checkRoundedDigits: any = String(roundedNumber).split(".");

  if (
    (checkRoundedDigits[1] && checkRoundedDigits[1].length > inputMinDigits) ||
    (Number(roundedNumber) == 0 && checkRoundedDigits[1])
  ) {
    roundedNumber = Number(roundedNumber).toFixed(Math.abs(inputMinDigits));
  }

  // (5) 終了処理を行う。
  // (5)-1 丸めた文字列について、【出力桁数】を考慮し"0"の文字列を追加する。

  // (5)-2 丸めた文字列にsInDataと同じ符号を追加し、sOutDataに設定して処理を終了する。
  if (minusFlg) {
    roundedNumber = "-" + roundedNumber;
  }
  return roundedNumber;
};

/**
 * 数値バリデーション
 *
 * @param n   確認値
 * @returns
 */
export const isIntOrFloatNumber = (n) => {
  // isNaN() => true：文字列、false：数値
  return isNaN(n) ? false : true;
};

/**
 * JIS丸め(大竹作成暫定版)
 */
export function jisRoundStrict(
  sInData: string,
  iSigDigits: number,
  iMinDigits: number
): string {
  // 引数チェック
  const isValidNumber = /^-?\d+(\.\d+)?$/.test(sInData);
  if (!isValidNumber || iSigDigits <= 0 || iMinDigits > 0) return "";

  const isNegative = sInData.startsWith("-");
  const sign = isNegative ? "-" : "";
  const num = Math.abs(Number(sInData));

  // 有効桁数スケーリング（Bankers Rounding）
  const exponent = num === 0 ? 0 : Math.floor(Math.log10(num));
  const scale = Math.pow(10, exponent - iSigDigits + 1);
  const rounded = Math.round(num / scale) * scale;

  // 出力分割
  const [intPart, rawDecPart = ""] = rounded.toString().split(".");

  // 小数部制御（iMinDigits が負 → 最大小数桁数）
  let output = "";
  if (iMinDigits < 0) {
    const maxDigits = Math.abs(iMinDigits);
    const dec = rawDecPart.slice(0, maxDigits); // 制限
    output = dec ? `${sign}${intPart}.${dec}` : `${sign}${intPart}`;
  } else {
    output = `${sign}${intPart}`;
  }

  return output;
}

/**
 * 1172：検査対象
 *
 * @param inputData   入力データ
 * @param bodyData    データ[Object]
 * @returns
 */
export const Item1172AutoInput = async (bodyData: any, dspName: string) => {
  let inputTimeArr: any = [];
  bodyData = [...Object.values(bodyData)].map((item: any, key) => {
    if (item.itemNo == 2) {
      item.data.forEach((timeItem) => {
        inputTimeArr.push(timeItem.data);
      });
    }

    if (item.itemNo === 1172) {
      // コラム名を指定
      return {
        ...item,
        data: item.data.map((innerItem: any, innerIndex: any) => {
          if (inputTimeArr[innerIndex]) {
            const kensaNo = dspName.includes("2") ? 2 : 1;
            const kensaTaisyou = Object.values(item.selectorList).find(
              (selectElem) => {
                return selectElem["selection_no"] == kensaNo;
              }
            );
            const kensaKeyCheck = kensaTaisyou.hasOwnProperty("selection_name");
            const inputData = innerItem.data
              ? innerItem.data
              : kensaKeyCheck
              ? kensaTaisyou["selection_name"].toString()
              : null;
            return {
              ...innerItem,
              data: inputData,
              handleEditData: true,
            };
          } else {
            return innerItem;
          }
        }),
      };
    } else {
      return item;
    }
  });

  return bodyData;
};
