import os
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse

def setup_react_routes(app):
    router = APIRouter()

    @app.get("/", include_in_schema=False)
    async def serve_react_app(request: Request):
        """
        Serve the React app for non-asset requests.
        """
        accept = request.headers.get("accept", "")
        if "text/html" in accept:
            return FileResponse(os.path.join(os.path.dirname(os.path.dirname(__file__)), "public", "index.html"))
        return {"detail": "Not Found"}, 404

    app.include_router(router)