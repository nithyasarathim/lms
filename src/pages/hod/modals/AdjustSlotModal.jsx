import React from "react";
import { Clock } from "lucide-react";

const AdjustSlotModal = ({ slot, onClose, onSave }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(e.target.startTime.value, e.target.endTime.value);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl">
        <h3 className="text-lg font-black text-[#08384F] mb-4 flex items-center gap-2">
          <Clock size={20} /> Adjust Slot
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Start Time (24hr format)
            </label>
            <input
              name="startTime"
              type="time"
              required
              defaultValue={slot?.startTime}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
            />
            {slot?.startTime && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Display:{" "}
                {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString(
                  "en-US",
                  { hour: "numeric", minute: "2-digit", hour12: true },
                )}
              </span>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              End Time (24hr format)
            </label>
            <input
              name="endTime"
              type="time"
              required
              defaultValue={slot?.endTime}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
            />
            {slot?.endTime && (
              <span className="text-[10px] text-slate-400 mt-1 block">
                Display:{" "}
                {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString(
                  "en-US",
                  { hour: "numeric", minute: "2-digit", hour12: true },
                )}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-black text-slate-400"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#08384F] text-white rounded-xl text-xs font-black shadow-lg"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdjustSlotModal;
