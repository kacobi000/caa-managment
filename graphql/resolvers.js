const { PrismaClient } = require('@prisma/client');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const Str = require('@supercharge/strings');
const Sib = require('sib-api-v3-sdk');

const client = Sib.ApiClient.instance;

const apiKey = client.authentications['api-key'];

apiKey.apiKey = process.env.EMAIL_SENDER;

const tranEmailApi = new Sib.TransactionalEmailsApi();

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
        contactWithAdmin: async function(parent, args) {

            const sender = {
                email: 'caprojectmanagment@gmail.com'
            };
            
            const receivers = [
                {
                    email: 'caprojectmanagment@gmail.com'
                }
            ];
            
           const message = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Example',
                textContent: args.message
            })
            if(!message) {
                return false;
            }
            return true;
        }

    },

    Mutation: {
        createUser: async function(parent, args){
            const id = Str.random()
            const existingUser = await prisma.user.findFirst({ 
                where: {
                    email: {
                        equals: args.email
                    }
                }
            });
            if (existingUser) {
                const error = new Error('User exists already!');
                throw error;
                }
            const hashedPw = await bcrypt.hash(args.password, 12);
            if(!args.type === 'worker' || !args.type === 'student' ) {
                const error = new Error('Bad type of account');
                throw error;
            }
            const createdUser = await prisma.user.create({
                data: {
                    id: id,
                    email: args.email,
                    password: hashedPw,
                    type: args.type
                }
            })
            if(args.type === "worker"){
                await prisma.worker.create({
                    data:{
                        userId: id
                    }
                })
            } else {
                await prisma.student.create({
                    data:{
                        userId: id
                    }
                })
            }

            return createdUser;
            
        },

        deleteUser: async function(parent, args){
            const id = args.id;
            let existingUser = await prisma.user.findFirst({ 
                where: {
                    id: id
                }
            });

            if(existingUser.type === "worker"){
                await prisma.worker.delete({
                    where:{
                        userId: id
                    }
                })
            } else if (existingUser.type === "student") {
                await prisma.student.delete({
                    where:{
                        userId: id
                    }
                })
            }
            await prisma.user.delete({ 
                where: {
                    id: id
                }
            });
            existingUser = await prisma.user.findFirst({ 
                where: {
                    id: id
                }
            });
            if(existingUser){
                return false
            } 
                return true;
        },

        // updateUser: async function(parent, args){
        //     const id = args.id;
        //     const email = args.email;
        //     const firstName = args.firstName;
        //     let user = await prisma.user.findFirst({
        //         where: {
        //             id: id
        //         }
        //     })
        //     if(user.type === "worker") {
        //         const worker = await prisma.worker.update({
        //             where: {
        //                 userId: id
        //             },
        //             data: {
        //                 firstName: firstName,
        //                 position: position
        //             }
        //         })
        //     } else if(user.type === "student") {
        //         const student = await prisma.student.update({
        //             where: {
        //                 userId: id
        //             },
        //             data: {
        //                 firstName: firstName
        //             }
        //         })
        //     }
        //     user = await prisma.user.update({
        //         where: {
        //             id: id
        //         },
        //         data: {
        //             email: email,
        //         }
        //     })
        //     return true;
        // }
    }
}

module.exports = { resolvers };