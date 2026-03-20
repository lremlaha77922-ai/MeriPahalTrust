import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import RegistrationApplications from './RegistrationApplications';
import JoiningApplications from './JoiningApplications';

type Tab = 'dashboard' | 'registration' | 'joining';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const menuItems = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'registration' as Tab, name: 'Registration Forms', icon: Users },
    { id: 'joining' as Tab, name: 'Joining Forms', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-2xl font-bold text-trust-blue">Admin Panel</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 hidden md:block">
              {user?.email}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } top-[73px] lg:top-0`}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-trust-blue text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-1">Welcome to the admin panel</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setActiveTab('registration')}
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-trust-blue"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-12 w-12 text-trust-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Registration Applications
                  </h3>
                  <p className="text-gray-600">
                    View and manage employee registration forms
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('joining')}
                  className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <UserPlus className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Joining Applications
                  </h3>
                  <p className="text-gray-600">
                    View and manage Swastha Sangini applications
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-trust-blue p-6 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Quick Guide</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-trust-blue mr-2">•</span>
                    <span>
                      <strong>Registration Forms:</strong> View all employee registration
                      applications with search, filter, and approval features
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-trust-blue mr-2">•</span>
                    <span>
                      <strong>Joining Forms:</strong> Manage Swastha Sangini coordinator
                      applications with detailed review options
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-trust-blue mr-2">•</span>
                    <span>
                      <strong>Export Data:</strong> Download CSV files for reporting and analysis
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'registration' && <RegistrationApplications />}
          {activeTab === 'joining' && <JoiningApplications />}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
        />
      )}
    </div>
  );
};

export default AdminPanel;
