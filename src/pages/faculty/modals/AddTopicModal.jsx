import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { addTopic, updateTopic } from '../api/faculty.api';

const AddTopicModal = ({
  isOpen,
  onClose,
  classroomId,
  onTopicAction,
  initialData = null
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      let res;
      if (initialData) {
        res = await updateTopic(classroomId, initialData._id, { name });
      } else {
        res = await addTopic(classroomId, { name });
      }

      if (res.success) {
        onTopicAction();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Error processing topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-[20px] font-medium text-gray-800 mb-6">
            {initialData ? 'Rename topic' : 'Add topic'}
          </h2>

          <div className="relative group">
            <input
              autoFocus
              className="w-full text-[15px] py-2 bg-transparent border-b-2 border-gray-200 focus:border-[#08384F] outline-none transition-colors placeholder:text-gray-400"
              placeholder="Topic name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            {/* Blue underline animation on focus */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#08384F] transition-all duration-300 group-focus-within:w-full"></div>
          </div>

          <div className="flex justify-end mt-2">
            <span className="text-[10px] text-gray-400 font-medium">
              {name.length} / 100
            </span>
          </div>
        </div>

        <div className="px-4 py-3 bg-white flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="px-4 py-2 text-[14px] font-medium text-[#08384F] hover:bg-blue-50 disabled:text-gray-300 disabled:hover:bg-transparent rounded-md transition-all flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Rename' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTopicModal;
