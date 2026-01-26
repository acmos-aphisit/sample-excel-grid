import React from "react";
import { Api, getMessage } from "../../common/api";
import { useLocation } from 'react-router-dom';
import { InputText, Select, Button, MessageArea } from '../../components/common';
import DatePicker from 'react-date-picker';

// CSS
import cssSPT010 from "../../scss/pages/SPT010.module.scss";
import "react-date-picker/dist/DatePicker.css";     // ライブラリー_CSS_react-date-picker
import "react-calendar/dist/Calendar.css";          // ライブラリー_CSS_react-date-picker_カレンダー
import "../../scss/reactDatePicker.scss";

// 日時管理ライブラリー
import moment from "moment";

// useQuery
import { useQuery, useMutation, useQueryClient, useIsFetching } from "@tanstack/react-query";

//【コンポネント】お知らせ情報管理子画面
import { OshiraseManageModal } from "../../components/modals/index";

import * as Const from "../../common/const";
import * as AtomCommon from "../../stores/atom";
import * as AtomOshiraseManage from "../../stores/atomOshiraseManage";
import * as atomSpt010 from "../../stores/atomSPT010";

// ステート管理コンテナー
import { CommonStateContainer } from '../../components/containers/commonStateContainer';
import { Spt010StateContainer } from '../../components/containers/spt010StateContainer';
import { OshiraseManageStateContainer } from '../../components/containers/oshiraseManageStateContainer';

// コンポーネント
import SearchArea from "../../components/layouts/searchAreaComp";

// ローディング
import Loading from "../../components/layouts/loading";

// お知らせの検索エリア
const SPT010SearchArea = ({ commonState, spt010State }): JSX.Element => {
  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();

  return (
    <>
      <div id='spt010-info-data-search' onClick={() => { queryClient.invalidateQueries({ queryKey: ["spt010OshiraseListTabelSize"] }); }}>
        <div className={`${cssSPT010.manage_area_container}`}>
          <SearchArea
            title="検索条件"
            btnHeight="35px"
            condition_contents={<SPT010UnyouSearchCondArea {...{ commonState, spt010State }} />}
            onClick={async () => {
              // 再取得クエリキー
              await spt010State.setOshirase([]);
              await spt010State.setSearchAndSortState({
                ...spt010State.useSearchAndSortState,
                sortColumn: atomSpt010.defaultSearchAndSortState.sortColumn,
                sortOrder: atomSpt010.defaultSearchAndSortState.sortOrder,
              });
              await queryClient.invalidateQueries({ queryKey: ["searchOshiraseData"] });
            }}
          />
        </div>
      </div>
    </>
  );
};

// お知らせの検索条件エリア
const SPT010UnyouSearchCondArea = ({ commonState, spt010State }): JSX.Element => {
  // 検索条件の管理データ
  const [useDelayStyle, setDelayStyle] = React.useState<string>("comp_date_picker_hide");

  React.useEffect(() => {
    setTimeout(() => {
      setDelayStyle("comp_date_picker_show");
    }, 100);
  }, []);

  return (
    <>
      <div className={`container_row ${cssSPT010.SPT010_form_top_cond_container}`}>
        <div className={`${cssSPT010.form_top_cond_input_form}`}>
          {/* 掲載日 */}
          <div className={`${cssSPT010.form_cond_label}`}>掲載日</div>
          <div className={`${cssSPT010.input_form_period}`}>
            {/* <InputDate
              id='input-info-date'
              name='input-info-date'
              dataTestId="spt010-4-1"
              width="120px"
              height="42px"
              margin="0 1em 0 0"
              autoComplete={"off"}
              className={`${cssSPT010.input_date}`}
              value={useSearchAndSortState.infoDate}
              setterInfo={{
                setterName: setSearchAndSortState,
                outputState: { ...useSearchAndSortState },
                seirekiName: "",
                selectedName: "infoDate",
                index: null,
              }}
            /> */}
            {/* 2025/11/19 追加 登録画面と同様カレンダー */}
            <DatePicker
              id="date_from"
              value={spt010State.useSearchAndSortState.infoDate}
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
                spt010State.setSearchAndSortState({ ...spt010State.useSearchAndSortState, infoDate: setDate });
              }}
            />
          </div>
          {/* 備考 */}
          <span className={`${cssSPT010.form_cond_label}`} style={{ marginRight: 27 }}>お知らせ内容</span>
          <div className={`${cssSPT010.input_form_title}`} style={{ width: 280 }}>
            <InputText
              id='input-info-text'
              name='input-info-text'
              dataTestId="spt010-4-2"
              width='100%'
              margin='0'
              max={50}
              contentsFlg={true}
              value={spt010State.useSearchAndSortState.infoText}
              onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                spt010State.setSearchAndSortState(prev => ({ ...prev, infoText: value }));
              }}
            />
          </div>
          {/* 状態 */}
          <span className={`${cssSPT010.form_cond_label}`}>状態</span>
          <div className={`${cssSPT010.input_form_title}`}>
            <Select
              id='input-info-dsp-flg'
              name='input-info-dsp-flg'
              dataTestId="spt010-4-3"
              className="disabled_bg_color"
              value={spt010State.useSearchAndSortState.infoDspFlg}
              width="50%"
              margin='0'
              options={Const.FLG_OPTIONS}
              onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                spt010State.setSearchAndSortState(prev => ({ ...prev, infoDspFlg: value }));
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
};

// 一覧部
const SPT010ListArea = ({ commonState, spt010State, oshiraseManageState }): JSX.Element => {
  // クエリクライアント_他のコンポネントの関数を実行する為
  const queryClient = useQueryClient();

  // お知らせ画面から移動されるか確認
  const search = useLocation().search;
  const query = new URLSearchParams(search);
  const urlUnyouId = query.get('unyouId');

  let searchCondValue = spt010State.useSearchAndSortHiddenState;

  const bodyHtml: JSX.Element[] = [];
  const headHtml: JSX.Element = (
    <>
      <thead>
        <tr>
          {/* お知らせID */}
          <th
            className={`info_id`}
            // onClick={() => {
            //   setSort("info_id");
            // }}
            style={{
              width: "60px",
              height: "35px",
              fontSize: "10pt"
            }}
          >
            <div data-testid="spt010-5-1" style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>No.</div>
          </th>
          {/* 掲載日 */}
          <th
            className={`${cssSPT010.sort_th} info_date`}
            onClick={() => {
              setSort("info_date");
            }}
            style={{
              width: "125px",
              fontSize: "10pt"
            }}
          >
            <div data-testid="spt010-5-2" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>掲載日</div>
          </th>
          {/* お知らせ内容 */}
          <th
            className={`${cssSPT010.sort_th} info_text`}
            onClick={() => {
              setSort("info_text");
            }}
            style={{
              width: "auto",
              fontSize: "10pt"
            }}
          >
            <div data-testid="spt010-5-3" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>お知らせ内容</div>
          </th>
          {/* リンク */}
          <th
            className={`${cssSPT010.sort_th} info_link`}
            onClick={() => {
              setSort("info_link");
            }}
            style={{
              width: "300px",
              fontSize: "10pt"
            }}
          >
            <div data-testid="spt010-5-4" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>リンク</div>
          </th>
          {/* 添付ファイル */}
          <th
            className={`${cssSPT010.sort_th} file_path`}
            onClick={() => {
              setSort("file_path");
            }}
            style={{
              width: "200px",
              fontSize: "10pt"
            }}
          >
            <div data-testid="spt010-5-5" style={{ minWidth: "4em", margin: "0px 10px 0px 0px" }}>添付ファイル</div>
          </th>
          {/* 表示フラグ */}
          <th
            className={`${cssSPT010.sort_th} dsp_flg`}
            onClick={() => {
              setSort("dsp_flg");
            }}
            style={{
              width: "100px",
              fontSize: "10pt"
            }}
          >
            <div data-testid="spt010-5-6" style={{ minWidth: "5em", margin: "0px 10px 0px 0px" }}>表示フラグ</div>
          </th>
          {/* 編集ボタン */}
          <th
            className="select_btn"
            style={{ width: "100px", borderRadius: "0 5px 0 0" }}
          >
            <div style={{ minWidth: "5em" }}></div>
          </th>
        </tr>
      </thead>
    </>
  );

  if (spt010State.useOshirase !== null && spt010State.useOshirase.length > 0) {
    for (let i = 0; i < spt010State.useOshirase.length; i++) {
      let setFileName = spt010State.useOshirase[i].file_path;
      if (setFileName) {
        setFileName = setFileName.split("/").pop();
      }

      bodyHtml.push(
        <tr key={i}>
          {/* <td style={{ height: "40px", textAlign: "center" }}>{useOshirase[i].info_id}</td> */}
          <td style={{ height: "40px", textAlign: "center" }}>{i + 1}</td>
          <td>{moment(spt010State.useOshirase[i].info_date).format("YYYY/MM/DD")}</td>
          <td>{spt010State.useOshirase[i].info_text}</td>
          <td>
            <a href={spt010State.useOshirase[i].info_link} target="_blank">{spt010State.useOshirase[i].info_link}</a>
          </td>
          <td>
            <a target="_blank" href={spt010State.useOshirase[i].file_path}>{setFileName ?? ""}</a>
          </td>
          <td>{(spt010State.useOshirase[i].dsp_flg == "1") ? "表示" : "非表示"}</td>
          <td>
            {/* 閉じるボタン */}
            <Button
              title="編集"
              width="75px"
              className={`table_select_btn`}
              onClick={() => {
                oshiraseManageState.setOshiraseManage({
                  ...oshiraseManageState.useOshiraseManage,
                  dataMode: "編集",
                  infoID: spt010State.useOshirase[i].info_id,
                  infoText: spt010State.useOshirase[i].info_text,
                  infoDate: spt010State.useOshirase[i].info_date,
                  infoLink: spt010State.useOshirase[i].info_link,
                  unyouId: spt010State.useOshirase[i].unyou_id,
                  infoFilePath: spt010State.useOshirase[i].file_path,
                  infoDspFlg: spt010State.useOshirase[i].dsp_flg,
                  currentShowFileName: setFileName,
                });

                // お知らせ管理子画面を開く
                oshiraseManageState.setOshiraseManageModalFlg(true);
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
    let searchCondValue: atomSpt010.searchAndSortInterface = spt010State.useSearchAndSortHiddenState;
    if (column !== spt010State.useSearchAndSortHiddenState.sortColumn) {
      searchCondValue = {
        ...searchCondValue,
        sortColumn: column,
        sortOrder: "DESC",
      };
    } else {
      searchCondValue = {
        ...searchCondValue,
        sortColumn: column,
        sortOrder: (spt010State.useSearchAndSortHiddenState.sortOrder == "ASC") ? "DESC" : "ASC",
      };
    }

    spt010State.setSearchAndSortHiddenState(searchCondValue);

    commonState.setLoadingState(true);

    Api.post("/SPT010/searchOshiraseData", commonState.setResultMessage, searchCondValue)
      .then((result) => {
        spt010State.setOshirase(result.oshirase);
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
      "spt010OshiraseSortClassAdd",
      searchCondValue.sortColumn,
      searchCondValue.sortOrder,
    ],
    queryFn: () => {
      // ソート時クラス切り替え
      if (spt010State.useOshirase !== null && spt010State.useOshirase.length != 0) {
        // ヘッダー押下時の処理
        const headerElem = document.querySelectorAll('#oshiraseLists > thead > tr > th');

        // ソートによる検索が成功した場合のみ、ソートアイコンの表示を切替える
        headerElem.forEach((element) => {
          element.classList.remove('sort_asc');
          element.classList.remove('sort_desc');
        });

        let sortClass = `sort_asc`;
        if (searchCondValue.sortOrder === "DESC") {
          sortClass = `sort_desc`;
        }
        document.querySelector(`#oshiraseLists > thead > tr > th.${searchCondValue.sortColumn}`).classList.add(sortClass);
      }
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  /**
   * 選択している日付に基づき、検査情報を取得
   * 
   */
  const searchOshiraseData = async (): Promise<any> => {
    commonState.setResultMessage([]);
    spt010State.setOshirase([]);
    oshiraseManageState.setDisplayTime(null);

    Api.post("/SPT010/searchOshiraseData", commonState.setResultMessage, spt010State.useSearchAndSortState)
      .then((result) => {
        spt010State.setOshirase(result.oshirase);
        oshiraseManageState.setDisplayTime(result.displayTime);

        // TODO お知らせ画面から移動された場合
        // if (urlUnyouId) {
        //   const unyouFindData = result.oshirase.find((unyou) => unyou.unyou_id == urlUnyouId);
        //   if (unyouFindData) {
        //     let setFileName = unyouFindData.file_path;
        //     if (setFileName) {
        //       setFileName = setFileName.split("/").pop();
        //     }

        //     setOshiraseManage({
        //       ...useOshiraseManage,
        //       dataMode: "編集",
        //       infoID: unyouFindData.unyou_id,
        //       infoText: unyouFindData.unyou_title,
        //       infoDate: unyouFindData.unyou_date,
        //       infoLink: unyouFindData.unyou_memo,
        //       infoFilePath: unyouFindData.file_path,
        //       infoDspFlg: unyouFindData.dsp_flg,
        //       currentShowFileName: setFileName,
        //     });

        //     // お知らせ管理子画面を開く
        //     setOshiraseManageModalFlg(true);
        //   }
        // }
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
    queryKey: ["searchOshiraseData"],
    queryFn: async () => {
      // 検査情報を取得処理
      await searchOshiraseData();
      window.onresize = reportWindowSize;
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  // 一覧表サイズを調整
  const [useOshiraseTableSize, setOshiraseTableSize] = React.useState<any>("290px");
  useQuery({
    queryKey: ["spt010OshiraseListTabelSize", spt010State.useOshirase],
    queryFn: () => {
      // ヘッダーコンテナー
      const containerArea = window.innerHeight;
      const titleArea = document.querySelector("#spt010-info-data-title");        // タイトルエリア
      const searchArea = document.querySelector("#spt010-info-data-search");     // 検索エリア
      const messageArea = (commonState.useResultMessage.length > 0) ? 48 : 0;                       // メッセージエリア
      const footerArea = 90;
      const paddingMargin = (containerArea > 633) ? 50 : 35;
      const calRemainingArea: number = containerArea - (titleArea.clientHeight + searchArea.clientHeight + footerArea + paddingMargin + messageArea);
      setOshiraseTableSize(String(calRemainingArea) + "px");
    }
  });

  // 画面サイズが変わった時、表示件数を調整
  function reportWindowSize() {
    queryClient.invalidateQueries({ queryKey: ["spt010OshiraseListTabelSize"] });
  }

  return (
    <>
      {isFetching ? (
        <div
          data-testid="spt010-loading-gif"
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
          {spt010State.useOshirase !== null && spt010State.useOshirase.length !== 0 && (
            <>
              <div
                id="spt010-list-area"
                className={`${cssSPT010.list_area} ${cssSPT010.sticky_table} ${cssSPT010.child_elements_width_auto}`}
                style={{
                  maxHeight: useOshiraseTableSize,
                }}
              >
                <table
                  id="oshiraseLists"
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

const SPT010Footer = ({ oshiraseManageState }): JSX.Element => {

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
              oshiraseManageState.setOshiraseManage(AtomOshiraseManage.defaultOshiraseManageState);

              // お知らせ管理子画面を開く
              oshiraseManageState.setOshiraseManageModalFlg(true);
            }}
          />
        </div>
      </footer>
    </>
  );
};

const SPT010 = (): JSX.Element => {
  /**
   * ステートコンテナーからステートを呼び出す
   * 
   */
  const commonState = CommonStateContainer();                   // 汎用
  const spt010State = Spt010StateContainer();                   // お知らせ管理
  const oshiraseManageState = OshiraseManageStateContainer()    // お知らせ管理

  // 引数に各ステート管理を組み合わせる
  const comblineProps = {
    // 汎用
    commonState: commonState,
    // お知らせ管理
    spt010State: spt010State,
    oshiraseManageState: oshiraseManageState,
  }

  const isFetching = useIsFetching({ queryKey: ["searchOshiraseData"] });
  const [showDelayedElement, setShowDelayedElement] = React.useState(false);

  // ページから離れる時、キャッシュをクリア
  const queryClient = useQueryClient();
  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ["searchOshiraseData"] });
    };
  }, [queryClient]);

  React.useEffect(() => {
    // 表示延長
    setShowDelayedElement(true);
  }, []);

  return (
    <>
      <div id="SPT010-main-container" className={`${cssSPT010.SPT010_main_container}`}>
        <MessageArea />
        <div
          id="spt010-info-data-title"
          className="container_row"
          style={{
            justifyContent: "left",
            margin: "0px 0px 10px 0px",
          }}
        >
          <h2
            style={{ width: "fit-content", alignContent: "center" }}
          >
            {"お知らせ"}
          </h2>
        </div>
        {(showDelayedElement) && (
          <SPT010SearchArea {...comblineProps} />
        )}
        <SPT010ListArea {...comblineProps} />
        <SPT010Footer {...comblineProps} />
      </div>
      {(oshiraseManageState.useOshiraseManageModalFlg) && <OshiraseManageModal />}

    </>
  );
};

export default SPT010;