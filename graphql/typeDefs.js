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
        resetToken: String
        resetTokenExpiration: String
        isActive: Boolean!
    }

    type AuthData {
        token: String!
        user: User!
    }

    type Query {
    login(email: String!, password: String!): AuthData!
    contactWithAdmin(message: String!): Boolean!
    requestResetPassword(email: String!): String!
    }

    type Mutation {
    changeIsActive(email: String!): User!
    createUser(email: String!, password: String!, type:String!): User!
    deleteUser(id: ID!): Boolean!
    updateUser(id: ID!, email: String!, type: String!, firstName: String!, secondName: String!, number: String!): Boolean!
    resetPassword(resetToken: String!): Boolean
    }

`;

module.exports = { typeDefs };