import os
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, RedirectResponse

from liberty.framework.public import get_frontend_path, get_offline_path, get_setup_path


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
            return FileResponse(get_frontend_path())
                
        return {"detail": "Not Found"}, 404


    @app.get("/offline", include_in_schema=False)
    async def serve_react_app(request: Request):
        """
        Serve the React app, but redirect to offline if the database is not set up.
        """
        return FileResponse(get_offline_path())


    @app.get("/setup", include_in_schema=False)
    async def serve_react_app(request: Request):
        """
        Serve the React app, but redirect to offline if the database is not set up.
        """
        return FileResponse(get_setup_path())
    
    app.include_router(router)