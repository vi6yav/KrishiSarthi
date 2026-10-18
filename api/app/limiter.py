from fastapi import Request
from slowapi import Limiter


def get_client_ip(request: Request) -> str:
    # On Render, the real visitor IP arrives in this header
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


limiter = Limiter(key_func=get_client_ip, default_limits=["120/minute"])