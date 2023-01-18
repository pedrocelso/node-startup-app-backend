import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { readFileSync } from "fs";
import { load } from "./db/data-load.js";
import { MemoryDB } from "./db/memory.js";
import { BusinessObject, PhaseInput, StartupInput, TaskInput } from "./schema/model.js";

const typeDefs = readFileSync('./src/schema/schema.graphql', 'utf-8')

const db = new MemoryDB(load)

const resolvers = {
  Query: {
    getStartups: () => db.getStartups()
  },
  Mutation: {
    insertStartup:(_: BusinessObject, {input}: {input: StartupInput}) => db.insertStartup(input),
    insertPhase:(_: BusinessObject, {input}: {input: PhaseInput}) => db.insertPhase(input),
    insertTask:(_: BusinessObject, {input}: {input: TaskInput}) => db.insertTask(input),
    completeTask:(_: BusinessObject, {id}: BusinessObject) => db.completeTask(id)
  },
  Startup: {
    phases: ({id}: BusinessObject) => db.getPhases(id)
  },
  Phase: {
    tasks: ({id}: BusinessObject) => db.getTasks(id)
  }
}

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server);
console.log(`🚀 Server listening at: ${url}`);