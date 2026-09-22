"""Print the complete standards search response.

Usage:
    python test_search.py "protective helmets"
"""

import json
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def main() -> None:
    query = " ".join(sys.argv[1:]).strip() or "protective helmets"
    payload = json.dumps({"query": query, "top_k": 5}).encode("utf-8")
    request = Request(
        "http://127.0.0.1:8000/api/search",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request) as response:
            result = json.load(response)
    except HTTPError as error:
        print(error.read().decode("utf-8"), file=sys.stderr)
        raise

    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
