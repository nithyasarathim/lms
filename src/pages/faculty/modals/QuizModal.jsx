import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Calendar,
  Circle,
  Square,
  Check,
  Type,
  HelpCircle,
  GripVertical,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { createPost, updatePost } from "../api/faculty.api";

const QuizModal = ({
  isOpen,
  onClose,
  classroomId,
  topics,
  onPostCreated,
  initialData = null,
}) => {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [hasDueDate, setHasDueDate] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [isAutoGraded, setIsAutoGraded] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      const quiz = initialData.quiz || {};
      setTitle(initialData.title || "");
      setInstructions(initialData.instructions || "");
      setSelectedTopicId(initialData.topicId || "");
      setIsAutoGraded(quiz.isAutoGraded ?? true);
      setQuestions(quiz.questions || []);

      if (quiz.dueDate) {
        const date = new Date(quiz.dueDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        setHasDueDate(true);
      }
    } else if (isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle("");
    setInstructions("");
    setDueDate("");
    setHasDueDate(false);
    setSelectedTopicId("");
    setQuestions([
      {
        questionText: "",
        questionType: "single_choice",
        options: ["Option 1", "Option 2"],
        correctAnswers: [],
        points: 1,
      },
    ]);
  };

  const hasDuplicateOptions = (options) => {
    const filtered = options.filter((opt) => opt.trim() !== "");
    return new Set(filtered).size !== filtered.length;
  };

  const isFormInvalid = () => {
    if (!title.trim()) return true;
    return (
      questions.length === 0 ||
      questions.some(
        (q) =>
          !q.questionText.trim() ||
          (q.questionType !== "short_answer" &&
            hasDuplicateOptions(q.options)) ||
          q.correctAnswers.length === 0,
      )
    );
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    if (field === "questionType") {
      if (value === "short_answer") {
        newQuestions[index].options = [];
        newQuestions[index].correctAnswers = [""];
      } else {
        newQuestions[index].options = ["Option 1", "Option 2"];
        newQuestions[index].correctAnswers = [];
      }
    }
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const newQuestions = [...questions];
    const oldVal = newQuestions[qIdx].options[optIdx];
    newQuestions[qIdx].options[optIdx] = val;
    newQuestions[qIdx].correctAnswers = newQuestions[qIdx].correctAnswers.map(
      (ans) => (ans === oldVal ? val : ans),
    );
    setQuestions(newQuestions);
  };

  const toggleCorrectAnswer = (qIdx, optionText) => {
    if (!optionText.trim()) return;
    const newQuestions = [...questions];
    const q = newQuestions[qIdx];
    if (q.questionType === "single_choice") {
      q.correctAnswers = [optionText];
    } else {
      if (q.correctAnswers.includes(optionText)) {
        q.correctAnswers = q.correctAnswers.filter((a) => a !== optionText);
      } else {
        q.correctAnswers.push(optionText);
      }
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "quiz");
      formData.append("title", title.trim());
      formData.append("instructions", instructions);
      formData.append("topicId", selectedTopicId || "No Topic");
      formData.append("quizData", JSON.stringify({ isAutoGraded, questions }));

      if (hasDueDate && dueDate) {
        formData.append("dueDate", new Date(dueDate).toISOString());
      } else {
        formData.append("dueDate", "");
      }

      const res = initialData
        ? await updatePost(classroomId, "quiz", initialData._id, formData)
        : await createPost(classroomId, formData);

      if (res.success) {
        onPostCreated();
        onClose();
      }
    } catch (err) {
      alert(err.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden relative flex flex-col h-[90vh] animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {initialData ? "Edit Quiz" : "New Quiz"}
            </h2>
          </div>
          <button
            disabled={loading || isFormInvalid()}
            onClick={handleSubmit}
            className="bg-[#08384F] text-white px-10 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a4663] transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {initialData ? "Update" : "Assign"}
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-white">
            <input
              className="w-full text-2xl py-2 bg-transparent border-b-2 border-gray-50 focus:border-[#08384F] outline-none transition-all placeholder:text-gray-300 font-bold"
              placeholder="Quiz Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Instructions
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50/30">
                <style>{`.ql-container { min-height: 100px; font-size: 15px; border:none !important; } .ql-toolbar { border:none !important; border-bottom: 1px solid #eee !important; background: #fff; }`}</style>
                <ReactQuill
                  theme="snow"
                  value={instructions}
                  onChange={setInstructions}
                  placeholder="Optional instructions for students..."
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">
                  Questions
                </h3>
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <input
                    type="checkbox"
                    id="autograded"
                    checked={isAutoGraded}
                    onChange={(e) => setIsAutoGraded(e.target.checked)}
                    className="accent-[#08384F]"
                  />
                  <label
                    htmlFor="autograded"
                    className="text-[11px] font-bold text-gray-600 cursor-pointer"
                  >
                    Auto-Grade
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm relative group"
                  >
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <input
                        className="flex-1 text-md font-semibold p-2 border-b border-gray-100 focus:border-[#08384F] outline-none"
                        placeholder={`Question ${qIdx + 1}`}
                        value={q.questionText}
                        onChange={(e) =>
                          updateQuestion(qIdx, "questionText", e.target.value)
                        }
                      />
                      <select
                        className="text-xs font-bold p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                        value={q.questionType}
                        onChange={(e) =>
                          updateQuestion(qIdx, "questionType", e.target.value)
                        }
                      >
                        <option value="single_choice">Single Choice</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                      <div className="flex items-center gap-2 px-3 border border-gray-200 rounded-xl">
                        <span className="text-[10px] font-bold text-gray-400">
                          PTS
                        </span>
                        <input
                          type="number"
                          className="w-12 p-1 text-sm font-bold outline-none text-[#08384F]"
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(qIdx, "points", e.target.value)
                          }
                        />
                      </div>
                      {/* Delete Question Button at Top Right of Card */}
                      <button
                        onClick={() =>
                          setQuestions(questions.filter((_, i) => i !== qIdx))
                        }
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 opacity-0"
                        title="Delete Question"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {q.questionType !== "short_answer" ? (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isDuplicate =
                            q.options.filter(
                              (o) => o === opt && o.trim() !== "",
                            ).length > 1;
                          const isCorrect = q.correctAnswers.includes(opt);
                          return (
                            <div
                              key={optIdx}
                              className="flex items-center gap-3 group/opt"
                            >
                              <button
                                onClick={() => toggleCorrectAnswer(qIdx, opt)}
                                className={`w-6 h-6 flex items-center justify-center transition-all ${
                                  isCorrect
                                    ? "bg-[#08384F]"
                                    : "border-2 border-gray-200 hover:border-gray-300"
                                } ${q.questionType === "single_choice" ? "rounded-full" : "rounded-md"}`}
                              >
                                {isCorrect && (
                                  <Check size={14} className="text-white" />
                                )}
                              </button>
                              <input
                                className={`flex-1 text-sm py-1 border-b outline-none ${isDuplicate ? "border-red-400 text-red-500" : "border-transparent focus:border-gray-200"}`}
                                value={opt}
                                onChange={(e) =>
                                  handleOptionChange(
                                    qIdx,
                                    optIdx,
                                    e.target.value,
                                  )
                                }
                              />
                              <button
                                onClick={() =>
                                  updateQuestion(
                                    qIdx,
                                    "options",
                                    q.options.filter((_, i) => i !== optIdx),
                                  )
                                }
                                className="opacity-0 group-hover/opt:opacity-100 text-gray-300 hover:text-red-500 transition-opacity"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          onClick={() =>
                            updateQuestion(qIdx, "options", [...q.options, ""])
                          }
                          className="text-xs font-bold text-[#08384F] mt-2 flex items-center gap-1 hover:underline"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>
                    ) : (
                      <input
                        className="w-full bg-[#08384F]/5 p-3 rounded-xl border border-dashed border-[#08384F]/20 text-sm outline-none"
                        placeholder="Type the correct answer here..."
                        value={q.correctAnswers[0] || ""}
                        onChange={(e) =>
                          updateQuestion(qIdx, "correctAnswers", [
                            e.target.value,
                          ])
                        }
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={() =>
                    setQuestions([
                      ...questions,
                      {
                        questionText: "",
                        questionType: "single_choice",
                        options: ["Option 1", "Option 2"],
                        correctAnswers: [],
                        points: 1,
                      },
                    ])
                  }
                  className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 text-sm font-bold hover:border-[#08384F] hover:text-[#08384F] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add Question
                </button>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[320px] bg-gray-50 border-l border-gray-100 p-8 space-y-8 overflow-y-auto shrink-0">
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
                    onChange={(e) => setDueDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent outline-none w-full text-xs font-bold"
                  />
                ) : (
                  "No due date"
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
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none cursor-pointer focus:border-[#08384F]"
              >
                <option value="">No Topic</option>
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
                  Auto-Grade
                </label>
                <button
                  onClick={() => setIsAutoGraded(!isAutoGraded)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${isAutoGraded ? "bg-[#08384F]" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isAutoGraded ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className="text-gray-600">Questions</span>
                <span className="text-[#08384F] font-bold">
                  {questions.length}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-600">Total Points</span>
                <span className="text-[#08384F] font-bold">
                  {questions.reduce(
                    (acc, curr) => acc + (Number(curr.points) || 0),
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
