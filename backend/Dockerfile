FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY backend /app/backend
COPY data /app/data

RUN pip install --upgrade pip \
    && pip install /app/backend

WORKDIR /app/backend

RUN chmod +x /app/backend/entrypoint.sh

EXPOSE 8000

CMD ["/app/backend/entrypoint.sh"]
