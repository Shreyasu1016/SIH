"""Start Ollama and ensure the local recommendation model is installed.

Run from backend/ with:
    python local_llm.py
"""

import json
import os
import shutil
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import Request, urlopen


HOST = "http://localhost:11434"
MODEL = "llama3.1:8b"


def api(path: str, payload: dict | None = None, stream: bool = False):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(
        HOST + path,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    response = urlopen(request, timeout=600 if stream else 10)
    return response if stream else json.load(response)


def server_up() -> bool:
    try:
        api("/api/tags")
        return True
    except (OSError, URLError, TimeoutError):
        return False


def start_server() -> None:
    if server_up():
        return

    executable = shutil.which("ollama")
    if executable is None:
        raise RuntimeError("Ollama is not installed or is not available on PATH.")

    print("Starting Ollama server...")
    env = os.environ.copy()
    env.update({
        "OLLAMA_NUM_PARALLEL": "1",
        "OLLAMA_MAX_LOADED_MODELS": "1",
        "OLLAMA_FLASH_ATTENTION": "1",
        "OLLAMA_KV_CACHE_TYPE": "q8_0",
    })
    subprocess.Popen(
        [executable, "serve"],
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    for _ in range(30):
        if server_up():
            return
        time.sleep(1)
    raise RuntimeError("Ollama did not start. Check the Ollama installation and logs.")


def model_present() -> bool:
    names = [model["name"] for model in api("/api/tags").get("models", [])]
    return any(name == MODEL or name.startswith(MODEL + ":") for name in names)


def pull_model() -> None:
    print(f"Model '{MODEL}' is missing. Downloading it now...")
    with api("/api/pull", {"model": MODEL, "stream": True}, stream=True) as response:
        for line in response:
            info = json.loads(line)
            total = info.get("total")
            completed = info.get("completed")
            if total and completed:
                percent = completed * 100 // total
                print(f"\r{info.get('status', 'Downloading')}: {percent}%  ", end="", flush=True)
    print("\nDownload complete.")


def main() -> int:
    try:
        start_server()
        if model_present():
            print(f"{MODEL} is ready.")
        else:
            pull_model()
            print(f"{MODEL} is ready.")
    except (OSError, RuntimeError, URLError, TimeoutError, json.JSONDecodeError) as error:
        print(f"Ollama setup failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
