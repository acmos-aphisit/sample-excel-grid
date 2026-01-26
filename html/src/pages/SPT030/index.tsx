import React from "react";
import { Api, getMessage } from "../../common/api";
import { useLocation } from 'react-router-dom';
import { InputText, Select, Button, MessageArea } from '../../components/common';
import DatePicker from 'react-date-picker';

// CSS
import cssSPT030 from "../../scss/pages/SPT030.module.scss";
import "react-date-picker/dist/DatePicker.css";     // ライブラリー_CSS_react-date-picker
import "react-calendar/dist/Calendar.css";          // ライブラリー_CSS_react-date-picker_カレンダー
import "../../scss/reactDatePicker.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useQueryClient } from "@tanstack/react-query";

//【コンポネント】運用メモ情報管理子画面
import { UnyouMemoManageModal } from "../../components/modals/index";

import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";
import * as AtomUnyouMemoManage from "../../stores/atomUnyouMemoManage";
import * as atomSpt030 from "../../stores/atomSPT030";

import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Spt030StateContainer } from '../../components/containers/spt030StateContainer';
import { UnyouManageStateContainer } from '../../components/containers/unyouManageStateContainer';

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

// ローディング
import Loading from "../../components/layouts/loading";

// 運用メモの検索エリア
const SPT030SearchArea = ({ commonState, spt030State }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    return (
        <>
            <div id='spt030-unyou-data-search' onClick={() => { queryClient.invalidateQueries({ queryKey: ["spt030UnyouMemoListTabelSize"] }); }}>
                <div className={`${cssSPT030.manage_area_container}`}>
                    <SearchArea
                        title="検索条件"
                        btnHeight="35px"
                        condition_contents={<SPT030UnyouSearchCondArea {...{ spt030State }} />}
                        onClick={async () => {
                            // 作成日(開始)より作成日(終了)の方が前の日付である場合は、エラー
                            if ((spt030State.useSearchAndSortState.unyouDateEnd && spt030State.useSearchAndSortState.unyouDateStt) && moment(spt030State.useSearchAndSortState.unyouDateEnd).isBefore(spt030State.useSearchAndSortState.unyouDateStt)) {
                                const errorInfo: AtomCommon.message[] = [];
                                errorInfo.push(getMessage(["WQ-0010W", "作成日"]));
                                commonState.setResultMessage(errorInfo);

                                setTimeout(() => {
                                    queryClient.invalidateQueries({ queryKey: ["spt030UnyouMemoListTabelSize"] });
                                }, 100);
                            } else {
                                // 再取得クエリキー
                                await spt030State.setUnyouMemo([]);
                                await spt030State.setSearchAndSortState({
                                    ...spt030State.useSearchAndSortState,
                                    sortColumn: atomSpt030.defaultSearchAndSortState.sortColumn,
                                    sortOrder: atomSpt030.defaultSearchAndSortState.sortOrder,
                                });
                                await queryClient.invalidateQueries({ queryKey: ["searchUnyouMemoData"] });
                            }
                        }}
                    />
                </div>
            </div>
        </>
    );
};

// 運用メモの検索条件エリア
const SPT030UnyouSearchCondArea = ({ spt030State }): JSX.Element => {
    // 検索条件の管理データ
    const [useDelayStyle, setDelayStyle] = React.useState<string>("comp_date_picker_hide");

    React.useEffect(() => {
        setTimeout(() => {
            setDelayStyle("comp_date_picker_show");
        }, 100);
    }, []);

    return (
        <>
            <div className={`container_row ${cssSPT030.SPT030_form_top_cond_container}`}>
                <div className={`${cssSPT030.form_top_cond_input_form}`}>
                    {/* タイトル */}
                    <span className={`${cssSPT030.form_cond_label}`}>タイトル</span>
                    <div className={`${cssSPT030.input_form_title}`}>
                        <InputText
                            id='input-unyou-title'
                            name='input-unyou-title'
                            width='100%'
                            margin='0'
                            max={50}
                            contentsFlg={true}
                            value={spt030State.useSearchAndSortState.unyouTitle}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                spt030State.setSearchAndSortState(prev => ({ ...prev, unyouTitle: value }));
                            }}
                        />
                    </div>
                    {/* 作成日 */}
                    <div className={`${cssSPT030.form_cond_label}`}>作成日</div>
                    <div className={`${cssSPT030.input_form_period}`}>
                        {/* <InputDate
                            id='input-unyou-date-stt'
                            name='input-unyou-date-stt'
                            width="120px"
                            height="42px"
                            margin="0 1em 0 0"
                            autoComplete={"off"}
                            className={`${cssSPT030.input_date}`}
                            value={useSearchAndSortState.unyouDateStt}
                            setterInfo={{
                                setterName: setSearchAndSortState,
                                outputState: { ...useSearchAndSortState },
                                seirekiName: "",
                                selectedName: "unyouDateStt",
                                index: null,
                            }}
                        /> */}
                        <DatePicker
                            id="date_from"
                            value={spt030State.useSearchAndSortState.unyouDateStt}
                            showLeadingZeros={true}
                            openCalendarOnFocus={true}
                            closeCalendar={true}
                            calendarIcon={null}
                            className={useDelayStyle}
                            calendarProps={{
                                'calendarType': "gregory"
                            }}
                            minDate={new Date("1000/01/01")}
                            maxDate={new Date("9999/12/31")}
                            onChange={(value: any) => {
                                const setDate = (value) ? moment(value).format("YYYY/MM/DD") : null;
                                spt030State.setSearchAndSortState({ ...spt030State.useSearchAndSortState, unyouDateStt: setDate });
                            }}
                        />

                        <span
                            style={{ margin: "0 1em 0 1em", fontSize: "1em", width: "auto", alignContent: "center" }}
                        >
                            ～
                        </span>

                        {/* <InputDate
                            id='input-unyou-date-end'
                            name='input-unyou-date-end'
                            width="120px"
                            height="42px"
                            margin="0 30px 0 0"
                            autoComplete={"off"}
                            className={`${cssSPT030.input_date}`}
                            value={useSearchAndSortState.unyouDateEnd}
                            setterInfo={{
                                setterName: setSearchAndSortState,
                                outputState: { ...useSearchAndSortState },
                                seirekiName: "",
                                selectedName: "unyouDateEnd",
                                index: null,
                            }}
                        /> */}
                        <DatePicker
                            id="date_from"
                            value={spt030State.useSearchAndSortState.unyouDateEnd}
                            showLeadingZeros={true}
                            openCalendarOnFocus={true}
                            closeCalendar={true}
                            calendarIcon={null}
                            // clearIcon={null}
                            className={useDelayStyle}
                            calendarProps={{
                                'calendarType': "gregory"
                            }}
                            minDate={new Date("1000/01/01")}
                            maxDate={new Date("9999/12/31")}
                            onChange={(value: any) => {
                                const setDate = (value) ? moment(value).format("YYYY/MM/DD") : null;
                                spt030State.setSearchAndSortState({ ...spt030State.useSearchAndSortState, unyouDateEnd: setDate });
                            }}
                        />
                    </div>
                </div>
                <div className={`${cssSPT030.form_top_cond_input_form}`}>
                    {/* メモ */}
                    <span className={`${cssSPT030.form_cond_label}`} style={{ marginRight: 42 }}>メモ</span>
                    <div className={`${cssSPT030.input_form_title}`}>
                        <InputText
                            id='input-unyou-memo'
                            name='input-unyou-memo'
                            width='100%'
                            margin='0'
                            max={50}
                            contentsFlg={true}
                            value={spt030State.useSearchAndSortState.unyouMemo}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                spt030State.setSearchAndSortState(prev => ({ ...prev, unyouMemo: value }));
                            }}
                        />
                    </div>
                    {/* 備考 */}
                    <span className={`${cssSPT030.form_cond_label}`} style={{ marginRight: 27 }}>備考</span>
                    <div className={`${cssSPT030.input_form_title}`} style={{ width: 280 }}>
                        <InputText
                            id='input-unyou-bikou'
                            name='input-unyou-bikou'
                            width='100%'
                            margin='0'
                            max={50}
                            contentsFlg={true}
                            value={spt030State.useSearchAndSortState.unyouBikou}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                spt030State.setSearchAndSortState(prev => ({ ...prev, unyouBikou: value }));
                            }}
                        />
                    </div>
                    {/* 状態 */}
                    <span className={`${cssSPT030.form_cond_label}`}>状態</span>
                    <div className={`${cssSPT030.input_form_title}`}>
                        <Select
                            id='input-unyou-dsp-flg'
                            name='input-unyou-dsp-flg'
                            className="disabled_bg_color"
                            value={spt030State.useSearchAndSortState.unyouDspFlg}
                            width="50%"
                            margin='0'
                            options={Const.FLG_OPTIONS}
                            onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                                spt030State.setSearchAndSortState(prev => ({ ...prev, unyouDspFlg: value }));
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    )
};

// 一覧部
const SPT030ListArea = ({ commonState, spt030State, unyouManageState }): JSX.Element => {
    // クエリクライアント_他のコンポネントの関数を実行する為
    const queryClient = useQueryClient();

    // お知らせ画面から移動されるか確認
    const search = useLocation().search;
    const query = new URLSearchParams(search);
    const urlUnyouId = query.get('unyouId');

    let searchCondValue = spt030State.useSearchAndSortHiddenState;

    const bodyHtml: JSX.Element[] = [];
    const headHtml: JSX.Element = (
        <>
            <thead>
                <tr>
                    {/* 運用ID */}
                    <th
                        className={`unyou_id`}
                        // onClick={() => {
                        //     setSort("unyou_id");
                        // }}
                        style={{
                            width: "60px",
                            height: "35px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-1" style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>No.</div>
                    </th>
                    {/* タイトル */}
                    <th
                        className={`${cssSPT030.sort_th} unyou_title`}
                        onClick={() => {
                            setSort("unyou_title");
                        }}
                        style={{
                            width: "200px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-2" style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>タイトル</div>
                    </th>
                    {/* 作成日 */}
                    <th
                        className={`${cssSPT030.sort_th} unyou_date`}
                        onClick={() => {
                            setSort("unyou_date");
                        }}
                        style={{
                            width: "125px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-3" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>作成日</div>
                    </th>
                    {/* メモ */}
                    <th
                        className={`${cssSPT030.sort_th} unyou_memo`}
                        onClick={() => {
                            setSort("unyou_memo");
                        }}
                        style={{
                            width: "350px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-4" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>メモ</div>
                    </th>
                    {/* 備考 */}
                    <th
                        className={`${cssSPT030.sort_th} unyou_bikou`}
                        onClick={() => {
                            setSort("unyou_bikou");
                        }}
                        style={{
                            width: "350px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-5" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>備考</div>
                    </th>
                    {/* 添付ファイル */}
                    <th
                        className={`${cssSPT030.sort_th} file_path`}
                        onClick={() => {
                            setSort("file_path");
                        }}
                        style={{
                            width: "150px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-6" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>添付ファイル</div>
                    </th>
                    {/* 表示フラグ */}
                    <th
                        className={`${cssSPT030.sort_th} dsp_flg`}
                        onClick={() => {
                            setSort("dsp_flg");
                        }}
                        style={{
                            width: "100px",
                            fontSize: "10pt"
                        }}
                    >
                        <div data-testid="spt030-5-7" style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>表示フラグ</div>
                    </th>
                    {/* 編集ボタン */}
                    <th
                        className="select_btn"
                        style={{ width: "auto", borderRadius: "0 5px 0 0" }}
                    >
                        <div style={{ minWidth: "5em" }}></div>
                    </th>
                </tr>
            </thead>
        </>
    );

    if (spt030State.useUnyouMemo !== null && spt030State.useUnyouMemo?.length > 0) {
        for (let i = 0; i < spt030State.useUnyouMemo.length; i++) {
            let setFileName = spt030State.useUnyouMemo[i].file_path;
            if (setFileName) {
                setFileName = setFileName.split("/").pop();
            }

            bodyHtml.push(
                <tr key={i}>
                    {/* <td style={{ height: "40px", textAlign: "center" }}>{useUnyouMemo[i].unyou_id}</td> */}
                    <td style={{ height: "40px", textAlign: "center" }}>{i + 1}</td>
                    <td>{spt030State.useUnyouMemo[i].unyou_title}</td>
                    <td>{moment(spt030State.useUnyouMemo[i].unyou_date).format("YYYY/MM/DD")}</td>
                    <td>{spt030State.useUnyouMemo[i].unyou_memo}</td>
                    <td>{spt030State.useUnyouMemo[i].unyou_bikou}</td>
                    <td>
                        <a target="_blank" href={spt030State.useUnyouMemo[i].file_path}>{setFileName ?? ""}</a>
                    </td>
                    <td>{(spt030State.useUnyouMemo[i].dsp_flg == "1") ? "表示" : "非表示"}</td>
                    <td>
                        {/* 閉じるボタン */}
                        <Button
                            title="編集"
                            width="75px"
                            className={`table_select_btn`}
                            onClick={() => {
                                unyouManageState.setUnyouMemoManage({
                                    ...unyouManageState.useUnyouMemoManage,
                                    dataMode: "編集",
                                    unyouID: spt030State.useUnyouMemo[i].unyou_id,
                                    unyouTitle: spt030State.useUnyouMemo[i].unyou_title,
                                    unyouDate: spt030State.useUnyouMemo[i].unyou_date,
                                    unyouMemo: spt030State.useUnyouMemo[i].unyou_memo,
                                    unyouBikou: spt030State.useUnyouMemo[i].unyou_bikou,
                                    unyouFilePath: spt030State.useUnyouMemo[i].file_path,
                                    unyouDspFlg: spt030State.useUnyouMemo[i].dsp_flg,
                                    currentShowFileName: setFileName,
                                });

                                // 運用メモ管理子画面を開く
                                unyouManageState.setUnyouMemoManageModalFlg(true);
                            }}
                        />
                    </td>
                </tr>
            );
        }
    }

    /**
     * ソート用条件設定
     * 
     * @param column 
     */
    const setSort = (column: string): void => {
        commonState.setResultMessage([]);
        let searchCondValue: atomSpt030.searchAndSortInterface = spt030State.useSearchAndSortHiddenState;
        if (column !== spt030State.useSearchAndSortHiddenState.sortColumn) {
            searchCondValue = {
                ...searchCondValue,
                sortColumn: column,
                sortOrder: "DESC",
            };
        } else {
            searchCondValue = {
                ...searchCondValue,
                sortColumn: column,
                sortOrder: (spt030State.useSearchAndSortHiddenState.sortOrder == "ASC") ? "DESC" : "ASC",
            };
        }

        spt030State.setSearchAndSortHiddenState(searchCondValue);
        commonState.setLoadingState(true);

        Api.post("/SPT030/searchUnyouMemoData", commonState.setResultMessage, searchCondValue)
            .then((result) => {
                spt030State.setUnyouMemo(result.unyouMemo);
            })
            .catch((error: Error) => {
                // 想定外のエラーの場合メッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    commonState.setResultMessage(errorInfo);
                }
            });
    };

    // ヘッダのソートアイコンを調整
    useQuery({
        queryKey: [
            "spt030UnyouMemoSortClassAdd",
            searchCondValue.sortColumn,
            searchCondValue.sortOrder,
        ],
        queryFn: () => {
            // ソート時クラス切り替え
            if (spt030State.useUnyouMemo !== null && spt030State.useUnyouMemo?.length != 0) {
                // ヘッダー押下時の処理
                const headerElem = document.querySelectorAll('#unyouMemoLists > thead > tr > th');

                // ソートによる検索が成功した場合のみ、ソートアイコンの表示を切替える
                headerElem.forEach((element) => {
                    element.classList.remove('sort_asc');
                    element.classList.remove('sort_desc');
                });

                let sortClass = `sort_asc`;
                if (searchCondValue.sortOrder === "DESC") {
                    sortClass = `sort_desc`;
                }
                document.querySelector(`#unyouMemoLists > thead > tr > th.${searchCondValue.sortColumn}`).classList.add(sortClass);
            }
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    /**
     * 選択している日付に基づき、検査情報を取得
     * 
     */
    const [useCheckOpenLink, setCheckOpenLink] = React.useState<boolean>(false);
    const searchUnyouMemoData = async (): Promise<any> => {
        commonState.setResultMessage([]);
        spt030State.setUnyouMemo([]);
        unyouManageState.setDisplayTime(null);

        Api.post("/SPT030/searchUnyouMemoData", commonState.setResultMessage, spt030State.useSearchAndSortState)
            .then((result) => {
                spt030State.setUnyouMemo(result.unyouMemo);
                unyouManageState.setDisplayTime(result.displayTime);

                // お知らせ画面から移動された場合
                if (urlUnyouId && !useCheckOpenLink) {
                    const unyouFindData = result.unyouMemo.find((unyou) => unyou.unyou_id == urlUnyouId);
                    if (unyouFindData) {
                        spt030State.setUnyouMemo([unyouFindData]);
                        let setFileName = unyouFindData.file_path;
                        if (setFileName) {
                            setFileName = setFileName.split("/").pop();
                        }

                        unyouManageState.setUnyouMemoManage({
                            ...unyouManageState.useUnyouMemoManage,
                            dataMode: "参照",
                            unyouID: unyouFindData.unyou_id,
                            unyouTitle: unyouFindData.unyou_title,
                            unyouDate: unyouFindData.unyou_date,
                            unyouMemo: unyouFindData.unyou_memo,
                            unyouBikou: unyouFindData.unyou_bikou,
                            unyouFilePath: unyouFindData.file_path,
                            unyouDspFlg: unyouFindData.dsp_flg,
                            currentShowFileName: setFileName,
                        });

                        // 運用メモ管理子画面を開く
                        unyouManageState.setUnyouMemoManageModalFlg(true);

                        // リンクを開くフラグを設定
                        setCheckOpenLink(true);
                    } else {
                        const errorInfo: AtomCommon.message[] = [];
                        errorInfo.push(getMessage(["WQ-0006E", "参照データ"]));
                        commonState.setResultMessage(errorInfo);
                    }
                }
            })
            .catch((error: Error) => {
                // 想定外のエラーの場合メッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    commonState.setResultMessage(errorInfo);
                }
            });
    };

    // 選択している日付に基づき、検査情報を取得
    const { isFetching } = useQuery({
        queryKey: ["searchUnyouMemoData"],
        queryFn: async () => {
            // 検査情報を取得処理
            await searchUnyouMemoData();
            window.onresize = reportWindowSize;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    // 一覧表サイズを調整
    const [useUnyouMemoTableSize, setUnyouMemoTableSize] = React.useState<any>("290px");
    useQuery({
        queryKey: ["spt030UnyouMemoListTabelSize", spt030State.useUnyouMemo],
        queryFn: () => {
            // ヘッダーコンテナー
            const containerArea = window.innerHeight;
            const titleArea = document.querySelector("#spt030-unyou-data-title");       // タイトルエリア
            const searchArea = document.querySelector("#spt030-unyou-data-search");     // 検索エリア
            const messageArea = (commonState.useResultMessage.length > 0) ? 48 : 0;                       // メッセージエリア
            const footerArea = 45;
            const paddingMargin = (containerArea > 633) ? 90 : 35;
            const calRemainingArea: number = containerArea - (titleArea.clientHeight + searchArea.clientHeight + footerArea + paddingMargin + messageArea);
            setUnyouMemoTableSize(String(calRemainingArea) + "px");
        }
    });

    // 画面サイズが変わった時、表示件数を調整
    function reportWindowSize() {
        queryClient.invalidateQueries({ queryKey: ["spt030UnyouMemoListTabelSize"] });
    }

    return (
        <>
            {isFetching ? (
                <div
                    data-testid="spt030-loading-gif"
                    style={{
                        width: 100,
                        justifySelf: "center",
                        marginTop: "10dvh",
                    }}
                >
                    <Loading />
                </div>
            ) : (
                <>
                    {spt030State.useUnyouMemo !== null && spt030State.useUnyouMemo?.length !== 0 && (
                        <>
                            <div
                                id="spt030-list-area"
                                className={`${cssSPT030.list_area} ${cssSPT030.sticky_table} ${cssSPT030.child_elements_width_auto}`}
                                style={{
                                    maxHeight: useUnyouMemoTableSize,
                                }}
                            >
                                <table
                                    id="unyouMemoLists"
                                    className="parent neumorphic"
                                    style={{ minWidth: "100%", zIndex: "0" }}
                                >
                                    {headHtml}
                                    <tbody style={{ fontSize: "9pt" }}>{bodyHtml}</tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}

        </>
    );
};

const SPT030Footer = ({ unyouManageState }): JSX.Element => {

    return (
        <>
            <footer>
                <div className="foot_nav">
                    <Button
                        title="新規登録"
                        width="100px"
                        margin="0px 0px 0px 15px"
                        className="footer_btn_right button_hover_green"
                        onClick={() => {
                            // データクリア
                            unyouManageState.setUnyouMemoManage(AtomUnyouMemoManage.defaultUnyouMemoManageState);

                            // 運用メモ管理子画面を開く
                            unyouManageState.setUnyouMemoManageModalFlg(true);
                        }}
                    />
                </div>
            </footer>
        </>
    );
};

const SPT030 = (): JSX.Element => {
    /**
     * ステートコンテナーからステートを呼び出す
     * 
     */
    const commonState = CommonStateContainer();                   // 汎用
    const spt030State = Spt030StateContainer();                   // 運用メモ管理
    const unyouManageState = UnyouManageStateContainer();               // 運用メモ管理子画面

    // 引数に各ステート管理を組み合わせる
    const comblineProps = {
        // 汎用
        commonState: commonState,
        // 運用メモ
        spt030State: spt030State,
        unyouManageState: unyouManageState,
    }

    // ページから離れる時、キャッシュをクリア
    const queryClient = useQueryClient();
    React.useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ["searchUnyouMemoData"] });
        };
    }, [queryClient]);

    return (
        <>
            <div id="SPT030-main-container" className={`${cssSPT030.SPT030_main_container}`}>
                <MessageArea />
                <div
                    id="spt030-unyou-data-title"
                    className="container_row"
                    style={{
                        justifyContent: "left",
                        margin: "0px 0px 10px 0px",
                    }}
                >
                    <h2
                        style={{ width: "fit-content", alignContent: "center" }}
                    >
                        {"運用メモ"}
                    </h2>
                </div>
                <SPT030SearchArea {...comblineProps} />
                <SPT030ListArea {...comblineProps} />
                <SPT030Footer {...comblineProps} />
            </div>
            {(unyouManageState.useUnyouMemoManageModalFlg) && <UnyouMemoManageModal />}

        </>
    );
};

export default SPT030;