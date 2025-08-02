import React, { useState, useContext } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserContext } from "@/provider/UserContext.js";
import { fetcher } from "@/lib/fetcher.js";
import { useNavigate, Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const initialState = {
  difficulty_walking: "",
  assistive_device: "",
  symptoms_or_pain: "",
  allergies: "",
  medical_conditions: "",
  exercise_frequency: "",
};

export function MedicationQuestionnaire() {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '', message: '' });
  const user = useContext(UserContext);
  const navigate = useNavigate();

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check for missing fields 
    if (!form.difficulty_walking || !form.assistive_device || !form.symptoms_or_pain || !form.allergies || !form.medical_conditions || !form.exercise_frequency) {
      setDialog({ open: true, type: 'error', message: 'Please fill in all fields before submitting.' });
      return;
    }
    setSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      // POST to /api/medications/questionnaire
      const res = await fetcher(`${backendUrl}/api/medications/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.success) {
        // Generate health summary after successful questionnaire submission
        try {
          const summaryRes = await fetcher(`${backendUrl}/api/medications/health-summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          
          if (summaryRes.success) {
            setDialog({ 
              open: true, 
              type: 'success', 
              message: 'Questionnaire submitted successfully! Your health summary has been generated. You will be redirected to view it.' 
            });
            //after delay, navigate to summary
            setTimeout(() => {
              navigate('/medical/health-summary');
            }, 2000);
          } else {
            setDialog({ 
              open: true, 
              type: 'success', 
              message: 'Questionnaire submitted successfully! However, there was an issue generating your health summary. You can try generating it later again from the Health Review page.' 
            });
          }
        } catch (summaryErr) {
          setDialog({ 
            open: true, 
            type: 'success', 
            message: 'Questionnaire submitted successfully! However, there was an issue generating your health summary. You can try generating it later again from the Health Review page.' 
          });
        }
      } else {
        setDialog({ open: true, type: 'error', message: res.message || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      setDialog({ open: true, type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderSubmitButtonText = () => {
    if (submitting) {
      return "Submitting...";
    } else {
      return "Submit Questionnaire";
    }
  };

  const renderDialogTitle = () => {
    if (dialog.type === 'error') {
      return 'Error';
    } else {
      return 'Success';
    }
  };

  const renderDialogTitleClass = () => {
    if (dialog.type === 'error') {
      return 'text-red-700';
    } else {
      return 'text-green-700';
    }
  };

  const handleDialogOkayClick = () => {
    setDialog(d => ({ ...d, open: false }));
    if (dialog.type === 'success') {
      navigate('/medical');
    }
  };

  return (
    <div>
      <Breadcrumb className="p-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/medical">Medical</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbPage>Questionnaire</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <form onSubmit={handleSubmit} className="w-full p-6 bg-muted">
      <div className="bg-background rounded-lg shadow-sm border p-6 max-w-md mx-auto">
        <h1 className="text-xl font-semibold text-foreground mb-6">Wellness Questionnaire</h1>
        <div className="space-y-6">
          {/* Difficulty Walking */}
          <div className="space-y-2">
            <Label htmlFor="difficulty_walking" className="text-sm font-medium text-foreground">
              Do you have difficulty walking? *
            </Label>
            <RadioGroup
              id="difficulty_walking"
              value={form.difficulty_walking}
              onValueChange={v => handleChange("difficulty_walking", v)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem className="cursor-pointer" value="Yes" id="difficulty_yes" />
                <Label className="cursor-pointer" htmlFor="difficulty_yes">Yes</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem className="cursor-pointer" value="No" id="difficulty_no" />
                <Label className="cursor-pointer" htmlFor="difficulty_no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Assistive Device */}
          <div className="space-y-2">
            <Label htmlFor="assistive_device" className="text-sm font-medium text-foreground">
              Do you use any assistive device? *
            </Label>
            <Input
              id="assistive_device"
              value={form.assistive_device}
              onChange={e => handleChange("assistive_device", e.target.value)}
              placeholder="e.g., None, Cane, Walker, Wheelchair, Other"
              className="w-full"
            />
          </div>

          {/* Symptoms or Pain */}
          <div className="space-y-2">
            <Label htmlFor="symptoms_or_pain" className="text-sm font-medium text-foreground">
              Please describe any symptoms or pain: *
            </Label>
            <Textarea
              id="symptoms_or_pain"
              value={form.symptoms_or_pain}
              onChange={e => handleChange("symptoms_or_pain", e.target.value)}
              placeholder="Describe symptoms or pain"
              className="w-full h-16 resize-none"
            />
          </div>

          {/* Allergies */}
          <div className="space-y-2">
            <Label htmlFor="allergies" className="text-sm font-medium text-foreground">
              Do you have any allergies? *
            </Label>
            <Textarea
              id="allergies"
              value={form.allergies}
              onChange={e => handleChange("allergies", e.target.value)}
              placeholder="List allergies"
              className="w-full h-16 resize-none"
            />
          </div>

          {/* Medical Conditions */}
          <div className="space-y-2">
            <Label htmlFor="medical_conditions" className="text-sm font-medium text-foreground">
              Do you have any medical conditions? *
            </Label>
            <Textarea
              id="medical_conditions"
              value={form.medical_conditions}
              onChange={e => handleChange("medical_conditions", e.target.value)}
              placeholder="List medical conditions"
              className="w-full h-16 resize-none"
            />
          </div>

          {/* Exercise Frequency */}
          <div className="space-y-2">
            <Label htmlFor="exercise_frequency" className="text-sm font-medium text-foreground">
              How often do you exercise? *
            </Label>
            <RadioGroup
              id="exercise_frequency"
              value={form.exercise_frequency}
              onValueChange={v => handleChange("exercise_frequency", v)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Daily" id="exercise_daily" className="cursor-pointer" />
                <Label htmlFor="exercise_daily" className="cursor-pointer">Daily</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Several times a week" id="exercise_several" className="cursor-pointer" />
                <Label htmlFor="exercise_several" className="cursor-pointer">Several times a week</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Once a week" id="exercise_once" className="cursor-pointer" />
                <Label htmlFor="exercise_once" className="cursor-pointer">Once a week</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Rarely" id="exercise_rarely" className="cursor-pointer" />
                <Label htmlFor="exercise_rarely" className="cursor-pointer">Rarely</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="Never" id="exercise_never" className="cursor-pointer" />
                <Label htmlFor="exercise_never" className="cursor-pointer">Never</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            type="submit" 
            disabled={submitting} 
            className="bg-black text-white hover:bg-gray-900 w-full cursor-pointer">
            {renderSubmitButtonText()}
          </Button>
        </div>
      </div>
      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={dialog.type === 'error' ? 'text-destructive' : 'text-primary'}>
              {dialog.type === 'error' ? 'Error' : 'Success'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">{dialog.message}</div>
          <DialogFooter>
            <Button 
              className="bg-black text-white hover:bg-gray-900 cursor-pointer" 
              onClick={handleDialogOkayClick}>
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </form>
    </div>
  );
} 