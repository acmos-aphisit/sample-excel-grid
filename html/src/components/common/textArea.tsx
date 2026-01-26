// テキストエリア用コンポーネント
import React from 'react';

interface Props {
    color?: string;
    label?: React.ReactNode;
    height?: string;
    max?: number;
    onChange?: (e: any) => void;
    onFocus?: (e: any) => void;
    onBlur?: (e: any) => void;
    radius?: string;
    width?: string;
    labelWidth?: string;
    margin?: string;
    name?: string;
    id?: string;
    value?: string | number;
    className?: string;
    disabled?: boolean;
    contentsFlg?: boolean;
    placeholder?: string;
}

// eslint-disable-next-line
export const TextArea: React.FC<Props> = ({
    color,
    label,
    height,
    max,
    onChange,
    onFocus,
    onBlur,
    radius,
    width,
    labelWidth,
    margin,
    name,
    id,
    value,
    className,
    disabled,
    contentsFlg,
    placeholder,
}) => {
    let left = 10;

    if (!label) {
        left = 0;
    }

    return (

        <div className="input_group" style={{ margin }}>
            {label && contentsFlg ? <div className="contents_label" style={{ width: labelWidth }}>{label}</div> :
                <span className={`lbl `} style={{ width: labelWidth }}>
                    {label}
                </span>
            }
            <textarea
            onChange={onChange}
            name={name}
            maxLength={max}
            id={id}
            value={value}
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
            ></textarea>
        </div>
    );
};

TextArea.defaultProps = {
    color: null,
    label: null,
    height: null,
    max: null,
    onChange: null,
    onFocus: null,
    onBlur: null,
    radius: null,
    width: null,
    labelWidth: null,
    margin: null,
    name: null,
    id: null,
    value: '',
    className: null,
    disabled: false,
    contentsFlg: false,
    placeholder: null,
};
