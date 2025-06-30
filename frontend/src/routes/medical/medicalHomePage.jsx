import {React} from "react";
import { Pill, FileText, BarChart3, HelpCircle, ArrowLeft } from 'lucide-react';

export const MedicalDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-medium text-gray-900">MedCare - Medical Dashboard</h1>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors">
                View Profile
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Emergency Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Medical Care Center</h2>
        
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Create Medication Reminder Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Create Medication Reminder</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Set up new reminders for your medications with custom schedules and dosages
              </p>
            </div>
          </div>

          {/* View My Reminders Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">View My Reminders</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                See all your active medication reminders and edit or delete them as needed
              </p>
            </div>
          </div>

          {/* Health Review Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Health Review</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                View your personalized health summary and get recommendations
              </p>
            </div>
          </div>

          {/* Wellness Questionnaire Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Wellness Questionnaire</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Answer questions about your wellbeing to improve your health review
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}