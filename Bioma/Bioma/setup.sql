-- 1. DROP ALL POTENTIAL EXISTING TABLES (Old and New)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Roles CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Ecological_Interactions CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Threat_Mitigation CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Regional_Threat_Logs CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Threats CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Threat_Logs CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Sighting_Logs CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Reserves CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Species_Distribution CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Geographical_Regions CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Biomes CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Regions CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Species_Profiles CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Species_Encyclopedia CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Taxonomic_Ranks CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Conservation_Statuses CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Organism_Tags CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Tags CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Organisms CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Admins CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE System_Alerts CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL;
END;
/

-- DROP SEQUENCES
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Admins_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Organisms_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Encyclopedia_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Regions_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Reserves_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Sightings_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE ThreatLogs_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Tags_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE Alerts_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQUENCE_RESERVES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_BIOMES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_ECOLOGICAL_INTERACTIONS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_GEOGRAPHICAL_REGIONS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_INTERACTION_TYPES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_LIVING_SPECIMENS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_ORGANISMS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_REGIONAL_THREAT_LOGS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_RESEARCH_FACILITIES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_SIGHTING_LOGS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_SPECIES_ENCYCLOPEDIA'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_SPECIES_PROFILES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_SYSTEM_USERS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_TAGS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_TAXONOMIC_RANKS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_THREAT_TYPES'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- 2. CREATE SEQUENCES
CREATE SEQUENCE Admins_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Organisms_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Encyclopedia_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Regions_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Reserves_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Sightings_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE ThreatLogs_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Tags_SEQ START WITH 1 INCREMENT BY 1;
/
CREATE SEQUENCE Alerts_SEQ START WITH 1 INCREMENT BY 1;
/

-- 3. CREATE TABLES

-- 1. Admins
CREATE TABLE Admins (
    Admin_ID INT PRIMARY KEY,
    Username VARCHAR2(50) UNIQUE NOT NULL,
    Password_Hash VARCHAR2(255) NOT NULL,
    Full_Name VARCHAR2(100),
    Email VARCHAR2(100) UNIQUE,
    Created_At DATE DEFAULT SYSDATE
);
/

-- 2. Organisms
CREATE TABLE Organisms (
    Organism_ID INT PRIMARY KEY,
    Scientific_Name VARCHAR2(100) UNIQUE NOT NULL,
    Common_Name VARCHAR2(100),
    Rank_Name VARCHAR2(50) CHECK (Rank_Name IN ('Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species')),
    Parent_ID INT,
    Kingdom_Type VARCHAR2(20) CHECK (Kingdom_Type IN ('Animal', 'Plant')),
    Conservation_Status VARCHAR2(10) CHECK (Conservation_Status IN ('LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX')),
    Discovery_Year INT,
    CONSTRAINT fk_organism_parent FOREIGN KEY (Parent_ID) REFERENCES Organisms(Organism_ID) ON DELETE SET NULL
);
/

-- 3. Species_Encyclopedia
CREATE TABLE Species_Encyclopedia (
    Encyclopedia_ID INT PRIMARY KEY,
    Organism_ID INT UNIQUE NOT NULL,
    Description CLOB,
    Diet_Type VARCHAR2(20) CHECK (Diet_Type IN ('Carnivore', 'Herbivore', 'Omnivore', 'Autotroph')),
    Diet_Details VARCHAR2(255),
    Physical_Description VARCHAR2(255),
    Avg_Height_Cm NUMBER(10,2),
    Avg_Length_Cm NUMBER(10,2),
    Habitat_Behavior VARCHAR2(255),
    Reproduction_Info VARCHAR2(255),
    Native_Range_Description VARCHAR2(255),
    Image_URL VARCHAR2(500),
    Fun_Fact VARCHAR2(500),
    Last_Updated DATE DEFAULT SYSDATE,
    CONSTRAINT fk_encyclopedia_organism FOREIGN KEY (Organism_ID) REFERENCES Organisms(Organism_ID) ON DELETE CASCADE
);
/

-- 4. Regions
CREATE TABLE Regions (
    Region_ID INT PRIMARY KEY,
    Region_Name VARCHAR2(100) NOT NULL,
    Country VARCHAR2(100) NOT NULL,
    Biome_Name VARCHAR2(100),
    Climate_Zone VARCHAR2(100),
    Area_SqKm NUMBER(15,2),
    Is_Protected CHAR(1) CHECK (Is_Protected IN ('Y', 'N'))
);
/

-- 5. Species_Distribution
CREATE TABLE Species_Distribution (
    Organism_ID INT,
    Region_ID INT,
    Estimated_Population INT CHECK (Estimated_Population >= 0),
    Last_Survey_Date DATE,
    Population_Trend VARCHAR2(20) CHECK (Population_Trend IN ('Increasing', 'Stable', 'Decreasing', 'Unknown')),
    PRIMARY KEY (Organism_ID, Region_ID),
    CONSTRAINT fk_dist_organism FOREIGN KEY (Organism_ID) REFERENCES Organisms(Organism_ID) ON DELETE CASCADE,
    CONSTRAINT fk_dist_region FOREIGN KEY (Region_ID) REFERENCES Regions(Region_ID) ON DELETE CASCADE
);
/

-- 6. Reserves
CREATE TABLE Reserves (
    Reserve_ID INT PRIMARY KEY,
    Reserve_Name VARCHAR2(100) NOT NULL,
    Region_ID INT,
    Total_Area_SqKm NUMBER(15,2) CHECK (Total_Area_SqKm > 0),
    Annual_Budget_USD NUMBER(15,2) CHECK (Annual_Budget_USD >= 0),
    Established_Year INT,
    Reserve_Type VARCHAR2(100),
    CONSTRAINT fk_reserve_region FOREIGN KEY (Region_ID) REFERENCES Regions(Region_ID) ON DELETE SET NULL
);
/

-- 7. Sighting_Logs
CREATE TABLE Sighting_Logs (
    Sighting_ID INT PRIMARY KEY,
    Organism_ID INT,
    Reserve_ID INT,
    Admin_ID INT,
    Sighting_Timestamp TIMESTAMP DEFAULT SYSTIMESTAMP,
    Quantity_Observed INT NOT NULL,
    Health_Status VARCHAR2(50) CHECK (Health_Status IN ('Healthy', 'Injured', 'Malnourished', 'Dead', 'Unknown')),
    Observation_Notes VARCHAR2(500),
    CONSTRAINT fk_sighting_organism FOREIGN KEY (Organism_ID) REFERENCES Organisms(Organism_ID) ON DELETE CASCADE,
    CONSTRAINT fk_sighting_reserve FOREIGN KEY (Reserve_ID) REFERENCES Reserves(Reserve_ID) ON DELETE CASCADE,
    CONSTRAINT fk_sighting_admin FOREIGN KEY (Admin_ID) REFERENCES Admins(Admin_ID) ON DELETE SET NULL
);
/

-- 8. Threat_Logs
CREATE TABLE Threat_Logs (
    Log_ID INT PRIMARY KEY,
    Region_ID INT,
    Threat_Name VARCHAR2(100) NOT NULL,
    Threat_Category VARCHAR2(100) CHECK (Threat_Category IN ('Human-Caused', 'Natural', 'Climate-Related')),
    Severity_Level VARCHAR2(20) CHECK (Severity_Level IN ('Low', 'Medium', 'High', 'Critical')),
    Assessment_Date DATE NOT NULL,
    Admin_ID INT,
    Resolution_Status VARCHAR2(20) DEFAULT 'Active' CHECK (Resolution_Status IN ('Active', 'Monitoring', 'Resolved')),
    CONSTRAINT fk_threat_region FOREIGN KEY (Region_ID) REFERENCES Regions(Region_ID) ON DELETE CASCADE,
    CONSTRAINT fk_threat_admin FOREIGN KEY (Admin_ID) REFERENCES Admins(Admin_ID) ON DELETE SET NULL
);
/

-- 9. Tags
CREATE TABLE Tags (
    Tag_ID INT PRIMARY KEY,
    Tag_Name VARCHAR2(50) UNIQUE NOT NULL,
    Tag_Category VARCHAR2(50),
    Tag_Color VARCHAR2(20)
);
/

-- 10. Organism_Tags
CREATE TABLE Organism_Tags (
    Organism_ID INT,
    Tag_ID INT,
    PRIMARY KEY (Organism_ID, Tag_ID),
    CONSTRAINT fk_otag_organism FOREIGN KEY (Organism_ID) REFERENCES Organisms(Organism_ID) ON DELETE CASCADE,
    CONSTRAINT fk_otag_tag FOREIGN KEY (Tag_ID) REFERENCES Tags(Tag_ID) ON DELETE CASCADE
);
/

-- 11. System_Alerts (auto-populated by TRG_CriticalThreat_Alert)
CREATE TABLE System_Alerts (
    Alert_ID INT PRIMARY KEY,
    Alert_Type VARCHAR2(50) NOT NULL,
    Alert_Message VARCHAR2(500) NOT NULL,
    Region_ID INT,
    Threat_Log_ID INT,
    Created_At TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_alert_region FOREIGN KEY (Region_ID) REFERENCES Regions(Region_ID) ON DELETE SET NULL,
    CONSTRAINT fk_alert_threat FOREIGN KEY (Threat_Log_ID) REFERENCES Threat_Logs(Log_ID) ON DELETE SET NULL
);
/

-- 4. VIEWS

CREATE OR REPLACE VIEW V_ExtinctionRisk AS
SELECT 
    o.Organism_ID,
    o.Scientific_Name,
    o.Common_Name,
    o.Conservation_Status,
    NVL(SUM(sd.Estimated_Population), 0) AS Global_Population,
    COUNT(sd.Region_ID) AS Region_Count
FROM Organisms o
LEFT JOIN Species_Distribution sd ON o.Organism_ID = sd.Organism_ID
WHERE o.Rank_Name = 'Species'
GROUP BY o.Organism_ID, o.Scientific_Name, o.Common_Name, o.Conservation_Status;
/

CREATE OR REPLACE VIEW V_Reserve_Health AS
SELECT 
    r.Reserve_ID,
    r.Reserve_Name,
    r.Total_Area_SqKm,
    r.Annual_Budget_USD,
    reg.Region_Name,
    COUNT(s.Sighting_ID) AS Total_Sightings,
    COUNT(DISTINCT s.Organism_ID) AS Unique_Species_Spotted,
    SUM(CASE WHEN s.Health_Status IN ('Injured', 'Malnourished', 'Dead') THEN 1 ELSE 0 END) AS Unhealthy_Sightings
FROM Reserves r
JOIN Regions reg ON r.Region_ID = reg.Region_ID
LEFT JOIN Sighting_Logs s ON r.Reserve_ID = s.Reserve_ID
GROUP BY r.Reserve_ID, r.Reserve_Name, r.Total_Area_SqKm, r.Annual_Budget_USD, reg.Region_Name;
/

-- 5. TRIGGERS

-- TRG_Sighting_Validator
CREATE OR REPLACE TRIGGER TRG_Sighting_Validator
BEFORE INSERT OR UPDATE ON Sighting_Logs
FOR EACH ROW
BEGIN
    IF :NEW.Quantity_Observed <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Quantity observed must be greater than zero.');
    END IF;
    IF :NEW.Health_Status IS NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'Health status cannot be null.');
    END IF;
END;
/

-- TRG_AutoExtinction_Escalator
CREATE OR REPLACE TRIGGER TRG_AutoExtinction_Escalator
AFTER UPDATE ON Species_Distribution
FOR EACH ROW
WHEN (NEW.Estimated_Population = 0 AND OLD.Estimated_Population > 0)
DECLARE
    PRAGMA AUTONOMOUS_TRANSACTION;
    v_total_pop INT;
BEGIN
    SELECT NVL(SUM(Estimated_Population), 0) INTO v_total_pop
    FROM Species_Distribution
    WHERE Organism_ID = :NEW.Organism_ID;
    
    IF v_total_pop = 0 THEN
        UPDATE Organisms
        SET Conservation_Status = 'EW'
        WHERE Organism_ID = :NEW.Organism_ID
        AND Conservation_Status NOT IN ('EW', 'EX');
        COMMIT;
    END IF;
END;
/

-- TRG_CriticalThreat_Alert
CREATE OR REPLACE TRIGGER TRG_CriticalThreat_Alert
AFTER INSERT ON Threat_Logs
FOR EACH ROW
WHEN (NEW.Severity_Level = 'Critical')
DECLARE
    PRAGMA AUTONOMOUS_TRANSACTION;
BEGIN
    INSERT INTO System_Alerts (Alert_Type, Alert_Message, Region_ID, Threat_Log_ID, Created_At)
    VALUES ('CRITICAL_THREAT', :NEW.Threat_Name || ' in Region ' || :NEW.Region_ID, :NEW.Region_ID, :NEW.Log_ID, SYSDATE);
    COMMIT;
END;
/

-- 6. FUNCTIONS

CREATE OR REPLACE FUNCTION FN_PopulationDensity(p_Organism_ID INT, p_Region_ID INT)
RETURN NUMBER
IS
    v_pop INT;
    v_area NUMBER;
BEGIN
    SELECT Estimated_Population INTO v_pop
    FROM Species_Distribution
    WHERE Organism_ID = p_Organism_ID AND Region_ID = p_Region_ID;
    
    SELECT Area_SqKm INTO v_area
    FROM Regions
    WHERE Region_ID = p_Region_ID;
    
    IF v_area > 0 THEN
        RETURN v_pop / v_area;
    ELSE
        RETURN 0;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
END;
/

CREATE OR REPLACE FUNCTION FN_RegionThreatScore(p_Region_ID INT)
RETURN NUMBER
IS
    v_score NUMBER := 0;
BEGIN
    SELECT NVL(SUM(
        CASE Severity_Level
            WHEN 'Low' THEN 1
            WHEN 'Medium' THEN 3
            WHEN 'High' THEN 5
            WHEN 'Critical' THEN 10
            ELSE 0
        END
    ), 0) INTO v_score
    FROM Threat_Logs
    WHERE Region_ID = p_Region_ID AND Resolution_Status = 'Active';
    
    RETURN v_score;
END;
/

-- 7. PROCEDURES

CREATE OR REPLACE PROCEDURE PRC_CriticalSpecies_Report(p_Region_ID INT)
IS
    CURSOR c_species IS
        SELECT o.Scientific_Name, o.Common_Name, o.Conservation_Status, sd.Estimated_Population
        FROM Organisms o
        JOIN Species_Distribution sd ON o.Organism_ID = sd.Organism_ID
        WHERE sd.Region_ID = p_Region_ID 
          AND o.Conservation_Status IN ('EN', 'CR', 'EW');
    v_found BOOLEAN := FALSE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('--- Critical Species Report for Region ' || p_Region_ID || ' ---');
    FOR r_species IN c_species LOOP
        v_found := TRUE;
        DBMS_OUTPUT.PUT_LINE('Species: ' || r_species.Common_Name || ' (' || r_species.Scientific_Name || ') - Status: ' || r_species.Conservation_Status || ' - Pop: ' || r_species.Estimated_Population);
    END LOOP;
    IF NOT v_found THEN
        DBMS_OUTPUT.PUT_LINE('No critical species found in this region.');
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE PRC_AllocateGrant(p_Amount NUMBER)
IS
    v_total_area NUMBER;
    CURSOR c_reserves IS SELECT Reserve_ID, Total_Area_SqKm FROM Reserves WHERE Total_Area_SqKm > 0;
BEGIN
    SELECT SUM(Total_Area_SqKm) INTO v_total_area FROM Reserves WHERE Total_Area_SqKm > 0;
    
    IF v_total_area > 0 THEN
        FOR r_res IN c_reserves LOOP
            UPDATE Reserves
            SET Annual_Budget_USD = NVL(Annual_Budget_USD, 0) + (p_Amount * (r_res.Total_Area_SqKm / v_total_area))
            WHERE Reserve_ID = r_res.Reserve_ID;
        END LOOP;
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Grant of ' || p_Amount || ' allocated successfully across reserves based on area.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('No eligible reserves found for allocation.');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error allocating grant: ' || SQLERRM);
END;
/


CREATE OR REPLACE TRIGGER trg_Admins_ID
BEFORE INSERT ON Admins
FOR EACH ROW
BEGIN
  IF :NEW.Admin_ID IS NULL THEN
    SELECT Admins_SEQ.NEXTVAL INTO :NEW.Admin_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Organisms_ID
BEFORE INSERT ON Organisms
FOR EACH ROW
BEGIN
  IF :NEW.Organism_ID IS NULL THEN
    SELECT Organisms_SEQ.NEXTVAL INTO :NEW.Organism_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Encyclopedia_ID
BEFORE INSERT ON Species_Encyclopedia
FOR EACH ROW
BEGIN
  IF :NEW.Encyclopedia_ID IS NULL THEN
    SELECT Encyclopedia_SEQ.NEXTVAL INTO :NEW.Encyclopedia_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Regions_ID
BEFORE INSERT ON Regions
FOR EACH ROW
BEGIN
  IF :NEW.Region_ID IS NULL THEN
    SELECT Regions_SEQ.NEXTVAL INTO :NEW.Region_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Reserves_ID
BEFORE INSERT ON Reserves
FOR EACH ROW
BEGIN
  IF :NEW.Reserve_ID IS NULL THEN
    SELECT Reserves_SEQ.NEXTVAL INTO :NEW.Reserve_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Sighting_Logs_ID
BEFORE INSERT ON Sighting_Logs
FOR EACH ROW
BEGIN
  IF :NEW.Sighting_ID IS NULL THEN
    SELECT Sightings_SEQ.NEXTVAL INTO :NEW.Sighting_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Threat_Logs_ID
BEFORE INSERT ON Threat_Logs
FOR EACH ROW
BEGIN
  IF :NEW.Log_ID IS NULL THEN
    SELECT ThreatLogs_SEQ.NEXTVAL INTO :NEW.Log_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Tags_ID
BEFORE INSERT ON Tags
FOR EACH ROW
BEGIN
  IF :NEW.Tag_ID IS NULL THEN
    SELECT Tags_SEQ.NEXTVAL INTO :NEW.Tag_ID FROM DUAL;
  END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_Alerts_ID
BEFORE INSERT ON System_Alerts
FOR EACH ROW
BEGIN
  IF :NEW.Alert_ID IS NULL THEN
    SELECT Alerts_SEQ.NEXTVAL INTO :NEW.Alert_ID FROM DUAL;
  END IF;
END;
/

-- 8. SEED DATA

-- Admin seed (admin / admin123)
-- Hash generated using SHA256 (base64) matching C# backend
INSERT INTO Admins (Username, Password_Hash, Full_Name, Email) 
VALUES ('admin', 'jGl25bVBBBW96Qi9Te4V37Fnqchz/Eu4qB9vKrRIqRg=', 'System Administrator', 'admin@bioma.org');
/

-- Some basic taxonomy data to get started
INSERT INTO Organisms (Scientific_Name, Common_Name, Rank_Name, Kingdom_Type, Conservation_Status) 
VALUES ('Animalia', 'Animals', 'Kingdom', 'Animal', 'LC');
/
INSERT INTO Organisms (Scientific_Name, Common_Name, Rank_Name, Kingdom_Type, Parent_ID) 
VALUES ('Chordata', 'Chordates', 'Phylum', 'Animal', 1);
/
INSERT INTO Organisms (Scientific_Name, Common_Name, Rank_Name, Kingdom_Type, Parent_ID) 
VALUES ('Mammalia', 'Mammals', 'Class', 'Animal', 2);
/

COMMIT;
/
