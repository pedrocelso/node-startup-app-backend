import { ascend, filter, find, findIndex, head, isNil, map, Ordering, pipe, prop, reject, sort } from "ramda";
import { Phase, PhaseInput, Startup, StartupInput, Task, TaskInput } from "../schema/model.js";
import { DB, fail, success } from "./db.js";

export interface DataLoad {
  startups?: Startup[]
  phases?: Phase[]
  tasks?: Task[]
}

type MapperFunction<T> = (seqNo: number) => (list: readonly T[]) => (T | null)[]
type SortFunction<T> = (a: T, b: T) => Ordering

const mapLaterPhases = (seqNo: number) => map((p: Phase) => p.seqNo > seqNo ? p : null)
const mapEarlierPhases = (seqNo: number) => map((p: Phase) => p.seqNo < seqNo ? p : null)
const bySeqNoAsc = ascend<Phase>(prop(`seqNo`));
const bySeqNoDesc = ascend<Phase>(prop(`seqNo`));

const hasNextPhase = (phase: Phase, phaseList: Phase[]) => {
  return !isNil(find(p => p.seqNo > phase.seqNo, phaseList))
}

const getSequentialPhase = (mapFn: MapperFunction<Phase>, sortFn: SortFunction<Phase>) => (seqNo: number, list: Phase[]) =>{
  return pipe(
    mapFn(seqNo),
    reject(isNil),
    sort(sortFn),
    head<Phase>,
  )(list)
}

const getLastPhase = getSequentialPhase(mapEarlierPhases, bySeqNoDesc)
const getNextPhase = getSequentialPhase(mapLaterPhases, bySeqNoAsc)

export class MemoryDB implements DB {
  startups: Startup[]
  phases: Phase[]
  tasks: Task[]
  constructor(load?: DataLoad) {
    this.startups = load?.startups ? load.startups.map(s => ({ ...s })) : []
    this.phases = load?.phases ? load.phases.map(p => ({ ...p })) : []
    this.tasks = load?.tasks ? load.tasks.map(t => ({ ...t })) : []
  }

  getStartups() {
    return this.startups
  }

  insertStartup({ name }: StartupInput) {
    const id = `${this.startups.length}`
    this.startups.push({
      id,
      name
    })
    return success(`Successfully inserted '${name}'`)
  }

  getPhases(startupId: string) {
    return filter(p => p.startupId === startupId, this.phases)
  }

  getLastPhase(startupId: string, seqNo: number): Phase {
    const phases = this.getPhases(startupId)
    return getLastPhase(seqNo, phases)!
  }

  insertPhase(input: PhaseInput) {
    const startupExists = find(s => s.id === input.startupId, this.startups)
    if (!startupExists) {
      return fail(`Cannot insert phase: startup does not exists`)
    }

    const phaseWithSameSeq = find(p => p.seqNo === input.seqNo, this.getPhases(input.startupId))
    if (phaseWithSameSeq) {
      return fail(`Cannot insert phase with same seqNo as '${phaseWithSameSeq.title}'`)
    }

    const lastPhase = this.getLastPhase(input.startupId, input.seqNo)
    const phase = {
      id:`${this.phases.length}`,
      isComplete: false,
      locked: !lastPhase.isComplete,
      ...input
    }

    this.phases.push(phase)

    return success(`Successfully inserted '${input.title}'`)
  }

  getTasks(phaseId: string) {
    return filter(t => t.phaseId === phaseId, this.tasks)
  }

  insertTask(input: TaskInput) {
    const phaseExists = find(p => p.id === input.phaseId, this.phases)
    if (!phaseExists) {
      return fail(`Cannot insert task: phase does not exists`)
    }

    const id = `${this.tasks.length}`
    this.tasks.push({
      id,
      isComplete: false,
      ...input
    })
    return success(`Successfully inserted '${input.title}'`)
  }

  completeTask(taskId: string) {
    const taskIndex = findIndex(t => t.id === taskId, this.tasks)
    if (taskIndex < 0) {
      return fail(`Task '${taskId}' does not exist`)
    }

    const task = this.tasks[taskIndex]
    if (task.isComplete) {
      return fail(`Task '${taskId}' is already marked as complete`)
    }

    this.tasks[taskIndex].isComplete = true

    const tasks = this.getTasks(task.phaseId)
    const hasOpenTasks = !isNil(find(t => !t.isComplete, tasks))
    if (!hasOpenTasks) {
      // TODO possibly handle what if completePhase goes bad (more likely to happen on a real db wheer transaction rolling back is available)
      this.completePhase(task.phaseId)
    }

    return success(`Successfully marked task '${taskId}' as complete`)
  }

  completePhase(phaseId: string): boolean {
    const index = findIndex(p => p.id == phaseId, this.phases)

    if (index < 0) {
      return false
    }

    const phase = this.phases[index]
    const startupPhases = this.getPhases(phase.startupId)
    if (hasNextPhase(phase, startupPhases)) {
      const nextPhase = getNextPhase(phase.seqNo, startupPhases)
      const nextPhaseIndex = findIndex((p) => p.id === nextPhase!.id, this.phases)
      this.phases[nextPhaseIndex].locked = false
    }
    this.phases[index].isComplete = true
    return true
  }
}

