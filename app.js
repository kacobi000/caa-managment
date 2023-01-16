const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const fs = require('fs');
const bodyParser = require('body-parser');

const { typeDefs } = require('./graphql/typeDefs');
const { resolvers } = require('./graphql/resolvers');
const auth = require('./middleware/isAuth');

require('dotenv').config();

async function startServer() {
    const app = express();
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
          const headers = req.headers;
          return { headers };
        },
    });

    await apolloServer.start();

    apolloServer.applyMiddleware({
      app: app,
      path: '/'
    });

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
          'Access-Control-Allow-Methods',
          'OPTIONS, GET, POST, PUT, PATCH, DELETE'
        );
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        next();
      });

    app.use(auth);

    app.use((error, req, res, next) => {
      console.log(error);
      const status = error.statusCode || 500;
      const message = error.message;
      const data = error.data;
      res.status(status).json({ message: message, data: data });
    });

    app.listen(process.env.PORT || 7070, () => {
      // console.log(process.env.EMAILSENDER);
      console.log(process.env.PORT);
      // console.log(process.env.TOKEN);
  })

}

startServer();
