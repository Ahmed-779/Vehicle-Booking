import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/common';
import toast from 'react-hot-toast';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login({ email: formData.email, password: formData.password });
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to log in';
      toast.error(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-soft-lg transition-shadow">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-gray-800">VehicleBook</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-soft-lg p-8 animate-scale-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold text-gray-800">
                Welcome back! 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Log in to manage your vehicle bookings
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="w-5 h-5" />}
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Log In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Sign up free
                </Link>
              </p>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-primary-50 rounded-2xl">
              <p className="text-sm text-primary-700 text-center">
                <strong>Demo account:</strong><br />
                demo@example.com / demo1234
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
