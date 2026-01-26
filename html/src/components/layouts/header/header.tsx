import HeaderSystemTitle from "./headerSystemTitle";
import HeaderButton from "./headerButton"
import HeaderUserInfo from "./headerUserInfo"


// ヘッダー用コンポーネント
const Header = (): JSX.Element => {
  
  return (
    <header>
      <div className="header_inner">
        {/* システム名・アイコン */}
        <HeaderSystemTitle />

        {/* 処理選択ボタン */}
        <HeaderButton />

        {/* ログイン中のユーザ―情報・ログアウトボタン */}
        <HeaderUserInfo />
      </div>
    </header>
  );
};

export default Header;