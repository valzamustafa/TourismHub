import { Edit, Trash2, MapPin, Users, Star, Trees } from "lucide-react";

interface Activity {
  id: string;
  name: string;
  description: string;
  price: number;
  availableSlots: number;
  location: string;
  category: string;
  status: string;
  createdAt: string;
}

interface ActivitiesTableProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
}

const ActivitiesTable = ({ activities, onDeleteActivity }: ActivitiesTableProps) => {
  return (
    <div className="bg-emerald-50/50 backdrop-blur-sm rounded-3xl shadow-lg border border-emerald-200 overflow-hidden">
      <div className="px-8 py-6 border-b border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Forest Adventures
            </h2>
            <p className="text-gray-700 mt-1">Manage your mountain experiences</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Trees className="w-5 h-5" />
            <span className="font-semibold">{activities.length} Active Trails</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-hidden">
        <div className="grid gap-4 p-6">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-gradient-to-r from-emerald-100/50 to-teal-100/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {activity.name}
                      </h3>
                      <p className="text-gray-700 mt-2 line-clamp-2">{activity.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ${activity.price}
                      </div>
                      <div className="text-gray-600 text-sm">per adventurer</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                      {activity.location}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-teal-500" />
                      {activity.availableSlots} spots available
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      {activity.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 ml-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    activity.status === 'Active' 
                      ? 'bg-gradient-to-r from-emerald-300 to-teal-400 text-gray-900'
                      : 'bg-gradient-to-r from-amber-300 to-orange-400 text-gray-900'
                  }`}>
                    {activity.status}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-3 bg-emerald-200/50 rounded-2xl text-gray-700 hover:bg-emerald-300 hover:text-gray-900 transition-all duration-300 hover:scale-110 border border-emerald-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteActivity(activity.id)}
                      className="p-3 bg-red-200/50 rounded-2xl text-gray-700 hover:bg-red-300 hover:text-gray-900 transition-all duration-300 hover:scale-110 border border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 w-full bg-emerald-300/30 rounded-full h-1">
                <div className="h-1 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesTable;