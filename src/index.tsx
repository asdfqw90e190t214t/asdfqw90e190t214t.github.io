import './index.css';

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './view/AppContainer';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <AppContainer />
  </StrictMode>,
);
