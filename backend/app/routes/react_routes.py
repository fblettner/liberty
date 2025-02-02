import os
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, RedirectResponse


def setup_react_routes(app):
    router = APIRouter()

    @app.get("/", include_in_schema=False)
    async def serve_react_app(request: Request):
        """
        Serve the React app, but redirect to installation if the database is not set up.
        """
        if getattr(app.state, "setup_required", False):
            return RedirectResponse(url="/setup")
    
        if getattr(app.state, "offline_mode", False):
            return RedirectResponse(url="/offline")
        
        accept = request.headers.get("accept", "")
        if "text/html" in accept:
            return FileResponse(os.path.join(os.path.dirname(os.path.dirname(__file__)), "public/frontend", "index.html"))
                
        return {"detail": "Not Found"}, 404


    @app.get("/offline", include_in_schema=False)
    async def serve_react_app(request: Request):
        """
        Serve the React app, but redirect to offline if the database is not set up.
        """
        return FileResponse(os.path.join(os.path.dirname(os.path.dirname(__file__)), "public/offline", "offline.html"))


    @app.get("/setup", include_in_schema=False)
    async def serve_react_app(request: Request):
        """
        Serve the React app, but redirect to offline if the database is not set up.
        """
        return FileResponse(os.path.join(os.path.dirname(os.path.dirname(__file__)), "public/setup", "index.html"))
    
    app.include_router(router)