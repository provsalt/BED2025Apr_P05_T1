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
import {Chat} from "@/routes/chats/Chat.jsx";
import {SelectedChat} from "@/routes/chats/SelectedChat.jsx";
import {UserProvider} from "@/provider/UserProvider.jsx";
import {SocketProvider} from "@/provider/SocketProvider.jsx";
import {ChatLayout} from "@/components/chat/ChatLayout.jsx";
import {MealsList} from "@/routes/nutrition/MealsList.jsx";
import {MealDetail} from "@/routes/nutrition/MealDetail.jsx";
import {MedicalCreateForm} from '@/routes/medical/medicalCreateForm.jsx';
import {NutritionAnalyticsPage} from "@/routes/nutrition/nutritionAnalytics.jsx";
import {MedicationRemindersList} from '@/routes/medical/MedicationRemindersList.jsx';
import AdminProtectedRoute from '@/components/admin/AdminProtectedRoute.jsx';
import AdminDashboard from '@/routes/admin/adminDashboard.jsx';
import {CreateEventPage} from "@/routes/community/CreateEvent.jsx";
import {EditEventPage} from "@/routes/community/EditEvent.jsx";
import {MedicalDashboard} from '@/routes/medical/medicalHomePage.jsx';
import {MedicationEditForm} from '@/routes/medical/medicalEditForm.jsx';
import {MedicationQuestionnaire} from '@/routes/medical/MedicationQuestionnaire.jsx';
import {HealthSummary} from '@/routes/medical/HealthSummary.jsx';
import {TransportHomePage} from "@/routes/transport/TransportHomePage.jsx";
import {TransportMap} from "@/routes/transport/TransportMap.jsx";
import {RouteList} from "@/routes/transport/RouteList.jsx";
import {CreateRoute} from "@/routes/transport/CreateRoute.jsx";
import {EditRoute} from "@/routes/transport/EditRoute.jsx";
import {CommunityEvents} from '@/routes/community/CommunityEvents.jsx';
import {UserEvents} from '@/routes/community/userEvents.jsx';
import {UserSignedUpEvents} from '@/routes/community/UserSignedUpEvents.jsx';
import {EventDetails} from '@/routes/community/EventDetails.jsx';
import { SupportChat } from '@/components/support/SupportChat.jsx';
import {MealImageUpload} from "@/routes/nutrition/MealImageUpload.jsx";

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
                  <Route path="/medical/health-summary" element={<HealthSummary />} />
                  <Route path="/admin" element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } />
                  <Route path="/community/create" element={<CreateEventPage />} />
                  <Route path="/community" element={<CommunityEvents />} />
                  <Route path="/community/myevents" element={<UserEvents />} />
                  <Route path="/community/signups" element={<UserSignedUpEvents />} />
                  <Route path="/community/event/:id/edit" element={<EditEventPage />} />
                  <Route path="/community/:id" element={<EventDetails />} />
                  <Route path="/transport">
                    <Route index element={<TransportHomePage/>} />
                    <Route path="map" element={<TransportMap />} />
                    <Route path="routes" element={<RouteList />} />
                    <Route path="routes/create" element={<CreateRoute />} />
                    <Route path="routes/edit/:id" element={<EditRoute />} />
                  </Route>
                </Routes>
              </div>
              <SupportChat />
            </div>
          </BrowserRouter>
        </SocketProvider>
      </UserProvider>
    </AlertProvider>
  </StrictMode>,
)
