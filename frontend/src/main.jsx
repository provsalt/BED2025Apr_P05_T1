import { StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Signup} from "@/routes/auth/signUp.jsx";
import {Home} from "@/routes/Home.jsx";
import { UserSettings } from "@/routes/UserSettings.jsx";
import {Navbar} from "@/components/navbar/navbar.jsx";
import {AlertProvider} from "@/provider/AlertProvider.jsx";
import {Login} from "@/routes/auth/login.jsx";
import {UserProvider} from "@/provider/UserProvider.jsx";
import { UserContext } from "@/provider/UserContext";
// import { UserProvider } from "@/provider/UserProvider";

const SettingsRoute = () => {
  const auth = useContext(UserContext);
  return <UserSettings userId={auth?.id || 1} />;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AlertProvider position="bottom-center">
      <UserProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-svh">
            <Navbar />
            <div className="flex flex-col flex-1">
              <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/signup" element={<Signup/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/settings" element={<SettingsRoute/>} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </UserProvider>
    </AlertProvider>
  </StrictMode>,
)
