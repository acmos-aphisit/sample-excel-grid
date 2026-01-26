import React, { useState } from "react";
import { ja } from "date-fns/locale/ja";
import { getMonth } from "date-fns/getMonth";
import { getYear, toDate } from "date-fns";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { SetterOrUpdater, useAtom, atom } from "recoil";
import { useAtom } from "jotai";
// import * as Common from "../../common/common";
import * as CommonAtom from "../../stores/atom";

// jaのロケールの設定が週頭が月曜始まりになっているので日曜始まりにする
if (ja.options !== undefined) {
  ja.options.weekStartsOn = 0;
}

// ReactDatepickerのロケール登録
registerLocale("ja", ja);

interface Props {
  color?: string;
  label?: React.ReactNode;
  height?: string;
  setterInfo?: CommonAtom.DateType;
  radius?: string;
  width?: string;
  labelWidth?: string;
  margin?: string;
  name?: string;
  id?: string;
  value?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  maxDate?: Date;
  maxTime?: Date;
  minDate?: Date;
  minTime?: Date;
  monthFlg?: boolean;
  selected?: string;
  autoComplete?: string;
  dataTestId?: string;
}

export const InputDate: React.FC<Props> = ({
  color,
  label,
  height,
  setterInfo,
  radius,
  width,
  labelWidth,
  margin,
  name,
  id,
  value,
  className,
  disabled,
  placeholder,
  maxDate,
  maxTime,
  minDate,
  minTime,
  monthFlg,
  selected,
  autoComplete,
  dataTestId = "input-date-test",
}) => {
  const setterName = setterInfo.setterName;
  const outputState = setterInfo.outputState;
  const seirekiName = setterInfo.seirekiName;
  const selectedName = setterInfo.selectedName;
  const index = setterInfo.index;
  const YYYY_Name = setterInfo.YYYY_Name;
  const [addValue, setValue] = useState(new Date());

  const [dspDateState, setDspDateState] = useAtom(CommonAtom.dspDate);

  // 日付の長さ調整 (例：1 → 01、12 → 12)
  const dateLength = (num: number): string => {
    return num.toString().length == 1 ? "0" + num.toString() : num.toString();
  };

  // 帳尻合わせ 例：2022/13/01 → 2023/01/01
  const setting = (
    year: number,
    month: number,
    date: number = null,
    gap: string
  ): string => {
    let connect =
      date !== null
        ? new Date(year, month - 1, date)
        : new Date(year, month - 1);
    return (
      connect.getFullYear().toString() +
      gap +
      dateLength(connect.getMonth() + 1).toString() +
      gap +
      dateLength(connect.getDate()).toString()
    );
  };

  const clickChange = (selectdate: Date) => {
    // ---------------------------------------- //
    // カレンダーをクリックした際に動作する        //
    // ---------------------------------------- //
    const new_date = new Date(selectdate);

    let wareki = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }).format(new_date);
    const seireki = setting(
      new_date.getFullYear(),
      new_date.getMonth() + 1,
      new_date.getDate(),
      "/"
    );
    const year = new_date.getFullYear();

    // 画面表示が月までの場合、補正する
    if (monthFlg) {
      wareki = wareki.slice(0, 6);
    }

    if (index === null) {
      if (YYYY_Name === undefined) {
        setterName({
          ...outputState,
          [seirekiName]: seireki,
          [selectedName]: seireki,
        });
      } else {
        setterName({
          ...outputState,
          [seirekiName]: seireki,
          [selectedName]: seireki,
          [YYYY_Name]: year.toString(),
        });
      }
    } else {
      if (YYYY_Name === undefined) {
        setterName({
          ...outputState,
          [index]: {
            ...outputState[index],
            [seirekiName]: seireki,
            [selectedName]: seireki,
          },
        });
      } else {
        setterName({
          ...outputState,
          [index]: {
            ...outputState[index],
            [seirekiName]: seireki,
            [selectedName]: seireki,
            [YYYY_Name]: year.toString(),
          },
        });
      }
    }
  };

  const setDate = () => {
    // 入力した日付が有効な西暦 or 和暦か？
    if (dspDateState.inputFlg) {
      let new_date: Date;
      let seireki: string;
      let inputDate: string;

      // 画面表示が月までの場合、補正する
      if (
        monthFlg ||
        (dspDateState.inputDate !== null &&
          dspDateState.inputDate.match(/\d{4}\/\d{1,2}$/))
      ) {
        inputDate = dspDateState.inputDate + "/01";
      } else {
        inputDate = dspDateState.inputDate;
      }

      if (inputDate.substring(0, 1).match(/^[1-9]+$/)) {
        new_date = new Date(inputDate);

        seireki = setting(
          new_date.getFullYear(),
          new_date.getMonth() + 1,
          new_date.getDate(),
          "/"
        );
      }

      const year = new_date.getFullYear();

      // 日付形式のチェック
      const regex = /^[0-9]{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])$/;
      const date_chk = regex.test(seireki);

      if (date_chk === true) {
        setDspDateState({ ...dspDateState, inputFlg: false });
      }

      if (index === null) {
        if (YYYY_Name === undefined) {
          setterName({
            ...outputState,
            [seirekiName]: seireki,
            [selectedName]: seireki,
          });
        } else {
          setterName({
            ...outputState,
            [seirekiName]: seireki,
            [selectedName]: seireki,
            [YYYY_Name]: year.toString(),
          });
        }
      } else {
        if (YYYY_Name === undefined) {
          setterName({
            ...outputState,
            [index]: {
              ...outputState[index],
              [seirekiName]: seireki,
              [selectedName]: seireki,
            },
          });
        } else {
          setterName({
            ...outputState,
            [index]: {
              ...outputState[index],
              [seirekiName]: seireki,
              [selectedName]: seireki,
              [YYYY_Name]: year.toString(),
            },
          });
        }
      }
    }
  };
  return (
    <React.Fragment>
      <div className="input_group" style={{ margin, width: "auto" }}>
        {label && (
          <div className="contents_label" style={{ width: labelWidth }}>
            {label}
          </div>
        )}
        <div
          style={{
            backgroundColor: color,
            borderRadius: radius,
            height,
            width,
            // marginLeft: left,
          }}
        >
          <DatePicker
            id={id}
            name={name}
            data-testid={dataTestId}
            locale="ja"
            className={className}
            disabled={disabled}
            selected={value ? new Date(value) : null}
            autoComplete={autoComplete}
            value={value ? value : null}
            onSelect={clickChange}
            dateFormat={monthFlg ? "yyyy/MM" : "yyyy/MM/dd"}
            maxDate={maxDate}
            onKeyDown={(event) => {
              // --------------------------------------------------------------- //
              // 日付入力後、エンターキーを押下した際に動作するイベント               //
              // --------------------------------------------------------------- //
              if (event.key === "Enter") {
                setDate();
              }
            }}
            onClickOutside={() => {
              // --------------------------------------------------------------- //
              // 日付入力後、DatePicker以外をクリックした際に動作するイベント        //
              // --------------------------------------------------------------- //
              setDate();
            }}
            // onChangeRaw={(event: React.FocusEvent<HTMLInputElement>) => {
            onChangeRaw={(event: React.KeyboardEvent<HTMLInputElement>) => {
              // --------------------------------------------------------------- //
              // テキストボックス内を入力時に動作するイベント                        //
              // onChangeイベントだと和暦入力時に動作しないため、onChangeRawを使用   //
              // --------------------------------------------------------------- //

              // 現在の入力値が有効な西暦 または 和暦か？
              if (
                event.currentTarget.value &&
                // ((monthFlg === true && (event.currentTarget.value.match(/\d{4}\/\d{1,2}$/) || event.currentTarget.value.match(/[A-Z]\d{1,2}\/\d{1,2}$/))) ||
                //   (monthFlg === false && (event.currentTarget.value.match(/\d{4}\/\d{1,2}\/\d{1,2}$/) || event.currentTarget.value.match(/[A-Z]\d{1,2}\/\d{1,2}\/\d{1,2}$/))))
                ((monthFlg === true &&
                  event.currentTarget.value.match(
                    /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])$/
                  )) ||
                  (monthFlg === false &&
                    event.currentTarget.value.match(
                      /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])$/
                    )))
              ) {
                setDspDateState({
                  ...dspDateState,
                  inputDate: event.currentTarget.value,
                  inputFlg: true,
                });
              } else if (
                event.currentTarget.value &&
                ((monthFlg === true &&
                  (event.currentTarget.value.match(
                    /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])$/
                  ) ||
                    event.currentTarget.value.match(
                      /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])$/
                    ))) ||
                  (monthFlg === false &&
                    (event.currentTarget.value.match(
                      /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[12][0-9]|3[01])$/
                    ) ||
                      event.currentTarget.value.match(
                        /^[0-9]{4}\/([1-9]|0[1-9]|1[0-2])\/([1-9]|0[1-9]|[12][0-9]|3[01])$/
                      ))))
              ) {
                setDspDateState({
                  ...dspDateState,
                  inputDate: event.currentTarget.value,
                  inputFlg: true,
                });

                if (index === null) {
                  setterName({
                    ...outputState,
                    [seirekiName]: event.currentTarget.value,
                    [selectedName]: null,
                  });
                } else {
                  setterName({
                    ...outputState,
                    [index]: {
                      ...outputState[index],
                      [seirekiName]: event.currentTarget.value,
                      [selectedName]: null,
                    },
                  });
                }
              } else {
                setDspDateState(CommonAtom.dspDateDefault);

                if (index === null) {
                  setterName({
                    ...outputState,
                    [seirekiName]: event.currentTarget.value,
                    [selectedName]: null,
                  });
                } else {
                  setterName({
                    ...outputState,
                    [index]: {
                      ...outputState[index],
                      [seirekiName]: event.currentTarget.value,
                      [selectedName]: null,
                    },
                  });
                }
              }
            }}
          />
          <></>
        </div>
      </div>
    </React.Fragment>
  );
};

InputDate.defaultProps = {
  color: null,
  label: null,
  height: null,
  // setterInfo: null,
  radius: null,
  width: null,
  labelWidth: null,
  margin: null,
  name: null,
  id: null,
  value: null,
  className: null,
  disabled: false,
  placeholder: null,
  maxDate: null,
  maxTime: null,
  minDate: null,
  minTime: null,
  monthFlg: false,
  selected: null,
  autoComplete: "on",
};
