import React from "react";
import { Api, getMessage } from "../../common/api";
import { useAtom } from "jotai";
import { MessageArea } from '../../components/common';

// CSS
import cssSPT020 from "../../scss/pages/SPT020.module.scss";

// useQuery
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";
import * as AtomInspectionItemSetting from "../../stores/atomInspectionItemSetting";
import * as atomSpt020 from "../../stores/atomSPT020";

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

const SPT020ManualVideoSelectionArea = (): JSX.Element => {
    // ボタンエリア開閉
    const [useSelectionAreaToggle, setSelectionAreaToggle] = useAtom(atomSpt020.spt020SelectionAreaToggle);
    const targetRef = React.useRef(null);

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            // ヘッダーの高さ
            const selectionHeight: number = document.querySelector("#manual-video-selection").clientHeight;
            if (selectionHeight == 52) {
                // ボタンエリア_縮小
                setSelectionAreaToggle(`${cssSPT020.manual_video_player_area_container_close}`);
            } else {
                // ボタンエリア_拡大
                setSelectionAreaToggle(`${cssSPT020.manual_video_player_area_container}`);
            }
        });

        if (targetRef.current) {
            resizeObserver.observe(targetRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <>
            <div ref={targetRef} id='manual-video-selection' style={{ width: "30%" }}>
                <div className={`${cssSPT020.manual_video_selection_area_container}`}>
                    <SearchArea
                        title="視聴対象選択"
                        titlewidth="140px"
                        titleDiv="180px"
                        toggleFlg={false}
                        btnFlg={false}
                        condition_contents={<SPT020SelectionButtonArea />}
                    />
                </div>
            </div>
        </>
    );
};

// ボタンメニュー
const SPT020SelectionButtonArea = (): JSX.Element => {
    // 動画マニュアルデータ
    const [useManualVideoList, setManualVideoList] = useAtom(atomSpt020.spt020ManualVideoList);
    const [useSelectedManualVideoName, setSelectedManualVideoName] = useAtom(atomSpt020.spt020SelectedManualVideoName);
    const [useSelectedManualVideoPath, setSelectedManualVideoPath] = useAtom(atomSpt020.spt020SelectedManualVideoPath);

    // メッセージ
    const [getResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);

    // 処理実施日時
    const [useDisplayTime, setDisplayTime] = useAtom(AtomInspectionItemSetting.menuLabelDisplayTime);

    // ボタン設定
    const [useBodyHtml, setBodyHtml] = React.useState<JSX.Element[]>([]);

    const setClickedButton = (item) => {
        // 選択動画マニュアルを取得
        setSelectedManualVideoName(null);
        setSelectedManualVideoPath(null);

        // 選択動画マニュアルを設定
        setSelectedManualVideoName(item.movie_name);
        setSelectedManualVideoPath(item.movie_path);

        const selectButtonDiv = document.querySelectorAll("#manual-video-selection-button-list");
        for (let index = 0; index < 4; index++) {
            selectButtonDiv[0].children[index].classList.remove(`${cssSPT020.video_manual_active}`);

            if (selectButtonDiv[0].children[index].id == item.movie_path) {
                selectButtonDiv[0].children[index].classList.add(`${cssSPT020.video_manual_active}`);
            }
        }
    };

    // 初期化
    const fetchManualVideoList = async () => {
        // エラーメッセージ初期化
        setResultMessage([]);
        setBodyHtml([]);

        // 動画マニュアル情報を取得
        Api.get("/fetchManualVideoList", setResultMessage)
            .then((data: any) => {
                if (data.length <= 0) {
                    const errorInfo: AtomCommon.message[] = [];
                    errorInfo.push(getMessage(["WQ-0006E", "動画マニュアル情報"]));
                    setResultMessage(errorInfo);
                } else {
                    let newVideoObj = [];
                    let newBodyHtmlObj = [];
                    data.manualVideoList.forEach(item => {
                        newVideoObj.push({
                            videoName: item.movie_name,
                            videoPath: item.movie_path,
                        });

                        newBodyHtmlObj.push(
                            <button id={item.movie_path} className={`${cssSPT020.SPT020_button_manual_video_button} ${cssSPT020.video_manual}`}
                                onClick={() => {
                                    setClickedButton(item);
                                }}
                            >
                                <h3 className={`${cssSPT020.SPT020_manual_video_title}`}>{item.movie_name}</h3>
                            </button>
                        );
                    });

                    setBodyHtml(newBodyHtmlObj);
                    setManualVideoList(newVideoObj);
                    setDisplayTime(data.displayTime);
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
    };

    useQuery({
        queryKey: ["fetchManualVideoList"],
        queryFn: async () => {
            await fetchManualVideoList();
            return true;
        },
        refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
    });

    return (
        <>
            <div className={`container_row ${cssSPT020.SPT020_form_top_cond_container}`}>
                <div id="manual-video-selection-button-list" className={`${cssSPT020.form_top_cond_input_form}`}>
                    {useBodyHtml}
                </div>
            </div>
        </>
    )

};

// 検査基準マスタ一覧
const SPT020ManualVideoPlayerArea = (): JSX.Element => {
    // 動画マニュアルデータ
    const [useManualVideoList, setManualVideoList] = useAtom(atomSpt020.spt020ManualVideoList);
    const [useSelectedManualVideoName, setSelectedManualVideoName] = useAtom(atomSpt020.spt020SelectedManualVideoName);
    const [useSelectedManualVideoPath, setSelectedManualVideoPath] = useAtom(atomSpt020.spt020SelectedManualVideoPath);

    // ボタンエリア開閉
    const [useSelectionAreaToggle, setSelectionAreaToggle] = useAtom(atomSpt020.spt020SelectionAreaToggle);

    // 動画マニュアル設定
    const [useManualVideoPlayer, setManualVideoPlayer] = React.useState<any>();

    const { isFetching } = useQuery({
        queryKey: ["reloadManualVideo", useSelectedManualVideoPath],
        queryFn: async () => {
            setManualVideoPlayer(useSelectedManualVideoPath);
            return true;
        }
    })

    return (
        <>
            <div id="manual-video-player" className={(useSelectionAreaToggle) ? useSelectionAreaToggle : `${cssSPT020.manual_video_player_area_container}`} style={{ width: "70%" }}>
                <h2 style={{ marginBottom: 18 }}>
                    {(useSelectedManualVideoName) ? useSelectedManualVideoName : "動画マニュアル"}
                </h2>
                {!isFetching && (
                    <>
                        {(useManualVideoPlayer) ? (
                            <video
                                controls
                                height="100%"
                                className={`${cssSPT020.manual_video_player}`}
                            >
                                <source
                                    src={useManualVideoPlayer}
                                    type="video/mp4"
                                />
                                <a href={useManualVideoPlayer}>{useSelectedManualVideoName}</a>
                            </video>
                        ) : (
                            <div style={{ width: "95%", height: "90%", backgroundColor: "#4B4B4B", justifySelf: "anchor-center" }}>

                            </div>
                        )}
                    </>


                )}

            </div>
        </>
    );
};


const SPT020 = (): JSX.Element => {
    // 動画マニュアルデータ
    const [useManualVideoList, setManualVideoList] = useAtom(atomSpt020.spt020ManualVideoList);
    const [useSelectedManualVideoName, setSelectedManualVideoName] = useAtom(atomSpt020.spt020SelectedManualVideoName);
    const [useSelectedManualVideoPath, setSelectedManualVideoPath] = useAtom(atomSpt020.spt020SelectedManualVideoPath);

    // ページから離れる時、キャッシュをクリア
    const queryClient = useQueryClient();
    React.useEffect(() => {
        return () => {
            // ステートクリア
            setManualVideoList([]);
            setSelectedManualVideoName(null);
            setSelectedManualVideoPath(null);

            queryClient.removeQueries({ queryKey: ["fetchManualVideoList"] });
        };
    }, [queryClient]);

    return (
        <>
            <div id="SPT020-manual-video-container" className={`${cssSPT020.SPT020_manual_video_container}`}>
                <MessageArea />
                <div id="SPT020-title-container" className={`${cssSPT020.SPT020_title_container}`}>
                    <div
                        className={`container_row ${cssSPT020.SPT020_main_container_container_row}`}
                    >
                        <h2
                            style={{ width: "fit-content", alignContent: "center" }}
                        >
                            {"動画マニュアル"}
                        </h2>
                    </div>
                </div>
                <div id="SPT020-main-container" className={`${cssSPT020.SPT020_main_container}`}>
                    <SPT020ManualVideoSelectionArea />
                    <SPT020ManualVideoPlayerArea />
                </div>
            </div>

        </>
    );
};

export default SPT020;