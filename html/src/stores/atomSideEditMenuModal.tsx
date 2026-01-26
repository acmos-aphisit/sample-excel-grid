import { atom } from 'jotai';

// 編集用のメニュー
export const sideEditMenuState = atom<any>();

// 
export const dataMenuEdited = atom<any>({ text: '', parentId: '' });