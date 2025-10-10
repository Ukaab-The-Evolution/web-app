import { supabaseAdmin } from "../../config/supabase.js";

export const respondOffer = async (req, res, next) => {
  try {
    const { offer_id, response } = req.body; // "accepted" or "declined"

    const { error } = await supabaseAdmin
      .from("offers_beta")
      .update({ status: response, responded_at: new Date() })
      .eq("id", offer_id);

    if (error) return next(new AppError(error.message, 400));

    res.status(200).json({
      status: "success",
      message: "Responded to offer successfully",
    });
  } catch (err) {
    next(err);
  }
};
