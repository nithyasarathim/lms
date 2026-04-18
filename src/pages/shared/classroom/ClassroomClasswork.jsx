import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileQuestion,
  MoreVertical,
  Plus
} from 'lucide-react';

import {
  deletePost,
  deleteTopic,
  getClasswork
} from '../../faculty/api/faculty.api';
import AddTopicModal from '../../faculty/modals/AddTopicModal';
import AssignmentModal from '../../faculty/modals/AssignmentModal';
import MaterialModal from '../../faculty/modals/MaterialModal';
import QuizModal from '../../faculty/modals/QuizModal';

const ClassroomClasswork = ({ classroom, viewerRole = 'FACULTY' }) => {
  const navigate = useNavigate();
  const classroomId = classroom?._id;
  const canManage = viewerRole === 'FACULTY';

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedTopics, setCollapsedTopics] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [activeTopicMenu, setActiveTopicMenu] = useState(null);
  const [activePostMenu, setActivePostMenu] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [editTopicData, setEditTopicData] = useState(null);
  const [editPostData, setEditPostData] = useState(null);

  useEffect(() => {
    const handleWindowClick = () => {
      setActiveTopicMenu(null);
      setActivePostMenu(null);
      setShowCreateMenu(false);
    };

    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const fetchClasswork = async () => {
    try {
      setLoading(true);
      const response = await getClasswork(classroomId);
      const nextTopics = response?.data?.classwork || [];
      setTopics(nextTopics);
      setCollapsedTopics(
        nextTopics.reduce(
          (accumulator, topic) => ({
            ...accumulator,
            [topic._id]: false
          }),
          {}
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchClasswork();
    }
  }, [classroomId]);

  const toggleTopic = (topicId) => {
    setCollapsedTopics((current) => ({
      ...current,
      [topicId]: !current[topicId]
    }));
  };

  const togglePost = (postId) => {
    setExpandedPosts((current) => ({
      ...current,
      [postId]: !current[postId]
    }));
  };

  const navigateToPost = (post) => {
    navigate(
      `/${viewerRole.toLowerCase()}/dashboard/classroom/${classroomId}/post/${post._id}`,
      { state: { fromView: 'classwork' } }
    );
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm("Delete topic? Posts will move to 'No Topic'.")) return;

    try {
      await deleteTopic(classroomId, topicId);
      fetchClasswork();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Delete this ${post.type}?`)) return;

    try {
      await deletePost(classroomId, post.type, post._id);
      fetchClasswork();
    } catch (error) {
      console.error(error);
    }
  };

  const postIcon = (type) => {
    if (type === 'assignment') return <ClipboardList size={18} />;
    if (type === 'quiz') return <FileQuestion size={18} />;
    return <BookOpen size={18} />;
  };

  const renderPostMeta = (post) => {
    if (viewerRole === 'FACULTY') {
      return `${post.submissionSummary?.submittedCount || 0} submitted - ${
        post.submissionSummary?.pendingCount || 0
      } pending`;
    }

    return (post.submissionSummary?.myStatus || 'pending').replace('-', ' ');
  };

  const resetModalState = () => {
    setActiveModal(null);
    setEditPostData(null);
    setEditTopicData(null);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">Loading classwork...</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-5">
      <div className="mb-10 flex items-center justify-end gap-4">
        {canManage ? (
          <div className="relative">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowCreateMenu(!showCreateMenu);
              }}
              className="flex items-center gap-1 rounded-lg bg-[#08384F] py-2.5 pl-2 pr-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#0a4663]"
            >
              <Plus size={20} />
              Create
            </button>

            {showCreateMenu ? (
              <div className="absolute right-0 top-14 z-[150] w-56 origin-top-right rounded-xl border border-gray-200 bg-white py-2 shadow-2xl">
                {['assignment', 'quiz', 'material'].map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setEditPostData(null);
                      setActiveModal(type);
                      setShowCreateMenu(false);
                    }}
                    className="flex w-full items-center gap-4 px-5 py-3 text-left text-[14px] capitalize text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <span className="rounded-lg bg-[#08384F] p-1.5 text-white">
                      {postIcon(type)}
                    </span>
                    {type}
                  </button>
                ))}
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => {
                    setEditTopicData(null);
                    setActiveModal('topic');
                    setShowCreateMenu(false);
                  }}
                  className="w-full px-5 py-3 text-left text-[14px] text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Topic
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="space-y-12 pb-20">
        {!topics.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center text-slate-400">
            Classwork will appear here.
          </div>
        ) : null}

        {topics
          .filter((topic) => (topic.isDefault ? (topic.posts || []).length > 0 : true))
          .map((topic) => (
            <div key={topic._id}>
              <div
                className="group mb-2 flex cursor-pointer items-center justify-between border-b-2 border-[#08384F] pb-2"
                onClick={() => toggleTopic(topic._id)}
              >
                <h2 className="truncate pr-4 text-2xl font-normal text-[#08384F]">
                  {topic.name}
                </h2>
                <div className="flex items-center gap-2">
                  {canManage && !topic.isDefault ? (
                    <div className="relative">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveTopicMenu(
                            activeTopicMenu === topic._id ? null : topic._id
                          );
                        }}
                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                      >
                        <MoreVertical size={20} />
                      </button>
                      {activeTopicMenu === topic._id ? (
                        <div className="absolute right-0 z-[120] mt-1 w-40 rounded-lg border bg-white py-1 shadow-xl">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setEditTopicData(topic);
                              setActiveModal('topic');
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            Rename
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteTopic(topic._id);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <motion.div
                    animate={{ rotate: collapsedTopics[topic._id] ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
                  >
                    <ChevronUp size={24} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!collapsedTopics[topic._id] ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 pt-3">
                      {(topic.posts || []).map((post) => {
                        const dueDate =
                          post.assignment?.dueDate || post.quiz?.dueDate;
                        const isExpanded = !!expandedPosts[post._id];

                        return (
                          <div
                            key={post._id}
                            className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                          >
                            <div
                              className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4"
                              onClick={() => togglePost(post._id)}
                            >
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#08384F] text-white">
                                  {postIcon(post.type)}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="truncate text-[15px] font-semibold text-gray-900">
                                    {post.title}
                                  </h3>
                                  <p className="text-[13px] text-gray-500">
                                    {dueDate
                                      ? `Due ${new Date(dueDate).toLocaleDateString()}`
                                      : 'No due date'}
                                    {' - '}
                                    {renderPostMeta(post)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {canManage ? (
                                  <div className="relative">
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        setActivePostMenu(
                                          activePostMenu === post._id ? null : post._id
                                        );
                                      }}
                                      className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
                                    >
                                      <MoreVertical size={18} />
                                    </button>
                                    {activePostMenu === post._id ? (
                                      <div className="absolute right-0 z-[130] mt-1 w-36 rounded-lg border bg-white py-1 shadow-2xl">
                                        <button
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            setEditPostData(post);
                                            setActiveModal(post.type);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleDeletePost(post);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}

                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isExpanded ? (
                                <motion.div
                                  key={`post-details-${post._id}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="border-t border-gray-100 px-5 py-5">
                                    <div
                                      className="prose max-w-none text-sm text-gray-700"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          post.instructions ||
                                          '<p>No additional instructions.</p>'
                                      }}
                                    />

                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                                      <span className="rounded-full bg-slate-100 px-3 py-1">
                                        {post.type}
                                      </span>
                                      {post.attachments?.length ? (
                                        <span className="rounded-full bg-slate-100 px-3 py-1">
                                          {post.attachments.length} attachment(s)
                                        </span>
                                      ) : null}
                                    </div>

                                    <div className="mt-5">
                                      <button
                                        onClick={() => navigateToPost(post)}
                                        className="rounded-xl bg-[#08384F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B56A4]"
                                      >
                                        More instructions
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      {!(topic.posts || []).length ? (
                        <div className="px-4 py-8 text-[14px] text-gray-400">
                          No posts in this topic
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
      </div>

      <QuizModal
        isOpen={activeModal === 'quiz'}
        onClose={resetModalState}
        classroomId={classroomId}
        topics={topics}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />
      <MaterialModal
        isOpen={activeModal === 'material'}
        onClose={resetModalState}
        classroomId={classroomId}
        topics={topics}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />
      <AssignmentModal
        isOpen={activeModal === 'assignment'}
        onClose={resetModalState}
        classroomId={classroomId}
        topics={topics}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />
      <AddTopicModal
        isOpen={activeModal === 'topic'}
        onClose={resetModalState}
        classroomId={classroomId}
        onTopicAction={fetchClasswork}
        initialData={editTopicData}
      />
    </div>
  );
};

export default ClassroomClasswork;
