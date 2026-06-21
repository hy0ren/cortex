import { createClient } from "@deepgram/sdk";
import { config } from "dotenv";
config({ path: ".env.local" });

async function run() {
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  try {
    const { result: projectsResult, error: projectsError } = await deepgram.manage.getProjects();
    if (projectsError) throw projectsError;
    const project = projectsResult?.projects?.[0];
    if (!project) throw new Error("No projects found");
    
    console.log("Project ID:", project.project_id);
    
    const { result: keyResult, error: keyError } = await deepgram.manage.createProjectKey(project.project_id, {
      comment: "Temp client token",
      scopes: ["usage:write"], // Required for transcription
      time_to_live_in_seconds: 600,
    });
    
    if (keyError) throw keyError;
    console.log("Temporary token:", keyResult?.key);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
