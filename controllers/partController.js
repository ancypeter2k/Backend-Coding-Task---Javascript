import Part from "../models/Part.js";
import partService from "../services/partService.js";

class PartController {
  async createPart(req, res) {
    try {
      const part = await partService.createPart(req.body);
      res.status(201).json(part);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addToInventory(req, res) {
    const { partId } = req.params;
    const { quantity } = req.body;
    try {
      const part = await partService.addToInventory(partId, quantity);
      res.status(200).json(part);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAllParts(req, res) {
    try {
      const parts = await partService.getAllParts();
      res.status(200).json(parts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new PartController();
