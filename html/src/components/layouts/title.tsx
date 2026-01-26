// テキストエリア用コンポーネント
import React from "react";
// サイドメニュスタイル
import cssTitle from "../../scss/layouts/title.module.scss";

interface Props {
  title?: string;
}

// eslint-disable-next-line
export const TitleArea: React.FC<Props> = ({ title = null }) => {
  return (
    <div className={`${cssTitle.title_area}`} id="title">
      <h2>{title}</h2>
    </div>
  );
};

export default TitleArea;
