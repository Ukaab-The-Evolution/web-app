import { supabaseAdmin } from "../../config/supabase.js";

export const truckLocationUpdate = async (req, res, next) => {
  try {
    const { truck_id, lat, lon } = req.body;

    const { error } = await supabaseAdmin
      .from("trucks_beta")
      .update({ current_lat: lat, current_lon: lon, last_updated: new Date() })
      .eq("id", truck_id);

    if (error) return next(new AppError(error.message, 400));

    res.status(200).json({
      status: "success",
      message: "Truck's location updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
