import { notFound } from "next/navigation";
import ExercisePage from "~/app/exercise/ExercisePage";
import { db } from "~/server/db";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = await db.query.exercises.findFirst({
    where: (exercises, { eq }) => eq(exercises.slug, slug),
  });

  if (!exercise) notFound();

  return <ExercisePage dsl={exercise.dsl} />;
}
