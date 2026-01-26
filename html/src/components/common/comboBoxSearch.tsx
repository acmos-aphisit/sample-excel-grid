// コンボボックス(テキスト入力 + リスト選択)用コンポーネント
import React, { useState, useEffect, useRef } from "react";
import { SelectOptions } from "../../common/interface";
import cssInput from "../../scss/common/inputComponents.module.scss";

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
  setterInfo: any;
  dataTestId?: string;
  selectedData?: Array<any>; // グループのセレクトボックスの配列データ ※ 複数回数が選択不可の設定用
}

export const ComboBoxSearch: React.FC<Props> = ({
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
  setterInfo,
  dataTestId = "combobox-search-test",
  selectedData = [],
}) => {
  const [useInputValue, setInputValue] = useState<string>(selectVal || "");
  const [useOptions, setOptions] = useState<SelectOptions[]>(options ?? []);
  const [useOptionHtml, setOptionHtml] = useState<JSX.Element[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0);
  const [isBottomPosition, setIsBottomPotision] = useState<boolean>(true);

  // ステート値更新
  const setterName = setterInfo.setterName;
  const outputState = setterInfo.outputState;
  const selectedName = setterInfo.selectedName;
  const index = setterInfo.index;

  const image = "./img/arrow-under.png";
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [useCountClickDropDown, setCountClickDropDown] = useState<number>(0);

  // 選択肢を生成
  useEffect(() => {
    // 現在のコンボボックスの選択値を除外したリストを作成
    const otherSelectedValues = selectedData;

    if (!useOptions) return;

    const optionHtml = useOptions.map((opt) => {
      const isDisabled = otherSelectedValues.includes(String(opt.value));
      const isSelected = opt.value === selectVal;

      return (
        <li
          key={opt.value}
          className={`${isSelected ? "selected " : ""} ${
            isDisabled ? "WQM020-combobox-disabled-option" : ""
          }`}
          style={{
            height: 23,
            whiteSpace: "nowrap",
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (!isDisabled) {
              handleOptionClick(opt);
            }
          }}
        >
          {opt.label}
        </li>
      );
    });

    if (defaultOption) {
      optionHtml.unshift(
        <li
          key={0}
          style={{ height: 23, whiteSpace: "nowrap" }}
          onClick={() => handleOptionClick(null)}
        >
          {" "}
        </li>
      );
    }
    setOptionHtml(optionHtml);
  }, [useOptions, selectVal, useCountClickDropDown]);

  useEffect(() => {
    let val = selectVal;
    if (useOptions.some((opt) => opt.value == selectVal)) {
      const temp = useOptions.find((opt) => opt.value == selectVal);
      val = temp !== undefined && temp !== null ? temp.label : "";
    }
    setInputValue(val);
  }, [outputState]);

  // 開閉
  useEffect(() => {
    if (!isOpen) {
      setOptions(options ?? []);
    }
  }, [isOpen, options]);

  // 外部クリック
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * リストを押下する処理
   */
  const handleOptionClick = (option: SelectOptions) => {
    if (option) {
      if (index !== null) {
        let list = outputState[selectedName];
        list[index] = option.value.toString();
        setterName((prev) => ({ ...prev, [selectedName]: list }));
      } else {
        setterName((prev) => ({ ...prev, [selectedName]: option.value }));
      }
      setInputValue(option.label);
      setIsOpen(false);
    } else {
      if (index !== null) {
        let list = outputState[selectedName];
        list.splice(index, 1);
        setterName((prev) => ({ ...prev, [selectedName]: list }));
      } else {
        setterName((prev) => ({ ...prev, [selectedName]: "" }));
      }
      setInputValue("");
      setIsOpen(false);
    }
  };

  /**
   * 入力処理
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 全角⇒半角をへ変換
    const val = e.target.value;

    // 小文字⇒大文字をへ変換
    const upperVal = val.toUpperCase();
    const lowerVal = val.toUpperCase();

    // 半角⇒全角をへ変換
    var checkUpperFullWidth = upperVal.replace(/[A-Za-z0-9]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
    });
    checkUpperFullWidth = checkUpperFullWidth.replace(" ", "　");

    // 全角⇒半角をへ変換
    var checkUpperHalfWidth = upperVal.replace(
      /[Ａ-Ｚａ-ｚ０-９]/g,
      function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      }
    );

    // 半角⇒全角をへ変換
    var checkLowerFullWidth = lowerVal.replace(/[A-Za-z0-9]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) + 0xfee0);
    });
    checkUpperFullWidth = checkUpperFullWidth.replace(" ", "　");

    // 全角⇒半角をへ変換
    var checkLowerHalfWidth = lowerVal.replace(
      /[Ａ-Ｚａ-ｚ０-９]/g,
      function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
      }
    );

    setInputValue(val);
    setIsOpen(true);

    // 選択肢_絞り込み
    const newOptions = (options ?? []).filter((opt) => {
      const resCheckUpperFullWidth = opt.label.includes(checkUpperFullWidth); // 大文字・全角
      const resCheckUpperHalfWidth = opt.label.includes(checkUpperHalfWidth); // 大文字・半角
      const resCheckLowerFullWidth = opt.label.includes(checkLowerFullWidth); // 小文字・全角
      const resCheckLowerHalfWidth = opt.label.includes(checkLowerHalfWidth); // 小文字・半角

      return (
        resCheckUpperFullWidth ||
        resCheckUpperHalfWidth ||
        resCheckLowerFullWidth ||
        resCheckLowerHalfWidth
      );
    });
    setOptions(newOptions);
  };

  /**
   * 開閉処理
   */
  const toggleDropdown = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const spaceAbove = rect.top; // 上側の大きさ
    const spaceBelow = window.innerHeight - rect.bottom; // 下側の大きさ
    if (window.innerHeight - rect.bottom >= window.innerHeight * 0.4) {
      // 下側にリストの分の高さ(40dvh)があるなら下に表示
      setIsBottomPotision(true);
    } else if (spaceAbove > spaceBelow) {
      // 下側より上側のほうが大きいなら上に表示
      setIsBottomPotision(false);
    }
    // 初期値は下側表示

    setPositionX(rect.left);
    setIsOpen(!isOpen);
    setCountClickDropDown(useCountClickDropDown + 1);
  };

  return (
    <div
      ref={wrapperRef}
      id="combobox_comp_container"
      className={`input_group ${cssInput.combo} ${className}`}
      style={{ margin, height }}
    >
      <div className="combo_box">
        <input
          id={id}
          name={name ?? id}
          data-testid={dataTestId}
          disabled={disabled}
          type="text"
          className="combobox_search"
          autoComplete="off"
          value={useInputValue}
          onClick={(e) => toggleDropdown(e)}
          onChange={handleInputChange}
          onBlur={() => {
            const checkSelected = (options ?? []).find(
              (option) => option.label === useInputValue
            );

            setInputValue(checkSelected ? checkSelected.label : "");
            if (index == null) {
              setterName((prev) => ({
                ...prev,
                [selectedName]: checkSelected ? checkSelected.value : "",
              }));
            } else {
              let list = outputState[selectedName];
              if (checkSelected) {
                list[index] = checkSelected.value.toString();
              } else {
                list.splice(index, 1);
              }
              setterName((prev) => ({ ...prev, [selectedName]: list }));
            }
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          style={{
            width: width,
            backgroundImage: `url(${image})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "calc(100% - 10px) center",
            paddingRight: "2em",
          }}
        />
        {isOpen && (
          <ul
            className="options"
            style={{
              position: "absolute",
              left: 0,
              top: isBottomPosition ? "40px" : "auto",
              bottom: isBottomPosition ? "auto" : "40px",
              width: width,
              color: "#333",
            }}
          >
            {useOptionHtml}
          </ul>
        )}
      </div>
    </div>
  );
};
