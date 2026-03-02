FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

ARG INSTALL_INGEST=false

COPY requirements.runtime.txt requirements.ingest.txt requirements.txt ./
RUN pip install --no-cache-dir -r requirements.runtime.txt \
    && if [ "$INSTALL_INGEST" = "true" ]; then pip install --no-cache-dir -r requirements.ingest.txt; fi

COPY . .

EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]