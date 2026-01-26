/**
 * ログインステートコンテナー
 * 
 */
import { useAtom } from 'jotai';

//【ステート】ログイン
import * as AtomCmn010 from "../../stores/atomCmn010";

// コンテナーコンポネント
export const Cmn010StateContainer = () => {
      const [inputUserId, setInputUserId] = useAtom(AtomCmn010.userIdState);                        // ユーザID
      const [inputPassword, setInputPassword] = useAtom(AtomCmn010.passwordState);                  // パスワード 
      const [togglePassword, setTogglePassword] = useAtom(AtomCmn010.passwordToggleState);          // パスワード表示・非表示フラグ

    // ステート管理のプロパティ
    const confirmDialog = {
        inputUserId,
        setInputUserId,
        inputPassword,
        setInputPassword,
        togglePassword,
        setTogglePassword
    };

    return confirmDialog;
};