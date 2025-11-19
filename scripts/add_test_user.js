const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = "test@mail.fr";
    const password = "Test123$";
    const firstName = "Test";
    const lastName = "User";

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    const hashed = await bcrypt.hash(password, 10);

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
          password: hashed,
          isValidated: true,
          firstName,
          lastName,
        },
      });
      console.log(`Updated existing user: ${user.email}`);
    } else {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashed,
          firstName,
          lastName,
          isValidated: true,
        },
      });
      console.log(`Created user: ${user.email}`);
    }
  } catch (err) {
    console.error("Error creating/updating test user:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
