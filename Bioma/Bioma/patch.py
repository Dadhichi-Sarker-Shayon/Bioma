import re

with open('setup.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace DEFAULT SEQ.NEXTVAL PRIMARY KEY with PRIMARY KEY
pattern = r"(\w+)\s+INT\s+DEFAULT\s+(\w+_SEQ)\.NEXTVAL\s+PRIMARY\s+KEY"
matches = re.findall(pattern, content)

new_content = re.sub(pattern, r"\1 INT PRIMARY KEY", content)

triggers = []
for col, seq in matches:
    table_name = seq.replace('_SEQ', '')
    if table_name == 'Encyclopedia':
        table_name = 'Encyclopedia' # wait, the table is called Encyclopedia
    elif table_name == 'ThreatLogs':
        table_name = 'Threat_Logs'
    
    # Try to find the actual table name
    # "CREATE TABLE <Name> ("
    # I'll just use a general approach
    # Let's extract table name from the context
    pass

# A better way to get the table name is to find the CREATE TABLE that precedes it
# Let's do it manually since there are only 8 tables

table_maps = {
    'Admins_SEQ': 'Admins',
    'Organisms_SEQ': 'Organisms',
    'Encyclopedia_SEQ': 'Encyclopedia',
    'Regions_SEQ': 'Regions',
    'Reserves_SEQ': 'Reserves',
    'Sightings_SEQ': 'Sighting_Logs', # Threat_Logs, Sighting_Logs, Tags ? Let's check
    'ThreatLogs_SEQ': 'Threat_Logs',
    'Tags_SEQ': 'Tags'
}

trigger_sql = ""
for col, seq in matches:
    table_name = table_maps.get(seq, seq.replace('_SEQ', ''))
    # Sighting_Logs uses Sightings_SEQ? Threat_Logs uses ThreatLogs_SEQ
    
    trigger_sql += f"""
CREATE OR REPLACE TRIGGER trg_{table_name}_ID
BEFORE INSERT ON {table_name}
FOR EACH ROW
BEGIN
  IF :NEW.{col} IS NULL THEN
    SELECT {seq}.NEXTVAL INTO :NEW.{col} FROM DUAL;
  END IF;
END;
/
"""

# Insert triggers before '-- 8. SEED DATA'
new_content = new_content.replace('-- 8. SEED DATA', trigger_sql + '\n-- 8. SEED DATA')

with open('setup.sql', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patched successfully")
