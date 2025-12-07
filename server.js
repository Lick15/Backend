import express from "express";
import cors from "cors";
import keyRoute from "./routes/key.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", keyRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
