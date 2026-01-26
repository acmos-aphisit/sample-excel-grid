/**
 * 汎用ステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】汎用
import * as AtomCommon from "../../stores/atom";

// コンテナーコンポネント
export const CommonStateContainer = () => {
    const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);                          // メッセージ
    const [useMessageMutiLine, setMessageMutiLine] = useAtom(AtomCommon.messageMutiLineState);              // メッセージ (複数行)
    const [useResultModalMessage, setResultModalMessage] = useAtom(AtomCommon.modalMessageState);           // メッセージ（モダール）
    const [useInputEditingFlg, setInputEditingFlg] = useAtom(AtomCommon.inputEditingFlg);                   // 編集状態フラグ
    const [useOutlinerModalShowFlg, setOutlinerModalShowFlg] = useAtom(AtomCommon.outlinerModalShowFlg);    // 異常値一覧モダールの開閉フラグ
    const [useOutlinerModalShowBtn, setOutlinerModalShowBtn] = useAtom(AtomCommon.outlinerModalShowBtn);    // 異常値一覧モダールの開閉ボタンフラグ
    const [useOutlinerModalDataLists, setOutlinerModalDataLists] = useAtom(AtomCommon.outlinerModalDataLists);
    const [useDesftinationConst, setDesftinationConst] = useAtom(AtomCommon.destinationConst);              // 宛先自動入力用の定数値管理ステート
    const [useInputMenuDate, setInputMenuDate] = useAtom(AtomCommon.inputMenuDate);                         // 日付
    const [useSideMenuWidth, setSideMenuWidth] = useAtom(AtomCommon.sideMenuWidth);                         // サイドメニューの広さ
    const [useLoadingState, setLoadingState] = useAtom(AtomCommon.loadingState);                               // ロード用


    // ステート管理のプロパティ
    const commonState = {
        useResultMessage,
        setResultMessage,
        useMessageMutiLine,
        setMessageMutiLine,
        useResultModalMessage,
        setResultModalMessage,
        useInputEditingFlg,
        setInputEditingFlg,
        useOutlinerModalShowFlg,
        setOutlinerModalShowFlg,
        useOutlinerModalShowBtn,
        setOutlinerModalShowBtn,
        useOutlinerModalDataLists,
        setOutlinerModalDataLists,
        useDesftinationConst,
        setDesftinationConst,
        useInputMenuDate,
        setInputMenuDate,
        useSideMenuWidth,
        setSideMenuWidth,
        useLoadingState,
        setLoadingState
    };

    return commonState;
};



