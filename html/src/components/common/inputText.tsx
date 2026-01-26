// テキストエリア用コンポーネント
import React from 'react';

interface Props {
  color?: string;
  label?: React.ReactNode;
  labelOnly?: boolean;
  height?: string;
  max?: number;
  min?: number;
  onChange?: (e: any) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  radius?: string;
  width?: string;
  labelWidth?: string;
  margin?: string;
  type?: string;
  name?: string;
  id?: string;
  value?: string | number;
  //defaultValue?: string | number;
  className?: string;
  disabled?: boolean;
  contentsFlg?: boolean;
  placeholder?: string;
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined;
  onCompositionStart?: (e: any) => void;
  onCompositionEnd?: (e: any) => void;
  onClick?: (e: any) => void;
  dataTestId?: string;
}

// eslint-disable-next-line
export const InputText: React.FC<Props> = ({
  color = undefined,
  label = undefined,
  labelOnly = false,
  height = undefined,
  max = undefined,
  min = undefined,
  onChange = undefined,
  onFocus = undefined,
  onBlur = undefined,
  radius = undefined,
  width = undefined,
  labelWidth = undefined,
  margin = undefined,
  type = undefined,
  name = undefined,
  id = undefined,
  value = '',
  //defaultValue = null,
  className = undefined,
  disabled = false,
  contentsFlg = false,
  placeholder = undefined,
  inputMode = undefined,
  onCompositionStart = undefined,
  onCompositionEnd = undefined,
  onClick = undefined,
  dataTestId = "input-text-test",
}) => {
  let inputType = 'text';
  let left = 10;

  if (!label) {
    left = 0;
  }

  if (type) {
    inputType = type;
  }

  return (

    <div className="input-group" style={{ margin }}>
      {label && contentsFlg ? <div className="contents-label" style={{ width: labelWidth }}>{label}</div> :
        <span className={`lbl `} style={{ width: labelWidth }}>
          {label}
        </span>
      }
      {labelOnly ? "" :
      <input
        data-testid={dataTestId}
        type={inputType}
        onChange={onChange}
        name={name}
        maxLength={max}
        min={min}
        id={id}
        value={value}
        //defaultValue={defaultValue}
        className={className}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          backgroundColor: color,
          borderRadius: radius,
          height,
          width,
          marginLeft: left,
        }}
        disabled={disabled}
        inputMode={inputMode}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        onClick={onClick}
      />}
    </div>
  );
};
