import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  X,
  Upload,
  Link as LinkIcon,
  Youtube,
  HardDrive,
  Loader2,
  Paperclip
} from 'lucide-react';
import { createPost, updatePost } from '../api/faculty.api';

const AnnouncementModal = ({
  isOpen,
  onClose,
  classroomId,
  onPostCreated,
  initialData = null
}) => {
  const [instructions, setInstructions] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subModal, setSubModal] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setInstructions(initialData.instructions || '');
      setAttachments(initialData.attachments || []);
    } else {
      setInstructions('');
      setAttachments([]);
      setFile(null);
    }
  }, [initialData, isOpen]);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024)
      setFile(selectedFile);
    else alert('File size exceeds 5MB limit.');
  };

  const handleAddAttachment = () => {
    if (!inputValue.trim()) return;
    let type = subModal;
    if (
      type === 'video' &&
      !inputValue.includes('youtube.com') &&
      !inputValue.includes('youtu.be')
    )
      type = 'link';

    setAttachments([
      ...attachments,
      { fileName: type, fileUrl: inputValue, fileType: type }
    ]);
    setInputValue('');
    setSubModal(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'announcement');
      formData.append('instructions', instructions);
      if (file) formData.append('file', file);
      formData.append('attachments', JSON.stringify(attachments));

      let res = initialData
        ? await updatePost(
            classroomId,
            'announcement',
            initialData._id,
            formData
          )
        : await createPost(classroomId, formData);

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const isPostDisabled =
    loading || !instructions.replace(/<(.|\n)*?>/g, '').trim();

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/45 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95">
        {/* CSS Overrides for Quill */}
        <style>{`
          .quill { border: none !important; }
          .ql-toolbar { border: none !important; border-bottom: 1px solid #f1f3f4 !important; }
          .ql-container { border: none !important; font-size: 15px; }
          .ql-editor { min-height: 160px; color: #3c4043; padding: 20px !important; }
          .ql-editor.ql-blank::before { color: #70757a; font-style: normal; left: 20px !important; }
        `}</style>

        {/* Header */}
        <div className="px-6 py-3 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-gray-700 font-medium text-[18px]">
              {initialData ? 'Edit announcement' : 'Announcement'}
            </h2>
          </div>
          <button
            disabled={isPostDisabled}
            onClick={handleSubmit}
            className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
              isPostDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#08384F] text-white hover:bg-[#0a4663] shadow-sm'
            }`}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : initialData ? (
              'Save'
            ) : (
              'Post'
            )}
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all bg-white">
            <ReactQuill
              theme="snow"
              value={instructions}
              onChange={setInstructions}
              modules={modules}
              placeholder="Announce something to your class"
            />
          </div>

          {/* Attachments List */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {file && (
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded">
                    <Paperclip size={16} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {attachments.map((at, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded">
                    {at.fileType === 'video' ? (
                      <Youtube size={16} className="text-red-600" />
                    ) : (
                      <LinkIcon size={16} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {at.fileUrl}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setAttachments(attachments.filter((_, idx) => idx !== i))
                  }
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-1">
          <button
            onClick={() => setSubModal('drive')}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Google Drive"
          >
            <HardDrive size={20} />
          </button>
          <button
            onClick={() => setSubModal('video')}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="YouTube"
          >
            <Youtube size={20} />
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Upload"
          >
            <Upload size={20} />
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </button>
          <button
            onClick={() => setSubModal('link')}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Link"
          >
            <LinkIcon size={20} />
          </button>
        </div>

        {/* THE "NEAT" SUB-MODAL - No extra darkening background */}
        {subModal && (
          <div className="absolute inset-0 z-160 flex items-center justify-center p-6 animate-in fade-in duration-200">
            {/* Using a solid white panel with high shadow instead of a full black/white transparent screen */}
            <div className="bg-white w-full max-w-sm border border-gray-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-lg p-6 animate-in slide-in-from-bottom-2">
              <h4 className="text-[16px] font-medium text-gray-800 mb-6 capitalize">
                Add {subModal}
              </h4>
              <div className="relative group mb-8">
                <input
                  className="w-full text-sm py-2 bg-transparent border-b-2 border-gray-200 focus:border-[#08384F] outline-none transition-colors placeholder:text-gray-400"
                  placeholder={`Paste ${subModal} link`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAttachment()}
                />
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#08384F] transition-all group-focus-within:w-full"></div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSubModal(null);
                    setInputValue('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAttachment}
                  disabled={!inputValue.trim()}
                  className="px-4 py-2 text-sm font-medium text-[#08384F] hover:bg-blue-50 disabled:text-gray-300 rounded-md transition-colors"
                >
                  Add link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementModal;
