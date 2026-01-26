// コンボボックス(テキスト入力 + リスト選択)用コンポーネント
// inputタグとselectボックスの値同期の為、idは必須
import React from "react";
import { SelectOptions } from "../../common/interface";
import cssInput from "../../scss/common/inputComponents.module.scss";
import { useQuery } from "@tanstack/react-query";
import { input } from "@testing-library/user-event/dist/cjs/event/input.js";

interface Props {
  id: string;
  color?: string;
  height?: string;
  onChange?: (e: any) => void;
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  width?: string;
  labelWidth?: string;
  margin?: string;
  options?: Array<SelectOptions>;
  selectVal?: string;
  inputVal?: string;
  label?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  divWidth?: string;
  defaultOption?: boolean;
  padding?: string;
  clearBotton?: boolean;
}

export const ComboBox: React.FC<Props> = ({
  id,
  color,
  height,
  onChange,
  onBlur,
  onFocus,
  width,
  labelWidth,
  margin,
  options,
  selectVal,
  inputVal,
  label,
  name,
  value,
  disabled,
  className,
  divWidth,
  defaultOption,
  padding,
  clearBotton,
}) => {
  let left = 10;
  if (!label) {
    left = 0;
  }

  let iValue = "";
  if (value) {
    if (options.some((opt) => opt.value === value)) {
      iValue = options.find((opt) => opt.value === value).label;
    } else {
      iValue = "";
    }
  }

  const optionHtml: Array<JSX.Element> = [];
  if (defaultOption) {
    optionHtml.push(
      <option key="0" value="">
        {" "}
      </option>
    );
  }

  let arrOption: SelectOptions[] = [];
  if (options !== undefined) {
    arrOption = options;
  }

  for (let i = 0; i < arrOption.length; i += 1) {
    if (arrOption[i].value == selectVal && selectVal !== "") {
      optionHtml.push(
        <option
          key={i + 1}
          value={arrOption[i].value}
          className="selected"
          id="selected"
        >
          {" "}
          {arrOption[i].label}
        </option>
      );
    } else {
      optionHtml.push(
        <option key={i + 1} value={arrOption[i].value}>
          {" "}
          {arrOption[i].label}
        </option>
      );
    }
  }

  const image = "./img/arrow-under.png";

  const selectOption = (): void => {
    const selectElem = document.getElementById(id) as HTMLSelectElement;
    const inputElem = document.getElementById(
      id + "_input_text"
    ) as HTMLInputElement;

    if (selectElem.value === "") {
      inputElem.value = "";
      return;
    }

    if (
      inputElem.value !== selectElem.options[selectElem.selectedIndex].label
    ) {
      inputElem.value = selectElem.options[selectElem.selectedIndex].label;
    }
  };

  const setSelect = (): void => {
    const selectElem = document.getElementById(id) as HTMLSelectElement;
    const optionArray = Array.from(selectElem.options);
    const inputElem = document.getElementById(
      id + "_input_text"
    ) as HTMLInputElement;

    if (
      optionArray.some((opt) => opt.label === inputElem.value) &&
      optionArray[optionArray.find((opt) => opt.label == inputElem.value).index]
        .disabled === false
    ) {
      selectElem.value = optionArray.find(
        (opt) => opt.label == inputElem.value
      ).value;
    } else {
      selectElem.value = "";
      inputElem.value = "";
    }
    const event = new Event("change", { bubbles: true });
    selectElem.dispatchEvent(event);
  };

  useQuery({
    queryKey: [id + "combo", value],
    queryFn: selectOption,
  });

  return (
    <div
      className={`input_group ${cssInput.combo}`}
      style={{ width: divWidth, margin, display: "flex", flexDirection: "row" }}
    >
      {label && (
        <div className="contents_label" style={{ width: labelWidth }}>
          {label}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <input
          // defaultValue={iValue}
          id={id + "_input_text"}
          name={name}
          type="text"
          disabled={disabled}
          // value={inputVal}
          autoComplete="off"
          style={
            clearBotton
              ? {
                  color,
                  height,
                  marginLeft: left,
                  width,
                  borderRadius: "10px 0 0 10px",
                }
              : { color, height, marginLeft: left, width }
          }
          onBlur={setSelect}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setSelect();
            }
          }}
          // onChange={setSelect}
        />
        {clearBotton && value !== null && value !== "" && (
          <>
            <div className={`${cssInput.clear_btn}`}>
              <button
                style={{
                  height,
                  backgroundColor: disabled ? "#dedee9" : "transparent",
                }}
                disabled={disabled}
                onClick={() => {
                  const selectElem = document.getElementById(
                    id
                  ) as HTMLSelectElement;
                  selectElem.value = selectElem.options[0].value;
                  const event = new Event("change", { bubbles: true });
                  selectElem.dispatchEvent(event);
                }}
              />
              <span>×</span>
            </div>
          </>
        )}
      </div>

      <select
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        name={name}
        id={id}
        value={value}
        disabled={disabled}
        className={className}
        style={
          clearBotton
            ? {
                color,
                height,
                width: height,
                backgroundImage: `url(${image})`,
                padding,
                borderRadius: "0 10px 10px 0",
                borderLeft: 0,
              }
            : {
                color,
                height,
                width: height,
                backgroundImage: `url(${image})`,
                padding,
              }
        }
      >
        {optionHtml}
      </select>
    </div>
  );
};
