import logging
logger = logging.getLogger(__name__)

import json
from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import JSONResponse, HTMLResponse
from typing import Optional
from socketio import ASGIApp, AsyncServer
from fastapi import FastAPI
from app.controllers.api_controller import ApiController

class SocketController:
    def __init__(self, io: Optional[AsyncServer] = None):
        self.io = io
        self.connected_clients = {}

    def set_api_controller(self, api_controller: ApiController):
        self.api_controller = api_controller

    def socketio_mount(
        self,
        app: FastAPI,
        async_mode: str = "asgi",
        mount_path: str = "/socket.io/",
        socketio_path: str = "socket.io",
        logger: bool = False,
        engineio_logger: bool = False,
        cors_allowed_origins="*",
        **kwargs
    ) -> AsyncServer:
        """Mounts an async SocketIO app over an FastAPI app."""

        sio = AsyncServer(async_mode=async_mode,
                        cors_allowed_origins=cors_allowed_origins,
                        logger=logger,
                        engineio_logger=engineio_logger, **kwargs)

        sio_app = ASGIApp(sio, socketio_path=socketio_path)

        # mount
        app.add_route(mount_path, route=sio_app, methods=["GET", "POST"])
        app.add_websocket_route(mount_path, sio_app)

        self.io = sio        

    async def default(self):
        """Returns a basic status message."""
        return {"message": "Socket Listener is running!"}

    async def applications(self, request: Request):
        """Fetch details about connected applications and users."""
        if not self.io:
            raise HTTPException(status_code=503, detail="Socket.io instance is not yet initialized.")

        display_format = request.query_params.get("format", "json") 
        rooms = rooms = self.io.manager.rooms.get("/", {})  # Retrieve room information
        reserved_records = []
        
        # Collect reserved records and user details
        for room_name in rooms.keys():
    
            # Exclude reserved room names that start with "appsID_"
            if room_name and not room_name.startswith("appsID_") and room_name not in self.connected_clients:
                reserved_records.append(room_name)


        # Pool info (simulate fetching details from a database pool if needed)
        pool_info = []
        for pool in self.api_controller.queryRest.db_pools.pools.keys():
            pool_info.append(self.api_controller.get_pool_info(request, pool))

        applications = list(set(user["app"] for user in self.connected_clients.values()))
        response_data = {
            "applicationsCount": len(applications),
            "connectedUsersCount": len(self.connected_clients),
            "connectedUsers": self.connected_clients,
            "reservedRecords": reserved_records,
            "poolInfo": pool_info,
        }

        # Return JSON response
        if display_format == "json":
            return JSONResponse(content=response_data)

        # Generate HTML response
        if display_format == "html":
            html_page = f"""
            <html>
            <head>
                <title>Socket Information</title>
          <style>
            /* Base Styles */
            body {{
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(to left, #2C5364, #203A43, #0F2027);
              color: #E1D9D1;
            }}
            h1 {{
              color: #E1D9D1;
              font-weight: 300;
              font-size: 2rem;
              margin-bottom: 20px;
            }}
            h2 {{
              color: #FFB300;
              font-weight: 400;
              font-size: 1.5rem;
              margin-bottom: 10px;
            }}
            /* Table Styles */
            table {{
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              color: #E1D9D1;
              background-color: #2A3A44; 
            }}
            th, td {{
              padding: 12px;
              border: 1px solid #ff9800; 
              text-align: left;
            }}
            th {{
              background-color: #203A43;
              color: #E1D9D1;
              font-weight: bold;
            }}
            tr:nth-child(even) {{
              background-color: rgba(255, 255, 255, 0.05);
            }}
            tr:hover {{
              background-color: rgba(255, 152, 0, 0.1);
            }}
            .section {{
              margin-bottom: 20px;
            }}
            /* Button Styles */
            .download-btn {{
              padding: 8px 16px;
              color: #E1D9D1;
              background-color: transparent;
              border: 1px solid #ff9800;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.3s ease;
              margin-right: 10px;
            }}
            .download-btn:hover {{
              background-color: #FFB74D;
            }}
          </style>
            </head>
            <body>
                <h1>Socket Information</h1>

                <div class="section">
                <h2>Connected Applications</h2>
                <p>Total Connected Applications: {len(applications)}</p>
                <ul>
                    {"".join(f"<li>Application ID: {app}</li>" for app in applications)}
                </ul>
                </div>

                <div class="section">
                <h2>Connected Users</h2>
                <p>Total Connected Users: {len(self.connected_clients)}</p>
                <table>
                    <thead>
                        <tr><th>User</th><th>Application</th><th>Client</th></tr>
                    </thead>
                    <tbody>
                        {"".join(f"<tr><td>{user['user']}</td><td>{user['app']}</td><td>{user['client']}</td></tr>" for user in self.connected_clients.values())}
                    </tbody>
                </table>
                </div>

                <div class="section">
                <h2>Reserved Records</h2>
            <table>
              <thead><tr><th>Record ID</th></tr></thead>
              <tbody>
                    {"".join(f"<tr><td>{record}</td></tr>" for record in reserved_records)}
              </tbody>
            </table>
                </div>

               <div class="section">
                <h2>Database Pool Information</h2>
            <table>
              <thead><tr><th>Pool Alias</th><th>Active Connections</th><th>Idle Connections</th><th>Waiting Requests</th><th>Max allowed</th></tr></thead>
              <tbody>
                    {"".join(f"<tr><td>{pool["alias"]}</td><td>{pool["active"]}</td><td>{pool["idle"]}</td><td>{pool["waiting"]}</td><td>{pool["max"]}</td></tr>" for pool in pool_info)}
              </tbody>
            </table>
                </div>
                
         <div class="pagination">
            <button class="download-btn" onclick="downloadData('csv')">Download CSV</button>
            <button class="download-btn" onclick="downloadData('json')">Download JSON</button>
          </div>
        
          <script>
            const responseData =  {json.dumps(response_data)};
        
            function downloadData(format) {{
              if (format === 'json') {{
                const blob = new Blob([JSON.stringify(responseData, null, 2)], {{ type: 'application/json' }});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'socket-data.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }} else if (format === 'csv') {{
                const csvContent = [
                "User ID,Application ID",
                ...Object.values(responseData.connectedUsers).map(
                    (user) => `${{user.user}},${{user.app}}`
                ),
                ].join("\\n");
                const blob = new Blob([csvContent], {{ type: 'text/csv' }});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'socket-data.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            }}
          </script>                
            </body>
            </html>
            """
            return HTMLResponse(content=html_page)

        # Invalid format
        raise HTTPException(status_code=400, detail="Invalid format. Use ?format=json or ?format=html")

# Create an instance of the router
router = APIRouter()
controller = SocketController()

@router.get("/")
async def default():
    return await controller.default()

@router.get("/applications")
async def applications(request: Request, format: str = Query("json")):
    return await controller.applications(request, format=format)