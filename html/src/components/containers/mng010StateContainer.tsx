/**
 * ユーザマスタステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】ユーザマスタ
import * as AtomMng010 from "../../stores/atomMNG010";

// コンテナーコンポネント
export const Mng010StateContainer = () => {
    const [useSearchAndSortState, setSearchAndSortState] = useAtom(AtomMng010.searchAndSortState);                           // 検索条件の管理データ
    const [useAffiliationInfoState, setAffiliationInfoState] = useAtom(AtomMng010.affiliationInfoState);                     // 所属課マスタの管理データ
    const [useUserMasterRegistState, setUserMasterRegistState] = useAtom(AtomMng010.userMasterRegistState);                  // ユーザマスタの登録用のデータ
    const [useUserMasterRegistFlgState, setUserMasterRegistFlgState] = useAtom(AtomMng010.userMasterRegistFlgState);         // ユーザマスタの登録用のフラ
    const [useSelectAffiDeptState, setSelectAffiDeptState] = useAtom(AtomMng010.selectAffiDeptState);                        // 所属部
    const [useSelectAffiSectState, setSelectAffiSectState] = useAtom(AtomMng010.selectAffiSectState);                        // 所属課
    const [useSelectSecurityLevelState, setSelectSecurityLevelState] = useAtom(AtomMng010.selectSecurityLevelState);         // 権限
    const [useSelectFixFlgState, setSelectFixFlgState] = useAtom(AtomMng010.selectFixFlgState);                              // 確定ボタン表示フラグ
    const [useMng010SearchAndSortState, setMng010SearchAndSortState] = useAtom(AtomMng010.searchAndSortState);               // 検索条件の管理データ
    const [useDisplayTime, setDisplayTime] = useAtom(AtomMng010.mng010DisplayTime);                                          // 処理実施日時

    // ステート管理のプロパティ
    const confirmDialog = {
        useSearchAndSortState,
        setSearchAndSortState,
        useAffiliationInfoState,
        setAffiliationInfoState,
        useUserMasterRegistState,
        setUserMasterRegistState,
        useUserMasterRegistFlgState,
        setUserMasterRegistFlgState,
        useSelectAffiDeptState,
        setSelectAffiDeptState,
        useSelectAffiSectState,
        setSelectAffiSectState,
        useSelectSecurityLevelState,
        setSelectSecurityLevelState,
        useSelectFixFlgState,
        setSelectFixFlgState,
        useMng010SearchAndSortState,
        setMng010SearchAndSortState,
        useDisplayTime,
        setDisplayTime
    };

    return confirmDialog;
};