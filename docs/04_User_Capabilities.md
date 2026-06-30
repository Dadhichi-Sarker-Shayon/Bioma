# Part 1 — User Capabilities: Who Can Do What, Where, and How

There are exactly two actors in this system: the **Public Visitor** (anonymous, no account) and the **Admin** (the only authenticated role). Below is every action each can take, mapped to the exact page and the exact mechanism behind it.

---

## Public Visitor — What They Can Do

| Action | Where (Page) | How (Mechanism) |
|---|---|---|
| Search species by name | Encyclopedia Search | Types in search box → debounced GET request → `LIKE` query on Common_Name/Scientific_Name |
| Filter species by tags (multiple at once) | Encyclopedia Search | Clicks tag pills → frontend tracks active tag set → GET request with tag list → backend runs `HAVING COUNT(DISTINCT Tag_Name) = N` query |
| Filter species by conservation status | Encyclopedia Search | Selects from status dropdown → adds `WHERE Conservation_Status = :status` to the query |
| View full species profile | Species Detail | Clicks any species card → navigates to `/species/:id` → GET request joins Organisms + Species_Encyclopedia + Species_Distribution |
| View taxonomy lineage of a species | Species Detail | Breadcrumb auto-loads via recursive self-join query when the page renders |
| Browse the full Tree of Life | Taxonomy Tree | Clicks any node → AJAX call to `/api/organisms/children/:id` → fetches direct children only (lazy loading, not the whole tree at once) |
| See overall conservation statistics | Home | Page load triggers aggregate `COUNT()` queries against Organisms and Threat_Logs |
| See featured species | Home | Page load fetches a fixed or randomized set of species cards |
| Click a tag to see all species with that tag | Species Detail → Encyclopedia Search | Clicking a tag pill on a detail page navigates back to search, pre-filtered |

**What a Public Visitor cannot do, anywhere, under any circumstance:**
- Cannot create, edit, or delete any data
- Cannot view admin-only data (raw sighting logs, threat reports, budget figures, admin usernames)
- Cannot access any `/admin/*` route — these are not even linked from public pages
- Cannot see who logged a sighting or filed a threat report (Admin_ID is never exposed to public queries)

---

## Admin — What They Can Do

Every admin action requires a valid JWT token attached to the request. The backend checks `[Authorize(Roles="Admin")]` on every admin endpoint — if the token is missing or invalid, the request is rejected before it touches the database.

| Action | Where (Page) | How (Mechanism) |
|---|---|---|
| Log in | Admin Login | Submits username/password → backend hashes password, compares to `Admins.Password_Hash` → issues JWT on match |
| Log out | Any admin page (sidebar button) | Frontend clears JWT from localStorage → redirects to Admin Login |
| View dashboard stats | Admin Dashboard | GET request triggers aggregate queries + the two views (`V_ExtinctionRisk`, `V_Reserve_Health`) |
| View conservation status breakdown chart | Admin Dashboard | Frontend renders Recharts pie chart from grouped query results |
| Run the Critical Species Report | Admin Dashboard | Enters Region_ID → clicks "Run Report" → backend calls `PRC_CriticalSpecies_Report` via `EXECUTE IMMEDIATE` / stored procedure call → captures `DBMS_OUTPUT` → returns as text → frontend displays it |
| Allocate conservation funds | Admin Dashboard | Enters grant amount → clicks "Allocate" → backend calls `PRC_AllocateGrant` → procedure updates `Reserves.Annual_Budget_USD` for every reserve, proportionally |
| Calculate population density | Admin Dashboard | Selects organism + reserve → backend calls `FN_PopulationDensity` function → returns a decimal value |
| Add a new organism | Organism Manager | Fills "Add New Organism" form (Scientific Name, Common Name, Rank, Parent, Kingdom, Status, Discovery Year) → `INSERT INTO Organisms` |
| Edit an organism | Organism Manager | Clicks Edit on a table row → form pre-fills → submits → `UPDATE Organisms` |
| Delete an organism | Organism Manager | Clicks Delete → confirmation modal → `DELETE FROM Organisms` (cascades to Species_Encyclopedia, Species_Distribution, Sighting_Logs, Organism_Tags via ON DELETE CASCADE) |
| Add/edit encyclopedia content | Organism Manager | Same form as organism add/edit, second section → `INSERT`/`UPDATE Species_Encyclopedia` |
| Log a field sighting | Organism Manager | Clicks "Log Sighting" on an organism → fills Reserve, Quantity, Health Status, Notes → `INSERT INTO Sighting_Logs` (the row's Admin_ID is auto-filled from the JWT token, not manually entered) — **trigger fires here**: `TRG_Sighting_Validator` blocks the insert if Quantity ≤ 0 or Health Status is null |
| Update species population per region | Organism Manager or a distribution sub-view | Edits `Estimated_Population` in Species_Distribution → `UPDATE` — **trigger fires here**: `TRG_AutoExtinction_Escalator` checks if the species' total population across all regions just hit zero, and if so auto-updates `Organisms.Conservation_Status` to `EW` |
| Add a new reserve | Reserve & Threat Manager | Fills reserve form → `INSERT INTO Reserves` |
| Edit/delete a reserve | Reserve & Threat Manager | Table row actions → `UPDATE`/`DELETE Reserves` |
| File a threat report | Reserve & Threat Manager | Fills threat form (Region, Threat Name, Category, Severity, Date, Notes) → `INSERT INTO Threat_Logs` with Admin_ID auto-filled — **trigger fires here**: if Severity = Critical, `TRG_CriticalThreat_Alert` auto-inserts a second alert row |
| Update threat resolution status | Reserve & Threat Manager | Changes status dropdown on an existing threat row (Active → Monitoring → Resolved) → `UPDATE Threat_Logs` |
| Create a new tag | Tag Manager | Fills tag form (Name, Category, Color) → `INSERT INTO Tags` |
| Delete a tag | Tag Manager | Click delete → `DELETE FROM Tags` (cascades to Organism_Tags) |
| Assign a tag to an organism | Tag Manager | Searches for organism → selects tag from dropdown → `INSERT INTO Organism_Tags` |
| Remove a tag from an organism | Tag Manager | Clicks the "x" on a tag pill shown for that organism → `DELETE FROM Organism_Tags` |
| View reserve health analytics | Reserve & Threat Manager | Table reads directly from `V_Reserve_Health` view |
| View extinction risk leaderboard | Admin Dashboard | Table reads directly from `V_ExtinctionRisk` view |

**What only an Admin can see that the public never sees:**
- Raw sighting log entries (who logged what, when, with what notes)
- Threat reports and their resolution status
- Reserve budget figures
- The PL/SQL execution panel and its output
- Any other admin's identity (via Admin_ID joins, in theory — though this project only has one admin role, so there's no admin-managing-admin feature)

---
