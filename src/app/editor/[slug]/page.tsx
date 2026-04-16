import { cookies } from "next/headers";
import { verifyToken } from "~/server/session";
import { db } from "~/server/db";
import { notFound } from "next/navigation";
import EditorControls from "~/app/_components/editor/EditorControls";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = token ? await verifyToken(token) : null;

  const exercise = await db.query.exercises.findFirst({
    where: (exercises, { eq }) => eq(exercises.slug, slug),
  });

  // Return 404 for missing exercises, unauthenticated users, and exercises
  // owned by someone else — all three cases look identical to the caller.
  if (!exercise || !session || exercise.userId !== session.userId) notFound();

  return <EditorControls dsl={exercise.dsl} id={exercise.id} />;
}
