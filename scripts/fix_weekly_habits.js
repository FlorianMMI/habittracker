/**
 * Script pour compléter rétroactivement les habitudes weekly
 * Si une habitude weekly a au moins une entrée validée cette semaine,
 * alors on complète toute la semaine (lundi à dimanche)
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Obtient les dates de la semaine en cours (lundi à dimanche)
 */
function getWeekDates(referenceDate = new Date()) {
  const dates = [];
  const current = new Date(referenceDate);
  current.setHours(0, 0, 0, 0);

  // Obtenir le jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
  const dayOfWeek = current.getDay();
  // Calculer le décalage pour arriver au lundi (1)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  // Créer la date du lundi
  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);

  // Générer les 7 jours de la semaine (lundi à dimanche)
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }

  return dates;
}

async function fixWeeklyHabits() {
  try {
    console.log("🔄 Début de la correction des habitudes weekly...\n");

    // Récupérer toutes les habitudes weekly
    const weeklyHabits = await prisma.habit.findMany({
      where: { frequency: "weekly" },
      include: { progress: true },
    });

    console.log(`📊 ${weeklyHabits.length} habitudes weekly trouvées\n`);

    const weekDates = getWeekDates();
    const startDate = weekDates[0];
    const endDate = weekDates[weekDates.length - 1];

    console.log(
      `📅 Semaine en cours: ${startDate.toLocaleDateString("fr-FR")} → ${endDate.toLocaleDateString("fr-FR")}\n`
    );

    let totalFixed = 0;

    for (const habit of weeklyHabits) {
      // Vérifier s'il existe au moins une entrée de progression cette semaine
      const progressThisWeek = habit.progress.filter((p) => {
        const progressDate = new Date(p.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate >= startDate && progressDate <= endDate;
      });

      if (progressThisWeek.length > 0) {
        console.log(`✅ Habitude: "${habit.name}" (${progressThisWeek.length} jours déjà validés)`);

        // Créer les entrées manquantes pour toute la semaine
        const entriesToCreate = [];
        for (const weekDate of weekDates) {
          const existingEntry = progressThisWeek.find((p) => {
            const pDate = new Date(p.date);
            pDate.setHours(0, 0, 0, 0);
            return pDate.getTime() === weekDate.getTime();
          });

          if (!existingEntry) {
            entriesToCreate.push({
              habitId: habit.id,
              date: weekDate,
              status: "done",
            });
          }
        }

        if (entriesToCreate.length > 0) {
          await prisma.progress.createMany({
            data: entriesToCreate,
            skipDuplicates: true,
          });
          console.log(`   → ${entriesToCreate.length} jours ajoutés`);
          totalFixed += entriesToCreate.length;
        } else {
          console.log(`   → Semaine déjà complète`);
        }
        console.log("");
      }
    }

    console.log(`\n✨ Terminé ! ${totalFixed} entrées de progression créées.`);
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixWeeklyHabits();
