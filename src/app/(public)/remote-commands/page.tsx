import SectionActions from "@/components/section-actions";
import { auth } from "@/auth";

export default async function RemoteCommandsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div>Você não tem permissão para visualizar a página requisitada.</div>
    );
  }

  if (session.user.email === "iceesar@live.com") {
    return (
      <>
        <SectionActions />
      </>
    );
  }
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">
        Você não tem permissão para visualizar a página requisitada.
      </h2>
    </>
  );
}
