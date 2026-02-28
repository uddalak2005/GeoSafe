import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import locationUpdater from "./utils/locationUpdate.util.js";
import { startHighRiskZoneMonitor } from "./utils/highRiskZone.util.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("mongoDB connected!");
        // Start location updater (every 2s)
        setInterval(async () => {
            await locationUpdater();
        }, 10000);

        // Start high risk zone monitor (every 20s)
        startHighRiskZoneMonitor();
    })
    .catch((err) => {
        console.log("Failed to connect to mongoDB. Error : ", err.message);
    });


app.get("/", (req, res) => {
    res.send("Minesafe Backend");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`app is listening on, ${PORT}`);
})