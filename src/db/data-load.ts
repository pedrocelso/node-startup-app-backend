import { DataLoad } from "./memory/memory.js";

export const load: DataLoad = {
  startups: [
    { id: "0", name: "xpto" }
  ],
  phases: [
    { id: "0", startupId: "0", title: "Foundation", seqNo: 0, description: "", isComplete: true, locked: false },
    { id: "1", startupId: "0", title: "Discovery", seqNo: 1, description: "", isComplete: false, locked: false },
    { id: "2", startupId: "0", title: "Delivery", seqNo: 2, description: "", isComplete: false, locked: true }
  ],
  tasks: [
    { id: "0", phaseId: "0", title: "Setup virtual office", description: "", isComplete: true },
    { id: "1", phaseId: "0", title: "Set mission & vision", description: "", isComplete: true },
    { id: "2", phaseId: "0", title: "Select business name", description: "", isComplete: true },
    { id: "3", phaseId: "0", title: "Buy domains", description: "", isComplete: true },
    { id: "4", phaseId: "1", title: "Create roadmap", description: "", isComplete: true },
    { id: "5", phaseId: "1", title: "Competitor analysis", description: "", isComplete: false },
    { id: "6", phaseId: "2", title: "Release marketing website", description: "", isComplete: false },
    { id: "7", phaseId: "2", title: "Release MVP", description: "", isComplete: false }
  ]
}