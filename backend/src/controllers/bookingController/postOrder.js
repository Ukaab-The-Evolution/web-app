import { supabaseAdmin } from "../../config/supabase.js";
import AppError from "../../utils/appError.js";
import { io } from "../../index.js";

export const postOrder = async (req, res, next) => {
  try {
    const { shipper_id, pickup_lat, pickup_lon, required_trucks } = req.body;

    // 1️⃣ Insert order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders_beta")
      .insert([{ shipper_id, pickup_lat, pickup_lon, required_trucks }])
      .select()
      .single();

    if (orderError) return next(new AppError(orderError.message, 400));

    // 2️⃣ Get nearby trucks using the SQL function
    const initialRadius = 10000; // 10 km
    const { data: truckList, error: truckError } = await supabaseAdmin.rpc(
      "get_nearby_trucks",
      { pickup_lat, pickup_lon, radius_meters: initialRadius }
    );

    if (truckError) return next(new AppError(truckError.message, 400));

    // 3️⃣ Outreach logic
    const outreachCount = Math.ceil(required_trucks * 1.5);
    const selectedTrucks = truckList.slice(0, outreachCount);

    // 4️⃣ Insert offers
    const { error: offerError } = await supabaseAdmin
      .from("offers_beta")
      .insert(
        selectedTrucks.map((truck) => ({
          order_id: orderData.id,
          truck_id: truck.id,
        }))
      );

    if (offerError) return next(new AppError(offerError.message, 400));

    // 5️⃣ (Optional) Emit real-time notification via Socket.IO
    selectedTrucks.forEach((truck) => {
      io.to(`truck_${truck.id}`).emit("offer:new", {
        order_id: orderData.id,
        truck_id: truck.id,
      });
    });

    res.status(200).json({
      status: "success",
      message: "Order placed and offers sent successfully",
      data: { order: orderData, outreachCount },
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
