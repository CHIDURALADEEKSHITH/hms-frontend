import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";
import "./common/common.css";
import Extras from "./extras/Extras";
import { initTheme } from "./extras/theme";

initTheme();

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Extras />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);