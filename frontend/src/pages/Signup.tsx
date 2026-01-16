import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/common';
import toast from 'react-hot-toast';

export function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signup({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        confirmPassword: formData.confirmPassword 
      });
      toast.success('Account created! Welcome aboard! 🎉');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create account';
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

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { label: '', color: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { label: 'Weak', color: 'bg-red-400', width: '33%' };
    if (strength <= 3) return { label: 'Medium', color: 'bg-yellow-400', width: '66%' };
    return { label: 'Strong', color: 'bg-success-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

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
                Create your account 🚀
              </h1>
              <p className="text-gray-500 mt-2">
                Start managing vehicle bookings in seconds
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={<User className="w-5 h-5" />}
                autoComplete="name"
              />

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

              <div>
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
                    autoComplete="new-password"
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  icon={<Lock className="w-5 h-5" />}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
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
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
