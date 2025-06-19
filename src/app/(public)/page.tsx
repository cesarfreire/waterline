import client from "@/lib/mongodb";
import {
  LayoutDashboard,
  PanelLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// componente para o indicador de status da conexao
const ConnectionStatusIndicator = ({
  isConnected,
}: {
  isConnected: boolean;
}) => {
  return (
    <div className="fixed bottom-4 right-4 group z-50">
      <div
        className={`w-3 h-3 rounded-full transition-colors ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <div className="absolute bottom-full right-0 mb-2 w-max bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {isConnected
          ? "Conectado ao MongoDB"
          : "Falha na conexão com o MongoDB"}
      </div>
    </div>
  );
};

// funcao para verificar a conexao com o banco
async function getConnectionState() {
  try {
    await client.db("admin").command({ ping: 1 });
    return { isConnected: true };
  } catch (e) {
    console.error("Falha na conexão com o MongoDB:", e);
    return { isConnected: false };
  }
}

export default async function Home() {
  const { isConnected } = await getConnectionState();

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center p-4">
      {/* Conteúdo Principal */}
      <main className="flex flex-col items-center text-center max-w-2xl">
        <LayoutDashboard className="w-16 h-16 mb-6 text-cyan-500" />

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Bem-vindo ao Waterline
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Seu sistema de monitoramento e automação de aquários. Monitore
          sensores, acione dispositivos e consulte todo o histórico em um só
          lugar.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-md">
          <div className="w-full bg-muted/50 border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center gap-3">
            <PanelLeft className="w-6 h-6 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">
              Use o menu à esquerda para navegar.
            </span>
          </div>

          {!isConnected && (
            <div className="w-full border border-destructive/50 bg-destructive/10 text-destructive rounded-lg p-3 flex items-center justify-center gap-2 text-sm">
              <XCircle className="w-4 h-4" />
              <span>Atenção: Não foi possível conectar ao banco de dados.</span>
            </div>
          )}
        </div>
      </main>

      {/* indicador status conexao com o banco */}
      <ConnectionStatusIndicator isConnected={isConnected} />
    </div>
  );
}
