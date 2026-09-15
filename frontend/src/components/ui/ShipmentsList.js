import { Link } from 'react-router-dom';

const ShipmentsList = ({ shipments = [], showTitle = true, limitCount = null, viewMode = 'list' }) => {
  const displayedShipments = limitCount ? shipments.slice(0, limitCount) : shipments;

  return (
    <div className="rounded-2xl bg-white p-6">
      {showTitle && <h3 className="text-lg font-semibold text-[#3B6255]">Your Shipments</h3>}
      {displayedShipments.length === 0 && <p className="mt-4 text-sm text-gray-500">No shipments available.</p>}
      {viewMode === 'grid' ? (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedShipments.map((shipment) => (
            <Link key={shipment.id} to={`/dashboard/shipment-details/${shipment.id}`} className="rounded-xl border border-[#3B6255] bg-[#DAE8E3] p-6 shadow-lg transition hover:shadow-xl">
              <p className="font-semibold text-[#3B6255]">{shipment.description || shipment.cargo_type || 'Load request'}</p>
              <p className="mt-2 text-xs text-[#3B6255]">{shipment.origin} → {shipment.destination}</p>
              <p className="mt-3 text-xs capitalize text-[#3B6255]">{shipment.status || 'open'}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {displayedShipments.map((shipment) => (
            <Link key={shipment.id} to={`/dashboard/shipment-details/${shipment.id}`} className="flex items-center justify-between gap-4 rounded-lg border-b border-gray-100 px-2 py-3 transition hover:bg-gray-50">
              <span className="text-sm text-[#737373]">{shipment.id}</span>
              <span className="flex-1 text-sm text-[#737373]">{shipment.description || shipment.cargo_type || 'Load request'}</span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium capitalize text-green-800">{shipment.status || 'open'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShipmentsList;
