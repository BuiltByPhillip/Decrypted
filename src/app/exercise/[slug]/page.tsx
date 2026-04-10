import ExercisePage from "~/app/exercise/ExercisePage";

export default async function Page({ params}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dsl = decodeURIComponent(Buffer.from(slug, "base64url").toString("ascii"));
  return <ExercisePage dsl={dsl} />;
} 