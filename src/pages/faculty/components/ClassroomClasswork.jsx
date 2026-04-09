import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ClipboardList,
  BookOpen,
  FileText,
  Layout,
  Edit2,
  Trash2,
  Megaphone,
  Edit,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import QuizModal from '../modals/QuizModal';
import MaterialModal from '../modals/MaterialModal';
import AssignmentModal from '../modals/AssignmentModal';
import AddTopicModal from '../modals/AddTopicModal';

import { deleteTopic, getClasswork, deletePost } from '../api/faculty.api';

const ClassroomClasswork = () => {
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get('classroomId');

  const [activeModal, setActiveModal] = useState(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [activeTopicMenu, setActiveTopicMenu] = useState(null);
  const [activePostMenu, setActivePostMenu] = useState(null);

  const [editTopicData, setEditTopicData] = useState(null);
  const [editPostData, setEditPostData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedTopics, setCollapsedTopics] = useState({});

  const fetchClasswork = async () => {
    if (!classroomId) return;
    try {
      setLoading(true);
      const res = await getClasswork(classroomId);
      if (res.success) {
        const fetchedTopics = res.data.classwork || [];
        setTopics(fetchedTopics);
        const initialCollapseState = {};
        fetchedTopics.forEach((t) => {
          initialCollapseState[t._id] = false;
        });
        setCollapsedTopics(initialCollapseState);
      }
    } catch (err) {
      console.error('Error fetching classwork:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasswork();
  }, [classroomId]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveTopicMenu(null);
      setActivePostMenu(null);
      setShowCreateMenu(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTopic = (id) => {
    setCollapsedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (shouldCollapse) => {
    const newState = {};
    topics.forEach((t) => (newState[t._id] = shouldCollapse));
    setCollapsedTopics(newState);
  };

  const areAllCollapsed =
    topics.length > 0 && topics.every((t) => collapsedTopics[t._id]);

  const handleCreateClick = (type) => {
    setEditPostData(null);
    setEditTopicData(null);
    setActiveModal(type);
    setShowCreateMenu(false);
  };

  const handleDeleteTopic = async (topicId) => {
    if (window.confirm("Delete topic? Posts will move to 'No Topic'.")) {
      try {
        const res = await deleteTopic(classroomId, topicId);
        if (res.success) {
          toast.success('Topic deleted successfully');
          fetchClasswork();
        }
      } catch (err) {
        toast.error('Failed to delete topic');
      }
    }
  };

  const handleDeletePost = async (type, postId) => {
    if (window.confirm(`Delete this ${type}?`)) {
      try {
        const res = await deletePost(classroomId, type, postId);
        if (res.success) {
          toast.success(`${type} deleted successfully`);
          fetchClasswork();
        }
      } catch (err) {
        toast.error('Failed to delete post');
      }
    }
  };

  const getIcon = (type) => {
    const iconClass = 'text-white';
    switch (type) {
      case 'assignment':
        return <ClipboardList size={20} className={iconClass} />;
      case 'quiz':
        return <FileText size={20} className={iconClass} />;
      case 'material':
        return <BookOpen size={20} className={iconClass} />;
      default:
        return <ClipboardList size={20} className={iconClass} />;
    }
  };

  const renderDueDate = (post) => {
    if (post.type === 'material') return null;
    const date = post.dueDate || post.quiz?.dueDate || post.assignment?.dueDate;
    if (!date)
      return <span className="text-[13px] text-gray-400">No due date</span>;
    return (
      <span className="text-[13px] text-gray-500 font-medium">
        Due {new Date(date).toLocaleDateString()}
      </span>
    );
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditPostData(null);
    setEditTopicData(null);
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500 animate-pulse">
        Loading Classwork...
      </div>
    );

  return (
    <div className="max-w-5xl py-5 mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateMenu(!showCreateMenu);
            }}
            className="bg-[#08384F] hover:bg-[#0a4663] text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Plus size={20} /> Create
          </button>

          <AnimatePresence>
            {showCreateMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-14 left-0 w-56 bg-white border border-gray-200 shadow-2xl rounded-xl z-150 py-2 origin-top-left"
              >
                {['assignment', 'quiz', 'material'].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleCreateClick(type)}
                    className="w-full text-left px-5 py-3 text-[14px] hover:bg-gray-50 flex items-center gap-4 text-gray-700 capitalize transition-colors"
                  >
                    <span className="p-1.5 bg-[#08384F] rounded-lg">
                      {getIcon(type)}
                    </span>
                    {type}
                  </button>
                ))}
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => handleCreateClick('topic')}
                  className="w-full text-left px-5 py-3 text-[14px] hover:bg-gray-50 flex items-center gap-4 text-gray-700 transition-colors"
                >
                  <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                    <Layout size={18} />
                  </span>
                  Topic
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {topics.length > 0 && (
          <button
            onClick={() => toggleAll(!areAllCollapsed)}
            className="flex items-center gap-2 text-[#08384F] hover:bg-[#08384f0a] px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            {areAllCollapsed ? (
              <>
                <ChevronsDown size={18} /> Expand all
              </>
            ) : (
              <>
                <ChevronsUp size={18} /> Collapse all
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-12 pb-32">
        {topics.length === 0 ? (
          <div className="py-24 text-center">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              Your classwork will appear here
            </p>
          </div>
        ) : (
          topics
            .filter((t) => (t.isDefault ? t.posts?.length > 0 : true))
            .map((topic) => (
              <div key={topic._id} className="group">
                <div
                  className="flex justify-between items-center border-b-2 border-[#08384F] mb-2 pb-2 cursor-pointer group"
                  onClick={() => toggleTopic(topic._id)}
                >
                  <h2 className="text-2xl font-normal text-[#08384F] truncate pr-4">
                    {topic.name}
                  </h2>
                  <div className="flex items-center gap-1">
                    {!topic.isDefault && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTopicMenu(
                              activeTopicMenu === topic._id ? null : topic._id
                            );
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                          <MoreVertical size={20} />
                        </button>
                        {activeTopicMenu === topic._id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border shadow-xl rounded-lg z-120 py-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTopicData(topic);
                                setActiveModal('topic');
                              }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit2 size={14} /> Rename
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTopic(topic._id);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                      <motion.div
                        animate={{
                          rotate: collapsedTopics[topic._id] ? -180 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronUp size={24} />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {!collapsedTopics[topic._id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 mt-2">
                        {topic.posts?.map((post) => (
                          <div
                            key={post._id}
                            className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 border-b border-gray-100 rounded-lg cursor-pointer group/post"
                          >
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-[#08384F] rounded-full flex items-center justify-center shrink-0">
                                {getIcon(post.type)}
                              </div>
                              <div className="truncate">
                                <h3 className="text-[15px] font-medium text-gray-900 group-hover/post:text-[#08384F] transition-colors truncate">
                                  {post.title}
                                </h3>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 ml-4">
                              {renderDueDate(post)}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePostMenu(
                                      activePostMenu === post._id
                                        ? null
                                        : post._id
                                    );
                                  }}
                                  className="p-2 opacity-0 group-hover/post:opacity-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all"
                                >
                                  <MoreVertical size={18} />
                                </button>
                                {activePostMenu === post._id && (
                                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border shadow-2xl rounded-lg z-130 py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditPostData(post);
                                        setActiveModal(post.type);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit size={14} /> Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePost(post.type, post._id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!topic.posts || topic.posts.length === 0) && (
                          <div className="py-8 px-4 text-gray-400 text-[14px]">
                            No posts in this topic
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
        )}
      </div>

      <QuizModal
        isOpen={activeModal === 'quiz'}
        onClose={closeModal}
        classroomId={classroomId}
        topics={topics}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />
      <MaterialModal
        isOpen={activeModal === 'material'}
        onClose={closeModal}
        classroomId={classroomId}
        topics={topics}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />
      <AssignmentModal
        isOpen={activeModal === 'assignment'}
        onClose={closeModal}
        classroomId={classroomId}
        topics={topics}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />
      <AddTopicModal
        isOpen={activeModal === 'topic'}
        onClose={closeModal}
        classroomId={classroomId}
        onTopicAction={fetchClasswork}
        initialData={editTopicData}
      />
    </div>
  );
};

export default ClassroomClasswork;
