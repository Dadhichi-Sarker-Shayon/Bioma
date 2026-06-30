# Wildlife & Conservation Management System — Compressed Project Proposal

## Concept

A two-portal system: a **public Viewer Portal** (read-only, no login) where anyone can browse and search the species encyclopedia, and a completely separate **Admin Portal** (login required) where a single Admin role manages all data entry, reserves, sightings, and threats. No public registration, no multiple roles — just Admin vs. Anonymous Viewer.

---

## Final Schema — 9 Tables

**1. Admins**
The only user table in the system. No "roles" concept at all — every row here is an admin.
- `Admin_ID` (PK)
- `Username` (UNIQUE, NOT NULL)
- `Password_Hash` (NOT NULL)
- `Full_Name`
- `Email` (UNIQUE)
- `Created_At` (DEFAULT SYSDATE)

**2. Organisms** — *the star table, recursive self-join*
Merges what used to be Organisms + Taxonomic_Ranks. Rank is a VARCHAR CHECK column.
- `Organism_ID` (PK)
- `Scientific_Name` (UNIQUE, NOT NULL)
- `Common_Name`
- `Rank_Name` (CHECK IN Kingdom/Phylum/Class/Order/Family/Genus/Species)
- `Parent_ID` (SELF-REFERENCING FK → Organism_ID, ON DELETE SET NULL)
- `Kingdom_Type` (CHECK IN Animal/Plant) — merged in from Species_Profiles
- `Conservation_Status` (CHECK IN LC/NT/VU/EN/CR/EW/EX) — merged in directly, no separate lookup table
- `Discovery_Year`

*Why this merge is fine:* Conservation_Statuses was only 7 fixed rows with no extra attributes worth a join — storing the code directly with a CHECK constraint keeps the same data integrity with one less table.

**3. Species_Encyclopedia**
Public-facing content. Untouched from before — this is the table the Viewer Portal queries most.
- `Encyclopedia_ID` (PK)
- `Organism_ID` (FK → Organisms, UNIQUE, ON DELETE CASCADE)
- `Description` (CLOB)
- `Diet_Type` (CHECK IN Carnivore/Herbivore/Omnivore/Autotroph)
- `Diet_Details`
- `Physical_Description`
- `Avg_Height_Cm`, `Avg_Length_Cm`
- `Habitat_Behavior`
- `Reproduction_Info`
- `Native_Range_Description`
- `Image_URL`
- `Fun_Fact`
- `Last_Updated` (DEFAULT SYSDATE)

**4. Regions** — *merges Biomes + Geographical_Regions*
One table instead of two. Biome attributes folded directly into region rows.
- `Region_ID` (PK)
- `Region_Name` (NOT NULL)
- `Country` (NOT NULL)
- `Biome_Name` (e.g. Rainforest, Desert, Coral Reef — plain VARCHAR, no separate lookup)
- `Climate_Zone`
- `Area_SqKm`
- `Is_Protected` (CHECK IN Y/N)

*Why this merge is fine:* A biome only had 4 extra columns (temperature, rainfall, climate zone, name) and the relationship was always 1 region → 1 biome in practice for this project's scope. Folding it in removes a join everywhere without losing any displayed data.

**5. Species_Distribution** — *many-to-many bridge, kept exactly as-is*
- `Organism_ID` (CPK, FK → Organisms, ON DELETE CASCADE)
- `Region_ID` (CPK, FK → Regions, ON DELETE CASCADE)
- `Estimated_Population` (CHECK ≥ 0)
- `Last_Survey_Date`
- `Population_Trend` (CHECK IN Increasing/Stable/Decreasing/Unknown)

**6. Reserves**
- `Reserve_ID` (PK)
- `Reserve_Name` (NOT NULL)
- `Region_ID` (FK → Regions)
- `Total_Area_SqKm` (CHECK > 0)
- `Annual_Budget_USD` (CHECK ≥ 0)
- `Established_Year`
- `Reserve_Type` (National Park / Wildlife Sanctuary / Marine Reserve)

**7. Sighting_Logs** — *high-frequency transaction table with trigger*
- `Sighting_ID` (PK)
- `Organism_ID` (FK → Organisms, ON DELETE CASCADE)
- `Reserve_ID` (FK → Reserves, ON DELETE CASCADE)
- `Admin_ID` (FK → Admins — who logged it)
- `Sighting_Timestamp` (DEFAULT SYSTIMESTAMP)
- `Quantity_Observed` (CHECK > 0, NOT NULL)
- `Health_Status` (CHECK IN Healthy/Injured/Malnourished/Dead/Unknown)
- `Observation_Notes`

**8. Threat_Logs** — *merges Regional_Threat_Logs, threat name stored directly*
- `Log_ID` (PK)
- `Region_ID` (FK → Regions)
- `Threat_Name` (NOT NULL — e.g. Deforestation, Poaching, Climate Shift)
- `Threat_Category` (Human-Caused / Natural / Climate-Related)
- `Severity_Level` (CHECK IN Low/Medium/High/Critical)
- `Assessment_Date` (NOT NULL)
- `Admin_ID` (FK → Admins — who reported it)
- `Resolution_Status` (CHECK IN Active/Monitoring/Resolved, DEFAULT Active)

**9. Tags + Organism_Tags** — *kept as a pair since this is genuinely a many-to-many relationship that can't be flattened without losing the tag search feature*
- `Tags`: `Tag_ID` (PK), `Tag_Name` (UNIQUE), `Tag_Category`, `Tag_Color`
- `Organism_Tags`: `Organism_ID` (CPK, FK), `Tag_ID` (CPK, FK) — pure bridge, no extra columns

*(Counting Tags + Organism_Tags as one functional unit, you land at 9 tables total — or 10 if your professor wants them counted separately, which still fits your target range.)*

---

## Two Completely Separate Portals

### Viewer Portal (Public — no login, no Admin table interaction at all)
A pure read-only frontend. Pages:
1. **Home** — stats banner (total species tracked, total reserves, etc.) pulled via simple aggregate queries
2. **Encyclopedia Search** — search bar + tag filter pills (uses the `HAVING COUNT(DISTINCT tag) = N` pattern) + result cards
3. **Species Detail** — full encyclopedia entry, taxonomy breadcrumb (recursive self-join), distribution table, conservation status
4. **Taxonomy Tree** — expandable Kingdom→Species tree browser

The viewer portal never writes to the database. Every endpoint it calls is `SELECT`-only.

### Admin Portal (Separate login, separate routes, separate UI shell — not just a hidden menu)
Built as its own React route tree (e.g. everything under `/admin/*`) with its own layout, distinct visual styling (different navbar color/branding so it's unmistakably the internal tool), and JWT-gated on every request.
1. **Login** — the only entry point into this portal
2. **Dashboard** — stat cards, conservation status pie chart, extinction risk leaderboard (from view), PL/SQL panel to run the stored procedures and see DBMS_OUTPUT live
3. **Organism Manager** — CRUD on Organisms + Species_Encyclopedia, sighting log submission (this is where the validation trigger fires)
4. **Reserve & Threat Manager** — CRUD on Reserves, threat log submission, threat resolution status updates, reserve health table (from view)
5. **Tag Manager** — create/delete tags, assign tags to organisms

---

## PL/SQL — Still Fully Intact

**3 Triggers**
- `TRG_Sighting_Validator` — BEFORE INSERT, blocks Quantity ≤ 0 or null Health_Status
- `TRG_AutoExtinction_Escalator` — AFTER UPDATE on Species_Distribution, sets Organisms.Conservation_Status = 'EW' when global population hits zero
- `TRG_CriticalThreat_Alert` — AFTER INSERT on Threat_Logs, auto-inserts a system alert row when Severity = Critical

**2 Stored Procedures**
- `PRC_CriticalSpecies_Report(Region_ID)` — explicit cursor, lists endangered/critical species in a region with DBMS_OUTPUT
- `PRC_AllocateGrant(Amount)` — cursor-driven proportional fund distribution across reserves, COMMIT/ROLLBACK handling

**2 Functions**
- `FN_PopulationDensity(Organism_ID, Reserve_ID)` — returns population per km²
- `FN_RegionThreatScore(Region_ID)` — returns weighted active threat severity score

# Wildlife & Conservation Management System — Compressed Project Proposal

## Concept

A two-portal system: a **public Viewer Portal** (read-only, no login) where anyone can browse and search the species encyclopedia, and a completely separate **Admin Portal** (login required) where a single Admin role manages all data entry, reserves, sightings, and threats. No public registration, no multiple roles — just Admin vs. Anonymous Viewer.

---

## Final Schema — 9 Tables

**1. Admins**
The only user table in the system. No "roles" concept at all — every row here is an admin.
- `Admin_ID` (PK)
- `Username` (UNIQUE, NOT NULL)
- `Password_Hash` (NOT NULL)
- `Full_Name`
- `Email` (UNIQUE)
- `Created_At` (DEFAULT SYSDATE)

**2. Organisms** — *the star table, recursive self-join*
Merges what used to be Organisms + Taxonomic_Ranks. Rank is a VARCHAR CHECK column.
- `Organism_ID` (PK)
- `Scientific_Name` (UNIQUE, NOT NULL)
- `Common_Name`
- `Rank_Name` (CHECK IN Kingdom/Phylum/Class/Order/Family/Genus/Species)
- `Parent_ID` (SELF-REFERENCING FK → Organism_ID, ON DELETE SET NULL)
- `Kingdom_Type` (CHECK IN Animal/Plant) — merged in from Species_Profiles
- `Conservation_Status` (CHECK IN LC/NT/VU/EN/CR/EW/EX) — merged in directly, no separate lookup table
- `Discovery_Year`

*Why this merge is fine:* Conservation_Statuses was only 7 fixed rows with no extra attributes worth a join — storing the code directly with a CHECK constraint keeps the same data integrity with one less table.

**3. Species_Encyclopedia**
Public-facing content. Untouched from before — this is the table the Viewer Portal queries most.
- `Encyclopedia_ID` (PK)
- `Organism_ID` (FK → Organisms, UNIQUE, ON DELETE CASCADE)
- `Description` (CLOB)
- `Diet_Type` (CHECK IN Carnivore/Herbivore/Omnivore/Autotroph)
- `Diet_Details`
- `Physical_Description`
- `Avg_Height_Cm`, `Avg_Length_Cm`
- `Habitat_Behavior`
- `Reproduction_Info`
- `Native_Range_Description`
- `Image_URL`
- `Fun_Fact`
- `Last_Updated` (DEFAULT SYSDATE)

**4. Regions** — *merges Biomes + Geographical_Regions*
One table instead of two. Biome attributes folded directly into region rows.
- `Region_ID` (PK)
- `Region_Name` (NOT NULL)
- `Country` (NOT NULL)
- `Biome_Name` (e.g. Rainforest, Desert, Coral Reef — plain VARCHAR, no separate lookup)
- `Climate_Zone`
- `Area_SqKm`
- `Is_Protected` (CHECK IN Y/N)

*Why this merge is fine:* A biome only had 4 extra columns (temperature, rainfall, climate zone, name) and the relationship was always 1 region → 1 biome in practice for this project's scope. Folding it in removes a join everywhere without losing any displayed data.

**5. Species_Distribution** — *many-to-many bridge, kept exactly as-is*
- `Organism_ID` (CPK, FK → Organisms, ON DELETE CASCADE)
- `Region_ID` (CPK, FK → Regions, ON DELETE CASCADE)
- `Estimated_Population` (CHECK ≥ 0)
- `Last_Survey_Date`
- `Population_Trend` (CHECK IN Increasing/Stable/Decreasing/Unknown)

**6. Reserves**
- `Reserve_ID` (PK)
- `Reserve_Name` (NOT NULL)
- `Region_ID` (FK → Regions)
- `Total_Area_SqKm` (CHECK > 0)
- `Annual_Budget_USD` (CHECK ≥ 0)
- `Established_Year`
- `Reserve_Type` (National Park / Wildlife Sanctuary / Marine Reserve)

**7. Sighting_Logs** — *high-frequency transaction table with trigger*
- `Sighting_ID` (PK)
- `Organism_ID` (FK → Organisms, ON DELETE CASCADE)
- `Reserve_ID` (FK → Reserves, ON DELETE CASCADE)
- `Admin_ID` (FK → Admins — who logged it)
- `Sighting_Timestamp` (DEFAULT SYSTIMESTAMP)
- `Quantity_Observed` (CHECK > 0, NOT NULL)
- `Health_Status` (CHECK IN Healthy/Injured/Malnourished/Dead/Unknown)
- `Observation_Notes`

**8. Threat_Logs** — *merges Regional_Threat_Logs, threat name stored directly*
- `Log_ID` (PK)
- `Region_ID` (FK → Regions)
- `Threat_Name` (NOT NULL — e.g. Deforestation, Poaching, Climate Shift)
- `Threat_Category` (Human-Caused / Natural / Climate-Related)
- `Severity_Level` (CHECK IN Low/Medium/High/Critical)
- `Assessment_Date` (NOT NULL)
- `Admin_ID` (FK → Admins — who reported it)
- `Resolution_Status` (CHECK IN Active/Monitoring/Resolved, DEFAULT Active)

**9. Tags + Organism_Tags** — *kept as a pair since this is genuinely a many-to-many relationship that can't be flattened without losing the tag search feature*
- `Tags`: `Tag_ID` (PK), `Tag_Name` (UNIQUE), `Tag_Category`, `Tag_Color`
- `Organism_Tags`: `Organism_ID` (CPK, FK), `Tag_ID` (CPK, FK) — pure bridge, no extra columns

*(Counting Tags + Organism_Tags as one functional unit, you land at 9 tables total — or 10 if your professor wants them counted separately, which still fits your target range.)*

---

## Two Completely Separate Portals

### Viewer Portal (Public — no login, no Admin table interaction at all)
A pure read-only frontend. Pages:
1. **Home** — stats banner (total species tracked, total reserves, etc.) pulled via simple aggregate queries
2. **Encyclopedia Search** — search bar + tag filter pills (uses the `HAVING COUNT(DISTINCT tag) = N` pattern) + result cards
3. **Species Detail** — full encyclopedia entry, taxonomy breadcrumb (recursive self-join), distribution table, conservation status
4. **Taxonomy Tree** — expandable Kingdom→Species tree browser

The viewer portal never writes to the database. Every endpoint it calls is `SELECT`-only.

### Admin Portal (Separate login, separate routes, separate UI shell — not just a hidden menu)
Built as its own React route tree (e.g. everything under `/admin/*`) with its own layout, distinct visual styling (different navbar color/branding so it's unmistakably the internal tool), and JWT-gated on every request.
1. **Login** — the only entry point into this portal
2. **Dashboard** — stat cards, conservation status pie chart, extinction risk leaderboard (from view), PL/SQL panel to run the stored procedures and see DBMS_OUTPUT live
3. **Organism Manager** — CRUD on Organisms + Species_Encyclopedia, sighting log submission (this is where the validation trigger fires)
4. **Reserve & Threat Manager** — CRUD on Reserves, threat log submission, threat resolution status updates, reserve health table (from view)
5. **Tag Manager** — create/delete tags, assign tags to organisms

---

## PL/SQL — Still Fully Intact

**3 Triggers**
- `TRG_Sighting_Validator` — BEFORE INSERT, blocks Quantity ≤ 0 or null Health_Status
- `TRG_AutoExtinction_Escalator` — AFTER UPDATE on Species_Distribution, sets Organisms.Conservation_Status = 'EW' when global population hits zero
- `TRG_CriticalThreat_Alert` — AFTER INSERT on Threat_Logs, auto-inserts a system alert row when Severity = Critical

**2 Stored Procedures**
- `PRC_CriticalSpecies_Report(Region_ID)` — explicit cursor, lists endangered/critical species in a region with DBMS_OUTPUT
- `PRC_AllocateGrant(Amount)` — cursor-driven proportional fund distribution across reserves, COMMIT/ROLLBACK handling

**2 Functions**
- `FN_PopulationDensity(Organism_ID, Reserve_ID)` — returns population per km²
- `FN_RegionThreatScore(Region_ID)` — returns weighted active threat severity score

**2 Views**
- `V_ExtinctionRisk` — ranked species by status + global population
- `V_Reserve_Health` — sightings, species count, health breakdown, budget efficiency per reserve

---

## Tech Stack (unchanged)

ASP.NET Core Web API (.NET 8) backend with JWT auth, Oracle.ManagedDataAccess.Core driver, Oracle XE database. React 18 + Vite frontend split into two route trees (public viewer + admin), Tailwind CSS, Recharts for the dashboard, Axios for API calls.
