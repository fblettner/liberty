import logging
logger = logging.getLogger(__name__)

from enum import Enum
import configparser
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

from liberty.framework.services.db_pool import DBPool, PoolConfig, DBType, PoolInterface
from liberty.framework.utils.jwt import JWT
from liberty.framework.utils.encrypt import Encryption


class QueryType(str, Enum):
    Table = "table",
    Columns = "columns"

class QuerySource(str, Enum):
    Framework = "framework"
    Query = "query"

class SessionMode(str, Enum):
    framework = "framework"
    session = "session"


class LoginType(str, Enum):
    database = "database"
    oidc = "oidc"

defaultPool = "default"
sessionPool = "SESSION"

class API:

    def __init__(self, jwt : JWT):
        self.db_pools = PoolInterface()
        self.jwt = jwt

    def load_db_properties(self, db_properties_path) -> PoolConfig:
        # Read the properties file
        config_parser = configparser.ConfigParser()
        config_parser.read(db_properties_path)

        # Extract database configuration
        db_config = config_parser["framework"] 
        encryption = Encryption(self.jwt)
        # Return as a dictionary
        return {
            "user": db_config.get("user"),
            "password": encryption.decrypt_text(db_config.get("password")),
            "host": db_config.get("host"),
            "port": int(db_config.get("port")),
            "database": db_config.get("database"),
            "poolMin": int(db_config.get("pool_min")),
            "poolMax": int(db_config.get("pool_max")),
            "pool_alias": db_config.get("pool_alias"),
            "replace_null": "N"
        }

    async def default_pool(self, config) -> PoolConfig:
    # Read the properties file
        
        # Startup logic
        default_pool = DBPool(debug_mode=False)
        await default_pool.create_pool(DBType.POSTGRES, config)
        self.db_pools.add_pool(defaultPool, default_pool)
                                 
        logger.info("Database pool initialized")
    

    async def check(self, req: Request):
        try:
            framework_pool = req.query_params.get("framework_pool")
            target_pool = req.query_params.get("target_pool")

            # Ensure target pool is open
            if not self.db_pools.is_pool_open(target_pool):
                await self.open_pool(framework_pool, target_pool)

            db_pool = self.db_pools.get_pool(target_pool)
            query = [(db_pool.db_dao.check_connection(),  None, target_pool)]
            context = {
                "row_offset": 0,
                "row_limit": 1000,
            }

            results = await db_pool.db_dao.get(query, context)
            return results
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_pool_info(self, req: Request, pool: str):
        try:
            pool_info = self.db_pools.get_pool(pool).db_dao.get_pool_info()
            return pool_info
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    async def get(self, req: Request):
        try:
            # Extract query parameters
            query_params = req.query_params

            request = {
                "QUERY": query_params.get("query"),
                "CRUD": req.method,
                "POOL": query_params.get("mode") == SessionMode.framework and defaultPool or query_params.get("pool"),
            }

            dd_query = {"QUERY": "1", "CRUD": "GET"}

            # Build context
            context = {
                "row_offset": int(query_params.get("offset", 0)),
                "row_limit": int(query_params.get("limit", 1000)),
            }

            context_ddl = {
                "row_offset": 0,
                "row_limit": 10000,
                "where": {"LNG_ID": query_params.get("language", "en")},
            }

            pool = query_params.get("pool", defaultPool)

            if "q" in query_params:
                context["q"] = query_params["q"]

            context["where"] = {"LNG_ID": query_params.get("language", "en")}

            if "params" in query_params:
                context["params"] = query_params["params"]

            # Ensure target pool is open
            if not self.db_pools.is_pool_open(request.get("POOL")):
                await self.open_pool(defaultPool, request.get("POOL"))

            # Fetch dictionary query
            dictionary_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                dd_query, self.db_pools.get_pool(request.get("POOL")).db_type
            )
            dd_pool = dictionary_query[0][2] == sessionPool and request.get("POOL") or dictionary_query[0][2]

            # Fetch dictionary results
            dd_results = await self.db_pools.get_pool(dd_pool).db_dao.get(dictionary_query, context_ddl)
            temp_cols = []

            # Fetch data query
            if query_params.get("source") == QuerySource.Framework:
                data_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                    request, self.db_pools.get_pool(request.get("POOL")).db_type
                )
            else:
                data_query = await self.db_pools.get_pool(request.get("POOL")).db_dao.get_query(
                    request, self.db_pools.get_pool(pool).db_type
                )

            # Ensure data_query[0] exists and has at least 3 elements
            if not data_query or len(data_query[0]) < 3:
                raise ValueError("Invalid data_query structure or missing data.")
            
            target_pool = query_params.get("overridePool") or (
               query_params.get("pool") if data_query[0][2]  == sessionPool else data_query[0][2]
            )


   
            # Ensure target pool is open
            if not self.db_pools.is_pool_open(target_pool):
                await self.open_pool(pool, target_pool)


            # Fetch results
            if target_pool != request.get("POOL") and query_params.get("source") != QuerySource.Framework:
                data_query = await self.db_pools.get_pool(request.get("POOL")).db_dao.get_query(
                    request, self.db_pools.get_pool(target_pool).db_type
                )

            if query_params.get("type") == QueryType.Columns:
                if query_params.get("source") == QuerySource.Framework:
                    results = await self.db_pools.get_pool(request.get("POOL")).db_dao.get_metadata(data_query, context)
                else:
                    results = await self.db_pools.get_pool(target_pool).db_dao.get_metadata(data_query, context)
            else:
                if query_params.get("source") == QuerySource.Framework:
                    results = await self.db_pools.get_pool(request.get("POOL")).db_dao.get(data_query, context)
                else:
                    results = await self.db_pools.get_pool(target_pool).db_dao.get(data_query, context)

            # Process metadata
            for val in results["meta_data"]:
                index_field = next(
                    (i for i, x in enumerate(dd_results["rows"]) if x["DD_ID"] == val["name"].upper()), -1
                )
                if index_field > -1:
                    temp_cols.append({
                        "headerName": dd_results["rows"][index_field]["DD_LABEL"],
                        "field": dd_results["rows"][index_field]["DD_ID"].upper(),
                        "type": dd_results["rows"][index_field]["DD_TYPE"],
                        "operator": "=" if dd_results["rows"][index_field]["DD_TYPE"] != "text" else "like",
                        "rules": dd_results["rows"][index_field]["DD_RULES"],
                        "rules_values": dd_results["rows"][index_field]["DD_RULES_VALUES"],
                        "default": dd_results["rows"][index_field]["DD_DEFAULT"],
                    })
                else:
                    temp_cols.append({
                        "headerName": val["name"].upper(),
                        "field": val["name"].upper(),
                        "type": "text",
                        "operator": "like",
                        "rules": None,
                        "rules_values": None,
                        "default": None,
                    })


            # Construct the response
            if query_params.get("type") == QueryType.Columns:
                return JSONResponse({
                    "items": temp_cols,
                    "status": "success",
                    "metadata": temp_cols,
                    "hasMore": False,
                    "limit": context["row_limit"],
                    "offset": context["row_offset"],
                    "count": len(temp_cols),
                })
            else:
                return JSONResponse({
                    "items": results["rows"],
                    "status": "success",
                    "metadata": temp_cols,
                    "hasMore": len(results["rows"]) == context["row_limit"],
                    "limit": context["row_limit"],
                    "offset": context["row_offset"],
                    "count": len(results["rows"]),
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
                "query": data_query if "data_query" in locals() else None,
            })
        

    async def post(self, req: Request):
        try:
            request = {
            "QUERY": req.query_params.get("query"),
            "CRUD": req.method,
            "POOL": defaultPool if req.query_params.get("mode") == SessionMode.framework else req.query_params.get("pool"),
            }

            context = {"body": await req.json()}
            pool = req.query_params.get("pool", defaultPool)
            results = None

            # Determine the data query
            if req.query_params.get("source") == QuerySource.Framework:
                data_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                    request, self.db_pools.get_pool(request.get("POOL")).db_type
                )
            else:
                data_query = await self.db_pools.get_pool(request.get("POOL")).db_dao.get_query(
                    request, self.db_pools.get_pool(pool).db_type
                )

            # Determine the target pool
            target_pool = req.query_params.get("overridePool") or (
                req.query_params.get("pool") if data_query[0][2] == sessionPool else data_query[0][2]
            )

            # Ensure the target pool is open
            if not self.db_pools.is_pool_open(target_pool):
                await self.open_pool(pool, target_pool)

            # If the target pool differs from the request pool, adjust the query
            if target_pool != request.get("POOL"):
                if req.query_params.get("source") == QuerySource.Framework:
                    data_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                        request, self.db_pools.get_pool(target_pool).db_type
                    )
                else:
                    data_query = await self.db_pools.get_pool(request.get("POOL")).db_dao.get_query(
                        request, self.db_pools.get_pool(target_pool).db_type
                    )

            # Execute the query
            results = await self.db_pools.get_pool(target_pool).db_dao.post(data_query, context)

            # Return the response
            return JSONResponse({
                "items": [],
                "status": "success",
                "count": results
            })

        except Exception as err:
            message = str(err)
            return JSONResponse({
                "items": [{"message": f"Error: {message}", "line": await req.json()}],
                "status": "error",
                "count": 0
            })

    async def open(self, req: Request):
        try:
            framework_pool = req.query_params.get("framework_pool")
            target_pool = req.query_params.get("target_pool")
            await self.open_pool(framework_pool, target_pool)
            return JSONResponse({
                "status": "success",
                "message": "connected"
            })

        except Exception as err:
            return JSONResponse({
                "status": "error",
                "message": f"{str(err)}"
            })
   

    async def open_pool(self, framework_pool: str, target_pool: str):
        try:
            request = {
            "QUERY": "2",
            "CRUD": "GET",
        }

            context = {
                "where": {
                    "APPS_POOL": target_pool,
                },
                "row_offset": 0,
                "row_limit": 1000,
            }

            # Fetch the target query from the framework query
            target_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                request, self.db_pools.get_pool(defaultPool).db_type
            )

            # Fetch the results from the database
            results = await self.db_pools.get_pool(framework_pool).db_dao.get(target_query, context)
            
            # Check if results are returned
            if len(results["rows"]) > 0:
                app_pool = results["rows"][0]["APPS_POOL"]

                # Check if the pool is already open
                if not self.db_pools.is_pool_open(app_pool):
                    # Create a new DBPool instance
                    new_pool = DBPool()
                    encryption = Encryption(self.jwt)
                    # Fetch the connection details
                    pool_config = {
                        "user": results["rows"][0]["APPS_USER"],
                        "password": encryption.decrypt_text(results["rows"][0]["APPS_PASSWORD"]),
                        "connectString": f"{results['rows'][0]['APPS_HOST']}:{results['rows'][0]['APPS_PORT']}/{results['rows'][0]['APPS_DATABASE']}",
                        "host": results["rows"][0]["APPS_HOST"],
                        "port": results["rows"][0]["APPS_PORT"],
                        "database": results["rows"][0]["APPS_DATABASE"],
                        "poolMin": results["rows"][0]["APPS_POOL_MIN"],
                        "poolMax": results["rows"][0]["APPS_POOL_MAX"],
                        "poolIncrement": 1,
                        "pool_alias": app_pool,
                        "replace_null": results["rows"][0]["APPS_REPLACE_NULL"],
                    }
                    # Create the pool
                    await new_pool.create_pool(results["rows"][0]["APPS_DBTYPE"], pool_config)
                    self.db_pools.add_pool(app_pool, new_pool)
            else:
                raise ValueError(f"Requested pool {target_pool} not found")

        except Exception as err: 
            raise RuntimeError(f"{str(err)}")  
            

    async def close(self, req: Request):
        try:
            pool = req.query_params.get("pool")

            await self.close_pool(pool)
            return JSONResponse({
                "status": "success",
                "message": "disconnected"
            })

        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
   

    async def close_pool(self, pool: str):
        try:
            if self.db_pools.is_pool_open(pool):
                await self.db_pools.get_pool(pool).close_pool()
                self.db_pools.remove_pool(pool)
                return JSONResponse({
                    "status": "success",
                    "message": "disconnected"
                })
            else:
                raise ValueError(f"Requested pool {pool} not found")

        except Exception as err:
            logger.error(f"Error closing pool")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"{str(err)}")     
        

    async def token(self, req: Request):
        try: 
            if req.query_params.get("type") == LoginType.database:
                result = await self.login(req)
            
                if result["status"] == "success":
                    user = result["items"][0]["USR_ID"]
                else:
                    return {
                        "access_token": "", 
                        "token_type": "", 
                        "status": "error",
                        "message": result["message"]
                    }
            else:
                data = await req.json()
                user = data.get("user")

            if user:
                access_token = self.jwt.create_access_token(data={"sub": user})

                return {
                    "access_token": access_token, 
                    "token_type": "bearer", 
                    "status": "success",
                    "message": "Authentication successful"
                }
            return user
            
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
    
        
    async def login(self, req: Request):
        try:
            data = await req.json()
            user = data.get("user")
            password = data.get("password")
            pool = req.query_params.get("pool")
            mode = req.query_params.get("mode")
            
            # Prepare the request and context
            request = {
                "QUERY": 4,
                "POOL": pool,
                "CRUD": "GET",
            }

            context = {
                "where": {
                    "USR_ID": user,
                    "USR_ADMIN": "Y" if mode == SessionMode.framework else "N",
                },
                "row_offset": 0,
                "row_limit": 1000,
            }

            # Retrieve framework query
            target_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                request, self.db_pools.get_pool(defaultPool).db_type
            )

            # Determine the target pool
            target_pool = (
                request.get("POOL")
                if target_query[0][2] == sessionPool
                else target_query[0][2]
            )

            # Execute the query
            is_pool_open = self.db_pools.is_pool_open(target_pool)
            if not is_pool_open:
                await self.open_pool(defaultPool, target_pool)

            results = await self.db_pools.get_pool(target_pool).db_dao.get(target_query, context)


            # Check if login was found
            if len(results["rows"]) == 0:
                return {
                    "status": "error",
                    "message": "loginError",
                }

            encryption = Encryption(self.jwt)

            # Validate the password
            encryption = Encryption(self.jwt)
            if encryption.decrypt_text(results["rows"][0]["USR_PASSWORD"]) == encryption.decrypt_text(password):
                return {
                    "items": results["rows"],
                    "status": "success",
                }

            # Incorrect password
            return {
                "status": "error",
                "message": "passwordError",
            }


        except Exception as err:
            raise RuntimeError(f"{str(err)}")  
        
    async def user(self, req: Request):
        try:
            # Prepare the request and context
            user = req.query_params.get("user")
            pool = req.query_params.get("pool")
            mode = req.query_params.get("mode")

            result = await self.get_user(user, pool, mode)
            return result

        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))        

    async def get_user(self, user: str, pool: str, mode: str):
        try:
            # Prepare the request and context
            user = user
            pool = pool
            mode = mode

            request = {
                "QUERY": 4,
                "POOL": pool,
                "CRUD": "GET",
            }

            context = {
                "where": {
                    "USR_ID": user,
                    "USR_ADMIN": "Y" if mode == SessionMode.framework else "N",
                },
                "row_offset": 0,
                "row_limit": 1000,
            }

            # Get the target query using the framework query method
            target_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                request, self.db_pools.get_pool(defaultPool).db_type
            )

            # Determine the target pool
            target_pool = (
                request.get("POOL")
                if target_query[0][2] == sessionPool
                else target_query[0][2]
            )

            # Execute the query in the determined pool
            # Check if the target pool is open
            is_pool_open = self.db_pools.is_pool_open(target_pool)
            if not is_pool_open:
                await self.open_pool(defaultPool, target_pool)
            results = await self.db_pools.get_pool(target_pool).db_dao.get(target_query, context)
            # Handle login not found
            if len(results["rows"]) == 0:
                return {
                    "items": results["rows"],
                    "status": "error",
                }

            # Successful login
            return {
                "items": results["rows"],
                "status": "success",
            }

        except Exception as err:
            raise RuntimeError(f"{str(err)}")  
        

    async def modules(self, req: Request):
        try:      
        # Prepare the request and context
            request = {
                "QUERY": 3,
                "POOL": defaultPool,
                "CRUD": "GET",
            }

            context = {
                "row_offset": 0,
                "row_limit": 1000,
            }
 
            # Get the target query using the framework query method
            target_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                request, self.db_pools.get_pool(defaultPool).db_type
            )

            results = await self.db_pools.get_pool(defaultPool).db_dao.get(target_query, context)
            return JSONResponse({
                    "items": results["rows"],
                    "status": "success",
                    "metadata": results["meta_data"],
                    "hasMore": len(results["rows"]) == context["row_limit"],
                    "limit": context["row_limit"],
                    "offset": context["row_offset"],
                    "count": len(results["rows"]),
                }) 

        except Exception as err:
            raise RuntimeError(f"{str(err)}")  
        

    async def applications(self, req: Request):
       
        # Prepare the request and context
        request = {
            "QUERY": 15,
            "POOL": defaultPool,
            "CRUD": "GET",
        }

        context = {
            "row_offset": 0,
            "row_limit": 1000,
        }

        try:
            # Get the target query using the framework query method
            target_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                request, self.db_pools.get_pool(defaultPool).db_type
            )

            results = await self.db_pools.get_pool(defaultPool).db_dao.get(target_query, context)
            return JSONResponse({
                "items": results["rows"],
                "status": "success",
                "metadata": results["meta_data"],
                "hasMore": len(results["rows"]) == context["row_limit"],
                "limit": context["row_limit"],
                "offset": context["row_offset"],
                "count": len(results["rows"]),
            }) 

        except Exception as err:
            raise RuntimeError(f"{str(err)}")          


    async def themes(self, req: Request):
        try:
            # Prepare the request and context
            request = {
                "QUERY": 33,
                "POOL": req.query_params.get("pool"),
                "CRUD": "GET",
            }

            context = {
                "row_offset": 0,
                "row_limit": 1000,
            }
            if "q" in req.query_params:
                context["q"] = req.query_params.get("q")

            # Get the target query using the framework query method
            target_query = await self.db_pools.get_pool(defaultPool).db_dao.get_framework_query(
                request, self.db_pools.get_pool(defaultPool).db_type
            )

            results = await self.db_pools.get_pool(defaultPool).db_dao.get(target_query, context)
            return JSONResponse({
                    "items": results["rows"],
                    "status": "success",
                    "metadata": results["meta_data"],
                    "hasMore": len(results["rows"]) == context["row_limit"],
                    "limit": context["row_limit"],
                    "offset": context["row_offset"],
                    "count": len(results["rows"]),
                }) 

        except Exception as err:
            raise RuntimeError(f"{str(err)}")  

    async def audit(self, req: Request, table: str, user: str):
        try:
            # Prepare the request and context
            request = {
                "QUERY": req.query_params.get("query"),
                "POOL": req.query_params.get("pool"),
                "CRUD": "POST",
            }

            context = {
                "body": await req.json(),  # Parse the request body as JSON
            }
            pool = req.query_params.get("pool")
        
            # Get the pool query using the `getQuery` method
            pool_query = await self.db_pools.get_pool(request.get("POOL")).db_dao.get_query(
                request, self.db_pools.get_pool(pool).db_type
            )

            # Determine the target pool
            target_pool = req.query_params.get(
                "overridePool",
                req.query_params.get("pool") if pool_query[0][2] == sessionPool else pool_query[0][2]
            )

            # Check if the target pool is open
            is_pool_open = self.db_pools.is_pool_open(target_pool)
            if not is_pool_open:
                await self.open_pool(pool, target_pool)

            # Perform the audit operation
            await self.db_pools.get_pool(target_pool).db_dao.audit(table, user, context)

            return {
                "items": [{}],
                "status": "success",
                "count": 0,
            }
        except Exception as err:
            message = str(err)
            name = type(err).__name__
            return JSONResponse({
                "items": [{"message": f"{name} : {message}"}],
                "status": "error",
                "count": 0,
            } )      
        

        