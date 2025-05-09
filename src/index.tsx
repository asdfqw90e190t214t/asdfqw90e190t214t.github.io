import './index.css';

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import AppContainer from './view/AppContainer';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/Home" element={<AppContainer />} />
        <Route path="/Info" element={<AppContainer />} />
        <Route path="*" element={<Navigate to="/Home" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
