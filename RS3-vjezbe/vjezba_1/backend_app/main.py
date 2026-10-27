
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="IT Lab API",
    description="REST API za evidenciju računalne opreme",
    version="1.0.0"
)

# Dopusti komunikaciju s objavljenim frontendom.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rs-vjezbe-it-lab.onrender.com",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

equipment = [
    {
        "id": 1,
        "name": "Računalo",
        "category": "Računalna oprema",
        "status": "Ispravno"
    },
    {
        "id": 2,
        "name": "Mrežni preklopnik",
        "category": "Mrežna oprema",
        "status": "Ispravno"
    },
    {
        "id": 3,
        "name": "Tipkovnica",
        "category": "Periferna oprema",
        "status": "Potrebna provjera"
    }
]


class Message(BaseModel):
    message: str


@app.get("/")
def home():
    return {
        "message": "IT Lab API je pokrenut."
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/api/equipment")
def get_equipment():
    return {
        "count": len(equipment),
        "equipment": equipment
    }


@app.post("/api/echo")
def echo_message(data: Message):
    return {
        "received": data.message,
        "status": "Zahtjev uspješno obrađen"
    }
