import asyncio
import logging
import sys

# Configure global logging
logging.basicConfig(
    level=logging.WARN,  
    format="%(asctime)s - %(levelname)s - %(message)s",  
)

import os
from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.staticfiles import StaticFiles
from fastapi_socketio import SocketManager
import uvicorn
from liberty.framework.utils.jwt import JWT
from liberty.framework.controllers.setup_controller import SetupController
from liberty.framework.controllers.api_controller import ApiController
from liberty.framework.controllers.socket_controller import SocketController
from liberty.framework.routes.api_routes import setup_api_routes
from liberty.framework.routes.react_routes import setup_react_routes
from liberty.framework.routes.socket_routes import setup_socket_routes
from liberty.framework.routes.setup_routes import setup_setup_routes
from liberty.framework.config import get_db_properties_path
from contextlib import asynccontextmanager
from liberty.framework.public import get_frontend_assets_path, get_offline_assets_path, get_setup_assets_path
from liberty.framework.services.rest_services import Rest
from liberty.framework.services.api_services import API


class BackendAPI:
    def __init__(self):
        self.jwt = JWT()
        self.api = API(self.jwt)
        self.rest = Rest(self.api)
        self.api_controller = ApiController(self.jwt, self.api, self.rest)
        self.socket_controller = SocketController()
        self.setup_controller = SetupController(self.api_controller, self.jwt)

        self.socket_manager = None

    def setup_routes(self, app: FastAPI):
        setup_api_routes(app, self.api_controller, self.jwt)
        setup_react_routes(app)
        setup_socket_routes(app, self.socket_controller)
        setup_setup_routes(app, self.setup_controller)

    def setup_sockets(self, app: FastAPI):
        # Attach Socket.IO manager

        self.socket_manager = SocketManager(app, cors_allowed_origins="*")
        # Pass the AsyncServer instance to the SocketController
        self.socket_controller.socketio_mount(app)
        self.socket_controller.set_api_controller(self.api_controller)
        

        @self.socket_controller.io.on("connect")
        async def connect(sid, environ, auth):
            client = environ.get("asgi.scope", {}).get("client", ("unknown", "unknown"))
            self.socket_controller.connected_clients[sid] = {"user": auth.get("user"), "app": auth.get("app"), "client": client}

            """Handle new socket connections."""
            app_room = f"appsID_{auth["app"]}"  # Extract app from the handshake
            await self.socket_controller.io.enter_room(sid, app_room, namespace="/")
            logging.debug(f"Socket connected: {sid}, joined room: {app_room}")


        @self.socket_controller.io.on("reserve")
        async def reserve(sid, record_id):
            """
            Handle reserve event for a specific record ID.
            Goal: Check if a record ID is reserved (already in a room).
            - If it's reserved, send KO.
            - If not reserved, mark it as reserved and send OK.
            """
            # Access rooms in the default namespace "/"
            rooms = self.socket_controller.io.manager.rooms.get("/", {})

            # Check if the record_id exists as a key in the rooms
            if record_id in rooms:
                # Record is already reserved
                room_participants = rooms[record_id]
                is_current_socket_in_room = sid in room_participants

                if is_current_socket_in_room:
                    logging.debug(f"Record reserved by the current user: {record_id}")
                    return {"status": "OK", "record": record_id}
                else:
                    logging.debug(f"Record reserved: {record_id}")
                    return {"status": "KO", "record": record_id}
            else:
                # Record is not reserved, reserve it by adding the socket to the room
                logging.debug(f"Socket {sid} reserve record: {record_id}")
                await self.socket_controller.io.enter_room(sid, record_id)
                return {"status": "OK", "record": record_id}

        @self.socket_controller.io.on("release")
        async def release(sid, record_id):
            """Handle release event for a specific record ID."""
            await self.socket_controller.io.leave_room(sid, record_id, namespace="/")
            logging.debug(f"Socket {sid} release record: {record_id}")


        @self.socket_controller.io.on("signout")
        async def signout(sid):
            """Handle user signout and clean up their rooms."""
            for room in self.socket_controller.io.rooms(sid):
                if room.startswith("appsID_"):
                    await self.socket_controller.io.leave_room(sid, room, namespace="/")
                    self.socket_controller.connected_clients.pop(sid, None)  
                    logging.debug(f"Socket {sid} left app room: {room}")

        @self.socket_controller.io.on("disconnect")
        async def disconnect(sid, reason):
            """Handle socket disconnection."""
            for room in self.socket_controller.io.rooms(sid):
                await self.socket_controller.io.leave_room(sid, room, namespace="/")
                self.socket_controller.connected_clients.pop(sid, None)  
                logging.debug(f"Socket {sid} left room: {room}")

            logging.debug(f"Socket disconnected: {sid}")

description = """
**Liberty API** provides a powerful and scalable backend for managing authentication, 
database operations, and framework functionalities in the **Liberty Framework**. 

### 🔹 Key Features:
- **Authentication & Authorization**: Secure endpoints with JWT tokens and OAuth2.
- **Database Management**: Query, insert, update, and delete records across multiple pools.
- **Framework Controls**: Manage modules, applications, themes, and logs.
- **Security & Encryption**: Encrypt data and ensure safe database access.
- **Logging & Auditing**: Retrieve and analyze logs for security and debugging.

### 🔹 Authentication
- **`/api/auth/token`** - Generate a JWT token for authentication.
- **`/api/auth/user`** - Retrieve authenticated user details.

### 🔹 Database Operations
- **`/api/db/check`** - Validate database connection.
- **`/api/db/query`** - Retrieve, insert, update, or delete records.
- **`/api/db/audit/{table}/{user}`** - Audit changes on a specific table.

### 🔹 Framework Features
- **`/api/fmw/modules`** - Retrieve framework modules.
- **`/api/fmw/applications`** - Retrieve available applications.
- **`/api/fmw/themes`** - Manage application themes.

**🔗 Explore the API using Swagger UI (`/api/test`) or Redoc (`/api`).**
"""

# Create the FastAPI app
app = FastAPI(
    title="Liberty API",
    description=description,
    version="1.0.0",
    docs_url="/api/test",  # Swagger UI
    redoc_url="/api",  # ReDoc
    openapi_url="/liberty-api.json",  # OpenAPI schema
)


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    """
    Custom handler for HTTPExceptions to include additional fields.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "failed",
            "message": exc.detail or "An unexpected error occurred"
        },
    )

# Initialize BackendAPI and register routes and sockets
backend_api = BackendAPI()
backend_api.setup_routes(app)
backend_api.setup_sockets(app)

@asynccontextmanager
async def lifespan(app: FastAPI):
    query_instance = backend_api.api_controller.api
    app.mount(
        "/offline/assets",
        StaticFiles(directory=get_offline_assets_path(), html=True),
        name="assets",
    )
    app.mount(
        "/setup/assets",
        StaticFiles(directory=get_setup_assets_path(), html=True),
        name="assets",
    )   
    app.mount(
        "/assets",
        StaticFiles(directory=get_frontend_assets_path(), html=True),
        name="assets",
    )        

    app.state.setup_required = False
    app.state.offline_mode = False
    db_properties_path = get_db_properties_path()
    if not os.path.exists(db_properties_path):
        logging.debug("Database properties file is missing. Setup required.")
        app.state.setup_required = True

    try:        
        config = query_instance.load_db_properties(db_properties_path)
        await query_instance.default_pool(config)
    except Exception as e:
        logging.error(f"Database is not available")
        app.state.offline_mode = True
    yield
    print("Shutting down...")
    await asyncio.sleep(0) 


def main():
    """Entry point for running the application."""
    config = uvicorn.Config("liberty.framework.main:app", host="0.0.0.0", port=8000, reload=True, log_level="warning")
    server = uvicorn.Server(config)
    
    try:
        logging.warning("Starting Liberty Framework... Press Ctrl+C to stop.")
        logging.warning("Liberty Framework started at: http://0.0.0.0:8000")
        server.run()
    except KeyboardInterrupt:
        logging.warning("Server shutting down gracefully...")
        sys.exit(0)  # Exit without error

if __name__ == "__main__":
    main()

# Set the lifespan handler
app.router.lifespan_context = lifespan