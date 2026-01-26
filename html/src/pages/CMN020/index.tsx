import React from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom } from "jotai";
import { Button, MessageArea } from '../../components/common';

// 共通
import * as Const from "../../common/const";

// useQuery
import { useQuery, useQueryClient } from "@tanstack/react-query";

// CSS
import cssCMN020 from "../../scss/pages/CMN020.module.scss";

// ステート管理
import * as Common from '../../common/common';
import * as AtomCommon from "../../stores/atom";
import * as atomCmn020 from "../../stores/atomCMN020";

// 日時管理ライブラリー
import moment from "moment";

// ローディング
import Loading from "../../components/layouts/loading";

// HTML変換
import parse from 'html-react-parser';

const CMN020Footer = (): JSX.Element => {
    // ページネーションでデータ取得
    const [useFetchPagination, setFetchPagination] = useAtom(atomCmn020.fetchPaginationState);
    const [useResultPagination, setResultPagination] = useAtom(atomCmn020.resultInfoPagination);

    // ページネーションボタン設定
    const [usePaginationHtml, setPaginationHtml] = React.useState<JSX.Element[]>([]);

    // クエリクライアント
    const queryClient = useQueryClient();

    // ページボタンを押下する処理
    const redirectToSelectPage = (page: number) => {
        setFetchPagination({
            ...useFetchPagination,
            curPage: page
        });

        setTimeout(() => {
            // 再取得クエリキー
            queryClient.invalidateQueries({ queryKey: ["fetchInfoData"] });
        }, 100);
    };

    useQuery({
        queryKey: ["paginationAdjust", useResultPagination],
        queryFn: async () => {
            let paginationHtml: JSX.Element[] = [];
            if (useResultPagination.data.length > 0) {
                useResultPagination.links.forEach(link => {
                    // 前へ戻るボタン（<）※ 現在パージは１ぺージの場合非表示に設定
                    if (link.label == "&laquo; Previous") {
                        if (useResultPagination.current_page !== 1) {
                            paginationHtml.push(
                                <Button
                                    data-testid="cmn020-3-1"
                                    name="prev-pagination-btn"
                                    title="<"
                                    width="40px"
                                    margin="0px 0px 0px 5px"
                                    className="footer_btn_pagination"
                                    onClick={() => {
                                        redirectToSelectPage(link.page);
                                    }}
                                />
                            );
                        }
                    } else if (link.label == "Next &raquo;") {
                        if (useResultPagination.current_page !== useResultPagination.last_page) {
                            paginationHtml.push(
                                <Button
                                    data-testid="cmn020-3-4"
                                    name="next-pagination-btn"
                                    title=">"
                                    width="40px"
                                    margin="0px 0px 0px 5px"
                                    className="footer_btn_pagination"
                                    onClick={() => {
                                        redirectToSelectPage(link.page);
                                    }}
                                />
                            );
                        }
                    } else if (link.label == "...") {
                        paginationHtml.push(
                            <Button
                                data-testid="cmn020-3-3"
                                name="continue-pagination-btn"
                                title="..."
                                width="40px"
                                margin="0px 0px 0px 5px"
                                className="footer_btn_continue"
                            />
                        );
                    } else {
                        paginationHtml.push(
                            <Button
                                data-testid="cmn020-3-2"
                                name="number-pagination-btn"
                                title={link.label}
                                width="40px"
                                margin="0px 0px 0px 5px"
                                className={`footer_btn_pagination ${(link.label == String(useResultPagination.current_page)) ? "active" : ""}`}
                                onClick={() => {
                                    redirectToSelectPage(link.page);
                                }}
                            />
                        );
                    }
                });

                setPaginationHtml(paginationHtml);
            }

            return true;
        }
    });

    return (
        <>
            <footer>
                <div className="foot_pagination" style={{ position: "relative" }}>
                    {usePaginationHtml}
                </div>
            </footer>
        </>
    );
};

const CMN020 = (): JSX.Element => {
    // ページネーションでデータ取得
    const [useFetchPagination, setFetchPagination] = useAtom(atomCmn020.fetchPaginationState);
    const [useResultPagination, setResultPagination] = useAtom(atomCmn020.resultInfoPagination);

    // メッセージ用
    const [useMessage, setMessage] = useAtom(AtomCommon.messageState);

    // クエリクライアント
    const queryClient = useQueryClient();

    // お知らせデータを設定
    const [useInfoHtml, setInfoHtml] = React.useState<JSX.Element[]>([]);

    // 採水地点マスタ_検索処理
    const fetchInfoData = async (perPage = useFetchPagination.perPage): Promise<any> => {
        setMessage([]);

        // リクエストデータ
        const request = {
            perPage: perPage,
            curPage: useFetchPagination.curPage
        };

        Api.post("/CMN020/fetchInfoData", setMessage, request)
            .then((data) => {
                if (data.infoData) {
                    setResultPagination(data.infoData);

                    let infoHtml: JSX.Element[] = [];
                    data.infoData.data.forEach((info, key) => {
                        infoHtml.push(
                            <div key={key} className={`${cssCMN020.notice_list_area_container}`}>
                                <div className={`${cssCMN020.info_container}`}>
                                    <span data-testid="cmn020-2-1" className={`${cssCMN020.info_date}`}>{Common.ADToJC(moment(info.info_date).format("YYYY/MM/DD"), "J")}</span>
                                    <div style={{ width: "92%" }} className={`${cssCMN020.info_text_container}`}>
                                        <span data-testid="cmn020-2-2" className={`${cssCMN020.info_text}`}>{parse(info.info_text)}</span>
                                        <div>
                                            {(info.info_link) && (
                                                <Button
                                                    data-testid="cmn020-2-3"
                                                    name="link-content-btn"
                                                    title="リンク"
                                                    width="140px"
                                                    margin="15px 15px 0px 0px"
                                                    className="button_hover_blue_link"
                                                    onClick={() => {
                                                        window.open(info.info_link, '_blank').focus();
                                                    }}
                                                />
                                            )}
                                            {(info.file_path) && (
                                                <Button
                                                    data-testid="cmn020-2-4"
                                                    name="file-content-btn"
                                                    title="添付ファイル"
                                                    width="140px"
                                                    margin="15px 0px 0px 0px"
                                                    className="button_hover_blue_link"
                                                    onClick={() => {
                                                        // window.open(info.file_path, '_blank').focus();

                                                        // ダウンロード全てのファイルタイプ
                                                        const link = document.createElement('a');
                                                        link.href = info.file_path;
                                                        link.setAttribute('download', '');
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    });

                    // お知らせは 0件の場合
                    if (infoHtml.length <= 0) {
                        infoHtml.push(
                            <h3>現在お知らせはありません。</h3>
                        );
                    }

                    setInfoHtml(infoHtml);
                }
            })
            .catch((error: Error) => {
                // 想定外のエラーの場合メッセージを表示
                if (error.message == Const.HTTP_STATUS_CODE["500"]) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0003E"]));
                    setMessage(errorInfo);
                }
            });

        return true;
    };

    // 採水地点マスタ_検索処理
    const { isFetching } = useQuery({
        queryKey: ["fetchInfoData"],
        initialData: async () => {

        },
        queryFn: async () => {
            // 表示件数を設定
            // const setPerPageByHeight: number = (window.innerHeight > 940) ? 8 :
            //     (window.innerHeight > 835) ? 7 :
            //         (window.innerHeight > 745) ? 6 : 5;

            // setFetchPagination({ ...useFetchPagination, perPage: setPerPageByHeight });

            // 検索処理を実施
            await fetchInfoData();
            // setTimeout(async () => {
            //     await fetchInfoData(setPerPageByHeight);
            //     // window.onresize = checkWindowSize;
            // }, 100);
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    // 画面サイズが変わった時、表示件数を調整
    function checkWindowSize() {
        // 表示件数を設定
        const setPerPageByHeight: number = (window.innerHeight > 940) ? 8 :
            (window.innerHeight > 835) ? 7 :
                (window.innerHeight > 745) ? 6 : 5;

        setFetchPagination({ ...useFetchPagination, perPage: setPerPageByHeight });
        setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["fetchInfoData"] });
        }, 100);
    }

    return (
        <>
            {isFetching ? (
                <div
                    data-testid="cmn020-loading-gif"
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
                    <div id="CMN020-main-container" className={`${cssCMN020.CMN020_main_container}`}>
                        <MessageArea />
                        <div
                            className="container_row"
                            style={{
                                justifyContent: "left",
                                margin: "0px 0px 10px 0px",
                            }}
                        >
                            <h2
                                data-testid="CMN020-1"
                                style={{ width: "fit-content", alignContent: "center" }}
                            >
                                {"お知らせ"}
                            </h2>
                        </div>
                        <div id='notice-list-selection' className={`${cssCMN020.CMN020_notice_list_section}`} >
                            {(useInfoHtml) && useInfoHtml}
                        </div>
                        <CMN020Footer />
                    </div>
                </>
            )}
        </>


    );
}

export default CMN020;