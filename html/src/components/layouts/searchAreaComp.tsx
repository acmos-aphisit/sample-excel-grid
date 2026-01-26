// 検索エリア用コンポーネント
import React from "react";

// css
import cssSearch from "../../scss/layouts/searchComp.module.scss";
// コンポーネント
import { Button } from "../common";
// Atom

interface Props {
  title?: string;
  onClick?: (e: any) => void;
  action_contents?: JSX.Element;
  condition_contents?: JSX.Element;
  toggleFlg?: boolean;
  btnFlg?: boolean;
  btnWidth?: string;
  btnHeight?: string;
  titlewidth?: string;
  titleDiv?: string;
  usingId?: string;
  dataTestId?: string;
}

export const SearchArea: React.FC<Props> = ({
  title = "検索条件",
  onClick,
  action_contents = null,
  condition_contents = null,
  toggleFlg = true,
  btnFlg = true,
  btnWidth = "90px",
  btnHeight = "40px",
  titlewidth = "100px",
  titleDiv = "140px",
  usingId = "search-area-comp",
  dataTestId = "search-area-test",
}) => {
  // 検索条件
  const ConditionArea = (): JSX.Element => {
    return <></>;
  };

  // 検索条件の表示
  const openCondition = (): void => {
    document.getElementById(usingId + "-search-condition").classList.toggle(`${cssSearch.open_condition}`);
    document.getElementById(usingId + "-icon").classList.toggle(`${cssSearch.plus}`);
  };

  return (
    <div data-testid={dataTestId} id="search_area" className={`${cssSearch.search_area}`}>
      <div className={`search_area_action_area ${cssSearch.action_area}`}>
        <div
          className="container-between"
          style={{ width: titleDiv, alignItems: "center", display: "flex" }}
        >
          <h2 style={{ margin: 0, width: titlewidth }}>{title}</h2>
          {toggleFlg && (
            <div
              id={usingId + "-icon"}
              className={`${cssSearch.icon} ${cssSearch.minus}`}
              onClick={() => openCondition()}
            ></div>
          )}

        </div>
        {btnFlg && (
          <Button
            title="検索"
            onClick={onClick}
            radius="20px"
            width={btnWidth}
            height={btnHeight}
            className={`${cssSearch.search_button}`}
            id="searchButton"
          />
        )}

      </div>
      <div
        id={usingId + "-search-condition"}
        className={`${cssSearch.condition_area} ${cssSearch.open_condition}`}
      >
        {condition_contents}
      </div>
    </div>
  );
};

export default SearchArea;
