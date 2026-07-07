import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { buscarVehiculoPorQr } from "../services/api";
import logo from "../assets/logo-oficial.png";

function formatarData(data?: string) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Vehiculo() {
  const { qr } = useParams();
  const [dados, setDados] = useState<any>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarVehiculoPorQr(qr || "")
      .then(setDados)
      .catch((err) => setErro(err.message));
  }, [qr]);

  if (erro) return <div className="app-page"><h2>{erro}</h2></div>;
  if (!dados) return <div className="app-page"><h2>Cargando historial...</h2></div>;

  const { vehiculo, historial } = dados;

  function abrirPdf(os: any) {
    window.open(`http://192.168.0.116:3001/os/${os.id}/pdf`, "_blank");
  }

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
        <h2>{vehiculo.modelo}</h2>

        <div className="vehicle-grid">
          <div className="info-box">
            <span>Cliente</span>
            <strong>{vehiculo.cliente_nombre}</strong>
          </div>

          <div className="info-box">
            <span>Chapa</span>
            <strong>{vehiculo.placa}</strong>
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
        {!historial || historial.length === 0 ? (
          <p>No hay servicios registrados para este vehículo.</p>
        ) : (
          <div className="historial-lista">
            {historial.map((os: any) => (
              <div key={os.id} className="historial-item">
                <span>Fecha {formatarData(os.fecha)}</span>
                <strong>Factura {os.numero_factura || "—"}</strong>

                <button
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