import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Youtube,
  Paperclip,
  Trash2,
  Loader2,
  FileText,
  Plus
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { createPost, updatePost } from '../api/faculty.api';

const MaterialModal = ({
  isOpen,
  onClose,
  classroomId,
  topics,
  onPostCreated,
  initialData = null
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [subModal, setSubModal] = useState(null); // 'link' or 'youtube'
  const [subInputValue, setSubInputValue] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || '');
      setInstructions(initialData.instructions || '');
      setSelectedTopicId(initialData.topicId || '');
      setAttachments(initialData.attachments || []);
    } else if (isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setInstructions('');
    setSelectedTopicId('');
    setAttachments([]);
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const newAttachment = {
        type: 'file',
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile)
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const addAttachment = () => {
    if (!subInputValue.trim()) return;
    const newAttachment = {
      type: subModal,
      url: subInputValue,
      name: subInputValue
    };
    setAttachments([...attachments, newAttachment]);
    setSubInputValue('');
    setSubModal(null);
  };

  const removeAttachment = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    if (attachments[index].type === 'file') setFile(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'material');
      formData.append('title', title.trim());
      formData.append('instructions', instructions);
      formData.append('topicId', selectedTopicId || 'No Topic');

      if (file) formData.append('file', file);

      const existingAttachments = attachments.filter((a) => a.type !== 'file');
      formData.append('attachments', JSON.stringify(existingAttachments));

      const res = initialData
        ? await updatePost(classroomId, 'material', initialData._id, formData)
        : await createPost(classroomId, formData);

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Error saving material');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <FileText size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {initialData ? 'Edit Material' : 'Create Material'}
              </h2>
            </div>
          </div>
          <button
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
            className="bg-[#08384F] text-white px-10 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-30 flex items-center gap-2 transition-all"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Update Material' : 'Post Material'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Material Title
              </label>
              <input
                className="w-full text-3xl font-bold border-b-2 border-transparent focus:border-[#08384F] outline-none pb-2 transition-all placeholder:text-gray-200"
                placeholder="Title (e.g. Week 1 Lecture Slides)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Description
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/30">
                <style>{`.ql-container { min-height: 180px; font-size: 16px; border:none !important; } .ql-toolbar { border:none !important; border-bottom: 1px solid #eee !important; background: #fff; }`}</style>
                <ReactQuill
                  theme="snow"
                  value={instructions}
                  onChange={setInstructions}
                  placeholder="Tell your students about this resource..."
                />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Resources & Attachments
                </label>
                <span className="text-[10px] font-bold text-gray-300">
                  {attachments.length} attached
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all"
                >
                  <Upload size={14} className="text-blue-500" /> Upload File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  onClick={() => setSubModal('link')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all"
                >
                  <LinkIcon size={14} className="text-green-500" /> Add Link
                </button>

                <button
                  onClick={() => setSubModal('youtube')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 transition-all"
                >
                  <Youtube size={14} className="text-red-500" /> YouTube Video
                </button>
              </div>

              {/* Grid of added items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-3 bg-gray-50 rounded-xl text-[#08384F]">
                        {att.type === 'link' ? (
                          <LinkIcon size={18} />
                        ) : att.type === 'youtube' ? (
                          <Youtube size={18} />
                        ) : (
                          <Paperclip size={18} />
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-gray-700 truncate">
                          {att.name || att.url}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                          {att.type}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[320px] bg-gray-50 border-l border-gray-100 p-8 space-y-8 overflow-y-auto shrink-0">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Organize by Topic
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none cursor-pointer focus:ring-2 ring-[#08384F]/5 shadow-sm"
              >
                {topics?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 leading-relaxed px-1">
                Assigning a topic helps students find materials more easily in
                their Classwork tab.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                  Visibility
                </h4>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  All Students
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-modal for URL inputs */}
        {subModal && (
          <div className="absolute inset-0 z-110 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-lg ${subModal === 'link' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                >
                  {subModal === 'link' ? (
                    <LinkIcon size={18} />
                  ) : (
                    <Youtube size={18} />
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">
                  Add {subModal === 'link' ? 'Resource Link' : 'YouTube Video'}
                </h3>
              </div>
              <input
                autoFocus
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#08384F] text-sm mb-6"
                placeholder={
                  subModal === 'link'
                    ? 'https://example.com/resource'
                    : 'https://youtube.com/watch?v=...'
                }
                value={subInputValue}
                onChange={(e) => setSubInputValue(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSubModal(null);
                    setSubInputValue('');
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={addAttachment}
                  disabled={!subInputValue.trim()}
                  className="px-8 py-2 bg-[#08384F] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#08384F]/20 disabled:opacity-50"
                >
                  Add Attachment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialModal;
