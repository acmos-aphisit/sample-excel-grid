// アイコン用コンポーネント
import React from 'react';

// クリップ
export const Clip = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    id="icon"
    x="0px"
    y="0px"
    viewBox="0 0 1000 1000"
  >
    <path d="M178,843.05c-81.87-81.88-81.87-215.1,0-297L559.79,164.23c58.49-58.49,153.65-58.49,212.13,0s58.49,153.65,0,212.13L390.09,758.2A90,90,0,0,1,262.81,630.92l396-396,42.42,42.43L302.4,676.17a30,30,0,0,0,42.43,42.43L731.62,331.81A90,90,0,0,0,604.34,204.53L219,589.91c-58.49,58.48-58.49,153.64,0,212.13s153.64,58.48,212.13,0l397.39-397.4,42.43,42.43-396,396C405.1,912.89,269.57,934.67,178,843.05Z" />
  </svg>
);

// チェックボックス
interface CheckBoxProps {
  label?: string;
  name?: string;
  value?: string;
  checked?: boolean;
  onChange?: (e: any) => void;
}

// export const InputCheckbox = (): JSX.Element => {
export const InputCheckbox: React.FC<CheckBoxProps> = ({
  label,
  name,
  value,
  checked,
  onChange,
}) => {

  return (
    <div className="input_group">
      {label && 
        <label htmlFor="chkSendFlg" style={{ marginLeft: 5, whiteSpace: 'nowrap', fontWeight: 'normal' }}>
          {label}
        </label>
      }
      {label ? 
        <label className="lbl_chk" htmlFor="chkSendFlg"> 
          <input
            id="chkSendFlg"
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
          />
          <div className="icon_box">
            <Checkbox />
          </div>
        </label>
        : 
        <label className="lbl_chk"> 
          <input
            id="chkSendFlg"
            type="checkbox"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
          />
          <div className="icon_box">
            <Checkbox />
          </div>
        </label>}
    </div>
  );
};

InputCheckbox.defaultProps = {
  label: null,
  name: "",
  value: "0",
  onChange: null,
};

// チェックボックス
export const Checkbox = (): JSX.Element => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 512 512"
    style={{ width: 10, height: 10, opacity: 1 }}
  >
    <g>
      <polygon
        className="st0"
        points="440.469,73.413 218.357,295.525 71.531,148.709 0,220.229 146.826,367.055 218.357,438.587 
                    289.878,367.055 512,144.945 	"
        style={{ fill: '#F4F7FC' }}
      />
    </g>
  </svg>
);

// 付箋
interface PropsFill {
  className?: string;
  color?: string;
  onClick?: (e: any) => void;
}

export const Fill: React.FC<PropsFill> = ({ className, color, onClick }) => {
  let image: string;
  switch (color) {
    case 'red':
      image = './img/fusen_r.svg';
      break;
    case 'blue':
      image = './img/fusen_b.svg';
      break;
    case 'green':
      image = './img/fusen_g.svg';
      break;
    case 'yellow':
      image = './img/fusen_y.svg';
      break;
    default:
      image = '';
      break;
  }

  return (
    <div // eslint-disable-line
      className={className}
      style={{ backgroundImage: `url(${image})` }}
      onClick={onClick} // eslint-disable-line
    ></div>
  );
};

Fill.defaultProps = {
  className: null,
  color: null,
  onClick: null,
};

interface PropsFillS {
  className?: string;
  color?: string;
  onClick?: (e: any) => void;
}
export const FillS: React.FC<PropsFillS> = ({ className, color, onClick }) => {
  let image: string;
  switch (color) {
    case 'red':
      image = './img/fusen_s_r.png';
      break;
    case 'blue':
      image = './img/fusen_s_b.png';
      break;
    case 'green':
      image = './img/fusen_s_g.png';
      break;
    case 'yellow':
      image = './img/fusen_s_y.png';
      break;
    default:
      // デフォルトred
      image = './img/fusen_s_r.png';
  }

  return (
    <div // eslint-disable-line
      className={className}
      style={{ backgroundImage: `url(${image})` }}
      onClick={onClick} // eslint-disable-line
    ></div>
  );
};

FillS.defaultProps = {
  className: null,
  color: null,
  onClick: null,
};

// コメント
export const Comment = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 1000 1000"
  >
    <path d="M740,944.87,499,740H190c-82.71,0-150-67.29-150-150V270c0-82.71,67.29-150,150-150H810c82.71,0,150,67.29,150,150V590c0,82.71-67.29,150-150,150H740ZM190,180a90.1,90.1,0,0,0-90,90V590a90.1,90.1,0,0,0,90,90H521L680,815.13V680H810a90.1,90.1,0,0,0,90-90V270a90.1,90.1,0,0,0-90-90Z" />
  </svg>
);

// iアイコン
export const Info = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 1000 1000"
  >
    <path d="M500,340A110,110,0,1,0,390,230,110.13,110.13,0,0,0,500,340Zm0-165a55,55,0,1,1-55,55A55.06,55.06,0,0,1,500,175Z" />
    <path d="M600,380H360V528h60V680H340V840H680V680H600Zm23,351v53H397V731h80V479H420V432H540V731Z" />
  </svg>
);

// カメラアイコン
export const Camera = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="-4 0 28 20"
  >
    <path d="M7 0c-1.105 0-2 .896-2 2v18.678c-.002 2.213 3.503 3.322 7.006 3.322 3.498 0 6.994-1.106 6.994-3.322v-18.678c0-1.104-.895-2-2-2h-10zm5 22c-.553 0-1-.448-1-1s.447-1 1-1 1 .448 1 1-.447 1-1 1zm5-4h-10v-14h10v14zm-2.75-4.75v.75h.75v-.75h-.25v-.25h-.25v.25h-.25zm.5.25v.25h-.25v-.25h.25zm-5.75.5h2v-2h-2v2zm.25-1.75h1.5v1.5h-1.5v-1.5zm5 .75v-.25h.25v.25h-.25zm-4.75-.5h1v1h-1v-1zm2-.75v.5h-.25v-.5h.25zm.5-2h.25v.25h-.25v-.25zm.25-.25h.25v.25h-.25v-.25zm.25.5v-.25h.25v.25h-.25zm0-.5h.25v-1.5h-.75v.25h-.75v.25h.75v.25h.5v.75zm-.25-1v-.25h.25v.25h-.25zm-1.75 1h-1v-1h1v1zm1.5 0h-.25v-.5h-.5v-.25h.75v.25h.25v.25h-.25v.25zm-1-1.5h-2v2h2v-2zm-.25 1.75h-1.5v-1.5h1.5v1.5zm.75 0h-.25v-.25h.5v.5h-.25v-.25zm-.75.75v.25h-.25v-.25h.25zm3.75 1.5h.5v.75h-.25v-.25h-.5v.25h-.25v-.25h-.25v-.25h.25v-.25h.25v.25h.25v-.25zm-1 .5h-.25v.25h-.25v-.25h-.25v-.25h.25v-.25h-.5v-.25h-.25v.25h-.25v.25h-.5v.25h-.25v1.5h1.25v-.25h-.25v-.5h-.25v.5h-.5v-.25h.25v-.25h-.25v-.25h.75v-.25h.5v.5h-.25v.25h.25v.5h.25v-.5h.25v.25h.25v-.25h.25v-.5h.25v-.25h-.5v-.25zm-.25.75h-.25v-.25h.25v.25zm1.5-1.5v-.5h.25v.5h-.25zm-2.25 1.25v.25h-.25v-.25h.25zm1.25.75v-.25h.25v.5h-.5v-.25h.25zm-.75-5.75v2h2v-2h-2zm1.75 1.75h-1.5v-1.5h1.5v1.5zm-.25-.25h-1v-1h1v1zm.25 1h.25v.5h-.25v.25h-.5v-1h.25v.5h.25v-.25zm-1 1.5v-.75h.25v.75h-.25zm-3.25-1.75v.25h-.5v.25h.25v.25h-.75v-.25h.25v-.25h-.5v.25h-.25v-.5h1.5zm-.25 1v-.25h.25v.75h-.25v-.25h-.25v.25h-.25v-.25h-.25v.25h-.5v-.25h.25v-.25h1zm-1-.25v.25h-.25v-.25h.25zm4.75-.5h-.25v-.25h.25v.25zm-3.25 1h.25v.25h-.25v-.25zm3.75.5h-.25v-.25h.25v.25zm-1.25.25v-.25h.25v.25h-.25zm-.25-.25h.25v-.75h.5v-.25h.25v-.25h-.25v-.25h-.5v-.25h-.25v.25h-.25v-.25h-.25v.25h-.25v-.25h-.25v.25h-.25v.25h-.25v-.25h.25v-.25h-1v.25h.5v.25h-.5v.25h.25v.5h.25v-.25h.5v.5h.25v-1h.25v.5h.75v.25h-.5v.25h.5v.25zm.25-1.25h.25v.25h-.25v-.25zm-.5.25h-.25v-.25h.25v.25z" />
  </svg>
);

// 鍵アイコン
export const Key = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 512 512"
  >
    <g>
      <path
        className="st0"
        d="M458.047,168.92h-63.358v-30.029c0-3.496-0.174-6.949-0.429-10.381h0.429C389.369,56.758,329.289,0,256.199,0
            c-0.067,0-0.133,0.006-0.2,0.006c-0.067,0-0.133-0.006-0.2-0.006c-73.089,0-133.169,56.758-138.49,128.51h0.428
            c-0.255,3.432-0.428,6.885-0.428,10.381v30.029H53.953c-22.718,0-40.801,19.029-39.644,41.719l14.394,263.689
            C29.78,495.438,47.21,512,68.347,512h375.306c21.137,0,38.566-16.562,39.644-37.672l14.395-263.689
            C498.849,187.949,480.765,168.92,458.047,168.92z M276.618,341.822v57.459c0,9.893-8.095,17.988-17.988,17.988h0
            c-9.894,0-17.988-8.096-17.988-17.988v-57.459c-11.579-6.385-19.517-18.561-19.517-32.719c0-20.713,16.792-37.506,37.505-37.506
            s37.505,16.793,37.505,37.506C296.135,323.262,288.198,335.438,276.618,341.822z M339.331,168.92H172.669v-30.029
            c0-45.988,37.367-83.418,83.33-83.526c45.964,0.108,83.331,37.537,83.331,83.526V168.92z"
        style={{ fill: 'rgb(223, 187, 86)' }}
      />
    </g>
  </svg>
);

// ダウンロードアイコン
export const Download = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 512 512"
  >
    <g>
      <path
        d="M243.591,309.362c3.272,4.317,7.678,6.692,12.409,6.692c4.73,0,9.136-2.376,12.409-6.689l89.594-118.094
            c3.348-4.414,4.274-8.692,2.611-12.042c-1.666-3.35-5.631-5.198-11.168-5.198H315.14c-9.288,0-16.844-7.554-16.844-16.84V59.777
            c0-11.04-8.983-20.027-20.024-20.027h-44.546c-11.04,0-20.022,8.987-20.022,20.027v97.415c0,9.286-7.556,16.84-16.844,16.84
            h-34.305c-5.538,0-9.503,1.848-11.168,5.198c-1.665,3.35-0.738,7.628,2.609,12.046L243.591,309.362z"
        style={{ fill: 'rgb(83, 80, 80)' }}
      />
      <path
        className="st0"
        d="M445.218,294.16v111.304H66.782V294.16H0v152.648c0,14.03,11.413,25.443,25.441,25.443h461.118
          c14.028,0,25.441-11.413,25.441-25.443V294.16H445.218z"
        style={{ fill: 'rgb(83, 80, 80)' }}
      />
    </g>
  </svg>
);

// ダウンロードアイコン_インボイス
export const invDownload = (): JSX.Element => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width ="24"
    height="24"
    viewBox="0 0 512 512"
  >
<g>
	<path 
    d="M419.955,297.684H92.044c-25.353-0.008-48.476,10.33-65.076,26.954C10.338,341.23,0,364.368,0,389.721
      c0,25.353,10.338,48.491,26.968,65.084c16.585,16.63,39.723,26.968,65.076,26.96h327.91c50.86-0.008,92.045-41.206,92.045-92.044
      C511.984,338.884,470.815,297.692,419.955,297.684z M457.2,426.959c-9.6,9.562-22.63,15.415-37.246,15.423H92.044
      c-14.6-0.008-27.645-5.861-37.23-15.423c-9.57-9.592-15.416-22.63-15.431-37.238c0.015-14.6,5.861-27.638,15.431-37.23
      c9.584-9.562,22.63-15.415,37.23-15.423h327.91c14.616,0.008,27.646,5.861,37.246,15.423c9.554,9.592,15.416,22.631,15.416,37.23
      C472.616,404.329,466.754,417.367,457.2,426.959z"
    style={{fill: 'rgb(51,153,51)'}}
    />
	<path
    d="M339.271,366.406c-12.876,0-23.322,10.438-23.322,23.315c0,12.876,10.446,23.315,23.322,23.315
		  c12.877,0,23.315-10.438,23.315-23.315C362.586,376.844,352.148,366.406,339.271,366.406z"
      style={{fill: 'rgb(51,153,51)'}}
    />
	<path
    d="M414.74,366.406c-12.877,0-23.338,10.438-23.338,23.315c0,12.876,10.461,23.315,23.338,23.315
		  c12.877,0,23.308-10.438,23.308-23.315C438.047,376.844,427.617,366.406,414.74,366.406z"
    style={{fill: 'rgb(51,153,51)'}}
    />
	<path
    d="M242.658,263.585c3.4,3.777,8.262,5.93,13.338,5.93c5.092,0,9.938-2.154,13.338-5.93l68.23-75.822
      c4.754-5.261,5.938-12.83,3.061-19.307c-2.876-6.469-9.307-10.638-16.384-10.638H292.18V48.18c0-9.907-8.046-17.946-17.954-17.946
      h-36.461c-9.907,0-17.938,8.038-17.938,17.946v109.637h-32.061c-7.077,0-13.508,4.169-16.4,10.638
      c-2.876,6.476-1.676,14.046,3.062,19.307L242.658,263.585z"
    style={{fill: 'rgb(51,153,51)'}}
    />
</g>
</svg>

);