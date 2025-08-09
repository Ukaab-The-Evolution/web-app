import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

export default function Toast({ type = "success", message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: {
      bg: "#578c7a",
      icon: <FaCheckCircle className="text-white text-lg" />,
      title: "Success",
    },
    error: {
      bg: "#578c7a",
      icon: <FaExclamationCircle className="text-white text-lg" />,
      title: "Error",
    },
  };

  return (
    <div
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 text-white animate-slide-in w-[320px] sm:w-[400px]"
      style={{ backgroundColor: styles[type].bg }}
    >
      {styles[type].icon}
      <div className="flex flex-col">
        <span className="font-semibold">{styles[type].title}</span>
        <span className="text-sm opacity-90">{message}</span>
      </div>
    </div>
  );
}
