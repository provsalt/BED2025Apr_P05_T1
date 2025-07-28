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
import {MealsList} from "@/routes/nutrition/mealsList.jsx";
import {MealDetail} from "@/routes/nutrition/mealDetail.jsx";
import {NutritionAnalyticsPage} from "@/routes/nutrition/nutritionAnalytics.jsx";
import { MedicalCreateForm } from '@/routes/medical/medicalCreateForm.jsx';
import {MedicationRemindersList} from '@/routes/medical/MedicationRemindersList.jsx';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute.jsx';
import AdminDashboard from '@/routes/admin/adminDashboard.jsx';
import {CreateEventPage} from "@/routes/community/CreateEvent.jsx";
import {MedicalDashboard } from '@/routes/medical/medicalHomePage.jsx';
import { MedicationEditForm }  from '@/routes/medical/medicalEditForm.jsx';
import { MedicationQuestionnaire } from '@/routes/medical/MedicationQuestionnaire.jsx';
import {TransportHomePage} from "@/routes/transport/TransportHomePage.jsx";
import {TransportMap} from "@/routes/transport/TransportMap.jsx";
import {RouteList} from "@/routes/transport/RouteList.jsx";
import {CreateRoute} from "@/routes/transport/CreateRoute.jsx";
import {EditRoute} from "@/routes/transport/EditRoute.jsx";
import { CommunityEvents } from '@/routes/community/CommunityEvents.jsx';

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
                  <Route path="/nutrition/analytics" element={<NutritionAnalyticsPage/>} />
                  <Route path="/nutrition" element={<MealsList/>} />
                  <Route path="/nutrition/:id" element={<MealDetail/>} />
                  <Route path="/medical/create" element={<MedicalCreateForm />} />
                  <Route path="/medical/reminders" element={<MedicationRemindersList />} />
                  <Route path="/medical/edit/:id" element={<MedicationEditForm />} />
                  <Route path="/medical/questionnaire" element={<MedicationQuestionnaire />} />
                  <Route path="/admin" element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } />
                  <Route path="/community/create" element={<CreateEventPage />} />
                  <Route path="/community" element={<CommunityEvents />} />
                  <Route path="/transport">
                    <Route index element={<TransportHomePage/>} />
                    <Route path="map" element={<TransportMap />} />
                    <Route path="routes" element={<RouteList />} />
                    <Route path="routes/create" element={<CreateRoute />} />
                    <Route path="routes/edit/:id" element={<EditRoute />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </UserProvider>
    </AlertProvider>
  </StrictMode>,
)
