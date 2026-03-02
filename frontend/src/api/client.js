const rawApiBase = import.meta.env.VITE_API_URL
const API_BASE_URL = rawApiBase === undefined ? 'http://127.0.0.1:8000' : rawApiBase.replace(/\/+$/, '')

export async function generateGuide(payload) {
    const response = await fetch(`${API_BASE_URL}/api/v1/generate`, {
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
