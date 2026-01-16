import { useState, useEffect } from 'react';
import { 
  Users, Car, Calendar, Trash2,
  AlertTriangle, Shield,
  Plus, Search
} from 'lucide-react';
import { adminApi, getErrorMessage } from '../services/api';
import { Button, PageLoader, Modal, Input, Select } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { VehicleType } from '../types';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
  bookingCount: number;
}

interface AdminBooking {
  id: string;
  title?: string;
  startTime: string;
  endTime: string;
  user: { id: string; name: string; email?: string; avatarColor: string };
  vehicle: { id: string; name: string; type: VehicleType; color: string };
}

interface AdminVehicle {
  id: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  color: string;
  isActive: boolean;
  _count: { bookings: number };
}

type Tab = 'overview' | 'users' | 'vehicles' | 'bookings';

export function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState({ users: 0, vehicles: 0, bookings: 0 });
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ type: string; id: string; name: string } | null>(null);
  const [vehicleModal, setVehicleModal] = useState<{ isOpen: boolean; vehicle?: AdminVehicle }>({ isOpen: false });
  const [vehicleForm, setVehicleForm] = useState<{ name: string; type: VehicleType; licensePlate: string; color: string }>({ 
    name: '', 
    type: VehicleType.CAR, 
    licensePlate: '', 
    color: '#06b6d4' 
  });

  // Load initial data
  useEffect(() => {
    loadStats();
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'vehicles') loadVehicles();
    if (activeTab === 'bookings') loadBookings();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getStats();
      setStats(data.stats);
      setRecentBookings(data.recentBookings as unknown as AdminBooking[]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await adminApi.getVehicles();
      setVehicles(data.vehicles as AdminVehicle[]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const loadBookings = async () => {
    try {
      const data = await adminApi.getBookings();
      setBookings(data.bookings as unknown as AdminBooking[]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    
    try {
      if (deleteModal.type === 'user') {
        await adminApi.deleteUser(deleteModal.id);
        setUsers(users.filter(u => u.id !== deleteModal.id));
        loadStats();
      } else if (deleteModal.type === 'vehicle') {
        await adminApi.deleteVehicle(deleteModal.id);
        setVehicles(vehicles.filter(v => v.id !== deleteModal.id));
        loadStats();
      } else if (deleteModal.type === 'booking') {
        await adminApi.deleteBooking(deleteModal.id);
        setBookings(bookings.filter(b => b.id !== deleteModal.id));
        loadStats();
      }
      toast.success(`${deleteModal.type} deleted successfully`);
      setDeleteModal(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCleanupPastBookings = async () => {
    try {
      const result = await adminApi.cleanupPastBookings();
      toast.success(result.message);
      loadBookings();
      loadStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveVehicle = async () => {
    try {
      if (vehicleModal.vehicle) {
        await adminApi.updateVehicle(vehicleModal.vehicle.id, vehicleForm);
        toast.success('Vehicle updated!');
      } else {
        await adminApi.createVehicle(vehicleForm);
        toast.success('Vehicle created!');
      }
      setVehicleModal({ isOpen: false });
      loadVehicles();
      loadStats();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openVehicleModal = (vehicle?: AdminVehicle) => {
    if (vehicle) {
      setVehicleForm({
        name: vehicle.name,
        type: vehicle.type,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
      });
    } else {
      setVehicleForm({ name: '', type: VehicleType.CAR, licensePlate: '', color: '#06b6d4' });
    }
    setVehicleModal({ isOpen: true, vehicle });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return <PageLoader message="Loading admin panel..." />;
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: Shield },
    { id: 'users' as Tab, label: 'Users', icon: Users },
    { id: 'vehicles' as Tab, label: 'Vehicles', icon: Car },
    { id: 'bookings' as Tab, label: 'Bookings', icon: Calendar },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 text-sm">
                Logged in as {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-soft p-1.5 mb-6 inline-flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-purple-500 text-white shadow-soft'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.users}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Vehicles</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.vehicles}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.bookings}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-lg font-display font-semibold text-gray-800 mb-4">
                Recent Bookings
              </h2>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: booking.user.avatarColor }}
                        >
                          {booking.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{booking.title || 'Untitled'}</p>
                          <p className="text-sm text-gray-500">
                            {booking.user.name} • {booking.vehicle.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{formatDate(booking.startTime)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-gray-800">
                Manage Users ({users.length})
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Bookings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: u.avatarColor }}
                          >
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                          {u.bookingCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteModal({ type: 'user', id: u.id, name: u.name })}
                          disabled={u.id === user?.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={u.id === user?.id ? "Can't delete yourself" : 'Delete user'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-gray-800">
                Manage Vehicles ({vehicles.length})
              </h2>
              <Button onClick={() => openVehicleModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map(v => (
                <div key={v.id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${v.color}20` }}
                      >
                        <Car className="w-5 h-5" style={{ color: v.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{v.name}</h3>
                        <p className="text-sm text-gray-500">{v.type} • {v.licensePlate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {v._count.bookings} bookings
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openVehicleModal(v)}
                        className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ type: 'vehicle', id: v.id, name: v.name })}
                        className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-semibold text-gray-800">
                Manage Bookings ({bookings.length})
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <Button variant="danger" onClick={handleCleanupPastBookings}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cleanup Past
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Booking</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vehicle</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date/Time</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(b => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-800">{b.title || 'Untitled'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: b.user.avatarColor }}
                          >
                            {b.user.name.charAt(0)}
                          </div>
                          <span className="text-gray-600">{b.user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: b.vehicle.color }}
                          />
                          <span className="text-gray-600">{b.vehicle.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(b.startTime)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteModal({ type: 'booking', id: b.id, name: b.title || 'this booking' })}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <strong>{deleteModal?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Vehicle Modal */}
      <Modal
        isOpen={vehicleModal.isOpen}
        onClose={() => setVehicleModal({ isOpen: false })}
        title={vehicleModal.vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={vehicleForm.name}
            onChange={e => setVehicleForm({ ...vehicleForm, name: e.target.value })}
            placeholder="e.g., Toyota Camry"
          />
          <Select
            label="Type"
            value={vehicleForm.type}
            onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value as VehicleType })}
            options={[
              { value: 'CAR', label: 'Car' },
              { value: 'SUV', label: 'SUV' },
              { value: 'VAN', label: 'Van' },
              { value: 'TRUCK', label: 'Truck' },
            ]}
          />
          <Input
            label="License Plate"
            value={vehicleForm.licensePlate}
            onChange={e => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
            placeholder="e.g., ABC-1234"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={vehicleForm.color}
                onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200"
              />
              <span className="text-gray-600">{vehicleForm.color}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setVehicleModal({ isOpen: false })} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveVehicle} className="flex-1">
              {vehicleModal.vehicle ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
