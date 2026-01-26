// 汎用アトム
import { atom } from 'jotai';

// グローバル_確認ダイアログ設定
export interface confirmDialogCompType {
    isOpen: boolean;
    message: string;
    confirmBtnName?: string;
    cancelBtnName?: string;
    confirmBtnFlg?: boolean;
    cancelBtnFlg?: boolean;
    width?: string;
    onConfirm: () => void;
    onCancel?: () => void;
};

export const defaultConfirmDialogAtom: confirmDialogCompType = {
    isOpen: false,
    message: '',
    confirmBtnName: 'はい',
    confirmBtnFlg: true,
    cancelBtnName: 'キャンセル',
    cancelBtnFlg: true,
    width: '480px',
    onConfirm: () => { },
};

export const confirmDialogAtom = atom<confirmDialogCompType>(defaultConfirmDialogAtom);