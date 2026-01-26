// メッセージエリア用コンポーネント
import React from 'react';
import { useAtomValue } from 'jotai';
import * as atom from '../../stores/atom';

const createMessageArea = (arrMsg:atom.message[]): JSX.Element => {

  const messageHtml: JSX.Element[] = [];
  let messageClass = '';
  let i = 0;
  Object.keys(arrMsg).forEach((key) => {
    messageClass = `message_area neumorphism item ${arrMsg[i].level}`;
    messageHtml.push(
      <div key={key} className={messageClass} data-testid="MSG-1">
        {arrMsg[i].message}
      </div>,
    );
    i += 1;
  });
  // eslint-disable-next-line
  return <>{messageHtml}</>;
}

// eslint-disable-next-line
export const MessageArea = (): JSX.Element => {
  const arrMsg: atom.message[] = useAtomValue(atom.messageState);
  // eslint-disable-next-line
  return createMessageArea(arrMsg);
};

// eslint-disable-next-line
export const ModalMessageArea = (): JSX.Element => {
  const arrMsg: atom.message[] = useAtomValue(atom.modalMessageState);
  // eslint-disable-next-line
  return createMessageArea(arrMsg);
};
