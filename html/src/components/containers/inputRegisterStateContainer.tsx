/**
 * 検査情報登録ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】検査情報登録
import * as AtomInputRegister from "../../stores/atomWQM010";

// コンテナーコンポネント
export const InputRegisterStateContainer = () => {
    const [useInputPointItemData, setInputPointItemData] = useAtom(AtomInputRegister.wqm010PointItemData);          // 地点・項目・入力データ_gridTableコンポの引数用
    const [useDisplayTime, setDisplayTime] = useAtom(AtomInputRegister.wqm010DisplayTime);                          // 処理実施日時

    // ステート管理のプロパティ
    const inputRegisterState = {
        useInputPointItemData,
        setInputPointItemData,
        useDisplayTime,
        setDisplayTime
    };

    return inputRegisterState;
};