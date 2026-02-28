import Worker from "../models/worker.model.js";

class LocationController {
    // POST /locations → Update worker's current location
    async updateLocation(req, res) {
        try {
            const { workerId, helmetId, lat, lng } = req.body;

            console.log("Looking for workerId:", workerId, "helmetId:", helmetId);

            const worker = await Worker.findOneAndUpdate(
                { $or: [{ workerId }, { helmetId }] }, // find by either ID
                {
                    $set: {
                        currentLocation: {
                            type: "Point",
                            coordinates: [lng, lat],
                            timeStamp: new Date()
                        },
                        lastUpdated: new Date()
                    }
                },
                { new: true } // return updated worker
            );

            console.log(worker);

            if (!worker) {
                return res.status(404).json({ message: "Worker not found" });
            }

            res.status(200).json({
                message: "Location updated successfully",
                worker
            });
        } catch (err) {
            res.status(500).json({ error: err.message });

        }

    }

    // GET /locations/:id → Get current location of worker
    async getLocation(req, res) {
        try {
            const { id } = req.params;
            const worker = await Worker.findOne({ workerId: id });

            if (!worker) {
                return res.status(404).json({ message: "Worker not found" });
            }

            res.json({
                workerId: worker.workerId,
                name: worker.name,
                role: worker.role,
                currentLocation: worker.currentLocation,
                lastUpdated: worker.lastUpdated
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

const locationController = new LocationController();
export default locationController;