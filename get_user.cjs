const { PrismaClient } = require('./backend/node_modules/@prisma/client'); 
const prisma = new PrismaClient(); 
async function m() { 
  let u = await prisma.user.findFirst(); 
  if(!u){
    u = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        passwordHash: 'hash',
        displayName: 'Demo User'
      }
    });
  } 
  console.log(u.id); 
  await prisma.$disconnect();
} 
m();