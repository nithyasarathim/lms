import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CustomMonthDropdown = ({
  disabled = false,
  selectedLabel = '',
  semesterOptionLabel = '',
  monthOptions = [],
  dateFrom = '',
  dateTo = '',
  onSelectSemester,
  onSelectMonth,
  onDateFromChange,
  onDateToChange,
  onApplyDateRange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setActiveSubMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdown = () => {
    setIsOpen(false);
    setActiveSubMenu(null);
  };

  const applyDateRange = () => {
    onApplyDateRange?.();
    closeDropdown();
  };

  const buttonText = selectedLabel || 'Select Period';

  return (
    <div ref={dropdownRef} className="relative w-full font-['Poppins']">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-xs text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        <span className="truncate">{buttonText}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[220px] rounded-xl border border-gray-200 bg-white py-1 text-xs shadow-2xl">
          {semesterOptionLabel && (
            <button
              type="button"
              onClick={() => {
                onSelectSemester?.();
                closeDropdown();
              }}
              className="w-full border-b border-gray-100 px-4 py-2.5 text-left font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {semesterOptionLabel}
            </button>
          )}

          <div
            className={`flex cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-2.5 transition-colors ${
              activeSubMenu === 'month'
                ? 'bg-[#08384F]/10 font-semibold text-[#08384F]'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onMouseEnter={() => setActiveSubMenu('month')}
          >
            <span>Month</span>
            <ChevronRight size={14} />
          </div>

          <div
            className={`flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors ${
              activeSubMenu === 'date'
                ? 'bg-[#08384F]/10 font-semibold text-[#08384F]'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onMouseEnter={() => setActiveSubMenu('date')}
          >
            <span>Date Range</span>
            <ChevronRight size={14} />
          </div>

          {activeSubMenu === 'month' && (
            <div
              className="absolute left-full top-0 ml-2 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
              onMouseLeave={() => setActiveSubMenu(null)}
            >
              {monthOptions.length ? (
                monthOptions.map((monthOption) => (
                  <button
                    key={monthOption.value}
                    type="button"
                    onClick={() => {
                      onSelectMonth?.(monthOption);
                      closeDropdown();
                    }}
                    className="w-full px-4 py-2 text-left text-gray-700 transition-colors hover:bg-[#08384F]/10 hover:text-[#08384F]"
                  >
                    {monthOption.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400">No months available</div>
              )}
            </div>
          )}

          {activeSubMenu === 'date' && (
            <div
              className="absolute left-full top-0 ml-2 min-w-[260px] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl"
              onMouseLeave={() => setActiveSubMenu(null)}
            >
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => onDateFromChange?.(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition-colors focus:border-[#08384F]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(event) => onDateToChange?.(event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition-colors focus:border-[#08384F]"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyDateRange}
                  className="rounded-lg bg-[#08384F] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0c4a68]"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomMonthDropdown;
