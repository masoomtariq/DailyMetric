import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('habit_tracker_tour_seen');
    if (!hasSeenTour) {
      // Small delay to ensure elements are rendered
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      target: '.global-entry-fab',
      title: 'Global Entry Button',
      content: 'This is your Global Entry button! Click here to quickly add activities, daylogs, or manage your habits from anywhere in the app.',
    },
    {
      target: '.dashboard-nav',
      title: 'Dashboard',
      content: 'The Dashboard shows your daily summary, recent activities, and quick access to all your habits. It\'s your daily overview.',
    },
    {
      target: '.tracker-nav',
      title: 'Tracker',
      content: 'The Tracker page provides detailed analytics, different views (calendar, board, heatmap), and historical data for your habits.',
    },
    {
      target: '.finance-nav',
      title: 'Finance',
      content: 'Track your finances here - view transactions, monthly summaries, and manage your budget all in one place.',
    },
    {
      target: '.user-menu',
      title: 'User Menu',
      content: 'Access your profile, settings, and logout from here. You can also customize your experience.',
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setShowTour(false);
    localStorage.setItem('habit_tracker_tour_seen', 'true');
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!showTour) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {currentStepData.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-slate-600 mb-6">
            {currentStepData.content}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;