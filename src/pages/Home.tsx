import logo from "../assets/logo-oficial.png";

export default function Home() {
  return (
    <main className="app-page">

      <div className="home-logo">
        <img src={logo} alt="Auto Repuestos Leandro" />
      </div>

      <h1 className="home-title">
        PORTAL DE HISTORIAL
      </h1>

      <h2 className="home-company">
        AUTO REPUESTOS LEANDRO S.A.
      </h2>

      <p className="home-text">
        Consulte el historial completo de mantenimiento de su vehículo.
      </p>

      <div className="home-card">

        <h3>¿Qué podrá consultar?</h3>

        <ul>
          <li>✔ Historial completo de servicios</li>
          <li>✔ Facturas realizadas</li>
          <li>✔ Próximo mantenimiento</li>
          <li>✔ Kilometraje registrado</li>
          <li>✔ Fecha del último servicio</li>
        </ul>

      </div>

      <div className="home-footer">
        <strong>Auto Repuestos Leandro S.A.</strong><br />
        Katueté - Canindeyú - Paraguay<br />
        WhatsApp: +595 986 773 222
      </div>

    </main>
  );
}