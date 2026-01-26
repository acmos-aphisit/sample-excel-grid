// メッセージエリア用コンポーネント
import React from 'react';
import { useAtomValue } from 'jotai';
import * as atom from '../../stores/atom';

const createMessageArea = (arrMsg: atom.message[]): JSX.Element => {
    const messageHtml: JSX.Element[] = [];
    let messageClass = '';
    let i = 0;
    Object.keys(arrMsg).forEach((key: any) => {
        messageClass = `floating_message_area neumorphism item ${arrMsg[i].level}`;
        if (key == 0) {
            messageHtml.push(
                <div key={key} className={messageClass} data-testid="MSG-1">
                    <div className='main_message'>{arrMsg[i].message}</div>
                    <div className='close_message' onClick={() => { closeMessage(i) }}>✖</div>
                </div>,
            );
        } else {
            messageHtml.push(
                <div key={key} className={messageClass} data-testid="MSG-1" style={{ marginTop: (2 * 30) }}>
                    <div className='main_message'>{arrMsg[i].message}</div>
                    <div className='close_message' onClick={() => { closeMessage(i) }}>✖</div>
                </div>,
            );
        }

        i += 1;
    });
    // eslint-disable-next-line
    return <>{messageHtml}</>;
}

const closeMessage = (msgIndex: any) => {
    const arrMsg: atom.message[] = useAtomValue(atom.messageState);
    let curArrMsg = arrMsg;
    curArrMsg.splice(msgIndex, 1);
    createMessageArea(curArrMsg);
};

// eslint-disable-next-line
export const FloatingMessageArea = (): JSX.Element => {
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
