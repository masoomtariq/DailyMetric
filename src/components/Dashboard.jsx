import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSquarePollVertical, faUser, faRightFromBracket, faFileCirclePlus, 
  faBullseye, faCalendarCheck, faPersonRunning, faPaperPlane, faCircleInfo,
  faTrashCan, faClockRotateLeft, faLayerGroup, faCircleCheck, faTriangleExclamation,
  faCircleInfo as faCircleInfo2, faInbox, faFolderOpen, faCircleNotch, faWifi
} from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState('https://masoomtariq-habit-tracker.hf.space');
  const [entityType, setEntityType] = useState('goal');
  const [consoleOutput, setConsoleOutput] = useState('Waiting for submissions...');
  const [consoleStatus, setConsoleStatus] = useState('info');
  const [consoleBadgeVisible, setConsoleBadgeVisible] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [dates, setDates] = useState([]);
  const [datesLoaded, setDatesLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Form states
  const [goalName, setGoalName] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalStatus, setGoalStatus] = useState(true);

  const [daylogDate, setDaylogDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [daylogBed, setDaylogBed] = useState('');
  const [daylogWake, setDaylogWake] = useState('');
  const [daylogSleep, setDaylogSleep] = useState('');
  const [daylogDuration, setDaylogDuration] = useState('');
  const [daylogProd, setDaylogProd] = useState('');
  const [daylogCalories, setDaylogCalories] = useState('');
  const [daylogNotes, setDaylogNotes] = useState('');

  // Activity form states
  const [activeGoals, setActiveGoals] = useState([]);
  const [entryDate, setEntryDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [category, setCategory] = useState('prayer');
  const [note, setNote] = useState('');
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [done, setDone] = useState(true);
  const [place, setPlace] = useState('');
  const [customPlace, setCustomPlace] = useState('');
  const [onTime, setOnTime] = useState(true);
  const [jamaat, setJamaat] = useState(true);
  const [time, setTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [goalNameActivity, setGoalNameActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [whatDid, setWhatDid] = useState('');
  const [whatResult, setWhatResult] = useState('');

  const getApiUrl = () => {
    return apiUrl.trim() || 'http://127.0.0.1:8000';
  };

  const fetchGoals = async () => {
    const apiBase = getApiUrl();
    try {
      const response = await fetch(`${apiBase}/goals/get_goals`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const resData = await response.json();
        const goalsList = resData.data || [];
        setActiveGoals(goalsList);
      } else {
        console.error('Goals fetch failed with status:', response.status);
      }
    } catch (err) {
      console.error('Error loading goals:', err);
    }
  };

  // Fetch goals on component mount
  useEffect(() => {
    fetchGoals();
  }, []);

  // --- Helper Functions for Time Math ---
  const addMinutesToTime = (timeStr, minsToAdd) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(2000, 0, 1, hours, minutes + minsToAdd);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const calculateDurationHours = (sleepStr, wakeStr) => {
    if (!sleepStr || !wakeStr) return '';
    const [sleepH, sleepM] = sleepStr.split(':').map(Number);
    const [wakeH, wakeM] = wakeStr.split(':').map(Number);

    let sleepDate = new Date(2000, 0, 1, sleepH, sleepM);
    let wakeDate = new Date(2000, 0, 1, wakeH, wakeM);

    // Handle the "Midnight Problem" (e.g. sleep at 23:00, wake at 07:00)
    if (wakeDate < sleepDate) {
      wakeDate = new Date(2000, 0, 2, wakeH, wakeM);
    }

    const diffMs = wakeDate - sleepDate;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2); // Returns a string like "7.50"
  };

  // --- React Effects for Auto-Calculation ---
  
  // 1. Auto-calculate Sleep Time when Bed Time changes
  useEffect(() => {
    if (daylogBed) {
      setDaylogSleep(addMinutesToTime(daylogBed, 15));
    } else {
      setDaylogSleep(''); // Clear if user erases bed time
    }
  }, [daylogBed]);

  // 2. Auto-calculate Duration when Sleep or Wake Time changes
  useEffect(() => {
    if (daylogSleep && daylogWake) {
      setDaylogDuration(calculateDurationHours(daylogSleep, daylogWake));
    } else {
      setDaylogDuration('');
    }
  }, [daylogSleep, daylogWake]);

  const formatTimeWithSeconds = (timeStr) => {
    if (!timeStr) return null;
    if (timeStr.split(':').length === 2) return timeStr + ':00';
    return timeStr;
  };

  const logToConsole = (message, data = null, status = 'info') => {
    let messageFormatted = `[${new Date().toLocaleTimeString()}] ${message}\n`;
    if (data) {
      messageFormatted += typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
      messageFormatted += '\n';
    }
    setConsoleOutput(messageFormatted);
    setConsoleStatus(status);
    setConsoleBadgeVisible(true);
  };

  const clearConsole = () => {
    setConsoleOutput('Console cleared. Waiting for actions...');
    setConsoleBadgeVisible(false);
  };

  const getSubmitButtonClass = () => {
    if (entityType === 'goal') {
      return "bg-violet-600 hover:bg-violet-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all duration-150 transform active:scale-95 flex items-center gap-2";
    } else if (entityType === 'daylog') {
      return "bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all duration-150 transform active:scale-95 flex items-center gap-2";
    } else {
      return "bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-md transition-all duration-150 transform active:scale-95 flex items-center gap-2";
    }
  };

  const isFieldVisible = (fieldName) => {
    if (entityType !== 'activity') return true;
    
    const categoryFieldMap = {
      'activity-time': ['meal', 'exercise', 'productivity', 'habit'],
      'activity-status': ['prayer', 'meal', 'habit'],
      'activity-ontime': ['prayer'],
      'activity-duration': ['exercise', 'productivity', 'habit'],
      'activity-location': ['prayer', 'meal', 'exercise', 'productivity'],
      'activity-quantity': ['meal'],
      'activity-sets': ['exercise'],
      'activity-reps': ['exercise'],
      'activity-what': ['productivity'],
      'activity-result': ['productivity'],
    };
    
    const visibleCategories = categoryFieldMap[fieldName];
    return visibleCategories ? visibleCategories.includes(category) : true;
  };

  // Reusable "Other" dropdown renderer
  const renderOtherDropdown = (label, value, onChange, customValue, customOnChange, options, showCustomInput) => {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
        >
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {showCustomInput && (
          <input 
            type="text"
            value={customValue}
            onChange={(e) => customOnChange(e.target.value)}
            placeholder="Please specify..."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        )}
      </div>
    );
  };

  const resetFormFields = () => {
    if (entityType === 'goal') {
      setGoalName('');
      setGoalDesc('');
    } else if (entityType === 'daylog') {
      setDaylogBed('');
      setDaylogWake('');
      setDaylogSleep('');
      setDaylogDuration('');
      setDaylogProd('');
      setDaylogCalories('');
      setDaylogNotes('');
    } else if (entityType === 'activity') {
      setEntryDate(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });
      setCategory('habit');
      setNote('');
      setType('');
      setCustomType('');
      setDone(true);
      setPlace('');
      setCustomPlace('');
      setOnTime(true);
      setJamaat(true);
      setTime('');
      setQuantity('');
      setGoalNameActivity('');
      setDuration('');
      setSets('');
      setReps('');
      setWhatDid('');
      setWhatResult('');
    }
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    const apiBase = getApiUrl();
    let endpoint = '';
    let payload = {};

    try {
      if (entityType === 'goal') {
        endpoint = `${apiBase}/goals/add_goal`;
        payload = {
          name: goalName.trim(),
          description: goalDesc.trim() || null,
          active_status: goalStatus
        };
      } else if (entityType === 'daylog') {
        endpoint = `${apiBase}/daylogs/add_daylog`;
        const durationVal = daylogDuration;
        const prodVal = daylogProd;
        const calVal = daylogCalories;

        payload = {
          log_date: daylogDate,
          bed_time: formatTimeWithSeconds(daylogBed || null),
          wake_time: formatTimeWithSeconds(daylogWake || null),
          sleep_time: formatTimeWithSeconds(daylogSleep || null),
          sleep_duration_hours: durationVal !== '' ? parseFloat(durationVal) : null,
          total_productivity_min: prodVal !== '' ? parseInt(prodVal, 10) : null,
          total_calories: calVal !== '' ? parseInt(calVal, 10) : null,
          notes: daylogNotes.trim() || null
        };
      } else if (entityType === 'activity') {
        endpoint = `${apiBase}/activities/add_activity`;
        
        // Resolve "Other" dropdown values
        const resolvedType = type === 'Other' || type === 'Others' ? customType : type;
        const resolvedPlace = place === 'Other' || place === 'Others' ? customPlace : place;
        
        // Build the details object based on category and conditions
        const details = {};
        
        if (category === 'prayer') {
          details.done = done;
          if (done) {
            details.place = resolvedPlace;
            details.on_time = onTime;
            if (onTime) {
              details.jamaat = jamaat;
            }
          }
        } else if (category === 'meal') {
          details.done = done;
          if (done) {
            details.time = formatTimeWithSeconds(time);
            details.quantity = quantity;
            details.place = resolvedPlace;
          }
        } else if (category === 'habit') {
          details.done = done;
          if (done) {
            details.time = formatTimeWithSeconds(time);
          }
        } else if (category === 'exercise') {
          details.time = formatTimeWithSeconds(time);
          details.duration = duration;
          details.sets = sets !== '' ? parseInt(sets, 10) : null;
          details.reps = reps !== '' ? parseInt(reps, 10) : null;
        } else if (category === 'productivity') {
          details.place = resolvedPlace;
          details.time = formatTimeWithSeconds(time);
          details.duration = duration;
          details.what_did = whatDid;
          details.what_result = whatResult;
        }

        // Build the root payload
        payload = {
          entry_date: entryDate,
          category: category,
          activity_type_name: resolvedType,
          note: note.trim() || null,
          details: details
        };

        // Add goal_name only if not prayer category
        if (category !== 'prayer' && goalNameActivity) {
          payload.goal_name = goalNameActivity;
        }
      }

      logToConsole(`Submitting ${entityType.toUpperCase()} data to: ${endpoint}...`, payload, 'info');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        logToConsole(`Successfully created ${entityType.toUpperCase()} entry!`, data, 'success');
        resetFormFields();
        if (selectedDate) {
          fetchActivitiesByDate(selectedDate);
        }
      } else {
        logToConsole(`Server rejected submission with status: ${response.status}`, data, 'error');
      }
    } catch (err) {
      logToConsole("Network transmission error occurred during form submission.", err.toString(), 'error');
    }
  };

  const fetchActiveDates = async () => {
    if (datesLoaded) return;
    
    const apiBase = getApiUrl();
    try {
      const response = await fetch(`${apiBase}/daylogs/active-dates`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const resData = await response.json();
        const dateList = resData.data || resData || [];
        setDates(dateList);
        setDatesLoaded(true);
      }
    } catch (err) {
      console.error('Error loading dates:', err);
    }
  };

  const fetchActivitiesByDate = async (date) => {
    setSelectedDate(date);
    setLoadingActivities(true);
    
    const apiBase = getApiUrl();
    try {
      const response = await fetch(`${apiBase}/activities/by-date/${date}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const resData = await response.json();
        const activityList = (resData.data && resData.data.activities) || resData.activities || resData.data || [];
        setActivities(activityList);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadAllActivities = async () => {
    setLoadingActivities(true);
    setSelectedDate('');
    
    const apiBase = getApiUrl();
    try {
      const response = await fetch(`${apiBase}/activities/all_activities`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const resData = await response.json();
        const activityList = (resData.data && resData.data.activities) || resData.activities || resData.data || [];
        setActivities(activityList);
      } else {
        setActivities([]);
      }
    } catch (err) {
      console.error('Error loading all activities:', err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const renderActivitiesTable = () => {
    if (loadingActivities) {
      return (
        <div className="px-4 py-8 text-center text-slate-400">
          <FontAwesomeIcon icon={faCircleNotch} className="text-2xl mb-2 block text-primary-500 animate-spin" />
          Loading activities...
        </div>
      );
    }

    if (!activities || activities.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-slate-400">
          <FontAwesomeIcon icon={faInbox} className="text-2xl mb-2 block" />
          Select a date or click "Load All" to view activities.
        </div>
      );
    }

    const rowsHtml = activities.slice().reverse().map((act, index) => {
      const statusBadge = act.active_status !== false
        ? <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">Active / Done</span>
        : <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-600 border border-slate-200">Inactive</span>;
      const durationText = act.duration_min ? `${act.duration_min} min` : <span className="text-slate-300">-</span>;
        
      return (
        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all font-medium text-slate-700">
          <td className="px-4 py-3 font-mono whitespace-nowrap">{act.entry_date}</td>
          <td className="px-4 py-3 capitalize"><span className="bg-slate-100 px-2 py-1 rounded text-[11px] font-bold text-slate-600">{act.category}</span></td>
          <td className="px-4 py-3 font-semibold text-slate-900">{act.activity_type_name}</td>
          <td className="px-4 py-3">{durationText}</td>
          <td className="px-4 py-3 max-w-[200px] truncate text-slate-500" title={act.what_i_did || ''}>{act.what_i_did || <span className="text-slate-300">-</span>}</td>
          <td className="px-4 py-3">{statusBadge}</td>
        </tr>
      );
    });

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50/80">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">What I Did</th>
              <th className="px-4 py-3 rounded-r-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {rowsHtml}
          </tbody>
        </table>
      </div>
    );
  };

  const getConsoleBadgeClass = () => {
    if (consoleStatus === 'success') {
      return "mb-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md bg-emerald-900/30 text-emerald-400 border border-emerald-800";
    } else if (consoleStatus === 'error') {
      return "mb-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md bg-rose-900/30 text-rose-400 border border-rose-800";
    } else {
      return "mb-4 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  const getConsoleBadgeContent = () => {
    if (consoleStatus === 'success') {
      return <><FontAwesomeIcon icon={faCircleCheck} className="animate-bounce" /> Request Succeeded</>;
    } else if (consoleStatus === 'error') {
      return <><FontAwesomeIcon icon={faTriangleExclamation} className="animate-shake" /> Request Failed</>;
    } else {
      return <><FontAwesomeIcon icon={faCircleInfo2} /> Log Info</>;
    }
  };

  const getConsoleOutputClass = () => {
    if (consoleStatus === 'success') {
      return "text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap text-emerald-400";
    } else if (consoleStatus === 'error') {
      return "text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap text-rose-300";
    } else {
      return "text-xs leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap text-indigo-300";
    }
  };

  return (
    <div className="h-full text-slate-800 font-sans flex flex-col">
      <header className="bg-gradient-to-r from-primary-800 to-primary-950 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                <FontAwesomeIcon icon={faSquarePollVertical} className="text-2xl text-primary-300" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Habit Tracker <span className="text-xs bg-primary-500 text-white font-semibold py-0.5 px-2 rounded-full uppercase">Control Panel</span>
                </h1>
                <p className="text-xs text-primary-200">Interactive standalone client interface</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-black/20 px-3 py-1.5 rounded-lg text-xs border border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <label htmlFor="api-url-input" className="text-primary-300 font-medium">API Base:</label>
                <input 
                  type="text" 
                  id="api-url-input" 
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="bg-transparent border-0 text-white font-mono focus:ring-0 w-36 outline-none hover:bg-white/5 p-0.5 rounded cursor-pointer"
                />
              </div>
              
              <div className="bg-primary-900/50 px-3 py-1.5 rounded-lg text-xs border border-primary-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-primary-300" />
                <span className="font-semibold text-primary-100">{user || 'User'}</span>
                <button 
                  onClick={logout}
                  className="ml-2 hover:text-rose-300 text-rose-400 font-bold uppercase tracking-wider text-[10px] transition-all"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="mr-1" />Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <section className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faFileCirclePlus} className="text-primary-600" /> Submit Log Entry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Choose your entry type, fill in the customized fields, and submit to backend.</p>
              </div>

              <div className="p-8 space-y-8">
                <div>
                  <span className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">Choose Log Category</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <label className="relative flex items-center gap-4 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-primary-400 hover:bg-primary-50/10 transition-all select-none group">
                      <input 
                        type="radio" 
                        name="entity-type" 
                        value="goal" 
                        checked={entityType === 'goal'}
                        onChange={() => setEntityType('goal')}
                        className="hidden peer"
                      />
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-all peer-checked:bg-violet-600 peer-checked:text-white">
                        <FontAwesomeIcon icon={faBullseye} className="text-base" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-bold text-slate-800">Goal</div>
                        <div className="text-[11px] text-slate-500">Long term objective</div>
                      </div>
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center bg-white peer-checked:border-violet-600 peer-checked:bg-violet-600 after:content-[''] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full"></div>
                    </label>

                    <label className="relative flex items-center gap-4 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-primary-400 hover:bg-primary-50/10 transition-all select-none group">
                      <input 
                        type="radio" 
                        name="entity-type" 
                        value="daylog" 
                        checked={entityType === 'daylog'}
                        onChange={() => setEntityType('daylog')}
                        className="hidden peer"
                      />
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-all peer-checked:bg-amber-600 peer-checked:text-white">
                        <FontAwesomeIcon icon={faCalendarCheck} className="text-base" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-bold text-slate-800">Daylog</div>
                        <div className="text-[11px] text-slate-500">Daily health & sleep</div>
                      </div>
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center bg-white peer-checked:border-amber-600 peer-checked:bg-amber-600 after:content-[''] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full"></div>
                    </label>

                    <label className="relative flex items-center gap-4 px-5 py-4 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:border-primary-400 hover:bg-primary-50/10 transition-all select-none group">
                      <input 
                        type="radio" 
                        name="entity-type" 
                        value="activity" 
                        checked={entityType === 'activity'}
                        onChange={() => setEntityType('activity')}
                        className="hidden peer"
                      />
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-all peer-checked:bg-emerald-600 peer-checked:text-white">
                        <FontAwesomeIcon icon={faPersonRunning} className="text-base" />
                      </div>
                      <div className="flex-grow">
                        <div className="text-sm font-bold text-slate-800">Activity</div>
                        <div className="text-[11px] text-slate-500">Tracked dynamic event</div>
                      </div>
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center bg-white peer-checked:border-emerald-600 peer-checked:bg-emerald-600 after:content-[''] after:w-1.5 after:h-1.5 after:bg-white after:rounded-full"></div>
                    </label>
                    
                  </div>
                </div>

                <form onSubmit={handleFormSubmission} className="space-y-6">
                  {entityType === 'goal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Name *</label>
                        <input 
                          type="text" 
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                          required 
                          placeholder="e.g. Learn System Design" 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <textarea 
                          value={goalDesc}
                          onChange={(e) => setGoalDesc(e.target.value)}
                          rows="4" 
                          placeholder="Briefly explain your objective and goals..." 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Status</label>
                        <label className="inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={goalStatus}
                            onChange={(e) => setGoalStatus(e.target.checked)}
                            className="sr-only peer" 
                          />
                          <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                          <span className="ms-3 text-sm font-semibold text-slate-700">Active Goal</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {entityType === 'daylog' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Log Date *</label>
                        <input 
                          type="date" 
                          value={daylogDate}
                          onChange={(e) => setDaylogDate(e.target.value)}
                          required 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bed Time (Sleep Start)</label>
                        <input 
                          type="time" 
                          value={daylogBed}
                          onChange={(e) => setDaylogBed(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wake Time (Sleep End)</label>
                        <input 
                          type="time" 
                          value={daylogWake}
                          onChange={(e) => setDaylogWake(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Manual Sleep Time (Optional)</label>
                        <input 
                          type="time" 
                          value={daylogSleep}
                          onChange={(e) => setDaylogSleep(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Calculates as 15m after bed time if omitted.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sleep Duration (Hours)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={daylogDuration}
                          onChange={(e) => setDaylogDuration(e.target.value)}
                          placeholder="e.g. 7.5" 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Calculates dynamically from bed/wake times if blank.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Productivity (Minutes)</label>
                        <input 
                          type="number" 
                          value={daylogProd}
                          onChange={(e) => setDaylogProd(e.target.value)}
                          placeholder="e.g. 360" 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Calories</label>
                        <input 
                          type="number" 
                          value={daylogCalories}
                          onChange={(e) => setDaylogCalories(e.target.value)}
                          placeholder="e.g. 2100" 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Day Log Notes</label>
                        <textarea 
                          value={daylogNotes}
                          onChange={(e) => setDaylogNotes(e.target.value)}
                          rows="4" 
                          placeholder="How did today feel? Key highlights..." 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                        />
                      </div>
                    </div>
                  )}

                  {entityType === 'activity' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Base Fields - Always Visible */}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activity Date *</label>
                        <input 
                          type="date" 
                          value={entryDate}
                          onChange={(e) => setEntryDate(e.target.value)}
                          required 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category *</label>
                        <select 
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        >
                          <option value="prayer">prayer</option>
                          <option value="meal">meal</option>
                          <option value="habit">habit</option>
                          <option value="exercise">exercise</option>
                          <option value="productivity">productivity</option>
                        </select>
                      </div>

                      {/* Category: Prayer */}
                      {category === 'prayer' && (
                        <>
                          {renderOtherDropdown(
                            'Type',
                            type,
                            setType,
                            customType,
                            setCustomType,
                            ['Fajar', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Other'],
                            type === 'Other'
                          )}

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Done</label>
                            <label className="inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={done}
                                onChange={(e) => setDone(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              <span className="ms-3 text-sm font-semibold text-slate-700">Completed</span>
                            </label>
                          </div>

                          {done && (
                            <>
                              {renderOtherDropdown(
                                'Place',
                                place,
                                setPlace,
                                customPlace,
                                setCustomPlace,
                                ['Masjid', 'Home', 'Work/Prayer Room', 'Others'],
                                place === 'Others'
                              )}

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">On Time</label>
                                <label className="inline-flex items-center cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={onTime}
                                    onChange={(e) => setOnTime(e.target.checked)}
                                    className="sr-only peer" 
                                  />
                                  <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                  <span className="ms-3 text-sm font-semibold text-slate-700">Yes</span>
                                </label>
                              </div>

                              {onTime && (
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Jamaat</label>
                                  <label className="inline-flex items-center cursor-pointer select-none">
                                    <input 
                                      type="checkbox" 
                                      checked={jamaat}
                                      onChange={(e) => setJamaat(e.target.checked)}
                                      className="sr-only peer" 
                                    />
                                    <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    <span className="ms-3 text-sm font-semibold text-slate-700">Yes</span>
                                  </label>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {/* Category: Meal */}
                      {category === 'meal' && (
                        <>
                          {renderOtherDropdown(
                            'Type',
                            type,
                            setType,
                            customType,
                            setCustomType,
                            ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Others'],
                            type === 'Others'
                          )}

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Done</label>
                            <label className="inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={done}
                                onChange={(e) => setDone(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              <span className="ms-3 text-sm font-semibold text-slate-700">Completed</span>
                            </label>
                          </div>

                          {done && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Name</label>
                                <select 
                                  value={goalNameActivity}
                                  onChange={(e) => setGoalNameActivity(e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                >
                                  <option value="">Select a goal...</option>
                                  {activeGoals && activeGoals.length > 0 && activeGoals.map((goal, index) => (
                                    <option key={index} value={goal}>{goal}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                                <input 
                                  type="time" 
                                  value={time}
                                  onChange={(e) => setTime(e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                                <input 
                                  type="text" 
                                  value={quantity}
                                  onChange={(e) => setQuantity(e.target.value)}
                                  placeholder="e.g. 1 bowl, 500 calories" 
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                />
                              </div>

                              {renderOtherDropdown(
                                'Place',
                                place,
                                setPlace,
                                customPlace,
                                setCustomPlace,
                                ['Home', 'Work', 'Others'],
                                place === 'Others'
                              )}
                            </>
                          )}
                        </>
                      )}

                      {/* Category: Habit */}
                      {category === 'habit' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                            <input 
                              type="text" 
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              placeholder="e.g. Reading, Meditation" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Done</label>
                            <label className="inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox" 
                                checked={done}
                                onChange={(e) => setDone(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="relative w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                              <span className="ms-3 text-sm font-semibold text-slate-700">Completed</span>
                            </label>
                          </div>

                          {done && (
                            <>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Name</label>
                                <select 
                                  value={goalNameActivity}
                                  onChange={(e) => setGoalNameActivity(e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                >
                                  <option value="">Select a goal...</option>
                                  {activeGoals && activeGoals.length > 0 && activeGoals.map((goal, index) => (
                                    <option key={index} value={goal}>{goal}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                                <input 
                                  type="time" 
                                  value={time}
                                  onChange={(e) => setTime(e.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      {/* Category: Exercise */}
                      {category === 'exercise' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Name</label>
                            <select 
                              value={goalNameActivity}
                              onChange={(e) => setGoalNameActivity(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            >
                              <option value="">Select a goal...</option>
                              {activeGoals && activeGoals.length > 0 && activeGoals.map((goal, index) => (
                                <option key={index} value={goal}>{goal}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                            <input 
                              type="text" 
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              placeholder="e.g. Running, Weightlifting" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                            <input 
                              type="time" 
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                            <input 
                              type="text" 
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              placeholder="e.g. 45 min" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sets</label>
                            <input 
                              type="number" 
                              value={sets}
                              onChange={(e) => setSets(e.target.value)}
                              placeholder="e.g. 3" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reps</label>
                            <input 
                              type="number" 
                              value={reps}
                              onChange={(e) => setReps(e.target.value)}
                              placeholder="e.g. 12" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>
                        </>
                      )}

                      {/* Category: Productivity */}
                      {category === 'productivity' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Name</label>
                            <select 
                              value={goalNameActivity}
                              onChange={(e) => setGoalNameActivity(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            >
                              <option value="">Select a goal...</option>
                              {activeGoals && activeGoals.length > 0 && activeGoals.map((goal, index) => (
                                <option key={index} value={goal}>{goal}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                            <input 
                              type="text" 
                              value={type}
                              onChange={(e) => setType(e.target.value)}
                              placeholder="e.g. Coding, Writing" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          {renderOtherDropdown(
                            'Place',
                            place,
                            setPlace,
                            customPlace,
                            setCustomPlace,
                            ['Home', 'Work', 'Others'],
                            place === 'Others'
                          )}

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                            <input 
                              type="time" 
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
                            <input 
                              type="text" 
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              placeholder="e.g. 2 hours" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What did</label>
                            <textarea 
                              value={whatDid}
                              onChange={(e) => setWhatDid(e.target.value)}
                              rows="3" 
                              placeholder="What did you accomplish?" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What result</label>
                            <textarea 
                              value={whatResult}
                              onChange={(e) => setWhatResult(e.target.value)}
                              rows="3" 
                              placeholder="What was the outcome?" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                            />
                          </div>
                        </>
                      )}

                      {/* Base Fields - Note (Always at bottom) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Note</label>
                        <textarea 
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows="3" 
                          placeholder="Any additional quick comments..." 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCircleInfo} className="text-primary-500" />
                      <span>Make sure backend server is running and you are logged in.</span>
                    </div>
                    <button 
                      type="submit" 
                      className={getSubmitButtonClass()}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} /> Submit to Backend
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 overflow-hidden font-mono">
              <div className="bg-slate-950 px-6 py-3.5 flex justify-between items-center border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-xs font-semibold text-slate-400 ml-2">Console & Server Response</span>
                </div>
                <button 
                  onClick={clearConsole}
                  className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 transition-all"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="mr-1" /> Clear
                </button>
              </div>
              <div className="p-6">
                {consoleBadgeVisible && (
                  <div className={getConsoleBadgeClass()}>
                    {getConsoleBadgeContent()}
                  </div>
                )}
                <pre className={getConsoleOutputClass()}>{consoleOutput}</pre>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faClockRotateLeft} className="text-emerald-600" /> User Activities Log
                  </h3>
                  <p className="text-xs text-slate-500">Fetch and review your recorded activities.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <select 
                    value={selectedDate}
                    onChange={(e) => fetchActivitiesByDate(e.target.value)}
                    onFocus={fetchActiveDates}
                    onClick={fetchActiveDates}
                    className="flex-grow sm:flex-grow-0 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-xl py-2.5 px-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled selected>Click to load dates...</option>
                    {dates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={loadAllActivities}
                    className="flex-grow sm:flex-grow-0 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <FontAwesomeIcon icon={faLayerGroup} /> Load All
                  </button>
                </div>
              </div>
              
              <div id="activityResults">
                {renderActivitiesTable()}
              </div>
            </div>
          </section>

        </main>

        <footer className="bg-slate-100 border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <p>Habit Tracker Backend Control Client &bull; Built in Vanilla JS & Tailwind CSS &bull; Year 2026</p>
          </div>
        </footer>
    </div>
  );
};

export default Dashboard;
