/**
 * 入力画面設定ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】入力画面設定
import * as AtomMng050 from "../../stores/atomMNG050";

// コンテナーコンポネント
export const Mng050StateContainer = () => {
    const [useDisplayTime, setDisplayTime] = useAtom(AtomMng050.mng050DisplayTime);         // 処理実施日時

    // ステート管理のプロパティ
    const mng050State = {
        useDisplayTime,
        setDisplayTime
    };

    return mng050State;
};