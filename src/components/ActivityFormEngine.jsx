import { useState } from 'react';
import { useGoals } from '../hooks/useApi';

const ActivityFormEngine = ({ onSubmit, initialData = {}, isLoading = false }) => {
  const { data: goalsData } = useGoals();
  const goals = goalsData || [];

  const [formData, setFormData] = useState({
    date: initialData.date || new Date().toISOString().split('T')[0],
    category: initialData.category || 'habit',
    note: initialData.note || '',
    // Prayer fields
    prayer_type: initialData.prayer_type || '',
    custom_prayer_type: initialData.custom_prayer_type || '',
    prayer_done: initialData.prayer_done || false,
    prayer_place: initialData.prayer_place || '',
    custom_prayer_place: initialData.custom_prayer_place || '',
    prayer_on_time: initialData.prayer_on_time || false,
    prayer_jamaat: initialData.prayer_jamaat || false,
    // Meal fields
    meal_type: initialData.meal_type || '',
    custom_meal_type: initialData.custom_meal_type || '',
    meal_done: initialData.meal_done || false,
    meal_goal_name: initialData.meal_goal_name || '',
    meal_time: initialData.meal_time || '',
    meal_quantity: initialData.meal_quantity || '',
    meal_place: initialData.meal_place || '',
    custom_meal_place: initialData.custom_meal_place || '',
    // Habit fields
    habit_type: initialData.habit_type || '',
    habit_done: initialData.habit_done || false,
    habit_goal_name: initialData.habit_goal_name || '',
    habit_time: initialData.habit_time || '',
    // Exercise fields
    exercise_goal_name: initialData.exercise_goal_name || '',
    exercise_type: initialData.exercise_type || '',
    exercise_time: initialData.exercise_time || '',
    exercise_duration: initialData.exercise_duration || '',
    exercise_sets: initialData.exercise_sets || '',
    exercise_reps: initialData.exercise_reps || '',
    // Productivity fields
    productivity_goal_name: initialData.productivity_goal_name || '',
    productivity_type: initialData.productivity_type || '',
    productivity_place: initialData.productivity_place || '',
    custom_productivity_place: initialData.custom_productivity_place || '',
    productivity_time: initialData.productivity_time || '',
    productivity_duration: initialData.productivity_duration || '',
    productivity_what_did: initialData.productivity_what_did || '',
    productivity_result: initialData.productivity_result || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const preparePayload = () => {
    const payload = {
      date: formData.date,
      category: formData.category,
      note: formData.note,
    };

    // Prayer logic
    if (formData.category === 'prayer') {
      payload.type = formData.prayer_type === 'Other' ? formData.custom_prayer_type : formData.prayer_type;
      payload.done = formData.prayer_done;
      if (formData.prayer_done) {
        payload.place = formData.prayer_place === 'Others' ? formData.custom_prayer_place : formData.prayer_place;
        payload.on_time = formData.prayer_on_time;
        if (formData.prayer_on_time) {
          payload.jamaat = formData.prayer_jamaat;
        }
      }
      // Strictly exclude goal_name for prayer
      delete payload.goal_name;
    }

    // Meal logic
    if (formData.category === 'meal') {
      payload.type = formData.meal_type === 'Others' ? formData.custom_meal_type : formData.meal_type;
      payload.done = formData.meal_done;
      if (formData.meal_done) {
        payload.goal_name = formData.meal_goal_name;
        payload.time = formData.meal_time;
        payload.quantity = formData.meal_quantity;
        payload.place = formData.meal_place === 'Others' ? formData.custom_meal_place : formData.meal_place;
      }
    }

    // Habit logic
    if (formData.category === 'habit') {
      payload.type = formData.habit_type;
      payload.done = formData.habit_done;
      if (formData.habit_done) {
        payload.goal_name = formData.habit_goal_name;
        payload.time = formData.habit_time;
      }
    }

    // Exercise logic (bypass Done checkbox)
    if (formData.category === 'exercise') {
      payload.goal_name = formData.exercise_goal_name;
      payload.type = formData.exercise_type;
      payload.time = formData.exercise_time;
      payload.duration = formData.exercise_duration;
      payload.sets = formData.exercise_sets;
      payload.reps = formData.exercise_reps;
    }

    // Productivity logic (bypass Done checkbox)
    if (formData.category === 'productivity') {
      payload.goal_name = formData.productivity_goal_name;
      payload.type = formData.productivity_type;
      payload.place = formData.productivity_place === 'Others' ? formData.custom_productivity_place : formData.productivity_place;
      payload.time = formData.productivity_time;
      payload.duration = formData.productivity_duration;
      payload.what_did = formData.productivity_what_did;
      payload.result = formData.productivity_result;
    }

    // Global payload interceptor - replace dropdown values with custom text when "Other/Others" is selected
    Object.keys(payload).forEach(key => {
      if (payload[key] === 'Other' || payload[key] === 'Others') {
        const customKey = `custom_${key}`;
        if (formData[customKey]) {
          payload[key] = formData[customKey];
        }
      }
    });

    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = preparePayload();
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Base Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Activity Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="prayer">Prayer</option>
            <option value="meal">Meal</option>
            <option value="habit">Habit</option>
            <option value="exercise">Exercise</option>
            <option value="productivity">Productivity</option>
          </select>
        </div>
      </div>

      {/* Prayer Fields */}
      {formData.category === 'prayer' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={formData.prayer_type}
              onChange={(e) => handleChange('prayer_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select type</option>
              <option value="Fajar">Fajar</option>
              <option value="Dhuhr">Dhuhr</option>
              <option value="Asr">Asr</option>
              <option value="Maghrib">Maghrib</option>
              <option value="Isha">Isha</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {formData.prayer_type === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custom Type</label>
              <input
                type="text"
                value={formData.custom_prayer_type}
                onChange={(e) => handleChange('custom_prayer_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prayer_done"
              checked={formData.prayer_done}
              onChange={(e) => handleChange('prayer_done', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="prayer_done" className="text-sm font-medium text-slate-700">Done</label>
          </div>
          {formData.prayer_done && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Place</label>
                <select
                  value={formData.prayer_place}
                  onChange={(e) => handleChange('prayer_place', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select place</option>
                  <option value="Masjid">Masjid</option>
                  <option value="Home">Home</option>
                  <option value="Work/Prayer Room">Work/Prayer Room</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {formData.prayer_place === 'Others' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custom Place</label>
                  <input
                    type="text"
                    value={formData.custom_prayer_place}
                    onChange={(e) => handleChange('custom_prayer_place', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prayer_on_time"
                  checked={formData.prayer_on_time}
                  onChange={(e) => handleChange('prayer_on_time', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="prayer_on_time" className="text-sm font-medium text-slate-700">On Time</label>
              </div>
              {formData.prayer_on_time && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prayer_jamaat"
                    checked={formData.prayer_jamaat}
                    onChange={(e) => handleChange('prayer_jamaat', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="prayer_jamaat" className="text-sm font-medium text-slate-700">Jamaat</label>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Meal Fields */}
      {formData.category === 'meal' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={formData.meal_type}
              onChange={(e) => handleChange('meal_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select type</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
              <option value="Others">Others</option>
            </select>
          </div>
          {formData.meal_type === 'Others' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Custom Type</label>
              <input
                type="text"
                value={formData.custom_meal_type}
                onChange={(e) => handleChange('custom_meal_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="meal_done"
              checked={formData.meal_done}
              onChange={(e) => handleChange('meal_done', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="meal_done" className="text-sm font-medium text-slate-700">Done</label>
          </div>
          {formData.meal_done && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                <select
                  value={formData.meal_goal_name}
                  onChange={(e) => handleChange('meal_goal_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select goal (optional)</option>
                  {goals.map((goal, index) => (
                    <option key={index} value={goal.title || goal}>{goal.title || goal}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.meal_time}
                  onChange={(e) => handleChange('meal_time', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="text"
                  value={formData.meal_quantity}
                  onChange={(e) => handleChange('meal_quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Place</label>
                <select
                  value={formData.meal_place}
                  onChange={(e) => handleChange('meal_place', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select place</option>
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              {formData.meal_place === 'Others' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Custom Place</label>
                  <input
                    type="text"
                    value={formData.custom_meal_place}
                    onChange={(e) => handleChange('custom_meal_place', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Habit Fields */}
      {formData.category === 'habit' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <input
              type="text"
              value={formData.habit_type}
              onChange={(e) => handleChange('habit_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Reading, Meditation"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="habit_done"
              checked={formData.habit_done}
              onChange={(e) => handleChange('habit_done', e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="habit_done" className="text-sm font-medium text-slate-700">Done</label>
          </div>
          {formData.habit_done && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                <select
                  value={formData.habit_goal_name}
                  onChange={(e) => handleChange('habit_goal_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select goal (optional)</option>
                  {goals.map((goal, index) => (
                    <option key={index} value={goal.title || goal}>{goal.title || goal}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.habit_time}
                  onChange={(e) => handleChange('habit_time', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exercise Fields (bypass Done checkbox) */}
      {formData.category === 'exercise' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
              <select
                value={formData.exercise_goal_name}
                onChange={(e) => handleChange('exercise_goal_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select goal (optional)</option>
                {goals.map((goal, index) => (
                  <option key={index} value={goal.title || goal}>{goal.title || goal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <input
                type="text"
                value={formData.exercise_type}
                onChange={(e) => handleChange('exercise_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Running, Weightlifting"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.exercise_time}
                onChange={(e) => handleChange('exercise_time', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.exercise_duration}
                onChange={(e) => handleChange('exercise_duration', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 30 mins"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sets</label>
              <input
                type="number"
                value={formData.exercise_sets}
                onChange={(e) => handleChange('exercise_sets', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reps</label>
              <input
                type="number"
                value={formData.exercise_reps}
                onChange={(e) => handleChange('exercise_reps', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Productivity Fields (bypass Done checkbox) */}
      {formData.category === 'productivity' && (
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
              <select
                value={formData.productivity_goal_name}
                onChange={(e) => handleChange('productivity_goal_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select goal (optional)</option>
                {goals.map((goal, index) => (
                  <option key={index} value={goal.title || goal}>{goal.title || goal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <input
                type="text"
                value={formData.productivity_type}
                onChange={(e) => handleChange('productivity_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Work, Study"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Place</label>
              <select
                value={formData.productivity_place}
                onChange={(e) => handleChange('productivity_place', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select place</option>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Others">Others</option>
              </select>
            </div>
            {formData.productivity_place === 'Others' && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Place</label>
                <input
                  type="text"
                  value={formData.custom_productivity_place}
                  onChange={(e) => handleChange('custom_productivity_place', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.productivity_time}
                onChange={(e) => handleChange('productivity_time', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.productivity_duration}
                onChange={(e) => handleChange('productivity_duration', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 2 hours"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">What did</label>
            <textarea
              value={formData.productivity_what_did}
              onChange={(e) => handleChange('productivity_what_did', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              placeholder="Describe what you did..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Result</label>
            <textarea
              value={formData.productivity_result}
              onChange={(e) => handleChange('productivity_result', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="2"
              placeholder="Describe the result..."
            />
          </div>
        </div>
      )}

      {/* Note field - always at bottom */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
        <textarea
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows="3"
          placeholder="Add any additional notes..."
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Submitting...' : 'Submit Activity'}
      </button>
    </form>
  );
};

export default ActivityFormEngine;