import { Plus, Bell, User, Trees, Mountain } from "lucide-react";

interface HeaderProps {
  onAddActivity: () => void;
  showAddButton?: boolean;
  userName?: string;
}

const Header = ({ onAddActivity, showAddButton = true, userName }: HeaderProps) => {
  return (
    <header className="bg-gradient-to-br from-emerald-900 via-green-900 to-teal-800 shadow-2xl border-b border-emerald-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-emerald-900"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 bg-clip-text text-transparent">
                NatureFlow
              </h1>
              <p className="text-emerald-200 text-sm mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Mountain Adventure Hub
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative p-3 text-emerald-200 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-300 backdrop-blur-sm">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full border-2 border-emerald-900 flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </span>
            </button>
            
            <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-semibold block">{userName}</span>
                <span className="text-emerald-300 text-xs">Mountain Guide</span>
              </div>
            </div>

            {showAddButton && (
              <button
                onClick={onAddActivity}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">New Trail</span>
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