import "dotenv/config.js";
import app from "./src/app.js"; // app ho skata hei fastify, ya express se aa rha ho to hame abh iss file me koi mtlb nahi hai
import connectDB from "./src/common/config/db.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
  //TODO: connect to DB
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `Server is listening at ${PORT} in ${process.env.NODE_ENV} mode`,
    );
  });
};

start().catch((err) => {
  console.error("failed to start the server", err);
  process.exit(1);
});
