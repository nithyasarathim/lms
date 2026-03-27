import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  ClipboardList,
  HelpCircle,
  BookOpen,
  FileText,
  Layout,
  Edit2,
  Trash2,
  Megaphone,
  Edit,
} from "lucide-react";
import CreateClassworkModal from "../modals/CreateClassworkModal";
import AddTopicModal from "../modals/AddTopicModal";
import { deleteTopic, getClasswork, deletePost } from "../api/faculty.api";

const ClassroomClasswork = () => {
  const [searchParams] = useSearchParams();
  const classroomId = searchParams.get("classroomId");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [createType, setCreateType] = useState("assignment");
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const [activeTopicMenu, setActiveTopicMenu] = useState(null);
  const [activePostMenu, setActivePostMenu] = useState(null); // Track specific post menu

  const [editTopicData, setEditTopicData] = useState(null);
  const [editPostData, setEditPostData] = useState(null); // Data for editing a post

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedTopics, setCollapsedTopics] = useState({});

  const fetchClasswork = async () => {
    if (!classroomId) return;
    try {
      setLoading(true);
      const res = await getClasswork(classroomId);
      if (res.success) {
        setTopics(res.data.classwork || []);
      }
    } catch (err) {
      console.error("Error fetching classwork:", err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasswork();
  }, [classroomId]);

  const toggleTopic = (topicId) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const toggleAll = (collapse) => {
    const newState = {};
    topics.forEach((t) => (newState[t._id] = collapse));
    setCollapsedTopics(newState);
  };

  const handleCreateClick = (type) => {
    setEditPostData(null); // Clear edit data for new creation
    if (type === "topic") {
      setEditTopicData(null);
      setIsTopicOpen(true);
    } else {
      setCreateType(type);
      setIsCreateOpen(true);
    }
    setShowCreateMenu(false);
  };

  const handleDeleteTopic = async (topicId) => {
    if (
      window.confirm(
        "Delete this topic?\n\nPosts within this topic will move to 'No Topic' section.",
      )
    ) {
      try {
        const res = await deleteTopic(classroomId, topicId);
        if (res.success) fetchClasswork();
      } catch (err) {
        alert("Failed to delete topic");
      }
    }
  };

  const handleDeletePost = async (type, postId) => {
    if (window.confirm(`Delete this ${type}?`)) {
      try {
        const res = await deletePost(classroomId, type, postId);
        if (res.success) fetchClasswork();
      } catch (err) {
        alert("Failed to delete post");
      }
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "assignment":
        return <ClipboardList size={20} />;
      case "quiz":
        return <FileText size={20} />;
      case "question":
        return <HelpCircle size={20} />;
      case "material":
        return <BookOpen size={20} />;
      default:
        return <ClipboardList size={20} />;
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-400 font-medium">
        Loading...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="bg-[#08384F] text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-[#0a4663] transition-all active:scale-95"
          >
            <Plus size={20} /> Create <ChevronDown size={16} />
          </button>

          {showCreateMenu && (
            <div className="absolute top-12 left-0 w-56 bg-white border border-gray-100 shadow-2xl rounded-xl z-50 py-2 animate-in zoom-in-95 origin-top-left">
              {["assignment", "quiz", "question", "material"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleCreateClick(t)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-gray-700 capitalize"
                >
                  {getIcon(t)} {t}
                </button>
              ))}
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => handleCreateClick("topic")}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors text-[#08384F] font-bold"
              >
                <Layout size={18} /> Topic
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => toggleAll(!Object.values(collapsedTopics)[0])}
          className="flex items-center gap-2 text-sm font-bold text-[#08384F] hover:bg-[#08384F]/5 px-3 py-1.5 rounded-lg transition-colors"
        >
          {Object.values(collapsedTopics).every((v) => v) ? (
            <>
              <ChevronDown size={16} /> Expand all
            </>
          ) : (
            <>
              <ChevronUp size={16} /> Collapse all
            </>
          )}
        </button>
      </div>

      <div className="space-y-10 pb-20">
        {topics.length === 0 ? (
          <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Megaphone size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No classwork yet</p>
          </div>
        ) : (
          topics.map((topic) => (
            <div key={topic._id} className="group">
              <div className="flex justify-between items-center border-b-2 border-[#08384F] pb-3 mb-2 relative">
                <div
                  onClick={() => toggleTopic(topic._id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <h2 className="text-2xl font-bold text-[#08384F] hover:underline">
                    {topic.name}
                  </h2>
                  {collapsedTopics[topic._id] ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronUp size={20} className="text-gray-400" />
                  )}
                </div>

                {!topic.isDefault && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveTopicMenu(
                          activeTopicMenu === topic._id ? null : topic._id,
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeTopicMenu === topic._id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-2xl rounded-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            setEditTopicData(topic);
                            setIsTopicOpen(true);
                            setActiveTopicMenu(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Edit2 size={14} className="text-[#08384F]" /> Rename
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteTopic(topic._id);
                            setActiveTopicMenu(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-3"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!collapsedTopics[topic._id] && (
                <div className="space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                  {topic.posts && topic.posts.length > 0 ? (
                    topic.posts.map((post) => (
                      <div
                        key={post._id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 group/item transition-all last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-[#08384F] rounded-full text-white shadow-sm">
                            {getIcon(post.type)}
                          </div>
                          <span className="font-semibold text-gray-700">
                            {post.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 relative">
                          <span className="text-[11px] text-gray-400 font-bold uppercase whitespace-nowrap">
                            {post.dueDate
                              ? `Due ${new Date(post.dueDate).toLocaleDateString()}`
                              : "No due date"}
                          </span>
                          <div className="relative">
                            <MoreVertical
                              size={18}
                              className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity hover:text-[#08384F]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePostMenu(
                                  activePostMenu === post._id ? null : post._id,
                                );
                              }}
                            />
                            {activePostMenu === post._id && (
                              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-30 py-1 overflow-hidden">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditPostData(post);
                                    setCreateType(post.type);
                                    setIsCreateOpen(true);
                                    setActivePostMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit size={14} className="text-[#08384F]" />{" "}
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.type, post._id);
                                    setActivePostMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 px-4 text-sm text-gray-400 italic bg-gray-50/30 rounded-lg">
                      No items have been added to this topic yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CreateClassworkModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditPostData(null);
        }}
        type={createType}
        classroomId={classroomId}
        onPostCreated={fetchClasswork}
        initialData={editPostData}
      />

      <AddTopicModal
        isOpen={isTopicOpen}
        onClose={() => {
          setIsTopicOpen(false);
          setEditTopicData(null);
        }}
        classroomId={classroomId}
        onTopicAction={fetchClasswork}
        initialData={editTopicData}
      />
    </div>
  );
};

export default ClassroomClasswork;
