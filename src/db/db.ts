import { Phase, PhaseInput, Startup, StartupInput, Task, TaskInput } from "../schema/model.js";

export interface DB {
  getStartups: () => Startup[]
  insertStartup: (input: StartupInput) => Result
  getPhases: (startupId: string) => Phase[]
  insertPhase: (input: PhaseInput) => Result
  getTasks: (phaseId: string) => Task[]
  insertTask: (input: TaskInput) => Result
  completeTask: (taskId: string) => Result
}

export interface Result {
  success: boolean
  message: string
}

export const success = (message: string): Result => ({success: true, message})
export const fail = (message: string): Result => ({success: false, message})