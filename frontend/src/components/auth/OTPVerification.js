import { MdOutlineSupportAgent } from "react-icons/md";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function OTPVerification({ email }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    try {
      const res = await axios.post("/api/verify-otp", {
        email,
        otp: enteredOtp,
      });

    if (res.data.success) {
        navigate("/dashboard");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-poppins overflow-hidden">
      
      {/* Logo */}
      <div className="absolute top-4 left-16 items-center flex z-20">
        <img
          src="/images/IconGreen.png"
          alt="Ukaab Logo"
          className="w-[85px] h-[67px] mr-[-9px]"
        />
        <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
          Ukaab
        </span>
      </div>

      {/* Left Section */}
      <div className="flex justify-center w-full lg:w-1/2 px-6 sm:px-10 md:px-16 lg:px-20 py-24 bg-white">
        <div className="w-full max-w-md">
        
        {/* OTP Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-4">
            OTP Verification
        </h1>
        
        {/* Description */}
        <p
          style={{
              width: "450px",
              height: "45px",
              fontFamily: "sans-serif",
              fontWeight: 500,
              fontSize: "15px",
              lineHeight: "24px",
              color: "#5F5F5F",
              marginBottom: "25px",
            }}
        >
            We have sent you an email. Please check your inbox and enter the 6-digit OTP code.
        </p>

          {/* OTP Input Boxes */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  placeholder="0"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  className="text-center text-lg focus:outline-none"
                  style={{
                    width: "45px",
                    height: "50px",
                    borderRadius: "5px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#578C7A",
                    background: "#B2D7CA3B",
                    boxShadow: "0px 2px 0px 0px #E7EBEE33 inset",
                    color: "#3B6255",
                  }}
                />
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{
                width: "450px",
                height: "45px",
                paddingTop: "9px",
                paddingRight: "25px",
                paddingBottom: "9px",
                paddingLeft: "25px",
                borderRadius: "12px",
                background:
                  "linear-gradient(0deg, #3B6255, #578C7A), linear-gradient(353.21deg, #223931 -104.54%, #578C7A 94.65%)",
                boxShadow: "0px 4px 12px 0px #00000040",
                fontFamily: "Poppins",
                fontWeight: "600",
                fontSize: "18px",
                lineHeight: "100%",
                color: "#FFFFFF",
                marginTop: "20px",
                cursor: "pointer",
                transition: "all 0.3s ease-in",
              }}
              onMouseOver={(e) =>
                (e.target.style.background =
                  "linear-gradient(0deg, #2F4F43, #2F4F43), linear-gradient(353.21deg, #223931 -104.54%, #4A7D6D 94.65%)")
              }
              onMouseOut={(e) =>
                (e.target.style.background =
                  "linear-gradient(0deg, #3B6255, #578C7A), linear-gradient(353.21deg, #223931 -104.54%, #578C7A 94.65%)")
              }
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 relative items-center justify-center overflow-hidden h-[50vh] sm:h-[60vh] md:h-screen"
        style={{
          backgroundImage: "url('/images/bg_1.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      > 
        {/* Gradient Overlay */}
        <div className="absolute inset-0 opacity-80"
            style={{
                background: "linear-gradient(360deg, #1B2D27 0%, #508171 100%)",
                zIndex: 0,
            }}
        ></div>
        
        {/* Support Icon */}
        <div className="absolute top-5 sm:top-8 flex items-center gap-2 z-10 cursor-pointer">
          <MdOutlineSupportAgent className="text-[#F7FAFC] text-lg" />
          <span className="text-[#F7FAFC] text-lg ">Support</span>
        </div>

        {/* Ellipses */}
        <div className="absolute bottom-[-220px] right-[-80px] z-10 w-[400px] h-[400px] backdrop-blur-[1px] bg-white/20 rounded-full border border-white/30 hidden md:block lg:hidden" />
        <div className="absolute bottom-[-420px] right-[-190px] z-10 w-[750px] h-[750px] backdrop-blur-[1px] bg-white/20 rounded-full border border-white/30 hidden lg:block" />

        {/* Text Content */}
        <div className="absolute bottom-12 sm:bottom-8 left-0 sm:left-16 w-full px-12 sm:px-20 text-center z-10" >
        <div className="max-w-lg mx-auto">
            <h2 className="font-poppins font-extrabold text-[32px] sm:text-[40px] text-[#F7FAFC] leading-tight">
                Welcome to Ukaab!
            </h2>
        
            <p className="mt-4 text-white/90 text-[16px] sm:text-[18px] leading-[1.38]">
                Get started in seconds – connect with shippers, fleets, and drivers
                instantly to post requests, assign loads, and track in real time
                across one unified platform.
            </p>
        </div>
        </div>
    </div>
    </div>
  );
}

export default OTPVerification;