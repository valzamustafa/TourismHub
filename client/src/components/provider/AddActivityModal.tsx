import { X, Upload, Image, Mountain, Trees } from "lucide-react";
import { useState, useRef } from "react";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  activityData: {
    name: string;
    description: string;
    price: number;
    availableSlots: number;
    location: string;
    category: string;
  };
  onDataChange: (field: string, value: string | number) => void;
}

const AddActivityModal = ({
  isOpen,
  onClose,
  onSubmit,
  activityData,
  onDataChange
}: AddActivityModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

  
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
 
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      

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

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (selectedImage) {
      console.log('Uploading image:', selectedImage.name);

    }
    
    onSubmit(e);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-emerald-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-emerald-400/20 relative overflow-hidden flex flex-col">
     
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>
        
   
        <div className="flex-shrink-0 p-8 pb-0 relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create Mountain Trail</h2>
                <p className="text-emerald-200 text-sm">Design your wilderness adventure</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 hover:scale-110 group"
            >
              <X className="w-5 h-5 text-emerald-200/60 group-hover:text-white" />
            </button>
          </div>
        </div>

  
        <div className="flex-1 overflow-y-auto p-8 pt-0 relative z-10">

          <div className="mb-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-emerald-400/30 rounded-2xl p-8 text-center hover:border-emerald-300 transition-all duration-300 cursor-pointer bg-emerald-800/20 backdrop-blur-sm group"
            >
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Trail preview" 
                    className="w-full h-48 object-cover rounded-2xl mx-auto mb-4"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-all duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-emerald-200 font-semibold">Image selected</p>
                  <p className="text-emerald-200/60 text-sm">Click to change image</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-emerald-300" />
                  </div>
                  <p className="text-emerald-200 font-semibold mb-2">Upload trail scenery</p>
                  <p className="text-emerald-200/60 text-sm">Drag & drop or click to browse</p>
                  <p className="text-emerald-200/40 text-xs mt-2">PNG, JPG, JPEG up to 5MB</p>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-emerald-200 font-semibold mb-3">
                  Trail Name
                </label>
                <input
                  type="text"
                  value={activityData.name}
                  onChange={(e) => onDataChange('name', e.target.value)}
                  className="w-full px-4 py-4 bg-emerald-800/20 border border-emerald-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder-emerald-200/40 transition-all"
                  placeholder="Epic Mountain Trail"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-200 font-semibold mb-3">
                  Terrain Type
                </label>
                <select
                  value={activityData.category}
                  onChange={(e) => onDataChange('category', e.target.value)}
                  className="w-full px-4 py-4 bg-emerald-800/20 border border-emerald-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="" className="bg-emerald-900">Select terrain</option>
                  <option value="Forest" className="bg-emerald-900">🌲 Forest Hike</option>
                  <option value="Mountain" className="bg-emerald-900">🏔️ Mountain Climb</option>
                  <option value="Waterfall" className="bg-emerald-900">💧 Waterfall Trail</option>
                  <option value="Valley" className="bg-emerald-900">🏞️ Valley Exploration</option>
                  <option value="River" className="bg-emerald-900">🚣 River Adventure</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-emerald-200 font-semibold mb-3">
                Trail Description
              </label>
              <textarea
                value={activityData.description}
                onChange={(e) => onDataChange('description', e.target.value)}
                className="w-full px-4 py-4 bg-emerald-800/20 border border-emerald-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder-emerald-200/40 transition-all"
                rows={3}
                placeholder="Describe the mountain experience..."
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-emerald-200 font-semibold mb-3">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={activityData.price}
                  onChange={(e) => onDataChange('price', parseFloat(e.target.value))}
                  className="w-full px-4 py-4 bg-emerald-800/20 border border-emerald-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white transition-all"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-200 font-semibold mb-3">
                  Group Size
                </label>
                <input
                  type="number"
                  value={activityData.availableSlots}
                  onChange={(e) => onDataChange('availableSlots', parseInt(e.target.value))}
                  className="w-full px-4 py-4 bg-emerald-800/20 border border-emerald-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white transition-all"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-200 font-semibold mb-3">
                  🗺️ Location
                </label>
                <input
                  type="text"
                  value={activityData.location}
                  onChange={(e) => onDataChange('location', e.target.value)}
                  className="w-full px-4 py-4 bg-emerald-800/20 border border-emerald-400/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder-emerald-200/40 transition-all"
                  placeholder="Mountain Range"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 text-emerald-200 bg-emerald-800/20 rounded-2xl hover:bg-emerald-700/30 transition-all duration-300 hover:scale-105 border border-emerald-400/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 font-semibold flex items-center space-x-2"
              >
                <Mountain className="w-5 h-5" />
                <span>Create Trail</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal;