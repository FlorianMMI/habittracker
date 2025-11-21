-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'done',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Progress_habitId_idx" ON "Progress"("habitId");

-- CreateIndex
CREATE INDEX "Progress_date_idx" ON "Progress"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_habitId_date_key" ON "Progress"("habitId", "date");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
