import Database from "better-sqlite3";

const db = new Database(
  "C:\\Users\\User\\Documents\\GitHub\\auto-repuestos-leandro-connect\\data\\auto_repuestos_leandro.db"
);

console.log(
  db.prepare(`
    SELECT id, numero_os, fecha, estado
    FROM ordenes_trabajo
    WHERE vehiculo_id = (
      SELECT id
      FROM vehiculos
      WHERE placa='AAKY297'
    )
    ORDER BY fecha DESC
  `).all()
);