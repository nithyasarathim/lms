import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
// Added inviteMembers to imports
import { getEligiblePeople, inviteMembers } from '../api/faculty.api';

const InviteModal = ({ isOpen, onClose, type, classroomId }) => {
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false); // New state for the invite request
  const [people, setPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const inviteLink =
    'https://classroom.google.com/c/NjYxMjM0NTY3ODla?cjc=abc1234';

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSearchQuery('');
      setSelectedIds([]);
    }
  }, [isOpen, type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getEligiblePeople(classroomId, type);
      if (res.success && res.data) {
        const rawList = res.data;
        const formattedPeople = rawList.map((person) => {
          const name =
            person.fullName || `${person.firstName} ${person.lastName}`;
          const initials = name
            .split(' ')
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return {
            id: person.userId,
            name: name,
            email: person.email,
            initials: initials,
            subInfo: type === 'faculties' ? person.deptCode : person.rollNumber
          };
        });
        setPeople(formattedPeople);
      }
    } catch (err) {
      console.error('Failed to fetch people:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle Invite Logic ---
  const handleInvite = async () => {
    if (selectedIds.length === 0) return;

    try {
      setInviting(true);

      // Map 'faculties' -> 'FACULTY' and 'students' -> 'STUDENT'
      const role = type === 'faculties' ? 'FACULTY' : 'STUDENT';

      const payload = {
        userIds: selectedIds,
        role: role
      };

      const res = await inviteMembers(classroomId, payload);

      if (res.success) {
        // You might want to show a toast notification here
        alert(`${selectedIds.length} invite(s) sent successfully!`);
        onClose(); // Close modal on success
      }
    } catch (err) {
      console.error('Invitation failed:', err);
      alert('Failed to send invitations. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const filtered = people.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-lg h-[520px] rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">
            Invite {type === 'faculties' ? 'Faculties' : 'Students'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* INVITE LINK */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 tracking-wider">
            Invite Link
          </label>
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <span className="text-sm text-slate-600 truncate mr-4 font-medium">
              {inviteLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 hover:bg-slate-50 rounded-md transition-colors"
            >
              {copied ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* SEARCH + SELECT ALL */}
        <div className="px-6 py-3 border-b flex items-center justify-between gap-4 bg-white">
          <input
            type="text"
            placeholder={`Search ${type}...`}
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08384f]/20 focus:border-[#08384f]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-[#08384f] uppercase tracking-tight"
          >
            {selectedIds.length === filtered.length && filtered.length !== 0
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-[#08384f]" size={32} />
              <p className="text-xs text-gray-400 font-medium">
                Fetching records...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-gray-400">
                No records found matching your search.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#08384f]/5 border-[#08384f]/20'
                        : 'bg-transparent border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#08384f] border-[#08384f]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          size={14}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#08384f] text-xs font-bold border border-slate-200">
                      {p.initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-gray-500 truncate">
                        {p.email} •{' '}
                        <span className="font-medium text-[#08384f] uppercase">
                          {p.subInfo || 'N/A'}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-between items-center bg-gray-50/50">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {selectedIds.length} Selected
          </span>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={inviting}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite} // Attached the invite function
              disabled={selectedIds.length === 0 || inviting}
              className={`px-8 py-2 text-sm font-bold rounded-lg transition-all shadow-md flex items-center gap-2 ${
                selectedIds.length > 0 && !inviting
                  ? 'bg-[#08384f] text-white hover:bg-[#0a4a69] active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              {inviting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending...
                </>
              ) : (
                'Send Invites'
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InviteModal;
