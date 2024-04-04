import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppView from './views/App';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RecoilRoot } from 'recoil';

ReactDOM.render(
  <React.Suspense >
    <RecoilRoot>
      <AppView />
    </RecoilRoot>
  </React.Suspense>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
