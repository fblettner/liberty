# Description: API REST service for handling REST API requests.
import logging
import os

import httpx
from pydantic import BaseModel

from app.services.db_query import Query
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

class AIResponse(BaseModel):
    message: str
    is_truncated: bool
    

class Rest:
    def __init__(self, queryRest: Query):
        self.logs_handler = LogHandler()
        self.queryRest = queryRest


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


    def estimate_tokens(self,text: str) -> int:
        return (len(text) + 3) // 4

    async def get_ai_module_params(self):
        """Extracts OpenAI API URL and Key from MODULE_ID = 'AI'."""
        query = {
            "QUERY": 3,
            "POOL": "default",
            "CRUD": "GET",
        }
        context = {
            "row_offset": 0,
            "row_limit": 1000,
        }
        # Get the target query using the framework query method
        target_query = await self.queryRest.db_pools.get_pool("default").db_dao.get_framework_query(
            query, self.queryRest.db_pools.get_pool("default").db_type
        )
        results = await self.queryRest.db_pools.get_pool("default").db_dao.get(target_query, context)
    
        # Ensure 'rows' exist in the response
        if not results.get("rows"):
            raise ValueError("No module data found")
        
        # Find the 'AI' module
        for module in results["rows"]:
            if module["MODULE_ID"] == "AI" and module["MODULE_ENABLED"] == "Y":
                module_params = module.get("MODULE_PARAMS")
                
                if module_params:
                    # Convert JSON string to dictionary
                    params = json.loads(module_params)
                    return params.get("url"), params.get("key")
        
        raise ValueError("AI module not found or not enabled")
       
    async def prompt(self, request: Request):
        try:
            openai_url, openai_key = await self.get_ai_module_params()
            message =  await request.json()

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    openai_url,
                    json={
                        "model": "gpt-4o-mini",
                        "messages": message.get("history"),
                        "max_tokens": 1500,
                    },
                    headers={
                        "Authorization": f"Bearer {openai_key}",
                        "Content-Type": "application/json",
                    },
                )
            
            response_data = response.json()

            if response.status_code != 200:
                logger.error(f"OpenAI API Error: {response_data}")
                raise HTTPException(status_code=response.status_code, detail="Error fetching AI response")

            message_content = response_data["choices"][0]["message"]["content"].strip()
            new_content_length = self.estimate_tokens(message_content)
            is_truncated = new_content_length >= 1450  # Threshold for truncation

            return AIResponse(message=message_content, is_truncated=is_truncated)

        except Exception as e:
            logger.exception("AI: Error fetching response from OpenAI")
            raise HTTPException(status_code=500, detail=f"Error fetching response: {e}")     