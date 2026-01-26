/**
 * 運用メモ管理子画面ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】運用メモ管理子画面
import * as AtomUnyouMemoManage from "../../stores/atomUnyouMemoManage";

// コンテナーコンポネント
export const UnyouManageStateContainer = () => {
    const [useUnyouMemoManageModalFlg, setUnyouMemoManageModalFlg] = useAtom(AtomUnyouMemoManage.unyouMemoManageModalFlgState);         // 運用メモ管理子画面_表示フラグ
    const [useUnyouMemoManage, setUnyouMemoManage] = useAtom(AtomUnyouMemoManage.unyouMemoManageState);                                 // 管理データ
    const [useDisplayTime, setDisplayTime] = useAtom(AtomUnyouMemoManage.inputDspDisplayTime);                                          // 処理実施日時

    // ステート管理のプロパティ
    const unyouManageState = {
        useUnyouMemoManageModalFlg,
        setUnyouMemoManageModalFlg,
        useUnyouMemoManage,
        setUnyouMemoManage,
        useDisplayTime,
        setDisplayTime
    };

    return unyouManageState;
};