const {gql} = require('apollo-server-express');

const typeDefs = gql`

    type Worker {
        firstName: String
        secondName: String
        number: String
        position: String
    }

    type Student {
        name: String
        secondName: String
        number: String
        project: String
        field: String
    }

    type User {
        email: String!
        password: String!
        type: String!
    }

    type AuthData {
        token: String!
        user: User
    }

    type Query {
    login(email: String!, password: String!): AuthData!
    }

    type Mutation {
    createUser(email: String!, password: String!, type:String!): User!
    }

`;

module.exports = { typeDefs };