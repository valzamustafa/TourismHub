import { Plus, Bell, User, MapPin, Compass, Lock } from "lucide-react";

interface HeaderProps {
  onAddActivity: () => void;
  onChangePassword?: () => void; 
  showAddButton?: boolean;
  userName?: string;
  userLocation?: string;
}

const Header = ({ onAddActivity, onChangePassword, showAddButton = true, userName, userLocation = "Mountain Region" }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl border-b border-amber-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
                TrailGuide Pro
              </h1>
              <p className="text-gray-400 text-sm mt-1 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                Adventure Provider Hub
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300 text-sm">{userLocation}</span>
            </div>

            <button className="relative p-3 text-gray-400 hover:text-amber-400 hover:bg-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </span>
            </button>
            
            {/* Butoni për Change Password */}
            {onChangePassword && (
              <button
                onClick={onChangePassword}
                className="p-3 text-gray-400 hover:text-amber-400 hover:bg-gray-800/50 rounded-xl transition-all duration-300 backdrop-blur-sm"
                title="Change Password"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-700">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold block">{userName}</span>
                <span className="text-amber-400 text-xs">Trail Expert</span>
              </div>
            </div>

            {showAddButton && (
              <button
                onClick={onAddActivity}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 hover:scale-105 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">New Adventure</span>
                <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;