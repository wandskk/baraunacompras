import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || "teste@email.com";
  const password = process.argv[3] || "123456";

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.updateMany({
    where: { email },
    data: { password: passwordHash },
  });

  if (user.count === 0) {
    console.error(`Usuário com email "${email}" não encontrado.`);
    process.exit(1);
  }

  console.log(`Senha do usuário ${email} atualizada com hash usando JWT_SECRET.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
