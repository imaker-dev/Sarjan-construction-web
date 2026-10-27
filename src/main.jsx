import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "../src/styles/index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store.js";
import { Toaster } from "sonner";
import RouteLoader from "@components/feedback/RouteLoader.jsx";
import { ThemeProvider } from "@contexts/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <RouteLoader />
          <Toaster position="top-center" richColors closeButton />
          <App />
        </Router>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
