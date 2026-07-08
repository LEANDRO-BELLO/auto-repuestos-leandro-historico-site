import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = "./api/data/auto_repuestos_leandro.db";

console.log(DB_PATH);
console.log("Existe?", fs.existsSync(DB_PATH));

const db = new Database(DB_PATH, { readonly: true });

function nomeServicio(codigo) {
  const nomes = {
    aceite_motor: "Cambio de aceite motor",
    filtro_aceite: "Filtro de aceite",
    filtro_aire: "Filtro de aire",
    filtro_combustible: "Filtro de combustible",
    aceite_caja_cambio: "Cambio de aceite caja de cambio",
    fluido_freno: "Cambio de fluido de freno",
  };

  return nomes[codigo] || codigo;
}

function formatarData(data) {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarKm(km) {
  if (!km) return "—";
  return `${Number(km).toLocaleString("es-PY")} km`;
}

function buscarServiciosDaOrden(id) {
  return db.prepare(`
    SELECT *
    FROM ordenes_servicios
    WHERE orden_id = ?
  `).all(id);
}

app.get("/", (req, res) => {
  res.send("API Auto Repuestos Leandro funcionando.");
});

app.get("/api/vehiculo/:qr", (req, res) => {
  const qr = req.params.qr;

  const vehiculo = db.prepare(`
    SELECT v.*, c.nombre AS cliente_nombre
    FROM vehiculos v
    LEFT JOIN clientes c ON c.id = v.cliente_id
    WHERE v.qr_code = ?
  `).get(qr);

  if (!vehiculo) {
    return res.status(404).json({ ok: false, error: "Vehículo no encontrado" });
  }

  const historial = db.prepare(`
    SELECT *
    FROM ordenes_trabajo
    WHERE vehiculo_id = ?
      AND estado = 'Finalizada'
    GROUP BY id
    ORDER BY fecha DESC, id DESC
  `).all(vehiculo.id);

  res.json({ ok: true, vehiculo, historial });
});

app.get("/os/:id/pdf", (req, res) => {
  const id = req.params.id;

  const os = db.prepare(`
    SELECT ot.*, v.marca, v.modelo, v.placa, v.motor, c.nombre AS cliente_nombre
    FROM ordenes_trabajo ot
    LEFT JOIN vehiculos v ON v.id = ot.vehiculo_id
    LEFT JOIN clientes c ON c.id = ot.cliente_id
    WHERE ot.id = ?
  `).get(id);

  if (!os) {
    return res.status(404).send("Orden no encontrada");
  }

  const servicios = buscarServiciosDaOrden(id);

  const listaServicios = servicios.map(s => `
    <li>${nomeServicio(s.servicio)}</li>
  `).join("");

  const proximos = servicios
    .filter(s => s.proximo_km)
    .map(s => `
      <div class="linea">
        <span>${nomeServicio(s.servicio)}</span>
        <strong>${formatarKm(s.proximo_km)}</strong>
      </div>
    `).join("");

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>${os.numero_os}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: white;
          color: #000;
          padding: 40px;
        }
        .page {
          max-width: 760px;
          margin: auto;
        }
          .header div{
  display:flex;
  flex-direction:column;
  justify-content:center;
}
 .header{
    display:flex;
    align-items:center;
    gap:20px;

    background:#000;
    color:#fff;

    padding:0px 22px;   /* <-- diminui a altura do fundo preto */
    border-radius:4px;
    border-bottom:3px solid #d4af37;
}

.logo-img{
  width:170px;
  height:auto;
  display:block;
}

.header h3,
.header p {
  color: #ffffff !important;
  margin: 4px 0;
}
         
        
        h2 {
          color: #d4af37;
          font-size: 15px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-top: 22px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 60px;
        }
        .campo small {
          display: block;
          color: #333;
          font-size: 11px;
          text-transform: uppercase;
        }
        .campo strong {
          font-size: 14px;
        }
        li {
          margin-bottom: 8px;
        }
        .linea {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding: 8px 0;
        }
        .linea strong {
          color: #c49100;
        }
      </style>
    </head>
    <body>

   
     
          <div class="page">
  <div class="header">
    <img class="logo-img" src="http://192.168.0.116:5173/src/assets/logo-oficial.png" />
    
    <div>
            <h3>Ventas de repuestos y accesorios en general</h3>
            <p>Cambio de aceite y filtros en general</p>
            <p>Tel: +595 986 773 222   -   Katueté - Canindeyú - Paraguay</p>
          </div>
        </div>

       

        <h1>SERVICIOS REALIZADOS</h1>

        <h2>DATOS DE LA ORDEN</h2>
        <div class="grid">
          <div class="campo"><small>N° Orden</small><strong>${os.numero_os}</strong></div>
          <div class="campo"><small>Fecha</small><strong>${formatarData(os.fecha)}</strong></div>
          <div class="campo"><small>N° Factura</small><strong>${os.numero_factura || "—"}</strong></div>
          <div class="campo"><small>Estado</small><strong>${os.estado}</strong></div>
        </div>

        <h2>CLIENTE</h2>
        <div class="campo"><small>Nombre</small><strong>${os.cliente_nombre}</strong></div>

        <h2>VEHÍCULO</h2>
        <div class="grid">
          <div class="campo"><small>Vehículo</small><strong>${os.marca} ${os.modelo}</strong></div>
          <div class="campo"><small>Chapa</small><strong>${os.placa}</strong></div>
          <div class="campo"><small>KM actual</small><strong>${formatarKm(os.kilometraje)}</strong></div>
          <div class="campo"><small>Próximo KM</small><strong>${formatarKm(os.proximo_km)}</strong></div>
          <div class="campo"><small>Fecha de la próxima revisión</small><strong>${formatarData(os.fecha_vencimiento)}</strong></div>
        </div>

        <h2>SERVICIOS REALIZADOS</h2>
        <ul>${listaServicios}</ul>

        <h2>PRÓXIMA REVISIÓN — KM INDIVIDUALES</h2>
        ${proximos || "<p>—</p>"}
      </div>
    </body>
    </html>
  `);
});

app.use(express.static("dist"));

app.use((req, res) => {
  res.sendFile(process.cwd() + "/dist/index.html");
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});