import { StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Signup} from "@/routes/auth/signUp.jsx";
import {Home} from "@/routes/Home.jsx";
import { UserSettings } from "@/routes/UserSettings.jsx";
import {Navbar} from "@/components/navbar/navbar.jsx";
import { UserContext } from "@/provider/UserContext";
// import { UserProvider } from "@/provider/UserProvider";

const mockAuth = {
  id: 1,
  token: localStorage.getItem("token"),
  isAuthenticated: true
};

const SettingsRoute = () => {
  const auth = useContext(UserContext);
  return <UserSettings userId={auth.id} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContext.Provider value={mockAuth}>
      <BrowserRouter>
          <Navbar />
          <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/signup" element={<Signup/>} />
              <Route path="/settings" element={<SettingsRoute/>} />
          </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  </StrictMode>,
)
