// import express from "express";
// import dotenv from "dotenv";
// import { initDB } from "./config/db.js";
// import rateLimiter from "./middleware/rateLimiter.js";

// import transactionsRoute from "./routes/transactionsRoute.js";
// import job from "./config/cron.js";

// dotenv.config();

// const app = express();

// if (process.env.NODE_ENV === "production") job.start();

// // middleware
// app.use(rateLimiter);
// app.use(express.json());

// // our custom simple middleware
// // app.use((req, res, next) => {
// //   console.log("Hey we hit a req, the method is", req.method);
// //   next();
// // });

// const PORT = process.env.PORT || 5001;

// app.get("/api/health", (req, res) => {
//   res.status(200).json({ status: "ok" });
// });

// app.use("/api/transactions", transactionsRoute);

// initDB().then(() => {
//   app.listen(PORT, () => {
//     console.log("Server is up and running on PORT:", PORT);
//   });
// });
import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();

// start cron only in production
if (process.env.NODE_ENV === "production") job.start();

// ✅ ALWAYS parse JSON first
app.use(express.json());

// ✅ then apply rate limiter
app.use(rateLimiter);

const PORT = process.env.PORT || 5001;

// health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// routes
app.use("/api/transactions", transactionsRoute);

// ✅ GLOBAL ERROR HANDLER (CRITICAL)
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// start server after DB init
// initDB().then(() => {
//   app.listen(PORT, "0.0.0.0", () => {
//     console.log("Server is up and running on PORT:", PORT);
//   });
// });
// start server after DB init

initDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server LISTENING on 0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB INIT FAILED:", err);
    process.exit(1);
  });

