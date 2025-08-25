const DashboardStatsCard = ({ icon, title, value}) => {
    return (
        <div className="bg-gradient-to-r from-[#578C7A] to-[#385e51] text-white p-6 rounded-xl shadow-lg shadow-gray-300 hover:shadow-2xl transition-shadow duration-300 font-poppins">
            <div className="flex items-center">
                <div className="bg-white text-[#3B6255] text-3xl
                 w-12 h-12 p-3 rounded-xl mr-4 
                    flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <p className="text-sm opacity-90">{title}</p>
                    <p className="text-xl mt-1">{value}</p>
                </div>
            </div>
        </div>

    );
};

export default DashboardStatsCard;