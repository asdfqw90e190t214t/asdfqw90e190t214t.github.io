import './styles/AppContainer.css';

import APIHandler from '../controller/APIHandler';
import Posts from './components/Posts';

import { createContext } from 'react';

const handler = new APIHandler();

export const APIContext = createContext<APIHandler>(handler);

export default function AppContainer() {
  return (
    <div id="app">
      <APIContext.Provider value={handler}>
        <Posts />
      </APIContext.Provider>
    </div>
  );
}
