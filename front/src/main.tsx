import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from "./context/AuthContext.tsx";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <CookiesProvider>
    <AuthProvider>
      <Provider store={store}>
        <StrictMode>
          <ThemeProvider>
            <AppWrapper>
              <ToastContainer
                position="bottom-right"  // or "bottom-left", "bottom-center"
                autoClose={1000}        // Auto-close after 3s
                hideProgressBar={false} // Show progress bar
                newestOnTop={true}     // New toasts appear below older ones
                closeOnClick={true}           // Close on click
                rtl={false}             // Left-to-right
                pauseOnFocusLoss        // Pause when window loses focus
                draggable               // Allow dragging to dismiss
                pauseOnHover           // Pause on hover
                theme="light"          // or "dark", "colored"
              />
              <App />
            </AppWrapper>
          </ThemeProvider>
        </StrictMode>
      </Provider>
    </AuthProvider></CookiesProvider>
);
