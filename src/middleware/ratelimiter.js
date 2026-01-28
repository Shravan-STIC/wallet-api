// import ratelimit from "../config/upstash.js";

// const rateLimiter = async (req, res, next) => {
//   try {
//     const { success } = await ratelimit.limit("my-rate-limit");

//     if (!success) {
//       return res.status(429).json({
//         message: "Too many requests, please try again later.",
//       });
//     }

//     next();
//   } catch (error) {
//     console.log("Rate limit error", error);
//     next(error);
//   }
// };

// export default rateLimiter;

import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // ✅ rate limit per IP (or user)
    const identifier =
      req.ip || req.headers["x-forwarded-for"] || "anonymous";

    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error);

    // ✅ ALWAYS return JSON
    return res.status(500).json({
      success: false,
      error: "Internal rate limiter error",
    });
  }
};

export default rateLimiter;
