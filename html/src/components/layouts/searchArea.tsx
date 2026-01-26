// 検索エリア用コンポーネント
import React from "react";

// css
import cssSearch from "../../scss/layouts/search.module.scss";
// コンポーネント
import { Button } from "../../components/common";
// Atom

interface Props {
  title?: string;
  onClick?: (e: any) => void;
  action_contents?: JSX.Element;
  condition_contents?: JSX.Element;
}

// 検索条件の表示
const openCondition = (): void => {
  document
    .getElementById("search_condition")
    .classList.toggle(`${cssSearch.open_condition}`);
  document.getElementById("icon").classList.toggle(`${cssSearch.plus}`);
};

export const SearchArea: React.FC<Props> = ({
  title = "検索条件",
  onClick,
  action_contents = null,
  condition_contents = null,
}) => {
  // 検索条件
  const ConditionArea = (): JSX.Element => {
    return <></>;
  };

  return (
    <div id="search_area" className={`${cssSearch.search_area}`}>
      <div className={`${cssSearch.action_area}`}>
        <div
          className="container-between"
          style={{ width: "140px", alignItems: "center", display: "flex" }}
        >
          <h2 style={{ margin: 0, width: "100px" }}>{title}</h2>
          <div
            id={"icon"}
            className={`${cssSearch.icon} ${cssSearch.minus}`}
            onClick={() => openCondition()}
          ></div>
        </div>
        <Button
          title="検索"
          onClick={onClick}
          radius="20px"
          width="90px"
          height="40px"
          className={`${cssSearch.search_button}`}
          id="searchButton"
        />
      </div>
      <div
        id="search_condition"
        className={`${cssSearch.condition_area} ${cssSearch.open_condition}`}
      >
        {condition_contents}
      </div>
    </div>
  );
};

export default SearchArea;
