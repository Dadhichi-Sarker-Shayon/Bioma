# Part 2 — Complete Feature List

## A. Public-Facing Features (Viewer Portal)

1. **Live species search** — searches both common and scientific names simultaneously as the user types
2. **Multi-tag AND-logic filtering** — select any combination of tags and see only species matching *all* of them (powered by `HAVING COUNT(DISTINCT Tag_Name) = N`)
3. **Conservation status filtering** — narrow results to a specific IUCN status
4. **Tag-to-search shortcut** — clicking a tag on a species detail page jumps back to search pre-filtered by that tag
5. **Full species encyclopedia profiles** — description, diet, physical characteristics, habitat behavior, reproduction info, native range, fun fact, image
6. **Recursive taxonomy breadcrumb** — every species detail page shows its full lineage from Kingdom down to Species, generated via a self-join on the Organisms table
7. **Interactive Tree of Life browser** — lazy-loaded expandable tree, fetching only direct children on each click rather than the entire hierarchy at once
8. **Species distribution table** — shows every region a species is found in, with population estimate, trend, and survey date
9. **Global conservation statistics on Home** — live counts of total species, total reserves, critically endangered species
10. **Featured species showcase** — curated cards on the homepage
11. **Color-coded conservation status badges** — visual IUCN status indicator (green for Least Concern through dark red for Critically Endangered) used consistently across cards and detail pages
12. **Fully read-only, zero-write public access** — guarantees no public action can ever modify the database

## B. Authentication & Security Features

13. **JWT-based stateless authentication** — admin sessions handled via signed tokens, not server-side session storage
14. **Password hashing** — passwords never stored or compared in plaintext
15. **Role-gated API endpoints** — every admin route enforces `[Authorize(Roles="Admin")]` at the controller level
16. **Hard portal separation** — Admin Portal lives on a completely separate route tree (`/admin/*`) with its own layout, theme, and login gate; no cross-navigation links exist between portals
17. **Auto-attached audit trail** — every sighting and threat log automatically records which admin performed the action via the JWT-derived Admin_ID, with no manual "logged by" field for the admin to fill in

## C. Admin Data Management Features

18. **Full CRUD on organisms** — create, read, update, delete taxonomy entries
19. **Combined organism + encyclopedia editing** — single form manages both the taxonomic record and its public-facing content
20. **Parent organism autocomplete** — when adding a new species, admin searches for and selects its parent node (genus/family/etc.) rather than typing an ID
21. **Cascading deletes** — deleting an organism automatically cleans up its encyclopedia entry, distribution records, sighting logs, and tag assignments via `ON DELETE CASCADE`
22. **Reserve management** — full CRUD on conservation reserves, including budget and area tracking
23. **Threat reporting and lifecycle tracking** — log new threats and move them through Active → Monitoring → Resolved states
24. **Tag vocabulary management** — create, categorize, color-code, and delete tags independently of any organism
25. **Tag assignment interface** — search any organism and toggle tags on/off for it directly

## D. PL/SQL-Powered Automation Features

26. **Sighting data validation trigger** (`TRG_Sighting_Validator`) — blocks any sighting log with zero/negative quantity or missing health status before it's committed
27. **Automatic extinction status escalation** (`TRG_AutoExtinction_Escalator`) — when a species' population across all regions is updated to a combined total of zero, its conservation status is automatically flipped to "Extinct in the Wild" with no manual admin action required
28. **Automatic critical threat alerting** (`TRG_CriticalThreat_Alert`) — filing a threat with Critical severity automatically generates a second system alert log entry
29. **Critical species cursor-based report** (`PRC_CriticalSpecies_Report`) — admin-triggered procedure that loops through all endangered/critical species in a chosen region and prints a formatted report via DBMS_OUTPUT
30. **Proportional grant allocation procedure** (`PRC_AllocateGrant`) — admin enters a donation amount, and the procedure distributes it across all reserves proportionally, updating budgets in a single transactional operation with commit/rollback safety
31. **Population density calculation function** (`FN_PopulationDensity`) — on-demand calculation of individuals-per-km² for any organism/reserve pair
32. **Regional threat scoring function** (`FN_RegionThreatScore`) — computes a weighted threat severity score for any region based on active threat severities

## E. Analytics & Reporting Features

33. **Extinction risk leaderboard view** (`V_ExtinctionRisk`) — pre-aggregated, ranked view of species by conservation risk and global population, queried directly without recomputing joins each time
34. **Reserve health summary view** (`V_Reserve_Health`) — pre-aggregated sightings count, distinct species observed, healthy/injured breakdown, and budget efficiency per reserve
35. **Conservation status distribution chart** — pie chart visualization on the admin dashboard showing the spread of species across IUCN categories
36. **Live PL/SQL execution panel** — a terminal-style UI element where the admin runs stored procedures and sees raw `DBMS_OUTPUT` text rendered directly in the browser, demonstrating the database engine doing the computation rather than the application layer

## F. Database Design Features (for grading/defense purposes)

37. **Recursive self-referencing schema** — the entire taxonomic hierarchy (Kingdom through Species) stored in one table via a self-join on `Parent_ID`
38. **Two clean many-to-many bridge tables** — `Species_Distribution` (species ↔ regions) and `Organism_Tags` (species ↔ tags), each demonstrating proper junction table design with composite primary keys
39. **Consolidated lookup data via CHECK constraints** — conservation status, kingdom type, rank, severity level, and resolution status are all enforced through `CHECK` constraints rather than separate lookup tables, reducing table count without sacrificing data integrity
40. **Cascading referential integrity** — `ON DELETE CASCADE` and `ON DELETE SET NULL` used appropriately throughout to maintain consistency automatically
41. **Audit-friendly foreign keys** — every write-capable table traces back to the admin who performed the action
