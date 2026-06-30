# Wildlife & Conservation Management System

This project is organized into modules for easier implementation. Please refer to the documentation in the \docs/\ directory:

## Documentation Modules

1. **[Project Proposal & Core Schema](docs/01_Project_Proposal.md)**: Overall concept, 9-table schema, PL/SQL requirements, and tech stack.
2. **[Page Specification](docs/02_Page_Specification.md)**: Complete UI/UX routes for Viewer and Admin portals.
3. **[Database Architecture](docs/03_Database_Architecture.md)**: Table relationships, ERD, and communication flow.
4. **[User Capabilities](docs/04_User_Capabilities.md)**: Detailed breakdown of what Public Visitors and Admins can do.
5. **[Complete Feature List](docs/05_Feature_List.md)**: 41-point feature checklist for public, admin, PL/SQL, analytics, and DB design.

## Implementation Plan
*To be determined (e.g., Database Setup -> Backend Setup -> Frontend Setup).*

## ER & Schema Diagram

```mermaid
erDiagram
    Admins {
        int Admin_ID PK
        varchar Username UK
        varchar Password_Hash
        varchar Full_Name
        varchar Email UK
        date Created_At
    }
    
    Organisms {
        int Organism_ID PK
        varchar Scientific_Name UK
        varchar Common_Name
        varchar Rank_Name
        int Parent_ID FK
        varchar Kingdom_Type
        varchar Conservation_Status
        int Discovery_Year
    }
    
    Species_Encyclopedia {
        int Encyclopedia_ID PK
        int Organism_ID FK "UK"
        clob Description
        varchar Diet_Type
        varchar Diet_Details
        varchar Physical_Description
        float Avg_Height_Cm
        float Avg_Length_Cm
        varchar Habitat_Behavior
        varchar Reproduction_Info
        varchar Native_Range_Description
        varchar Image_URL
        varchar Fun_Fact
        date Last_Updated
    }
    
    Regions {
        int Region_ID PK
        varchar Region_Name
        varchar Country
        varchar Biome_Name
        varchar Climate_Zone
        float Area_SqKm
        char Is_Protected
    }
    
    Species_Distribution {
        int Organism_ID PK, FK
        int Region_ID PK, FK
        int Estimated_Population
        date Last_Survey_Date
        varchar Population_Trend
    }
    
    Reserves {
        int Reserve_ID PK
        varchar Reserve_Name
        int Region_ID FK
        float Total_Area_SqKm
        float Annual_Budget_USD
        int Established_Year
        varchar Reserve_Type
    }
    
    Sighting_Logs {
        int Sighting_ID PK
        int Organism_ID FK
        int Reserve_ID FK
        int Admin_ID FK
        timestamp Sighting_Timestamp
        int Quantity_Observed
        varchar Health_Status
        varchar Observation_Notes
    }
    
    Threat_Logs {
        int Log_ID PK
        int Region_ID FK
        varchar Threat_Name
        varchar Threat_Category
        varchar Severity_Level
        date Assessment_Date
        int Admin_ID FK
        varchar Resolution_Status
    }
    
    Tags {
        int Tag_ID PK
        varchar Tag_Name UK
        varchar Tag_Category
        varchar Tag_Color
    }
    
    Organism_Tags {
        int Organism_ID PK, FK
        int Tag_ID PK, FK
    }

    Admins ||--o{ Sighting_Logs : "Logs"
    Admins ||--o{ Threat_Logs : "Reports"
    
    Organisms ||--o{ Organisms : "Parent_ID (Recursive)"
    Organisms ||--|| Species_Encyclopedia : "Described by"
    Organisms ||--o{ Sighting_Logs : "Sighted in"
    
    Organisms ||--o{ Species_Distribution : "Has distribution"
    Regions ||--o{ Species_Distribution : "Contains species"
    
    Organisms ||--o{ Organism_Tags : "Has tags"
    Tags ||--o{ Organism_Tags : "Applied to species"
    
    Regions ||--o{ Reserves : "Contains"
    Regions ||--o{ Threat_Logs : "Faces threats"
    
    Reserves ||--o{ Sighting_Logs : "Occurs at"
```
