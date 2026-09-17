import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';

const DEFAULT_HABITS = [
  { id: 1, name: 'Fitness', icon: '💪', description: 'Daily exercise and workout tracking' },
  { id: 2, name: 'Reading', icon: '📚', description: 'Track your reading habits and progress' },
  { id: 3, name: 'Hydration', icon: '💧', description: 'Monitor your daily water intake' },
  { id: 4, name: 'Meditation', icon: '🧘', description: 'Mindfulness and meditation sessions' },
  { id: 5, name: 'Sleep', icon: '😴', description: 'Track your sleep patterns and quality' },
  { id: 6, name: 'Productivity', icon: '⚡', description: 'Focus and work session tracking' },
  { id: 7, name: 'Nutrition', icon: '🥗', description: 'Healthy eating and meal tracking' },
  { id: 8, name: 'Journaling', icon: '✍️', description: 'Daily reflection and gratitude journal' },
];

const QuickSetup = ({ onComplete, onClose }) => {
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const toggleHabit = (habitId) => {
    if (selectedHabits.includes(habitId)) {
      setSelectedHabits(selectedHabits.filter(id => id !== habitId));
    } else if (selectedHabits.length < 3) {
      setSelectedHabits([...selectedHabits, habitId]);
    } else {
      showToast('You can select up to 3 habits', 'info');
    }
  };

  const handleComplete = async () => {
    if (selectedHabits.length === 0) {
      showToast('Please select at least 1 habit', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would call your API to create the selected habits
      // For now, we'll simulate it with localStorage
      const habits = DEFAULT_HABITS.filter(h => selectedHabits.includes(h.id));
      localStorage.setItem('DailyMetric_quick_setup', JSON.stringify(habits));
      
      showToast('Habits set up successfully!', 'success');
      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (error) {
      showToast('Failed to set up habits', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('DailyMetric_quick_setup_skipped', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Quick Setup
              </h2>
              <p className="text-slate-600 mt-2">
                Select up to 3 habits to get started with your tracking journey
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {DEFAULT_HABITS.map((habit) => {
              const isSelected = selectedHabits.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  disabled={isSubmitting}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }
                    ${!isSelected && selectedHabits.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                      <CheckIcon className="h-4 w-4" />
                    </div>
                  )}
                  <div className="text-3xl mb-2">{habit.icon}</div>
                  <h3 className="font-semibold text-slate-900">{habit.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{habit.description}</p>
                </button>
              );
            })}
          </div>

          {/* Selection Counter */}
          <div className="flex items-center justify-between mb-6 text-sm">
            <span className="text-slate-600">
              Selected: <span className="font-semibold text-indigo-600">{selectedHabits.length}/3</span>
            </span>
            <button
              onClick={() => setSelectedHabits([])}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Clear selection
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
            <button
              onClick={handleComplete}
              disabled={isSubmitting || selectedHabits.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : 'Start Tracking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSetup;