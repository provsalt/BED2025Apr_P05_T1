import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router";
import {Signup} from "@/routes/auth/signUp.jsx";
import {Home} from "@/routes/Home.jsx";
import { Settings } from "@/routes/user/Settings.jsx";
import {Navbar} from "@/components/navbar/navbar.jsx";
import {AlertProvider} from "@/provider/AlertProvider.jsx";
import {Login} from "@/routes/auth/login.jsx";
import {MealImageUpload} from "@/routes/nutrition/mealImageUpload.jsx";
import {Chat} from "@/routes/chats/Chat.jsx";
import {SelectedChat} from "@/routes/chats/SelectedChat.jsx";
import {UserProvider} from "@/provider/UserProvider.jsx";
import {SocketProvider} from "@/provider/SocketProvider.jsx";
import {ChatLayout} from "@/components/chat/ChatLayout.jsx";
import {MedicalDashboard} from '@/routes/medical/medicalHomePage.jsx';
import {MealsList} from "@/routes/nutrition/mealsList.jsx";
import {MealDetail} from "@/routes/nutrition/mealDetail.jsx";
import {MedicationReminderForm} from '@/routes/medical/medicalCreateForm.jsx';
import {MedicationRemindersList} from '@/routes/medical/MedicationRemindersList.jsx';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute.jsx';
import AdminDashboard from '@/routes/admin/adminDashboard.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AlertProvider position="bottom-center">
      <UserProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-svh">
              <Navbar />
              <div className="flex flex-col flex-1">
                <Routes>
                  <Route path="/" element={<Home/>} />
                  <Route path="/signup" element={<Signup/>} />
                  <Route path="/login" element={<Login/>} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/chats" element={<ChatLayout />}>
                    <Route index element={<Chat />} />
                    <Route path=":chatId" element={<SelectedChat />}  />
                  </Route>
                  <Route path="/medical" element={<MedicalDashboard />} />
                  <Route path="/nutrition/upload" element={<MealImageUpload/>} />
                  <Route path="/nutrition" element={<MealsList/>} />
                  <Route path="/nutrition/:id" element={<MealDetail/>} />
                  <Route path="/medical/create" element={<MedicationReminderForm />} />
                  <Route path="/medical/reminders" element={<MedicationRemindersList />} />
                  <Route path="/admin" element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } />
                </Routes>

              </div>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </UserProvider>
    </AlertProvider>
  </StrictMode>,
)
