import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const username = "ayberkkaya"
  const password = "a1s2d3f4"

  const hashedPassword = await hash(password, 10)

  const user = await prisma.user.upsert({
    where: { username },
    update: {
      password: hashedPassword,
    },
    create: {
      username,
      password: hashedPassword,
    },
  })

  console.log(`User "${user.username}" created/updated successfully`)
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
