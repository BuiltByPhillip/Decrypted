import SurveyForm from "./SurveyForm";

export default async function SurveyPage({ params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  return <SurveyForm exerciseId={exerciseId} />;
}
