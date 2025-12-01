interface TabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsNavigation = ({ activeTab, setActiveTab }: TabsNavigationProps) => {
  const tabs = [
    { 
      id: 'overview', 
      label: 'Trail Overview', 
      icon: '🏔️', 
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-900/30 to-orange-900/30',
      description: 'Your adventure summary'
    },
    { 
      id: 'activities', 
      label: 'My Trails', 
      icon: '🥾', 
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-900/30 to-green-900/30',
      description: 'Manage your experiences'
    },
    { 
      id: 'bookings', 
      label: 'Adventure Bookings', 
      icon: '📋', 
      gradient: 'from-cyan-500 to-blue-600',
      bgGradient: 'from-cyan-900/30 to-blue-900/30',
      description: 'Guest reservations'
    },
    { 
      id: 'performance', 
      label: 'Trail Performance', 
      icon: '📊', 
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-900/30 to-indigo-900/30',
      description: 'Analytics & insights'
    }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700 shadow-lg mb-8">
      <nav className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg transform scale-105`
                : `bg-gradient-to-br ${tab.bgGradient} text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700`
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{tab.icon}</span>
              <div className="text-center">
                <div className="font-semibold text-sm">{tab.label}</div>
                <div className="text-xs opacity-70">{tab.description}</div>
              </div>
            </div>
            
            {activeTab === tab.id && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabsNavigation;