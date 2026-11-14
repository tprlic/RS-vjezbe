
import asyncio
import hashlib


async def secure_data(podaci):
    await asyncio.sleep(3)

    broj_kartice_hash = hashlib.sha256(
        str(podaci["broj_kartice"]).encode("utf-8")
    ).hexdigest()

    cvv_hash = hashlib.sha256(
        str(podaci["CVV"]).encode("utf-8")
    ).hexdigest()

    return {
        "prezime": podaci["prezime"],
        "broj_kartice": broj_kartice_hash,
        "CVV": cvv_hash
    }


async def main():
    osjetljivi_podaci = [
        {
            "prezime": "Horvat",
            "broj_kartice": "1111222233334444",
            "CVV": "123"
        },
        {
            "prezime": "Novak",
            "broj_kartice": "5555666677778888",
            "CVV": "456"
        },
        {
            "prezime": "Kovač",
            "broj_kartice": "9999000011112222",
            "CVV": "789"
        }
    ]

    zadaci = [
        asyncio.create_task(secure_data(podaci))
        for podaci in osjetljivi_podaci
    ]

    rezultati = await asyncio.gather(*zadaci)

    for rezultat in rezultati:
        print(rezultat)


asyncio.run(main())
