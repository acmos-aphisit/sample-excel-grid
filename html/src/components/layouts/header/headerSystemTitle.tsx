import React from 'react';

// ヘッダー用コンポーネント
const HeaderSystemTitle = (): JSX.Element => {
  // ヘッダ画像
  const headerImage = './img/drop-of-water.png';
  const headerText = import.meta.env.VITE_SYSTEM_NAME;

    return (
        <div data-testid="HDR-1-1" className="header_system">
          <img data-testid="HDR-1-1-1" id='header-system-title-img' className="header_system_img" src={headerImage} alt={headerText} />
          <span data-testid="HDR-1-1-2" id='header-system-title-text' className="header_system_name" >{headerText}</span>
        </div>
    );
};

export default HeaderSystemTitle;