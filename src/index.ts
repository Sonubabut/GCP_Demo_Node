import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import { GenAI } from "./services/fastapi.service";

const PORT = process.env.PORT || 5000;

class Server {
  private app: express.Application;
  private genai?: GenAI;

  constructor() {
    this.app = express();

    // Middleware
    this.app.use(express.json());
    this.app.use(cors()); // Enable CORS

    // Initialize AI Service
    this.genai = new GenAI();

    // Routes
    this.routes();

    // Start the server
    this.listen();
  }

  private routes() {
    this.app.post("/fast/response", (req: Request, res: Response) => {
      this.getResponseGenAI(req, res);
    });
  }

  private async getResponseGenAI(req: Request, res: Response) {
    try {
      if (!this.genai) {
        throw new Error("GenAI service is not initialized");
      }

      const question = req.body.question;
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      const response = await this.genai.getFastapiResponse(question);
      res.json({ response });
    } catch (error) {
      console.error("Error in getResponseGenAI:", error);
      res.status(500).json({ error: "Sorry!! I'm Busted" });
    }
  }

  private listen() {
    this.app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });
  }
}

new Server();
