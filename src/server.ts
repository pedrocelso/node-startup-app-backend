import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bp from 'body-parser';
import express from 'express';
import { readFileSync } from 'fs';
import http from 'http';

import { load } from './db/data-load.js';
import { MemoryDB } from './db/memory/memory.js';
import { BusinessObject, PhaseInput, StartupInput, TaskInput } from './schema/model.js';

const { json } = bp;

const port = process.env.PORT || 4000;
const typeDefs = readFileSync('./src/schema/schema.graphql', 'utf-8');
const db = new MemoryDB(load);
const resolvers = {
  Query: {
    getStartups: () => db.getStartups()
  },
  Mutation: {
    insertStartup: (_: BusinessObject, { input }: { input: StartupInput }) =>
      db.insertStartup(input),
    insertPhase: (_: BusinessObject, { input }: { input: PhaseInput }) => db.insertPhase(input),
    insertTask: (_: BusinessObject, { input }: { input: TaskInput }) => db.insertTask(input),
    toggleTaskCompletion: (_: BusinessObject, { id }: BusinessObject) => db.toggleTaskCompletion(id)
  },
  Startup: {
    phases: ({ id }: BusinessObject) => db.getPhases(id)
  },
  Phase: {
    tasks: ({ id }: BusinessObject) => db.getTasks(id)
  }
};

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

server.start().then(() => {
  app.use(
    '/graphql',
    json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token })
    })
  );
});

new Promise<void>((resolve) => httpServer.listen({ port }, resolve)).then(() =>
  console.log(`server running on port ${port}`)
);
