import React, { useEffect, useState } from "react";
import HeaderComponent from "../../shared/components/HeaderComponent";
import { getCalendar } from "../api/faculty.api";
import { ChevronLeft, ChevronRight, Clock, GraduationCap, X, Calendar as CalendarIcon, Hash } from "lucide-react";

const CACHE_KEY = "faculty-calendar-data";

const CalendarShimmer = () => (
  <div className="pt-3 px-4 h-full bg-[#FBFBFB] flex flex-col animate-pulse">
    <HeaderComponent title="Faculty Calendar" />
    <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col mb-4 mt-4 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-slate-100 rounded"></div>
          <div className="h-4 w-20 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-200">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="py-2 flex justify-center"><div className="h-3 w-8 bg-slate-200 rounded"></div></div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="min-h-[120px] border-b border-r border-slate-50 p-2"><div className="h-5 w-5 bg-slate-100 rounded-full"></div></div>
        ))}
      </div>
    </div>
  </div>
);

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      let value = null;
      
      if (cached) {
        value = JSON.parse(cached);
        setEvents(value.data);
        setLoading(false);
      }

      try {
        const response = await getCalendar();
        if (response.success) {
          const newData = response.data;
          if (JSON.stringify(newData) !== JSON.stringify(value?.data)) {
            setEvents(newData);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: newData, timestamp: Date.now() }));
          }
        }
      } catch (err) {
        console.error("Background refresh failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getRomanYear = (sem) => {
    const year = Math.ceil(sem / 2);
    const roman = ["", "I", "II", "III", "IV"];
    return roman[year] || year;
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const d = new Date(event.dueDate);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  if (loading && events.length === 0) return <CalendarShimmer />;

  return (
    <div className="pt-3 px-4 h-full bg-[#FBFBFB] flex flex-col overflow-hidden">
      <HeaderComponent title="Faculty Calendar" />

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-4 mt-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-[#08384F] uppercase tracking-tight">
            {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
          </h2>

          <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm"></div>
              <span className="text-[9px] font-black uppercase text-slate-600">Assignment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div>
              <span className="text-[9px] font-black uppercase text-slate-600">Quiz</span>
            </div>
          </div>

          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 text-[#08384F] rounded-full transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 text-[#08384F] rounded-full transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-black text-[#08384F] uppercase tracking-widest">{d}</div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 overflow-hidden">
          {blanks.map((i) => (
            <div key={`b-${i}`} className="min-h-[120px] border-b border-r border-slate-100 bg-slate-50/20" />
          ))}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={day}
                onClick={() => dayEvents.length > 0 && setSelectedDateEvents({ day, events: dayEvents })}
                className={`min-h-[120px] max-h-[120px] border-b border-r border-slate-100 p-1 flex flex-col gap-1 transition-colors overflow-y-auto custom-scrollbar ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-slate-50/80' : ''}`}
              >
                <span className={`text-xs font-black p-1 w-7 h-7 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-[#08384F] text-white shadow-md' : 'text-slate-900 font-black'}`}>
                  {day}
                </span>
                <div className="space-y-1">
                  {dayEvents.length > 0 && (
                    <>
                      <div className={`p-1.5 rounded-md text-[9px] font-black border-l-4 shadow-sm ${dayEvents[0].type === "assignment" ? "bg-blue-50 border-blue-600 text-[#08384F]" : "bg-amber-50 border-amber-500 text-amber-900"}`}>
                        <div className="truncate uppercase mb-0.5">{dayEvents[0].title}</div>
                        <div className="flex items-center justify-between gap-1 opacity-70 font-bold border-t border-black/5 pt-0.5">
                          <span className="text-[7px] truncate uppercase">{getRomanYear(dayEvents[0].classroom.semester)}-{dayEvents[0].classroom.department?.split(" ").map((w) => w[0]).join("")}-{dayEvents[0].classroom.section}</span>
                          <div className="flex items-center gap-0.5 whitespace-nowrap"><Clock size={7}/><span>{new Date(dayEvents[0].dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                        </div>
                      </div>
                      {dayEvents.length > 1 && <div className="mt-auto text-[#08384F] text-[#08384F] text-[8px] font-black uppercase text-center py-1 rounded shadow-sm opacity-90">+ {dayEvents.length - 1} more</div>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDateEvents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08384F]/40 backdrop-blur-md transition-all">
          <div className="bg-white rounded-[2rem] w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-200">
            <div className="p-6 bg-[#08384F] text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><CalendarIcon size={120}/></div>
              <div className="relative z-10">
                <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.2em] mb-1">Schedule for</p>
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  Day {selectedDateEvents.day} <span className="text-sm opacity-40 font-medium">/ {currentDate.toLocaleString('default', { month: 'long' })}</span>
                </h3>
              </div>
              <button onClick={() => setSelectedDateEvents(null)} className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
              {selectedDateEvents.events.map((event) => (
                <div key={event.id} className="group p-5 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:border-[#08384F]/20">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${event.type === "assignment" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"}`}>
                        {event.type}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-full text-[10px] font-black text-slate-500">
                            <Clock size={12}/>
                            {new Date(event.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-black text-[#08384F] leading-none">{event.points || 0}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Points</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-black text-[#08384F] leading-tight mb-4 group-hover:text-[#08384F] transition-colors">{event.title}</h4>
                  
                  <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] font-black text-[#08384F] uppercase">
                            <div className="p-1.5 bg-slate-100 rounded-lg"><GraduationCap size={16} /></div>
                            <span>{getRomanYear(event.classroom.semester)} - {event.classroom.department} ({event.classroom.section})</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase mt-1">
                        <div className="p-1.5 bg-slate-100 rounded-lg"><Hash size={16} /></div>
                        <span className="truncate">{event.classroom.subject}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
                <div className="h-1.5 w-16 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;