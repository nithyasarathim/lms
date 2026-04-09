import React from 'react';
import { FileDown, ChevronLeft, PartyPopper, Sparkles } from 'lucide-react';

const CoursePlanReview = ({ onGenerate, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center border-4 border-green-100 shadow-inner">
          <PartyPopper size={48} />
        </div>
        <Sparkles className="absolute -top-2 -right-2 text-yellow-500 animate-pulse" />
      </div>

      <div>
        <h2 className="text-3xl font-black text-[#08384F]">Finish & Review</h2>
        <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">
          All steps are completed. You can review your entries or proceed to
          generate the final document.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
        <button
          onClick={onGenerate}
          className="w-full flex items-center justify-center gap-2 bg-[#08384F] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-[#0a4661] transition-all active:scale-95"
        >
          <FileDown size={20} /> GENERATE DOCUMENT
        </button>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 text-gray-500 font-bold py-3 hover:text-[#08384F] transition-colors"
        >
          <ChevronLeft size={18} /> Go Back to Edit
        </button>
      </div>
    </div>
  );
};

export default CoursePlanReview;
