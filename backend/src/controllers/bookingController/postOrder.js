import { supabaseAdmin } from "../../config/supabase.js";
import AppError from "../../utils/appError.js";

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
    // io.emit("offer:new", { orderId: orderData.id, trucks: selectedTrucks });

    res.status(200).json({
      status: "success",
      message: "Order placed and offers sent successfully",
      data: { order: orderData, outreachCount },
    });
  } catch (err) {
    next(err);
  }
};
