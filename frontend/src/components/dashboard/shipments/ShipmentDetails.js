import React, { useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaChevronLeft, FaPhone, FaMapMarkerAlt, FaClock, FaCheck, FaTruck } from "react-icons/fa";
import shipmentsData from "./ShipmentsData";

const formatDateTime = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string" && raw.includes(" at ")) return raw;

  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(2);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} at ${hours}:${minutes} ${ampm}`;
  } catch {
    return raw;
  }
};

const ShipmentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const shipmentId = location.state?.shipmentId || id;
  const shipment = shipmentsData.find((s) => String(s.id) === String(id));

  if (!shipment) {
    return <p className="text-red-500">Shipment not found</p>;
  }

  const shippingCode = shipment.shippingCode || shipment.shippingCode || shipment.code || `CODE-${shipment.id || ""}`;
  const capacityRaw = shipment.capacity || shipment.spaceCapacity || shipment.capacityPercent || "60%";
  const capacityPercent = Number(String(capacityRaw).replace("%", "")) || 60;
  const driverId = shipment.driverId || shipment.driver_id || shipment.driver || "—";
  const weight = shipment.weight || shipment.weightKg || shipment.kg || shipment.weightInKg || shipment.weight || "—";
  const cargoType = shipment.cargoType || shipment.cargo_type || shipment.cargo || shipment.title || "—";
  const origin = shipment.origin || shipment.from || "Unknown";
  const destination = shipment.destination || shipment.to || "Unknown";
  const paymentStatus = shipment.paymentStatus || shipment.payment_status || shipment.statusPayment || (shipment.status?.toLowerCase() === "delivered" ? "Paid" : "Unpaid");
  const eta = shipment.eta || shipment.estimatedDelivery || shipment.date || "—";

  const trackingHistory = shipment.trackingHistory || shipment.tracking_history || (
    shipment.tracking ? shipment.tracking : null
  ) || [
    { status: "Order Received", time: formatDateTime(shipment.arrival || shipment.date || new Date().toISOString()) },
    { status: "On Route", time: formatDateTime(shipment.onRoute || new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString()) },
    { status: "Departure", time: formatDateTime(shipment.departure || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()) },
  ];

  const truckImageSrc = "/images/truck.png";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-6 mb-4 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-lg bg-none flex items-center justify-center text-[#3B6255] hover:bg-gray-100"
          aria-label="Back"
        >
          <FaChevronLeft />
        </button>

        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#3B6255] font-poppins">{shipment.id ? `${shipment.id} Details` : "Shipment Details"}</h1>
          <p className="text-sm text-[#3B6255] font-medium">Track everything about you shipment</p>
        </div>
      </div>

      {/* Top Card: Truck image + Shipment Information */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-col lg:flex-row gap-0 justify-center">
        {/* Left: Truck Image Area */}
        <div className="w-full lg:w-2/3 relative flex items-center justify-center p-0">
          {/* Badge */}
          <div className="absolute top-2 items-center bg-[#3B6255] text-white px-4 py-2 rounded-md shadow">
            <div className="text-xs font-medium">Your Truck Here!</div>
            <div className="text-[11px] opacity-90">Shipping Code: {shippingCode}</div>
          </div>

          <img
            src={truckImageSrc}
            alt="Truck"
            className="max-w-full h-auto object-contain rounded mt-12"
            style={{ maxHeight: 220 }}
            onError={(e) => {
              e.target.style.opacity = 0.6;
            }}
          />
        </div>

        {/* Right: Shipment Information */}
        <div className="w-full lg:w-1/3 flex flex-col gap-2">
          {/* Card */}
          <div className="bg-white rounded-xl p-2">
            <div className="mb-3 text-md text-[#2F313B] font-semibold">Shipment Information</div>

            {/* Capacity */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between">
                <div className="text-xs text-[#A3A3A3]">Space Capacity (%)</div>
                <div className="text-sm font-semibold text-[#2674E9]">{`${capacityPercent}%`}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className="h-1 bg-[#2674E9]"
                  style={{ width: `${Math.min(100, capacityPercent)}%`, transition: "width 400ms ease" }}
                />
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs text-[#2F313B]">
                {/* Left Column */}
                <div>
                    <div className="text-[#A3A3A3]">Shipment ID</div>
                    <div className="font-semibold">{shipment.id || "—"}</div>
                </div>
                <div>
                    <div className="text-[#A3A3A3]">Driver ID</div>
                    <div className="font-semibold">{driverId}</div>
                </div>

                <div>
                    <div className="text-[#A3A3A3]">Weight (KG)</div>
                    <div className="font-semibold">{weight}</div>
                </div>
                <div>
                    <div className="text-[#A3A3A3]">Cargo Type</div>
                    <div className="font-semibold">{cargoType}</div>
                </div>

                <div>
                    <div className="text-[#A3A3A3]">Origin</div>
                    <div className="font-semibold">{origin}</div>
                </div>
                <div>
                    <div className="text-[#A3A3A3]">Destination</div>
                    <div className="font-semibold">{destination}</div>
                </div>

                <div>
                    <div className="text-[#A3A3A3]">Payment Status</div>
                    <div
                        className={`font-semibold ${
                            paymentStatus?.toLowerCase() === "paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                    >
                        {paymentStatus}
                    </div>
                </div>
                <div>
                    <div className="text-[#A3A3A3]">ETA</div>
                    <div className="font-semibold">{formatDateTime(eta)}</div>
                </div>
            </div>
            </div>
            </div>
        </div>

      {/* Bottom Section: Tracking History + Map View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tracking History */}
        <div className="bg-white rounded-2xl p-4 pl-6 pr-6 shadow">
          <h3 className="text-md font-semibold text-[#2F313B] mb-6">Tracking History</h3>

          <div className="space-y-6">
            {trackingHistory.map((ev, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                {/* Left side - Icon and connecting line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#F5F9FF] flex items-center justify-center text-[#3B6255]">
                    {idx === 0 ? <FaTruck className="w-5 h-5" /> : 
                      idx === trackingHistory.length - 1 ? <FaMapMarkerAlt className="w-5 h-5" /> : 
                      <FaTruck className="w-5 h-5" />
                    }
                  </div>
                  {idx !== trackingHistory.length - 1 && (
                    <div className="w-px bg-[#D7D9DD] h-20 mt-1" />
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1">
                  {/* Status and Action Icons */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-[#2F313B]">{ev.status}</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#F6F7F9] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#3B6255]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#F6F7F9] flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#3B6255]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
          
                  {/* Date/Time */}
                  <div className="text-xs text-[#A3A3A3] mb-3">
                    {formatDateTime(ev.time)}
                  </div>

                  {/* Location with marker icon */}
                  <div className="flex items-start">
                    <div className="flex justify-center mt-1 rounded-lg bg-[#F6F7F9] p-3">
                      <FaMapMarkerAlt className="w-3 h-3 mt-1 mr-1 text-[#2F313B]" />
                    <div>
                      <div className="font-medium text-sm text-[#2F313B]">
                        {ev.location || (idx === 0 ? origin : (idx === trackingHistory.length - 1 ? destination : ""))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ev.note || `your package delivered in the city of ${destination}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="bg-none rounded-2xl p-0 flex flex-col">
          <div className="flex items-center justify-between px-2 mb-2 mt-3">
            <h3 className="text-md font-semibold text-[#2F313B]">Map View</h3>
          </div>

          <div className="flex-1 rounded-lg overflow-hidden">
            <iframe
              title="Shipment route map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(origin)}&output=embed`}
              style={{ width: "100%", height: "100%", minHeight: 360, border: 0 }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetails;
