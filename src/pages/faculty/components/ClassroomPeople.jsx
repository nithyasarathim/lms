import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  MoreVertical,
  SortAsc,
  Mail,
  UserMinus,
  UserRoundPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClassroomMembers } from '../api/faculty.api';
import InviteModal from '../modals/InviteModal';

const ClassroomPeople = ({ classroom }) => {
  const { _id: classroomId } = classroom;
  const [members, setMembers] = useState({ faculty: [], students: [] });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [inviteModal, setInviteModal] = useState({
    isOpen: false,
    type: 'students'
  });

  const [activeUserMenu, setActiveUserMenu] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const openInviteModal = (type) => setInviteModal({ isOpen: true, type });
  const closeInviteModal = () =>
    setInviteModal({ isOpen: false, type: 'students' });

  // Helper to get initials (e.g., "Siamala Devi" -> "SD")
  const getInitials = (name) => {
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getClassroomMembers(classroomId);
      if (res.success) {
        setMembers({
          faculty: res.data?.faculties || [],
          students: res.data?.students || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) fetchMembers();
  }, [classroomId]);

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Shared Avatar Component based on your uploaded image
  const InitialsAvatar = ({ name, size = '10' }) => (
    <div
      className={`w-${size} h-${size} rounded-full bg-[#f0f7ff] border border-[#e0eefc] flex items-center justify-center`}
    >
      <span className="text-[#08384F] font-bold text-sm">
        {getInitials(name)}
      </span>
    </div>
  );

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500">Loading Roster...</div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <InviteModal
        isOpen={inviteModal.isOpen}
        onClose={closeInviteModal}
        type={inviteModal.type}
        classroomId={classroomId}
      />

      {/* FACULTIES SECTION */}
      <section className="mb-12">
        <div className="flex justify-between items-center border-b border-[#08384F] pb-3 mb-4">
          <h2 className="text-3xl font-normal text-[#08384F]">Faculties</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">
              {members.faculty.length} faculties
            </span>
            <button
              className="p-2 hover:bg-blue-50 rounded-full text-[#08384F] transition-colors"
              onClick={() => openInviteModal('faculties')}
            >
              <UserRoundPlus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          {members.faculty.map((teacher) => {
            const fullName = `${teacher.firstName} ${teacher.lastName}`;
            return (
              <div
                key={teacher._id}
                className="flex items-center gap-4 py-3 px-2"
              >
                <InitialsAvatar name={fullName} />
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-gray-800">
                    {fullName}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{teacher.designation || 'Faculty'}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="font-bold text-[#08384F]">
                      {teacher.departmentId?.code || teacher.deptCode}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STUDENTS SECTION */}
      <section>
        <div className="flex justify-between items-center border-b border-[#08384F] pb-3 mb-6">
          <h2 className="text-3xl font-normal text-[#08384F]">Students</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">
              {members.students.length} students
            </span>
            <button
              className="p-2 hover:bg-blue-50 rounded-full text-[#08384F] transition-colors"
              onClick={() => openInviteModal('students')}
            >
              <UserRoundPlus size={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="flex items-center gap-6">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-[#08384F] focus:ring-[#08384F]"
              onChange={(e) => {
                if (e.target.checked)
                  setSelectedStudents(members.students.map((s) => s._id));
                else setSelectedStudents([]);
              }}
              checked={
                selectedStudents.length === members.students.length &&
                members.students.length > 0
              }
            />
            <button
              disabled={selectedStudents.length === 0}
              className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-bold transition-all ${
                selectedStudents.length > 0
                  ? 'bg-white border-gray-300 text-gray-700 shadow-sm'
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              Actions <SortAsc size={14} className="rotate-180" />
            </button>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <SortAsc size={20} />
          </button>
        </div>

        {/* Student List */}
        <div className="divide-y divide-gray-100">
          {members.students.map((student) => {
            const fullName = `${student.firstName} ${student.lastName}`;
            const isSelected = selectedStudents.includes(student._id);
            return (
              <div
                key={student._id}
                className={`flex items-center justify-between py-3 px-2 group transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-6 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStudentSelection(student._id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#08384F] focus:ring-[#08384F]"
                  />
                  <div className="flex items-center gap-4">
                    <InitialsAvatar name={fullName} size="9" />
                    <span className="text-[14px] font-semibold text-gray-800">
                      {fullName}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveUserMenu(
                        activeUserMenu === student._id ? null : student._id
                      );
                    }}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full text-gray-500"
                  >
                    <MoreVertical size={18} />
                  </button>
                  <AnimatePresence>
                    {activeUserMenu === student._id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveUserMenu(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 mt-1 w-48 bg-white border shadow-xl rounded-lg z-50 py-1"
                        >
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 font-medium">
                            <Mail size={16} /> Email student
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium">
                            <UserMinus size={16} /> Remove
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ClassroomPeople;
