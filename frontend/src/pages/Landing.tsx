import { Link } from 'react-router-dom';
import { Calendar, Users, Car, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/common';

function CarIllustration() {
  return (
    <svg viewBox="0 0 400 200" className="w-full max-w-md mx-auto">
      {/* Road */}
      <ellipse cx="200" cy="180" rx="180" ry="15" fill="#e2e8f0" />
      
      {/* Car body */}
      <g className="animate-float">
        {/* Main body */}
        <path
          d="M80 130 Q80 100 120 100 L180 100 Q200 100 210 80 L250 80 Q280 80 290 100 L320 100 Q360 100 360 130 L360 150 Q360 160 350 160 L90 160 Q80 160 80 150 Z"
          fill="url(#carGradient)"
          stroke="#0d9488"
          strokeWidth="2"
        />
        
        {/* Windows */}
        <path
          d="M140 105 L175 105 Q185 105 190 95 L215 95 Q230 95 235 105 L270 105 L270 125 Q270 130 265 130 L145 130 Q140 130 140 125 Z"
          fill="#bae6fd"
          opacity="0.8"
        />
        
        {/* Window divider */}
        <line x1="205" y1="95" x2="205" y2="130" stroke="#0d9488" strokeWidth="2" />
        
        {/* Headlights */}
        <ellipse cx="345" cy="135" rx="8" ry="6" fill="#fef08a" />
        <ellipse cx="95" cy="135" rx="8" ry="6" fill="#fca5a5" />
        
        {/* Door handle */}
        <rect x="180" y="120" width="20" height="4" rx="2" fill="#0d9488" />
        
        {/* Wheels */}
        <circle cx="130" cy="160" r="22" fill="#1e293b" />
        <circle cx="130" cy="160" r="14" fill="#64748b" />
        <circle cx="130" cy="160" r="6" fill="#1e293b" />
        
        <circle cx="310" cy="160" r="22" fill="#1e293b" />
        <circle cx="310" cy="160" r="14" fill="#64748b" />
        <circle cx="310" cy="160" r="6" fill="#1e293b" />
      </g>
      
      {/* Sparkles */}
      <g className="animate-pulse-soft">
        <circle cx="50" cy="60" r="3" fill="#f97316" />
        <circle cx="350" cy="40" r="4" fill="#14b8a6" />
        <circle cx="320" cy="70" r="2" fill="#f97316" />
        <circle cx="80" cy="45" r="2" fill="#14b8a6" />
      </g>
      
      <defs>
        <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const features = [
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description: 'Book vehicles with an intuitive calendar interface. See availability at a glance.',
  },
  {
    icon: Users,
    title: 'Team Friendly',
    description: 'Coordinate with your team. See who has which vehicle and when.',
  },
  {
    icon: Car,
    title: 'Multiple Vehicles',
    description: 'Manage your entire fleet in one place. Cars, vans, trucks - all organized.',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'No double bookings. Conflicts are automatically prevented.',
  },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-800">VehicleBook</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-800 leading-tight">
              Vehicle booking
              <span className="text-primary-500"> made simple</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg mx-auto md:mx-0">
              The friendliest way to manage your team's vehicle reservations. 
              No more spreadsheets, no more confusion.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto group">
                  Start Booking Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Demo
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 justify-center md:justify-start text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-500" />
                <span>No credit card</span>
              </div>
            </div>
          </div>
          <div className="order-first md:order-last">
            <CarIllustration />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-800">
            Everything you need
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Simple tools that make vehicle management a breeze
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-display font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12 text-center shadow-soft-lg">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            Ready to simplify your vehicle bookings?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join teams who have already made the switch to stress-free vehicle management.
          </p>
          <Link to="/signup">
            <Button variant="secondary" size="lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary-500" />
            <span className="font-display font-semibold text-gray-700">VehicleBook</span>
          </div>
          <p>© {new Date().getFullYear()} VehicleBook. Made with ❤️ for teams everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
