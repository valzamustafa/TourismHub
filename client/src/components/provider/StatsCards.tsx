import { Users, DollarSign, Calendar, Activity, TrendingUp, Mountain, MapPin } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalActivities: number;
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
    activeAdventurers: number;
    popularLocation: string;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const statItems = [
    {
      label: "Active Trails",
      value: stats.totalActivities,
      icon: Mountain,
      gradient: "from-amber-400 to-orange-500",
      bgGradient: "from-amber-900/20 to-orange-900/20",
      borderColor: "border-amber-700/30",
      glow: "hover:shadow-amber-500/20",
      description: "Your mountain experiences"
    },
    {
      label: "Adventure Bookings",
      value: stats.totalBookings,
      icon: Users,
      gradient: "from-emerald-400 to-green-500",
      bgGradient: "from-emerald-900/20 to-green-900/20",
      borderColor: "border-emerald-700/30",
      glow: "hover:shadow-emerald-500/20",
      description: "Total reservations"
    },
    {
      label: "Trail Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-lime-400 to-emerald-500",
      bgGradient: "from-lime-900/20 to-emerald-900/20",
      borderColor: "border-lime-700/30",
      glow: "hover:shadow-lime-500/20",
      description: "Total earnings"
    },
    {
      label: "Adventurers Today",
      value: stats.activeAdventurers,
      icon: Activity,
      gradient: "from-cyan-400 to-blue-500",
      bgGradient: "from-cyan-900/20 to-blue-900/20",
      borderColor: "border-cyan-700/30",
      glow: "hover:shadow-cyan-500/20",
      description: "Active explorers"
    }
  ];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, index) => (
          <div 
            key={item.label}
            className={`relative bg-gradient-to-br ${item.bgGradient} backdrop-blur-sm rounded-2xl p-6 border ${item.borderColor} shadow-lg hover:shadow-xl ${item.glow} transition-all duration-500 hover:-translate-y-2 group overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <div className="absolute top-3 right-3 w-3 h-3 bg-gray-500/30 rounded-full animate-pulse"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-3xl font-bold text-white">
                  {item.value}
                </p>
                <p className="text-gray-500 text-xs">
                  {item.description}
                </p>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${item.gradient} shadow-lg transition-all duration-1000 transform origin-left`}
                    style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-700/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-400 to-indigo-500 shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                Popular Trail Location
              </p>
              <p className="text-xl font-bold text-white">
                {stats.popularLocation || "No data yet"}
              </p>
              <p className="text-gray-500 text-xs">
                Most booked destination
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">🏆</div>
            <p className="text-gray-500 text-xs">Top Performer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;