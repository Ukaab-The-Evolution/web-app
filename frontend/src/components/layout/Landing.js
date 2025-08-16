import { MdOutlineSupportAgent } from 'react-icons/md';
import { FaAngleDoubleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative font-poppins">
      {/* Logo */}
      <div className="
  absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center z-20
  md:top-4 md:left-16 md:transform-none
">
        <img
          src="/images/IconGreenTransparent.png"
          alt="Ukaab Logo"
          className="w-[85px] h-[67px] mr-[-9px]"
        />
        <span className="text-[25px] font-radley font-normal text-[#3B6255] leading-none">
          Ukaab
        </span>
      </div>

      {/* Left Section */}
      <div className="flex justify-center items-center p-8 sm:p-8 md:p-10 lg:px-20 pt-28 sm:pt-36 md:pt-40 lg:pt-36 lg:w-1/2 bg-white">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed text-[#333333] mb-6">
            Ready to transform your logistics?
          </h1>

          <p className="text-lg text-[#3B6255] font-semibold mb-4">Fast & Secure</p>

          <p className="text-gray-700 mb-8 mt-8">
            Welcome to Ukaab — your all-in-one logistics partner. Track, assign,
            and manage your shipments effortlessly and in real time!
          </p>

          <button
            onClick={() => navigate('/role-selection')}
            type="submit"
            className="w-full h-[45px] px-[25px] rounded-[12px] 
                       bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
                       shadow-lg font-poppins font-semibold text-[18px] leading-[100%] 
                       text-white mt-[20px] cursor-pointer transition-all duration-300 ease-in 
                       hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3"
          >
            Get Started <FaAngleDoubleRight className="text-xl" />
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative flex justify-center items-center bg-gradient-to-b from-[#578C7A] to-[#223931] lg:w-1/2 text-white p-6 sm:p-10 pt-28 lg:pt-36 overflow-hidden">

        {/* Support Icon */}
        <div className="absolute top-8 flex items-center gap-2 z-20 cursor-pointer hover:underline ">
          <MdOutlineSupportAgent className="text-white text-lg" />
          <span className="text-white text-lg">Support</span>
        </div>

        <div className="flex flex-col items-center text-center z-10 max-w-md">
          <img
            src="/images/laptop.png"
            alt="Logistics Illustration"
            className="w-full max-w-[500px] object-contain h-auto mb-8"
          />

          <h2 className="text-2xl md:text-4xl font-bold mb-4">No More Long Delays</h2>

          <p className="text-lg">
            Get your loads moving faster, smarter, and on time — every time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
