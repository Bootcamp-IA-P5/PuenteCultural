import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from dotenv import load_dotenv

from app.agents.crew import GeneradorContenidoCrew
from app.api.schemas import GenerateRequest, GenerateResponse

load_dotenv()

router = APIRouter(tags=["generacion"])

# --- Configuración MongoDB ---
MONGO_URI = os.getenv("MONGODB_URI")
db_client = None
fichas_collection = None

if MONGO_URI:
    try:
        db_client = MongoClient(MONGO_URI)
        db = db_client["puente_cultural_db"]
        fichas_collection = db["historial_fichas"]
        print("✅ Conexión a MongoDB Atlas exitosa para guardar historial.")
    except Exception as e:
        print(f"⚠️ Error conectando a MongoDB: {e}")

@router.post("/generate", response_model=GenerateResponse)
def generate_docente(payload: GenerateRequest) -> GenerateResponse:
    try:
        # 1. Generar contenido con los agentes
        generador = GeneradorContenidoCrew(
            tema=payload.tema,
            materia=payload.materia,
            perfil_alumnos=payload.perfil_alumnos,
        )
        resultado = generador.run()
        resultado_str = str(resultado)

        # 2. Guardar en MongoDB (si hay conexión)
        if fichas_collection is not None:
            try:
                ficha_doc = {
                    "tema": payload.tema,
                    "materia": payload.materia,
                    "perfil_alumnos": payload.perfil_alumnos,
                    "contenido": resultado_str,
                    "fecha_creacion": datetime.utcnow()
                }
                insert_result = fichas_collection.insert_one(ficha_doc)
                print(f"💾 Ficha guardada en BD con ID: {insert_result.inserted_id}")
            except Exception as e:
                print(f"⚠️ No se pudo guardar en BD: {e}")

        return GenerateResponse(resultado=resultado_str)

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Error interno generando contenido: {error}") from error