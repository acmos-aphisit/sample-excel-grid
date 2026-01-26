// 共通処理

/**
 * nullを確認、データ加工_文字列
 * 
 * @param value 
 * @returns 
 */
export const checkNullAndReturnString = (value: any) => {
  if (value) {
    return String(value);
  } else {
    return "";
  }
};

/**
 * nullを確認、データ加工_数値
 * 
 * @param value 
 * @returns 
 */
export const checkNullAndReturnNumber = (value: any) => {
  if (value) {
    return Number(value);
  } else {
    return 0;
  }
};

/**
 * 未入力チェック
 * 
 * @param value 
 * @returns 
 */
export const checkNullOfString = (value: any) => {
  if (value) {
    return false;
  } else {
    return true;
  }
};

/**
 * 文字列数チェック
 * 
 * @param value 
 * @param digits 
 * @returns 
 */
export const checkLengthOverOfString = (value: any, digits: number) => {
  if (value.length > digits) {
    return true;
  } else {
    return false;
  }
};

/**
 * 半角数字と桁数チェック
 * 
 * @param value 
 * @param digits 
 * @returns 
 */
export const checkNumberAndDigits = (value: any, digits: number = null) => {
  if (value) {
    const reg = new RegExp(/^[0-9]*$/);

    // 半角数字
    if (!reg.test(value)) {
      return 1;
    }

    // 桁数
    if (digits) {
      if (value.length > digits) {
        return 2;
      }
    }
  } else {
    return 1;
  }

  return 0;
};

/**
 * 半角数字と桁数チェック（数値）
 * 
 * @param value 
 * @param digits 
 * @returns 
 */
export const checkIntDecDigits = (value: any, intDigits: number = null, decDigits: number = null) => {
  if (value) {
    const absValue: number = Math.abs(value);     // 1桁目の'-','+'も可

    // 半角数字
    if (isNaN(value)) {
      return 1;
    }

    const setValueArr: any = value.split(".");

    // 整数部
    if (setValueArr[0] && intDigits) {
      if (setValueArr[0].length > intDigits) {
        return 2;
      }
    }

    // 小数部
    if (setValueArr[1] && decDigits) {
      if (setValueArr[1].length > decDigits) {
        return 3;
      }
    }
  } else {
    return 1;
  }

  return 0;
};

/**
 * 半角英数字チェック
 * 
 * @param value 
 * @returns 
 */
export const checkLettersOrNumber = (value: any) => {
  if (value) {
    const reg = new RegExp(/^[A-Za-z\d]*$/);

    // 半角英数字
    if (!reg.test(value)) {
      return false;
    }
  } else {
    return false;
  }

  return true;
};

/**
 * ファイルの拡張子を確認
 * 
 * @param fileName 
 * @returns 
 */
export const getFileExtension = (fileName: string): string => {
  const lastExtensionIndex = fileName.lastIndexOf(".");

  // ファイルの拡張子がない場合
  if (lastExtensionIndex === -1) return "";

  // ファイルの拡張子リターン
  return fileName.substring(lastExtensionIndex + 1).toLowerCase();
};

/**
 * アップデート可能ファイル拡張子を確認
 * 
 * @param fileName 
 * @param allowedFileExt 
 * @returns 
 */
export const checkFileExtension = (fileName: string, allowedFileExt: string[]): boolean => {
  const ext = getFileExtension(fileName);
  return allowedFileExt.includes(ext);
};

/**
 * 西暦から和暦へ変換
 * @param {string} date 西暦の日付(例:2025/04/01)
 * @param {string} mode E: R7/04/01、J: 令和7年 4月 1日、S: 2025/04/01
 * @return {number|false} 変換された和暦を返す
 */
export const ADToJC = (date: string, mode = "E") => {
  // S : 西暦
  if (mode == "S") { return date }

  const spaceText: string = (mode == "E") ? "/" : " ";

  let array: string[] = [];
  if (date != undefined && date != null && date != '') {
    array = date.split(/[\/\.\-]/);
  } else {
    return date;
  }
  let nendo = '';
  if (Number(array[0]) >= 2019) {
    nendo = (Number(array[0]) - 2018).toString();
    if (nendo.length > 2) {
      nendo = '0' + nendo;
    }
    nendo = (mode == "E") ? 'R' + nendo : '令和' + nendo + '年';
  } else if (Number(array[0]) >= 1989) {
    nendo = (Number(array[0]) - 1988).toString();
    if (nendo.length > 2) {
      nendo = '0' + nendo;
    }
    nendo = (mode == "E") ? 'H' + nendo : '平成' + nendo + '年';
  } else if (Number(array[0]) >= 1926) {
    nendo = (Number(array[0]) - 1925).toString();
    if (nendo.length > 2) {
      nendo = '0' + nendo;
    }
    nendo = (mode == "E") ? 'S' + nendo : '昭和' + nendo + '年';
  } else if (Number(array[0]) >= 1912) {
    nendo = (Number(array[0]) - 1911).toString();
    if (nendo.length > 2) {
      nendo = '0' + nendo;
    }
    nendo = (mode == "E") ? 'T' + nendo : '大正' + nendo + '年';
  } else if (Number(array[0]) >= 1873) {
    nendo = (Number(array[0]) - 1867).toString();
    if (nendo.length > 2) {
      nendo = '0' + nendo;
    }
    nendo = (mode == "E") ? 'M' + nendo : '明治' + nendo + '年';
  }
  date = nendo;

  for (let i = 1; i < array.length; i++) {
    if (mode == "J") {
      const setMonthDate = (i == 1) ? String(parseInt(array[i])) + '月' : String(parseInt(array[i])) + '日';
      date = date + spaceText + setMonthDate;
    } else {
      date = date + spaceText + array[i];
    }


  }
  return date;
};

/**
 * 入力を時刻形式に変換
 * 時刻形式 "HH:MM:SS"
 * @param {string | number}  (例： "10", 1030)
 * @returns {string} 時刻形式 (例： "10:30:00") また "" に変換
 */
export const convertToTime = (input) => {
  // 1. 入力を文字列に変換、数字以外を削除
  const str = String(input).replace(/[^0-9]/g, '');

  // 2. ヌル・空文字・数字以外を確認
  if (!str || str.length === 0) {
    return "";
  }

  // 3. 時間値、分値
  let hours = "";
  let minutes = "";
  let seconds = "00";

  switch (str.length) {
    case 1:
    case 2:
      // 入力は "1" また "10" -> "01:00" また "10:00"
      hours = str.padStart(2, '0');
      minutes = "00";
      break;
    case 3:
      // 入力は "103" -> "01:03" (この場合は 1 時 と 3 分になる)
      hours = str.slice(0, 1).padStart(2, '0');
      minutes = str.slice(1, 3).padStart(2, '0');
      break;
    case 4:
      // 入力は "1030" -> "10:30"
      hours = str.slice(0, 2);
      minutes = str.slice(2, 4);
      break;
    case 5:
      // 入力は "103045" -> "10:30:45"
      hours = str.slice(0, 1);
      minutes = str.slice(1, 3);
      seconds = str.slice(3, 5);
      break;
    case 6:
      // 入力は "103045" -> "10:30:45"
      hours = str.slice(0, 2);
      minutes = str.slice(2, 4);
      seconds = str.slice(4, 6);
      break;
    default:
      // 入力は時間分以外 (例： "103045")
      return "";
  }

  // 4. 時間値と分値を確認 (0-23 and 0-59)
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const s = parseInt(seconds, 10);

  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return "";
  }

  // 5. 形式変換と値を返す
  const formattedHours = String(h).padStart(2, '0');
  const formattedMinutes = String(m).padStart(2, '0');
  const formattedSeconds = String(s).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

// 時刻形式に変換済を確認
export const isTimeFormatted = (input) => {
    // 文字数・ヌルを確認
    const str = String(input);
    if (!str || str.length === 0) {
        return false;
    }

    /** 
     * 2. 正規表現確認
     * ^                       : 開始文字列
     * ([0-1][0-9]|2[0-3])     : HH (Hours) - 一致 00-19 また 20-23
     * :                       : １つ目の (:)
     * [0-5][0-9]              : MM (Minutes) - 一致 00-59
     * :                       : ２つ目の (:)
     * [0-5][0-9]              : SS (Seconds) - 一致 00-59
     * $                       : 最終文字列
     */
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;

    return timeRegex.test(str);
};