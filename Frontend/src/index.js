import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const googleClientId = '899953893413-scrnpms6ea3r4ph7ko8e030amj5t6hqr.apps.googleusercontent.com';

ReactDOM.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
