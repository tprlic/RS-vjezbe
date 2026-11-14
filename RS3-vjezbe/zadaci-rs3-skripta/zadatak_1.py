
import asyncio


async def fetch_data():
    await asyncio.sleep(3)

    podaci = [broj for broj in range(1, 11)]

    print("Podaci dohvaćeni.")
    return podaci


async def main():
    podaci = await fetch_data()
    print("Dohvaćeni podaci:", podaci)


asyncio.run(main())
