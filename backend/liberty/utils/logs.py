import logging
logger = logging.getLogger(__name__)

import json
import re
from fastapi import HTTPException, Query
from fastapi.responses import HTMLResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

class LogHandler:
    def __init__(self):
        self.logs_cache = []

    def parse_log_entry(self, log_entry_lines: List[str]) -> Optional[Dict[str, any]]:
        """
        Parse a grouped log entry into a dictionary.

        Args:
            log_entry_lines (List[str]): Lines of a single log entry.

        Returns:
            Optional[Dict[str, any]]: Parsed log entry or None if parsing fails.
        """
        try:
            # Join all lines into a single string
            log_entry_text = " ".join(line.strip() for line in log_entry_lines if line.strip())

            # Match the main log fields
            match_main = re.match(
                r"^\[(?P<timestamp>[^\]]+)\] \[(?P<level>[^\]]+)\] (?P<transactionName>[^-]+) - (?P<message>.+?)(?=\s+Method:|$)",
                log_entry_text,
            )
            if not match_main:
                return None

            # Extract the main fields
            log_entry = {
                "timestamp": match_main.group("timestamp"),
                "level": match_main.group("level"),
                "transactionName": match_main.group("transactionName"),
                "message": match_main.group("message").strip(),
            }

            # Match additional fields (Method, URL, Category, Feature, IsException)
            additional_match = re.search(
                r"Method:\s*(?P<method>[^\n,]+),\s*URL:\s*(?P<url>[^\n,]+)\s*"
                r"Category:\s*(?P<category>[^\n,]+),\s*Feature:\s*(?P<feature>[^\n,]+),\s*IsException:\s*(?P<isException>[^\n,]+)",
                log_entry_text
            )
            if additional_match:
                log_entry.update({
                    "method": additional_match.group("method").strip(),
                    "url": additional_match.group("url").strip(),
                    "category": additional_match.group("category").strip(),
                    "feature": additional_match.group("feature").strip(),
                    "isException": additional_match.group("isException").strip().lower() == "true",
                })

            # Match additional fields (Method, URL, Category, Feature, IsException)
            data_match = re.search(
                r"data:\s*(?P<data>[^\n,]+)",
                log_entry_text
            )
            if data_match:
                log_entry.update({
                    "data": additional_match.group("data").strip()
                })                

            return log_entry

        except Exception as e:
            logger.exception(f"Error parsing log entry: {e}")
            return None

    @staticmethod
    def read_file(file_path: str) -> str:
        """
        Reads a file synchronously. Used with asyncio.to_thread for async file reading.
        """
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()

    @staticmethod
    def parse_log(log_line: str) -> Dict[str, Any] | None:
        """
        Parses a single log line as JSON. Returns None if the line is invalid.
        """
        try:
            return json.loads(log_line)
        except json.JSONDecodeError:
            return None
        
    async def load_logs_cache_json(self, log_file_path: str) -> None:
        """
        Asynchronously reads a log file, parses the logs, and sorts them by timestamp in descending order.
        """
        try:
            # Read the log file asynchronously
            data = await asyncio.to_thread(self.read_file, log_file_path)

            # Parse and process the logs
            self.logs_cache = [
                self.parse_log(line) for line in data.strip().split("\n")
            ]

            # Filter out invalid logs and sort by timestamp
            self.logs_cache = [log for log in self.logs_cache if log is not None]
            self.logs_cache.sort(
                key=lambda log: datetime.fromisoformat(log["timestamp"]), reverse=True
            )

        except FileNotFoundError:
            logging.error(f"Error: File not found - {log_file_path}")
            raise
        except Exception as e:
            logging.error(f"Error reading log file: {e}")
            raise
        
    async def load_logs_cache_text(self, log_file_path: str):
        """
        Load logs from a file into the logs cache, sorted by timestamp in descending order.

        Args:
            log_file_path (str): Path to the log file.
        """
        try:
            with open(log_file_path, "r", encoding="utf-8") as log_file:
                log_lines = log_file.readlines()

            # Group logs by blank lines
            grouped_logs = []
            current_entry = []
            for line in log_lines:
                if line.strip():  # Non-blank line
                    current_entry.append(line)
                elif current_entry:  # Blank line signals end of entry
                    grouped_logs.append(current_entry)
                    current_entry = []
            if current_entry:  # Add the last entry if not empty
                grouped_logs.append(current_entry)

            # Parse and sort logs
            self.logs_cache = sorted(
                filter(None, (self.parse_log_entry(entry) for entry in grouped_logs)),
                key=lambda x: datetime.fromisoformat(x["timestamp"].replace("Z", "+00:00")),
                reverse=True,
            )

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Failed to load logs: {str(e)}"
            )

    async def render_html_logs(self,
        content: List[Dict[str, Any]], page: int = 1, records_per_page: int = 50
    ) -> HTMLResponse:
        """
        Generate an HTML table with the given logs and pagination.

        Args:
            logs (List[Dict[str, Any]]): The list of logs to display.
            page (int): Current page number for pagination.
            records_per_page (int): Number of records per page.

        Returns:
            HTMLResponse: A styled HTML table response with logs.
        """
        # Pagination logic
        total_pages = max(1, (len(content) + records_per_page - 1) // records_per_page)
        start_idx = (page - 1) * records_per_page
        end_idx = start_idx + records_per_page
        paginated_logs = content[start_idx:end_idx]

        # HTML Table structure
        html_table = f"""
        <html>
        <head>
            <title>Log Entries</title>
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
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    background-color: #2A3A44;
                    color: #E1D9D1;
                }}
                th, td {{
                    padding: 12px;
                    border: 1px solid #394952;
                    text-align: left;
                }}
                th {{
                    background-color: #203A43;
                    color: #E1D9D1;
                    font-weight: bold;
                }}
                tr:hover {{
                    background-color: #394952;
                }}
                .pagination {{
                    display: flex;
                    justify-content: flex-start;
                    gap: 10px;
                    margin-bottom: 15px;
                }}
                .pagination a {{
                    padding: 8px 16px;
                    text-decoration: none;
                    color: #E1D9D1;
                    background-color: #1565c0;
                    border: 1px solid #394952;
                    border-radius: 4px;
                    transition: background-color 0.3s ease;
                }}
                .pagination a:hover {{
                    background-color: #0F2027;
                }}
                .download-btn {{
                    padding: 8px 16px;
                    text-decoration: none;
                    color: #E1D9D1;
                    background-color: #ff9800;
                    border: 1px solid #394952;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }}
                .download-btn:hover {{
                    background-color: #FFB74D;
                }}
                a {{
                    color: #FFB300;
                    text-decoration: none;
                    font-weight: bold;
                    transition: color 0.3s ease;
                }}
                a:hover {{
                    color: #FFCA28;
                    text-decoration: underline;
                }}
            </style>
        </head>
        <body>
            <h1>Log Entries</h1>
            <div class="pagination">
                {f'<a href="?format=html&page=1">First</a>' if page > 1 else ''}
                {f'<a href="?format=html&page={page - 1}">Previous</a>' if page > 1 else ''}
                {f'<a href="?format=html&page={page + 1}">Next</a>' if page < total_pages else ''}
                {f'<a href="?format=html&page={total_pages}">Last</a>' if page < total_pages else ''}
            </div>         
            <div class="pagination">
                <button class="download-btn" onclick="downloadLogs('csv')">Download CSV</button>
                <button class="download-btn" onclick="downloadLogs('json')">Download JSON</button>
            </div>                                               
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Transaction Name</th>
                        <th>Message</th>
                        <th>Category</th>
                        <th>Feature</th>
                        <th>Is Exception</th>
                    </tr>
                </thead>
                <tbody>
                    {"".join(
                        f'''
                        <tr>
                            <td>{log.get("timestamp", "")}</td>
                            <td>{log.get("level", "")}</td>
                            <td>{log.get("transactionName", "")}</td>
                            <td>{log.get("message", "")}</td>
                            <td>{log.get("category", "")}</td>
                            <td>{log.get("feature", "")}</td>
                            <td>{log.get("isException", "")}</td>
                            <td><a href="/api/logs/details?id={start_idx + index}" target="_blank">View Details</a></td>
                        </tr>
                        '''
                        for index, log in enumerate(paginated_logs)
                    )}
                </tbody>
            </table>
            <script>
                const logs = {json.dumps(content)};

                function downloadLogs(format) {{
                    if (format === 'json') {{
                        const blob = new Blob([JSON.stringify(logs, null, 2)], {{ type: 'application/json' }});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'liberty-logs-frontend.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }} else if (format === 'csv') {{
                        const csvContent = logs.map(log => 
                            `\${{log.timestamp}},\${{log.level}},\${{log.transactionName}},\${{log.message}},\${{log.method}},\${{log.url}},\${{log.category}},\${{log.feature}},\${{log.isException}}`
                        );
                        csvContent.unshift('Timestamp,Level,Transaction Name,Message,Method,URL,Category,Feature,Is Exception');
                        const blob = new Blob([csvContent.join('\\n')], {{ type: 'text/csv' }});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'liberty-logs-frontend.csv';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    }}
                }}
            </script>
        </body>
        </html>
        """
        return HTMLResponse(content=html_table)
    

    async def get_log_details(self, id: int = Query(..., description="The ID of the log entry to fetch")):
        """
        Get log details by ID.
        Args:
            id (int): The log ID to fetch.
        Returns:
            dict: The log entry if found.
        Raises:
            HTTPException: If the log ID is invalid or not found.
        """
        # Check if the log ID is valid and within bounds
        if id >= 0 and id < len(self.logs_cache):
            return self.logs_cache[id]
        else:
            raise HTTPException(status_code=404, detail="Log entry not found")  