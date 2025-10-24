interface DummyIconProps {
  className?: string;
}

const DummyIcon = ({ className = "w-6 h-6" }: DummyIconProps) => {
  return (
    <svg
      className={className}
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="5" y="5" width="40" height="40" rx="12" fill="#E5EEFB" />
      <path
        d="M16 25h18M25 16v18"
        stroke="#276EF1"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DummyIcon;
