// 動画マニュアルサブ画面（モーダル）
import React from 'react';
import * as Const from '../../common/const';

import { InputText, Select } from '../common/';

import { useAtom, useSetAtom } from "jotai";

// サイドメニュスタイル
import cssEditMenuModal from '../../scss/modals/editMenuModal.module.scss'
import { Label } from 'recharts';

// サイドメニューアトム
import * as AtomSideEditMenu from "../../stores/atomSideEditMenuModal";

// ヘッダー
const HeaderArea = (): JSX.Element => {
  return (
    <div
      className={`${cssEditMenuModal.modal_header}`}
    >
      <span>メニュー構成を編集</span>
    </div>
  );
};

// メニュー構成編集
const EditMenuArea = (): JSX.Element => {
  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
  const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

  React.useEffect(() => {
    if (dataSideEditMenuSelected) {
      setMenuEdit(prev => ({...prev, text: dataSideEditMenuSelected.textEdit, parentId: dataSideEditMenuSelected.parentIdEdit }));
    }
  },[])

  return (
    <>

      <div className='contents_panel'>
        <span>メニュー名称：</span>
        <InputText
          id='side-search-menu'
          name='side-search-menu'
          width='100%'
          margin='10px 0 20px 0'
          placeholder='絞り込み検索'
          contentsFlg={true}
          value={dataMenuEdit.text}
          onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
            setMenuEdit(prev => ({ ...prev, text: value }));
          }}
        />
        <span>親名称：</span>
        <Select
          className="disabled_bg_color"
          name="kinnyuu_zokugara"
          labelWidth="120px"
          value={dataMenuEdit.parentId}
          width="100%"
          margin='10px 0 20px 0'
          options={dataSideEditMenuSelected.setSelectParent}
          onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
            setMenuEdit(prev => ({ ...prev, parentId: value }));
          }}
        />
      </div>

    </>
  )
}

// フッター
const FooterArea = (): JSX.Element => {
  // 編集用のメニュー
  const [dataSideEditMenuSelected, setSideEditMenuSelected] = useAtom(AtomSideEditMenu.sideEditMenuState);
  const [dataMenuEdit, setMenuEdit] = useAtom(AtomSideEditMenu.dataMenuEdited);

  const saveEditMenu = () => {
    // メッセージ
    if (!window.confirm('編集を実行してもよろしいですか？')) {
      return;
    }

    setSideEditMenuSelected(prev => ({ ...prev, parentIdEdit: dataMenuEdit.parentId, textEdit: dataMenuEdit.text }));
    setMenuEdit(prev => ({...prev, text: '', parentId: '' })); 
  }

  return (
    <div
      className={`${cssEditMenuModal.modal_footer}`}
      id="modalFooter">
      <div className={`${cssEditMenuModal.modal_footer_button}`}>
        {/* キャンセルボタン */}
        <button
          type="button"
          className={`${cssEditMenuModal.close_button}`}
          onClick={() => {
            setMenuEdit(prev => ({...prev, text: '', parentId: '' }))
            setSideEditMenuSelected(null);
          }}
        >
          キャンセル
        </button>
        {/*  */}
        <button
          type="button"
          className={`${cssEditMenuModal.save_button}`}
          onClick={saveEditMenu}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export const EditMenuModal = (): JSX.Element => {

  return (
    <div
      className='modal'
    >
      <div
        className='modal_content'
      >
        <HeaderArea />
        <div
          className={`contents_panel ${cssEditMenuModal.panel_modal_content}`}
        >
          <EditMenuArea />

        </div>
        <FooterArea />
      </div>
    </div>
  );
};

export default EditMenuModal;
