import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePollVertical, faShieldHalved, faPhone, faLock, faRightToBracket, faUserPlus, faFloppyDisk, faCircleCheck, faTriangleExclamation, faCircleInfo as faCircleInfo2 } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [apiUrl, setApiUrl] = useState('https://masoomtariq-habit-tracker.hf.space');
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTimezone, setRegTimezone] = useState('Asia/Karachi');
  const [regPassword, setRegPassword] = useState('');
  const [regSecret, setRegSecret] = useState('');
  
  // Token form state
  const [manualToken, setManualToken] = useState('');

  const getApiUrl = () => {
    return apiUrl.trim() || 'http://127.0.0.1:8000';
  };

  const logToConsole = (message, data = null, status = 'info') => {
    console.log(message, data);
    if (status === 'error') alert("Error: " + message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const apiBase = getApiUrl();

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: loginPhone, password: loginPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        login(data.access_token);
        navigate('/dashboard');
      } else {
        logToConsole(`Login failed with status ${response.status}`, data, 'error');
      }
    } catch (error) {
      logToConsole("Network connection failure trying to login.", error.toString(), 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const apiBase = getApiUrl();

    try {
      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName, phone_number: regPhone, email: regEmail,
          timezone: regTimezone, password: regPassword, secret_text: regSecret
        })
      });

      if (response.ok) {
        alert("User registration succeeded! You can now log in.");
        setActiveTab('login');
        setLoginPhone(regPhone);
      } else {
        const data = await response.json();
        logToConsole(`Registration failed with status ${response.status}`, data, 'error');
      }
    } catch (error) {
      logToConsole("Network connection failure during user registration.", error.toString(), 'error');
    }
  };

  const saveManualToken = () => {
    if (manualToken.trim()) {
      login(manualToken.trim());
      navigate('/dashboard');
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
                  Habit Tracker <span className="text-xs bg-primary-500 text-white font-semibold py-0.5 px-2 rounded-full uppercase">Login</span>
                </h1>
                <p className="text-xs text-primary-200">Authenticate to access control panel</p>
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
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldHalved} className="text-primary-600" /> Authentication
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-sm" role="tablist">
                <button 
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-1.5 text-center font-bold rounded-lg transition-all ${
                    activeTab === 'login' 
                      ? 'text-primary-700 bg-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-1.5 text-center font-medium rounded-lg transition-all ${
                    activeTab === 'register' 
                      ? 'text-primary-700 bg-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
                <button 
                  onClick={() => setActiveTab('token')}
                  className={`flex-1 py-1.5 text-center font-medium rounded-lg transition-all ${
                    activeTab === 'token' 
                      ? 'text-primary-700 bg-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Token
                </button>
              </div>

              {activeTab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <FontAwesomeIcon icon={faPhone} className="text-sm" />
                      </span>
                      <input 
                        type="text" 
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required 
                        placeholder="e.g. +923001234567" 
                        className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <FontAwesomeIcon icon={faLock} className="text-sm" />
                      </span>
                      <input 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required 
                        placeholder="••••••••" 
                        className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm transition-all duration-150 transform active:scale-95 flex justify-center items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faRightToBracket} /> Sign In
                  </button>
                </form>
              )}

              {activeTab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required 
                      placeholder="e.g. John Doe" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      required 
                      placeholder="e.g. +923001234567" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                    <input 
                      type="email" 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required 
                      placeholder="e.g. john@example.com" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Timezone</label>
                    <input 
                      type="text" 
                      value={regTimezone}
                      onChange={(e) => setRegTimezone(e.target.value)}
                      required 
                      placeholder="e.g. Asia/Karachi" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                    <input 
                      type="password" 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required 
                      placeholder="Minimum 6 characters" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Registration Secret</label>
                    <input 
                      type="text" 
                      value={regSecret}
                      onChange={(e) => setRegSecret(e.target.value)}
                      required 
                      placeholder="Enter server secret text" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm transition-all duration-150 transform active:scale-95 flex justify-center items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faUserPlus} /> Register
                  </button>
                </form>
              )}

              {activeTab === 'token' && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Directly paste your bearer JWT token here if you have authenticated via external tools.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Access Token</label>
                    <textarea 
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      rows="4" 
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                      className="font-mono text-[11px] leading-normal w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
                    />
                  </div>
                  <button 
                    onClick={saveManualToken}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-sm transition-all duration-150 transform active:scale-95 flex justify-center items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFloppyDisk} /> Apply Token
                  </button>
                </div>
              )}
            </div>
          </div>

        </main>
    </div>
  );
};

export default Login;
