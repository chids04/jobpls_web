import { type GenerateReq, GenerateResp, SERVER_URL } from "./types";
import axios from "axios";

export async function sendGenerate(req: GenerateReq): Promise<string> {
  try {
    const response = await axios.post(`${SERVER_URL}/generate`, req);

    // check for successful response
    if (response.status !== 202) {
      throw new Error(`unexpected status code: ${response.status}`);
    }

    // axios automatically parses json, no need for JSON.parse
    const { job_id } = response.data as GenerateResp;

    if (!job_id) {
      throw new Error("missing job_id in response");
    }

    return job_id;
  } catch (error) {
    // re-throw axios errors with better messages
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // server responded with error status
        throw new Error(
          `server error ${error.response.status}: ${error.response.statusText}`,
        );
      } else if (error.request) {
        // network error
        throw new Error("network error: unable to reach server");
      }
    }

    // re-throw any other errors (including our custom ones above)
    throw error;
  }
}

async function formatCV(pdf: ArrayBuffer) {}
