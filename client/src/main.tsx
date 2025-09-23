import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GitHubProvider } from "./providers/GitHubProvider";
import { ThemeProvider } from "./components/Common/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <GitHubProvider>
      <App />
    </GitHubProvider>
  </ThemeProvider>
);
