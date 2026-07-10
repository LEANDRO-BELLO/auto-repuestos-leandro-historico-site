import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { buscarVehiculoPorQr } from "../services/api";
import logo from "../assets/logo-oficial.png";

function formatarData(data?: string) {
  if (!data) return "—";

  const partes = data.split("-");

  if (partes.length === 3) {
    return `${partes[2].slice(0, 2)}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

export default function Vehiculo() {
  const { qr } = useParams();
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro("");

        if (!qr) {
          throw new Error("Código QR inválido.");
        }

        const resposta = await buscarVehiculoPorQr(qr);

        console.log("RESPOSTA DO PORTAL:", resposta);

        if (!resposta?.ok || !resposta?.vehiculo) {
          throw new Error(
            resposta?.error || "Vehículo no encontrado."
          );
        }

        setDados({
          vehiculo: resposta.vehiculo,
          historial: Array.isArray(resposta.historial)
            ? resposta.historial
            : [],
        });
      } catch (error: any) {
        console.error("ERRO AO CARREGAR PORTAL:", error);
        setErro(error?.message || "No se pudo cargar el historial.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [qr]);

  function abrirPdf(os: any) {
    if (!os?.id) return;
    window.location.href = `/os/${os.id}/pdf`;
  }

  if (carregando) {
    return (
      <main className="app-page">
        <h2>Cargando historial...</h2>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="app-page">
        <h2>{erro}</h2>
      </main>
    );
  }

  if (!dados?.vehiculo) {
    return (
      <main className="app-page">
        <h2>Vehículo no encontrado.</h2>
      </main>
    );
  }

  const vehiculo = dados.vehiculo;
  const historial = dados.historial;

  return (
    <main className="app-page">
      <div className="qr-logo-area">
        <img
          src={logo}
          alt="Auto Repuestos Leandro"
          className="qr-logo"
        />
      </div>

      <section className="vehicle-card">
        <h2>{vehiculo.modelo || "Vehículo"}</h2>

        <div className="vehicle-grid">
          <div className="info-box">
            <span>Cliente</span>
            <strong>{vehiculo.cliente_nombre || "—"}</strong>
          </div>

          <div className="info-box">
            <span>Chapa</span>
            <strong>{vehiculo.placa || "—"}</strong>
          </div>

          <div className="info-box">
            <span>Motor</span>
            <strong>{vehiculo.motor || "—"}</strong>
          </div>

          <div className="info-box">
            <span>Año</span>
            <strong>{vehiculo.anio || "—"}</strong>
          </div>
        </div>
      </section>

      <h2 className="section-title">Historial de Servicios</h2>

      <section className="service-card">
        {historial.length === 0 ? (
          <p>No hay servicios registrados para este vehículo.</p>
        ) : (
          <div className="historial-lista">
            {historial.map((os: any) => (
              <div key={os.id} className="historial-item">
                <span>Fecha {formatarData(os.fecha)}</span>

                <strong>
                  Factura {os.numero_factura || "—"}
                </strong>

                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => abrirPdf(os)}
                >
                  VER
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}