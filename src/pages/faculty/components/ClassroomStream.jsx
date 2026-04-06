import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  ClipboardList,
  Copy
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AnnouncementModal from '../modals/AnnouncementModal';
import Banner1 from '../../../assets/classroombanner1.svg';
import {
  getStream,
  addComment,
  deletePost,
  deleteComment
} from '../api/faculty.api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const toRomanYear = (semester) => {
  const year = Math.ceil((semester || 0) / 2);
  const roman = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
  return roman[year] || 'N/A';
};

const ClassroomStream = ({ classroom }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [stream, setStream] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [copyFeedback, setCopyFeedback] = useState(false); // for class code copy

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

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handlePostComment = async (postId) => {
    const message = commentText[postId];
    if (!message?.replace(/<(.|\n)*?>/g, '').trim()) return;

    try {
      const res = await addComment(classroom._id, postId, message);
      if (res.success) {
        fetchStream();
        setCommentText({ ...commentText, [postId]: '' });
      }
    } catch (err) {
      alert('Error adding comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        const res = await deleteComment(classroom._id, commentId);
        if (res.success) fetchStream();
      } catch (err) {
        alert('Failed to delete comment');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Delete this post?')) {
      try {
        const res = await deletePost(classroom._id, postId);
        if (res.success) fetchStream();
      } catch (err) {
        alert('Failed to delete post');
      }
    }
  };

  const copyClassCode = () => {
    if (classroom.joinCode) {
      navigator.clipboard.writeText(classroom.joinCode);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-400 font-medium">
        Loading stream...
      </div>
    );

  const subjectName = classroom?.subjectId?.name || 'Unknown Subject';
  const sectionName = classroom?.sectionId?.name || 'N/A';
  const deptCode = classroom?.department?.code || 'N/A';
  const yearRoman = toRomanYear(classroom?.semesterNumber);
  const joinCode = classroom?.joinCode || '—';

  return (
    <div className="w-full mx-auto space-y-6 pb-10 px-4 md:px-8">
      <style>{`
        .comment-quill .ql-editor { min-height: 40px; padding: 12px 16px !important; font-size: 0.875rem; color: #374151; }
        .comment-quill .ql-container { border: none !important; }
        .comment-quill .ql-toolbar { display: none; border: none !important; }
        .comment-quill:focus-within .ql-toolbar { display: block; border-bottom: 1px solid #f3f4f6 !important; }
        .prose a { color: #08384F; text-decoration: underline; }
      `}</style>

      {/* Banner */}
      <div className="relative h-48 rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <img
          src={Banner1}
          className="w-full h-full object-cover"
          alt="banner"
        />
        <div className="absolute inset-0 bg-black/20 p-8 flex flex-col justify-end text-white">
          <h1 className="text-3xl font-bold tracking-tight">{subjectName}</h1>
          <p className="text-lg font-medium opacity-90">
            {yearRoman} {deptCode} - {sectionName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="hidden md:block col-span-1 space-y-4">
          <button
            onClick={() => {
              setEditData(null);
              setIsModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#08384F] text-white py-3 px-4 rounded-lg font-bold shadow-sm hover:bg-[#0a4663] transition-all"
          >
            <Plus size={20} /> New Announcement
          </button>

          {/* Class code box */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Class code
              </span>
              <button
                onClick={copyClassCode}
                className="text-gray-400 hover:text-[#08384F] transition-colors"
                title="Copy class code"
              >
                <Copy size={14} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <code className="font-mono text-lg font-bold tracking-wide text-gray-800">
                {joinCode}
              </code>
              {copyFeedback && (
                <span className="text-xs text-green-600 animate-pulse">
                  Copied!
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this code with students to join the class.
            </p>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-span-1 md:col-span-3 space-y-4">
          {stream.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-gray-200">
              <Megaphone size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No posts yet</p>
            </div>
          ) : (
            stream.map((post) => {
              const author = post.createdBy;
              const isAnnouncement = post.type === 'announcement';
              const showAllComments =
                expandedComments[post._id] || post.commentsCount <= 1;

              return (
                <div
                  key={post._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 bg-[#08384F]`}
                        >
                          {isAnnouncement ? (
                            author?.firstName?.charAt(0)
                          ) : (
                            <ClipboardList size={20} />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                            {isAnnouncement
                              ? `${author?.firstName} ${author?.lastName}`
                              : `${author?.firstName} ${author?.lastName} posted a new assignment: ${post.title}`}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                            {new Date(post.createdAt).toLocaleDateString(
                              'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === post._id ? null : post._id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical size={18} className="text-gray-400" />
                        </button>

                        {activeMenu === post._id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1">
                            <button
                              onClick={() => {
                                setEditData(post);
                                setIsModalOpen(true);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit size={14} /> Edit
                            </button>

                            {isAnnouncement && (
                              <button
                                onClick={() => {
                                  handleDeletePost(post._id);
                                  setActiveMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isAnnouncement && (
                      <>
                        {post.instructions && (
                          <div
                            className="text-sm text-gray-700 mt-4 prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: post.instructions
                            }}
                          />
                        )}

                        {post.attachments?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {post.attachments.map((at, idx) => (
                              <a
                                key={idx}
                                href={
                                  at.fileType?.includes('file')
                                    ? `${API_BASE_URL}${at.fileUrl}`
                                    : at.fileUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all group"
                              >
                                {at.fileType === 'video' ? (
                                  <Youtube size={18} className="text-red-500" />
                                ) : (
                                  <FileText
                                    size={18}
                                    className="text-[#08384F]"
                                  />
                                )}
                                <span className="text-xs font-bold text-gray-700 truncate group-hover:text-[#08384F]">
                                  {at.fileName || 'Attachment'}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Comments Section */}
                  {isAnnouncement && (
                    <div className="border-t border-gray-100 bg-gray-50/20 overflow-hidden rounded-b-lg">
                      {post.commentsCount > 1 && (
                        <button
                          onClick={() => toggleComments(post._id)}
                          className="px-5 py-3 text-xs font-bold text-gray-600 flex items-center gap-2 hover:text-[#08384F] border-b border-gray-100 w-full text-left bg-white/40"
                        >
                          <MessageSquare size={14} />
                          {expandedComments[post._id]
                            ? 'Hide class comments'
                            : `${post.commentsCount} class comments`}
                        </button>
                      )}

                      <div className="divide-y divide-gray-100">
                        {(showAllComments
                          ? post.comments
                          : post.comments.slice(-1)
                        ).map((comment, idx) => (
                          <div
                            key={comment._id || idx}
                            className="px-5 py-4 flex gap-3 group bg-white/50"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold shrink-0 text-[#08384F]">
                              {comment.user?.firstName?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900">
                                  {comment.user?.firstName}{' '}
                                  {comment.user?.lastName}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div
                                className="text-xs text-gray-600 mt-1 prose-sm font-medium"
                                dangerouslySetInnerHTML={{
                                  __html: comment.message
                                }}
                              />
                            </div>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <div className="p-4 flex gap-3 items-start border-t border-gray-100 bg-white">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-[#08384F] flex items-center justify-center text-[10px] font-bold shrink-0 uppercase">
                          YOU
                        </div>
                        <div className="flex-1 relative comment-quill border border-gray-200 rounded-2xl overflow-hidden focus-within:border-[#08384F] transition-all bg-gray-50">
                          <ReactQuill
                            theme="snow"
                            placeholder="Add class comment..."
                            value={commentText[post._id] || ''}
                            onChange={(val) =>
                              setCommentText({
                                ...commentText,
                                [post._id]: val
                              })
                            }
                            modules={quillModules}
                          />
                          <button
                            onClick={() => handlePostComment(post._id)}
                            className="absolute right-3 bottom-2 p-1.5 bg-[#08384F] text-white rounded-full hover:bg-[#0a4663] disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-sm"
                            disabled={
                              !commentText[post._id]
                                ?.replace(/<(.|\n)*?>/g, '')
                                .trim()
                            }
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <AnnouncementModal
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
