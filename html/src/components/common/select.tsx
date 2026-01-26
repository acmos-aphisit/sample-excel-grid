// セレクトボックス用コンポーネント
import React from "react";
import { SelectOptions } from "../../common/interface";

interface Props {
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
  label?: string;
  name?: string;
  value?: string;
  id?: string;
  // eslint-disable-next-line
  disabled?: boolean;
  className?: string;
  divWidth?: string;
  defaultOption?: boolean;
  padding?: string;
  clearBotton?: boolean;
  dataTestId?: string;
}

// eslint-disable-next-line
export const Select: React.FC<Props> = ({
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
  label,
  name,
  value,
  id,
  disabled,
  className,
  divWidth,
  defaultOption,
  padding,
  clearBotton,
  dataTestId = "select-test",
}) => {
  let left = 10;
  if (!label) {
    left = 0;
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

  return (
    <div
      className="input_group"
      style={{ width: divWidth, margin, display: "flex", flexDirection: "row" }}
    >
      {label && (
        <div className="contents_label" style={{ width: labelWidth }}>
          {label}
        </div>
      )}
      <select
        data-testid={dataTestId}
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
                width,
                marginLeft: left,
                backgroundImage: `url(${image})`,
                padding,
                borderRadius: "10px 0 0 10px",
                borderRight: 0,
              }
            : {
                color,
                height,
                width,
                marginLeft: left,
                backgroundImage: `url(${image})`,
                padding,
              }
        }
      >
        {optionHtml}
      </select>
      {clearBotton && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <button
              style={{
                height,
                borderRadius: "0 10px 10px 0",
                borderLeft: 0,
                border: "3px solid #ccc",
                zIndex: 2,
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
            <span
              style={{
                position: "absolute",
                zIndex: 1,
                fontWeight: "bold",
                fontSize: "1em",
                color: "#717171",
              }}
            >
              ×
            </span>
          </div>
        </>
      )}
    </div>
  );
};
