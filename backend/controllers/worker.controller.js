import Worker from "../models/worker.model.js";

class WorkerController {
  // POST /workers → Register worker
  async createWorker(req, res) {
    try {
      const { name, workerId, helmetId, role } = req.body;
      console.log(req.body);
      const worker = new Worker({ name, workerId, helmetId, role });
      await worker.save();

      res.status(201).json({ success: true, data: worker });
    } catch (error) {
      console.log(error)
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /workers → List all workers
  async getAllWorkers(req, res) {
    try {
      const workers = await Worker.find();
      res.status(200).json({ success: true, data: workers });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /workers/:id → Get single worker + location
  async getWorkerById(req, res) {
    try {
      const { id } = req.params;
      const worker = await Worker.findById(id);

      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });
      }

      res.status(200).json({ success: true, data: worker });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // PUT /workers/:id → Update worker info
  async updateWorker(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const worker = await Worker.findByIdAndUpdate(id, updates, { new: true });

      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });
      }

      res.status(200).json({ success: true, data: worker });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /workers/:id → Remove worker
  async deleteWorker(req, res) {
    try {
      const { id } = req.params;
      const worker = await Worker.findByIdAndDelete(id);

      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Worker removed successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

const workerController = new WorkerController();
export default workerController;
