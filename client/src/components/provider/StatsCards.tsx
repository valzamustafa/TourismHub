import { Users, DollarSign, Calendar, Activity, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalActivities: number;
    totalBookings: number;
    totalRevenue: number;
    pendingBookings: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  const statItems = [
    {
      label: "Mountain Trails",
      value: stats.totalActivities,
      icon: Activity,
      gradient: "from-emerald-200 to-green-300",
      bgGradient: "from-emerald-50 to-green-100",
      borderColor: "border-emerald-200",
      glow: "hover:shadow-emerald-200"
    },
    {
      label: "Adventure Bookings",
      value: stats.totalBookings,
      icon: Users,
      gradient: "from-teal-200 to-cyan-300",
      bgGradient: "from-teal-50 to-cyan-100",
      borderColor: "border-teal-200",
      glow: "hover:shadow-teal-200"
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-lime-200 to-emerald-300",
      bgGradient: "from-lime-50 to-emerald-100",
      borderColor: "border-lime-200",
      glow: "hover:shadow-lime-200"
    },
    {
      label: "Pending Hikes",
      value: stats.pendingBookings,
      icon: Calendar,
      gradient: "from-green-200 to-teal-300",
      bgGradient: "from-green-50 to-teal-100",
      borderColor: "border-green-200",
      glow: "hover:shadow-green-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      {statItems.map((item, index) => (
        <div 
          key={item.label}
          className={`relative bg-gradient-to-br ${item.bgGradient} backdrop-blur-sm rounded-3xl p-6 border ${item.borderColor} shadow-lg hover:shadow-xl ${item.glow} transition-all duration-500 hover:-translate-y-2 group overflow-hidden`}
        >
        
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
          
    
          <div className="absolute top-2 right-2 w-4 h-4 bg-gray-400/30 rounded-full animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${item.gradient} shadow-lg`}>
                <item.icon className="w-6 h-6 text-gray-800" />
              </div>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700 text-sm font-medium uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {item.value}
              </p>
            </div>


            <div className="mt-6">
              <div className="w-full bg-gray-300/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${item.gradient} shadow-lg transition-all duration-1000 transform origin-left`}
                  style={{ width: `${Math.min(100, (index + 1) * 25)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Flow</span>
                <span>{Math.min(100, (index + 1) * 25)}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;