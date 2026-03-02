// En producción (DigitalOcean con rutas configuradas), usamos la misma URL base
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin

export async function generateGuide(payload) {
    // Si API_BASE_URL ya incluye '/api', no lo duplicamos. 
    // Pero según tu configuración de DO, el prefijo es /api
    const url = `${API_BASE_URL}/api/v1/generate`

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'No fue posible generar la ficha docente.')
    }

    return response.json()
}
