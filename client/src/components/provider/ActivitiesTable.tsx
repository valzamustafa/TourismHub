// components/provider/ActivitiesTable.tsx
import { Edit, Trash2, MapPin, Users, Star, Trees, Compass, Calendar, Clock } from "lucide-react";
import { useState } from "react";

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
  startDate: string;
  endDate: string;
  isActive?: boolean;
  isExpired?: boolean;
  isUpcoming?: boolean;
}

interface ActivitiesTableProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
  onStatusChange: (activityId: string, status: string) => void; 
}
const ActivitiesTable = ({ 
  activities, 
  onDeleteActivity, 
  onEditActivity,
  onStatusChange
}: ActivitiesTableProps) => {
  

const getStatusInfo = (activity: Activity) => {

  const now = new Date();
  const startDate = new Date(activity.startDate);
  const endDate = new Date(activity.endDate);
  
  if (activity.status && ['Pending', 'Active', 'Inactive', 'Completed', 'Cancelled', 'Expired'].includes(activity.status)) {
    const statusColors: Record<string, any> = {
      'Pending': { color: 'bg-amber-500/20', text: 'Pending', border: 'border-amber-500/30', textColor: 'text-amber-400' },
      'Active': { color: 'bg-emerald-500/20', text: 'Active', border: 'border-emerald-500/30', textColor: 'text-emerald-400' },
      'Inactive': { color: 'bg-gray-500/20', text: 'Inactive', border: 'border-gray-500/30', textColor: 'text-gray-400' },
      'Completed': { color: 'bg-blue-500/20', text: 'Completed', border: 'border-blue-500/30', textColor: 'text-blue-400' },
      'Cancelled': { color: 'bg-red-500/20', text: 'Cancelled', border: 'border-red-500/30', textColor: 'text-red-400' },
      'Expired': { color: 'bg-red-500/20', text: 'Expired', border: 'border-red-500/30', textColor: 'text-red-400' }
    };
    
    return statusColors[activity.status] || statusColors['Pending'];
  }
  
  if (endDate < now) {
    return {
      color: 'bg-red-500/20',
      text: 'Expired',
      border: 'border-red-500/30',
      textColor: 'text-red-400'
    };
  } else if (startDate <= now && endDate >= now) {
    return {
      color: 'bg-emerald-500/20',
      text: 'Active',
      border: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    };
  } else if (startDate > now) {
    return {
      color: 'bg-amber-500/20',
      text: 'Upcoming',
      border: 'border-amber-500/30',
      textColor: 'text-amber-400'
    };
  } else {
    return {
      color: 'bg-gray-500/20',
      text: activity.status || 'Unknown',
      border: 'border-gray-500/30',
      textColor: 'text-gray-400'
    };
  }
};

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
          {activities.map((activity) => {
            const statusInfo = getStatusInfo(activity);
            
            return (
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

                    {/* Date Information */}
                    <div className="mb-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Start Date</div>
                            <div className="text-white font-medium">
                              {new Date(activity.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">End Date</div>
                            <div className="text-white font-medium">
                              {new Date(activity.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Details */}
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
                      <div className="flex items-center text-gray-300">
                        <Clock className="w-4 h-4 mr-2 text-cyan-500" />
                        {activity.duration || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end ml-6 space-y-4">
                    <div className="flex flex-col items-end space-y-2">
                  <select
                    value={activity.status}
                    onChange={(e) => onStatusChange(activity.id, e.target.value)} 
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} ${statusInfo.border} ${statusInfo.textColor}`}>
                    {statusInfo.text}
                  </span>
                </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onEditActivity(activity)}
                        className="p-3 bg-amber-600/20 rounded-xl text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 transition-all duration-300 hover:scale-110 border border-amber-500/30"
                        title="Edit Activity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-3 bg-red-600/20 rounded-xl text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 hover:scale-110 border border-red-500/30"
                        title="Delete Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                  <div className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000" style={{ width: '75%' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesTable;