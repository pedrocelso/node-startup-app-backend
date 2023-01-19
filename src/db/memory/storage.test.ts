import { Phase, Startup, StartupInput } from '../../schema/model.js';
import { Storage } from './storage.js';

describe(`Storage`, () => {
  it(`Should insert data`, () => {
    const storage = new Storage<Startup, StartupInput>();
    storage.insert({ name: `test` });
    let allStartups = storage.getAll();
    expect(allStartups).toHaveLength(1);
    expect(storage.get(allStartups[0].id).name).toEqual(`test`);

    storage.insert({ name: `test 2` });
    allStartups = storage.getAll();
    expect(allStartups).toHaveLength(2);

    expect(allStartups[0].id).toEqual(`0`);
    expect(allStartups[0].name).toEqual(`test`);
    expect(allStartups[1].id).toEqual(`1`);
    expect(allStartups[1].name).toEqual(`test 2`);
  });

  it(`Should fetch data`, () => {
    const storage = new Storage<Startup, StartupInput>([
      { id: '0', name: 'startup-0' },
      { id: '1', name: 'startup-1' }
    ]);

    const records = storage.getAll();
    expect(records).toHaveLength(2);
    expect(records[0].id).toEqual(`0`);
    expect(records[0].name).toEqual(`startup-0`);
    expect(records[1].id).toEqual(`1`);
    expect(records[1].name).toEqual(`startup-1`);
  });

  it(`Should fetch individual records`, () => {
    const storage = new Storage<Startup, StartupInput>([
      { id: '0', name: 'startup-0' },
      { id: '1', name: 'startup-1' }
    ]);

    const record = storage.get(`1`);
    expect(record.id).toEqual(`1`);
    expect(record.name).toEqual(`startup-1`);
  });

  it(`Should update record`, () => {
    const storage = new Storage<Startup, StartupInput>([
      { id: '0', name: 'startup-0' },
      { id: '1', name: 'startup-1' }
    ]);

    const result = storage.update({ id: `0`, name: `a different name` });
    expect(result).toBeTruthy();
    const record = storage.get(`0`);
    expect(record.id).toEqual(`0`);
    expect(record.name).toEqual(`a different name`);

    expect(storage.update({ id: `999`, name: `abc` })).toBeFalsy();
  });

  it(`Should fail if it tries to update an non existent object`, () => {
    const storage = new Storage<Startup, StartupInput>([
      { id: '0', name: 'startup-0' },
      { id: '1', name: 'startup-1' }
    ]);

    const result = storage.update({ id: `9999`, name: `a different name` });
    expect(result).toBeFalsy();
  });

  it(`Should delete record`, () => {
    const storage = new Storage<Startup, StartupInput>([
      { id: '0', name: 'startup-0' },
      { id: '1', name: 'startup-1' }
    ]);

    const result = storage.delete(`0`);
    expect(result).toBeTruthy();
    const records = storage.getAll();
    expect(records).toHaveLength(1);
    expect(records[0].id).toEqual(`1`);
    expect(records[0].name).toEqual(`startup-1`);
  });

  it(`Should getBy prop`, () => {
    const storage = new Storage<Phase, Omit<Phase, `id`>>([
      {
        id: '0',
        title: `phase-0`,
        description: ``,
        isComplete: false,
        locked: false,
        seqNo: 0,
        startupId: `0`
      },
      {
        id: '1',
        title: `phase-1`,
        description: ``,
        isComplete: false,
        locked: true,
        seqNo: 1,
        startupId: `0`
      },
      {
        id: '2',
        title: `phase-2`,
        description: ``,
        isComplete: false,
        locked: false,
        seqNo: 0,
        startupId: `1`
      }
    ]);

    let result = storage.where({ startupId: `0` });
    expect(result).toHaveLength(2);
    result = storage.where({ startupId: `0`, locked: false });
    expect(result).toHaveLength(1);
    result = storage.where({ startupId: `0`, title: `phase-2` });
    expect(result).toHaveLength(0);
  });
});
