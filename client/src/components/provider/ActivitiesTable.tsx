'use client';

import { Edit, Trash2, MapPin, Users, Star, Clock, Calendar } from "lucide-react";
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
  delayedDate?: string;
  rescheduledStartDate?: string;
  rescheduledEndDate?: string;
}

interface ActivitiesTableProps {
  activities: Activity[];
  onDeleteActivity: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
  onStatusChange: (activityId: string, status: string, rescheduledDates?: {startDate?: string, endDate?: string}) => void;
}

const ActivitiesTable = ({ 
  activities, 
  onDeleteActivity, 
  onEditActivity,
  onStatusChange
}: ActivitiesTableProps) => {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [rescheduledStartDate, setRescheduledStartDate] = useState('');
  const [rescheduledEndDate, setRescheduledEndDate] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const getStatusInfo = (activity: Activity) => {
    const statusColors: Record<string, any> = {
      'Pending': { color: 'bg-amber-500/20', text: 'Pending', border: 'border-amber-500/30', textColor: 'text-amber-400' },
      'Active': { color: 'bg-emerald-500/20', text: 'Active', border: 'border-emerald-500/30', textColor: 'text-emerald-400' },
      'Inactive': { color: 'bg-gray-500/20', text: 'Inactive', border: 'border-gray-500/30', textColor: 'text-gray-400' },
      'Rejected': { color: 'bg-red-500/20', text: 'Rejected', border: 'border-red-500/30', textColor: 'text-red-400' },
      'Completed': { color: 'bg-blue-500/20', text: 'Completed', border: 'border-blue-500/30', textColor: 'text-blue-400' },
      'Expired': { color: 'bg-red-500/20', text: 'Expired', border: 'border-red-500/30', textColor: 'text-red-400' },
      'Cancelled': { color: 'bg-red-500/20', text: 'Cancelled', border: 'border-red-500/30', textColor: 'text-red-400' },
      'Delayed': { color: 'bg-purple-500/20', text: 'Delayed', border: 'border-purple-500/30', textColor: 'text-purple-400' }
    };
    
    const now = new Date();
    const endDate = new Date(activity.endDate);
    const isExpired = endDate < now;
    
    if (isExpired) {
      return statusColors['Expired'];
    }
    
    return statusColors[activity.status] || statusColors['Pending'];
  };

  const handleStatusChange = (activityId: string, status: string, activity: Activity) => {
    if (status === 'Delayed') {
      setSelectedActivityId(activityId);
      setSelectedActivity(activity);
      setShowRescheduleModal(true);
    } else {
      onStatusChange(activityId, status);
    }
  };

  const handleConfirmDelayed = () => {
    if (!selectedActivityId || !selectedActivity) return;
    
    let formattedStartDate = '';
    let formattedEndDate = '';
    
    if (rescheduledStartDate) {
      const date = new Date(rescheduledStartDate);
      formattedStartDate = date.toISOString();
    }
    
    if (rescheduledEndDate) {
      const date = new Date(rescheduledEndDate);
      formattedEndDate = date.toISOString();
    }
    
    onStatusChange(selectedActivityId, 'Delayed', {
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    setShowRescheduleModal(false);
    setRescheduledStartDate('');
    setRescheduledEndDate('');
    setSelectedActivityId(null);
    setSelectedActivity(null);
  };

  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let duration = '';
    if (diffDays > 0) duration += `${diffDays} day${diffDays > 1 ? 's' : ''} `;
    if (diffHours > 0) duration += `${diffHours} hour${diffHours > 1 ? 's' : ''} `;
    if (diffMins > 0 && diffDays === 0) duration += `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    
    return duration.trim() || '0 minutes';
  };

  return (
    <>
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
              <span className="font-semibold">{activities.length} Active Trails</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden">
          <div className="grid gap-4 p-6">
            {activities.map((activity) => {
              const statusInfo = getStatusInfo(activity);
              const hasRescheduledDates = activity.rescheduledStartDate || activity.rescheduledEndDate;
              
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Start Date</div>
                            <div className="text-white font-medium">
                              {activity.status === 'Delayed' && activity.rescheduledStartDate ? (
                                <>
                                  <div className="text-amber-400">
                                    {new Date(activity.rescheduledStartDate).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-500 line-through">
                                    Original: {new Date(activity.startDate).toLocaleDateString()}
                                  </div>
                                </>
                              ) : (
                                new Date(activity.startDate).toLocaleDateString()
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.status === 'Delayed' && activity.rescheduledStartDate 
                                ? new Date(activity.rescheduledStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(activity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                              {activity.status === 'Delayed' && activity.rescheduledEndDate ? (
                                <>
                                  <div className="text-emerald-400">
                                    {new Date(activity.rescheduledEndDate).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-500 line-through">
                                    Original: {new Date(activity.endDate).toLocaleDateString()}
                                  </div>
                                </>
                              ) : (
                                new Date(activity.endDate).toLocaleDateString()
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.status === 'Delayed' && activity.rescheduledEndDate 
                                ? new Date(activity.rescheduledEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(activity.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {activity.status === 'Delayed' && activity.delayedDate && (
                        <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-purple-400 text-sm font-medium">
                                Activity was delayed on: {new Date(activity.delayedDate).toLocaleString()}
                              </span>
                            </div>
                            
                            {hasRescheduledDates && (
                              <div className="ml-6 space-y-2">
                                {activity.rescheduledStartDate && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                                    <span className="text-amber-300 text-sm">
                                      New start: {new Date(activity.rescheduledStartDate).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                
                                {activity.rescheduledEndDate && (
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span className="text-emerald-300 text-sm">
                                      New end: {new Date(activity.rescheduledEndDate).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-6 mt-4">
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
                          {activity.duration || calculateDuration(activity.startDate, activity.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end ml-6 space-y-4">
                      <div className="flex flex-col items-end space-y-2">
                        <select
                          value={activity.status}
                          onChange={(e) => handleStatusChange(activity.id, e.target.value, activity)}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Delayed">Delayed</option>
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

                  <div className="mt-4 w-full bg-gray-700 rounded-full h-1">
                    <div className="h-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000" style={{ width: '75%' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showRescheduleModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Reschedule Activity</h3>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Activity: <span className="font-semibold text-white">{selectedActivity.name}</span></p>
              
              <div className="bg-gray-800/50 p-4 rounded-xl mb-4">
                <p className="text-gray-400 text-sm mb-2">Current Schedule:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-400 text-xs">Start Date</p>
                    <p className="text-white font-medium">
                      {new Date(selectedActivity.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(selectedActivity.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-purple-400 text-xs">End Date</p>
                    <p className="text-white font-medium">
                      {new Date(selectedActivity.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(selectedActivity.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              This activity will be marked as Delayed. Please provide the new scheduled dates:
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  New Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={rescheduledStartDate}
                  onChange={(e) => setRescheduledStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  New End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={rescheduledEndDate}
                  onChange={(e) => setRescheduledEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  min={rescheduledStartDate || new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedActivityId(null);
                  setSelectedActivity(null);
                  setRescheduledStartDate('');
                  setRescheduledEndDate('');
                }}
                className="px-4 py-2 text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelayed}
                disabled={!rescheduledStartDate || !rescheduledEndDate}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark as Delayed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivitiesTable;