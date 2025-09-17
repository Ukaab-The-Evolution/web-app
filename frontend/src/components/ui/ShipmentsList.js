import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import shipmentsData from "../dashboard/shipments/ShipmentsData";

const ShipmentsList = ({ 
    shipments: externalShipments = [],
    showTitle = true,
    limitCount = null,
    viewMode = 'list',
    showFullDetails = false
}) => {
    
    const shipmentsToUse = externalShipments.length > 0 ? externalShipments : shipmentsData;
    const displayedShipments = limitCount ? shipmentsToUse.slice(0, limitCount) : shipmentsToUse;

    return (
        <div className="bg-white rounded-2xl p-6">
            {showTitle && (
                <h3 className="text-lg font-semibold text-[#3B6255]">Your Shipments</h3>
            )}

            {/* sending Full details to Shipment Details */}
            {showFullDetails && (
                 <div className="pr-6 pl-6 pt-4">
                {displayedShipments.map((shipment, index) => {
                    const fullShipment = shipmentsData.find(
                        (s) => s.id === shipment.id
                    );
                    return (
                        <Link
                            key={`detail-${shipment.id}-${index}`}
                            to={`/shipments/${shipment.id}`}
                            state={{ shipment: fullShipment }}
                        ></Link>
                );
            })}
                </div>
            )}
                

            {/* List View */}
            {viewMode === "list" && !showFullDetails && (
            <div className="pr-6 pl-6 pt-1 pb-1">
                <div className="space-y-3">
                    {displayedShipments.map((shipment, index) => (
                        <Link
                            key={`${shipment.id}-${index}`}
                            to={`/dashboard/shipment-details/${shipment.id}`}
                            state={{ shipmentId: shipment.id }}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 hover:rounded-lg transition cursor-pointer"
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
                        </Link>
                    ))}
                </div>
            </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && !showFullDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pr-6 pl-6">
            {displayedShipments.map((shipment, index) => (
                <Link
                key={`${shipment.id}-grid-${index}`}
                to={`/dashboard/shipment-details/${shipment.id}`}
                state={{ shipmentId: shipment.id }}
                className="bg-[#DAE8E3] shadow-lg border border-[#3B6255] rounded-xl p-6 flex flex-col hover:shadow-xl transition cursor-pointer"
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
            </Link>
        ))}
    </div>
)}
        </div>
    );
};

export default ShipmentsList;
