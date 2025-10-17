import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrimeReactProvider } from "primereact/api";
import { RouterProvider } from 'react-router-dom';
import { useAuthStore } from "@/store/StoreAuth";
import router from './routes/router';

import 'primereact/resources/themes/lara-light-indigo/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css'; //icons
import 'primeflex/primeflex.css'; // flex

useAuthStore.getState().initFromStorage();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PrimeReactProvider>
       <RouterProvider router={router} />
    </PrimeReactProvider>
  </React.StrictMode>
)