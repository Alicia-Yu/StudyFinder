import Dashboard from './pages/Dashboard';
import Collections from './pages/Collections';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

function AppContent() {
  return (
    <div className="min-h-screen bg-[#E8DFC9]">
      <nav className="bg-[#E8DFC9] shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                 <img
                    src="/logo.png"
                    alt="Logo"
                    className="h-20 w-20 rounded-md shadow-sm"
                  />
                <h1 className="text-xl font-bold text-gray-900">App</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App