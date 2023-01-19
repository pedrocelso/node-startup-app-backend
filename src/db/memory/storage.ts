import {
  forEach,
  keys,
  path,
  values,
  isNil,
  dissoc,
  length,
  map,
  pipe,
  reject,
  where,
  equals,
  mergeAll
} from 'ramda';

import { BusinessObject } from '../../schema/model';

type Input<T extends BusinessObject> = Omit<T, `id`>;
type Data<T extends BusinessObject> = Input<T> & BusinessObject;
export class Storage<T extends BusinessObject, Y extends Input<T>> {
  records: Record<string, Data<T>>;
  constructor(initialLoad?: T[]) {
    this.records = {};

    if (initialLoad) {
      forEach((d) => {
        this.records = { ...this.records, [d.id]: d };
      }, initialLoad);
    }
  }

  getNextAvailableId() {
    return `${length(keys(this.records))}`;
  }

  where(queryObj: Partial<Data<T>>) {
    const objKeys = keys(queryObj);
    const specList = map((k) => {
      return {
        [k]: equals(queryObj[k])
      };
    }, objKeys);

    const spec = mergeAll(specList);
    const testSpec = where(spec);

    return pipe(
      values,
      map((o) => (testSpec(o) ? o : undefined)),
      reject(isNil)
    )(this.records) as Data<T>[]; // TODO get rid of this type assertion
  }

  get(id: string) {
    return path([id], this.records);
  }

  getAll() {
    return values(this.records);
  }

  insert(input: Y) {
    const id = this.getNextAvailableId();
    this.records = { ...this.records, [id]: { ...input, id } };
    return true;
  }

  update(input: T) {
    if (isNil(this.get(input.id))) {
      return false;
    }

    this.records = { ...this.records, [input.id]: input };
    return true;
  }

  delete(id: string) {
    this.records = dissoc(id, this.records);
    return true;
  }
}
