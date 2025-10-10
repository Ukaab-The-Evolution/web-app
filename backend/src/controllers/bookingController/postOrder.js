import { supabaseAdmin } from "../../config/supabase.js";

export const postOrder = async (req, res, next) => {
  try {
    const { shipper_id, pickup_lat, pickup_lon, required_trucks } = req.body;

    // Insert order
    const { data: order, error } = await supabaseAdmin
      .from("orders_beta")
      .insert([{ shipper_id, pickup_lat, pickup_lon, required_trucks }])
      .select();

    if (error) return next(new AppError(error.message, 400));
    // TODO: trigger outreach logic here

    res.status(200).json({
      status: "success",
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    next(err);
  }
};
