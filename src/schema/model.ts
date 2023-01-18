export interface BusinessObject {
  id: string
}

interface Completable {
  isComplete: boolean
}

export interface Startup extends BusinessObject {
  id: string
  name: string
}

export interface StartupInput {
  name: string
}

export interface Phase extends Completable, BusinessObject {
  title: string
  description: string
  seqNo: number
  startupId: string
  locked: boolean
}

export interface PhaseInput {
  title: string
  description: string
  seqNo: number
  startupId: string
}

export interface Task extends Completable, BusinessObject {
  title: string
  description: string
  phaseId: string
}

export interface TaskInput {
  title: string
  description: string
  phaseId: string
}