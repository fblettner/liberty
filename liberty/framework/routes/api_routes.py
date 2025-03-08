#
# Copyright (c) 2025 NOMANA-IT and/or its affiliates.
# All rights reserved. Use is subject to license terms.
#
#
import json
from typing import Any, Dict, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, Path
from pydantic import Field
from liberty.framework.controllers.api_controller import ApiController
from liberty.framework.models.apidb import ENCRYPT_ERROR_MESSAGE, ENCRYPT_RESPONSE_DESCRIPTION, ENCRYPT_RESPONSE_EXAMPLE, GET_APIDB_ERROR_EXAMPLE, GET_APIDB_RESPONSE_DESCRIPTION, GET_APIDB_RESPONSE_EXAMPLE, VERSION_ERROR_MESSAGE, VERSION_RESPONSE_DESCRIPTION, VERSION_RESPONSE_EXAMPLE, EncryptResponse, GetSuccessResponse, GetErrorResponse, VersionResponse
from liberty.framework.models.apidb import POST_APIDB_ERROR_EXAMPLE, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE, PostErrorResponse, PostSuccessResponse
from liberty.framework.models.applications import APPLICATIONS_ERROR_MESSAGE, APPLICATIONS_RESPONSE_DESCRIPTION, APPLICATIONS_RESPONSE_EXAMPLE, ApplicationsResponse
from liberty.framework.models.auth import TOKEN_ERROR_MESSAGE, TOKEN_RESPONSE_DESCRIPTION, TOKEN_RESPONSE_EXAMPLE, USER_ERROR_MESSAGE, USER_RESPONSE_DESCRIPTION, USER_RESPONSE_EXAMPLE, LoginRequest, TokenResponse, UserResponse
from liberty.framework.models.base import ErrorResponse, FilterCondition, SuccessResponse, ValidationErrorResponse, response_200, response_400, response_422, response_500
from liberty.framework.models.apidb import CHECKDB_ERROR_MESSAGE, CHECKDB_RESPONSE_DESCRIPTION, CHECKDB_RESPONSE_EXAMPLE, CheckDBErrorResponse, CheckDBResponse
from liberty.framework.models.modules import MODULES_ERROR_MESSAGE, MODULES_RESPONSE_DESCRIPTION, MODULES_RESPONSE_EXAMPLE, ModulesResponse
from liberty.framework.models.pool import CLOSE_ERROR_MESSAGE, CLOSE_RESPONSE_DESCRIPTION, CLOSE_RESPONSE_EXAMPLE
from liberty.framework.models.pool import OPEN_ERROR_MESSAGE, OPEN_RESPONSE_DESCRIPTION, OPEN_RESPONSE_EXAMPLE
from liberty.framework.models.themes import THEMES_ERROR_MESSAGE, THEMES_RESPONSE_DESCRIPTION, THEMES_RESPONSE_EXAMPLE, ThemesResponse
from liberty.framework.services.api_services import LoginType, QuerySource, QueryType, SessionMode
from liberty.framework.utils.jwt import JWT
from liberty.framework.services.rest_services import AIResponse
from liberty.framework.models.ai import AI_ERROR_MESSAGE, AI_RESPONSE_DESCRIPTION, AI_RESPONSE_EXAMPLE


def setup_api_routes(app, controller: ApiController, jwt: JWT):
    router = APIRouter()

    @router.post(
        "/auth/token",
        summary="AUTH - Token",
        description="Generate a JWT token for the user.",
        tags=["Authentication"], 
        response_model=TokenResponse,
        responses={
            200: response_200(TokenResponse, TOKEN_RESPONSE_DESCRIPTION, TOKEN_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, TOKEN_ERROR_MESSAGE),
        },
    )
    async def token(
        req: Request,
        body: LoginRequest,
        pool: str = Query(None, description="The database pool alias to retrieve the user. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        type: LoginType = Query(None, description="Authentication type, from database or using OIDC. Valid values: `database`, `oidc`"),
    ):
        return await controller.token(req)


    @router.get("/auth/user",
        summary="AUTH - User",
        description="Retrieve user information.",
        tags=["Authentication"], 
        response_model=UserResponse,
        responses={
            200: response_200(UserResponse, USER_RESPONSE_DESCRIPTION, USER_RESPONSE_EXAMPLE),
            422: {"model": ValidationErrorResponse},  
            500: response_500(ErrorResponse, USER_ERROR_MESSAGE),
        },
    )
    async def user(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        user: str = Query(None, description="User ID."),
        pool: str = Query(None, description="The database pool alias to retrieve the user. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
    ):
        return await controller.user(req)
    
    @router.get("/fmw/modules",
        summary="FMW - Modules",
        description="Retrieve Modules.",
        tags=["Framework"], 
        response_model=ModulesResponse,
        responses={
            200: response_200(ModulesResponse, MODULES_RESPONSE_DESCRIPTION, MODULES_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, MODULES_ERROR_MESSAGE),
        },
    )
    async def modules(
        req: Request,
    ):
        return await controller.modules(req)
    
    @router.get("/fmw/applications",
        summary="FMW - Applications",
        description="Retrieve Applications.",
        tags=["Framework"],
        response_model=ApplicationsResponse,
        responses={
            200: response_200(ApplicationsResponse, APPLICATIONS_RESPONSE_DESCRIPTION, APPLICATIONS_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, APPLICATIONS_ERROR_MESSAGE),
        },
    )
    async def applications(
        req: Request,
    ):
        return await controller.applications(req)    
    
    @router.get("/fmw/themes",
        summary="FMW - Themes",
        description="Retrieve Themes Definition.",
        tags=["Framework"],
        response_model=ThemesResponse,
        responses={
            200: response_200(ThemesResponse, THEMES_RESPONSE_DESCRIPTION, THEMES_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, THEMES_ERROR_MESSAGE),
        },
    )
    async def themes(
        req: Request,
    ):
        return await controller.themes(req)        
    

    @router.post(
        "/fmw/encrypt",
        summary="FMW - Encrypt",
        description="Encrypt the input received",
        tags=["Framework"],
        response_model=EncryptResponse,
        responses={
            200: response_200(EncryptResponse, ENCRYPT_RESPONSE_DESCRIPTION, ENCRYPT_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, ENCRYPT_ERROR_MESSAGE),
        },
    )
    async def encrypt(
        req: Request,
        plain_text: str = Query(None, description="Text to be encrypted"),
        ):
        return await controller.encrypt(req)
    
    @router.get("/logs",
        summary="FMW - Get logs",
        description="Get all current logs and upload to cache",
        tags=["Framework"],
    )
    async def get_logs(req: Request):
        return await controller.get_log(req)
    
    @router.get("/logs/details",
        summary="FMW - Get log details",
        description="Get details for a log id from the cache",
        tags=["Framework"],
    )
    async def get_logs(req: Request):
        return await controller.get_log_details(req)
    
    @router.post("/logs",
        summary="FMW - Push logs",
        description="Push logs to files in json and plain text format",
        tags=["Framework"],
    )
    async def post_logs(req: Request):
        return await controller.push_log(req)
    

    @router.get(
        "/db/check",
        summary="DATABASE - Check",
        description="Performs a basic check to ensure the database connection is functional. Returns the current date if the connection is successful.",
        tags=["Database"],
        response_model=CheckDBResponse, 
        responses={
            200: response_200(CheckDBResponse, CHECKDB_RESPONSE_DESCRIPTION, CHECKDB_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(CheckDBErrorResponse, CHECKDB_ERROR_MESSAGE),
        },
    )       
    async def check(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        framework_pool: str = Query("default", description="Pool alias to retrieve the database definition. (e.g., `default`, `libnsx1`)."),
        target_pool: str = Query("default", description="Pool alias of the database to check. (e.g., `nomasx1`, `nomajde`)."),
    ):
        return await controller.check(req)


    @router.get("/db/open",
        summary="DATABASE - Open",
        description="Open a connection to the database using the specified pool alias.",
        tags=["Database"],
        response_model=SuccessResponse, 
        responses={
            200: response_200(SuccessResponse, OPEN_RESPONSE_DESCRIPTION, OPEN_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, OPEN_ERROR_MESSAGE),
        },
    )
    async def open(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        framework_pool: str = Query("default", description="Pool alias to retrieve the database definition. (e.g., `default`, `libnsx1`)."),
        target_pool: str = Query("default", description="Pool alias of the database to open. (e.g., `libnsx1`, `nomasx1`, `nomajde`)."),
    ):
        if not framework_pool or not framework_pool.strip():
            raise HTTPException(
                status_code=422,
                detail="Framework pool alias cannot be empty or blank."
            )
        if not target_pool or not target_pool.strip():
            raise HTTPException(
                status_code=422,
                detail="Target pool alias cannot be empty or blank."
            )
        return await controller.open(req)

    @router.get(
        "/db/close",
        summary="DATABASE - Close",
        description="Close all database connections for the specified pool alias.",
        tags=["Database"],
        response_model=SuccessResponse, 
        responses={
            200: response_200(SuccessResponse, CLOSE_RESPONSE_DESCRIPTION, CLOSE_RESPONSE_EXAMPLE),
            422: response_422(),  
            500: response_500(ErrorResponse, CLOSE_ERROR_MESSAGE),
        },
    )
    async def close(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        pool: str = Query("default", description="Pool alias for the database to close. (e.g., `default`, `libnsx1`)."),
    ):
        return await controller.close(req)

    
    @router.get(
        "/db/query",
        response_model=GetSuccessResponse,  # Specify the success response schema
        responses={
            200: response_200(GetSuccessResponse, GET_APIDB_RESPONSE_DESCRIPTION, GET_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Invalid JSON format in request query."),
            422: response_422(),
            500: response_500(GetErrorResponse, GET_APIDB_ERROR_EXAMPLE),
        },
        summary="QUERY - Select",
        description="Retrieve data or metadata from the database based on query parameters. Supports filtering, language and pagination.",
        tags=["Query"],
    )
    async def get(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        source: QuerySource = Query(None, description="The source to retrieve the query definition. Valid values: `framework`, `query`"),
        type: QueryType = Query(None, description="The type of query, get data or metadata. Valid values: `table`, `columns`."),
        pool: str = Query(None, description="The database pool alias to retrieve the query definition. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        query: int = Query(None, description="The query ID to execute. (e.g., `1`, `2`)"),
        override_pool: Optional[str] = Query(None, description="Override the default pool set in the query definition. (e.g., `default`, `libnsx1`)"),
        q: Optional[str] = Query(
            None, 
            description="Filters to apply to the query in JSON format (e.g., `[{'APPS_ID':{'=':10}, 'APPS_NAME':{'like':'LIBERTY%'} }]`)."
        ),
        language: Optional[str] = Query("en", description="The language for query execution. (e.g., `en`, `fr`)."),
        offset: Optional[int] = Query(0, description="The number of rows to skip before starting to fetch."),
        limit: Optional[int] = Query(1000, description="The maximum number of rows to return."),
        params: Optional[str] = Query(None, description="Additional parameters in JSON format to replace variable in a query (e.g., `[{'APPS_ID': 10}]`)."),
    ):
        try:
            # Parse the string as JSON into the expected format
            parsed_filters = json.loads(q) if q else {}
            
            # Validate the parsed filters using Pydantic
            validated_filters = FilterCondition(parsed_filters)
            return await controller.get(req)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid filters format: {str(e)}")


    @router.post(
        "/db/query",
        response_model=PostSuccessResponse,  # Specify the success response schema
        responses={
            200: response_200(PostSuccessResponse, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty."),
            422: response_422(),
            500: response_500(PostErrorResponse, POST_APIDB_ERROR_EXAMPLE),
        },
        summary="QUERY - Insert",
        description="Insert data into a table.",
        tags=["Query"],
    )
    async def post(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        source: QuerySource = Query(None, description="The source to retrieve the query definition. Valid values: `framework`, `query`"),
        type: QueryType = Query(None, description="The type of query, get data or metadata. Valid values: `table`, `columns`."),
        pool: str = Query(None, description="The database pool alias to retrieve the query definition. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        query: int = Query(None, description="The query ID to execute. (e.g., `1`, `2`)"),
        override_pool: Optional[str] = Query(None, description="Override the default pool set in the query definition. (e.g., `default`, `libnsx1`)"),
        body: Dict[str, Any] = Body(..., description="JSON object with key-value pairs is required.")
):
        if not body:  # Check if the body is empty
            raise HTTPException(
                status_code=400,
                detail="Request body cannot be empty. JSON object with key-value pairs is required.",
            )
        return await controller.post(req)

    @router.put(
        "/db/query",
        response_model=PostSuccessResponse,  # Specify the success response schema
        responses={
            200: response_200(PostSuccessResponse, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty. JSON object with key-value pairs is required."),
            422: response_422(),
            500: response_500(PostErrorResponse, POST_APIDB_ERROR_EXAMPLE),
        },
        summary="QUERY - Update",
        description="Update data into a table.",
        tags=["Query"],
    )
    async def put(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        source: QuerySource = Query(None, description="The source to retrieve the query definition. Valid values: `framework`, `query`"),
        type: QueryType = Query(None, description="The type of query, get data or metadata. Valid values: `table`, `columns`."),
        pool: str = Query(None, description="The database pool alias to retrieve the query definition. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        query: int = Query(None, description="The query ID to execute. (e.g., `1`, `2`)"),
        override_pool: Optional[str] = Query(None, description="Override the default pool set in the query definition. (e.g., `default`, `libnsx1`)"),
        body: Dict[str, Any] = Body(..., description="JSON object with key-value pairs is required.")

):
        if not body:  # Check if the body is empty
            raise HTTPException(
                status_code=400,
                detail="Request body cannot be empty. JSON object with key-value pairs is required.",
            )
        return await controller.put(req)

    @router.delete(
        "/db/query",
        response_model=PostSuccessResponse,  # Specify the success response schema
        responses={
            200: response_200(PostSuccessResponse, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty. JSON object with key-value pairs is required."),
            422: response_422(),
            500: response_500(PostErrorResponse, POST_APIDB_ERROR_EXAMPLE),
        },
        summary="QUERY - Delete",
        description="Delete data into a table.",
        tags=["Query"],
    )
    async def delete(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        source: QuerySource = Query(None, description="The source to retrieve the query definition. Valid values: `framework`, `query`"),
        type: QueryType = Query(None, description="The type of query, get data or metadata. Valid values: `table`, `columns`."),
        pool: str = Query(None, description="The database pool alias to retrieve the query definition. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        query: int = Query(None, description="The query ID to execute. (e.g., `1`, `2`)"),
        override_pool: Optional[str] = Query(None, description="Override the default pool set in the query definition. (e.g., `default`, `libnsx1`)"),
        body: Dict[str, Any] = Body(..., description="JSON object with key-value pairs is required.")
):
        if not body:  # Check if the body is empty
            raise HTTPException(
                status_code=400,
                detail="Request body cannot be empty. JSON object with key-value pairs is required.",
            )
        return await controller.delete(req)


    @router.post("/db/audit/{table}/{user}",
        response_model=PostSuccessResponse,  # Specify the success response schema
        summary="QUERY - Audit",
        description="Audit user actions on a table.",
        tags=["Query"],
        responses={
            200: response_200(PostSuccessResponse, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty. JSON object with key-value pairs is required."),
            422: response_422(),
            500: response_500(PostErrorResponse, POST_APIDB_ERROR_EXAMPLE),
        },        
    )
    async def audit(
        req: Request, 
        jwt: str = Depends(jwt.is_valid_jwt),
        table: str = Path(...), 
        user: str = Path(...)):
        body: Dict[str, Any] = Body(..., description="JSON object with key-value pairs is required.")

        return await controller.audit(req, table, user)
   

    @router.post("/ai/prompt",
        response_model=AIResponse,
        summary="AI - Prompt",
        description="Ask AI a question.",
        tags=["AI"],
        responses={
            200: response_200(AIResponse, AI_RESPONSE_DESCRIPTION, AI_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty. JSON object is required."),
            422: response_422(),
            500: response_500(ErrorResponse, AI_ERROR_MESSAGE),
        },        
    )
    async def ai_prompt(
        req: Request
    ):  
        return await controller.ai_prompt(req)
   

    @router.post("/ai/welcome",
        response_model=AIResponse,
        summary="AI - Welcome",
        description="Send a welcome message to AI for initialisation.",
        tags=["AI"],
        responses={
            200: response_200(AIResponse, AI_RESPONSE_DESCRIPTION, AI_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty. JSON object is required."),
            422: response_422(),
            500: response_500(ErrorResponse, AI_ERROR_MESSAGE),
        },        
    )
    async def ai_welcome(
        req: Request
    ):  
        return await controller.ai_welcome(req)   


    @router.post(
        "/rest",
        response_model=PostSuccessResponse,  # Specify the success response schema
        responses={
            200: response_200(PostSuccessResponse, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty."),
            422: response_422(),
            500: response_500(PostErrorResponse, POST_APIDB_ERROR_EXAMPLE),
        },
        summary="REST - Call Post Api",
        description="Call a rest api (post).",
        tags=["Query"],
    )
    async def post(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        source: QuerySource = Query(None, description="The source to retrieve the query definition. Valid values: `framework`, `query`"),
        type: QueryType = Query(None, description="The type of query, get data or metadata. Valid values: `table`, `columns`."),
        pool: str = Query(None, description="The database pool alias to retrieve the query definition. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        query: int = Query(None, description="The query ID to execute. (e.g., `1`, `2`)"),
        override_pool: Optional[str] = Query(None, description="Override the default pool set in the query definition. (e.g., `default`, `libnsx1`)"),
        body: Dict[str, Any] = Body(..., description="JSON object with key-value pairs is required.")
):
        if not body:  # Check if the body is empty
            raise HTTPException(
                status_code=400,
                detail="Request body cannot be empty. JSON object with key-value pairs is required.",
            )
        return await controller.call_rest(req)

    @router.get(
        "/rest",
        response_model=PostSuccessResponse,  # Specify the success response schema
        responses={
            200: response_200(PostSuccessResponse, POST_APIDB_RESPONSE_DESCRIPTION, POST_APIDB_RESPONSE_EXAMPLE),
            400: response_400("Request body cannot be empty."),
            422: response_422(),
            500: response_500(PostErrorResponse, POST_APIDB_ERROR_EXAMPLE),
        },
        summary="REST - Call Post Api",
        description="Call a rest api (post).",
        tags=["Query"],
    )
    async def get(
        req: Request,
        jwt: str = Depends(jwt.is_valid_jwt),
        source: QuerySource = Query(None, description="The source to retrieve the query definition. Valid values: `framework`, `query`"),
        type: QueryType = Query(None, description="The type of query, get data or metadata. Valid values: `table`, `columns`."),
        pool: str = Query(None, description="The database pool alias to retrieve the query definition. (e.g., `default`, `libnsx1`)"),
        mode: SessionMode = Query(None, description="The session mode, retrieve data from framework table or pool. Valid values: `framework`, `session`"),
        query: int = Query(None, description="The query ID to execute. (e.g., `1`, `2`)"),
        override_pool: Optional[str] = Query(None, description="Override the default pool set in the query definition. (e.g., `default`, `libnsx1`)"),
        body: Dict[str, Any] = Body(..., description="JSON object with key-value pairs is required.")
):
        if not body:  # Check if the body is empty
            raise HTTPException(
                status_code=400,
                detail="Request body cannot be empty. JSON object with key-value pairs is required.",
            )
        return await controller.rest(req)
    
    app.include_router(router, prefix="/api")

    @router.get(
        "/fmw/version",
       response_model=VersionResponse,  # Specify the success response schema
        responses={
            200: response_200(VersionResponse, VERSION_RESPONSE_DESCRIPTION, VERSION_RESPONSE_EXAMPLE),
            400: response_400("Invalid JSON format in request query."),
            422: response_422(),
            500: response_500(GetErrorResponse, VERSION_ERROR_MESSAGE),
        },
        summary="FMW - Version",
        description="Retrieve the version of the framework.",
        tags=["Framework"],
    )
    async def get(
        req: Request,
    ):

        return await controller.version(req)
    
    app.include_router(router, prefix="/api")    