
import asyncio
import time


async def fetch_data(param):
    print(f"Nešto radim s {param}...")
    await asyncio.sleep(param)
    print(f"Dovršio sam s {param}.")
    return f"Rezultat za {param}"


async def main():
    task1 = asyncio.create_task(fetch_data(1))
    task2 = asyncio.create_task(fetch_data(2))

    result1 = await task1
    print("Fetch 1 uspješno završen.")

    await asyncio.wait({task2})

    return [result1]


pocetak = time.perf_counter()
results = asyncio.run(main())
kraj = time.perf_counter()

print(results)
print(f"Vrijeme izvođenja {kraj - pocetak:.2f} sekunde")
