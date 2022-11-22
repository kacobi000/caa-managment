const { PrismaClient } = require('@prisma/client');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const resolvers = {

    Query: {
        login: async function(parent, args) {
            const email = args.email;
            const password = args.password;
            let user = await prisma.user.findFirst({ 
                where: { 
                    email: {
                        equals: email
            }}})
                if(!user){
                    const error = new Error('User not found.');
                    error.code = 401;
                    throw error;
                }
            const isEqual = await bcrypt.compare(password, user.password);
            if(!isEqual){
                const error = new Error('Password is incorrect.');
                error.code = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                  userId: user.id.toString(),
                  email: user.email
                },
                'MmcXUQpSl3KxyAw',
                { expiresIn: '1h' }
              );
                return { token: token, user: user }
        },

    },
    Mutation: {
        createUser: async function(parent, args){
            const existingUser = await prisma.user.findFirst({ 
                where: {
                    email: {
                        equals: args.email
                    }
            }});
            if (existingUser) {
                const error = new Error('User exists already!');
                throw error;
                }
            const hashedPw = await bcrypt.hash(args.password, 12);
            const createdUser = await prisma.user.create({
                data: {
                    email: args.email,
                    password: hashedPw,
                    type: args.type
                }
            })
            return createdUser;
            
        }
    }
}

module.exports = { resolvers };