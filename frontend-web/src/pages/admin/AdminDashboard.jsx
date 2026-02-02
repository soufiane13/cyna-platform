import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, Users, ShoppingCart, AlertCircle } from 'lucide-react';

// --- MOCK DATA ---
const salesData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const categoryData = [
  { name: 'SOC', value: 400, color: '#00F0FF' }, // Cyan
  { name: 'EDR', value: 300, color: '#8A2BE2' }, // Purple
  { name: 'XDR', value: 300, color: '#00FF94' }, // Green
];

const basketData = [
  { name: 'SOC', avg: 1200 },
  { name: 'EDR', avg: 900 },
  { name: 'XDR', avg: 2400 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. KPI CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Revenue" value="$42,500" trend="+12%" icon={<TrendingUp size={20} />} isPositive={true} />
        <KpiCard title="Active Subs" value="843" trend="+5%" icon={<Users size={20} />} isPositive={true} />
        <KpiCard title="New Orders" value="12" trend="-2%" icon={<ShoppingCart size={20} />} isPositive={false} />
        <KpiCard title="Pending Tickets" value="5" trend="Urgent" icon={<AlertCircle size={20} />} isPositive={false} isAlert={true} />
      </div>

      {/* 2. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        
        {/* Sales Histogram (Area Chart for nicer look) */}
        <div className="bg-[#1C2128] border border-white/5 rounded-2xl p-6 flex flex-col">
          <h3 className="text-[#F0F6FC] font-bold mb-6">Revenue Analytics (Weekly)</h3>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" vertical={false} />
                <XAxis dataKey="name" stroke="#8B949E" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#8B949E" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }}
                  itemStyle={{ color: '#00F0FF' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW: Category + Basket (Split) */}
        <div className="flex flex-col gap-6">
            
            {/* Category Donut */}
            <div className="flex-1 bg-[#1C2128] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                <div>
                    <h3 className="text-[#F0F6FC] font-bold mb-2">Category Volume</h3>
                    <p className="text-xs text-[#8B949E]">Distribution of sales by product type</p>
                </div>
                <div className="w-[180px] h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={categoryData} 
                                cx="50%" cy="50%" 
                                innerRadius={40} 
                                outerRadius={60} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#333', borderRadius: '8px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                    {categoryData.map(c => (
                        <div key={c.name} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: c.color}}></div>
                            <span className="text-[#8B949E]">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Average Basket Bar */}
            <div className="flex-1 bg-[#1C2128] border border-white/5 rounded-2xl p-6">
                <h3 className="text-[#F0F6FC] font-bold mb-4 text-sm">Average Basket Value ($)</h3>
                <div className="w-full h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={basketData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#8B949E" tick={{fontSize: 10}} width={40} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#333' }} />
                            <Bar dataKey="avg" fill="#F0F6FC" fillOpacity={0.2} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

// --- Sub-Component: KPI Card ---
const KpiCard = ({ title, value, trend, icon, isPositive, isAlert }) => (
    <div className="bg-[#1C2128] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00F0FF]/30 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${isAlert ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]' : 'bg-[#00F0FF]/10 text-[#00F0FF]'}`}>
                {icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            }`}>
                {trend}
            </span>
        </div>
        <h4 className="text-[#8B949E] text-xs uppercase tracking-wider font-bold mb-1">{title}</h4>
        <p className="text-2xl font-bold text-white">{value}</p>
        
        {/* Decorative Glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#00F0FF]/5 rounded-full blur-2xl group-hover:bg-[#00F0FF]/10 transition-all"></div>
    </div>
);

export default AdminDashboard;