/**
 * 採水地点設定マスタステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】採水地点設定マスタ
import * as AtomMng020 from "../../stores/atomMNG020";

// コンテナーコンポネント
export const Mng020StateContainer = () => {
    const [useSaisuiPointListState, setSaisuiPointListState] = useAtom(AtomMng020.saisuiPointListState);                  // 検索一覧
    const [useSelectSaisuiKbnState, setSelectSaisuiKbnState] = useAtom(AtomMng020.selectSaisuiKbnState);                  // 採水区分選択肢
    const [useSelectSisetuState, setSelectSisetuState] = useAtom(AtomMng020.selectSisetuState);                           // 施設選択肢
    const [useSelectProcessState, setSelectProcessState] = useAtom(AtomMng020.selectProcessState);                        // 処理過程選択肢
    const [useSaisuiPointRegistState, setSaisuiPointRegistState] = useAtom(AtomMng020.saisuiPointRegistState);            // 登録用の採水地点データ
    const [useSaisuiPointRegistFlgState, setSaisuiPointRegistFlgState] = useAtom(AtomMng020.saisuiPointRegistFlgState);   // 登録用の採水地点_登録フラグ
    const [useSaisuiPointState, setSaisuiPointState] = useAtom(AtomMng020.saisuiPointState);                              // 検索条件の管理データ
    const [useMaxSaisuiPoint, setMaxSaisuiPoint] = useAtom(AtomMng020.maxSaisuiPoint);                                    // 採水地点番号の最大値
    const [useDisplayTime, setDisplayTime] = useAtom(AtomMng020.mng020DisplayTime);                                       // 処理実施日時

    // ステート管理のプロパティ
    const mng020State = {
        useSaisuiPointListState,
        setSaisuiPointListState,
        useSelectSaisuiKbnState,
        setSelectSaisuiKbnState,
        useSelectSisetuState,
        setSelectSisetuState,
        useSelectProcessState,
        setSelectProcessState,
        useSaisuiPointRegistState,
        setSaisuiPointRegistState,
        useSaisuiPointRegistFlgState,
        setSaisuiPointRegistFlgState,
        useSaisuiPointState,
        setSaisuiPointState,
        useMaxSaisuiPoint,
        setMaxSaisuiPoint,
        useDisplayTime,
        setDisplayTime
    };

    return mng020State;
};