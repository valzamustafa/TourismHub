import { Edit, Trash2, MapPin, Users, Star, Trees, Compass } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  categoryId: string;
  duration: string;
  included: string[];
  requirements: string[];
  quickFacts: string[];
  status: string;
  createdAt: string;
  images: string[];
}

interface ActivitiesTableProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
}

const ActivitiesTable = ({ activities, onDeleteActivity, onEditActivity }: ActivitiesTableProps) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              My Adventure Trails
            </h2>
            <p className="text-gray-400 mt-1">Manage your mountain experiences</p>
          </div>
          <div className="flex items-center space-x-2 text-amber-400">
            <Compass className="w-5 h-5" />
            <span className="font-semibold">{activities.length} Active Trails</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div className="grid gap-4 p-6">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600 hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {activity.name}
                      </h3>
                      <p className="text-gray-400 mt-2 line-clamp-2">{activity.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-400">
                        ${activity.price}
                      </div>
                      <div className="text-gray-500 text-sm">per adventurer</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                      {activity.location}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="w-4 h-4 mr-2 text-emerald-500" />
                      {activity.availableSlots} spots available
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      {activity.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    activity.status === 'Active' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                  }`}>
                    {activity.status}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onEditActivity(activity)}
                      className="p-3 bg-amber-600/20 rounded-xl text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 transition-all duration-300 hover:scale-110 border border-amber-500/30"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteActivity(activity.id)}
                      className="p-3 bg-red-600/20 rounded-xl text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 hover:scale-110 border border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                <div className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesTable;