# Complete Page Specification — Wildlife & Conservation Management System

**Total: 9 pages — 4 in the Viewer Portal, 5 in the Admin Portal**

---

## VIEWER PORTAL (Public, No Login)

---

### Page 1 — Home

**Route:** `/`

**Purpose:** Entry point for the public. Gives an immediate sense of scale and credibility, then funnels the visitor toward the encyclopedia search.

**Information shown:**
- Total species tracked count
- Total reserves count
- Total regions/countries covered count
- Count of critically endangered species
- A handful of "featured species" (e.g. 6 random or curated entries with images)

**Components:**
- Top navbar (Viewer Portal branding — green/earth-tone theme)
- Hero section: large heading, short tagline, search bar (functions as a shortcut — typing and hitting enter jumps to Encyclopedia Search with the query pre-filled)
- Stat banner: 4 stat cards in a row (Total Species / Reserves / Regions / Critically Endangered), each with an icon and large number
- Featured Species section: horizontal scroll or grid of 6 species cards (image, common name, scientific name, status badge)
- Footer: simple text footer, no admin login link visible here (kept out of the public flow intentionally — admin portal is a separate URL not advertised on this page)

**Layout description:**
Single column, full-width hero at top with centered text and search bar, stat cards in a 4-column grid directly below (collapses to 2x2 on mobile), featured species in a 3-column card grid below that (collapses to 1 column on mobile), footer pinned at the bottom.

**Navigation map:**
- Search bar submit → Page 2 (Encyclopedia Search) with query parameter
- Each featured species card → Page 3 (Species Detail) for that organism
- Navbar link "Tree of Life" → Page 4 (Taxonomy Tree)
- Navbar link "Encyclopedia" → Page 2 (Encyclopedia Search)

---

### Page 2 — Encyclopedia Search

**Route:** `/encyclopedia`

**Purpose:** The core public feature. Lets anyone search and filter the entire species database by name, conservation status, and tags.

**Information shown:**
- Live result count ("47 species found")
- Grid of matching species cards
- Available tags grouped by category for filtering

**Components:**
- Top navbar (same as Home)
- Search input field (live search, debounced — searches Common_Name and Scientific_Name)
- Tag filter panel: pills grouped under labeled categories (Behavior, Habitat, Diet, Ecological, Physical), each clickable to toggle on/off, multiple tags can be active simultaneously (AND logic via the HAVING COUNT query)
- Optional secondary filter dropdown: Conservation Status (All / LC / NT / VU / EN / CR / EW / EX)
- Result grid: species cards (image, common name, italicized scientific name, color-coded status badge, kingdom icon)
- Empty state message if zero results ("No species match your filters — try removing a tag")
- Loading skeleton while a search request is in flight

**Layout description:**
Search bar full-width at top. Below it, a horizontal tag filter bar (wraps onto multiple lines on smaller screens) with a status dropdown aligned to the right of it. Below that, the result count line, then a responsive card grid (4 columns desktop, 2 columns tablet, 1 column mobile).

**Navigation map:**
- Any species card → Page 3 (Species Detail)
- Navbar → Page 1 (Home) or Page 4 (Taxonomy Tree)
- No admin access point on this page

---

### Page 3 — Species Detail

**Route:** `/species/:id`

**Purpose:** The full public profile for one organism — everything the database knows about that species, presented for a general audience.

**Information shown:**
- Common name, scientific name, conservation status, kingdom
- Taxonomy breadcrumb (Kingdom > Phylum > Class > Order > Family > Genus > Species) generated via the recursive self-join
- Full description, diet type and details, physical description, average height/length
- Habitat behavior, reproduction info, native range description
- Fun fact
- Distribution table: which regions this species is found in, with population estimate and trend per region
- Applied tags

**Components:**
- Top navbar
- Hero block: species image (or placeholder if no Image_URL), common name as the main heading, scientific name italicized beneath it, conservation status badge prominently colored
- Quick-facts row: small icon-labeled stats (Kingdom, Diet Type, Avg Height, Avg Weight/Length)
- Tabbed or sectioned content area:
  - "About" — Description (CLOB) and Fun Fact
  - "Habitat & Behavior" — Habitat_Behavior, Native_Range_Description, Reproduction_Info
  - "Where It's Found" — Distribution table (Region, Country, Population, Trend, Last Survey Date)
- Taxonomy breadcrumb strip near the top, each ancestor clickable
- Tag pills row near the bottom showing all tags applied to this organism

**Layout description:**
Hero section spans full width with image on the left (or top on mobile) and text/badges on the right. Quick-facts row is a horizontal strip of 4 small stat blocks directly below the hero. Tabbed content area below that, full width, single column. Distribution table is a simple bordered table. Tag pills sit in a wrapped row at the very bottom before the footer.

**Navigation map:**
- Breadcrumb ancestor links → Page 4 (Taxonomy Tree), pre-expanded to that ancestor (or simplest version: just navigates to the Tree page)
- Tag pills click → Page 2 (Encyclopedia Search) pre-filtered by that tag
- Back arrow / navbar → Page 2 (Encyclopedia Search) or Page 1 (Home)

---

### Page 4 — Taxonomy Tree

**Route:** `/tree`

**Purpose:** Lets visitors explore the Tree of Life interactively, visually demonstrating the recursive Organisms table structure.

**Information shown:**
- All Kingdom-level nodes initially
- Children nodes loaded on demand as the user expands branches
- Each node shows common name, scientific name, and rank label

**Components:**
- Top navbar
- Page heading and short explanatory subtitle ("Click any node to explore its descendants")
- Recursive expandable tree component: each node is a clickable row with an expand/collapse chevron, indentation increasing with depth, a small rank badge (Kingdom/Phylum/etc.) next to each name

**Layout description:**
Single centered column, max-width constrained for readability (tree structures get visually messy if too wide). Each level of the tree indents further right with a vertical guide line connecting parent to children, similar to a file directory browser.

**Navigation map:**
- Clicking a leaf-level (Species rank) node → Page 3 (Species Detail) for that organism
- Navbar → Page 1 (Home) or Page 2 (Encyclopedia Search)

---

## ADMIN PORTAL (Separate Login, Separate Route Tree, Distinct Visual Theme)

---

### Page 5 — Admin Login

**Route:** `/admin/login`

**Purpose:** The sole entry point into the Admin Portal. Not linked from any public page — accessed by direct URL only, reinforcing portal separation.

**Information shown:**
- Login form only

**Components:**
- Centered card on a plain/dark background (visually distinct from the public site's earth-tone theme — e.g. a deep navy/slate admin theme)
- Username field
- Password field
- "Log In" button
- Inline error message area (shown on failed login attempt)
- Small label "Admin Portal" above the form to reinforce this is a separate system

**Layout description:**
Full-viewport centered card, no navbar, no footer, nothing else on the page — intentionally minimal and isolated from the rest of the site.

**Navigation map:**
- Successful login → Page 6 (Admin Dashboard)
- No links to any Viewer Portal page from here

---

### Page 6 — Admin Dashboard

**Route:** `/admin/dashboard`

**Purpose:** Landing page after login. Gives the admin an at-a-glance operational overview and houses the PL/SQL procedure runner — this is the page used for the professor demo.

**Information shown:**
- Total species, critically endangered count, active threats count (live stat cards)
- Conservation status breakdown (pie chart)
- Top 20 species from the extinction risk leaderboard view
- Reserve health summary table (from the reserve health view)
- PL/SQL execution panel: run the Critical Species Report procedure and the Grant Allocator procedure, with live DBMS_OUTPUT displayed

**Components:**
- Admin-themed navbar/sidebar (distinct color, shows "Admin Portal" label, logout button, links to other admin pages)
- Three stat cards in a row
- Pie chart component (conservation status distribution)
- Risk leaderboard table (species, status, global population, sorted by risk)
- Reserve health table (reserve name, region, sightings count, species observed, healthy/injured counts, budget per km²)
- PL/SQL terminal-style panel: dark background, monospace font, two input+button pairs (Region ID + "Run Report", Grant Amount + "Allocate"), output rendered as preformatted text below

**Layout description:**
Sidebar navigation on the left (persistent across all admin pages) with the main content area on the right. Stat cards in a 3-column row at the top of the content area. Pie chart and risk table side-by-side or stacked depending on screen width. Reserve health table full-width below that. PL/SQL panel as a distinct dark-themed card at the very bottom, visually separated to signal "this is the database-power-feature section."

**Navigation map:**
- Sidebar → Page 7 (Organism Manager), Page 8 (Reserve & Threat Manager), Page 9 (Tag Manager)
- Logout → Page 5 (Admin Login)
- Risk leaderboard row click → could deep-link to Page 7 filtered to that organism (optional enhancement)

---

### Page 7 — Organism Manager

**Route:** `/admin/organisms`

**Purpose:** Where the admin manages the taxonomy tree, encyclopedia content, and logs field sightings.

**Information shown:**
- Searchable/sortable table of all organisms
- Add/Edit form for organism + encyclopedia data combined
- Sighting submission form

**Components:**
- Admin sidebar (persistent)
- Search/filter bar above the organism table
- Data table: Organism_ID, Common Name, Scientific Name, Rank, Conservation Status, action buttons (Edit, Delete, Log Sighting)
- "Add New Organism" button opening a modal or side panel form with fields: Scientific Name, Common Name, Rank (dropdown), Parent Organism (autocomplete search), Kingdom Type, Conservation Status (dropdown), Discovery Year, plus a second section for Encyclopedia fields (Description textarea, Diet Type, Diet Details, Physical Description, Habitat Behavior, Reproduction Info, Native Range, Image URL, Fun Fact)
- "Log Sighting" modal: Reserve dropdown, Quantity Observed, Health Status dropdown, Observation Notes — triggers the validation trigger on submit, with inline error display if Quantity ≤ 0 or Health Status missing

**Layout description:**
Sidebar + main content area pattern continues. Table occupies the main area with a toolbar above it (search box left, "Add New Organism" button right). Add/Edit and Sighting forms appear as slide-over panels or modals rather than separate routes, keeping the admin in context.

**Navigation map:**
- Sidebar → Page 6, Page 8, Page 9
- "Log Sighting" success → stays on this page, table/notification updates
- Delete confirmation → stays on this page

---

### Page 8 — Reserve & Threat Manager

**Route:** `/admin/reserves`

**Purpose:** Manage conservation reserves and log/monitor environmental threats.

**Information shown:**
- Table of all reserves with health stats (from the reserve health view)
- Table of all threat logs with severity and resolution status
- Add/Edit forms for both

**Components:**
- Admin sidebar
- Two-section layout: "Reserves" section and "Threats" section, either as tabs or stacked panels
- Reserves table: name, region, area, budget, total sightings, species observed, healthy/injured counts, budget-per-km²
- "Add Reserve" form: Reserve Name, Region (dropdown), Area, Budget, Established Year, Reserve Type
- Threats table: region, threat name, category, severity (color-coded badge), assessment date, resolution status, reported by
- "Log New Threat" form: Region dropdown, Threat Name, Threat Category, Severity Level dropdown, Assessment Date, Notes — submitting a Critical severity threat visibly triggers the auto-alert (shown as a toast notification: "Critical alert automatically logged")
- Inline action to update Resolution_Status on existing threats (dropdown: Active → Monitoring → Resolved)

**Layout description:**
Tab switcher at the top of the content area (Reserves / Threats). Each tab shows its respective table with an "Add New" button above it, forms appearing as modals. Severity badges in the threats table are color-coded (Low=gray, Medium=amber, High=orange, Critical=red) for quick visual scanning.

**Navigation map:**
- Sidebar → Page 6, Page 7, Page 9
- Forms submit and stay on page with table refresh

---

### Page 9 — Tag Manager

**Route:** `/admin/tags`

**Purpose:** Manage the tag vocabulary used by the public search and assign tags to organisms.

**Information shown:**
- List of all tags with category, color, and count of organisms using each
- Tag assignment interface

**Components:**
- Admin sidebar
- Tag list table: Tag Name, Category, Color swatch, Organism Count, Delete button
- "Create New Tag" form: Tag Name, Category dropdown, Color picker
- "Assign Tags" panel: organism autocomplete search, once selected shows that organism's current tags as removable pills plus an "Add Tag" dropdown to attach more

**Layout description:**
Two-panel layout: tag list on the left (or top on mobile), assignment interface on the right (or below). Simple, utility-focused page — no charts or heavy visuals needed here.

**Navigation map:**
- Sidebar → Page 6, Page 7, Page 8
- No outbound navigation beyond the admin portal

---

## Full Site Navigation Map (Summary)

```
VIEWER PORTAL (public)
  Home (/)
    → Encyclopedia Search (via search bar or navbar)
    → Species Detail (via featured cards)
    → Taxonomy Tree (via navbar)

  Encyclopedia Search (/encyclopedia)
    → Species Detail (via card click)
    ↔ Home, Taxonomy Tree (via navbar)

  Species Detail (/species/:id)
    → Taxonomy Tree (via breadcrumb)
    → Encyclopedia Search (via tag click, filtered)
    ↔ Home, Encyclopedia Search (via navbar)

  Taxonomy Tree (/tree)
    → Species Detail (via leaf node click)
    ↔ Home, Encyclopedia Search (via navbar)

────────────────────────────────────────────
ADMIN PORTAL (separate, login-gated)

  Admin Login (/admin/login)
    → Admin Dashboard (on success)

  Admin Dashboard (/admin/dashboard)
    ↔ Organism Manager, Reserve & Threat Manager, Tag Manager (via sidebar)
    → Admin Login (via logout)

  Organism Manager (/admin/organisms)
    ↔ Dashboard, Reserve & Threat Manager, Tag Manager (via sidebar)

  Reserve & Threat Manager (/admin/reserves)
    ↔ Dashboard, Organism Manager, Tag Manager (via sidebar)

  Tag Manager (/admin/tags)
    ↔ Dashboard, Organism Manager, Reserve & Threat Manager (via sidebar)
```

The two portals never cross-link to each other — the only way into the Admin Portal is typing `/admin/login` directly, which is the intended separation you asked for.
