import React, { useState, useRef, useEffect } from "react";
import {
  X,
  HardDrive,
  Youtube,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  FileText,
  ClipboardList,
  BookOpen,
  Loader2,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createPost, updatePost, getTopics } from "../api/faculty.api";

const CreateClassworkModal = ({
  isOpen,
  onClose,
  type,
  classroomId,
  onPostCreated,
  initialData = null,
}) => {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [points, setPoints] = useState("100");
  const [dueDate, setDueDate] = useState("");
  const [submissionType, setSubmissionType] = useState("file");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [topics, setTopics] = useState([]);
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTopics, setFetchingTopics] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title || "");
      setInstructions(initialData.instructions || "");
      setPoints(
        initialData.isUngraded
          ? "Ungraded"
          : initialData.points?.toString() || "100",
      );
      setSubmissionType(initialData.submissionType || "file");
      setSelectedTopicId(initialData.topicId || "");
      setAttachments(initialData.attachments || []);
      if (initialData.dueDate) {
        const date = new Date(initialData.dueDate);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setDueDate(date.toISOString().slice(0, 16));
      }
    } else {
      setTitle("");
      setInstructions("");
      setPoints("100");
      setDueDate("");
      setSubmissionType("file");
      setFile(null);
      setAttachments([]);
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    const fetchDropdownTopics = async () => {
      if (!isOpen || !classroomId) return;
      try {
        setFetchingTopics(true);
        const res = await getTopics(classroomId);
        if (res.success) {
          const dbTopics = res.data.topics || [];
          setTopics(dbTopics);
          if (!initialData) {
            if (dbTopics.length > 0) setSelectedTopicId(dbTopics[0]._id);
            else setSelectedTopicId("");
          }
        }
      } catch (err) {
        console.error("Failed to load topics", err);
      } finally {
        setFetchingTopics(false);
      }
    };
    fetchDropdownTopics();
  }, [isOpen, classroomId, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
      setFile(selectedFile);
    } else if (selectedFile) {
      alert("File size exceeds 5MB limit.");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);

    try {
      const isUngraded = points === "Ungraded";
      const formData = new FormData();

      formData.append("type", type);
      formData.append("title", title.trim());
      formData.append("instructions", instructions);
      formData.append("points", isUngraded ? "0" : points);
      formData.append("isUngraded", isUngraded.toString());

      if (dueDate) {
        formData.append("dueDate", new Date(dueDate).toISOString());
      }

      if (topics.length > 0 && selectedTopicId) {
        formData.append("topicId", selectedTopicId);
      }

      formData.append("attachments", JSON.stringify(attachments));
      formData.append(
        "submissionType",
        type === "question" ? "text" : submissionType,
      );

      if (file) {
        formData.append("file", file);
      }

      let res;
      if (initialData) {
        res = await updatePost(classroomId, type, initialData._id, formData);
      } else {
        res = await createPost(classroomId, formData);
      }

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case "assignment":
        return <ClipboardList size={22} className="text-[#08384F]" />;
      case "quiz":
        return <FileText size={22} className="text-[#08384F]" />;
      case "question":
        return <HelpCircle size={22} className="text-[#08384F]" />;
      case "material":
        return <BookOpen size={22} className="text-[#08384F]" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <style>{`
          .quill { border: none !important; display: flex; flex-direction: column; }
          .ql-toolbar { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f9fafb; order: 2; }
          .ql-container { border: none !important; min-height: 150px; font-size: 0.875rem; order: 1; }
          .ql-editor { min-height: 150px; color: #08384F; padding: 1.25rem !important; }
        `}</style>

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold text-[#08384F] capitalize">
              {initialData ? `Edit ${type}` : type}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <input
                className="w-full text-lg p-4 bg-gray-50 border-b-2 border-gray-200 focus:border-[#08384F] focus:bg-gray-100 outline-none transition-all placeholder:text-gray-400 rounded-t-lg font-semibold"
                placeholder={type === "question" ? "Question" : "Title"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#08384F] transition-all group-focus-within:w-full"></span>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 focus-within:border-[#08384F] transition-all">
              <ReactQuill
                theme="snow"
                placeholder="Instructions (optional)"
                value={instructions}
                onChange={setInstructions}
                className="bg-gray-50 h-36"
              />
            </div>

            <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-5 tracking-wider">
                Attach
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#08384F] text-gray-600 hover:text-[#08384F] transition-all active:scale-95 shadow-sm"
                >
                  <Upload size={18} />
                  <span className="text-xs font-semibold">
                    {file ? file.name : "Upload"}
                  </span>
                </button>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#08384F] text-gray-600 hover:text-[#08384F] shadow-sm">
                  <Youtube size={18} />
                  <span className="text-xs font-semibold">YouTube</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-[#08384F] text-gray-600 hover:text-[#08384F] shadow-sm">
                  <LinkIcon size={18} />
                  <span className="text-xs font-semibold">Link</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            {type !== "material" && (
              <>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Points
                  </label>
                  <select
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="mt-2 w-full p-3 bg-white border border-gray-300 rounded text-sm outline-[#08384F] font-medium text-gray-700"
                  >
                    <option value="100">100 points</option>
                    <option value="50">50 points</option>
                    <option value="Ungraded">Ungraded</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Submission Type
                  </label>
                  <select
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="mt-2 w-full p-3 bg-white border border-gray-300 rounded text-sm outline-[#08384F] font-medium text-gray-700"
                  >
                    <option value="file">File Upload</option>
                    <option value="link">Link Submission</option>
                    <option value="text">Text Response</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-2 w-full p-3 bg-white border border-gray-300 rounded text-sm outline-[#08384F] font-medium text-gray-700"
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Topic
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={fetchingTopics}
                className="mt-2 w-full p-3 bg-white border border-gray-300 rounded text-sm outline-[#08384F] font-medium text-gray-700 disabled:opacity-50"
              >
                {topics.length === 0 ? (
                  <option value="">No topic</option>
                ) : (
                  topics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3 mt-auto">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-600 font-bold text-xs uppercase tracking-widest hover:text-[#08384F] transition-colors rounded-lg"
          >
            Cancel
          </button>
          <button
            disabled={loading || !title.trim()}
            onClick={handleSubmit}
            className="bg-[#08384F] text-white px-8 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-900/10 disabled:opacity-50 hover:bg-[#0a4663] transition-all active:scale-95 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {initialData
              ? "Update"
              : type === "material"
                ? "Post"
                : type === "question"
                  ? "Ask"
                  : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassworkModal;
