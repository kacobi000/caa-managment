const {gql} = require('apollo-server-express');

const typeDefs = gql`

    type Worker {
        user: User!
        position: String
    }

    type Student {
        user: User!
        dailyStatus: DailyStatus
        project: String
        field: String
    }

    type DailyStatus {
        studentName: String!
        description: String!
        date: String!
    }

    type User {
        id: ID!
        email: String!
        password: String!
        firstName: String
        secondName: String
        number: String
        type: String!
#        token: String
#        tokenExpiration: String
        resetToken: String
        resetTokenExpiration: String
        isActive: Boolean!
    }

    type Course {
    id: ID!
    name: String!
    platform: String!
    login: String!
    password: String!
    }

    type AuthData {
        token: String!
        user: User!
    }

    type Query {
    getDaily: [DailyStatus!]
    login(email: String!, password: String!): AuthData!
    contactWithAdmin(message: String!): Boolean!
    requestResetPassword(email: String!): String!
    getUsers(type: String): [User!]
    getCoursers(id: ID!): [Course!]
    }

    type Mutation {
    changeIsActive(email: String!): User!
    createUser(email: String!, password: String!, type: String!, firstName: String!, secondName: String!, number: String!): User!
    deleteUser(id: ID!): Boolean!
    updateUser(id: ID!, email: String!, type: String!, firstName: String!, secondName: String!, number: String!): Boolean!
    resetPassword(resetToken: String!): Boolean
    createDailyStatus(description: String!): DailyStatus!
    addCourse(id: ID!, name: String!, platform: String!, login: String!, password: String!): Boolean!
    }

`;

module.exports = { typeDefs };