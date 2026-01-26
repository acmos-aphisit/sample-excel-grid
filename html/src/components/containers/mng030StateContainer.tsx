/**
 * 検査項目設定ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】検査項目設定
import * as AtomMng030 from "../../stores/atomMNG030";

// コンテナーコンポネント
export const Mng030StateContainer = () => {
    const [useMng030SelectItemDaiCategory, setMng030SelectItemDaiCategory] = useAtom(AtomMng030.selectItemDaiCategoryState);                                    // 検査項目大分類
    const [useMng030SelectItemTyuCategory, setMng030SelectItemTyuCategory] = useAtom(AtomMng030.selectItemTyuCategoryState);                                    // 検査項目中分類
    const [useMng030SelectConstantQualitativeFlg, setMng030SelectConstantQualitativeFlg] = useAtom(AtomMng030.selectConstantQualitativeFlgState);               // データ区分名称
    const [useMng030SelectInputType, setMng030SelectInputType] = useAtom(AtomMng030.selectInputTypeState);                                                      // 入力タイプ
    const [useMng030SearchAndSortState, setMng030SearchAndSortState] = useAtom(AtomMng030.searchAndSortState);                                                  // 検索条件の管理データ
    const [useMng030InspItemRegist, setMng030InspItemRegist] = useAtom(AtomMng030.inspItemRegistState);                                                         // 登録用の検査項目データ
    const [useMng030InspItemRegistFlgState, setMng030InspItemRegistFlg] = useAtom(AtomMng030.inspItemRegistFlgState);                                           // 登録用の検査項目_登録フラグ
    const [useMng030MaxItemNo, setMng030MaxItemNo] = useAtom(AtomMng030.maxItemNo);                                                                             // 項目番号の最大値
    const [useDisplayTime, setDisplayTime] = useAtom(AtomMng030.mng030DisplayTime);                                                                             // 処理実施日時
    
    // ステート管理のプロパティ
    const mng030State = {
        useMng030SelectItemDaiCategory,
        setMng030SelectItemDaiCategory,
        useMng030SelectItemTyuCategory,
        setMng030SelectItemTyuCategory,
        useMng030SelectConstantQualitativeFlg,
        setMng030SelectConstantQualitativeFlg,
        useMng030SelectInputType,
        setMng030SelectInputType,
        useMng030SearchAndSortState,
        setMng030SearchAndSortState,
        useMng030InspItemRegist,
        setMng030InspItemRegist,
        useMng030InspItemRegistFlgState,
        setMng030InspItemRegistFlg,
        useMng030MaxItemNo,
        setMng030MaxItemNo,
        useDisplayTime,
        setDisplayTime
    };

    return mng030State;
};