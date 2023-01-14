const { PrismaClient } = require('@prisma/client');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const Str = require('@supercharge/strings');
const Sib = require('sib-api-v3-sdk');
const crypto = require('crypto');
const { GraphQLError } = require('graphql');

const client = Sib.ApiClient.instance;

const apiKey = client.authentications['api-key'];

apiKey.apiKey = process.env.EMAIL_SENDER;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const prisma = new PrismaClient();

const resolvers = {

    Query: {
        getDaily: async function(parent, args){
            const daily = await prisma.dailyStatus.findMany();
            return daily;
        },
        login: async function(parent, args) {
            const email = args.email;
            const password = args.password;
            let user = await prisma.user.findFirst({ 
                where: { 
                    email: {
                        equals: email
            }}})
                if(!user){
                    throw new GraphQLError("User not found", {
                        extensions: { code: 'BAD_USER_INPUT' },
                      });
                }

            const isEqual = await bcrypt.compare(password, user.password);
            if(!isEqual){
                throw new GraphQLError("Password is inncorect", {
                    extensions: { code: 'BAD_USER_INPUT' },
                  });
            }

            if(user.isActive === false){
                throw new GraphQLError("User account is not active", {
                    extensions: { code: 'NOT_ACTIVE_ACCOUNT' },
                  });

            }

            const token = jwt.sign(
                {
                  userId: user.id.toString(),
                  email: user.email
                },
                'MmcXUQpSl3KxyAw',
                { expiresIn: '1h' }
              );

              const expiration = Date.now() + 3600000;

                await prisma.user.update({
                    where: {
                        id: user.id
                    },
                    data: {
                        token: token,
                        tokenExpiration: expiration.toString()
                    }
                })

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
        },

        requestResetPassword: async function(parent, args) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: args.email
                }
            })
            if(!existingUser){
                throw new GraphQLError("Account with this email does not exist", {
                    extensions: { code: 'BAD_USER_INPUT' },
                  });
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            const sender = {
                email: 'caprojectmanagment@gmail.com'
            };
            const receivers = [
                {
                    email: args.email
                }
            ];
           const message = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Password Reset',
                textContent: `Use the following link to reset your password: 
                https://caa-managment.onrender.com/reset-password/${resetToken}`
            });
            const resetTokenExpiration = Date.now() + 1200000;
                const user = await prisma.user.update({
                    where: {
                        id: existingUser.id
                    },
                    data: {
                        resetToken: resetToken,
                        resetTokenExpiration: resetTokenExpiration.toString()
                    }
                })
            return resetToken;
        }
    },

    Mutation: {
        changeIsActive: async function(parent, args){
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: args.email
                }
            })

            const isActive = existingUser.isActive;

            if(!existingUser){
                throw new GraphQLError("No user found", {
                    extensions: { code: 'BAD_USER_INPUT' },
                  });
            }

            const user = await prisma.user.update({
                where: {
                    id: existingUser.id
                },
                data:{
                    isActive: !isActive
                }
            })

            return user;
        },

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
                throw new GraphQLError("User already exists", {
                    extensions: { code: 'BAD_USER_INPUT' },
                  });
                }
            const hashedPw = await bcrypt.hash(args.password, 12);
            if(!args.type === 'employee' || !args.type === 'student' ) {
                throw new GraphQLError("Bad type of account", {
                    extensions: { code: 'BAD_USER_INPUT' },
                  });
            }
            const createdUser = await prisma.user.create({
                data: {
                    id: id,
                    email: args.email,
                    password: hashedPw,
                    type: args.type,
                    firstName: args.firstName,
                    secondName: args.secondName,
                    number: args.number
                }
            })
            if(args.type === "employee"){
                await prisma.employee.create({
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
            console.log(existingUser)
            if(existingUser.type === "employee"){
                await prisma.employee.delete({
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
        
        resetPassword: async function(parent, args){
            const user = await prisma.user.findFirst({
                where: {
                    resetToken: args.resetToken
                }
            })
            if(!user){
                throw new GraphQLError("Your token is not one that we send to you", {
                    extensions: { code: 'TOKEN_ERROR' },
                  });
            }
            const  tokenExpiration = parseInt(user.resetTokenExpiration);
            if(tokenExpiration < Date.now()){
                throw new GraphQLError("Token has expired, try again reset your password", {
                    extensions: { code: 'TOKEN_ERROR' },
                  });
            }
            const password = Str.random()
            const hashedPw = await bcrypt.hash(password, 12);
            const sender = {
                email: 'caprojectmanagment@gmail.com'
            };
            const receivers = [
                {
                    email: user.email
                }
            ];
           const message = await tranEmailApi.sendTransacEmail({
                sender,
                to: receivers,
                subject: 'Password Reset',
                textContent: `Your new password id: ${password}`
            });
            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: hashedPw
                }
            })
            return true;
        },
        
        updateUser: async function(parent, args){
            const id = args.id;
            let user = await prisma.user.findFirst({
                where: {
                    id: id
                }
            })
            if(!user){
                throw new GraphQLError("This user does not exist", {
                    extensions: { code: 'BAD_INPUT' },
                  });
            }
            if(user.type === "employee") {
                const employee = await prisma.employee.update({
                    where: {
                        userId: id
                    },
                    data: {
                        firstName: args.firstName,
                        secondName: args.secondName,
                        number: args.number,
                        position: args.position
                    }
                })
            } else if(user.type === "student") {
                const student = await prisma.student.update({
                    where: {
                        userId: id
                    },
                    data: {
                        firstName: args.firstName,
                        secondName: args.secondName,
                        number: args.number,
                        project: args.project,
                        field: args.field
                    }
                })
            }
            user = await prisma.user.update({
                where: {
                    id: id
                },
                data: {
                    email: args.email,
                    type: arg.type
                }
            })
            return true;
        },

        createDailyStatus: async function(parent, args){

            const user = await prisma.user.findFirst({
                where:  {
                    token: args.token
                }
            })

            if(!user){
                throw new GraphQLError("This user does not exist", {
                    extensions: { code: 'BAD_INPUT' },
                  });
            }

            const student = await prisma.student.findFirst({
                where: {
                    userId: user.id
                }
            })

            const daily = await prisma.dailyStatus.findMany({
                where: {
                    studentId: student.id,
                }
            });

            const currentDate = new Date();
            let rekord = 0;

            daily.find( i => {

                const date = new Date(daily[rekord].date);

                console.log(date);
                rekord++;

                if( date.getDate()  === currentDate.getDate()){
                    throw new GraphQLError("Daily has been already added today", {
                        extensions: { code: 'DAILY_ESXISTS' },
                      });
                }
            })

            const dailyStatus = await prisma.dailyStatus.create({
                data: {
                    studentId: student.id,
                    studentName: user.firstName,
                    description: args.description
                }
            })
            
            return dailyStatus;
        }
    }
}

module.exports = { resolvers };