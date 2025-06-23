import SectionActions from "@/components/section-actions";
import { auth } from "@/auth";

export const revalidate = 0;

export default async function RemoteCommandsPage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    return <SectionActions />;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-destructive">
        Acesso Negado
      </h2>
      <p className="text-muted-foreground">
        Você não tem permissão para visualizar esta página ou executar comandos
        remotos.
      </p>
    </div>
  );
}
