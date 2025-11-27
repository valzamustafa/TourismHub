interface TabsNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsNavigation = ({ activeTab, setActiveTab }: TabsNavigationProps) => {
  const tabs = [
    { id: 'overview', label: 'Mountain View', icon: '🏔️', gradient: 'from-emerald-200 to-teal-300' },
    { id: 'activities', label: 'Forest Trails', icon: '🌲', gradient: 'from-green-200 to-emerald-300' },
    { id: 'bookings', label: 'River Bookings', icon: '💧', gradient: 'from-teal-200 to-cyan-300' }
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-2 border border-emerald-200 shadow-lg mb-8">
      <nav className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-6 rounded-2xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.gradient} text-gray-900 shadow-lg transform scale-105`
                : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </div>
            
  
            {activeTab === tab.id && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-700/80 rounded-full animate-bounce"></div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabsNavigation;