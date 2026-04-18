import React, { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ClipboardList,
  Copy,
  FileQuestion,
  FileText,
  Megaphone,
  MoreVertical,
  Plus,
  Send,
  Trash2
} from 'lucide-react';

import Banner1 from '../../../assets/classroombanner1.svg';
import AnnouncementModal from '../../faculty/modals/AnnouncementModal';
import {
  addComment,
  deleteComment,
  deletePost,
  getStream
} from '../../faculty/api/faculty.api';

const ClassroomStream = ({ classroom, viewerRole = 'FACULTY' }) => {
  const navigate = useNavigate();
  const canManage = viewerRole === 'FACULTY';

  const [stream, setStream] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [commentText, setCommentText] = useState({});

  const fetchStream = async () => {
    try {
      setLoading(true);
      const response = await getStream(classroom._id);
      if (response?.success) {
        setStream(response.data?.stream || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroom?._id) {
      fetchStream();
    }
  }, [classroom?._id]);

  const handleNavigateToPost = (post) => {
    navigate(
      `/${viewerRole.toLowerCase()}/dashboard/classroom/${classroom._id}/post/${post._id}`,
      { state: { fromView: 'stream' } }
    );
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm('Delete this post?')) return;

    try {
      await deletePost(classroom._id, post.type, post._id);
      fetchStream();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitComment = async (postId) => {
    const message = commentText[postId];
    if (!message?.replace(/<(.|\n)*?>/g, '').trim()) return;

    try {
      await addComment(classroom._id, postId, message);
      setCommentText((current) => ({ ...current, [postId]: '' }));
      fetchStream();
    } catch (error) {
      console.error(error);
    }
  };

  const typeLabel = (post) => {
    if (post.type === 'assignment') return 'Assignment';
    if (post.type === 'quiz') return 'Quiz';
    if (post.type === 'material') return 'Material';
    return 'Announcement';
  };

  const typeIcon = (post) => {
    if (post.type === 'assignment') return <ClipboardList size={18} />;
    if (post.type === 'quiz') return <FileQuestion size={18} />;
    if (post.type === 'material') return <BookOpen size={18} />;
    return <Megaphone size={18} />;
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading stream...</div>;
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="relative h-48 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <img src={Banner1} className="h-full w-full object-cover" alt="banner" />
        <div className="absolute inset-0 flex flex-col justify-end bg-black/20 p-8 text-white">
          <h1 className="text-3xl font-bold tracking-tight">
            {classroom?.subjectId?.name}
          </h1>
          <p className="text-lg font-medium opacity-90">
            {classroom?.department?.code} - {classroom?.sectionId?.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="hidden space-y-4 md:block">
          {canManage ? (
            <button
              onClick={() => {
                setEditData(null);
                setIsModalOpen(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#08384F] px-4 py-3 font-bold text-white shadow-sm transition-all hover:bg-[#0a4663]"
            >
              <Plus size={20} />
              New Announcement
            </button>
          ) : null}

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Class code
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(classroom.joinCode || '')}
                className="text-gray-400 transition-colors hover:text-[#08384F]"
              >
                <Copy size={14} />
              </button>
            </div>
            <code className="font-mono text-lg font-bold tracking-wide text-gray-800">
              {classroom.joinCode || '--'}
            </code>
          </div>
        </div>

        <div className="space-y-4 md:col-span-3">
          {!stream.length ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <Megaphone size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">No posts yet</p>
            </div>
          ) : (
            stream.map((post) => {
              const isAnnouncement = post.type === 'announcement';
              const dueDate = post.assignment?.dueDate || post.quiz?.dueDate;

              return (
                <div
                  key={post._id}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  <div
                    className={`p-5 ${isAnnouncement ? '' : 'cursor-pointer'}`}
                    onClick={() =>
                      isAnnouncement ? null : handleNavigateToPost(post)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08384F] text-white">
                          {isAnnouncement
                            ? post.createdBy?.firstName?.charAt(0)
                            : typeIcon(post)}
                        </div>
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                              {typeLabel(post)}
                            </span>
                            {!isAnnouncement && post.submissionSummary ? (
                              <span className="text-xs text-slate-500">
                                {canManage
                                  ? `${post.submissionSummary.submittedCount} submitted - ${post.submissionSummary.pendingCount} pending`
                                  : post.submissionSummary.myStatus}
                              </span>
                            ) : null}
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {isAnnouncement
                              ? `${post.createdBy?.firstName} ${post.createdBy?.lastName}`
                              : post.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                            {dueDate
                              ? ` - Due ${new Date(dueDate).toLocaleDateString()}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      {canManage ? (
                        <div className="relative">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setActiveMenu(activeMenu === post._id ? null : post._id);
                            }}
                            className="rounded-full p-2 hover:bg-gray-100"
                          >
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>

                          {activeMenu === post._id ? (
                            <div className="absolute right-0 z-50 mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-xl">
                              {isAnnouncement ? (
                                <button
                                  onClick={() => {
                                    setEditData(post);
                                    setIsModalOpen(true);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  Edit
                                </button>
                              ) : null}
                              <button
                                onClick={() => {
                                  handleDeletePost(post);
                                  setActiveMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    {post.instructions ? (
                      <div
                        className="prose mt-4 max-w-none text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ __html: post.instructions }}
                      />
                    ) : null}

                    {!isAnnouncement ? (
                      <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#08384F]">
                        <FileText size={16} />
                        Open details
                      </div>
                    ) : null}
                  </div>

                  {isAnnouncement ? (
                    <div className="rounded-b-lg border-t border-gray-100 bg-white">
                      <div className="space-y-3 px-5 py-4">
                        {(post.comments || []).map((comment) => (
                          <div
                            key={comment._id}
                            className="flex items-start justify-between gap-3"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800">
                                {comment.user?.firstName} {comment.user?.lastName}
                              </p>
                              <div
                                className="prose prose-sm mt-1 text-xs text-slate-600"
                                dangerouslySetInnerHTML={{ __html: comment.message }}
                              />
                            </div>
                            {canManage ? (
                              <button
                                onClick={() =>
                                  deleteComment(classroom._id, comment._id).then(fetchStream)
                                }
                                className="text-gray-300 transition hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 border-t border-gray-100 bg-white p-4">
                        <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                          <ReactQuill
                            theme="snow"
                            placeholder="Add class comment..."
                            value={commentText[post._id] || ''}
                            onChange={(value) =>
                              setCommentText((current) => ({
                                ...current,
                                [post._id]: value
                              }))
                            }
                            modules={{
                              toolbar: [
                                ['bold', 'italic', 'underline'],
                                [{ list: 'ordered' }, { list: 'bullet' }]
                              ]
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleSubmitComment(post._id)}
                          className="self-end rounded-full bg-[#08384F] p-2 text-white transition hover:bg-[#0a4663]"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  ) : null}
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
