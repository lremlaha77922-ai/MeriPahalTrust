import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Lock, Mail, Loader2 } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { login } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/admin/panel');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-blue to-blue-700 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-trust-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              एडमिन लॉगिन
            </h1>
            <p className="text-gray-600">
              मेरी पहल ट्रस्ट - प्रशासन पैनल
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email">ईमेल</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">पासवर्ड</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-trust-blue hover:bg-blue-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  लॉगिन हो रहा है...
                </>
              ) : (
                'लॉगिन करें'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Only authorized personnel can log in
            </p>
            <Link to="/admin/panel" className="text-sm text-trust-blue hover:underline mt-2 inline-block">
              Go to Admin Panel
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:text-gray-200"
          >
            होम पेज पर वापस जाएं
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;