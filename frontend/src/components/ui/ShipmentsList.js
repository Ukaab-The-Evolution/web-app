import { useEffect, useState } from "react";

const ShipmentsList = ({ 
    shipments: externalShipments = [],
    showTitle = true,
    limitCount = null,
    viewMode = 'list'
}) => {
    // Dummy data (replace later with API)
    const [dummyShipments] = useState([
        { id: "SHP-1001", description: "Truck #A12 - 18-Wheeler", status: "delivered", driverName: "Ali Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1002", description: "Truck #B07 - Flatbed", status: "pending", driverName: "Ahmed", driverAvatar: <img src="/images/avatar2.png" alt="Avatar 2" />, currentLocation: "Karachi" },
        { id: "SHP-1003", description: "Truck #C45 - Container", status: "pending", driverName: "Saad", driverAvatar: <img src="/images/avatar3.png" alt="Avatar 3" />, currentLocation: "Lahore" },
        { id: "SHP-1004", description: "Truck #C45 - Container", status: "in transit", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar4.png" alt="Avatar 4" />, currentLocation: "Multan" },
        { id: "SHP-1005", description: "Truck #B07 - Flatbed", status: "delivered", driverName: "Hassan", driverAvatar: <img src="/images/avatar5.png" alt="Avatar 5" />, currentLocation: "Faislabad" },
        { id: "SHP-1006", description: "Truck #G32 - Pickup", status: "delivered", driverName: "Kamran", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Karachi" },
        { id: "SHP-1007", description: "Truck #H04 - Trailer", status: "pending", driverName: "Bilal Ahmed", driverAvatar: <img src="/images/avatar2.png" alt="Avatar 2" />, currentLocation: "Lahore" },
        { id: "SHP-1008", description: "Truck #B07 - Flatbed", status: "in transit", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar3.png" alt="Avatar 3" />, currentLocation: "Islamabad" },
        { id: "SHP-1009", description: "Truck #D89 - Refrigerated", status: "delivered", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar4.png" alt="Avatar 4" />, currentLocation: "Gujranwala" },
        { id: "SHP-1010", description: "Truck #E12 - Box Truck", status: "pending", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar5.png" alt="Avatar 5" />, currentLocation: "Lahore" },
        { id: "SHP-1011", description: "Truck #F34 - Tanker", status: "in transit", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1012", description: "Truck #G56 - Dump Truck", status: "delivered", driverName: "Usman", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1013", description: "Truck #H78 - Semi Trailer", status: "pending", driverName: "Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1014", description: "Truck #I90 - Cargo Van", status: "in transit", driverName: "Ali", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1015", description: "Truck #J12 - Livestock Trailer", status: "delivered", driverName: "Saad", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Lahore" },
        { id: "SHP-10016", description: "Truck #B07 - Flatbed", status: "in transit", driverName: "Ali Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-10017", description: "Truck #D89 - Refrigerated", status: "delivered", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1018", description: "Truck #E12 - Box Truck", status: "pending", driverName: "Ali", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1019", description: "Truck #F34 - Tanker", status: "in transit", driverName: "Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1020", description: "Truck #G56 - Dump Truck", status: "delivered", driverName: "Usman", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1021", description: "Truck #H78 - Semi Trailer", status: "pending", driverName: "Ahmad", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1022", description: "Truck #I90 - Cargo Van", status: "in transit", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1023", description: "Truck #J12 - Livestock Trailer", status: "delivered", driverName: "Hadi Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Lahore" }
    ]);

    // Placeholder for API call
    useEffect(() => {
        const fetchShipments = async () => {
            try {
                // Example API call (uncomment & replace when backend ready)
                // const response = await fetch("/api/shipments");
                // const data = await response.json();
                // setShipments(data);

                console.log("API call placeholder - shipments");

            } catch (error) {
                console.error("Error fetching shipments:", error);
            }
        };

        fetchShipments();
    }, []);

    const shipmentsToUse = externalShipments.length > 0 ? externalShipments : dummyShipments;

    const displayedShipments = limitCount
        ? shipmentsToUse.slice(0, limitCount)
        : shipmentsToUse;


    return (
        <div className="bg-white rounded-2xl p-6">
            {showTitle && (
                <h3 className="text-lg font-semibold text-[#3B6255]">Your Shipments</h3>
            )}

            {/* List View */}
            {viewMode === "list" && (
            <div className="pr-6 pl-6 pt-1 pb-1">
                <div className="space-y-3">
                    {displayedShipments.map((shipment, index) => (
                        <div
                            key={`${shipment.id}-${index}`}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                        >
                           
                                <p className=" text-[#737373]">{shipment.id}</p>
                                <p className="text-sm text-[#737373]">{shipment.description}</p>
                            
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${shipment.status === "pending"
                                        ? "bg-red-100 text-red-800"
                                        : shipment.status === "in transit"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {shipment.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            )}

            {/* Grid View */}
{viewMode === "grid" && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pr-6 pl-6">
        {displayedShipments.map((shipment, index) => (
            <div
                key={`${shipment.id}-grid-${index}`}
                className="bg-[#DAE8E3] shadow-lg border border-[#3B6255] rounded-xl p-6 flex flex-col"
            >
                {/* Avatar and Name Section */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-16 h-16 rounded-full border border-[#3B6255] p-0 mb-3">
                        <span className="w-full h-full rounded-full object-cover">{shipment.driverAvatar}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-md font-bold text-[#3B6255]">{shipment.driverName}</span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                shipment.status === "pending"
                                    ? "bg-red-100 text-red-800"
                                    : shipment.status === "in transit"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                            }`}
                        >
                            {shipment.status}
                        </span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-2 text-xs text-[#3B6255]">
                    <div className="flex justify-between items-center">
                        <span className="font-normal">Shipment ID:</span>
                        <span className="text-[#3B6255] font-semibold">{shipment.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                        <span className="font-normal">Truck Info:</span>
                        <span className="text-[#3B6255] font-semibold text-right">{shipment.description}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="font-normal">Current Location:</span>
                        <span className="text-[#3B6255] font-semibold">{shipment.currentLocation}</span>
                    </div>
                </div>
            </div>
        ))}
    </div>
)}
        </div>
    );
};

export const getShipmentsData = () => {
    return [
       { id: "SHP-1001", description: "Truck #A12 - 18-Wheeler", status: "delivered", driverName: "Ali Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1002", description: "Truck #B07 - Flatbed", status: "pending", driverName: "Ahmed", driverAvatar: <img src="/images/avatar2.png" alt="Avatar 2" />, currentLocation: "Karachi" },
        { id: "SHP-1003", description: "Truck #C45 - Container", status: "pending", driverName: "Saad", driverAvatar: <img src="/images/avatar3.png" alt="Avatar 3" />, currentLocation: "Lahore" },
        { id: "SHP-1004", description: "Truck #C45 - Container", status: "in transit", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar4.png" alt="Avatar 4" />, currentLocation: "Multan" },
        { id: "SHP-1005", description: "Truck #B07 - Flatbed", status: "delivered", driverName: "Hassan", driverAvatar: <img src="/images/avatar5.png" alt="Avatar 5" />, currentLocation: "Faislabad" },
        { id: "SHP-1006", description: "Truck #G32 - Pickup", status: "delivered", driverName: "Kamran", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Karachi" },
        { id: "SHP-1007", description: "Truck #H04 - Trailer", status: "pending", driverName: "Bilal Ahmed", driverAvatar: <img src="/images/avatar2.png" alt="Avatar 2" />, currentLocation: "Lahore" },
        { id: "SHP-1008", description: "Truck #B07 - Flatbed", status: "in transit", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar3.png" alt="Avatar 3" />, currentLocation: "Islamabad" },
        { id: "SHP-1009", description: "Truck #D89 - Refrigerated", status: "delivered", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar4.png" alt="Avatar 4" />, currentLocation: "Gujranwala" },
        { id: "SHP-1010", description: "Truck #E12 - Box Truck", status: "pending", driverName: "Ali Khan", driverAvatar: <img src="/images/avatar5.png" alt="Avatar 5" />, currentLocation: "Lahore" },
        { id: "SHP-1011", description: "Truck #F34 - Tanker", status: "in transit", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1012", description: "Truck #G56 - Dump Truck", status: "delivered", driverName: "Usman", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1013", description: "Truck #H78 - Semi Trailer", status: "pending", driverName: "Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1014", description: "Truck #I90 - Cargo Van", status: "in transit", driverName: "Ali", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1015", description: "Truck #J12 - Livestock Trailer", status: "delivered", driverName: "Saad", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Lahore" },
        { id: "SHP-10016", description: "Truck #B07 - Flatbed", status: "in transit", driverName: "Ali Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-10017", description: "Truck #D89 - Refrigerated", status: "delivered", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1018", description: "Truck #E12 - Box Truck", status: "pending", driverName: "Ali", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1019", description: "Truck #F34 - Tanker", status: "in transit", driverName: "Hassan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1020", description: "Truck #G56 - Dump Truck", status: "delivered", driverName: "Usman", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1021", description: "Truck #H78 - Semi Trailer", status: "pending", driverName: "Ahmad", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1022", description: "Truck #I90 - Cargo Van", status: "in transit", driverName: "Usama Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Islamabad" },
        { id: "SHP-1023", description: "Truck #J12 - Livestock Trailer", status: "delivered", driverName: "Hadi Khan", driverAvatar: <img src="/images/avatar1.png" alt="Avatar 1" />, currentLocation: "Lahore" }
    ];
};

export default ShipmentsList;
