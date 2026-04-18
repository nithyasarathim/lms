import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Youtube,
  Paperclip,
  Trash2,
  Loader2,
  Calendar
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { createPost, updatePost } from '../api/faculty.api';

const AssignmentModal = ({
  isOpen,
  onClose,
  classroomId,
  topics,
  onPostCreated,
  initialData = null
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [points, setPoints] = useState('100');
  const [dueDate, setDueDate] = useState('');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [submissionType, setSubmissionType] = useState('any');
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [subModal, setSubModal] = useState(null); // 'link' or 'youtube'
  const [subInputValue, setSubInputValue] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      const data = initialData.assignment || {};
      setTitle(initialData.title || '');
      setInstructions(initialData.instructions || '');
      setSelectedTopicId(initialData.topicId?._id || '');
      setAttachments(initialData.attachments || []);
      setPoints(
        data.isUngraded ? 'Ungraded' : data.points?.toString() || '100'
      );
      setSubmissionType(data.submissionType || 'any');
      setAllowLateSubmission(data.allowLateSubmission ?? true);

      if (data.dueDate) {
        const date = new Date(data.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        setHasDueDate(true);
      } else {
        setDueDate('');
        setHasDueDate(false);
      }
    } else if (isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setInstructions('');
    setPoints('100');
    setDueDate('');
    setHasDueDate(false);
    setSelectedTopicId('');
    setAttachments([]);
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const newAttachment = {
        fileType: 'file',
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile)
      };
      setAttachments([...attachments, newAttachment]);
    }
  };

  const addAttachment = () => {
    if (!subInputValue.trim()) return;
    const newAttachment = {
      fileType: subModal,
      fileUrl: subInputValue,
      fileName: subInputValue
    };
    setAttachments([...attachments, newAttachment]);
    setSubInputValue('');
    setSubModal(null);
  };

  const removeAttachment = (index) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    if (attachments[index].fileType === 'file') setFile(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isUngraded = points === 'Ungraded';
      const formData = new FormData();

      formData.append('type', 'assignment');
      formData.append('title', title.trim());
      formData.append('instructions', instructions);
      formData.append('topicId', selectedTopicId);
      formData.append('points', isUngraded ? '0' : points);
      formData.append('isUngraded', isUngraded.toString());
      formData.append('submissionType', submissionType);
      formData.append('allowLateSubmission', allowLateSubmission.toString());

      // Handle due date properly - FIXED: Same as Quiz modal
      if (hasDueDate && dueDate) {
        const dateObj = new Date(dueDate);
        if (!isNaN(dateObj.getTime())) {
          formData.append('dueDate', dateObj.toISOString());
        } else {
          formData.append('dueDate', '');
        }
      } else {
        formData.append('dueDate', '');
      }

      if (file) formData.append('file', file);

      const existingAttachments = attachments.filter((a) => a.fileType !== 'file');
      formData.append('attachments', JSON.stringify(existingAttachments));

      const res = initialData
        ? await updatePost(classroomId, 'assignment', initialData._id, formData)
        : await createPost(classroomId, formData);

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Error saving assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden relative flex flex-col h-[90vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {initialData ? 'Edit Assignment' : 'New Assignment'}
            </h2>
          </div>
          <button
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
            className="bg-[#08384F] text-white px-10 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a4663] transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Update' : 'Assign'}
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
            <input
              className="w-full text-2xl py-2 bg-transparent border-b-2 border-gray-50 focus:border-[#08384F] outline-none transition-all placeholder:text-gray-300 font-bold"
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Instructions
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/30">
                <style>{`.ql-container { min-height: 150px; font-size: 15px; border:none !important; } .ql-toolbar { border:none !important; border-bottom: 1px solid #eee !important; background: #fff; }`}</style>
                <ReactQuill
                  theme="snow"
                  value={instructions}
                  onChange={setInstructions}
                  placeholder="Optional instructions..."
                />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Attachments
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 transition-all"
                >
                  <Upload size={14} /> Upload
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => setSubModal('link')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 transition-all"
                >
                  <LinkIcon size={14} /> Link
                </button>
                <button
                  onClick={() => setSubModal('youtube')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 transition-all"
                >
                  <Youtube size={14} /> YouTube
                </button>
              </div>

              {/* Attachments Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-white rounded-lg border border-gray-100 text-[#08384F]">
                        {att.fileType === 'link' ? (
                          <LinkIcon size={16} />
                        ) : att.fileType === 'youtube' ? (
                          <Youtube size={16} />
                        ) : (
                          <Paperclip size={16} />
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 truncate">
                        {att.fileName || att.fileUrl}
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[320px] bg-gray-50 border-l border-gray-100 p-8 space-y-8 overflow-y-auto shrink-0">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Points
              </label>
              <select
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
              >
                <option value="100">100 points</option>
                <option value="50">50 points</option>
                <option value="Ungraded">Ungraded</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Due Date
              </label>
              <div
                onClick={() => setHasDueDate(!hasDueDate)}
                className="cursor-pointer text-sm text-gray-700 p-3 bg-white border border-gray-200 rounded-xl flex justify-between items-center hover:border-[#08384F] transition-all"
              >
                {hasDueDate ? (
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => {
                      e.stopPropagation();
                      setDueDate(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none w-full text-xs font-bold"
                  />
                ) : (
                  'No due date'
                )}
                <Calendar size={16} className="text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Topic
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer"
              >
                {topics?.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-gray-500 uppercase">
                  Late Submissions
                </label>
                <button
                  onClick={() => setAllowLateSubmission(!allowLateSubmission)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${allowLateSubmission ? 'bg-[#08384F]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${allowLateSubmission ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-modal for Links / YouTube */}
        {subModal && (
          <div className="absolute inset-0 z-110 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
              <h3 className="text-sm font-bold text-gray-800 uppercase mb-4">
                Add {subModal === 'link' ? 'Link' : 'YouTube Video'}
              </h3>
              <input
                autoFocus
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#08384F] text-sm mb-4"
                placeholder={
                  subModal === 'link'
                    ? 'https://example.com'
                    : 'Paste YouTube URL'
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
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addAttachment}
                  className="px-6 py-2 bg-[#08384F] text-white text-sm font-bold rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentModal;
