import React, { useState } from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom, useSetAtom } from "jotai";
import { Button, GridSimpleTable, ConfirmDialog } from "../../components/common";
import { useQuery } from "@tanstack/react-query"
import Footer from '../../components/layouts/footer/footer';
import * as Const from "../../common/const";
import * as AtomSideMenu from "../../stores/atomSideMenu";
import * as AtomInputRegister from "../../stores/atomGridTable";
import * as AtomCommon from "../../stores/atom";

//【ステート】確認ダイアログ
import * as AtomConfirmDialog from "../../stores/atomConfirmDialog";

//【レイアウト】サイドメニュー
import SideMenu from '../../components/layouts/sidemenu';

//【汎用】スタイル
import cssWQM030 from '../../scss/pages/WQM030.module.scss';

//【共通】ローディングコンポネント
import Loading from "../../components/layouts/loading";


const WQM030 = (): JSX.Element => {
    const [useSampleData, setSampleData] = React.useState<any>();
    const [useConfDialogRes, setConfDialogRes] = React.useState<string>('');

    // 確認ダイアログ設定
    const setDialog = useSetAtom(AtomConfirmDialog.confirmDialogAtom);

    // メッセージ
    const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

    const setDataToGrid = async (): Promise<any> => {
        let newRowObj: any = [];
        Api.get("/getInputMenu", setResultMessage)
            .then((data: any) => {
                if (data.menuData.length > 0) {
                    // データ内容
                    data.menuData.forEach(item => {
                        newRowObj.push({
                            check_box: false,
                            input_menu_no: String(item.input_menu_no),
                            input_parent_menu_no: item.input_parent_menu_no,
                            affiliation_section_no: item.affiliation_section_no,
                            input_dsp_no: item.input_dsp_no,
                            input_hierarchy: item.input_hierarchy,
                            input_title: item.input_title,
                            input_order: item.input_order,
                            label_flg: item.label_flg,
                            insert_date: item.insert_date,
                            insert_user: item.insert_user,
                            update_date: item.update_date,
                            update_user: item.update_user,
                        });
                    });

                    // ヘッダデータ
                    const newColumnObj: any = [
                        { id: 1, columnName: 'check_box', columnTitle: '', width: 50, resizeAble: true },
                        { id: 2, columnName: 'input_menu_no', columnTitle: 'メニュー番号', width: 100, resizeAble: true },
                        { id: 3, columnName: 'input_parent_menu_no', columnTitle: '親メニュー番号', width: 100, resizeAble: true },
                        { id: 4, columnName: 'affiliation_section_no', columnTitle: '所属課番号', width: 100, resizeAble: true },
                        { id: 5, columnName: 'input_dsp_no', columnTitle: '入力画面番号', width: 100, resizeAble: true },
                        { id: 6, columnName: 'input_hierarchy', columnTitle: '階層', width: 100, resizeAble: true },
                        { id: 7, columnName: 'input_title', columnTitle: 'タイトル', width: 300, resizeAble: true },
                        { id: 8, columnName: 'input_order', columnTitle: '順序', width: 100, resizeAble: true },
                        { id: 9, columnName: 'label_flg', columnTitle: 'ラベルフラグ', width: 100, resizeAble: true },
                        { id: 10, columnName: 'insert_date', columnTitle: '作成日時', width: 200, resizeAble: true },
                        { id: 11, columnName: 'insert_user', columnTitle: '作成ユーザ', width: 100, resizeAble: true },
                        { id: 12, columnName: 'update_date', columnTitle: '更新日時', width: 200, resizeAble: true },
                        { id: 13, columnName: 'update_user', columnTitle: '更新ユーザ', width: 100, resizeAble: true },
                    ];

                    // 各データのインタフェース
                    const newRowDataInterface: any = [
                        { interfaceName: 'check_box', interfaceType: 'checkbox' },
                        { interfaceName: 'input_menu_no', interfaceType: 'string' },
                        { interfaceName: 'input_parent_menu_no', interfaceType: 'number' },
                        { interfaceName: 'affiliation_section_no', interfaceType: 'text' },
                        { interfaceName: 'input_dsp_no', interfaceType: 'number' },
                        { interfaceName: 'input_hierarchy', interfaceType: 'number' },
                        { interfaceName: 'input_title', interfaceType: 'text' },
                        { interfaceName: 'input_order', interfaceType: 'number' },
                        { interfaceName: 'label_flg', interfaceType: 'number' },
                        { interfaceName: 'insert_date', interfaceType: 'text' },
                        { interfaceName: 'insert_user', interfaceType: 'number' },
                        { interfaceName: 'update_date', interfaceType: 'text' },
                        { interfaceName: 'update_user', interfaceType: 'number' },
                    ]

                    // 引数設定
                    setSampleData({
                        columnData: newColumnObj,
                        rowData: newRowObj,
                        rowInterface: newRowDataInterface
                    });
                }
            })
            .catch((error: Error) => {
                // 内部エラーメッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    setResultMessage(errorInfo);
                }
            });

        return true;
    }

    // GridTableのデータ設定
    const { isLoading, data } = useQuery({
        queryKey: ['dataGrid'],
        queryFn: setDataToGrid,
    })

    // 初期化
    useQuery({
        queryKey: ['initSample'],
        queryFn: () => {
            console.log('initSample');
            setConfDialogRes(null)

            return true;
        }
    });

    return (
        <>
            {/* <SideMenu /> */}
            <div id="WQM010-main-container" className="container_side_menu" style={{ marginBottom: 20, marginTop: 15 }}>
                <h1>共通コンポネントのサンプルまとめ</h1>

                {/* 単純なGridTable */}
                <div
                    className="container_range"
                    style={{ zIndex: '0', backgroundColor: 'white', padding: 20, borderRadius: 10, margin: 15 }}
                >
                    <div style={{ display: 'flow' }}>
                        {isLoading ? (
                            <div
                                style={{
                                    width: 150,
                                    justifySelf: "center",
                                    marginTop: "35dvh",
                                }}
                            >
                                <Loading />
                            </div>
                        ) : (
                            <>
                                <div id="export-report-grid" className={cssWQM030.wqm030_grid_table_panel}>
                                    <span className={`${cssWQM030.wqm030_header_title}`}>単純なGridTable</span>
                                    <GridSimpleTable dataGrid={useSampleData} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 確認ダイアログ */}
                <div
                    className="container_range"
                    style={{ zIndex: '0', backgroundColor: 'white', padding: 20, borderRadius: 10, margin: 15 }}
                >
                    <div style={{ display: 'flow' }}>
                        <div className={`${cssWQM030.wqm030_header_title}`}>確認ダイアログ</div>
                        <Button
                            title="確認ダイアログを開く"
                            width="200px"
                            color="#4db196"
                            className="footer_btn_right"
                            margin="0px 0px 10px 0px"
                            onClick={() => {
                                setDialog((prev) => ({
                                    ...prev,
                                    isOpen: true,
                                    message: getMessage(["WQ-0006Q"]).message,
                                    onConfirm: () => {
                                        setConfDialogRes('確認する')
                                    },
                                    onCancel: () => {
                                        setConfDialogRes('キャンセルする')
                                    },
                                }));
                            }}
                        />

                        <div>確認回答：{useConfDialogRes}</div>
                    </div>
                </div>


                {/* ダウンロード中ダイアログ */}
                <div
                    className="container_range"
                    style={{ zIndex: '0', backgroundColor: 'white', padding: 20, borderRadius: 10, margin: 15 }}
                >
                    <div style={{ display: 'flow' }}>
                        <div className={`${cssWQM030.wqm030_header_title}`}>ダウンロード中ダイアログ</div>
                        <Button
                            title="ダウンロード中ダイアログを開く"
                            width="250px"
                            color="#4db196"
                            className="footer_btn_right"
                            margin="0px 0px 10px 0px"
                            onClick={() => {
                                setDialog((prev) => ({
                                    ...prev,
                                    isOpen: true,
                                    message: 'ダウンロード中・・・(３秒)',
                                    cancelBtnFlg: false,
                                    confirmBtnFlg: false
                                }));
                                setTimeout(() => {
                                    setDialog((prev) => ({
                                        ...prev,
                                        isOpen: false,
                                        message: 'ダウンロード中・・・',
                                        cancelBtnFlg: true,             // 必ず「true」に設定して戻す
                                        confirmBtnFlg: true             // 必ず「true」に設定して戻す
                                    }));
                                }, 3000);
                            }}
                        />

                        <div>確認回答：{useConfDialogRes}</div>
                    </div>
                </div>
            </div>

            {/* 当ページを離れる時、確認ダイアログを表示　*/}
        </>
    );
}

export default WQM030;