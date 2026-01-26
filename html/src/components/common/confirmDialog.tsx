// 処理実行の確認ダイアログ
import React from 'react';
import * as Const from '../../common/const';

import { InputText, Select } from '../common/';

import { useAtom, useSetAtom } from "jotai";

// サイドメニュスタイル
import cssConfirmMessageModal from '../../scss/common/confirmMessageDialog.module.scss'

// サイドメニューアトム
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

export const ConfirmDialog = () => {
  // 確認ダイアログ設定
  const [dialog, setDialog] = useAtom(AtomConfirmDialog.confirmDialogAtom);

  const handleConfirm = () => {
    dialog.onConfirm();
    setDialog({ ...dialog, isOpen: false });
  };

  const handleCancel = () => {
    dialog.onCancel?.();
    setDialog({ ...dialog, isOpen: false });
  };

  if (!dialog.isOpen) return null;

  return (
    <div
      className={`${cssConfirmMessageModal.confirm_modal}`}
    >
      <div
        className={`${cssConfirmMessageModal.modal_content}`}
        style={{ width: dialog.width }}
      >
        <div
          className={`contents_panel ${cssConfirmMessageModal.panel_modal_content}`}
          style={{ width: dialog.width }}
        >
          {/* 確認メッセージ */}
          <span className={`${cssConfirmMessageModal.modal_confirm_message}`}>{dialog.message}</span>
        </div>
        <div
          className={`${cssConfirmMessageModal.modal_footer}`}
          id="modalFooter">
          <div
            className={`${cssConfirmMessageModal.modal_footer_button}`}
          >
            {/* キャンセルボタン */}
            {(dialog.cancelBtnFlg) &&
              <button
                type="button"
                className={`${cssConfirmMessageModal.close_button}`}
                onClick={handleCancel}
              >
                {dialog.cancelBtnName}
              </button>
            }

            {/* 確定ボタン */}
            {(dialog.confirmBtnFlg) &&
              <button
                type="button"
                className={`${cssConfirmMessageModal.save_button}`}
                onClick={handleConfirm}
              >
                {dialog.confirmBtnName}
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};
