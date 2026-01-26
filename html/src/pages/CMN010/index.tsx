import React from "react";
import { Api, getMessage } from "../../common/api";
import { useNavigate } from "react-router-dom";
import { Button, InputText, MessageArea } from "../../components/common";
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Cmn010StateContainer } from '../../components/containers/cmn010StateContainer';
import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";

// React Use Query ※ useEffect()代わりに useQueryを使用
import { useQuery } from "@tanstack/react-query";

// CSS
import cssCMN010 from "../../scss/pages/CMN010.module.scss";

const CMN010 = (): JSX.Element => {
  /**
   * ステートコンテナーからステートを呼び出す
   * 
   */
  const commonState = CommonStateContainer();                   // 汎用
  const Cmn010State = Cmn010StateContainer();                   // ログイン

  // ヘッダ画像
  const headerImage = "./img/my-table-logo.png";
  const toggleShowPasswordImage = "./img/input-show-password-icon.png";
  const toggleHidePasswordImage = "./img/input-hide-password-icon.png";
  const headerText = import.meta.env.VITE_SYSTEM_NAME;

  // ナビゲーション
  const navigate = useNavigate();

  /**
   * ログイン処理
   *
   */
  const login = () => {
    // メッセージクリア
    commonState.setResultMessage([]);

    // エレメントからデータを取得
    const userElement: HTMLInputElement = document.querySelector(
      "input[name=login-user-id]"
    );
    const passElement: HTMLInputElement = document.querySelector(
      "input[name=login-password]"
    );

    // リクエストデータ
    const request: { user_id: string; user_password: string } = {
      user_id: userElement.value, // ユーザID
      user_password: passElement.value, // パスワード
    };

    // ログイン処理 確認
    Api.login(commonState.setResultMessage, request)
      .then((data: any) => {
        // ログイン成功 : ユーザ情報セット
        localStorage.setItem("userId", data.userInfo.userId);
        localStorage.setItem("userName", data.userInfo.userName);
        localStorage.setItem("affiliationSectionNo", data.userInfo.affiliationSectionNo);
        localStorage.setItem("securityLevel", data.userInfo.securityLevel);
        localStorage.setItem("fixFlg", data.userInfo.fixFlg);

        // お知らせ画面へ遷移
        navigate("/CMN020");
      })
      .catch((error: Error) => {
        // 内部エラーメッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          commonState.setResultMessage(errorInfo);
        }
      });
  };

  // エンターを押した際にログイン実施
  const enterToLogin = (e: any) => {
    if (e.keyCode === 13) {
      login();
    }

    return false;
  };

  // 初期表示_ログイン
  const initLoginForm = () => {
    // メッセージクリア
    commonState.setResultMessage([]);

    // ユーザ情報クリア
    Cmn010State.setInputUserId("");
    Cmn010State.setInputPassword("");
    Cmn010State.setTogglePassword("password");

    // 押下イベントを追加
    const element = document.querySelectorAll("input");
    setTimeout(() => {
      element.forEach((attribute) =>
        attribute.addEventListener("keypress", enterToLogin)
      );
    }, 500);
    return true;
  };

  useQuery({
    queryKey: ["initLoginForm"],
    queryFn: initLoginForm,
  });

  let devLink = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <a style={{ margin: 10, fontSize: 20 }} href="/ReportDev">
        帳票出力開発用ページ
      </a>
      <a style={{ margin: 10, fontSize: 20 }} href="/CMN090">
        DB変換用ページ
      </a>
    </div>
  );

  if (import.meta.env.VITE_DEV_FLG !== "1") {
    devLink = <></>;
  }

  return (
    <>
      <div className={`${cssCMN010.CMN010_container}`}>
        <div className={`${cssCMN010.CMN010_login_container}`}>
          <div className={`${cssCMN010.CMN010_login_title}`}>
            <img
              id="login-system-title-img"
              data-testid="CMN010-1-2"
              className={`${cssCMN010.CMN010_login_img}`}
              src={headerImage}
              alt={headerText}
            />
            <h2
              id="login-system-title-text"
              data-testid="CMN010-1-3"
              className={`${cssCMN010.CMN010_login_txt}`}
            >
              {headerText}
            </h2>
          </div>

          <div className={`${cssCMN010.CMN010_input_area}`}>
            <MessageArea />
            <label
              className={`${cssCMN010.CMN010_input_label}`}
              htmlFor="login-user-id"
              data-testid="CMN010-1-4"
            >
              ID
            </label>
            <div className={`${cssCMN010.CMN010_input_userid_bg_image}`}>
            </div>
            <InputText
              id="login-user-id"
              name="login-user-id"
              data-testid="CMN010-1-5"
              type="text"
              width="100%"
              margin="0px 0px 20px 0px"
              placeholder="ユーザーID"
              contentsFlg={true}
              className={`${cssCMN010.CMN010_input_userid}`}
              value={Cmn010State.inputUserId}
              onChange={({
                target: { value },
              }: React.ChangeEvent<HTMLInputElement>) => {
                Cmn010State.setInputUserId(value);
              }}
            />

            <label
              className={`${cssCMN010.CMN010_input_label}`}
              htmlFor="login-password"
              data-testid="CMN010-1-6"
            >
              パスワード
            </label>
            <div className={`${cssCMN010.CMN010_input_password_toggle}`}>
              <InputText
                id="login-password"
                name="login-password"
                data-testid="CMN010-1-7"
                type={Cmn010State.togglePassword}
                width="100%"
                margin="0px 0px 35px 0px"
                placeholder="パスワード"
                contentsFlg={true}
                className={`${cssCMN010.CMN010_input_password}`}
                value={Cmn010State.inputPassword}
                onChange={({
                  target: { value },
                }: React.ChangeEvent<HTMLInputElement>) => {
                  Cmn010State.setInputPassword(value);
                }}
              />
              <img
                id="login-system-title-img"
                data-testid="CMN010-1-8"
                className={`${cssCMN010.CMN010_input_show_password_toggle}`}
                src={
                  Cmn010State.togglePassword == "text"
                    ? toggleHidePasswordImage
                    : toggleShowPasswordImage
                }
                alt={headerText}
                onClick={() => {
                  const setInputType: string =
                    Cmn010State.togglePassword == "text" ? "password" : "text";
                  Cmn010State.setTogglePassword(setInputType);
                }}
              />
            </div>
            <Button
              title="ログイン"
              data-testid="CMN010-1-9"
              width="100%"
              height="42px"
              color="#4db196"
              margin="0px 0px 15px 0px"
              onClick={() => {
                login();
              }}
            />
          </div>
        </div>
        {/* 開発用メニュー */}
        {devLink}
      </div>
    </>
  );
};

export default CMN010;
