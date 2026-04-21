import React, { useEffect, useState } from 'react';
import { MoreVertical, UserRoundPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { getClassroomMembers } from '../../faculty/api/faculty.api';
import InviteModal from '../../faculty/modals/InviteModal';

const ClassroomPeople = ({ classroom, viewerRole = 'FACULTY' }) => {
  const classroomId = classroom?._id;
  const canManage = viewerRole === 'FACULTY';

  const [members, setMembers] = useState({ faculties: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [activeUserMenu, setActiveUserMenu] = useState(null);
  const [inviteModal, setInviteModal] = useState({
    isOpen: false,
    type: 'students'
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getClassroomMembers(classroomId);
      if (response?.success) {
        setMembers({
          faculties: response.data?.faculties || [],
          students: response.data?.students || []
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchMembers();
    }
  }, [classroomId]);

  const getInitials = (firstName, lastName) =>
    `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading people...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      {canManage ? (
        <InviteModal
          isOpen={inviteModal.isOpen}
          onClose={() => setInviteModal({ isOpen: false, type: 'students' })}
          type={inviteModal.type}
          classroomId={classroomId}
        />
      ) : null}

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between border-b border-[#08384F] pb-3">
          <h2 className="text-2xl font-semibold text-[#08384F]">Faculties</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              {members.faculties.length} faculties
            </span>
            {canManage ? (
              <button
                className="rounded-full p-2 text-[#08384F] transition-colors hover:bg-blue-50"
                onClick={() => setInviteModal({ isOpen: true, type: 'faculties' })}
              >
                <UserRoundPlus size={22} strokeWidth={2.5} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-1">
          {members.faculties.map((teacher) => (
            <div key={teacher._id} className="flex items-center gap-4 px-2 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e0eefc] bg-[#f0f7ff]">
                <span className="text-sm font-bold text-[#08384F]">
                  {getInitials(teacher.firstName, teacher.lastName)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-gray-800">
                  {teacher.firstName} {teacher.lastName}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{teacher.designation || 'Faculty'}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="font-bold text-[#08384F]">
                    {teacher.departmentId?.code}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between border-b border-[#08384F] pb-3">
          <h2 className="text-2xl font-semibold text-[#08384F]">Students</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">
              {members.students.length} students
            </span>
            {canManage ? (
              <button
                className="rounded-full p-2 text-[#08384F] transition-colors hover:bg-blue-50"
                onClick={() => setInviteModal({ isOpen: true, type: 'students' })}
              >
                <UserRoundPlus size={22} strokeWidth={2.5} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {members.students.map((student) => (
            <div
              key={student._id}
              className="group flex items-center justify-between px-2 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e0eefc] bg-[#f0f7ff]">
                  <span className="text-xs font-bold text-[#08384F]">
                    {getInitials(student.firstName, student.lastName)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-800">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.registerNumber}
                    {student.rollNumber ? ` - ${student.rollNumber}` : ''}
                  </p>
                </div>
              </div>

              {canManage ? (
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveUserMenu(
                        activeUserMenu === student._id ? null : student._id
                      )
                    }
                    className="rounded-full p-2 text-gray-500 opacity-0 transition group-hover:opacity-100 hover:bg-gray-200"
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {activeUserMenu === student._id ? (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveUserMenu(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-0 z-50 mt-1 w-40 rounded-lg border bg-white py-1 shadow-xl"
                        >
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50">
                            Manage later
                          </button>
                        </motion.div>
                      </>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClassroomPeople;
