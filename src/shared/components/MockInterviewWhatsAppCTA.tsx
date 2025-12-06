import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const interviewOptions = [
  { value: "elevator-pitch", label: "Elevator Pitch" },
  { value: "competency-interview", label: "Competency Interview" },
  { value: "technical-interview", label: "Technical Interview" },
  { value: "final-review", label: "Final Review" }
];

export default function MockInterviewWhatsAppCTA() {
  const [selectedOption, setSelectedOption] = useState(interviewOptions[0].value);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const number = "918486242054";
  const selectedLabel = interviewOptions.find(opt => opt.value === selectedOption)?.label || "Elevator Pitch";
  const msg = `Hi Team, I want to schedule a call for *${selectedLabel}*.`;
  const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center rounded-l-xl px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:shadow-md bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {selectedLabel}
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-10">
              {interviewOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedOption(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg text-gray-900 dark:text-gray-100"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-r-xl px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5 hover:shadow-md bg-green-600 text-white hover:bg-green-700"
        >
          Book a Call
        </a>
      </div>
    </div>
  );
}
