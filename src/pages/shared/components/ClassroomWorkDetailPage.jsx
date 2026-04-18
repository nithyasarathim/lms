import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileQuestion,
  Paperclip,
  Upload,
} from 'lucide-react';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import {
  getPostDetail,
  submitPostSubmission,
} from '../../faculty/api/faculty.api';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const postTypeMeta = {
  assignment: {
    label: 'Assignment',
    icon: ClipboardList,
    accent: 'bg-[#08384F]',
  },
  quiz: {
    label: 'Quiz',
    icon: FileQuestion,
    accent: 'bg-[#0B56A4]',
  },
  material: {
    label: 'Material',
    icon: BookOpen,
    accent: 'bg-emerald-600',
  },
};

const statusMeta = {
  pending: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-50 text-blue-700',
  late: 'bg-amber-50 text-amber-700',
  graded: 'bg-emerald-50 text-emerald-700',
  missing: 'bg-rose-50 text-rose-700',
  closed: 'bg-slate-200 text-slate-700',
};

const formatDateTime = (value) => {
  if (!value) return 'No due date';
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getAttachmentUrl = (attachment) =>
  attachment?.fileUrl?.startsWith('/pdf/')
    ? `${API_BASE_URL}${attachment.fileUrl}`
    : attachment?.fileUrl;

const createInitialQuizAnswers = (questions = [], existingAnswers = []) => {
  const answerMap = new Map(
    (existingAnswers || []).map((answer) => [answer.questionIndex, answer])
  );

  return questions.map((question, index) => {
    const existing = answerMap.get(index);
    return {
      questionIndex: index,
      answers: existing?.answers || [],
      textAnswer: existing?.textAnswer || '',
    };
  });
};

const resolveDashboardParams = (pathname) => {
  const matched =
    matchPath(
      '/faculty/dashboard/classroom/:classroomId/post/:postId',
      pathname
    ) ||
    matchPath(
      '/student/dashboard/classroom/:classroomId/post/:postId',
      pathname
    );

  return {
    classroomId: matched?.params?.classroomId || '',
    postId: matched?.params?.postId || '',
  };
};

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
      statusMeta[value] || 'bg-slate-100 text-slate-600'
    }`}
  >
    {value}
  </span>
);

const AttachmentList = ({ attachments = [] }) => {
  if (!attachments.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {attachments.map((attachment, index) => (
        <a
          key={`${attachment.fileUrl}-${index}`}
          href={getAttachmentUrl(attachment)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#08384F] hover:text-[#08384F]"
        >
          <Paperclip size={16} />
          <span className="truncate">{attachment.fileName || 'Attachment'}</span>
        </a>
      ))}
    </div>
  );
};

const SubmissionTextCard = ({ value }) => {
  if (!value?.trim()) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Text Response
      </p>
      <p className="whitespace-pre-wrap text-sm text-slate-700">{value}</p>
    </div>
  );
};

const SubmissionLinkCard = ({ value }) => {
  if (!value?.trim()) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Link Submission
      </p>
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#08384F] hover:underline"
      >
        <ExternalLink size={14} />
        Open submitted link
      </a>
    </div>
  );
};

const QuizAnswerList = ({ submission, questions = [] }) => {
  if (!submission?.quizAnswers?.length) return null;

  return (
    <div className="space-y-3">
      {submission.quizAnswers.map((answer) => {
        const question = questions[answer.questionIndex];
        const answerValue = answer.textAnswer?.trim()
          ? answer.textAnswer
          : (answer.answers || []).join(', ');

        return (
          <div
            key={`answer-${answer.questionIndex}`}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Question {answer.questionIndex + 1}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {question?.questionText || 'Question'}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {answerValue || 'No answer recorded'}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const ClassroomWorkDetailPage = ({ viewerRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classroomId, postId } = useMemo(
    () => resolveDashboardParams(location.pathname),
    [location.pathname]
  );

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [assignmentDraft, setAssignmentDraft] = useState({
    textSubmission: '',
    linkSubmission: '',
    existingAttachments: [],
    newFiles: [],
  });
  const [quizDraft, setQuizDraft] = useState([]);
  const [expandedRosterEntries, setExpandedRosterEntries] = useState({});

  const dashboardBase = `/${viewerRole.toLowerCase()}/dashboard`;
  const fromView = location.state?.fromView || 'classwork';

  const fetchDetail = async () => {
    if (!classroomId || !postId) {
      setDetail(null);
      setError('Invalid classroom or post link');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getPostDetail(classroomId, postId);
      setDetail(response?.data || null);
    } catch (err) {
      setError(err?.message || 'Unable to load this classwork item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [classroomId, postId]);

  useEffect(() => {
    const post = detail?.post;
    if (!post || viewerRole !== 'STUDENT') return;

    if (post.type === 'assignment') {
      setAssignmentDraft({
        textSubmission: post.mySubmission?.textSubmission || '',
        linkSubmission: post.mySubmission?.linkSubmission || '',
        existingAttachments: post.mySubmission?.attachments || [],
        newFiles: [],
      });
    }

    if (post.type === 'quiz') {
      setQuizDraft(
        createInitialQuizAnswers(
          post.quiz?.questions || [],
          post.mySubmission?.quizAnswers || []
        )
      );
    }
  }, [detail, viewerRole]);

  const handleBack = () => {
    navigate(
      `${dashboardBase}?tab=classrooms&classroomId=${classroomId}&view=${fromView}`
    );
  };

  const post = detail?.post;
  const classroom = detail?.classroom;
  const roster = detail?.submissionRoster || [];
  const dueDate = post?.assignment?.dueDate || post?.quiz?.dueDate || null;
  const typeMeta = postTypeMeta[post?.type] || postTypeMeta.assignment;
  const Icon = typeMeta.icon;
  const hasSubmittedWork = viewerRole === 'STUDENT' && !!post?.mySubmission;

  const submissionScore = useMemo(() => {
    if (!post?.mySubmission) return null;
    return post.mySubmission.marks ?? null;
  }, [post]);

  const handleAssignmentFiles = (event) => {
    const files = Array.from(event.target.files || []);
    setAssignmentDraft((current) => ({
      ...current,
      newFiles: [...current.newFiles, ...files],
    }));
  };

  const updateQuizAnswer = (questionIndex, updater) => {
    setQuizDraft((current) =>
      current.map((item, index) =>
        index === questionIndex ? { ...item, ...updater(item) } : item
      )
    );
  };

  const toggleRosterEntry = (studentUserId) => {
    setExpandedRosterEntries((current) => ({
      ...current,
      [studentUserId]: !current[studentUserId],
    }));
  };

  const handleSubmitAssignment = async () => {
    const formData = new FormData();
    formData.append('textSubmission', assignmentDraft.textSubmission);
    formData.append('linkSubmission', assignmentDraft.linkSubmission);
    formData.append(
      'attachments',
      JSON.stringify(assignmentDraft.existingAttachments || [])
    );
    assignmentDraft.newFiles.forEach((file) => formData.append('files', file));

    try {
      setSubmitting(true);
      await submitPostSubmission(classroomId, postId, formData);
      await fetchDetail();
    } catch (err) {
      setError(err?.message || 'Unable to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    const formData = new FormData();
    formData.append('quizAnswers', JSON.stringify(quizDraft));

    try {
      setSubmitting(true);
      await submitPostSubmission(classroomId, postId, formData);
      await fetchDetail();
    } catch (err) {
      setError(err?.message || 'Unable to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="px-6 py-10 text-sm text-slate-500">Loading classwork...</div>;
  }

  if (!post || error) {
    return (
      <div className="px-6 py-10">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#08384F]"
        >
          <ChevronLeft size={16} />
          Back to classroom
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error || 'This classwork item could not be loaded.'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-6 py-6">
      <button
        onClick={handleBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#08384F]"
      >
        <ChevronLeft size={16} />
        Back to {classroom?.subjectId?.name || 'classroom'}
      </button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${typeMeta.accent}`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {typeMeta.label}
                    </span>
                    {viewerRole === 'STUDENT' && post?.submissionSummary?.myStatus ? (
                      <StatusBadge value={post.submissionSummary.myStatus} />
                    ) : null}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {post.title || typeMeta.label}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Posted by {post.createdBy?.firstName} {post.createdBy?.lastName}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>{formatDateTime(dueDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  <span>{formatDateTime(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {post.instructions ? (
              <div
                className="prose max-w-none text-sm text-slate-700 prose-p:my-2 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: post.instructions }}
              />
            ) : (
              <p className="text-sm text-slate-400">No instructions added.</p>
            )}

            <div className="mt-6">
              <AttachmentList attachments={post.attachments || []} />
            </div>
          </section>

          {viewerRole === 'STUDENT' && post.type === 'assignment' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Work</h2>
              {hasSubmittedWork ? (
                <div className="space-y-4">
                  <SubmissionTextCard value={post.mySubmission?.textSubmission} />
                  <SubmissionLinkCard value={post.mySubmission?.linkSubmission} />
                  <AttachmentList attachments={post.mySubmission?.attachments || []} />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    This assignment has already been turned in and can no longer be edited.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={assignmentDraft.textSubmission}
                    onChange={(event) =>
                      setAssignmentDraft((current) => ({
                        ...current,
                        textSubmission: event.target.value,
                      }))
                    }
                    placeholder="Add private text notes or answers..."
                    className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#08384F]"
                  />
                  <input
                    value={assignmentDraft.linkSubmission}
                    onChange={(event) =>
                      setAssignmentDraft((current) => ({
                        ...current,
                        linkSubmission: event.target.value,
                      }))
                    }
                    placeholder="Add a link"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#08384F]"
                  />
                  <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-[#08384F] hover:text-[#08384F]">
                    <Upload size={16} />
                    Add files
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleAssignmentFiles}
                    />
                  </label>

                  <div className="space-y-2">
                    {[
                      ...(assignmentDraft.existingAttachments || []),
                      ...(assignmentDraft.newFiles || []).map((file) => ({
                        fileName: file.name,
                        fileUrl: file.name,
                      })),
                    ].map((attachment, index) => (
                      <div
                        key={`${attachment.fileName}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
                      >
                        <Paperclip size={15} />
                        <span className="truncate">{attachment.fileName}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitAssignment}
                    disabled={submitting}
                    className="rounded-xl bg-[#08384F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0B56A4] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Turn In'}
                  </button>
                </div>
              )}
            </section>
          ) : null}

          {viewerRole === 'STUDENT' && post.type === 'quiz' ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">Quiz</h2>
                {submissionScore !== null ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    Score: {submissionScore}
                  </span>
                ) : null}
              </div>

              {hasSubmittedWork ? (
                <div className="space-y-4">
                  <QuizAnswerList
                    submission={post.mySubmission}
                    questions={post.quiz?.questions || []}
                  />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    This quiz has already been submitted and can no longer be edited.
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-5">
                    {(post.quiz?.questions || []).map((question, questionIndex) => (
                      <div
                        key={`question-${questionIndex}`}
                        className="rounded-2xl border border-slate-200 p-5"
                      >
                        <p className="mb-4 text-sm font-semibold text-slate-800">
                          {questionIndex + 1}. {question.questionText}
                        </p>

                        {question.questionType === 'short_answer' ? (
                          <textarea
                            value={quizDraft[questionIndex]?.textAnswer || ''}
                            onChange={(event) =>
                              updateQuizAnswer(questionIndex, () => ({
                                textAnswer: event.target.value,
                                answers: [],
                              }))
                            }
                            className="min-h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#08384F]"
                            placeholder="Type your answer"
                          />
                        ) : (
                          <div className="space-y-2">
                            {(question.options || []).map((option) => {
                              const selectedAnswers =
                                quizDraft[questionIndex]?.answers || [];
                              const isSelected = selectedAnswers.includes(option);

                              return (
                                <label
                                  key={option}
                                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                                >
                                  <input
                                    type={
                                      question.questionType === 'multiple_choice'
                                        ? 'checkbox'
                                        : 'radio'
                                    }
                                    checked={isSelected}
                                    name={`question-${questionIndex}`}
                                    onChange={() =>
                                      updateQuizAnswer(questionIndex, (current) => {
                                        const nextAnswers =
                                          question.questionType === 'multiple_choice'
                                            ? isSelected
                                              ? current.answers.filter(
                                                  (item) => item !== option
                                                )
                                              : [...current.answers, option]
                                            : [option];

                                        return {
                                          answers: nextAnswers,
                                          textAnswer: '',
                                        };
                                      })
                                    }
                                  />
                                  <span>{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="mt-6 rounded-xl bg-[#08384F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0B56A4] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                </>
              )}
            </section>
          ) : null}

          {viewerRole !== 'STUDENT' &&
          (post.type === 'assignment' || post.type === 'quiz') ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Submission Status
                </h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Grading panel scaffold ready
                </span>
              </div>

              <div className="space-y-3">
                {roster.map((entry) => (
                  <div
                    key={entry.student.userId}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_160px_110px]">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {entry.student.firstName} {entry.student.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {entry.student.registerNumber}
                          {entry.student.rollNumber
                            ? ` • ${entry.student.rollNumber}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <StatusBadge value={entry.state} />
                      </div>
                      <div className="text-sm text-slate-500">
                        {entry.submission?.submittedAt
                          ? formatDateTime(entry.submission.submittedAt)
                          : 'Not submitted'}
                      </div>
                      <div className="text-right text-sm font-semibold text-slate-700">
                        {entry.submission?.marks ?? '--'}
                      </div>
                    </div>

                    {entry.submission ? (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => toggleRosterEntry(entry.student.userId)}
                          className="text-sm font-semibold text-[#08384F] hover:underline"
                        >
                          {expandedRosterEntries[entry.student.userId]
                            ? 'Hide submission'
                            : 'View submission'}
                        </button>

                        {expandedRosterEntries[entry.student.userId] ? (
                          <div className="mt-4 space-y-4">
                            <SubmissionTextCard
                              value={entry.submission.textSubmission}
                            />
                            <SubmissionLinkCard
                              value={entry.submission.linkSubmission}
                            />
                            <AttachmentList
                              attachments={entry.submission.attachments || []}
                            />
                            {post.type === 'quiz' ? (
                              <QuizAnswerList
                                submission={entry.submission}
                                questions={post.quiz?.questions || []}
                              />
                            ) : null}

                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                              Grade controls can be added here later without
                              changing the submission layout.
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {viewerRole === 'STUDENT' ? 'Your Status' : 'Overview'}
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Due</span>
                <span className="text-right font-medium text-slate-800">
                  {formatDateTime(dueDate)}
                </span>
              </div>

              {post.type === 'assignment' || post.type === 'quiz' ? (
                <>
                  {viewerRole === 'STUDENT' ? (
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <StatusBadge
                        value={post.submissionSummary?.myStatus || 'pending'}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Submitted</span>
                        <span className="font-semibold text-slate-900">
                          {post.submissionSummary?.submittedCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pending</span>
                        <span className="font-semibold text-slate-900">
                          {post.submissionSummary?.pendingCount || 0}
                        </span>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </section>

          {viewerRole === 'STUDENT' && post.mySubmission ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Submission Received
              </div>
              <p className="text-sm text-slate-500">
                Submitted on {formatDateTime(post.mySubmission.submittedAt)}
              </p>
            </section>
          ) : null}

          {viewerRole === 'STUDENT' &&
          !post.mySubmission &&
          (post.type === 'assignment' || post.type === 'quiz') ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                <AlertCircle size={16} />
                Work Pending
              </div>
              <p className="text-sm text-amber-700">
                Submit before the due time to avoid a late or missing status.
              </p>
            </section>
          ) : null}
        </aside>
      </div>
      </div>
    </div>
  );
};

export default ClassroomWorkDetailPage;
