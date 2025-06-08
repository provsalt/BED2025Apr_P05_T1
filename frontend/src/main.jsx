import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Signup} from "@/routes/auth/signUp.jsx";
import {Home} from "@/routes/Home.jsx";
import {Navbar} from "@/components/navbar/navbar.jsx";
import {AlertProvider} from "@/provider/AlertProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AlertProvider position="bottom-center">
      <BrowserRouter>
        <div className="flex flex-col min-h-svh">
          <Navbar />
          <div className="flex flex-col flex-1">
            <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/signup" element={<Signup/>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AlertProvider>
  </StrictMode>,
)
