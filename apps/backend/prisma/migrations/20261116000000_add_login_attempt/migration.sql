-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "last_attempt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),
    "blocked_until" TIMESTAMP(3),

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoginAttempt_email_key" ON "LoginAttempt"("email");

-- Passwords are owned by Supabase Auth
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
