import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Calendar,
  MessageSquare,
  HelpCircle,
  Settings2,
  Users
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { createPost, updatePost } from '../api/faculty.api';

const QuestionModal = ({
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
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [loading, setLoading] = useState(false);

  // Question Specific settings
  const [canReply, setCanReply] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      const q = initialData.question || {};
      setTitle(initialData.title || '');
      setInstructions(initialData.instructions || '');
      setSelectedTopicId(initialData.topicId || '');
      setPoints(q.isUngraded ? 'Ungraded' : q.points?.toString() || '100');
      setCanReply(q.studentsCanReply ?? true);
      setCanEdit(q.studentsCanEdit ?? false);

      if (q.dueDate) {
        const date = new Date(q.dueDate);
        setDueDate(date.toISOString().slice(0, 16));
        setHasDueDate(true);
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
    setCanReply(true);
    setCanEdit(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const isUngraded = points === 'Ungraded';
      const formData = new FormData();
      formData.append('type', 'question');
      formData.append('title', title.trim());
      formData.append('instructions', instructions);
      formData.append('topicId', selectedTopicId || 'No Topic');
      formData.append('points', isUngraded ? '0' : points);
      formData.append('isUngraded', isUngraded.toString());
      formData.append('studentsCanReply', canReply.toString());
      formData.append('studentsCanEdit', canEdit.toString());

      // Fix: Handle Due Date updates
      if (hasDueDate && dueDate) {
        formData.append('dueDate', new Date(dueDate).toISOString());
      } else {
        formData.append('dueDate', '');
      }

      const res = initialData
        ? await updatePost(classroomId, 'question', initialData._id, formData)
        : await createPost(classroomId, formData);

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Error saving question');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
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
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <HelpCircle size={20} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {initialData ? 'Edit Question' : 'Ask a Question'}
              </h2>
            </div>
          </div>
          <button
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
            className="bg-[#08384F] text-white px-10 py-2.5 rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-30 flex items-center gap-2 transition-all shadow-lg shadow-[#08384F]/10"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Update' : 'Ask'}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden lg:flex-row flex-col">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                The Question
              </label>
              <input
                className="w-full text-2xl font-bold border-b-2 border-transparent focus:border-[#08384F] outline-none pb-2 transition-all placeholder:text-gray-200"
                placeholder="What is your question?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Additional Instructions
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/30">
                <style>{`.ql-container { min-height: 200px; font-size: 16px; border:none !important; } .ql-toolbar { border:none !important; border-bottom: 1px solid #eee !important; background: #fff; }`}</style>
                <ReactQuill
                  theme="snow"
                  value={instructions}
                  onChange={setInstructions}
                  placeholder="Context or guidelines for students..."
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg h-fit">
                <MessageSquare size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900">
                  Short Answer Format
                </h4>
                <p className="text-xs text-blue-700/70 mt-1">
                  Students will see a text field to submit their response. You
                  can then view and grade all answers in one place.
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[320px] bg-gray-50 border-l border-gray-100 p-8 space-y-8 overflow-y-auto shrink-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                  Points
                </label>
                <select
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none shadow-sm cursor-pointer"
                >
                  <option value="100">100 points</option>
                  <option value="50">50 points</option>
                  <option value="20">20 points</option>
                  <option value="Ungraded">Ungraded</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                  Due Date
                </label>
                <div
                  onClick={() => setHasDueDate(!hasDueDate)}
                  className="cursor-pointer text-sm text-gray-700 p-3 bg-white border border-gray-200 rounded-xl flex justify-between items-center hover:border-[#08384F] transition-all shadow-sm"
                >
                  {hasDueDate ? (
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
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
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none shadow-sm cursor-pointer"
                >
                  {topics?.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-200 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 size={14} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Student Permissions
                </span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">
                    Peer Replies
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Can reply to others
                  </span>
                </div>
                <button
                  onClick={() => setCanReply(!canReply)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${canReply ? 'bg-[#08384F]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${canReply ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700">
                    Allow Editing
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Can modify answer
                  </span>
                </div>
                <button
                  onClick={() => setCanEdit(!canEdit)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${canEdit ? 'bg-[#08384F]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${canEdit ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-400 p-2">
                <Users size={14} />
                <span className="text-xs font-medium">
                  Sent to all students
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
