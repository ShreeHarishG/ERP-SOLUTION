const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "refresh_tokens" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "token_hash" VARCHAR(64) NOT NULL,
      "user_id" UUID NOT NULL,
      "is_revoked" BOOLEAN NOT NULL DEFAULT false,
      "expires_at" TIMESTAMPTZ(6) NOT NULL,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash")
  `);

  console.log('Successfully created refresh_tokens table and indexes safely without dropping any tables!');
  await prisma.$disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
