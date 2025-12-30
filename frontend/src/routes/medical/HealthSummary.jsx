import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, FileText, RefreshCw, Clipboard, CheckCircle } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { PageHeader } from "@/components/ui/page-header";

export const HealthSummary = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState({ open: false, type: '', title: '', message: '', action: '' });
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(false);
  const [copied, setCopied] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const checkExistingQuestionnaire = async () => {
    try {
      setCheckingQuestionnaire(true);
      const response = await fetcher(`${backendUrl}/api/medications/questionnaire/latest`);
      setHasQuestionnaire(response.success && response.data);
    } catch (err) {
      setHasQuestionnaire(false);
    } finally {
      setCheckingQuestionnaire(false);
    }
  };

  const fetchHealthSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher(`${backendUrl}/api/medications/health-summary`);

      if (response.success) {
        setSummary(response.data);
      } else {
        // Handle specific error cases
        if (response.error && response.error.includes("No health summary found")) {
          setError("No health summary found");
        } else if (response.error && response.error.includes("not found")) {
          setError("No health summary found");
        } else {
          setError(response.error || "We can't load your health summary at this time.");
        }
        // Check for existing questionnaire when no summary is found
        await checkExistingQuestionnaire();
      }
    } catch (err) {
      // Parse error message from response if available
      let errorMessage = "We can't load your health summary at this time.";

      if (err.message) {
        try {
          // Try to parse JSON error response
          const errorData = JSON.parse(err.message);
          if (errorData.error) {
            if (errorData.error.includes("No health summary found") || errorData.error.includes("not found")) {
              errorMessage = "No health summary found";
            } else {
              errorMessage = errorData.error;
            }
          }
        } catch {
          // If not JSON, use the raw message
          if (err.message.includes("No health summary found") || err.message.includes("not found")) {
            errorMessage = "No health summary found";
          } else {
            errorMessage = err.message;
          }
        }
      }

      setError(errorMessage);
      // Check for existing questionnaire
      await checkExistingQuestionnaire();
    } finally {
      setLoading(false);
    }
  };

  const handleHealthSummaryError = (errorMessage) => {
    let finalErrorMessage = "We couldn't generate your health summary at this time.";

    if (errorMessage) {
      if (errorMessage.includes("No questionnaire found")) {
        finalErrorMessage = "Please complete the wellness questionnaire first. This helps us create a personalized health summary for you.";
      } else if (errorMessage.includes("OpenAI")) {
        finalErrorMessage = "Our health summary service is temporarily unavailable. Please try again in a few minutes.";
      } else {
        finalErrorMessage = errorMessage;
      }
    }

    setDialog({
      open: true,
      type: 'error',
      title: 'Unable to Generate Health Summary',
      message: finalErrorMessage
    });
  };

  const generateHealthSummary = async () => {
    try {
      setGenerating(true);
      setError(null);
      const response = await fetcher(`${backendUrl}/api/medications/health-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.success) {
        setSummary({
          summary: response.summary,
          created_at: response.generated_at
        });
        setDialog({
          open: true,
          type: 'success',
          title: 'Health Summary Generated Successfully!',
          message: 'Your personalized health summary has been created based on your questionnaire responses. You can now review your health insights and recommendations.'
        });
      } else {
        handleHealthSummaryError(response.error);
      }
    } catch (err) {
      // Parse error message if it's JSON
      let errorMessage = "We encountered an issue while generating your health summary. Please try again.";

      if (err.message) {
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          errorMessage = err.message;
        }
      }

      handleHealthSummaryError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    setDialog({
      open: true,
      type: 'confirm',
      title: 'Regenerate Health Summary',
      message: 'How would you like to regenerate your health summary?',
      options: [
        { label: 'Use existing questionnaire data', action: 'useExisting' },
        { label: 'Complete new questionnaire', action: 'newQuestionnaire' }
      ]
    });
  };

  const handleDialogAction = (action) => {
    if (dialog.type === 'confirm') {
      if (action === 'useExisting') {
        generateHealthSummary();
      } else if (action === 'newQuestionnaire') {
        navigate('/medical/questionnaire');
      }
    }
    setDialog({ open: false, type: '', title: '', message: '', action: '' });
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary.summary);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleGenerateFromExisting = () => {
    setDialog({
      open: true,
      type: 'confirm',
      title: 'Generate Health Summary',
      message: 'Would you like to create a new health summary using your existing questionnaire data? This will provide fresh insights based on your current responses.',
      action: 'useExisting'
    });
  };

  useEffect(() => {
    fetchHealthSummary();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const renderCopyButtonText = () => {
    if (copied) {
      return 'Copied!';
    } else {
      return 'Copy';
    }
  };

  const renderDialogTitleClass = () => {
    if (dialog.type === 'error') {
      return 'text-red-600';
    } else if (dialog.type === 'success') {
      return 'text-green-600';
    } else {
      return '';
    }
  };

  const renderButtonVariant = (index) => {
    if (index === 0) {
      return "bg-white text-black border border-black hover:bg-gray-50 w-full cursor-pointer";
    } else {
      return "w-full cursor-pointer";
    }
  };

  const renderErrorContent = () => {
    if (error === "No health summary found") {
      return "You don't have a health summary yet. Complete the wellness questionnaire to generate your personalized health insights.";
    } else {
      return "There was an issue loading your health summary. Please try again";
    }
  };

  const renderNoSummaryFound = () => {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Health Summary Found</h2>

          {checkingQuestionnaire && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              <p className="text-gray-600">Checking for existing questionnaire...</p>
            </div>
          )}

          {!checkingQuestionnaire && hasQuestionnaire && (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-black" />
                <p className="text-gray-600">You have existing questionnaire data</p>
              </div>
              <p className="text-gray-600 mb-6">
                You can generate a health summary using your existing questionnaire data or complete a new questionnaire.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="bg-primary text-white hover:bg-gray-900 w-full sm:w-auto cursor-pointer"
                  onClick={handleGenerateFromExisting}>

                  Generate from Existing Data
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/medical/questionnaire')}
                  className="w-full sm:w-auto cursor-pointer">
                  Complete New Questionnaire
                </Button>
              </div>
            </div>
          )}

          {!checkingQuestionnaire && !hasQuestionnaire && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                You haven't completed the wellness questionnaire yet. Complete the questionnaire to generate your personalized health summary.
              </p>
              <div className="flex justify-center">
                <Button
                  className="bg-primary text-white hover:bg-gray-900 w-full sm:w-auto cursor-pointer"
                  onClick={() => navigate('/medical/questionnaire')}>
                  Complete Wellness Questionnaire
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderErrorState = () => {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <div className="mb-6">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Health Summary</h2>
            <p className="text-gray-600 mb-6">
              {renderErrorContent()}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="bg-primary text-white hover:bg-gray-900 w-full sm:w-auto cursor-pointer"
              onClick={fetchHealthSummary}
              disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2 text-white" />}
              {!loading && <RefreshCw className="h-4 w-4 mr-2" />}
              Try Again
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="bg-primary text-white hover:bg-gray-900 w-full sm:w-auto cursor-pointer"
                onClick={() => navigate('/medical/questionnaire')}>
                Complete Questionnaire
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/medical')}
                className="w-full sm:w-auto cursor-pointer">
                Back to Medical Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSummaryContent = () => {
    const sections = summary?.summary?.split(/(?=^\*\*.*\*\*)/m) || [];
    return sections.map((section, index) => {
      if (!section.trim()) {
        return null;
      }

      // Extract header and content
      const headerMatch = section.match(/^\*\*(.*?)\*\*/);
      if (headerMatch) {
        const header = headerMatch[1].trim();
        const content = section.replace(/^\*\*.*?\*\*\s*/, '').trim();


        if (header.toLowerCase().includes('personalized health summary') && !content) {
          return null;
        }

        return (
          <Card key={index} className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {header}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-700 leading-relaxed">
                {content.split('\n\n').map((paragraph, pIndex) => {
                  if (paragraph.trim()) {
                    // Check if this paragraph contains numbered lists
                    const numberedListMatch = paragraph.match(/^- (\d+)\.\s+(.+)$/gm);

                    if (numberedListMatch && numberedListMatch.length > 0) {
                      // Process numbered lists
                      const listItems = numberedListMatch.map((item, itemIndex) => {
                        const match = item.match(/^- (\d+)\.\s+(.+)$/);
                        if (match) {
                          const number = match[1];
                          const content = match[2];
                          const processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          return (
                            <li key={itemIndex} className="mb-2 last:mb-0"
                              dangerouslySetInnerHTML={{ __html: processedContent }}>
                            </li>
                          );
                        }
                        return null;
                      });

                      return (
                        <ol key={pIndex} className="list-decimal list-inside space-y-2 mb-4 last:mb-0">
                          {listItems}
                        </ol>
                      );
                    } else {
                      // Process regular bullet points
                      const bulletPoints = paragraph.split(/(?=^- \*\*)/m);

                      if (bulletPoints.length > 1) {
                        //if we have bullet points, render each one separately
                        return bulletPoints.map((bullet, bIndex) => {
                          if (bullet.trim()) {
                            //check if this bullet starts with "- " and has bold text after
                            let processedText = bullet.trim();
                            if (processedText.startsWith('- ') && processedText.includes('**')) {
                              //keep the dash and process bold text
                              processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            } else if (processedText.startsWith('- ')) {
                              //remove the dash if no bold text follows
                              processedText = processedText.replace(/^- /, '');
                              processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            } else {
                              //regular processing
                              processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            }
                            return (
                              <p key={`${pIndex}-${bIndex}`} className="mb-3 last:mb-0"
                                dangerouslySetInnerHTML={{ __html: processedText }}>
                              </p>
                            );
                          }
                          return null;
                        });
                      } else {
                        let processedText = paragraph.trim();
                        //check if this paragraph starts with "- " and has bold text after
                        if (processedText.startsWith('- ') && processedText.includes('**')) {
                          //keep the dash and process bold text
                          processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        } else if (processedText.startsWith('- ')) {
                          //remove the dash if no bold text follows
                          processedText = processedText.replace(/^- /, '');
                          processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        } else {
                          //regular processing
                          processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        }
                        return (
                          <p key={pIndex} className="mb-3 last:mb-0"
                            dangerouslySetInnerHTML={{ __html: processedText }}>
                          </p>
                        );
                      }
                    }
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        );
      } else {
        // Handle content without headers
        return (
          <Card key={index} className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="text-gray-700 leading-relaxed">
                {section.split('\n\n').map((paragraph, pIndex) => {
                  if (paragraph.trim()) {
                    // Check if this paragraph contains numbered lists
                    const numberedListMatch = paragraph.match(/^- (\d+)\.\s+(.+)$/gm);

                    if (numberedListMatch && numberedListMatch.length > 0) {
                      // Process numbered lists
                      const listItems = numberedListMatch.map((item, itemIndex) => {
                        const match = item.match(/^- (\d+)\.\s+(.+)$/);
                        if (match) {
                          const number = match[1];
                          const content = match[2];
                          const processedContent = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                          return (
                            <li key={itemIndex} className="mb-2 last:mb-0"
                              dangerouslySetInnerHTML={{ __html: processedContent }}>
                            </li>
                          );
                        }
                        return null;
                      });

                      return (
                        <ol key={pIndex} className="list-decimal list-inside space-y-2 mb-4 last:mb-0">
                          {listItems}
                        </ol>
                      );
                    } else {
                      // split by bullet points
                      const bulletPoints = paragraph.split(/(?=^- \*\*)/m);

                      if (bulletPoints.length > 1) {
                        //if we have bullet points, render each one separately
                        return bulletPoints.map((bullet, bIndex) => {
                          if (bullet.trim()) {
                            //check if this bullet starts with "- " and has bold text after
                            let processedText = bullet.trim();
                            if (processedText.startsWith('- ') && processedText.includes('**')) {
                              //keep the dash and process bold text
                              processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            } else if (processedText.startsWith('- ')) {
                              //remove the dash if no bold text follows
                              processedText = processedText.replace(/^- /, '');
                              processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            } else {
                              //regular processing
                              processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            }
                            return (
                              <p key={`${pIndex}-${bIndex}`} className="mb-3 last:mb-0"
                                dangerouslySetInnerHTML={{ __html: processedText }}>
                              </p>
                            );
                          }
                          return null;
                        });
                      } else {
                        let processedText = paragraph.trim();
                        // Check if this paragraph starts with "- " and has bold text after
                        if (processedText.startsWith('- ') && processedText.includes('**')) {
                          //keep the dash and process bold text
                          processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        } else if (processedText.startsWith('- ')) {
                          //Remove the dash if no bold text follows
                          processedText = processedText.replace(/^- /, '');
                          processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        } else {
                          // Regular processing
                          processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        }
                        return (
                          <p key={pIndex} className="mb-3 last:mb-0"
                            dangerouslySetInnerHTML={{ __html: processedText }}>
                          </p>
                        );
                      }
                    }
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        );
      }
    });
  };

  const renderMainContent = () => {
    if (error && error.includes("No health summary found")) {
      return renderNoSummaryFound();
    }

    if (error) {
      return renderErrorState();
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Your Personalized Health Summary
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySummary}
                  className="cursor-pointer">

                  <Clipboard className="h-4 w-4 mr-2" />
                  {renderCopyButtonText()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="cursor-pointer">
                  {generating && <Loader2 className="h-4 w-4 animate-spin mr-2 text-black" />}
                  {!generating && <RefreshCw className="h-4 w-4 mr-2" />}
                  Regenerate
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {renderSummaryContent()}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
              <p className="text-gray-600">Loading your health summary...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //main layout structure
  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <PageHeader
          breadcrumbs={[
            { label: "Medical", href: "/medical" },
            { label: "Health Summary" },
          ]}
          title="Health Summary"
        />
        {summary?.created_at && (
          <p className="text-gray-600 mb-6">
            Generated on {formatDate(summary.created_at)}
          </p>
        )}
        </div>

        {renderMainContent()}

      {/* Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={renderDialogTitleClass()}>
              {dialog.title}
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">{dialog.message}</p>

          {dialog.type === 'confirm' && dialog.options && (
            <div className="space-y-3 mt-4">
              {dialog.options.map((option, index) => {
                return (
                  <Button
                    key={index}
                    className={renderButtonVariant(index)}
                    onClick={() => {
                      setDialog({ ...dialog, action: option.action });
                      handleDialogAction(option.action);
                    }}>
                    {option.label}
                  </Button>
                );
              })}
            </div>
          )}

          <DialogFooter>
            {dialog.type === 'confirm' && !dialog.options && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setDialog({ open: false, type: '', title: '', message: '', action: '' })}
                  className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  className="bg-primary text-white hover:bg-gray-900 cursor-pointer"
                  onClick={() => handleDialogAction(dialog.action)}>
                  Continue
                </Button>
              </>
            )}
            {dialog.type !== 'confirm' && (
              <Button
                className="bg-primary text-white hover:bg-gray-900 cursor-pointer"
                onClick={() => setDialog({ open: false, type: '', title: '', message: '', action: '' })}>
                OK
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 