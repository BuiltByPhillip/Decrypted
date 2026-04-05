import ButtonLink from "~/components/ButtonLink";

export default function CTAButton() {
  return (
    <ButtonLink
      variant="submit"
      size="lg"
      href={"/editor"}>
      Open the editor
    </ButtonLink>
  );
}