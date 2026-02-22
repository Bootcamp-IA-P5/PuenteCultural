import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings
from pymongo import MongoClient
from dotenv import load_dotenv

try:
    from crewai.tools import BaseTool
except ModuleNotFoundError:
    class BaseTool:
        name: str = ""
        description: str = ""

# Cargar variables de entorno desde .env (si se ejecuta directo)
load_dotenv()

class RAGTool(BaseTool):
    name: str = "Buscador Oficial MongoDB"
    description: str = (
        "Busca información en currículos oficiales almacenados en la nube de MongoDB. "
        "Úsalo para obtener datos precisos de historia o literatura."
    )
    
    def _run(self, query: str) -> str:
        try:
            # 1. Configurar Conexión
            mongo_uri = os.getenv("MONGODB_URI")
            if not mongo_uri:
                return "Error: Falta la variable MONGODB_URI en el .env"
                
            # 2. Embeddings (Mismo modelo, pero ahora buscamos en la nube)
            embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            
            # 3. Conectar al Vector Store de Atlas
            vector_store = MongoDBAtlasVectorSearch.from_connection_string(
                connection_string=mongo_uri,
                namespace="puente_cultural_db.curriculo_vectors",
                embedding=embeddings,
                index_name="default" 
            )
            
            # 4. Búsqueda
            docs = vector_store.similarity_search(query, k=3)
            if not docs:
                return "No se encontró información relevante en los documentos."
                
            return "\n\n".join([d.page_content for d in docs])
            
        except Exception as e:
            return f"Error en búsqueda vectorial: {str(e)}"

# --- Script de Ingestión (Solo ejecutar manualmente para subir PDFs) ---
def ingest_pdfs_to_atlas(pdf_folder=None):
    if pdf_folder is None:
        backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        pdf_folder = os.path.join(backend_root, "data", "raw_pdfs")
    print(f"--- Iniciando subida de PDFs desde {pdf_folder} a MongoDB ---")
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("Error: Configura MONGODB_URI en .env primero.")
        return

    # 1. Cargar PDFs
    documents = []
    if not os.path.exists(pdf_folder):
        os.makedirs(pdf_folder)
        print(f"Carpeta creada: {pdf_folder}. Añade PDFs ahí y vuelve a ejecutar.")
        return

    for filename in os.listdir(pdf_folder):
        if filename.endswith('.pdf'):
            file_path = os.path.join(pdf_folder, filename)
            print(f"Procesando: {filename}...")
            loader = PyPDFLoader(file_path)
            documents.extend(loader.load())
    
    if not documents:
        print(f"No se encontraron PDFs en la carpeta: {pdf_folder}")
        return

    # 2. Dividir texto
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(documents)
    
    # 3. Subir a MongoDB Atlas
    print(f"Subiendo {len(splits)} fragmentos a la nube...")
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    client = MongoClient(mongo_uri)
    collection = client["puente_cultural_db"]["curriculo_vectors"]
    
    MongoDBAtlasVectorSearch.from_documents(
        documents=splits,
        embedding=embeddings,
        collection=collection,
        index_name="default"
    )
    print("--- ¡Subida completada! Tus agentes ahora tienen cerebro en la nube ---")

if __name__ == "__main__":
    # Ejecuta esto para subir los PDFs
    ingest_pdfs_to_atlas()