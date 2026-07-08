export async function buscarVehiculoPorQr(qrCode: string) {
  const response = await fetch(`/api/vehiculo/${qrCode}`)

  if (!response.ok) {
    throw new Error("Vehículo no encontrado");
  }

  return response.json();
}