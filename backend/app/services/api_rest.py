# Description: API REST service for handling REST API requests.
import logging
logger = logging.getLogger(__name__)

import json
from fastapi import Request, HTTPException
from datetime import datetime, timezone
from app.utils.logs import LogHandler
from app.logs import get_logs_json_path, get_logs_text_path

class ApiType:
    internal = "INTERNAL"
    external = "EXTERNAL"


class ApiFramework:
    CreateFrameworkDatabase = "CreateFrameworkDatabase"
    DropFrameworkDatabase = "DropFrameworkDatabase"

class Rest:
    def __init__(self):
        self.logs_handler = LogHandler()


    async def push_log(self, req: Request):
        """
        Push log data to log files.
        """
        try:
            log_data = await req.json()

            timestamp = datetime.now(timezone.utc).isoformat()

            # Text log
            text_log = (
                f"[{timestamp}] [{log_data['level']}] {log_data['transactionName']} - {log_data['message']}\n"
                f"Method: {log_data['method']}, URL: {log_data['url']}\n"
                f"Category: {log_data['category']}, Feature: {log_data['feature']}, IsException: {log_data['isException']}\n\n"
            )
            with open(get_logs_text_path(), "a") as text_file:
                text_file.write(text_log)

            # JSON log
            json_log = json.dumps({"timestamp": timestamp, **log_data})
            with open(get_logs_json_path(), "a") as json_file:
                json_file.write(json_log + "\n")

        except Exception as e:
            logger.exception(str(e))
            raise HTTPException(status_code=500, detail=f"Failed to write logs: {str(e)}")

    async def get_log(self, req: Request):
        """
        Get logs in the specified format with optional filtering.
        
        Args:
            req (Request): The incoming HTTP request.
            
        Returns:
            Response: Logs in the specified format.
        """
        try:
            # Extract query parameters from the request
            query_params = req.query_params
            log_format = query_params.get("format", "json") 
            log_page = int(query_params.get("page", 1))
            filter_key = query_params.get("filter_key")
            filter_value = query_params.get("filter_value")
            
            await self.logs_handler.load_logs_cache_json(get_logs_json_path())

            filtered_logs = [
                log
                for log in self.logs_handler.logs_cache
                if not filter_key or log.get(filter_key) == filter_value
            ]
            if filtered_logs == []:
                filtered_logs = self.logs_handler.logs_cache

            if log_format == "json":
                return filtered_logs

            

            elif log_format == "html":
                # Generate an HTML table
                return await self.logs_handler.render_html_logs(content=filtered_logs, page=log_page, records_per_page=50)

            else:
                return "\n".join(filtered_logs)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")

    def _is_valid_json(self, string: str) -> bool:
        try:
            json.loads(string)
            return True
        except json.JSONDecodeError:
            return False
        

    async def get_log_details(self, request: Request):
        """
        Get log details by ID retrieved from the request object.
        Args:
            request (Request): The incoming HTTP request object.
        Returns:
            dict: The log entry if found.
        Raises:
            HTTPException: If the log ID is invalid or not found.
        """
        try:

            # Retrieve the `id` from the query string
            id = int(request.query_params.get("id", -1))
            return await self.logs_handler.get_log_details(id)

        except ValueError:
            # Handle cases where `id` is not a valid integer
            raise HTTPException(status_code=400, detail="Invalid log ID provided")