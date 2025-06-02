import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Signup} from "@/routes/auth/signUp.jsx";
import {Home} from "@/routes/Home.jsx";
import {Navbar} from "@/components/navbar/navbar.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <Navbar />
          <Routes>
              <Route path="/" element={<Home/>} />
              <Route path="/signup" element={<Signup/>} />
          </Routes>
      </BrowserRouter>
  </StrictMode>,
)
