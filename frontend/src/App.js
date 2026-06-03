import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import Portfolio from "@/pages/Portfolio";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Portfolio />} />
              <Route path="/admin" element={<Portfolio openAdmin />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="bottom-right" theme="light" richColors closeButton />
        </PortfolioProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
