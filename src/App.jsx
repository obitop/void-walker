import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import Navigation from "./components/Navigation";
import GamePage from "./pages/GamePage";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function AppContent() {
  // const { isPending } = useAuth();
  const location = useLocation();
  const isGamePage = location.pathname === "/game";

  // if (isPending) {
  //   return (
  //     <div className="loading-container">
  //       <div className="spinner">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <>
      {!isGamePage && <Navigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/game"
          element={<GamePage />}
        />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <AppContent />
    </div>
  );
}

export default App;
