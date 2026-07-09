import React, { useState, useMemo } from 'react';
import { useParking } from '../context/ParkingContext';
import { SlotStatus, SlotType } from '../types/parking';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Building, 
  Plus, 
  Activity, 
  ShieldAlert, 
  Radio, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  CheckCircle,
  FileCheck2,
  Trash,
  Sliders
} from 'lucide-react';

export default function AdminPanel() {
  const { 
    locations, 
    slots, 
    bookings, 
    logs, 
    addLocation, 
    updateSlotStatus 
  } = useParking();

  // Selected locations for slot monitor
  const [selectedLocId, setSelectedLocId] = useState('loc-1');
  
  // Location Creator form
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locRate, setLocRate] = useState('80');
  const [locSlotsCount, setLocSlotsCount] = useState('20');
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);

  const toggleAmenity = (amenity: string) => {
    setAmenitiesList(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locAddress.trim()) {
      alert("Please fill in location name and address.");
      return;
    }

    addLocation({
      name: locName.trim(),
      address: locAddress.trim(),
      latitude: 12.97 + Math.random() * 0.05,
      longitude: 77.59 + Math.random() * 0.05,
      ratePerHour: Number(locRate),
      totalSlots: Number(locSlotsCount),
      amenities: amenitiesList
    });

    // Reset Form
    setLocName('');
    setLocAddress('');
    setLocRate('80');
    setLocSlotsCount('20');
    setAmenitiesList([]);
    alert("New parking terminal deployed successfully!");
  };

  // Compute stats
  const stats = useMemo(() => {
    const totalRev = bookings
      .filter(b => b.status === 'active' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const activeReservations = bookings.filter(b => b.status === 'active').length;
    const occupiedSpots = slots.filter(s => s.status === 'occupied').length;
    const totalSlotsCount = slots.length;
    const currentOccupancyRate = totalSlotsCount > 0 ? (occupiedSpots / totalSlotsCount) * 100 : 0;

    return {
      totalRevenue: totalRev,
      activeReservations,
      occupiedSpots,
      currentOccupancyRate
    };
  }, [bookings, slots]);

  // Analytics data for Recharts
  const revenueChartData = useMemo(() => {
    // Generate daily revenue for last 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, idx) => {
      // Create some variation around total revenue
      const multiplier = 0.8 + (idx * 0.1) + Math.random() * 0.3;
      return {
        name: day,
        revenue: Math.round((stats.totalRevenue / 7) * multiplier) + 400
      };
    });
  }, [stats.totalRevenue]);

  const peakHoursData = [
    { hour: '08:00', load: 45 },
    { hour: '10:00', load: 75 },
    { hour: '12:00', load: 85 },
    { hour: '14:00', load: 70 },
    { hour: '16:00', load: 80 },
    { hour: '18:00', load: 95 },
    { hour: '20:00', load: 60 },
    { hour: '22:00', load: 30 },
  ];

  const slotTypeDistribution = useMemo(() => {
    const standard = slots.filter(s => s.type === 'standard').length;
    const ev = slots.filter(s => s.type === 'ev').length;
    const disabled = slots.filter(s => s.type === 'disabled').length;

    return [
      { name: 'Standard Slots', value: standard, color: '#4f46e5' },
      { name: 'EV Charger Slots', value: ev, color: '#10b981' },
      { name: 'Disabled Accessible', value: disabled, color: '#3b82f6' },
    ];
  }, [slots]);

  // Filter slots for live monitor list
  const selectedLocationSlots = useMemo(() => {
    return slots.filter(s => s.locationId === selectedLocId);
  }, [slots, selectedLocId]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-colors">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Fleet Revenue</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">₹{stats.totalRevenue}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-colors">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Live Occupancy</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">{stats.occupiedSpots} spots</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-colors">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Fleet Capacity</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">{stats.currentOccupancyRate.toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm transition-colors">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Active Bookings</span>
            <span className="text-xl font-black text-zinc-900 dark:text-white">{stats.activeReservations}</span>
          </div>
        </div>
      </div>

      {/* Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Fleet Revenue analytics */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Revenue Performance Curve</h4>
              <p className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Real-time aggregate totals</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg">
              Live Fleet Database
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:opacity-10" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#4f46e5' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Hourly Occupancy Profile</h4>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase mt-0.5">Weekly Peak loads</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHoursData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} hide />
                <Tooltip />
                <Area type="monotone" dataKey="load" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hardware / Slot Monitor and Location Deployment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Slot hardware sensor override board */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">IoT Bay Hardware Console</h4>
              <p className="text-xs text-zinc-400 font-medium">Manually simulate magnetic ground sensor loops</p>
            </div>
            
            {/* Terminal Select */}
            <select
              value={selectedLocId}
              onChange={(e) => setSelectedLocId(e.target.value)}
              className="text-xs px-2 py-1.5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold rounded-lg"
            >
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          {/* Grid list of slots to toggle */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedLocationSlots.map(s => (
              <div 
                key={s.id}
                className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{s.name}</span>
                  <span className="text-[9px] font-bold text-zinc-400 capitalize">{s.type}</span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Status Toggle buttons */}
                  <select
                    value={s.status}
                    onChange={(e) => updateSlotStatus(s.id, e.target.value as SlotStatus)}
                    className={`text-[10px] font-bold px-1.5 py-1 rounded focus:outline-none ${
                      s.status === 'available'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : s.status === 'occupied'
                          ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deploy New Terminal Form */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-5">
          <div>
            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">Deploy Parking Terminal</h4>
            <p className="text-xs text-zinc-400 font-medium">Instantiate a physical lot into fleet network</p>
          </div>

          <form onSubmit={handleCreateLocation} className="space-y-4">
            
            {/* Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Terminal Name</label>
              <input 
                type="text" 
                required
                value={locName}
                onChange={(e) => setLocName(e.target.value)}
                placeholder="Indiranagar Executive Garage"
                className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Geographical Address</label>
              <input 
                type="text" 
                required
                value={locAddress}
                onChange={(e) => setLocAddress(e.target.value)}
                placeholder="80 Feet Road, Near Hal Colony"
                className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Price Rate and slots amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Tariff (₹/Hr)</label>
                <input 
                  type="number" 
                  required
                  value={locRate}
                  onChange={(e) => setLocRate(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  min="20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Lanes (Total Bays)</label>
                <input 
                  type="number" 
                  required
                  value={locSlotsCount}
                  onChange={(e) => setLocSlotsCount(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500"
                  min="5"
                  max="50"
                />
              </div>
            </div>

            {/* Amenities Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Station Equipment</label>
              <div className="flex flex-wrap gap-2">
                {['CCTV', 'EV Charger', 'Covered', 'Wheelchair Access', 'Car Wash'].map(amenity => {
                  const active = amenitiesList.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
                        active 
                          ? 'bg-indigo-600 text-white border-transparent' 
                          : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create Location Submit Trigger */}
            <button
              type="submit"
              id="deploy-terminal-btn"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-950 dark:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-xs rounded-xl transition hover:bg-zinc-900"
            >
              <Plus className="w-4 h-4" />
              Initialize IoT Terminal
            </button>
          </form>
        </div>

      </div>

      {/* Real-time System Audit Logs terminal */}
      <div className="bg-zinc-950 text-white border border-zinc-900 p-5 rounded-3xl shadow-xl space-y-4 font-mono text-[11px] leading-relaxed">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="font-bold text-zinc-300">Live IoT System Audit Logs</span>
          </div>
          <span className="text-[9px] text-zinc-500">Fleet ID: SMART_PARK_77A</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-zinc-900 scrollbar-thin">
          {logs.map((log) => (
            <div key={log.id} className="pt-2 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1.5 text-zinc-400">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-zinc-600 font-bold">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className={`font-bold ${
                  log.action === 'check_in' 
                    ? 'text-emerald-400' 
                    : log.action === 'check_out' 
                      ? 'text-amber-400' 
                      : 'text-indigo-400'
                }`}>
                  {log.action.toUpperCase()}
                </span>
                <span>
                  - {log.userName} at {log.locationName}, Slot {log.slotName}
                </span>
              </div>
              <span className="text-[10px] text-zinc-600">ID: {log.id}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
