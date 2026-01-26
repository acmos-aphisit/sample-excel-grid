import React, { useState } from "react";
import { Api, getMessage } from "../../../common/api";
import { useNavigate } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import {
  Button,
  InputText,
  MessageArea,
} from "../../../components/common/index";
import * as Const from "../../../common/const";
import * as AtomCommon from "../../../stores/atom";

// ヘッダー用コンポーネント
const HeaderUserInfo = (): JSX.Element => {
  const userInfoName: string = localStorage.getItem("userName") ?? "";

  //
  const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
  const navigate = useNavigate();

  const headerImage = "./img/header_user_icon.png";

  /**
   * ログイン処理
   *
   */
  const logout = () => {
    // メッセージクリア
    setResultMessage([]);

    // ログイン処理 確認
    Api.logout(setResultMessage)
      .then((data: any) => {
        // ログアウト成功 : ユーザ情報リセット
        localStorage.clear();

        // お知らせ画面へ遷移
        navigate("/login");
      })
      .catch((error: Error) => {
        // 内部エラーメッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setResultMessage(errorInfo);
        }
      });
  };

  return (
    <div data-testid="HDR-3-1" className="header_user_info">
      <div data-testid="HDR-3-1-1" className="header_user_info_label">
        <img data-testid="HDR-3-1-1-1" src={headerImage} alt="ユーザー：" />
        <span data-testid="HDR-3-1-1-2" style={{ fontWeight: "normal" }}>
          {userInfoName}
        </span>
      </div>
      <Button
        title="ログアウト"
        dataTestId="HDR-3-1-2"
        width="110px"
        height="42px"
        className="header_button_logout"
        onClick={() => {
          logout();
        }}
      />
    </div>
  );
};

export default HeaderUserInfo;
