// utils/sendToN8N.js

export const sendToN8N = async (modulo, datos) => {
  try {
    const response = await fetch("http://localhost/webhook/arqueoN8N", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modulo,
        ...datos,
        fecha: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      alert(`✅ Datos de ${modulo} enviados correctamente a n8n`);
      console.log("Respuesta de n8n:", data);
    } else {
      alert(`❌ Error al enviar los datos de ${modulo} a n8n`);
    }
  } catch (error) {
    console.error("Error al enviar a n8n:", error);
    alert("❌ No se pudo conectar con n8n");
  }
};
