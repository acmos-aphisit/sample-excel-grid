/**
 * グリッドテーブルステートコンテナー
 *
 */
import { useAtom, useAtomValue } from "jotai";

//【ステート】グリッドテーブル
import * as AtomGridTable from "../../stores/atomGridTable";

// コンテナーコンポネント
export const GridTableStateContainer = () => {
  const [useTempSaveData, setTempSaveData] = useAtom(
    AtomGridTable.gridTableTempSaveData
  ); // 保持データ
  const [useGridTableButtomInfo, setGridTableButtomInfo] = useAtom(
    AtomGridTable.gridTableButtomInfo
  ); // 一番下の欄の基準値情報
  const [useEnterToCell, setEnterToCell] = useAtom(
    AtomGridTable.wqm010EnterToCell
  ); // 入力確定して、次のセルに移動
  const [useInputFixedFlg, setInputFixedFlg] = useAtom(
    AtomGridTable.wqm010InputFixedFlg
  ); // 入力データ確定フラグ
  const [useInputFixedBtnFlg, setInputFixedBtnFlg] = useAtom(
    AtomGridTable.wqm010InputFixedBtnFlg
  ); // 入力データ確定ボタンの表示フラグ
  const [useCurFocusColumn, setCurFocusColumn] = useAtom(
    AtomGridTable.useCurFocusColumn
  ); // 選択セル座標_カラム
  const [useCurFocusRow, setCurFocusRow] = useAtom(
    AtomGridTable.useCurFocusRow
  ); // 選択セル座標_ロー
  const [useGridTableFooterBtnClick, setGridTableFooterBtnClick] = useAtom(
    AtomGridTable.gridTableFooterBtnClick
  ); // フッターの操作リクエスト
  const [useEditingData, setEditingData] = useAtom(
    AtomGridTable.sampleListState
  ); // 編集中のデータ（情報取得 ※実際に使えば、DBからの情報）
  const [columnData, setColumnData] = useAtom(
    AtomGridTable.sampleColumnListState
  ); // 地点ヘッダーデータ（情報取得　※実際に使えば、DBからの情報）
  const [dataNumbersState, setDataNumbersState] = useAtom(
    AtomGridTable.dataNumbersState
  ); // 列数
  const [dataDateState, setDataDateState] = useAtom(
    AtomGridTable.dataDateState
  ); // 日付

  const [useCriCorrectData, setCriCorrectData] = useAtom(
    AtomGridTable.gridTablecriteriaCorrectionData
  ); // 基準値補正データ
  const gridTableDefaultButtomInfo = AtomGridTable.gridTableDefaultButtomInfo;

  // ステート管理のプロパティ
  const gridTableState = {
    useTempSaveData,
    setTempSaveData,
    useGridTableButtomInfo,
    setGridTableButtomInfo,
    useEnterToCell,
    setEnterToCell,
    useInputFixedFlg,
    setInputFixedFlg,
    useInputFixedBtnFlg,
    setInputFixedBtnFlg,
    useCurFocusColumn,
    setCurFocusColumn,
    useCurFocusRow,
    setCurFocusRow,
    useGridTableFooterBtnClick,
    setGridTableFooterBtnClick,
    useEditingData,
    setEditingData,
    columnData,
    setColumnData,
    dataNumbersState,
    setDataNumbersState,
    dataDateState,
    setDataDateState,
    useCriCorrectData,
    setCriCorrectData,
    gridTableDefaultButtomInfo,
  };

  return gridTableState;
};
