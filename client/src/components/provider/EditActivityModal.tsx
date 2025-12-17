// components/provider/EditActivityModal.tsx
import { X, Upload, Mountain, Clock, CheckCircle, AlertCircle, Info, MapPin, Users, DollarSign, Calendar } from "lucide-react";
import { useState, useRef } from "react";

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  featured: boolean;
  activityCount: number;
}

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent, images: File[], removedImageUrls: string[]) => void; // Shto removedImageUrls
  activityData: {
    name: string;
    description: string;
    price: number;
    availableSlots: number;
    location: string;
    categoryId: string;
    duration: string;
    included: string;
    requirements: string;
    quickFacts: string;
    startDate: string;
    endDate: string;
  };
  onDataChange: (field: string, value: string | number) => void;
  existingImages?: string[];
  categories: Category[];
}

const EditActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  activityData,
  onDataChange,
  existingImages = [],
  categories
}: EditActivityModalProps) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  
  if (files.length > 0) {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`Image ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setSelectedImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }
};
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToRemove(prev => [...prev, imageUrl]);
    console.log('Marked image for removal:', imageUrl);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      const fakeEvent = {
        target: {
          files: dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleImageUpload(fakeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 
    if (!activityData.startDate || !activityData.endDate) {
      alert('Please select both start and end dates');
      return;
    }
    
    if (new Date(activityData.endDate) <= new Date(activityData.startDate)) {
      alert('End date must be after start date');
      return;
    }
    
    setUploading(true);
    onSubmit(e, selectedImages, imagesToRemove);
    setTimeout(() => setUploading(false), 2000);
  };


  const calculateDuration = () => {
    if (!activityData.startDate || !activityData.endDate) return '';
    
    const start = new Date(activityData.startDate);
    const end = new Date(activityData.endDate);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[95vh] shadow-2xl border border-gray-700 relative overflow-hidden flex flex-col">

        <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Adventure Trail</h2>
                <p className="text-gray-400 text-sm">Update your mountain experience</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Existing Images */}
          {existingImages.length > 0 && (
    <div className="mb-6">
      <label className="block text-gray-300 font-semibold mb-3">
        Existing Images
      </label>
      <div className="grid grid-cols-3 gap-4">
        {existingImages.map((imageUrl, index) => (
          <div key={index} className="relative">
            <img 
              src={imageUrl} 
              alt={`Existing ${index + 1}`}
              className={`w-full h-32 object-cover rounded-xl border ${
                imagesToRemove.includes(imageUrl) 
                  ? 'border-red-500 opacity-50' 
                  : 'border-gray-600'
              }`}
            />
            <button
              type="button"
              onClick={() => handleRemoveExistingImage(imageUrl)}
              className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-700 rounded-full text-white transition-all duration-300"
            >
              <X className="w-3 h-3" />
            </button>
            {imagesToRemove.includes(imageUrl) && (
              <div className="absolute inset-0 bg-red-500/30 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">Marked for removal</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {imagesToRemove.length > 0 && (
        <p className="text-red-400 text-sm mt-2">
          {imagesToRemove.length} image(s) marked for removal
        </p>
      )}
    </div>
  )}
          {/* New Images Upload */}
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all duration-300 cursor-pointer bg-gray-800/50 backdrop-blur-sm group"
            >
              {imagePreviews.length > 0 ? (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-700 rounded-full text-white transition-all duration-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-amber-400 font-semibold">
                    {selectedImages.length} new images selected
                  </p>
                  <p className="text-gray-400 text-sm">
                    Click or drag to add more images
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 border border-gray-600">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-amber-400" />
                  </div>
                  <p className="text-gray-300 font-semibold mb-2">
                    Add more trail photos
                  </p>
                  <p className="text-gray-500 text-sm">
                    Drag & drop or click to browse multiple images
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    PNG, JPG, JPEG up to 5MB each
                  </p>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Trail Name *
                </label>
                <input
                  type="text"
                  value={activityData.name}
                  onChange={(e) => onDataChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Epic Mountain Trail"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Category *
                </label>
                <select
                  value={activityData.categoryId}
                  onChange={(e) => onDataChange('categoryId', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="" className="bg-gray-800">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-gray-800">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Trail Description *
              </label>
              <textarea
                value={activityData.description}
                onChange={(e) => onDataChange('description', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                rows={3}
                placeholder="Describe the mountain experience, highlights, and what makes it special..."
                required
              />
            </div>

            {/* Date & Time Section */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center mb-4">
                <Calendar className="w-5 h-5 text-amber-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Schedule & Timing</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={activityData.startDate}
                    onChange={(e) => onDataChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={activityData.endDate}
                    onChange={(e) => onDataChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white transition-all"
                    required
                  />
                </div>
              </div>
              
              {/* Auto-calculated Duration */}
              {activityData.startDate && activityData.endDate && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Activity Duration:</span>
                    <span className="text-amber-400 font-bold">
                      {calculateDuration()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  <Clock className="w-4 h-4 inline mr-2 text-amber-400" />
                  Duration Text *
                </label>
                <input
                  type="text"
                  value={activityData.duration}
                  onChange={(e) => onDataChange('duration', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="e.g., 4 hours"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2 text-amber-400" />
                  Price ($) *
                </label>
                <input
                  type="number"
                  value={activityData.price}
                  onChange={(e) => onDataChange('price', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white transition-all"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  <Users className="w-4 h-4 inline mr-2 text-amber-400" />
                  Group Size *
                </label>
                <input
                  type="number"
                  value={activityData.availableSlots}
                  onChange={(e) => onDataChange('availableSlots', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white transition-all"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  <MapPin className="w-4 h-4 inline mr-2 text-amber-400" />
                  Location *
                </label>
                <input
                  type="text"
                  value={activityData.location}
                  onChange={(e) => onDataChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Mountain Range, City"
                  required
                />
              </div>
            </div>

            {/* Included & Requirements */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-2 text-emerald-400" />
                  What's Included
                </label>
                <textarea
                  value={activityData.included}
                  onChange={(e) => onDataChange('included', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  rows={3}
                  placeholder="Equipment, meals, guide, transportation... (separate with commas)"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Separate items with commas
                </p>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  <AlertCircle className="w-4 h-4 inline mr-2 text-red-400" />
                  Requirements
                </label>
                <textarea
                  value={activityData.requirements}
                  onChange={(e) => onDataChange('requirements', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  rows={3}
                  placeholder="Physical fitness, experience level, age restrictions... (separate with commas)"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Separate items with commas
                </p>
              </div>
            </div>

            {/* Quick Facts */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                <Info className="w-4 h-4 inline mr-2 text-cyan-400" />
                Quick Facts
              </label>
              <textarea
                value={activityData.quickFacts}
                onChange={(e) => onDataChange('quickFacts', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                rows={2}
                placeholder="Difficulty level, best season, altitude, distance... (separate with commas)"
              />
              <p className="text-gray-500 text-xs mt-2">
                Separate facts with commas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-300 bg-gray-800 rounded-xl hover:bg-gray-700 transition-all duration-300 border border-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-3 text-white bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl hover:from-amber-700 hover:to-orange-800 transition-all duration-300 shadow-2xl hover:shadow-amber-500/25 font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Mountain className="w-5 h-5" />
                    <span>Update Trail</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditActivityModal;