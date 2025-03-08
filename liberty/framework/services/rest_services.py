# Description: API REST service for handling REST API requests.
import importlib
import logging
logger = logging.getLogger(__name__)

import re
from urllib.parse import urljoin, urlparse

from fastapi.responses import JSONResponse
import httpx
from pydantic import BaseModel


import json
from fastapi import Request, HTTPException
from datetime import datetime, timezone
from liberty.framework.utils.logs import LogHandler
from liberty.framework.logs import get_logs_json_path, get_logs_text_path
from liberty.framework.services.api_services import API, SessionMode
defaultPool = "default"

class ApiType:
    internal = "INTERNAL"
    external = "EXTERNAL"

class AIResponse(BaseModel):
    message: str
    is_truncated: bool
    

class Rest:
    def __init__(self, api: API):
        self.logs_handler = LogHandler()
        self.api = api

    async def call_rest(self, req: Request):
        try:
            query_params = req.query_params

            """Extracts OpenAI API URL and Key from MODULE_ID = 'AI'."""
            query = {
                "QUERY": 34,
                "POOL": query_params.get("mode") == SessionMode.framework and defaultPool or query_params.get("pool"),
                "CRUD": "GET",
            }
            context = {
                "row_offset": 0,
                "row_limit": 1000,
                "where": {"API_ID":query_params.get("api")},
            }
            # Get the target query using the framework query method
            target_query = await self.api.db_pools.get_pool("default").db_dao.get_framework_query(
                query, self.api.db_pools.get_pool("default").db_type
            )

            api = await self.api.db_pools.get_pool("default").db_dao.get(target_query, context)
            rows = api.get("rows")

            if not api.get("rows"):
                raise ValueError("No API found")

            row = rows[0]  # Extract the first row (dictionary)
            
            api_type = row.get("API_SOURCE")
            method = row.get("API_METHOD")
            url = row.get("API_URL")
            user = row.get("API_USER")
            password = row.get("API_PASSWORD")
            body = row.get("API_BODY")

            # Convert API_BODY from JSON string format to a Python dictionary
            body_dict = json.loads(body)  

            # 🔹 Ensure request body is retrieved properly
            req_body = await req.json()  

            # Perform variable substitution in body
            body_str = json.dumps(body_dict)  # Convert dictionary to string for replacement
            for key, value in req_body.items():
                variable = rf"\${key.upper()}" 
                body_str = re.sub(variable, str(value), body_str)  

            # Convert back to dictionary
            parsed_body = json.loads(body_str)
            if api_type == ApiType.internal:
                base_url = str(req.base_url) 
                full_url = urljoin(base_url, url)  
            else:
                # Check if `url` is already a full external URL
                parsed_url = urlparse(url)
                if parsed_url.scheme and parsed_url.netloc:
                    full_url = url  # Use the full external URL as is
                else:
                    raise ValueError(f"Invalid external URL: {url}")

            # 🔹 Make the API call
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(full_url, json=parsed_body)
                if response.status_code == 200:
                    response_data = response.json()
                else:
                    response_data = {
                        "error": f"Failed request with status code {response.status_code}",
                        "details": response.text
                    }
            response_data = response.json()

            return JSONResponse({
                "items": response_data,
                "status": "success",
                "count": 0,
            })
        except Exception as err:
            message = str(err)
            return JSONResponse({
                "items": [{"message": f"Error: {message}"}],
                "status": "error",
                "hasMore": False,
                "limit": context.get("row_limit", 1000),
                "offset": context.get("row_offset", 0),
                "count": 0,
            })
        


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
        target_query = await self.api.db_pools.get_pool("default").db_dao.get_framework_query(
            query, self.api.db_pools.get_pool("default").db_type
        )
        results = await self.api.db_pools.get_pool("default").db_dao.get(target_query, context)
    
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

    async def send_message_to_ai(self, message):
        try:
            openai_url, openai_key = await self.get_ai_module_params()

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    openai_url,
                    json={
                        "model": "gpt-4o-mini",
                        "messages": message,
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


    async def ai_prompt(self, request: Request):
        try:
            message =  await request.json()

            return await self.send_message_to_ai(message.get("history"))

        except Exception as e:
            logger.exception("AI: Error fetching response from OpenAI")
            raise HTTPException(status_code=500, detail=f"Error fetching response: {e}")     
        

    async def ai_welcome(self, request: Request):
        try:
            message =  [
                {
                    "role": "system",
                    "content": """
                    You are an intelligent assistant capable of understanding natural language and helping users with development or documentation-related tasks. 
                    Greet the user and let them know they can ask for help with any of the following and display a formatted text:
                    - Development tasks, like describing or customizing a table, creating a query, or building a form or dialog.
                    - Finding answers in the documentation.
                    Use natural language to provide assistance. Always respond in the language the user uses.
                    """
                }
            ]
            print(message)
            return await self.send_message_to_ai( message)

        except Exception as e:
            logger.exception("AI: Error fetching response from OpenAI")
            raise HTTPException(status_code=500, detail=f"Error fetching response: {e}")   
        
        
    async def get_version(self, request: Request):
        try:
            return JSONResponse({
                    "version": importlib.metadata.version("liberty-framework") 
                })
        except importlib.metadata.PackageNotFoundError:
            return "Unknown"