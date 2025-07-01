# MCP Postgres Dump Schema

A Model Context Protocol (MCP) server that executes `pg_dump --schema-only` to retrieve PostgreSQL database schemas.

## JSON Usage

Configure the MCP server with JSON (like .mcp.json):
```
{
  "mcpServers": {
    "postgres-dump-schema": {
      "command": "npx",
      "args": [
        "mcp-postgres-dump-schema"
      ],
      "env": {
        "PGHOST": "localhost",
        "PGPORT": "5432",
        "PGDATABASE": "dvdrental",
        "PGUSER": "dvdrental",
        "PGPASSWORD": "dvdrental"
      }
    }
  }
}
```

## Configuration

The server uses environment variables for database connection configuration:

- `PGHOST` - Database host (default: localhost)
- `PGPORT` - Database port (default: 5432)
- `PGDATABASE` - Database name (required)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password

### Example

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=mydb
export PGUSER=myuser
export PGPASSWORD=mypassword

npx postgres_dump_schema
```

## Tool

The server provides one tool:

### `postgres_dump_schema`

Executes `pg_dump --schema-only` to get the database schema.

**Parameters:**
- `database` (optional): Database name (overrides PGDATABASE)
- `host` (optional): Database host (overrides PGHOST)
- `port` (optional): Database port (overrides PGPORT)
- `username` (optional): Database username (overrides PGUSER)
- `password` (optional): Database password (overrides PGPASSWORD)

**Returns:** The schema dump as text.

## Build

```bash
npm install
npm run build
```

## License

MIT