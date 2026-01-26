// トレンド画面（折れ線グラフ）
import React, { useEffect } from "react";
import * as Const from "../../common/const";
import { Api, getMessage } from "../../common/api";
import { SelectOptions } from "../../common/interface";

import { InputText, Select, ModalMessageArea } from "../common/";

import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { Button, CustomLineChart } from "../../components/common";
import Loading from "../../components/layouts/loading";

// css
import cssChart from "../../scss/modals/trendModal.module.scss";

// ストア
import * as AtomCommon from "../../stores/atom";
import * as AtomTrend from "../../stores/atomTrendModal";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import path from "path";
import { selectOptions } from "@testing-library/user-event/dist/cjs/utility/selectOptions.js";

// ヘッダー
const HeaderArea = (): JSX.Element => {
  return (
    <div className={`${cssChart.contents_header}`}>
      <span>トレンド</span>
    </div>
  );
};

const ItemArea = (): JSX.Element => {
  const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState); // 処理結果メッセージ
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  );
  const [lineData, setLineData] = useAtom(AtomTrend.lineDataState);
  const [lineLayout, setLineLayout] = useAtom(AtomTrend.lineLayoutState);
  const trendItemSelect = useAtomValue(AtomTrend.trendItemSelect);

  const pathname = useLocation().pathname;
  return (
    <>
      {pathname !== "/WQM010" ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#1c64d4",
                margin: "0 5px 0 25px",
                fontSize: "20px",
              }}
            >
              検査項目
            </span>
            <Select
              name="item_select"
              labelWidth="120px"
              width="180px"
              margin="10px 0 10px 0"
              defaultOption={true}
              options={
                trendItemSelect !== null
                  ? trendItemSelect
                  : AtomTrend.defautlItemSelect
              }
              value={trendSearchCond.item_no}
              onChange={({
                target: { value },
              }: React.ChangeEvent<HTMLInputElement>) => {
                if (value == "") {
                  setLineData([]);
                  setTrendSearchCond({
                    ...trendSearchCond,
                    item_name: "",
                    item_no: "",
                  });
                  return;
                }
                if (trendItemSelect !== null) {
                  trendItemSelect.forEach((element) => {
                    if (element.value == value) {
                      setTrendSearchCond({
                        ...trendSearchCond,
                        item_name: element.label,
                        item_no: element.value,
                      });
                      return;
                    }
                  });
                }
              }}
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

// メニュー構成編集
const ChartArea = (): JSX.Element => {
  const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState); // 処理結果メッセージ
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  );
  const [lineData, setLineData] = useAtom(AtomTrend.lineDataState);
  const [lineLayout, setLineLayout] = useAtom(AtomTrend.lineLayoutState);
  const trendItemSelect = useAtomValue(AtomTrend.trendItemSelect);

  const pathname = useLocation().pathname;

  // 仮セレクトボックス選択肢
  // 検索画面が見れるようになり次第、画面の項目から作成するような処理を追記する
  const testOption: SelectOptions[] = [
    {
      label: "雨量",
      value: "1040",
    },
    {
      label: "気温",
      value: "5000",
    },
    {
      label: "取水口水位",
      value: "1060",
    },
    {
      label: "ジャーテスト",
      value: "1280",
    },
    {
      label: "1系前塩素注入率",
      value: "1380",
    },
    {
      label: "上水前塩素注入率",
      value: "1420",
    },
  ];

  return (
    <>
      {lineData == null || lineData.length == 0 ? (
        <></>
      ) : (
        <CustomLineChart
          lineData={lineData}
          lineType={"linear"}
          lineLayoutList={lineLayout}
          LineChartMargin={{
            top: 5,
            right: 30,
            left: 50,
            bottom: 20,
          }}
          XAxisAngle={-55}
          XAxisHeight={70}
          YAxisLabel={trendSearchCond.item_name}
          dy={40}
          verticalAlign="top"
          tick={{ fontSize: 15 }}
          connectNulls={true}
          ContainerHeight={pathname !== "/WQM010" ? "87%" : "100%"}
        />
      )}
    </>
  );
};

// フッター
const FooterArea = (): JSX.Element => {
  // 処理結果メッセージ
  // const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
  const [modalMessage, setModalMessage] = useAtom(AtomCommon.modalMessageState);
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  );
  const [lineData, setLineData] = useAtom(AtomTrend.lineDataState);
  const [lineLayout, setLineLayout] = useAtom(AtomTrend.lineLayoutState);
  const isOpen = useSetAtom(AtomTrend.isOpen);

  const pathname = useLocation().pathname;
  const queryClient = useQueryClient();

  const exportTrendData = async (): Promise<any> => {
    Api.postBuffer(pathname + "/exportTrend", setModalMessage, trendSearchCond)
      .then((result: ArrayBuffer) => {
        const blob = new Blob([result], {
          // type: "application/octet-binary",
          type: "Content-Type:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        const now = new Date();

        const yyyy = now.getFullYear();
        const mon = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        const fileName = `トレンド_${trendSearchCond.item_name}_${yyyy}${mon}${dd}_${hh}${min}${ss}_.xlsx`;
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setModalMessage(errorInfo);
        }
      });
  };

  useQuery({
    queryKey: ["exportTrendData"],
    queryFn: exportTrendData,
    enabled: false,
  });

  return (
    <div className={`${cssChart.contents_footer}`}>
      <Button
        title="Excelファイル出力"
        width="200px"
        margin="0px 0px 0px 15px"
        className={`footer_btn_right ${cssChart.export_btn}`}
        disabled={trendSearchCond.item_no == "" ? true : false}
        onClick={() => {
          queryClient.prefetchQuery({ queryKey: ["exportTrendData"] });
          // exportTrendData();
        }}
      />
      <Button
        title="閉じる"
        width="150px"
        color="#fff"
        margin="0px 0px 0px 15px"
        className={`footer_btn_right ${cssChart.close_btn}`}
        onClick={() => {
          isOpen(false);
          setLineData([]);
          setLineLayout([]);
          setModalMessage([]);
          setTrendSearchCond({
            ...trendSearchCond,
            date_from: AtomTrend.defaultTrendSearchCond.date_from,
            date_to: AtomTrend.defaultTrendSearchCond.date_to,
            item_no: AtomTrend.defaultTrendSearchCond.item_no,
            item_name: AtomTrend.defaultTrendSearchCond.item_name,
          });
        }}
      />
    </div>
  );
};

export const TrendModal = (): JSX.Element => {
  const isOpen = useAtomValue(AtomTrend.isOpen);
  // const [useResultMessage, setResultMessage] = useAtom(AtomCommon.messageState);
  const [modalMessage, setModalMessage] = useAtom(AtomCommon.modalMessageState);
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  );
  const [lineData, setLineData] = useAtom(AtomTrend.lineDataState);
  const [lineLayout, setLineLayout] = useAtom(AtomTrend.lineLayoutState);

  const pathname = useLocation().pathname;

  //
  const getTrendData = async (): Promise<any> => {
    if (trendSearchCond.item_no !== "") {
      try {
        // 地点・項目・入力データを取得
        const data = await Api.post(
          pathname + "/getTrendData",
          setModalMessage,
          trendSearchCond
        );

        setLineData(data.trendData);

        const trendLineLayout: AtomTrend.LineLayoutData[] = [];
        let pIndex = 0;
        trendSearchCond.point_name.forEach((element) => {
          trendLineLayout.push({
            dataKey: element,
            stroke: Const.lineColor[pIndex],
            strokeWidth: 2,
          });
          pIndex++;
        });
        setLineLayout(trendLineLayout);

        return data;
      } catch (error: any) {
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setModalMessage(errorInfo);
        }
        throw error;
      }
    }

    return true;
  };

  // メニューを選択した後、項目・地点を取得
  const { isFetching } = useQuery({
    queryKey: ["getTrendData", trendSearchCond.item_no],
    queryFn: getTrendData,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div
        id="trend_modal"
        className={`${cssChart.contents_panel}`}
        style={isOpen == true ? { display: "flex" } : { display: "none" }}
      >
        <div id="trend_contents" className={`${cssChart.contents}`}>
          <HeaderArea />
          <ModalMessageArea />
          <div className={`${cssChart.contents_body}`}>
            <ItemArea />
            {isFetching ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Loading />
                </div>
              </>
            ) : (
              <>
                <ChartArea />
              </>
            )}
          </div>

          <FooterArea />
        </div>
      </div>
    </>
  );
};

export default TrendModal;
