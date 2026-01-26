import React, { useState } from "react";
import { SetStateAction, useAtomValue } from "jotai";
import { useAtom, useSetAtom } from "jotai";
import {
  Button,
  MessageArea,
  ComboBoxSearch,
} from "../../components/common";
import { Api, getMessage } from "../../common/api";
import { SelectOptions } from "../../common/interface";
import * as Const from "../../common/const";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import DatePicker from "react-date-picker";

// Atom
import * as AtomWQM020 from "../../stores/atomWQM020";
import * as AtomCommon from "../../stores/atom";
import * as AtomTrend from "../../stores/atomTrendModal";

// コンポーネント
import TitleArea from "../../components/layouts/title";
import SearchArea from "../../components/layouts/searchArea";
import { TrendModal } from "../../components/modals//index"; // モーダル
import Loading from "../../components/layouts/loading";

// CSS
import cssWQM020 from "../../scss/pages/WQM020.module.scss";
import cssInput from "../../scss/common/inputComponents.module.scss";

// ライブラリー_CSS_react-date-picker
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "../../scss/reactDatePicker.scss";

// 日時管理ライブラリー
import moment from "moment";

// 年度選択用
const now = new Date();
now.setMonth(now.getMonth() - 3);
let y = now.getFullYear();
const nendoSelect = [];
for (y; y >= 2000; y--) {
  nendoSelect.push({ label: y.toString(), value: y.toString() });
}

// 一覧部の高さ自動調整
const listHeightAjust = (
  setListAreaheight: (val: SetStateAction<string | number | boolean>) => void
) => {
  // 画面全体の高さ
  const bodyHeight: number = document.documentElement.clientHeight;

  // ヘッダーの高さ
  const headerHeight: number =
    document.querySelector(".header_inner").clientHeight;

  // メッセージエリアの高さ
  let messageHeight = 0;
  if (document.querySelector(".message-area")) {
    messageHeight = document.querySelector(".message-area").clientHeight;
  }

  // 検索部の高さ
  const searchHeight: number =
    document.querySelector("#search_area").clientHeight -
    document.querySelector("#search_condition").clientHeight;

  // フッダーの高さ
  const footerHeight: number = document.querySelector(".foot-nav")
    ? document.querySelector(".foot-nav").clientHeight
    : 0;

  // 検索部の高さ
  const titleHeight: number = document.querySelector("#title").clientHeight;

  const calcHeight: number = document.querySelector("#calc_area")
    ? document.querySelector("#calc_area").clientHeight
    : 0;

  const marginHeight = 60; // マージン幅

  // 一覧部の高さ
  const listHeight: number =
    bodyHeight -
    // headerHeight -
    // searchHeight -
    marginHeight -
    footerHeight -
    messageHeight -
    calcHeight -
    // titleHeight -
    0;

  setListAreaheight(`${String(listHeight)}px`);
};

// 検索項目ラベル
const ContentsLabel = ({ label, margin = "0", width = "5em" }): JSX.Element => {
  return (
    <span
      className={`${cssInput.contents_label}`}
      style={{ margin: margin, width: width }}
    >
      {label}
    </span>
  );
};

// 検索条件
const ConditionArea = (): JSX.Element => {
  const [useMessage, setMessage] = useAtom(AtomCommon.messageState); // メッセージ用
  const [searchCond, setSearchCond] = useAtom(AtomWQM020.searchCondState);
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  ); // トレンド画面 検索条件アトム
  const trendSelectItem = useSetAtom(AtomTrend.trendItemSelect);
  const kbnSelect = useAtomValue(AtomWQM020.kbnSelect);
  const [sisetuSelect, setSisetuSelect] = useAtom(AtomWQM020.sisetuSelect);
  const catSelect = useAtomValue(AtomWQM020.catSelect);
  const [processSelect, setProcessSelect] = useAtom(AtomWQM020.processSelect);
  const [pointSelect, setPointSelect] = useAtom(AtomWQM020.pointSelect);
  const [itemSelect, setItemSelect] = useAtom(AtomWQM020.itemSelect);

  // 詳細箇所選択時処理
  const selectPoint = (): void => {
    let pointList: string[] = [];
    let pointNameList: string[] = [];
    for (let i = 0; i < 5; i++) {
      let pointElem = document.getElementById(
        "point_" + i.toString()
      ) as HTMLSelectElement;
      if (pointElem.value !== null && pointElem.value !== "") {
        pointList.push(pointElem.value);
        pointNameList.push(pointElem.options[pointElem.selectedIndex].label);
      }
    }

    // 選択済みセレクトボックス巡回
    for (let otherPoint = 0; otherPoint < 5; otherPoint++) {
      let oPointList =
        otherPoint <= pointList.length
          ? pointList.filter((elem) => elem !== pointList[otherPoint])
          : pointList;
      // 選択済みセレクトボックス取得
      let otherPointElem = document.getElementById(
        "point_" + otherPoint.toString()
      ) as HTMLSelectElement;
      // セレクトボックス用選択肢確認
      for (let oIndex = 0; oIndex < otherPointElem.options.length; oIndex++) {
        // 選択した値は除外
        if (
          oPointList.some(
            (point) => point === otherPointElem.options[oIndex].value
          )
        ) {
          otherPointElem.options[oIndex].disabled = true;
        } else {
          otherPointElem.options[oIndex].disabled = false;
        }
      }
    }

    setSearchCond({
      ...searchCond,
      point_no: pointList,
      point_name: pointNameList,
    });
    setTrendSearchCond({
      ...trendSearchCond,
      point_no: pointList,
      point_name: pointNameList,
    });
  };

  // 検査項目選択時処理
  const selectItem = (): void => {
    let itemList: string[] = [];
    let itemNameList: string[] = [];
    let itemSelectList: SelectOptions[] = [];
    for (let i = 0; i < 5; i++) {
      let itemElem = document.getElementById(
        "item_" + i.toString() + "_options"
      ) as HTMLSelectElement;

      if (itemElem.value !== null && itemElem.value !== "") {
        itemList.push(itemElem.value);
        itemNameList.push(itemElem.options[itemElem.selectedIndex].label);
        itemSelectList.push({
          label: itemElem.options[itemElem.selectedIndex].label,
          value: itemElem.value,
        });
      }
    }

    // 選択済みセレクトボックス巡回
    for (let otherItem = 0; otherItem < 5; otherItem++) {
      let oItemList =
        otherItem <= itemList.length
          ? itemList.filter((elem) => elem !== itemList[otherItem])
          : itemList;
      // 選択済みセレクトボックス取得
      let otherItemElem = document.getElementById(
        "item_" + otherItem.toString()
      ) as HTMLSelectElement;
      // セレクトボックス用選択肢確認
      for (let oIndex = 0; oIndex < otherItemElem.options.length; oIndex++) {
        // 選択した値は除外
        if (
          oItemList.some((item) => item === otherItemElem.options[oIndex].value)
        ) {
          otherItemElem.options[oIndex].disabled = true;
        } else {
          otherItemElem.options[oIndex].disabled = false;
        }
      }
    }

    setSearchCond({
      ...searchCond,
      item_no: itemList,
      item_name: itemNameList,
    });
    trendSelectItem(itemSelectList);
  };

  // 浄水場選択時処理
  const getPointAndProcess = (): void => {
    Api.post("/WQM020/getPointAndProcess", setMessage, searchCond)
      .then((result) => {
        setProcessSelect(result.process);
        setPointSelect(result.point);
        setSearchCond((prev) => ({ ...prev, point_no: [] }));
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["PM-0003E"]));
          setMessage(errorInfo);
        }
      });
  };

  //
  const getSaisuiPoint = (): void => {
    Api.post("/WQM020/getSaisuiPoint", setMessage, searchCond)
      .then((result) => {
        setSisetuSelect(result.sisetu);
        setPointSelect(result.point);
        setSearchCond((prev) => ({ ...prev, point_no: [] }));
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["PM-0003E"]));
          setMessage(errorInfo);
        }
      });
  };

  // 浄水場選択時処理
  const getItem = (): void => {
    // setSearchCond({
    //   ...searchCond,
    //   item_name: [],
    //   item_no: [],
    // });
    Api.post("/WQM020/getItem", setMessage, searchCond)
      .then((result) => {
        setItemSelect(result.item);
        setSearchCond((prev) => ({ ...prev, item_no: [] }));
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["PM-0003E"]));
          setMessage(errorInfo);
        }
      });
  };

  // 年度設定時、検査期間自動設定
  const setNendoToDate = (): void => {
    if (nendoSelect.some((opt) => opt.value == searchCond.nendo)) {
      setSearchCond({
        ...searchCond,
        date_from: searchCond.nendo + "/04/01",
        date_to: (Number(searchCond.nendo) + 1).toString() + "/03/31",
      });
    }
  };

  const setSearchCondPoint = (): void => {
    if (searchCond.point_no.length == 0) {
      return;
    }

    let list = [];
    for (let i = 0; i < 5; i++) {
      const combo = document.getElementById(
        "point_" + i.toString()
      ) as HTMLInputElement;

      if (i < searchCond.point_no.length) {
        list.push(combo.value);
      }

      const event = new Event("change", { bubbles: true });
      combo.dispatchEvent(event);
    }
    setTrendSearchCond({
      ...trendSearchCond,
      point_no: searchCond.point_no,
      point_name: list,
    });
  };

  const setSearchCondItem = (): void => {
    if (searchCond.item_no.length == 0) {
      return;
    }

    let itemNameList: string[] = [];
    let itemSelectList: SelectOptions[] = [];
    for (let i = 0; i < 5; i++) {
      const combo = document.getElementById(
        "item_" + i.toString()
      ) as HTMLInputElement;

      if (combo.value !== "") {
        itemNameList.push(combo.value);

        if (
          itemSelect.find((item) => {
            return (
              item.value.toString() == searchCond.item_no[i] && item.flg == "1"
            );
          }) !== undefined
        ) {
          itemSelectList.push({
            label: combo.value,
            value: searchCond.item_no[i],
          });
        }
      }
    }

    setSearchCond({
      ...searchCond,
      item_name: itemNameList,
    });
    trendSelectItem(itemSelectList);
  };

  useQuery({
    queryKey: ["wqm020getPointAndProcess", searchCond.sisetu],
    queryFn: getPointAndProcess,
  });
  useQuery({
    queryKey: ["wqm020getSaisuiPoint", searchCond.process],
    queryFn: getSaisuiPoint,
  });
  useQuery({
    queryKey: ["wqm020getItem", searchCond.cat],
    queryFn: getItem,
  });
  useQuery({
    queryKey: ["wpm020NendoToDate", searchCond.nendo],
    queryFn: setNendoToDate,
  });
  useQuery({
    queryKey: ["wqm020SearchCondPoints", searchCond.point_no],
    queryFn: setSearchCondPoint,
  });
  useQuery({
    queryKey: ["wqm020SearchCondItems", searchCond.item_no],
    queryFn: setSearchCondItem,
  });
  useQuery({
    queryKey: ["wqm020pointChange", pointSelect],
    queryFn: selectPoint,
  });
  useQuery({
    queryKey: ["wqm020processChange", processSelect],
    queryFn: selectPoint,
  });

  // 採水地点設定
  const pointCondition = (
    <>
      <div
        className={`${cssWQM020.setting_area} ${cssWQM020.child_elements_width_auto}`}
      >
        <div className={`${cssWQM020.area_title}`}>採水地点設定</div>
        <div className={`${cssWQM020.left_set}`}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <ContentsLabel label="浄水場" margin="0 0 0 30px" />
            <ComboBoxSearch
              id="sisetu_select"
              width="210px"
              margin="0 0 4px 10px"
              defaultOption
              padding="0 2.5em 0 5px "
              height="42px"
              options={sisetuSelect}
              value={searchCond.sisetu}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "sisetu",
                index: null,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <ContentsLabel label="処理過程" margin="0 0 0 30px" />
            <ComboBoxSearch
              id="process_select"
              width="210px"
              margin="0 0 0 5px"
              defaultOption
              padding="0 2.5em 0 5px "
              height="42px"
              options={processSelect}
              value={searchCond.process}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "process",
                index: null,
              }}
            />
          </div>
        </div>

        <div className={`${cssWQM020.right_set}`}>
          <div
            style={{
              display: "flex",
              // flexDirection: "column",
              flexDirection: "row",
              // justifyContent: "space-between",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <ContentsLabel label="詳細箇所" margin="0 0 0 30px" />
            <ComboBoxSearch
              id="point_0"
              name="point"
              width="210px"
              margin="0 0 5px 0"
              defaultOption
              padding="0 2.5em 0 5px "
              height="42px"
              options={pointSelect}
              selectVal={
                searchCond.point_no.length > 0 ? searchCond.point_no[0] : ""
              }
              selectedData={searchCond.point_no}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "point_no",
                index: 0,
              }}
            />
          </div>

          <ComboBoxSearch
            id="point_1"
            name="point"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.point_no.length > 0 ? false : true}
            options={pointSelect}
            selectVal={
              searchCond.point_no.length > 1 ? searchCond.point_no[1] : ""
            }
            selectedData={searchCond.point_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "point_no",
              index: 1,
            }}
          />
          <ComboBoxSearch
            id="point_2"
            name="point"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.point_no.length > 1 ? false : true}
            options={pointSelect}
            selectVal={
              searchCond.point_no.length > 2 ? searchCond.point_no[2] : ""
            }
            selectedData={searchCond.point_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "point_no",
              index: 2,
            }}
          />
          <ComboBoxSearch
            id="point_3"
            name="point"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.point_no.length > 2 ? false : true}
            options={pointSelect}
            selectVal={
              searchCond.point_no.length > 3 ? searchCond.point_no[3] : ""
            }
            selectedData={searchCond.point_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "point_no",
              index: 3,
            }}
          />
          <ComboBoxSearch
            id="point_4"
            name="point"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.point_no.length > 3 ? false : true}
            options={pointSelect}
            selectVal={
              searchCond.point_no.length > 4 ? searchCond.point_no[4] : ""
            }
            selectedData={searchCond.point_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "point_no",
              index: 4,
            }}
          />
        </div>
      </div>
    </>
  );
  // 検査項目設定
  const itemCondition = (
    <>
      <div
        className={`${cssWQM020.setting_area} ${cssWQM020.child_elements_width_auto}`}
      >
        <div data-testid="wqm020-5-1" className={`${cssWQM020.area_title}`}>
          検査項目設定
        </div>
        <div className={`${cssWQM020.left_set}`}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <ContentsLabel label="検査種類" margin="0 0 0 30px" />
            <ComboBoxSearch
              dataTestId="wqm020-5-2"
              id="cat_select"
              width="210px"
              margin="0 0 0 5px"
              defaultOption
              padding="0 2.5em 0 5px "
              height="42px"
              options={catSelect}
              value={searchCond.cat}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "cat",
                index: null,
              }}
            />
          </div>
        </div>

        <div className={`${cssWQM020.right_set}`}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <ContentsLabel label="検査項目" margin="0 0 0 30px" />
            <ComboBoxSearch
              dataTestId="wqm020-5-3"
              id="item_0"
              name="item_0"
              width="210px"
              margin="0 0 5px 0"
              defaultOption
              padding="0 2.5em 0 5px "
              height="42px"
              options={itemSelect}
              selectVal={
                searchCond.item_no.length > 0 ? searchCond.item_no[0] : ""
              }
              inputVal={
                searchCond.item_name.length > 0 ? searchCond.item_name[0] : ""
              }
              // onChange={() => {
              //   selectItem();
              // }}
              selectedData={searchCond.item_no}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "item_no",
                index: 0,
              }}
            />
          </div>

          <ComboBoxSearch
            id="item_1"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.item_no.length > 0 ? false : true}
            options={itemSelect}
            selectVal={
              searchCond.item_no.length > 1 ? searchCond.item_no[1] : ""
            }
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              selectItem();
            }}
            selectedData={searchCond.item_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "item_no",
              index: 1,
            }}
          />
          <ComboBoxSearch
            id="item_2"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.item_no.length > 1 ? false : true}
            options={itemSelect}
            selectVal={
              searchCond.item_no.length > 2 ? searchCond.item_no[2] : ""
            }
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              selectItem();
            }}
            selectedData={searchCond.item_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "item_no",
              index: 2,
            }}
          />
          <ComboBoxSearch
            id="item_3"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.item_no.length > 2 ? false : true}
            options={itemSelect}
            selectVal={
              searchCond.item_no.length > 3 ? searchCond.item_no[3] : ""
            }
            selectedData={searchCond.item_no}
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              selectItem();
            }}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "item_no",
              index: 3,
            }}
          />
          <ComboBoxSearch
            id="item_4"
            width="210px"
            margin="0 0 5px 0"
            defaultOption
            padding="0 2.5em 0 5px "
            height="42px"
            disabled={searchCond.item_no.length > 3 ? false : true}
            options={itemSelect}
            selectVal={
              searchCond.item_no.length > 4 ? searchCond.item_no[4] : ""
            }
            onChange={({
              target: { value },
            }: React.ChangeEvent<HTMLInputElement>) => {
              selectItem();
            }}
            selectedData={searchCond.item_no}
            setterInfo={{
              setterName: setSearchCond,
              outputState: { ...searchCond },
              selectedName: "item_no",
              index: 4,
            }}
          />
        </div>
      </div>
    </>
  );

  const [useDelayStyle, setDelayStyle] = React.useState<string>(
    "comp_date_picker_hide"
  );

  React.useEffect(() => {
    setTimeout(() => {
      setDelayStyle("comp_date_picker_show");
    }, 300);
  }, []);

  return (
    <>
      <div
        className={`${cssWQM020.search_conditions}`}
        style={{ display: "flex", flexDirection: "column", width: "auto" }}
      >
        <div
          id="wmq020-top-search-cond"
          className={`${cssWQM020.WQM020_top_search_conditions}`}
        >
          {/* 検査期間 */}
          <div
            className="container-just"
            id="wqm020-datepicker-container"
            style={{
              margin: "0 1em 0 0",
              display: "flex",
              alignItems: "center",
              width: "auto",
            }}
          >
            <ContentsLabel label="検査期間" />

            {/* <InputDate
              width="100px"
              height="42px"
              margin="0 1em 0 0"
              autoComplete={"off"}
              className={`${cssWQM020.input_date}`}
              value={searchCond.date_from || ""}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                seirekiName: "date_from",
                selectedName: "date_from",
                index: null,
              }}
            /> */}

            {/* 2025/11/19 追加 登録画面と同様カレンダー */}
            <DatePicker
              id="date_from"
              value={searchCond.date_from || ""}
              showLeadingZeros={true}
              openCalendarOnFocus={true}
              closeCalendar={true}
              calendarIcon={null}
              className={useDelayStyle}
              calendarProps={{
                calendarType: "gregory",
              }}
              minDate={new Date("1000/01/01")}
              maxDate={new Date("9999/12/31")}
              onChange={(value: any) => {
                const setDate = value
                  ? moment(value).format("YYYY/MM/DD")
                  : null;
                setSearchCond({ ...searchCond, date_from: setDate });
              }}
              // ※ 不用設定
              // format={"y-MM-dd"}
              // autoFocus={true}
              // shouldOpenCalendar={({ reason }) => reason !== 'focus'}
              // shouldCloseCalendar={({ reason }) => reason == 'outsideAction'}
              // shouldCloseCalendar={({ reason }) => {
              //   return false;
              // }}
              // clearIcon={null}
            />

            <span
              style={{ margin: "0 1em 0 1em", fontSize: "1em", width: "auto" }}
            >
              ～
            </span>

            {/* <InputDate
              width="100px"
              height="42px"
              margin="0 30px 0 0"
              autoComplete={"off"}
              className={`${cssWQM020.input_date}`}
              value={searchCond.date_to || ""}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                seirekiName: "date_to",
                selectedName: "date_to",
                index: null,
              }}
            /> */}

            {/* 2025/11/19 追加 登録画面と同様カレンダー */}
            <DatePicker
              id="date_to"
              value={searchCond.date_to || ""}
              showLeadingZeros={true}
              openCalendarOnFocus={true}
              closeCalendar={true}
              calendarIcon={null}
              className={useDelayStyle}
              calendarProps={{
                calendarType: "gregory",
              }}
              format={"yyyy/MM/dd"}
              minDate={new Date("1000/01/01")}
              maxDate={new Date("9999/12/31")}
              onChange={(value: any) => {
                const setDate = value
                  ? moment(value).format("YYYY/MM/DD")
                  : null;
                setSearchCond({ ...searchCond, date_to: setDate });
              }}
              // ※ 不用設定
              // format={"y-MM-dd"}
              // autoFocus={true}
              // shouldOpenCalendar={({ reason }) => reason !== 'focus'}
              // shouldCloseCalendar={({ reason }) => reason == 'outsideAction'}
              // shouldCloseCalendar={({ reason }) => {
              //   return false;
              // }}
              // clearIcon={null}
            />
          </div>

          {/* 年度 */}
          <div
            className={`${cssWQM020.child_elements_width_auto} ${cssWQM020.WQM020_top_search_cond_year}`}
          >
            <ContentsLabel label="年度" width="3em" />
            <ComboBoxSearch
              id="nendo_select"
              width="80px"
              margin="0 30px 0 0"
              padding="0 2.5em 0 5px "
              height="42px"
              options={nendoSelect}
              selectVal={searchCond.nendo}
              value={searchCond.nendo}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "nendo",
                index: null,
              }}
            />
          </div>
          {/* 検査区分 */}
          <div
            className={` ${cssWQM020.child_elements_width_auto} ${cssWQM020.WQM020_top_search_cond_kbn}`}
          >
            <ContentsLabel label="検査区分" />
            <ComboBoxSearch
              id="kensa_select"
              width="250px"
              margin="0 30px 0 0"
              defaultOption
              padding="0 2.5em 0 5px "
              height="42px"
              options={kbnSelect}
              value={searchCond.kbn}
              setterInfo={{
                setterName: setSearchCond,
                outputState: { ...searchCond },
                selectedName: "kbn",
                index: null,
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            margin: "15px 0 0 0",
            padding: "10px 15px",
          }}
        >
          {/* 採水地点設定 */}
          {pointCondition}
          {/* 検査項目設定 */}
          {itemCondition}
        </div>
      </div>
    </>
  );
};

// 一覧部
const ListArea = (): JSX.Element => {
  const [listAreaheight, setListAreaheight] = useAtom(
    AtomCommon.listAreaheightState
  );
  // const setListAreaheight = useSetAtom(AtomCommon.listAreaheightState);
  const [useMessage, setMessage] = useAtom(AtomCommon.messageState); // メッセージ用
  const [listState, setListState] = useAtom(AtomWQM020.listState);
  const [calcState, setCalcState] = useAtom(AtomWQM020.calcState);
  const [searchHiddenCond, setSearchHiddenCond] = useAtom(
    AtomWQM020.searchHiddenCondState
  );
  const searchCond = useAtomValue(AtomWQM020.searchCondState);
  const [scrollFlg, setScrollFlg] = useAtom(AtomWQM020.scrollFlgState); // スクロールフラグ用
  const [barHeightState, setBarHeightState] = useAtom(
    AtomWQM020.barHeightState
  ); // スクロール位置用

  let barHeightValue: AtomWQM020.barHeight = barHeightState;

  let searchCondValue = searchHiddenCond;

  const bodyHtml: JSX.Element[] = [];
  const headHtml: JSX.Element = (
    <>
      <thead>
        <tr>
          <th
            style={{
              maxWidth: "50px",
              minWidth: "50px",
              borderRadius: "5px 0 0 0",
            }}
          >
            {" "}
            No.
          </th>
          <th
            data-testid="wqm020-4-1-1-1"
            className="sort_th wqm020date"
            onClick={() => {
              setSort("wqm020date");
            }}
          >
            <div style={{ minWidth: "5em" }}>採水年月日</div>
          </th>
          <th
            data-testid="wqm020-4-1-1-2"
            className="sort_th wqm020time"
            style={{ width: "auto" }}
            onClick={() => {
              setSort("wqm020time");
            }}
          >
            <div style={{ minWidth: "4em" }}>採水時刻</div>
          </th>
          <th
            data-testid="wqm020-4-1-1-3"
            className="sort_th wqm020point"
            style={{ width: "auto" }}
            onClick={() => {
              setSort("wqm020point");
            }}
          >
            <div style={{ minWidth: "4em" }}>採水地点</div>
          </th>
          <th
            data-testid="wqm020-4-1-1-4"
            className="sort_th wqm020item"
            style={{ width: "auto" }}
            onClick={() => {
              setSort("wqm020item");
            }}
          >
            <div style={{ minWidth: "4em" }}>検査項目</div>
          </th>
          <th
            data-testid="wqm020-4-1-1-5"
            className="sort_th wqm020kbn"
            style={{ width: "auto" }}
            onClick={() => {
              setSort("wqm020kbn");
            }}
          >
            <div style={{ minWidth: "4em" }}>検査区分</div>
          </th>
          <th
            data-testid="wqm020-4-1-1-6"
            className="sort_th wqm020c_data"
            style={{ width: "auto" }}
            onClick={() => {
              setSort("wqm020c_data");
            }}
          >
            <div style={{ minWidth: "5em" }}>定量データ</div>
          </th>
          <th
            data-testid="wqm020-4-1-1-7"
            className="sort_th wqm020q_data"
            style={{ width: "auto", borderRadius: "0 5px 0 0" }}
            onClick={() => {
              setSort("wqm020q_data");
            }}
          >
            <div style={{ minWidth: "5em" }}>定性データ</div>
          </th>
        </tr>
      </thead>
    </>
  );

  if (listState !== null && listState.length > 0) {
    for (let i = 0; i < listState.length; i++) {
      // 採水日時を設定
      const setDateTime = listState[i].date + " " + listState[i].time;

      bodyHtml.push(
        <tr>
          <td style={{ height: "40px", textAlign: "center" }}>{i + 1}</td>
          <td style={{ textAlign: "center" }}>{listState[i].date}</td>
          <td style={{ textAlign: "center" }}>
            {moment(setDateTime).format("HH:mm:ss")}
          </td>
          <td>{listState[i].point}</td>
          <td>{listState[i].item}</td>
          <td>{listState[i].kbn}</td>
          <td>{listState[i].c_data}</td>
          <td>{listState[i].q_data}</td>
        </tr>
      );
    }
  }

  if (listState !== null && listState.length > barHeightState.after) {
    barHeightValue = {
      before: barHeightState.after,
      after: listState.length,
    };
    setBarHeightState(barHeightValue);
  }

  // ↓ ソート-------------------------------------------------------------
  // ソート用条件設定
  const setSort = (column: string): void => {
    setMessage([]);
    let searchCondValue: AtomWQM020.searchCondType = searchHiddenCond;
    if (column !== searchHiddenCond.order_column) {
      searchCondValue = {
        ...searchCondValue,
        order_column: column,
        order_direction: AtomWQM020.defaultSearchCond.order_direction,
      };
    } else {
      searchCondValue = {
        ...searchCondValue,
        order_column: column,
        order_direction: !searchHiddenCond.order_direction,
      };
    }
    setSearchHiddenCond(searchCondValue);
  };

  const sortSearch = (): void => {
    setMessage([]);

    Api.post("/WQM020/search", setMessage, searchHiddenCond)
      .then((result) => {
        if (result !== null && result.list !== null && result.list.length > 0) {
          setListState(result.list);
          setCalcState(result.calc);
        } else {
          setListState([]);
          setCalcState(AtomWQM020.defaultCalcType);
        }
        setBarHeightState(AtomWQM020.defaultBarHeight);
        setScrollFlg(true);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["PM-0003E"]));
          setMessage(errorInfo);
        }
      });
  };

  useQuery({
    queryKey: [
      "wqm020SortSearch",
      searchHiddenCond.order_column,
      searchHiddenCond.order_direction,
    ],
    queryFn: () => {
      if (
        searchHiddenCond.order_column !== null &&
        listState !== null &&
        listState.length !== 0
      ) {
        sortSearch();
      }
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  useQuery({
    queryKey: ["wqm020sortClassAdd", listState],
    queryFn: () => {
      // ソート時クラス切り替え
      if (listState !== null && listState.length != 0) {
        let sortClass = `sort_asc`;
        if (searchCondValue.order_direction === true) {
          sortClass = `sort_desc`;
        }
        document
          .querySelector(
            `#dataList > thead > tr > th.${searchCondValue.order_column}`
          )
          .classList.add(sortClass);
      }
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });
  // ↑ ソート-------------------------------------------------------------

  // ↓ 無限スクロール-------------------------------------------------------
  // 一番下にスクロールで次を検索
  const scrollCheck = () => {
    const list = document.getElementById("listArea");
    if (
      list.scrollHeight - list.clientHeight - list.scrollTop <= 20 &&
      scrollFlg
    ) {
      setScrollFlg(false);
      searchCondValue.offset = searchCondValue.offset + searchHiddenCond.limit;
      setSearchHiddenCond(searchCondValue);
      ReSearch();
    }
  };

  // 再取得時に正しい位置へスクロールを移動
  const scrollMove = () => {
    const list = document.getElementById("listArea");
    if (list !== undefined && list !== null) {
      const move =
        list.scrollHeight * (barHeightValue.before / barHeightValue.after) -
        list.clientHeight;
      if (move > 0) {
        list.scrollTop = move;
      }
    }
  };

  // 再検索処理
  const ReSearch = (): void => {
    // 初期化
    setMessage([]); // メッセージ

    Api.post("/WQM020/search", setMessage, searchHiddenCond)
      .then((result) => {
        setListState(listState.concat(result.list));
        if (result.list.length >= searchHiddenCond.limit) {
          // ユーザの全件数が50の倍数だと、検索結果が0件になってしまうため、下記処理追加
          let allcount = 0;
          allcount = listState.concat(result.list).length;
          if (allcount === Number(calcState.count)) {
            setScrollFlg(false);
          } else {
            setScrollFlg(true);
          }
        } else {
          setScrollFlg(false);
        }
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["PM-0003E"]));
          setMessage(errorInfo);
        }
      });
  };

  useQuery({
    queryKey: ["wqm020scrollMove", barHeightState],
    queryFn: scrollMove,
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });
  // ↑ 無限スクロール-------------------------------------------------------

  useQuery({
    queryKey: ["wqm020ListChange", listState],
    queryFn: () => {
      listHeightAjust(setListAreaheight);
    },
    refetchOnWindowFocus: false, // フォーカス外れた時リーレンダリングはオフにする
  });

  const isFetchingSearch = useIsFetching({ queryKey: ["wqm020Search"] });
  const isFetchingSortSearch = useIsFetching({
    queryKey: ["wqm020SortSearch"],
  });

  //　検索にかかわるqueryが発動していれば表示しない
  const isFetching = isFetchingSearch > 0 || isFetchingSortSearch > 0;
  return (
    <>
      {listState !== null && listState.length !== 0 && !isFetching && (
        <>
          {calcState !== null && (
            <>
              <div
                id="calc_area"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                }}
              >
                <div
                  className={`${cssWQM020.calcArea} ${cssWQM020.child_elements_width_auto}`}
                >
                  <span style={{ margin: 0 }}>最大 = {calcState.max}</span>
                  <span>最小 = {calcState.min}</span>
                  <span>平均 = {calcState.avg}</span>
                  <span>定量データ件数 = {calcState.count}</span>
                </div>
              </div>
            </>
          )}
          <div
            id="listArea"
            data-testid="wqm020-listArea"
            className={`${cssWQM020.list_area} ${cssWQM020.sticky_table} ${cssWQM020.child_elements_width_auto}`}
            style={{
              maxHeight:
                typeof listAreaheight === "string" ? listAreaheight : "740px",
              overflow: "scroll",
              margin: "10px 0 40px 0",
              width: "100%",
            }}
            onScroll={() => scrollCheck()}
          >
            <table
              id="dataList"
              className="parent neumorphic"
              style={{ minWidth: "100%", zIndex: "0" }}
            >
              {headHtml}
              <tbody>{bodyHtml}</tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

// フッター
const Footer = (): JSX.Element => {
  const [useMessage, setMessage] = useAtom(AtomCommon.messageState); // メッセージ用
  const [listState, setListState] = useAtom(AtomWQM020.listState); // 表データ
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  ); // トレンド画面 検索条件アトム
  const itemSelect = useAtomValue(AtomWQM020.itemSelect);
  const searchCond = useAtomValue(AtomWQM020.searchCondState);
  const searchHiddenCond = useAtomValue(AtomWQM020.searchHiddenCondState);
  const isOpen = useSetAtom(AtomTrend.isOpen); // トレンドモーダル開閉フラグ

  const [sigmaState, setSigmaState] = useState<string>("");
  const [trendFlgState, setTrendFlgState] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const setTrend = (): void => {
    if (
      itemSelect !== null &&
      itemSelect.length !== 0 &&
      trendSearchCond.date_from !== null &&
      trendSearchCond.date_to !== null &&
      trendSearchCond.point_no !== null &&
      trendSearchCond.point_no.length !== 0
    ) {
      setTrendSearchCond({
        ...trendSearchCond,
        date_from: searchCond.date_from,
        date_to: searchCond.date_to,
        kensa: searchCond.kbn,
      });
      isOpen(true);
    } else {
      window.alert("検索条件が足りません。");
      console.log(trendSearchCond);
    }
  };

  // テンプレートファイル出力
  const exportSearchData = async (): Promise<any> => {
    setMessage([]);
    await Api.postBuffer(
      "/WQM020/exportSearchData",
      setMessage,
      searchHiddenCond
    )
      .then((result: ArrayBuffer) => {
        const blob = new Blob([result], {
          // type: "application/octet-binary",
          type: "Content-Type:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");

        // const fileName = "テンプレート.xlsx";
        const now = new Date();

        const yyyy = now.getFullYear();
        const mon = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        const fileName = `検査結果一覧_${yyyy}${mon}${dd}_${hh}${min}${ss}_.xlsx`;
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setMessage(errorInfo);
        }
      });
  };

  // 報告書ダウンロード
  const export3Sigma = async () => {
    if (sigmaState == "") {
      return;
    }
    // メッセージクリア
    setMessage([]);

    // 選択データを格納
    let selectData: any = [];
    selectData.push({
      report_no: Number(sigmaState),
      saisui_date: "",
      saisui_time: "",
      point_no: "",
      kensa_kbn_code: 0,
      dsp_space: "",
      nendo: searchCond.nendo,
    });

    const request = {
      output_data: selectData,
    };

    // 報告書ダウンロード
    await Api.fileDownload("/report/export3Sigma", setMessage, request)
      .then((response) => {
        // 日本語ファイル名取得
        const disposition = response.headers.get("Content-Disposition") || "";
        let filename = "download.xlsx";

        // 日本語を含むファイル名に対応した抽出処理
        const utf8Match = disposition.match(
          /filename\*=UTF-8|utf-8''([^;\n]+)/
        );
        const normalMatch = disposition.match(/filename="?([^"]+)"?/);

        if (utf8Match) {
          filename = decodeURIComponent(utf8Match[1]);
        } else if (normalMatch) {
          filename = normalMatch[1];
        }
        const blob = new Blob([response.data], {
          type: "application/octet-binary",
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        const message: AtomCommon.message[] = [];
        message.push(getMessage(["WQ-0007I", "報告書出力"]));
        setMessage(message);
      })
      .catch((error: Error) => {
        // 想定外のエラーの場合メッセージを表示
        if (error.message == Const.HTTP_STATUS_CODE["500"]) {
          const errorInfo: AtomCommon.message[] = [];
          errorInfo.push(getMessage(["WQ-0003E"]));
          setMessage(errorInfo);
        }
      })
      .finally(() => {
        setSigmaState("");
      });
  };

  // 選択項目が定量データなのかのチェック
  const trendCheck = async () => {
    if (
      itemSelect !== undefined &&
      itemSelect !== null &&
      searchCond.item_no !== null &&
      searchCond.item_no.length !== 0
    ) {
      let selectElem = [];
      selectElem = itemSelect.filter((item) => {
        return (
          searchCond.item_no.includes(item.value.toString()) && item.flg == "1"
        );
      });
      setTrendFlgState(selectElem.length !== 0 ? true : false);
    }
  };

  useQuery({
    queryKey: ["wqm020Sigma", sigmaState],
    queryFn: export3Sigma,
  });

  useQuery({
    queryKey: ["wqm020TrendCheck", searchCond],
    queryFn: trendCheck,
  });

  useQuery({
    queryKey: ["wqm020ExportSearchData"],
    queryFn: exportSearchData,
    enabled: false,
  });

  return (
    <>
      <footer>
        <ul className="foot_nav">
          {listState !== null && listState.length !== 0 ? (
            <>
              <Button
                dataTestId="wqm020-5-1"
                width="200px"
                // height="35px"
                title="検査結果ファイル出力"
                color="#4CAF50"
                margin="0px 0px 0px 15px"
                className="footer_btn_left"
                onClick={() => {
                  queryClient.prefetchQuery({
                    queryKey: ["wqm020ExportSearchData"],
                  });
                }}
              />
            </>
          ) : (
            <></>
          )}

          <Button
            dataTestId="wqm020-5-3"
            width="120px"
            // height="35px"
            title="3σ共同検査"
            color="#4CAF50"
            margin="0px 0px 0px 15px"
            className="footer_btn_right"
            onClick={() => {
              setSigmaState("701");
            }}
          />
          <Button
            dataTestId="wqm020-5-2"
            width="120px"
            // height="35px"
            title="3σ浄水・配水"
            color="#4CAF50"
            margin="0px 0px 0px 15px"
            className="footer_btn_right"
            onClick={() => {
              setSigmaState("700");
            }}
          />
          {searchCond.item_no !== null &&
            searchCond.item_no.length !== 0 &&
            searchCond.point_no !== null &&
            searchCond.point_no.length !== 0 &&
            trendFlgState == true && (
              <>
                <Button
                  width="100px"
                  // height="35px"
                  title="トレンド"
                  color="#4d5fb1"
                  margin="0px 0px 0px 15px"
                  className="footer_btn_right"
                  onClick={() => {
                    setTrend();
                  }}
                />
              </>
            )}
        </ul>
      </footer>
    </>
  );
};

const WQM020 = (): JSX.Element => {
  const [useMessage, setMessage] = useAtom(AtomCommon.messageState); // メッセージ用
  const [searchCond, setSearchCond] = useAtom(AtomWQM020.searchCondState); // 検索条件
  const [trendSearchCond, setTrendSearchCond] = useAtom(
    AtomTrend.trendSearchCondState
  ); // トレンド画面 検索条件アトム
  const [searchClick, setSearchClick] = useAtom(AtomWQM020.searchClick);
  const setListAreaheight = useSetAtom(AtomCommon.listAreaheightState);

  // セッター
  const setListState = useSetAtom(AtomWQM020.listState); // 表データ
  const setCalcState = useSetAtom(AtomWQM020.calcState);
  const setKbn = useSetAtom(AtomWQM020.kbnSelect); // 検査区分
  const setSisetu = useSetAtom(AtomWQM020.sisetuSelect); // 施設
  const setProcess = useSetAtom(AtomWQM020.processSelect); // 処理過程
  const setCat = useSetAtom(AtomWQM020.catSelect); // 検査項目大分類
  const setPoint = useSetAtom(AtomWQM020.pointSelect); // 採水地点
  const setItem = useSetAtom(AtomWQM020.itemSelect); // 項目
  const setSearchHiddenCond = useSetAtom(AtomWQM020.searchHiddenCondState);
  const setBarHeightState = useSetAtom(AtomWQM020.barHeightState);
  const setScrollFlg = useSetAtom(AtomWQM020.scrollFlgState); // スクロールフラグ用

  // 検索処理
  const wqm020Search = async (): Promise<any> => {
    setMessage([]);
    setListState([]);
    setBarHeightState(AtomWQM020.defaultBarHeight);
    setScrollFlg(true);
    let flg = true;
    const condition = document.getElementById("icon").classList;
    condition.forEach((element) => {
      if (element.includes("plus")) {
        flg = false;
      }
    });
    if (flg) {
      document.getElementById("icon").click();
    }

    if (
      searchCond.date_from !== null &&
      searchCond.date_from !== "" &&
      searchCond.date_to !== null &&
      searchCond.date_to !== ""
    ) {
      await Api.post("/WQM020/search", setMessage, searchCond)
        .then((result) => {
          if (
            result !== null &&
            result.list !== null &&
            result.list.length > 0
          ) {
            setListState(result.list);
            setCalcState(result.calc);
          } else {
            setListState([]);
            setCalcState(AtomWQM020.defaultCalcType);

            // 検索結果が0件の場合、エラー
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0011E"]));
            setMessage(errorInfo);
          }

          setSearchCond({
            ...searchCond,
            offset: 0,
          });
          let searchCondValue = searchCond;
          searchCondValue.offset = 0;

          setSearchHiddenCond(searchCondValue);
        })
        .catch((error: Error) => {
          // 想定外のエラーの場合メッセージを表示
          if (error.message == Const.HTTP_STATUS_CODE["500"]) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0003E"]));
            setMessage(errorInfo);
          }
        });
    } else {
      window.alert("日付を入力してください。");
    }
  };

  useQuery({
    queryKey: ["wqm020Search"],
    queryFn: () => {
      setMessage([]);

      // 検査期間Fromが未入力の場合エラー
      if (!searchCond.date_from) {
        const errorInfo: AtomCommon.message[] = [];
        errorInfo.push(getMessage(["WQ-0006W", "検査期間From"]));
        setMessage(errorInfo);

        return false;
      }

      // 検査期間Fromに日付型以外の入力されている場合、エラー
      if (!moment(searchCond.date_from).isValid()) {
        const errorInfo: AtomCommon.message[] = [];
        errorInfo.push(getMessage(["WQ-0007W", "検査期間From"]));
        setMessage(errorInfo);

        return false;
      }

      // 検査期間Toが未入力の場合エラー
      if (!searchCond.date_to) {
        const errorInfo: AtomCommon.message[] = [];
        errorInfo.push(getMessage(["WQ-0006W", "検査期間To"]));
        setMessage(errorInfo);

        return false;
      }

      // 検査期間Toに日付型以外の入力されている場合、エラー
      if (!moment(searchCond.date_to).isValid()) {
        const errorInfo: AtomCommon.message[] = [];
        errorInfo.push(getMessage(["WQ-0007W", "検査期間To"]));
        setMessage(errorInfo);

        return false;
      }

      //
      const sttDate = moment(searchCond.date_from);
      const endDate = moment(searchCond.date_to);
      if (endDate.diff(sttDate) < 0) {
        const errorInfo: AtomCommon.message[] = [];
        errorInfo.push(getMessage(["WQ-0010W", "検査期間"]));
        setMessage(errorInfo);

        return false;
      }

      // エラーがなければ、検索実施
      wqm020Search();
      return true;
    },
    enabled: false,
  });

  // 初期表示
  useQuery({
    queryKey: ["initWqm020GetData"],
    queryFn: () => {
      setListState([]);
      setMessage([]);
      setBarHeightState(AtomWQM020.defaultBarHeight);
      Api.post("/WQM020/index", setMessage, null)
        .then((response) => {
          setKbn(response.kbn);
          setSisetu(response.sisetu);
          setProcess(response.process);
          setCat(response.cat);
          setPoint(response.point);
          setItem(response.item);
          const nowY = nendoSelect[0].value;
          setSearchCond({
            ...AtomWQM020.defaultSearchCond,
            date_from: nowY + "/04/01",
            date_to: (Number(nowY) + 1).toString() + "/03/31",
            nendo: nowY,
          });
          setTrendSearchCond({
            ...trendSearchCond,
            date_from: nowY + "/04/01",
            date_to: (Number(nowY) + 1).toString() + "/03/31",
          });
          // const nendoElem = document.getElementById(
          //   "nendo_select"
          // ) as HTMLInputElement;
          // nendoElem.value = nowY;
          // const event = new Event("change", { bubbles: true });
          // nendoElem.dispatchEvent(event);
        })
        .catch((error: Error) => {
          // 想定外のエラーの場合メッセージを表示
          if (error.message == Const.HTTP_STATUS_CODE["500"]) {
            const errorInfo: AtomCommon.message[] = [];
            errorInfo.push(getMessage(["WQ-0003E"]));
            setMessage(errorInfo);
          }
        });

      listHeightAjust(setListAreaheight);
    },
  });

  const queryClient = useQueryClient();
  const isFetchingGetData = useIsFetching({ queryKey: ["initWqm020GetData"] });
  const isFetchingSigma = useIsFetching({ queryKey: ["wqm020Sigma"] });
  const isFetchingSearch = useIsFetching({ queryKey: ["wqm020Search"] });
  const isFetchingExport = useIsFetching({
    queryKey: ["wqm020ExportSearchData"],
  });
  const isFetchingSortSearch = useIsFetching({
    queryKey: ["wqm020SortSearch"],
  });

  const isFetching =
    isFetchingGetData > 0 ||
    isFetchingSearch > 0 ||
    isFetchingSigma > 0 ||
    isFetchingExport > 0 ||
    isFetchingSortSearch > 0;

  // ページから離れる時、キャッシュをクリア
  React.useEffect(() => {
    return () => {
      setTimeout(async () => {
        await queryClient.removeQueries({ queryKey: ["fetchInputItems"] });
        await queryClient.removeQueries({ queryKey: ["wqm020SortSearch"] });
        await setListState([]);
        await setMessage([]);
      }, 100);
    };
  }, [queryClient]);

  return (
    <>
      <div
        data-testid="wqm020-1"
        className="container_column"
        style={
          isFetching
            ? {
                height: "calc(100vh - 60px)",
                width: "100%",
                overflow: "hidden",
              }
            : { height: "100%", width: "100%" }
        }
      >
        {isFetching && (
          <>
            <div
              style={{
                // width: 150,
                height: "100vh",
                // marginTop: "35dvh",
                width: "100vw",
                // height: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "fixed",
                zIndex: "99",
                backgroundColor: "rgba(0,0,0,0.2)",
              }}
            >
              <div
                data-testid="wqm020-loading-gif"
                style={{ width: "200px", height: "200px" }}
              >
                <Loading />
              </div>
            </div>
          </>
        )}
        <div
          className="container_range"
          style={{ zIndex: "0", display: "flex", flexDirection: "column" }}
        >
          <TitleArea title="検査情報検索" />
          <div style={{ width: "98%", margin: "auto" }}>
            <MessageArea />
          </div>
          <div className={`${cssWQM020.container_area}`}>
            <SearchArea
              title="検索条件"
              condition_contents={<ConditionArea />}
              onClick={() => {
                queryClient.prefetchQuery({ queryKey: ["wqm020Search"] });
              }}
            />
            <ListArea />
          </div>
        </div>
        <Footer />
      </div>

      <TrendModal />
    </>
  );
};

export default WQM020;
