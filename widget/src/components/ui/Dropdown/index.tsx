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
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOnOpen = () => {
    setOpen((prevOpenStatus) => !prevOpenStatus);
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
          {options.map((option, i) => (
            <li
              key={`${option.value}-${i}`}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 focus:bg-blue-100 ${
                option.value === value ? "bg-blue-50 font-semibold" : ""
              } ${optionClassName}`}
              onClick={() => {
                onChange?.(option.value);
                setOpen(false);
                buttonRef.current?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onChange?.(option.value);
                  setOpen(false);
                  buttonRef.current?.focus();
                }
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
