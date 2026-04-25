from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import articles, book, entities, events, graph, ideas, map, search

app = FastAPI(title="MaoXuan Knowledge Timeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router)
app.include_router(book.router)
app.include_router(events.router)
app.include_router(ideas.router)
app.include_router(entities.router)
app.include_router(graph.router)
app.include_router(map.router)
app.include_router(search.router)


@app.get("/health")
def health():
    return {"status": "ok"}
