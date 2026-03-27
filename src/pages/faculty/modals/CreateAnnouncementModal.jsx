import React, { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  X,
  Upload,
  Link as LinkIcon,
  Youtube,
  HardDrive,
  Loader2,
  Paperclip,
} from "lucide-react";
import { createPost, updatePost } from "../api/faculty.api";

const CreateAnnouncementModal = ({
  isOpen,
  onClose,
  classroomId,
  onPostCreated,
  initialData = null,
}) => {
  const [instructions, setInstructions] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subModal, setSubModal] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setInstructions(initialData.instructions || "");
      setAttachments(initialData.attachments || []);
    } else {
      setInstructions("");
      setAttachments([]);
      setFile(null);
    }
  }, [initialData, isOpen]);

  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024)
      setFile(selectedFile);
    else alert("File size exceeds 5MB limit.");
  };

  const handleAddAttachment = () => {
    if (!inputValue.trim()) return;
    let type = subModal;
    if (
      type === "video" &&
      !inputValue.includes("youtube.com") &&
      !inputValue.includes("youtu.be")
    )
      type = "link";
    setAttachments([
      ...attachments,
      { fileName: type, fileUrl: inputValue, fileType: type },
    ]);
    setInputValue("");
    setSubModal(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "announcement");
      formData.append("instructions", instructions);
      if (file) formData.append("file", file);
      formData.append("attachments", JSON.stringify(attachments));

      let res;
      if (initialData) {
        res = await updatePost(
          classroomId,
          "announcement",
          initialData._id,
          formData,
        );
      } else {
        res = await createPost(classroomId, formData);
      }

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error processing request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        <style>{`
          .quill { border: none !important; display: flex; flex-direction: column; }
          .ql-toolbar { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #f9fafb; order: 2; }
          .ql-container { border: none !important; min-height: 180px; font-size: 1rem; order: 1; }
          .ql-editor { min-height: 180px; color: #08384F; padding: 1.5rem !important; }
        `}</style>

        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#08384F]">
          <h2 className="text-white font-semibold text-lg">
            {initialData ? "Update Announcement" : "Create Announcement"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="text-white" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#08384F] transition-all overflow-hidden mb-4">
            <ReactQuill
              theme="snow"
              value={instructions}
              onChange={setInstructions}
              modules={modules}
              placeholder="Share news..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {file && (
              <div className="flex items-center gap-2 bg-blue-50 text-[#08384F] px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-100">
                <Paperclip size={14} className="text-blue-500" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => setFile(null)}
                />
              </div>
            )}
            {attachments.map((at, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 border border-gray-200"
              >
                {at.fileType === "video" ? (
                  <Youtube size={14} className="text-red-500" />
                ) : (
                  <LinkIcon size={14} className="text-blue-500" />
                )}
                <span className="truncate max-w-[150px]">{at.fileUrl}</span>
                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() =>
                    setAttachments(attachments.filter((_, idx) => idx !== i))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubModal("drive")}
              className="p-2.5 bg-white border border-gray-200 rounded-full text-[#08384F]"
            >
              <HardDrive size={18} />
            </button>
            <button
              onClick={() => setSubModal("video")}
              className="p-2.5 bg-white border border-gray-200 rounded-full text-[#08384F]"
            >
              <Youtube size={18} />
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-2.5 bg-white border border-gray-200 rounded-full text-[#08384F]"
            >
              <Upload size={18} />
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </button>
            <button
              onClick={() => setSubModal("link")}
              className="p-2.5 bg-white border border-gray-200 rounded-full text-[#08384F]"
            >
              <LinkIcon size={18} />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              disabled={
                loading || !instructions.replace(/<(.|\n)*?>/g, "").trim()
              }
              onClick={handleSubmit}
              className="bg-[#08384F] text-white px-8 py-2 rounded-xl font-semibold flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}{" "}
              {initialData ? "Update" : "Post"}
            </button>
          </div>
        </div>

        {subModal && (
          <div className="absolute inset-0 z-[110] bg-[#08384F]/5 backdrop-blur-sm p-8 flex flex-col justify-center items-center">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
              <h4 className="text-xl font-bold text-[#08384F] mb-4">
                Add {subModal}
              </h4>
              <input
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6 outline-none"
                placeholder="Enter URL"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAddAttachment()}
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setSubModal(null)} className="px-5 py-2">
                  Cancel
                </button>
                <button
                  onClick={handleAddAttachment}
                  className="bg-[#08384F] text-white px-6 py-2 rounded-lg"
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

export default CreateAnnouncementModal;
