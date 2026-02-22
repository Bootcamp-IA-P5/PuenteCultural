# PuenteCultural
Plataforma SaaS con Agentes de IA para inclusión educativa y adaptación cultural.

## Frontend (React + Tailwind)

1. Entra a `frontend`.
2. Instala dependencias:
	- `npm install`
3. Configura variable de API:
	- Copia `frontend/.env.example` a `frontend/.env`
	- Verifica `VITE_API_URL=http://127.0.0.1:8000`
4. Ejecuta frontend:
	- `npm run dev -- --host 127.0.0.1 --port 5180`

Interfaz disponible en `http://127.0.0.1:5180`.

## Backend (LLM real)

1. Copia `backend/.env.example` a `backend/.env`.
2. Configura modo real:
	- `LLM_MODE=api`
	- `FALLBACK_MODE=raise`
3. Elige modelo y proveedor:
	- OpenAI: `MODEL=gpt-4o-mini` + `OPENAI_API_KEY=...`
	- Gemini: `MODEL=gemini/gemini-2.0-flash` + `GOOGLE_API_KEY=...`
	- Anthropic: `MODEL=anthropic/claude-3-5-haiku-latest` + `ANTHROPIC_API_KEY=...`
	- GitHub Models: `MODEL=github/gpt-4.1-mini` + `GITHUB_TOKEN=...`
	  (opcional explícito: `LLM_BASE_URL=https://models.inference.ai.azure.com`)
4. Instala dependencias:
	- `pip install -r backend/requirements.txt`
5. Ejecuta prueba:
	- `cd backend`
	- `python test_crew.py`

## Modos disponibles

- `LLM_MODE=api`: usa CrewAI + LLM real.
- `LLM_MODE=rules`: usa motor local por reglas (solo fallback local, sin API).

`FALLBACK_MODE` controla qué pasa en errores de API cuando `LLM_MODE=api`:
- `raise` (recomendado para desarrollo real): falla explícitamente.
- `rules`: cae al modo local por reglas.

## Levantar backend + frontend

Terminal 1 (backend):
- `cd backend`
- `.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000`

Terminal 2 (frontend):
- `cd frontend`
- `npm run dev -- --host 127.0.0.1 --port 5180`

## Checklist pre-despliegue

- Backend activo en `http://127.0.0.1:8000`.
- Frontend apuntando a backend con `VITE_API_URL=http://127.0.0.1:8000`.
- `backend/.env` con claves reales del proveedor LLM elegido.
- CORS local habilitado para `http://127.0.0.1:5173` y `http://127.0.0.1:5180`.

## Build de producción

- Frontend:
	- `cd frontend`
	- `npm run build`

- Backend (smoke check):
	- `cd backend`
	- `.\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
