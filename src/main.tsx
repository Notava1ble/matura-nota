import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { App } from "./pages/App";
import "./styles.css";

const root = document.getElementById("root")!;

document.documentElement.classList.add("dark");

ReactDOM.createRoot(root).render(
  <BrowserRouter basename={import.meta.env.BASE_URL}>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>,
);
