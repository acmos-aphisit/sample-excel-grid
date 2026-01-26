// 汎用アトム
import { atom } from "jotai";

// 取込用
export interface UploadData {
  import_file: any;
  report_no: string;
  select_date: string;
}

export const defaultUploadData: UploadData = {
  import_file: null,
  report_no: "",
  select_date: "",
};

export const fileUploadState = atom<UploadData>(defaultUploadData);
