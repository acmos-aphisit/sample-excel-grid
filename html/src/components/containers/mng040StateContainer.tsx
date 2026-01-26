/**
 * 基準値設定ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】基準値設定
import * as AtomMng040 from "../../stores/atomMNG040";

// コンテナーコンポネント
export const Mng040StateContainer = () => {
    const [useMng040SelectItemDaiCategory, setMng040SelectItemDaiCategory] = useAtom(AtomMng040.selectItemDaiCategoryState);            // 検査項目大分類
    const [useMng040SelectItemTyuCategory, setMng040SelectItemTyuCategory] = useAtom(AtomMng040.selectItemTyuCategoryState);            // 検査項目中分類
    const [useMng040ApplyYear, setMng040ApplyYear] = useAtom(AtomMng040.selectApplyYearState);                                          // 適用年度
    const [useMng040SaisuiKbn, setMng040SaisuiKbn] = useAtom(AtomMng040.selectSaisuiKbnState);                                          // 採水区分
    const [useMng040SelectInputType, setMng040SelectInputType] = useAtom(AtomMng040.selectInputTypeState);                              // 入力タイプ
    const [useMng040SearchAndSort, setMng040SearchAndSort] = useAtom(AtomMng040.searchAndSortState);                                    // 検索条件の管理データ
    const [useMng040InspCriteriaRegist, setMng040InspCriteriaRegist] = useAtom(AtomMng040.inspCriteriaRegistState);                     // 登録用の検査基準データ
    const [useMng040InspCriteriaRegistFlg, setMng040InspCriteriaRegistFlg] = useAtom(AtomMng040.inspCriteriaRegistFlgState);            // 登録用の検査基準_登録フラグ
    const [useMng040LatestYear, setMng040LatestYear] = useAtom(AtomMng040.latestYear);                                                  // 最新の適用
    const [useMng040AddNextYear, setMng040AddNextYear] = useAtom(AtomMng040.addNextYear);                                               // 追加する適用年度
    const [useValidDigitsState, setValidDigitsState] = useAtom(AtomMng040.selectValidDigitsState);                                      // 有効桁数選択肢
    const [useInputDigitsState, setInputDigitsState] = useAtom(AtomMng040.selectInputDigitsState);                                      // 入力最小桁選択肢
    const [useOutputDigitsState, setOutputDigitsState] = useAtom(AtomMng040.selectOutputDigitsState);                                   // 出力最小桁選択肢
    const [useSearchAndSortState, setSearchAndSortState] = useAtom(AtomMng040.searchAndSortState);                                      // 検索条件の管理データ

    // ステート管理のプロパティ
    const mng040State = {
        useMng040SelectItemDaiCategory,
        setMng040SelectItemDaiCategory,
        useMng040SelectItemTyuCategory,
        setMng040SelectItemTyuCategory,
        useMng040ApplyYear,
        setMng040ApplyYear,
        useMng040SaisuiKbn,
        setMng040SaisuiKbn,
        useMng040SelectInputType,
        setMng040SelectInputType,
        useMng040SearchAndSort,
        setMng040SearchAndSort,
        useMng040InspCriteriaRegist,
        setMng040InspCriteriaRegist,
        useMng040InspCriteriaRegistFlg,
        setMng040InspCriteriaRegistFlg,
        useMng040LatestYear,
        setMng040LatestYear,
        useMng040AddNextYear,
        setMng040AddNextYear,
        useValidDigitsState,
        setValidDigitsState,
        useInputDigitsState,
        setInputDigitsState,
        useOutputDigitsState,
        setOutputDigitsState,
        setSearchAndSortState,
        useSearchAndSortState
    };

    return mng040State;
};