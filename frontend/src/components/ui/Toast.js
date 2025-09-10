import React , {useEffect} from "react";
import { connect } from "react-redux";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";
import { REMOVE_ALERT } from "../../actions/types";

const Toast = ({ alerts, dispatch }) => {
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const timers = alerts.map(alert =>
        setTimeout(() => {
          dispatch({ type: REMOVE_ALERT, payload: alert.id });
        }, 3000)
      );
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [alerts, dispatch]);

  const styles = {
    success: {
      bg: "bg-green-600",
      icon: <FaCheckCircle className="text-white text-xl" />,
      title: "Success",
    },
    error: {
      bg: "bg-red-600",
      icon: <FaExclamationCircle className="text-white text-xl" />,
      title: "Error",
    },
    info: {
      bg: "bg-blue-600",
      icon: <FaInfoCircle className="text-white text-xl" />,
      title: "Info",
    },
  };

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-3 w-[320px] sm:w-[400px]">
      {alerts.map(alert => {
        const style = styles[alert.alertType] || styles.info;
        return (
          <div
            key={alert.id}
            className={`shadow-lg rounded-lg px-4 py-3 flex items-center gap-3 text-white animate-slide-in ${style.bg}`}
          >
            {style.icon}
            <div className="flex flex-col flex-1">
              <span className="font-semibold">{style.title}</span>
              <span className="text-sm opacity-90 break-words">{alert.msg}</span>
            </div>
            <button
              className="ml-2 text-white opacity-70 hover:opacity-100"
              onClick={() => dispatch({ type: REMOVE_ALERT, payload: alert.id })}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

const mapStateToProps = state => ({
  alerts: state.alert,
});

export default connect(mapStateToProps)(Toast);
