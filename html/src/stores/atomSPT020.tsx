// 汎用アトム
import { atom } from "jotai";

// 動画マニュアルデータ
export const spt020ManualVideoList = atom<any[]>([]);

// 選択している動画マニュアル
export const spt020SelectedManualVideoName = atom<string>();
export const spt020SelectedManualVideoPath = atom<string>();

// ボタンエリア開閉
export const spt020SelectionAreaToggle = atom<any>();
