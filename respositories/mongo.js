import mongoose from "mongoose";

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true }
);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function() {
  console.log(
    "[MONGO] - Mongoose successfully connected to " + process.env.MONGODB_URI
  );
});

// If the connection throws an error
mongoose.connection.on("error", function(err) {
  console.log("[MONGO] - Mongoose connection error: " + err);
});

// When the connection is disconnected
mongoose.connection.on("disconnected", function() {
  console.log("[MONGO] - Mongoose connection disconnected");
});
