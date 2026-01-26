// ローディング用コンポーネント
import React from 'react';

const Loading = (): JSX.Element => (
  <div>
    <img
      src="./img/loading.gif"
      alt="loading-gif"
      data-testid="loading-gif"
    />
  </div>
);

export default Loading;
