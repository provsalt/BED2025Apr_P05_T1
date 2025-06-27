import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Signup} from "@/routes/auth/signUp.jsx";
import {Home} from "@/routes/Home.jsx";
import {Navbar} from "@/components/navbar/navbar.jsx";
import {AlertProvider} from "@/provider/AlertProvider.jsx";
import {Login} from "@/routes/auth/login.jsx";
import {ChatSideBar} from "@/components/chat/ChatSideBar.jsx";
import {Chat} from "@/routes/chats/Chat.jsx";
import {SelectedChat} from "@/routes/chats/SelectedChat.jsx";
import {UserProvider} from "@/provider/UserProvider.jsx";
import {ChatLayout} from "@/components/chat/ChatLayout.jsx";

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
                <Route path="/chats" element={<ChatLayout />}>
                  <Route index element={<Chat />} />
                  <Route path=":chatId" element={<SelectedChat />}  />
                </Route>
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </UserProvider>
    </AlertProvider>
  </StrictMode>,
)
