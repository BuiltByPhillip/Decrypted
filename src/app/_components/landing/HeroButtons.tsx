import ButtonLink from "~/components/ButtonLink";


export default function HeroButtons() {
  return (
    <>
      <ButtonLink
        variant="submit"
        size="lg"
        href={"/editor"}>
        Create exercise
      </ButtonLink>
      <ButtonLink
        variant="outline"
        size="lg"
        href={"/docs"}
      >
        Documentation
      </ButtonLink>
    </>
  );
}