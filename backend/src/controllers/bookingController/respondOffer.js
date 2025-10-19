import { supabaseAdmin } from "../../config/supabase.js";
import AppError from "../../utils/appError.js";
import { io } from "../../index.js";

export const respondOffer = async (req, res, next) => {
  try {
    const { offer_id, response } = req.body; // "accepted" or "declined"

    // 1️⃣ Update the offer
    const { data: updatedOffer, error: updateError } = await supabaseAdmin
      .from("offers_beta")
      .update({ status: response, responded_at: new Date() })
      .eq("id", offer_id)
      .select()
      .single();

    if (updateError) return next(new AppError(updateError.message, 400));

    // 2️⃣ Find the shipper_id via order_id
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders_beta")
      .select("shipper_id")
      .eq("id", updatedOffer.order_id)
      .single();

    if (orderError) return next(new AppError(orderError.message, 400));
    
    // 3️⃣ Emit to the shipper’s Socket.IO room
    io.to(`shipper_${orderData.shipper_id}`).emit("offer:responded", {
      offer_id,
      order_id: updatedOffer.order_id,
      truck_id: updatedOffer.truck_id,
      status: response,
    });

    // 4️⃣ Send response
    res.status(200).json({
      status: "success",
      message: "Responded to offer successfully and shipper notified",
    });
  } catch (err) {
    next(err);
  }
};

/*
<!DOCTYPE html>
<html>
  <body>
    <h2>Socket.IO Offer Response Test</h2>
    <pre id="log"></pre>

    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script>
      // Connect to backend
      const socket = io("http://localhost:3001"); // change if your backend runs on another port
      const shipperId = "shipper_6"; // 🧩 Replace with actual shipper ID from your DB

      socket.on("connect", () => {
        document.getElementById("log").innerText += `✅ Connected: ${socket.id}\n`;
        
        // Join shipper-specific room
        socket.emit("join", shipperId);
        document.getElementById("log").innerText += `🚪 Joined room: ${shipperId}\n`;
      });

      // Listen for offer responses
      socket.on("offer:responded", (data) => {
        document.getElementById("log").innerText += 
          `📩 Offer Response: ${JSON.stringify(data)}\n`;
      });

      socket.on("disconnect", () => {
        document.getElementById("log").innerText += `❌ Disconnected from server\n`;
      });
    </script>
  </body>
</html>
*/