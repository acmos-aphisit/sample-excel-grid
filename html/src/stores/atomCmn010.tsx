// 汎用アトム
import { atom } from 'jotai';

// ヘッダータイトル用
export const headerTitleState = atom<string>('');

// メッセージ用
export interface message {
  level: string;
  message: string;
}
export const messageState = atom<message[]>([]);

// メールアドレス用
export const userIdState = atom<string>('');

// パスワード用
export const passwordState = atom<string>('');

// パスワード用表示切替
export const passwordToggleState = atom<string>('password');