import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  MoreVertical,
  SortAsc,
  Mail,
  UserMinus,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// API
import { getClassroomMembers } from '../api/faculty.api';

const ClassroomPeople = ({ classroom }) => {
  const { _id: classroomId } = classroom;

  // Data States
  const [members, setMembers] = useState({ faculty: [], students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [activeUserMenu, setActiveUserMenu] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // 1. Call the API and Log Response
  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log(`Fetching members for Classroom ID: ${classroomId}`);
      const res = await getClassroomMembers(classroomId);

      console.log('API Response (Classroom Members):', res);

      if (res.success) {
        // We'll map this once I see your response structure,
        // for now let's assume it has faculty and students arrays
        setMembers({
          faculty: res.data?.faculty || [],
          students: res.data?.students || []
        });
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchMembers();
    }
  }, [classroomId]);

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500 font-medium">
        Loading Roster...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* TEACHERS SECTION */}
      <section className="mb-12">
        <div className="flex justify-between items-center border-b border-[#08384F] pb-3 mb-4">
          <h2 className="text-3xl font-normal text-[#08384F]">Teachers</h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-full text-[#08384F] transition-colors"
            onClick={() => console.log('Invite Teacher Clicked')}
          >
            <UserPlus size={24} />
          </button>
        </div>

        <div className="space-y-1">
          {members.faculty.map((teacher) => (
            <div
              key={teacher._id}
              className="flex items-center gap-4 py-3 px-2"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                <img
                  src={
                    teacher.avatar ||
                    `https://ui-avatars.com/api/?name=${teacher.name}&background=random`
                  }
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[15px] font-medium text-gray-800">
                {teacher.name}
              </span>
            </div>
          ))}
          {members.faculty.length === 0 && (
            <p className="text-gray-400 text-sm py-2 px-2">
              No teachers assigned.
            </p>
          )}
        </div>
      </section>

      {/* STUDENTS SECTION */}
      <section>
        <div className="flex justify-between items-center border-b border-[#08384F] pb-3 mb-6">
          <h2 className="text-3xl font-normal text-[#08384F]">Students</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              {members.students.length} students
            </span>
            <button
              className="p-2 hover:bg-gray-100 rounded-full text-[#08384F] transition-colors"
              onClick={() => console.log('Invite Student Clicked')}
            >
              <UserPlus size={24} />
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
              className={`flex items-center gap-2 px-4 py-1.5 border rounded-full text-sm font-medium transition-all ${
                selectedStudents.length > 0
                  ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
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
          {members.students.map((student) => (
            <div
              key={student._id}
              className={`flex items-center justify-between py-3 px-2 group transition-colors ${
                selectedStudents.includes(student._id)
                  ? 'bg-blue-50/50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-6 flex-1">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student._id)}
                  onChange={() => toggleStudentSelection(student._id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#08384F] focus:ring-[#08384F]"
                />
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                    <img
                      src={
                        student.avatar ||
                        `https://ui-avatars.com/api/?name=${student.name}&background=random`
                      }
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[14px] font-medium text-gray-800">
                    {student.name}
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
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all"
                >
                  <MoreVertical size={18} />
                </button>

                <AnimatePresence>
                  {activeUserMenu === student._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-[50] py-1"
                    >
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700">
                        <Mail size={16} /> Email student
                      </button>
                      <div className="border-t border-gray-100 my-1" />
                      <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-3 text-red-600">
                        <UserMinus size={16} /> Remove
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
          {members.students.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No students have joined this class yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ClassroomPeople;
