from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router


app = FastAPI(
	title="PuenteCultural API",
	description="API para generación de fichas docentes con agentes IA",
	version="0.1.0",
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://127.0.0.1:5173",
		"http://localhost:5173",
		"http://127.0.0.1:5180",
		"http://localhost:5180",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health", tags=["system"])
def healthcheck() -> dict:
	return {"status": "ok"}


app.include_router(api_router, prefix="/api/v1")
