export async function buscarVehiculoPorQr(qrCode: string) {
  const response = await fetch(
    `http://192.168.0.116:3001/vehiculo/${qrCode}`
  );

  if (!response.ok) {
    throw new Error("Vehículo no encontrado");
  }

  return response.json();
}