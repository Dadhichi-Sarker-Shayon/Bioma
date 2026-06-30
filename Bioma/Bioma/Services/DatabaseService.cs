using System.Data;
using Oracle.ManagedDataAccess.Client;

namespace Bioma.Services
{
    public class DatabaseService
    {
        private readonly string _connStr;

        public DatabaseService(IConfiguration config)
        {
            // Pulls the Oracle connection details safely from appsettings.json
            _connStr = config.GetConnectionString("OracleDB")
                ?? throw new InvalidOperationException("Oracle connection sequence is missing inside appsettings.json.");
        }

        // Establishes a live link and opens a data pipeline session to Oracle XE
        public OracleConnection GetConnection()
        {
            var conn = new OracleConnection(_connStr);
            conn.Open();
            return conn;
        }

        // Executes SELECT queries, compiling database rows into structured DataTables
        public DataTable Query(string sql, Dictionary<string, object>? parms = null)
        {
            using var conn = GetConnection();
            using var cmd = new OracleCommand(sql, conn);
            if (parms != null)
            {
                foreach (var p in parms)
                    cmd.Parameters.Add(p.Key, p.Value ?? DBNull.Value);
            }
            using var da = new OracleDataAdapter(cmd);
            var dt = new DataTable();
            da.Fill(dt);
            return dt;
        }

        // Executes DML commands securely (INSERT, UPDATE, DELETE)
        public int Execute(string sql, Dictionary<string, object>? parms = null)
        {
            using var conn = GetConnection();
            using var cmd = new OracleCommand(sql, conn);
            if (parms != null)
            {
                foreach (var p in parms)
                    cmd.Parameters.Add(p.Key, p.Value ?? DBNull.Value);
            }
            return cmd.ExecuteNonQuery();
        }

        // Executes multi-statement DDL/DML setup scripts separated by '/' on new lines
        public void ExecuteSetupScript(string sqlScript)
        {
            var statements = System.Text.RegularExpressions.Regex.Split(
                sqlScript, 
                @"^\s*/\s*$", 
                System.Text.RegularExpressions.RegexOptions.Multiline
            );
            
            using var conn = GetConnection();
            string currentStatement = "";
            try
            {
                foreach (var rawStmt in statements)
                {
                    var stmt = rawStmt.Trim();
                    if (string.IsNullOrWhiteSpace(stmt)) continue;

                    if (stmt.EndsWith(";") && !stmt.EndsWith("END;", StringComparison.OrdinalIgnoreCase))
                    {
                        stmt = stmt.Substring(0, stmt.Length - 1).Trim();
                    }

                    currentStatement = stmt;
                    using var cmd = new OracleCommand(stmt, conn);
                    cmd.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to execute statement:\n{currentStatement}\n\nOracle Error: {ex.Message}", ex);
            }
        }

        // Calls a stored procedure and captures any DBMS_OUTPUT buffer logs generated during execution
        public string CallProcedureWithOutput(string procName, Dictionary<string, object>? parms = null)
        {
            using var conn = GetConnection();
            
            // 1. Enable DBMS_OUTPUT
            using (var enableCmd = new OracleCommand("BEGIN DBMS_OUTPUT.ENABLE(NULL); END;", conn))
            {
                enableCmd.ExecuteNonQuery();
            }

            // 2. Call the Stored Procedure
            using (var procCmd = new OracleCommand(procName, conn))
            {
                procCmd.CommandType = CommandType.StoredProcedure;
                if (parms != null)
                {
                    foreach (var p in parms)
                        procCmd.Parameters.Add(p.Key, p.Value ?? DBNull.Value);
                }
                procCmd.ExecuteNonQuery();
            }

            // 3. Retrieve lines from DBMS_OUTPUT
            var lines = new List<string>();
            using (var getLineCmd = new OracleCommand("BEGIN DBMS_OUTPUT.GET_LINE(:line, :status); END;", conn))
            {
                var lineParam = getLineCmd.Parameters.Add("line", OracleDbType.Varchar2, 32767);
                lineParam.Direction = ParameterDirection.Output;

                var statusParam = getLineCmd.Parameters.Add("status", OracleDbType.Int32);
                statusParam.Direction = ParameterDirection.Output;

                while (true)
                {
                    getLineCmd.ExecuteNonQuery();
                    var status = Convert.ToInt32(statusParam.Value.ToString());
                    if (status != 0) break; // 0 means successfully fetched line, non-zero is EOF
                    lines.Add(lineParam.Value?.ToString() ?? "");
                }
            }

            return string.Join("\n", lines);
        }
    }
}