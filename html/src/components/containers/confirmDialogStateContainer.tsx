/**
 * 確認ダイアログステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

// コンテナーコンポネント
export const ConfirmDialogStateContainer = () => {
    const [useDialog, setDialog] = useAtom(AtomConfirmDialog.confirmDialogAtom);             // 確認ダイアログ

    // ステート管理のプロパティ
    const confirmDialog = {
        useDialog,
        setDialog
    };

    return confirmDialog;
};