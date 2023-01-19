import {
  ascend,
  find,
  forEach,
  head,
  isEmpty,
  isNil,
  map,
  Ordering,
  pipe,
  prop,
  reject,
  sort
} from 'ramda';

import { Phase, PhaseInput, Startup, StartupInput, Task, TaskInput } from '../../schema/model.js';
import { DB, fail, success } from '../db.js';
import { Storage } from './storage.js';

export interface DataLoad {
  startups?: Startup[];
  phases?: Phase[];
  tasks?: Task[];
}

type MapperFunction<T> = (seqNo: number) => (list: readonly T[]) => (T | null)[];
type SortFunction<T> = (a: T, b: T) => Ordering;

const mapLaterPhases = (seqNo: number) => map((p: Phase) => (p.seqNo > seqNo ? p : null));
const mapEarlierPhases = (seqNo: number) => map((p: Phase) => (p.seqNo < seqNo ? p : null));
const bySeqNoAsc = ascend<Phase>(prop(`seqNo`));
const bySeqNoDesc = ascend<Phase>(prop(`seqNo`));

const hasNextPhase = (phase: Phase, phaseList: Phase[]) => {
  return !isNil(find((p) => p.seqNo > phase.seqNo, phaseList));
};

const getSequentialPhase =
  (mapFn: MapperFunction<Phase>, sortFn: SortFunction<Phase>) => (seqNo: number, list: Phase[]) => {
    return pipe(mapFn(seqNo), reject(isNil), sort(sortFn), head<Phase>)(list);
  };

export type PhaseDBInput = Omit<Phase, `id`>;
export type TaskDBInput = Omit<Task, `id`>;

const getLastPhase = getSequentialPhase(mapEarlierPhases, bySeqNoDesc);
const getNextPhase = getSequentialPhase(mapLaterPhases, bySeqNoAsc);

export class MemoryDB implements DB {
  startups: Storage<Startup, StartupInput>;
  phases: Storage<Phase, PhaseDBInput>;
  tasks: Storage<Task, TaskDBInput>;
  constructor(load?: DataLoad) {
    this.startups = new Storage<Startup, StartupInput>(load?.startups);
    this.phases = new Storage<Phase, PhaseDBInput>(load?.phases);
    this.tasks = new Storage<Task, TaskDBInput>(load?.tasks);
  }

  getStartups() {
    return this.startups.getAll();
  }

  insertStartup(input: StartupInput) {
    const result = this.startups.insert(input);
    if (!result) {
      return fail(`Failed to insert '${input.name}'`);
    }
    return success(`Successfully inserted '${input.name}'`);
  }

  getPhases(startupId: string) {
    return this.phases.where({ startupId: startupId });
  }

  getLastPhase(startupId: string, seqNo: number): Phase | undefined {
    const phases = this.getPhases(startupId);
    return getLastPhase(seqNo, phases);
  }

  insertPhase(input: PhaseInput) {
    const startupExists = this.startups.get(input.startupId);
    if (!startupExists) {
      return fail(`Cannot insert phase: startup does not exists`);
    }

    const phaseWithSameSeq = this.phases.where({ startupId: input.startupId, seqNo: input.seqNo });
    if (!isEmpty(phaseWithSameSeq)) {
      return fail(`Cannot insert phase with same seqNo as '${phaseWithSameSeq[0].title}'`);
    }

    const lastPhase = this.getLastPhase(input.startupId, input.seqNo);
    const locked = lastPhase ? !lastPhase.isComplete : false;

    const phase = {
      isComplete: false,
      locked,
      ...input
    };

    const result = this.phases.insert(phase);
    if (!result) {
      return fail(`Failed to insert '${input.title}'`);
    }

    return success(`Successfully inserted '${input.title}'`);
  }

  getTasks(phaseId: string) {
    return this.tasks.where({ phaseId: phaseId });
  }

  insertTask(input: TaskInput) {
    const phaseExists = this.phases.get(input.phaseId);
    if (!phaseExists) {
      return fail(`Cannot insert task: phase does not exists`);
    }

    const result = this.tasks.insert({
      isComplete: false,
      ...input
    });

    if (!result) {
      return fail(`Failed to insert '${input.title}'`);
    }

    return success(`Successfully inserted '${input.title}'`);
  }

  processTaskComplete(taskInput: Task) {
    const tasks = this.getTasks(taskInput.phaseId);
    const hasOpenTasks = !isNil(find((t) => !t.isComplete, tasks));
    if (!hasOpenTasks) {
      // TODO possibly handle what if completePhase goes bad
      // (more likely to happen on a real db wheer transaction rolling back is available)
      this.completePhase(taskInput.phaseId);
    }
  }

  processTaskIncomplete(taskInput: Task) {
    const phase = this.phases.get(taskInput.phaseId);
    this.phases.update({ ...phase, isComplete: false });

    const laterPhasesIds = pipe(
      mapLaterPhases(phase!.seqNo),
      reject(isNil),
      map(prop(`id`))
    )(this.getPhases(phase!.startupId));

    forEach((id) => {
      const laterPhase = this.phases.get(id);
      this.phases.update({ ...laterPhase, locked: true });
    }, laterPhasesIds);
  }

  toggleTaskCompletion(taskId: string) {
    const task = this.tasks.get(taskId);
    if (isNil(task)) {
      return fail(`Task '${taskId}' does not exist`);
    }

    const phase = this.phases.get(task.phaseId);
    if (phase?.locked) {
      return fail(`Cannot complete tasks on locked phase`);
    }

    const wasComplete = task.isComplete;
    this.tasks.update({ ...task, isComplete: !wasComplete });

    // TODO return flag from process functions and rollback if needed
    if (!wasComplete) {
      this.processTaskComplete(task);
    } else {
      this.processTaskIncomplete(task);
    }

    return success(`Successfully marked task '${taskId}' as ${wasComplete ? 'in' : ''}complete`);
  }

  completePhase(phaseId: string): boolean {
    const phase = this.phases.get(phaseId);
    if (isNil(phase)) {
      return false;
    }
    const startupPhases = this.phases.where({ startupId: phase.startupId });
    if (hasNextPhase(phase, startupPhases)) {
      const nextPhase = getNextPhase(phase.seqNo, startupPhases);
      this.phases.update({ ...nextPhase!, locked: false });
    }
    this.phases.update({ ...phase, isComplete: true });
    return true;
  }
}
