import ButtonLink from "~/components/ButtonLink";
import LogoutButton from "./LogoutButton";

type User = {
  email: string;
  createdAt: Date;
};

export default function ProfileSection({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-xl font-extrabold tracking-tight text-soft-white">
          {user.email}
        </h2>
        <p className="font-mono text-xs text-muted">
          Member since{" "}
          {new Date(user.createdAt).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="h-px bg-medium/40" />

      <div className="flex flex-col gap-3">
        <ButtonLink
          variant="submit"
          size="md"
          href="/editor"
          className="w-full rounded-xl text-center font-mono tracking-wider"
        >
          Go to editor
        </ButtonLink>
        <LogoutButton />
      </div>
    </div>
  );
}
