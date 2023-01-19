[![pedrocelso/node-startup-app-backend](https://circleci.com/gh/pedrocelso/node-startup-app-backend.svg?style=shield)](https://app.circleci.com/pipelines/github/pedrocelso/node-startup-app-backend)
# Startup Phases Management

This project aims to provide an easy way to manage phases faced by startups, giving the possibility to assign multiple tasks to each phase.

Live version: https://node-startup-app.lm.r.appspot.com/graphql

## Available commands
|Command|Description|
|--|--|
| `npm build` | Deletes `./build` directory and regenerate the compiled files using `tsc` |
| `npm start` | Serves `./build/server.js` using node |
| `npm run start:local` | Runs both `build` and `start` command |
| `npm test` | Runs all `*.test.ts` files using `jest` |
| `npm run test:coverage` | Runs `*.test.ts` files and collects code coverage metrics on test format |

## Test Examples
### Query
#### GetStartups
```
query GetStartups {
  getStartups {
    name
    id
    phases {
      id
      title
      isComplete
      locked
      tasks {
        id
        title
        isComplete
      }
    }
  }
}
```

### Mutations
#### InsertStartup
```
mutation InsertStartup {
  insertStartup(input: {
    name: "Second Startup"
  }){
    success
    message
  }
}
```

#### InsertPhase
```
mutation InsertPhase {
  insertPhase(input: {
    title: "An important Phase"
    seqNo: 10
    startupId: "1"
    description: ""
  }) {
    message
    success
  }
}
```

#### InsertTask
```
mutation InsertTask{
  insertTask(input: {
    title: "Important Task"
    description: ""
    phaseId: "3"
  }) {
    success
    message
  }
}
```

#### ToggleTaskCompletion
```
mutation ToggleTaskCompletion{
  toggleTaskCompletion(id: "8") {
    message
    success
  }
}
```