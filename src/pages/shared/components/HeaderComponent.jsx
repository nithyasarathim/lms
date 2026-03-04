import React from "react";
import { User, Bell } from "lucide-react";

const HeaderComponent = ({ title }) => {
  return (
    <div className="w-full flex items-center justify-between px-6 py-5">
      <div className="flex items-center h-full">
        <h1 className="text-2xl font-semibold text-[#282526] border-b border-gray-300 pb-1">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4 h-full">
        <button className="p-2 rounded-full bg-gray-50 text-[#282526] shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 flex items-center justify-center">
          <Bell size={20} />
        </button>

        <div className="p-2 rounded-full bg-gray-50 text-[#282526] shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 flex items-center justify-center">
          <User size={20} />
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
