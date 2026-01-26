/**
 * お知らせ管理子画面ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】お知らせ管理子画面
import * as AtomOshiraseManage from "../../stores/atomOshiraseManage";

// コンテナーコンポネント
export const OshiraseManageStateContainer = () => {
    const [useOshiraseManageModalFlg, setOshiraseManageModalFlg] = useAtom(AtomOshiraseManage.oshiraseManageModalFlgState);         // お知らせ管理子画面_表示フラグ
    const [useOshiraseManage, setOshiraseManage] = useAtom(AtomOshiraseManage.oshiraseManageState);                                 // 管理データ
    const [useDisplayTime, setDisplayTime] = useAtom(AtomOshiraseManage.inputDspDisplayTime);                                       // 処理実施日時

    // ステート管理のプロパティ
    const oshiraseManageState = {
        useOshiraseManageModalFlg,
        setOshiraseManageModalFlg,
        useOshiraseManage,
        setOshiraseManage,
        useDisplayTime,
        setDisplayTime
    };

    return oshiraseManageState;
};