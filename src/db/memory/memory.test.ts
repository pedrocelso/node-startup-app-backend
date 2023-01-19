import { Phase, Startup, Task } from '../../schema/model.js';
import { MemoryDB } from './memory.js';

const startups: Startup[] = [
  { id: '0', name: 'startup-0' },
  { id: '1', name: 'startup-1' },
  { id: '2', name: 'startup-2' },
  { id: '3', name: 'startup-3' },
  { id: '4', name: 'startup-4' },
  { id: '5', name: 'startup-5' }
];

const phases: Phase[] = [
  {
    id: '0',
    title: 'phase-0',
    description: '',
    isComplete: false,
    seqNo: 0,
    startupId: '0',
    locked: false
  },
  {
    id: '1',
    title: 'phase-1',
    description: '',
    isComplete: false,
    seqNo: 1,
    startupId: '0',
    locked: true
  },
  {
    id: '2',
    title: 'phase-2',
    description: '',
    isComplete: false,
    seqNo: 2,
    startupId: '0',
    locked: true
  },
  {
    id: '3',
    title: 'phase-3',
    description: '',
    isComplete: true,
    seqNo: 0,
    startupId: '1',
    locked: false
  },
  {
    id: '4',
    title: 'phase-4',
    description: '',
    isComplete: false,
    seqNo: 1,
    startupId: '1',
    locked: false
  },
  {
    id: '5',
    title: 'phase-5',
    description: '',
    isComplete: false,
    seqNo: 5,
    startupId: '1',
    locked: true
  },
  {
    id: '6',
    title: 'phase-6',
    description: '',
    isComplete: false,
    seqNo: 0,
    startupId: '4',
    locked: false
  },
  {
    id: '7',
    title: 'phase-7',
    description: '',
    isComplete: true,
    seqNo: 0,
    startupId: '3',
    locked: false
  }
];

const tasks: Task[] = [
  { id: '0', title: 'task-0', description: '', isComplete: false, phaseId: '0' },
  { id: '1', title: 'task-1', description: '', isComplete: false, phaseId: '1' },
  { id: '2', title: 'task-2', description: '', isComplete: false, phaseId: '2' },
  { id: '3', title: 'task-3', description: '', isComplete: true, phaseId: '3' },
  { id: '4', title: 'task-4', description: '', isComplete: true, phaseId: '3' },
  { id: '5', title: 'task-5', description: '', isComplete: true, phaseId: '4' },
  { id: '6', title: 'task-6', description: '', isComplete: false, phaseId: '4' },
  { id: '7', title: 'task-7', description: '', isComplete: false, phaseId: '5' },
  { id: '8', title: 'task-8', description: '', isComplete: false, phaseId: '6' },
  { id: '9', title: 'task-9', description: '', isComplete: false, phaseId: '6' },
  { id: '10', title: 'task-10', description: '', isComplete: true, phaseId: '7' }
];

describe(`.getStartups()`, () => {
  it(`Should return existing startups`, () => {
    const db = new MemoryDB({ startups });

    const result = db.getStartups();
    expect(result).toHaveLength(6);
    expect(result[0].name).toEqual(`startup-0`);
    expect(result[1].name).toEqual(`startup-1`);
    expect(result[2].name).toEqual(`startup-2`);
    expect(result[3].name).toEqual(`startup-3`);
    expect(result[4].name).toEqual(`startup-4`);
    expect(result[5].name).toEqual(`startup-5`);
  });

  it(`Should return empty list if startups are found`, () => {
    const db = new MemoryDB();

    const result = db.getStartups();
    expect(result).toHaveLength(0);
  });
});

describe(`.insertStartup()`, () => {
  it(`Should insert a new startup`, () => {
    const db = new MemoryDB({ startups });

    const count = db.getStartups().length;
    const result = db.insertStartup({ name: `startup-5` });

    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully inserted 'startup-5'`);
    expect(db.getStartups().length).toEqual(count + 1);
  });
});

describe(`.getPhases()`, () => {
  it(`Should return existing phases for a given startup`, () => {
    const db = new MemoryDB({ startups, phases });

    const result = db.getPhases('0');
    expect(result).toHaveLength(3);
    expect(result[0].title).toEqual(`phase-0`);
    expect(result[1].title).toEqual(`phase-1`);
    expect(result[2].title).toEqual(`phase-2`);
  });

  it(`Should return empty list if startups has no phases`, () => {
    const db = new MemoryDB({ startups, phases });

    const result = db.getPhases('5');
    expect(result).toHaveLength(0);
  });
});

describe(`.insertPhase()`, () => {
  it(`Should insert a new phase`, () => {
    const db = new MemoryDB({ startups, phases });

    const count = db.getPhases('0').length;
    const result = db.insertPhase({
      startupId: '0',
      seqNo: 3,
      description: 'desc-phase-3',
      title: 'phase-3'
    });

    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully inserted 'phase-3'`);
    expect(db.getPhases('0').length).toEqual(count + 1);
  });

  it(`Should fail if startup does not exist`, () => {
    const db = new MemoryDB({ startups, phases });

    const result = db.insertPhase({
      startupId: '999',
      seqNo: 2,
      description: 'desc-phase-3',
      title: 'phase-3'
    });

    expect(result.success).toBeFalsy();
    expect(result.message).toEqual(`Cannot insert phase: startup does not exists`);
  });

  it(`Should fail if seqNo is already taken`, () => {
    const db = new MemoryDB({ startups, phases });

    const count = db.getPhases('0').length;
    const result = db.insertPhase({
      startupId: '0',
      seqNo: 2,
      description: 'desc-phase-3',
      title: 'phase-3'
    });

    expect(result.success).toBeFalsy();
    expect(result.message).toEqual(`Cannot insert phase with same seqNo as 'phase-2'`);
    expect(db.getPhases('0').length).toEqual(count);
  });

  it(`Should insert phase as locked if previous phases aren't complete`, () => {
    const db = new MemoryDB({ startups, phases });

    const result = db.insertPhase({
      startupId: '4',
      seqNo: 1,
      description: 'this phase should be locked',
      title: 'locked-phase'
    });
    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully inserted 'locked-phase'`);

    const dbPhases = db.getPhases('4');
    expect(dbPhases[1].locked).toBeTruthy();
  });

  it(`Should insert phase as unlocked if previous phases are complete`, () => {
    const db = new MemoryDB({ startups, phases });

    const result = db.insertPhase({
      startupId: '3',
      seqNo: 1,
      description: 'this phase shouldn´t be locked',
      title: 'unlocked-phase'
    });
    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully inserted 'unlocked-phase'`);

    const dbPhases = db.getPhases('3');
    expect(dbPhases[1].locked).toBeFalsy();
  });
});

describe(`.getTasks()`, () => {
  it(`Should return existing tasks for a given phase`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.getTasks('3');
    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual(`task-3`);
    expect(result[1].title).toEqual(`task-4`);
  });

  it(`Should return empty list if startups has no phases`, () => {
    const db = new MemoryDB({ startups, phases });

    const result = db.getTasks('9');
    expect(result).toHaveLength(0);
  });
});

describe(`.insertTask()`, () => {
  it(`Should insert a new task`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const count = db.getTasks('5').length;
    const result = db.insertTask({ phaseId: '5', description: 'desc-task-3', title: 'task-3' });

    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully inserted 'task-3'`);
    expect(db.getTasks('5').length).toEqual(count + 1);
  });

  it(`Should fail if phase does not exist`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.insertTask({ phaseId: '999', description: 'desc-task-3', title: 'task-3' });

    expect(result.success).toBeFalsy();
    expect(result.message).toEqual(`Cannot insert task: phase does not exists`);
  });
});

describe.skip(`.toggleTaskCompletion()`, () => {
  it(`Should mark task as complete`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    let dbTasks = db.getTasks('6');
    expect(dbTasks[0].isComplete).toBeFalsy();
    expect(dbTasks[1].isComplete).toBeFalsy();

    const result = db.toggleTaskCompletion('8');
    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully marked task '8' as complete`);

    dbTasks = db.getTasks('6');
    expect(dbTasks[0].isComplete).toBeTruthy();
    expect(dbTasks[1].isComplete).toBeFalsy();
  });

  it(`Should mark phase as complete if all tasks are complete`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    let phase = db.getPhases('1');
    expect(phase[1].isComplete).toBeFalsy();

    const result = db.toggleTaskCompletion('6');
    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully marked task '6' as complete`);

    phase = db.getPhases('1');
    expect(phase[1].isComplete).toBeTruthy();
  });

  it(`Should fail if task does not exist`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.toggleTaskCompletion('333');
    expect(result.success).toBeFalsy();
    expect(result.message).toEqual(`Task '333' does not exist`);
  });

  it(`Should toggle task completion to false if it was marked as complete`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.toggleTaskCompletion('5');
    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully marked task '5' as incomplete`);
  });

  it(`Should lock next phases and incomplete current phase if task is set as incomplete`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.toggleTaskCompletion('3');
    expect(result.success).toBeTruthy();
    expect(result.message).toEqual(`Successfully marked task '3' as incomplete`);

    expect(db.phases.get('4')!.locked).toBeTruthy();
    expect(db.phases.get('3')!.isComplete).toBeFalsy();
  });

  it(`Should not toggle tasks on locked phases`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.toggleTaskCompletion('7');
    expect(result.success).toBeFalsy();
    expect(result.message).toEqual(`Cannot complete tasks on locked phase`);
  });
});

describe(`.completePhase()`, () => {
  it(`Should mark phase as complete`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.completePhase('4');
    expect(result).toBeTruthy();
  });

  it(`Should fail if phases does not exist on DB`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.completePhase('44');
    expect(result).toBeFalsy();
  });

  it(`Should unlock next phase when phase is marked as complete`, () => {
    const db = new MemoryDB({ startups, phases, tasks });

    const result = db.completePhase('4');
    expect(result).toBeTruthy();

    const dbPhases = db.getPhases('1');
    expect(dbPhases[2].locked).toBeFalsy();
  });
});
