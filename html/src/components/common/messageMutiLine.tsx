// メッセージエリア用コンポーネント
import React from 'react';
import { useAtomValue } from 'jotai';
import * as atom from '../../stores/atom';

const createMessageArea = (arrMsg: atom.message[]): JSX.Element => {
  const [useShowAllToggle, setShowAllToggle] = React.useState<any>("fit-content");

  const messageHtml: JSX.Element[] = [];
  let messageClass = '';
  let i = 0;
  Object.keys(arrMsg).forEach((key) => {
    messageClass = `message_muti_line_area neumorphism item ${arrMsg[i].level}`;
    messageHtml.push(
      <div key={key} data-testid="MSG-1" style={{ height: 23 }}>
        {(arrMsg.length > 1) ? "・" : ""}{arrMsg[i].message}
      </div>,
    );
    i += 1;
  });

  const showAllOrHideToggle = () => {
    if (useShowAllToggle == "38px") {
      setShowAllToggle("fit-content");
    } else {
      setShowAllToggle("38px");
    }
  }

  return (arrMsg.length <= 0) ? (<></>) : (
    <>
      {(arrMsg.length == 1) ? (
        <div>
          <div className={messageClass} data-testid="MSG-1" style={{ height: "38px" }}>
            {messageHtml}
          </div>
        </div>
      ) : (
        <div className={messageClass} data-testid="MSG-1" style={{ height: useShowAllToggle }}>
          {(arrMsg.length > 1) && (
            <div className='msg_title_btn'>
              <div style={{ height: 25 }}>
                {"入力した値にエラーがあります。(" + arrMsg.length + "件)"}
              </div>
              <div className='msg_show_all_error' >
                <span onClick={showAllOrHideToggle}>
                  {(useShowAllToggle == "38px") ? "すべて表示する" : "閉じる"}
                </span>
              </div>
            </div>
          )}

          {messageHtml}
        </div>
      )
      }
    </>
  );

}

// 複数件のエラーメッセージエリア
export const MessageMutiLineArea = (): JSX.Element => {
  const arrMsg: atom.message[] = useAtomValue(atom.messageMutiLineState);

  return createMessageArea(arrMsg);
};
