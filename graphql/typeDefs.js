const {gql} = require('apollo-server-express');

const typeDefs = gql`

    type Worker {
        user: User!
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
        id: ID!
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
    contactWithAdmin(message: String!): Boolean!
    }

    type Mutation {
    createUser(email: String!, password: String!, type:String!): User!
    deleteUser(id: ID!): Boolean!
#    updateUser(id: ID!, email: String!, firstName: String!, position: String): Boolean!
    }

`;

module.exports = { typeDefs };