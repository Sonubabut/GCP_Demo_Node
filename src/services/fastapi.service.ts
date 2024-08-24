import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export class GenAI {
  constructor() {}

  async getFastapiResponse(prompt: string) {
    if (!prompt || prompt.trim() === "") {
      return "Please enter a valid query";
    }
    // console.log(`prompt`, prompt);
    const requestBody = {
      messages: [
        { role: "system", content: "You are a helpful assistant" },
        { role: "user", content: prompt },
      ],
      stop: ["<|eot_id|>"],
      model: "llama3-405b",
      stream: true,
      stream_options: { include_usage: true },
    };

    const API_KEY = process.env.API_KEY;
    const URL = process.env.API_URL;

    // console.log("1---", API_KEY, URL);
    if (!API_KEY || !URL) {
      throw new Error(
        "API_KEY and API_URL must be set in environment variables"
      );
    }

    try {
      const response = await axios.post(URL, requestBody, {
        headers: {
          Authorization: `Basic ${API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      });

      let responseData = "";
      let finalResponse = "";

      response.data.on("data", (chunk: Buffer) => {
        responseData += chunk.toString();
      });

      return new Promise<string>((resolve, reject) => {
        response.data.on("end", () => {
          console.log("Response ended");
          // console.log("Raw Response Data:", responseData); // Log the raw response data

          // Split the raw response data into chunks based on newline and process each chunk
          const chunks = responseData
            .split("\n\n")
            .filter((chunk) => chunk.startsWith("data: "));
          // console.log("Chunks after split and filter:", chunks); // Log the filtered chunks

          let responseText = "";

          for (const chunk of chunks) {
            try {
              // Clean and parse each JSON chunk
              const jsonChunk = chunk.replace(/^data: /, "");
              if (jsonChunk === "[DONE]") {
                break; // End processing if we encounter the [DONE] token
              }
              const parsedData = JSON.parse(jsonChunk);

              // Extract content from choices
              if (parsedData.choices && parsedData.choices.length > 0) {
                const content = parsedData.choices
                  .map((choice: any) => choice.delta?.content || "")
                  .join("");
                responseText += content;
              }
            } catch (error) {
              console.error("Error parsing JSON chunk:", error);
            }
          }

          // console.log("Final Response Text:", responseText);
          resolve(responseText || "No meaningful response data found.");
        });

        response.data.on("error", (err: any) => {
          console.error("Streaming error:", err);
          reject(err);
        });
      });
    } catch (error) {
      console.error("Error making request:", error);
      throw error; // Propagate the error if necessary
    }
  }
}
