import { useEffect, useState } from "react";

const ShipmentsList = () => {
    // Dummy data (replace later with API)
    const [shipments, setShipments] = useState([
        { id: "SHP-1003", description: "Truck #B07 - Flatbed", status: "pending" },
        { id: "SHP-1004", description: "Truck #C45 - Container", status: "in transit" },
    ]);

    // 🔌 Placeholder for API call
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

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            
                <h3 className="text-lg font-semibold text-[#3B6255]">Your Shipments</h3>
           
            <div className="p-6">
                <div className="space-y-3">
                    {shipments.map((shipment) => (
                        <div
                            key={shipment.id}
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
        </div>
    );
};

export default ShipmentsList;
