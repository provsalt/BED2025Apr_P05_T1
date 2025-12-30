import React from "react";
import { Pill, FileText, BarChart3, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { PageHeader } from "@/components/ui/page-header";

export const MedicalDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col flex-1 bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <PageHeader
          breadcrumbs={[{ label: "Medical" }]}
          title="Medical Care Center"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/medical/create')}>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Pill className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Create Medication Reminder</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set up new reminders for your medications with custom schedules and dosages
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/medical/reminders')}>
              
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">View My Reminders</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                See all your active medication reminders and edit or delete them as needed
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/medical/health-summary')}>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Health Review</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                View your personalized health summary and get recommendations
              </p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => navigate('/medical/questionnaire')}>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Wellness Questionnaire</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Answer questions about your wellbeing to improve your health review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};