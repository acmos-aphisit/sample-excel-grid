// ボタン用コンポーネント
import React from 'react';

// ボタンスタイル
import '../../scss/button.scss';

interface Props {
  border?: string;
  color?: string;
  title?: React.ReactNode;
  height?: string;
  onClick?: (e: any) => void;
  radius?: string;
  width?: string;
  margin?: string;
  name?: string;
  id?: string;
  className?: string;
  disabled?: boolean;
  dataTestId?: string;
}

// eslint-disable-next-line
export var Button: React.FC<Props> = function ({
  border,
  color,
  title,
  height,
  onClick,
  radius,
  width,
  margin,
  name,
  id,
  className,  // arrow_icon:右矢印のアイコンを表示する
  disabled,
  dataTestId = "button-test",
}) {
  return (
    <button
      type="button"
      data-testid={dataTestId}
      onClick={onClick}
      name={name}
      id={id}
      className={className}
      disabled={disabled}
      style={{
        backgroundColor: color,
        border,
        borderRadius: radius,
        height,
        width: width,
        margin,
      }}
    >
      {title}
    </button>
  );
};