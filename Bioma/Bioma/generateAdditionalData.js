const fs = require('fs');

let sql = "SET DEFINE OFF;\n";

// 1. Regions (10 regions)
const regions = [
    { id: 1, name: 'African Savanna', country: 'Kenya', biome: 'Savanna', climate: 'Tropical', area: 100000, prot: 'Y' },
    { id: 2, name: 'Amazon Rainforest', country: 'Brazil', biome: 'Rainforest', climate: 'Tropical', area: 5500000, prot: 'Y' },
    { id: 3, name: 'Sahara Desert', country: 'Egypt', biome: 'Desert', climate: 'Arid', area: 9200000, prot: 'N' },
    { id: 4, name: 'Siberian Tundra', country: 'Russia', biome: 'Tundra', climate: 'Polar', area: 3000000, prot: 'Y' },
    { id: 5, name: 'Great Barrier Reef', country: 'Australia', biome: 'Marine', climate: 'Tropical', area: 344400, prot: 'Y' },
    { id: 6, name: 'Rocky Mountains', country: 'USA', biome: 'Alpine', climate: 'Temperate', area: 480000, prot: 'Y' },
    { id: 7, name: 'Gobi Desert', country: 'China', biome: 'Desert', climate: 'Arid', area: 1295000, prot: 'N' },
    { id: 8, name: 'Congo Basin', country: 'Congo', biome: 'Rainforest', climate: 'Tropical', area: 3700000, prot: 'Y' },
    { id: 9, name: 'Antarctic Ice Sheet', country: 'Antarctica', biome: 'Ice Cap', climate: 'Polar', area: 14000000, prot: 'Y' },
    { id: 10, name: 'European Alps', country: 'Switzerland', biome: 'Alpine', climate: 'Temperate', area: 298128, prot: 'Y' }
];

regions.forEach(r => {
    sql += `INSERT INTO Regions (Region_ID, Region_Name, Country, Biome_Name, Climate_Zone, Area_SqKm, Is_Protected) VALUES (${r.id}, '${r.name}', '${r.country}', '${r.biome}', '${r.climate}', ${r.area}, '${r.prot}');\n`;
});

// 2. Reserves (20 reserves)
for (let i = 1; i <= 20; i++) {
    let regionId = (i % 10) + 1;
    sql += `INSERT INTO Reserves (Reserve_ID, Reserve_Name, Region_ID, Total_Area_SqKm, Annual_Budget_USD, Established_Year, Reserve_Type) VALUES (${i}, 'Reserve ${i} of Region ${regionId}', ${regionId}, ${100 + (i * 50)}, ${50000 + (i * 10000)}, ${1950 + i}, 'National Park');\n`;
}

// 3. Tags (10 tags)
const tags = [
    { id: 1, name: 'Endangered', category: 'Conservation', color: 'Red' },
    { id: 2, name: 'Venomous', category: 'Danger', color: 'Purple' },
    { id: 3, name: 'Migratory', category: 'Behavior', color: 'Blue' },
    { id: 4, name: 'Nocturnal', category: 'Behavior', color: 'Black' },
    { id: 5, name: 'Edible', category: 'Usage', color: 'Green' },
    { id: 6, name: 'Invasive', category: 'Ecological', color: 'Orange' },
    { id: 7, name: 'Apex Predator', category: 'Role', color: 'Dark Red' },
    { id: 8, name: 'Pollinator', category: 'Role', color: 'Yellow' },
    { id: 9, name: 'Medicinal', category: 'Usage', color: 'White' },
    { id: 10, name: 'Pet Trade', category: 'Threat', color: 'Brown' }
];

tags.forEach(t => {
    sql += `INSERT INTO Tags (Tag_ID, Tag_Name, Tag_Category, Tag_Color) VALUES (${t.id}, '${t.name}', '${t.category}', '${t.color}');\n`;
});

// 4. Organism_Tags (Assign tags to organisms 10 to 500)
for (let i = 10; i <= 500; i++) {
    let tagId = (i % 10) + 1;
    sql += `INSERT INTO Organism_Tags (Organism_ID, Tag_ID) VALUES (${i}, ${tagId});\n`;
    // Add a second tag for some
    if (i % 3 === 0) {
        let tagId2 = ((tagId + 2) % 10) + 1;
        sql += `INSERT INTO Organism_Tags (Organism_ID, Tag_ID) VALUES (${i}, ${tagId2});\n`;
    }
}

// 5. Species_Distribution (Assign organisms 10 to 1000 to regions)
const trends = ['Increasing', 'Stable', 'Decreasing', 'Unknown'];
for (let i = 10; i <= 1000; i++) {
    let regionId = (i % 10) + 1;
    let trend = trends[i % trends.length];
    sql += `INSERT INTO Species_Distribution (Organism_ID, Region_ID, Estimated_Population, Last_Survey_Date, Population_Trend) VALUES (${i}, ${regionId}, ${100 + i * 5}, TO_DATE('2025-01-01', 'YYYY-MM-DD'), '${trend}');\n`;
}

// 6. Sighting_Logs (100 sightings)
const health = ['Healthy', 'Injured', 'Malnourished', 'Dead', 'Unknown'];
for (let i = 1; i <= 100; i++) {
    let orgId = 10 + (i % 50); // Just use some valid organism IDs
    let reserveId = (i % 20) + 1;
    let hStatus = health[i % health.length];
    // Admin ID 1 exists from setup.sql
    sql += `INSERT INTO Sighting_Logs (Sighting_ID, Organism_ID, Reserve_ID, Admin_ID, Quantity_Observed, Health_Status, Observation_Notes) VALUES (${i}, ${orgId}, ${reserveId}, 1, ${i % 10 + 1}, '${hStatus}', 'Observed during patrol ${i}');\n`;
}

// 7. Threat_Logs (50 threats)
const categories = ['Human-Caused', 'Natural', 'Climate-Related'];
const severities = ['Low', 'Medium', 'High', 'Critical'];
const statuses = ['Active', 'Monitoring', 'Resolved'];
for (let i = 1; i <= 50; i++) {
    let regionId = (i % 10) + 1;
    let cat = categories[i % categories.length];
    let sev = severities[i % severities.length];
    let stat = statuses[i % statuses.length];
    sql += `INSERT INTO Threat_Logs (Log_ID, Region_ID, Threat_Name, Threat_Category, Severity_Level, Assessment_Date, Admin_ID, Resolution_Status) VALUES (${i}, ${regionId}, 'Threat Type ${i}', '${cat}', '${sev}', TO_DATE('2025-02-01', 'YYYY-MM-DD'), 1, '${stat}');\n`;
}

sql += "COMMIT;\nEXIT;\n";

fs.writeFileSync('populate_additional.sql', sql);
console.log('populate_additional.sql created.');
