import axios from "axios";
import type { Setter } from "jotai";
import * as Const from "./const";
import * as MessageConst from "./message";
import * as CommonAtom from "../stores/atom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
//axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;
//axios.defaults.withXSRFToken = true;

export const getMessage = (arrMsg: string[]): getMessageType => {
  let messageText = "";
  let level = "";

  if (!Array.isArray(arrMsg)) {
    arrMsg = String(arrMsg).split("|");
  }

  let i = 0;
  Object.keys(arrMsg).forEach(() => {
    if (messageText === undefined) {
      messageText = "メッセージが取得できませんでした。";
      level = "error";

      return;
    }
    if (i > 0) {
      const repStr = `{${(i - 1).toString()}}`;
      messageText = messageText.replace(repStr, arrMsg[i]);
    } else {
      messageText = MessageConst.messageList[arrMsg[0]];
      level = MessageConst.messageLevel[arrMsg[0].slice(-1)];
    }
    i += 1;
  });

  const result: getMessageType = {
    message: messageText,
    level,
  };

  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  return result;
};

// メッセージ表示
export const showMessageArea = (
  errorMsg: { [index: string]: string[][] },
  setMessage: any
) => {
  const errorInfo: getMessageType[] = [];

  if (!errorMsg) {
    setMessage([]);

    return;
  }

  Object.keys(errorMsg).forEach((key) => {
    errorInfo.push(getMessage(errorMsg[key][0]));
  });

  setMessage(errorInfo);
};

// メッセージ取得
interface getMessageType {
  message: string;
  level: string;
}

// function getCookie(name) {
//   const value = document.cookie
//   const parts = value.split(name)
//   if (parts.length === 2) {
//     return parts.pop().split(';').shift()
//   }
// }

export class Api {
  /**
   * 汎用_GET_処理：データ取得
   *
   * @param url
   * @param setMessage
   * @param header
   * @returns
   */
  public static get = (url: string, setMessage: any): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .get(`/api${url}`, setMessage)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          // HTTPコードを確認
          if (error.status == 400) {
            // リクエスト不正
          } else if (
            (error.status == 401 || error.status == 419) ||
            (error.response.data.message !== undefined &&
              (error.response.data.message === Const.errorType["401"] || error.response.data.message === Const.errorType["419"]))
          ) {
            // 権限の認証失敗・CSRFトークン不一致
            // ※ ログイン画面へ戻る
            let redirectURL = "/";
            errorMsg = error.response.data.errors;
            location.href = redirectURL;
            errorStatus = Const.HTTP_STATUS_CODE["401"];
            showMessageArea(errorMsg, setMessage);

            return;
          } else if (error.status == 403) {
            // リクエストの実行を拒否
          } else if (error.status == 404) {
            // リソース未検出
            errorMsg = { "404": [["WQ-0028E"]] };
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.HTTP_STATUS_CODE["404"];
          } else if (error.status == 409) {
            // リソースの現在の状態と競合
          } else if (error.status == 422) {
            // データ型不正
            // ※ サーバーバリデーションエラー
            errorMsg = error.response.data.errors;
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.HTTP_STATUS_CODE["422"];
          } else if (error.status == 500) {
            // サーバ内部エラー
            errorMsg = error.response.data.errors;
            if (errorMsg) {
              // サーバーからエラーメッセージがある場合
              showMessageArea(errorMsg, setMessage);
            } else {
              errorStatus = Const.HTTP_STATUS_CODE["500"];
            }
          } else {
            // その他
            window.console.log(error);
            errorStatus = Const.HTTP_STATUS_CODE["500"];
          }

          reject(new Error(errorStatus));
        });
    });

  // 汎用POST処理(バイナリ用)
  public static postBuffer = (
    url: string,
    setMessage: any,
    requestData: any = null
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .post(`/api${url}`, requestData, { responseType: "arraybuffer" })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          if (
            error === undefined ||
            error.response === undefined ||
            error.response.data === undefined
          ) {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          } else {
            // arraybuffer → 配列に変換
            let decoder = new TextDecoder();
            const errString = decoder.decode(error.response.data);
            const errArray = JSON.parse(errString);

            if (errArray !== undefined) {
              errorMsg = errArray.errors;
              showMessageArea(errorMsg, setMessage);
              errorStatus = Const.errorType["404"];
            } else if (
              errArray.message !== undefined &&
              (errArray.message === Const.errorType["401"] ||
                errArray.message === Const.errorType["419"])
            ) {
              location.href = "/login";
              errorStatus = Const.errorType["401"];
              showMessageArea(errorMsg, setMessage);
              return;
            } else {
              window.console.log(error);
              errorStatus = Const.errorType["500"];
            }
          }
          reject(new Error(errorStatus));
        });
    });

  /**
   * 汎用_POST_処理：新規データ作成
   *
   * @param url
   * @param setMessage
   * @param requestData
   * @param header
   * @returns
   */
  public static post = (
    url: string,
    setMessage: any,
    requestData: any,
    header: any = {}
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .post(`/api${url}`, requestData, header)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          // HTTPコードを確認
          if (error.status == 400) {
            // リクエスト不正
          } else if (
            (error.status == 401 || error.status == 419) ||
            (error.response.data.message !== undefined &&
              (error.response.data.message === Const.errorType["401"] || error.response.data.message === Const.errorType["419"]))
          ) {
            // 権限の認証失敗・CSRFトークン不一致
            // ※ ログイン画面へ戻る
            let redirectURL = "/";
            errorMsg = error.response.data.errors;
            location.href = redirectURL;
            errorStatus = Const.HTTP_STATUS_CODE["401"];
            showMessageArea(errorMsg, setMessage);

            return;
          } else if (error.status == 403) {
            // リクエストの実行を拒否
          } else if (error.status == 404) {
            // リソース未検出
            errorMsg = { "404": [["WQ-0028E"]] };
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.HTTP_STATUS_CODE["404"];
          } else if (error.status == 409) {
            // リソースの現在の状態と競合
          } else if (error.status == 422) {
            // データ型不正
            // ※ サーバーバリデーションエラー
            errorMsg = error.response.data.errors;
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.HTTP_STATUS_CODE["422"];
          } else if (error.status == 500) {
            // サーバ内部エラー
            errorMsg = error.response.data.errors;
            if (errorMsg) {
              // サーバーからエラーメッセージがある場合
              showMessageArea(errorMsg, setMessage);
            } else {
              errorStatus = Const.HTTP_STATUS_CODE["500"];
            }
          } else {
            // その他
            window.console.log(error);
            errorStatus = Const.HTTP_STATUS_CODE["500"];
          }

          reject(new Error(errorStatus));
        });
    });

  // 汎用POST処理(ファイルダウンロード用)
  public static fileDownload = (
    url: string,
    setMessage: any,
    requestData: any = null
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .post(`/api${url}`, requestData, { responseType: "arraybuffer" })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          if (
            error === undefined ||
            error.response === undefined ||
            error.response.data === undefined
          ) {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          } else {
            // arraybuffer → 配列に変換
            let decoder = new TextDecoder();
            const errString = decoder.decode(error.response.data);
            const errArray = JSON.parse(errString);

            if (errArray !== undefined) {
              errorMsg = errArray.errors;
              showMessageArea(errorMsg, setMessage);
              errorStatus = Const.errorType["404"];
            } else if (
              errArray.message !== undefined &&
              (errArray.message === Const.errorType["401"] ||
                errArray.message === Const.errorType["419"])
            ) {
              location.href = "/login";
              errorStatus = Const.errorType["401"];
              showMessageArea(errorMsg, setMessage);
              return;
            } else {
              window.console.log(error);
              errorStatus = Const.errorType["500"];
            }
          }
          reject(new Error(errorStatus));
        });
    });

  /**
   * 汎用_PUT_処理：データ全部更新
   *
   * @param url
   * @param setMessage
   * @param requestData
   * @param header
   * @returns
   */
  public static put = (
    url: string,
    setMessage: any,
    requestData: any,
    header: any = {}
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .put(`/api${url}`, requestData, header)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          if (
            error === undefined ||
            error.response === undefined ||
            error.response.data === undefined
          ) {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          } else if (error.response.data.errors !== undefined) {
            errorMsg = error.response.data.errors;
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.errorType["404"];
          } else if (
            error.response.data.message !== undefined &&
            (error.response.data.message === Const.errorType["401"] ||
              error.response.data.message === Const.errorType["419"])
          ) {
            let redirectURL = "/";
            const adminCheckUrl = /\/loginCheck|\/upload|\/master|\/history/;

            if (adminCheckUrl.test(url)) {
              redirectURL = "/";
            }
            errorMsg = error.response.data.errors;
            location.href = redirectURL;
            errorStatus = Const.errorType["401"];
            showMessageArea(errorMsg, setMessage);

            return;
          } else {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          }
          reject(new Error(errorStatus));
        });
    });

  /**
   * 汎用_PATCH_処理：データ一部更新
   *
   * @param url
   * @param setMessage
   * @param requestData
   * @param header
   * @returns
   */
  public static patch = (
    url: string,
    setMessage: any,
    requestData: any,
    header: any = {}
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .put(`/api${url}`, requestData, header)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          if (
            error === undefined ||
            error.response === undefined ||
            error.response.data === undefined
          ) {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          } else if (error.response.data.errors !== undefined) {
            errorMsg = error.response.data.errors;
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.errorType["404"];
          } else if (
            error.response.data.message !== undefined &&
            (error.response.data.message === Const.errorType["401"] ||
              error.response.data.message === Const.errorType["419"])
          ) {
            let redirectURL = "/";
            const adminCheckUrl = /\/loginCheck|\/upload|\/master|\/history/;

            if (adminCheckUrl.test(url)) {
              redirectURL = "/";
            }
            errorMsg = error.response.data.errors;
            location.href = redirectURL;
            errorStatus = Const.errorType["401"];
            showMessageArea(errorMsg, setMessage);

            return;
          } else {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          }
          reject(new Error(errorStatus));
        });
    });

  /**
   * 汎用_DELETE_処理：データ削除
   *
   * @param url
   * @param setMessage
   * @param requestData
   * @param header
   * @returns
   */
  public static delete = (
    url: string,
    setMessage: any,
    requestData: any,
    header: any = {}
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .put(`/api${url}`, requestData, header)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          if (
            error === undefined ||
            error.response === undefined ||
            error.response.data === undefined
          ) {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          } else if (error.response.data.errors !== undefined) {
            errorMsg = error.response.data.errors;
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.errorType["404"];
          } else if (
            error.response.data.message !== undefined &&
            (error.response.data.message === Const.errorType["401"] ||
              error.response.data.message === Const.errorType["419"])
          ) {
            let redirectURL = "/";
            const adminCheckUrl = /\/loginCheck|\/upload|\/master|\/history/;

            if (adminCheckUrl.test(url)) {
              redirectURL = "/";
            }
            errorMsg = error.response.data.errors;
            location.href = redirectURL;
            errorStatus = Const.errorType["401"];
            showMessageArea(errorMsg, setMessage);

            return;
          } else {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          }
          reject(new Error(errorStatus));
        });
    });

  /**
   * 汎用_POST_処理：ログイン
   *
   * @param setMessage
   * @param request
   * @returns
   */
  public static login = (
    setMessage: any,
    request: { user_id: string; user_password: string }
  ): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .get("/sanctum/csrf-cookie")
        .then(() => {
          axios
            .post("/api/login", request)
            .then((response) => {
              resolve(response.data);
            })
            .catch((error) => {
              let errorMsg: { [index: string]: string[][] };
              let errorStatus: string;

              // HTTPコードを確認
              if (error.status == 400) {
                // リクエスト不正

              } else if (
                (error.status == 401 || error.status == 419) ||
                (error.response.data.message !== undefined &&
                  (error.response.data.message === Const.errorType["401"] || error.response.data.message === Const.errorType["419"]))
              ) {
                // 権限の認証失敗・CSRFトークン不一致
                // ※ ログイン画面へ戻る
                errorMsg = error.response.data.errors;
                errorStatus = Const.HTTP_STATUS_CODE["401"];
                showMessageArea(errorMsg, setMessage);

                return;
              } else if (error.status == 403) {
                // リクエストの実行を拒否
              } else if (error.status == 404) {
                // リソース未検出
                errorMsg = { "404": [["WQ-0028E"]] };
                showMessageArea(errorMsg, setMessage);
                errorStatus = Const.HTTP_STATUS_CODE["404"];
              } else if (error.status == 409) {
                // リソースの現在の状態と競合
              } else if (error.status == 422) {
                // データ型不正
                // ※ サーバーバリデーションエラー
                errorMsg = error.response.data.errors;
                showMessageArea(errorMsg, setMessage);
                errorStatus = Const.HTTP_STATUS_CODE["422"];
              } else if (error.status == 500) {
                // サーバ内部エラー
                if (error.response.data.message.includes("connection to server")) {
                  // データベースに接続失敗
                  errorMsg = { "500": [["WQ-0001E"]] };
                  showMessageArea(errorMsg, setMessage);
                } else {
                  errorMsg = error.response.data.errors;
                  showMessageArea(errorMsg, setMessage);

                  errorStatus = Const.HTTP_STATUS_CODE["500"];
                }
              } else {
                // その他
                window.console.log(error);
                errorStatus = Const.HTTP_STATUS_CODE["500"];
              }

              reject(new Error(errorStatus));
            });
        })
        .catch((error) => {
          window.console.log(error);
          reject(new Error(Const.HTTP_STATUS_CODE["500"]));
        });
    });

  /**
   * 汎用_POST_処理：ログアウト
   *
   * @param setMessage
   * @returns
   */
  public static logout = (setMessage: any): Promise<any> =>
    new Promise((resolve, reject) => {
      axios
        .post("/api/logout")
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let errorMsg: { [index: string]: string[][] };
          let errorStatus: string;

          if (
            error === undefined ||
            error.response === undefined ||
            error.response.data === undefined
          ) {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          } else if (error.response.data.errors !== undefined) {
            errorMsg = error.response.data.errors;
            showMessageArea(errorMsg, setMessage);
            errorStatus = Const.errorType["404"];
          } else if (
            error.response.data.message !== undefined &&
            (error.response.data.message === Const.errorType["401"] ||
              error.response.data.message === Const.errorType["419"])
          ) {
            errorMsg = error.response.data.errors;
            location.href = "/";
            errorStatus = Const.errorType["401"];
            showMessageArea(errorMsg, setMessage);

            return;
          } else {
            window.console.log(error);
            errorStatus = Const.errorType["500"];
          }
          reject(new Error(errorStatus));
        });
    });
}
