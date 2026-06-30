const fs = require('fs');

const statuses = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'];

const baseAnimals = [
    { common: 'Lion', genus: 'Panthera', species: 'leo', type: 'Land Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.jpg' },
    { common: 'Tiger', genus: 'Panthera', species: 'tigris', type: 'Land Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg' },
    { common: 'Elephant', genus: 'Loxodonta', species: 'africana', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg' },
    { common: 'Whale', genus: 'Balaenoptera', species: 'musculus', type: 'Sea Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Blue_Whale_001_body_bw.jpg' },
    { common: 'Penguin', genus: 'Aptenodytes', species: 'forsteri', type: 'Land Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Emperor_Penguin_Manchot_empereur.jpg' },
    { common: 'Bear', genus: 'Ursus', species: 'maritimus', type: 'Land Animal', diet: 'Omnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg' },
    { common: 'Panda', genus: 'Ailuropoda', species: 'melanoleuca', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Grosser_Panda.JPG' },
    { common: 'Cheetah', genus: 'Acinonyx', species: 'jubatus', type: 'Land Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/3/32/Cheetah_%28Acinonyx_jubatus%29_female.jpg' },
    { common: 'Giraffe', genus: 'Giraffa', species: 'camelopardalis', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Giraffe_Mikumi_National_Park.jpg' },
    { common: 'Hippopotamus', genus: 'Hippopotamus', species: 'amphibius', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Hippopotamus_amphibius_02.jpg' },
    { common: 'Kangaroo', genus: 'Macropus', species: 'rufus', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Red_kangaroo_-_melbourne_zoo.jpg' },
    { common: 'Koala', genus: 'Phascolarctos', species: 'cinereus', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Koala_climbing_tree.jpg' },
    { common: 'Gorilla', genus: 'Gorilla', species: 'beringei', type: 'Land Animal', diet: 'Herbivore', image: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Mountain_Gorilla_Rwanda.jpg' },
    { common: 'Chimpanzee', genus: 'Pan', species: 'troglodytes', type: 'Land Animal', diet: 'Omnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Schimpanse_Zoo_Leipzig.jpg' },
    { common: 'Eagle', genus: 'Haliaeetus', species: 'leucocephalus', type: 'Land Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/About_to_Launch_%2826075320352%29.jpg' },
    { common: 'Shark', genus: 'Carcharodon', species: 'carcharias', type: 'Sea Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/White_shark.jpg' },
    { common: 'Dolphin', genus: 'Tursiops', species: 'truncatus', type: 'Sea Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Tursiops_truncatus_01.jpg' },
    { common: 'Turtle', genus: 'Chelonia', species: 'mydas', type: 'Sea Animal', diet: 'Omnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Green_Sea_Turtle_grazing_seagrass.jpg' },
    { common: 'Wolf', genus: 'Canis', species: 'lupus', type: 'Land Animal', diet: 'Carnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Eurasian_wolf_2.jpg' },
    { common: 'Fox', genus: 'Vulpes', species: 'vulpes', type: 'Land Animal', diet: 'Omnivore', image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Vulpes_vulpes_ssp_fulvus.jpg' }
];

const basePlants = [
    { common: 'Oak', genus: 'Quercus', species: 'robur', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Quercus_robur.jpg' },
    { common: 'Pine', genus: 'Pinus', species: 'sylvestris', image: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Pinus_sylvestris_L.jpg' },
    { common: 'Maple', genus: 'Acer', species: 'saccharum', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Acer_saccharum_1.jpg' },
    { common: 'Redwood', genus: 'Sequoia', species: 'sempervirens', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Sequoia_sempervirens.jpg' },
    { common: 'Bamboo', genus: 'Bambusoideae', species: 'bambos', image: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Bamboo_forest.jpg' },
    { common: 'Baobab', genus: 'Adansonia', species: 'digitata', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Adansonia_grandidieri04.jpg' },
    { common: 'Rose', genus: 'Rosa', species: 'rubiginosa', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Rosa_rubiginosa_1.jpg' },
    { common: 'Sunflower', genus: 'Helianthus', species: 'annuus', image: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Sunflower_sky_backdrop.jpg' },
    { common: 'Fern', genus: 'Polypodiopsida', species: 'filicopsida', image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Athyrium_filix-femina.jpg' },
    { common: 'Cactus', genus: 'Cactaceae', species: 'cactoideae', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Saguaro_Cactus.jpg' }
];

const regions = [
    { name: 'African', latin: 'africanus' },
    { name: 'Asian', latin: 'asiaticus' },
    { name: 'European', latin: 'europaeus' },
    { name: 'American', latin: 'americanus' },
    { name: 'Australian', latin: 'australis' },
    { name: 'Northern', latin: 'borealis' },
    { name: 'Southern', latin: 'meridionalis' },
    { name: 'Eastern', latin: 'orientalis' },
    { name: 'Western', latin: 'occidentalis' },
    { name: 'Pacific', latin: 'pacificus' }
];

const adjectives = [
    { name: 'Greater', latin: 'major' },
    { name: 'Lesser', latin: 'minor' },
    { name: 'Common', latin: 'vulgaris' },
    { name: 'Spotted', latin: 'maculatus' },
    { name: 'Striped', latin: 'striatus' },
    { name: 'Red', latin: 'ruber' },
    { name: 'Blue', latin: 'caeruleus' },
    { name: 'Giant', latin: 'giganteus' },
    { name: 'Pygmy', latin: 'pygmaeus' },
    { name: 'Imperial', latin: 'imperialis' }
];

let sql = "SET DEFINE OFF;\n";

let orgId = 10;

// Generate 2500 Animals
for(let i = 0; i < 2500; i++) {
    let base = baseAnimals[i % baseAnimals.length];
    let region = regions[Math.floor(i / baseAnimals.length) % regions.length];
    let adj = adjectives[Math.floor(i / (baseAnimals.length * regions.length)) % adjectives.length];
    
    let cStatus = statuses[i % statuses.length];
    
    let commonName = `${adj.name} ${region.name} ${base.common}`;
    let sciName = `${base.genus} ${base.species} ${adj.latin} ${region.latin} v${i}`;
    let discYear = 1800 + (i % 200);

    sql += `INSERT INTO Organisms (Organism_ID, Scientific_Name, Common_Name, Rank_Name, Kingdom_Type, Conservation_Status, Discovery_Year) VALUES (${orgId}, '${sciName.replace(/'/g, "''")}', '${commonName.replace(/'/g, "''")}', 'Species', 'Animal', '${cStatus}', ${discYear});\n`;
    
    sql += `INSERT INTO Species_Encyclopedia (Encyclopedia_ID, Organism_ID, Description, Diet_Type, Diet_Details, Physical_Description, Avg_Height_Cm, Avg_Length_Cm, Habitat_Behavior, Reproduction_Info, Native_Range_Description, Image_URL, Fun_Fact) VALUES (${orgId}, ${orgId}, 'The ${commonName} is a magnificent ${base.type.toLowerCase()} found globally.', '${base.diet}', 'Prefers varied diet typical of a ${base.diet.toLowerCase()}', 'Medium to large size with distinct features.', ${50 + (i % 100)}, ${100 + (i % 200)}, 'Highly adaptable to its environment.', 'Typical reproductive cycle for its genus.', 'Native to the ${region.name} regions.', '${base.image}', 'It is known to be very unique.');\n`;
    
    orgId++;
    if (i > 0 && i % 100 === 0) sql += "COMMIT;\n";
}

// Generate 2500 Plants
for(let i = 0; i < 2500; i++) {
    let base = basePlants[i % basePlants.length];
    let region = regions[Math.floor(i / basePlants.length) % regions.length];
    let adj = adjectives[Math.floor(i / (basePlants.length * regions.length)) % adjectives.length];
    
    let cStatus = statuses[i % statuses.length];
    
    let commonName = `${adj.name} ${region.name} ${base.common}`;
    let sciName = `${base.genus} ${base.species} ${adj.latin} ${region.latin} v${i}`;
    let discYear = 1800 + (i % 200);

    sql += `INSERT INTO Organisms (Organism_ID, Scientific_Name, Common_Name, Rank_Name, Kingdom_Type, Conservation_Status, Discovery_Year) VALUES (${orgId}, '${sciName.replace(/'/g, "''")}', '${commonName.replace(/'/g, "''")}', 'Species', 'Plant', '${cStatus}', ${discYear});\n`;
    
    sql += `INSERT INTO Species_Encyclopedia (Encyclopedia_ID, Organism_ID, Description, Diet_Type, Diet_Details, Physical_Description, Avg_Height_Cm, Avg_Length_Cm, Habitat_Behavior, Reproduction_Info, Native_Range_Description, Image_URL, Fun_Fact) VALUES (${orgId}, ${orgId}, 'The ${commonName} is a prominent plant.', 'Autotroph', 'Photosynthesis', 'Green foliage, adapts to seasons.', ${10 + (i % 500)}, 0, 'Grows in various soils.', 'Seeds or spores.', 'Native to the ${region.name} regions.', '${base.image}', 'Vital for the local ecosystem.');\n`;

    orgId++;
    if (i > 0 && i % 100 === 0) sql += "COMMIT;\n";
}

sql += "COMMIT;\nEXIT;\n";

fs.writeFileSync('populate.sql', sql);
console.log(`populate.sql created with ${orgId - 10} organisms and encyclopedias.`);
