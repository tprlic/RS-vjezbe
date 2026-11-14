
import asyncio
import time


async def dohvati_korisnike():
    await asyncio.sleep(3)

    return [
        {"id": 1, "ime": "Tomislav"},
        {"id": 2, "ime": "Tomica"},
        {"id": 3, "ime": "Tomaš"}
    ]


async def dohvati_proizvode():
    await asyncio.sleep(5)

    return [
        {"id": 101, "naziv": "Tipkovnica"},
        {"id": 102, "naziv": "Miš"}
    ]


async def main():
    pocetak = time.perf_counter()

    korisnici, proizvodi = await asyncio.gather(
        dohvati_korisnike(),
        dohvati_proizvode()
    )

    print("Korisnici:", korisnici)
    print("Proizvodi:", proizvodi)

    trajanje = time.perf_counter() - pocetak
    print(f"Vrijeme izvođenja: {trajanje:.2f} sekundi")


asyncio.run(main())
