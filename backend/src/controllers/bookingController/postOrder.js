import { supabaseAdmin } from "../../config/supabase.js";
import AppError from "../../utils/appError.js";
import { io } from "../../index.js";

export const postOrder = async (req, res, next) => {
  try {
    const { shipper_id, pickup_lat, pickup_lon, required_trucks } = req.body;

    // 🟢 1️⃣ Insert the new order into DB
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders_beta")
      .insert([{ shipper_id, pickup_lat, pickup_lon, required_trucks }])
      .select()
      .single();

    if (orderError) return next(new AppError(orderError.message, 400));

    // 🟡 2️⃣ Calculate outreach target (1.5x trucks)
    const outreachCount = Math.ceil(required_trucks * 1.5);

    // 🟠 3️⃣ Search for nearby trucks with fixed radius steps
    const radiusSteps = [10000, 20000, 40000, 50000]; // meters
    let truckList = [];
    let radiusUsed = radiusSteps[0];

    for (const radius of radiusSteps) {
      const { data, error } = await supabaseAdmin.rpc("get_nearby_trucks", {
        pickup_lat,
        pickup_lon,
        radius_meters: radius,
      });

      if (error) return next(new AppError(error.message, 400));

      // Store found trucks and radius used
      truckList = data;
      radiusUsed = radius;

      // If enough trucks found, stop expanding
      if (truckList.length >= outreachCount) break;
    }

    // 🔴 4️⃣ Handle case: still not enough trucks found
    if (truckList.length === 0) {
      return next(new AppError("No trucks found even after expanding search radius", 404));
    }

    // (Optional) If still not enough trucks, continue with whatever found
    // 🟢 5️⃣ Select trucks (closest ones first)
    const selectedTrucks = truckList.slice(0, outreachCount);

    // 🟡 6️⃣ Insert offers for selected trucks
    const { error: offerError } = await supabaseAdmin
      .from("offers_beta")
      .insert(
        selectedTrucks.map((truck) => ({
          order_id: orderData.id,
          truck_id: truck.id,
        }))
      );

    if (offerError) return next(new AppError(offerError.message, 400));

    // 🟠 7️⃣ Emit real-time notifications to each truck’s room
    selectedTrucks.forEach((truck) => {
      io.to(`truck_${truck.id}`).emit("offer:new", {
        order_id: orderData.id,
        truck_id: truck.id,
      });
    });

    // 🟢 8️⃣ Send success response
    res.status(200).json({
      status: "success",
      message: "Order placed and offers sent successfully",
      data: {
        order: orderData,
        outreachCount,
        trucksFound: selectedTrucks.length,
        radiusUsed
      },
    });
  } catch (err) {
    next(err);
  }
};

/*
CLIENT TEST HTML (socket.html)

<!DOCTYPE html>
<html>
  <body>
    <h2>Socket.IO Offer Test</h2>
    <pre id="log"></pre>

    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
      const socket = io("http://localhost:3001");
      const truckId = "truck_d348474f-6f65-4a30-89ae-90423771883d";

      socket.on("connect", () => {
        document.getElementById("log").innerText += `✅ Connected: ${socket.id}\n`;
        socket.emit("join", truckId);
      });

      socket.on("offer:new", (data) => {
        document.getElementById("log").innerText += `📦 Offer received: ${JSON.stringify(data)}\n`;
      });
    </script>
  </body>
</html>
*/
