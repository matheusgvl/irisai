const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar usuários existentes
    const users = await prisma.user.findMany();
    console.log("Usuários existentes:", users.length);
    
    if (users.length === 0) {
      console.log("Criando usuário de teste...");
      const hashedPassword = await bcrypt.hash("123456", 10);
      
      const testUser = await prisma.user.create({
        data: {
          name: "Doutor Teste",
          email: "doctor@test.com",
          password: hashedPassword,
          role: "doctor",
          crm: "123456-SP",
          specialty: "Clínica Geral"
        }
      });
      
      console.log("✅ Usuário criado com sucesso!");
      console.log("Email: doctor@test.com");
      console.log("Senha: 123456");
      console.log(testUser);
    } else {
      console.log("Usuários encontrados:");
      users.forEach(u => console.log(`- ${u.email} (${u.name})`));
    }
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
