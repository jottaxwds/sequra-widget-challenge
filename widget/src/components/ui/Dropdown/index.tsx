import React, { useState, useRef, useEffect } from "react";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  onDropdownOpen?: () => void;
  placeholder?: string;
  className?: string;
  optionClassName?: string;
  menuClassName?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  optionClassName = "",
  menuClassName = "",
  onDropdownOpen,
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener("mousedown", handleClick);
    }
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      
      if (e.key === "Escape") {
        setOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : options.length - 1
        );
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        onChange?.(options[highlightedIndex].value);
        setOpen(false);
        setHighlightedIndex(-1);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, highlightedIndex, options, onChange]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOnOpen = () => {
    setOpen((prevOpenStatus) => {
      if (!prevOpenStatus) {
        // Reset highlighted index when opening
        setHighlightedIndex(-1);
      }
      return !prevOpenStatus;
    });
    onDropdownOpen?.();
  }

  return (
    <div className={`relative inline-block w-full ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={handleOnOpen}
        className="w-full flex justify-between items-center px-4 py-2 border border-gray-300 bg-white rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={selectedOption ? "" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul
          ref={menuRef}
          tabIndex={-1}
          role="listbox"
          className={`absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto outline-none ${menuClassName}`}
        >
          {options.map((option, i) => {
            const isSelected = option.value === value;
            const isHighlighted = i === highlightedIndex;
            
            return (
              <li
                key={`${option.value}-${i}`}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`px-4 py-2 cursor-pointer font-normal no-underline ${
                  isHighlighted 
                    ? "bg-blue-200" 
                    : isSelected 
                      ? "bg-blue-50" 
                      : "hover:bg-blue-100"
                } ${optionClassName}`}
                onMouseEnter={() => setHighlightedIndex(i)}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                  setHighlightedIndex(-1);
                  buttonRef.current?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onChange?.(option.value);
                    setOpen(false);
                    setHighlightedIndex(-1);
                    buttonRef.current?.focus();
                  }
                }}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
