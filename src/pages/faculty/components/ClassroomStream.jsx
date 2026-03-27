import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  Send,
  Megaphone,
  FileText,
  Youtube,
  Link as LinkIcon,
  Trash2,
  Edit,
} from "lucide-react";
import CreateAnnouncementModal from "../modals/CreateAnnouncementModal";
import Banner1 from "../../../assets/classroombanner1.svg";
import {
  getStream,
  addComment,
  deletePost,
  deleteComment,
} from "../api/faculty.api";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClassroomStream = ({ classroom }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [stream, setStream] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [commentText, setCommentText] = useState({});

  const fetchStream = async () => {
    try {
      setLoading(true);
      const res = await getStream(classroom._id);
      if (res.success) setStream(res.data.stream);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroom?._id) fetchStream();
  }, [classroom?._id]);

  const handleDeletePost = async (postId) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        const res = await deletePost(classroom._id, "announcement", postId);
        if (res.success) fetchStream();
      } catch (err) {
        alert("Failed to delete post");
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Delete this comment?")) {
      try {
        const res = await deleteComment(classroom._id, commentId);
        if (res.success) fetchStream();
      } catch (err) {
        alert("Failed to delete comment");
      }
    }
  };

  const handlePostComment = async (postId) => {
    const message = commentText[postId];
    if (!message?.trim()) return;
    try {
      const res = await addComment(classroom._id, postId, message);
      if (res.success) {
        fetchStream();
        setCommentText({ ...commentText, [postId]: "" });
      }
    } catch (err) {
      alert("Error adding comment");
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-400">Loading stream...</div>
    );

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
        <img
          src={Banner1}
          className="w-full h-full object-cover"
          alt="banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08384F]/90 to-transparent p-8 flex flex-col justify-end text-white">
          <h1 className="text-3xl font-bold">
            {classroom?.subjectComponentId?.subjectId?.name}
          </h1>
          <p className="opacity-80">
            {classroom?.department?.code} - {classroom?.sectionId?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <button
            onClick={() => {
              setEditData(null);
              setIsModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#08384F] text-white p-3 rounded-lg font-bold shadow hover:bg-[#0a4663] transition-all"
          >
            <Plus size={20} /> New Announcement
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {stream.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <Megaphone size={24} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Stream is empty</p>
            </div>
          ) : (
            stream.map((post) => {
              const attachments = post.attachments
                ? typeof post.attachments === "string"
                  ? JSON.parse(post.attachments)
                  : post.attachments
                : [];

              // Map createdBy to a local constant for easier access
              const author = post.createdBy;

              return (
                <div
                  key={post._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                >
                  {post.type === "announcement" && (
                    <>
                      <div className="p-4 flex justify-between relative">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#08384F] text-white flex items-center justify-center font-bold uppercase shrink-0">
                            {author?.firstName?.charAt(0)}
                            {author?.lastName?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">
                              {author?.firstName} {author?.lastName}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {new Date(post.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <MoreVertical
                            size={18}
                            className="text-gray-400 cursor-pointer p-1 hover:bg-gray-100 rounded-full"
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === post._id ? null : post._id,
                              )
                            }
                          />
                          {activeMenu === post._id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden">
                              <button
                                onClick={() => {
                                  setEditData(post);
                                  setIsModalOpen(true);
                                  setActiveMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-[#08384F] hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post._id)}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="px-4 pb-4 prose prose-sm max-w-none text-[#08384F]"
                        dangerouslySetInnerHTML={{ __html: post.instructions }}
                      />

                      {attachments.length > 0 && (
                        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachments.map((at, idx) => {
                            const isFile =
                              at.fileType === "application/pdf" ||
                              at.fileType?.includes("file");
                            const targetUrl = isFile
                              ? `${API_BASE_URL}${at.fileUrl}`
                              : at.fileUrl;

                            return (
                              <a
                                key={idx}
                                href={targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                              >
                                {at.fileType === "video" ? (
                                  <Youtube
                                    size={16}
                                    className="text-red-500 shrink-0"
                                  />
                                ) : isFile ? (
                                  <FileText
                                    size={16}
                                    className="text-orange-500 shrink-0"
                                  />
                                ) : (
                                  <LinkIcon
                                    size={16}
                                    className="text-blue-500 shrink-0"
                                  />
                                )}
                                <div className="flex flex-col min-w-0">
                                  <span className="font-medium text-gray-700 truncate">
                                    {at.fileName || "Attachment"}
                                  </span>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* Comments Section */}
                      <div className="bg-gray-50/50 border-t border-gray-100">
                        {post.comments?.map((comment, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-3 flex gap-3 items-start group border-b border-gray-100 last:border-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {comment.user?.firstName?.charAt(0)}
                            </div>
                            <div className="flex-1 text-[12px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">
                                  {comment.user?.firstName}{" "}
                                  {comment.user?.lastName}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(
                                    comment.createdAt,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  {new Date(
                                    comment.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-600 mt-0.5">
                                {comment.message}
                              </p>
                            </div>
                            <Trash2
                              size={14}
                              className="text-red-300 opacity-0 group-hover:opacity-100 cursor-pointer hover:text-red-600 transition-all"
                              onClick={() => handleDeleteComment(comment._id)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="p-4 flex gap-3 items-center border-t border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-[#08384F] shrink-0">
                          YOU
                        </div>
                        <div className="flex-1 relative">
                          <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs outline-none focus:border-[#08384F] transition-all"
                            placeholder="Add class comment..."
                            value={commentText[post._id] || ""}
                            onChange={(e) =>
                              setCommentText({
                                ...commentText,
                                [post._id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && handlePostComment(post._id)
                            }
                          />
                          <Send
                            size={14}
                            className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-[#08384F]"
                            onClick={() => handlePostComment(post._id)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditData(null);
        }}
        classroomId={classroom?._id}
        onPostCreated={fetchStream}
        initialData={editData}
      />
    </div>
  );
};

export default ClassroomStream;
