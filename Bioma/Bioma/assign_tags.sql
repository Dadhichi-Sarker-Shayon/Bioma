-- Assign tags to ALL species based on their names
-- This ensures every species has at least some tags

-- Carnivores get "Apex Predator" or "Venomous" tags
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 7 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 7
WHERE o.Rank_Name = 'Species'
AND o.Common_Name LIKE '%Lion%'
AND ot.OrganISM_ID IS NULL;

INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 7 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 7
WHERE o.Rank_Name = 'Species'
AND o.Common_Name LIKE '%Tiger%'
AND ot.OrganISM_ID IS NULL;

INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 7 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 7
WHERE o.Rank_Name = 'Species'
AND o.Common_Name LIKE '%Shark%'
AND ot.OrganISM_ID IS NULL;

INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 7 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 7
WHERE o.Rank_Name = 'Species'
AND o.Common_Name LIKE '%Eagle%'
AND ot.OrganISM_ID IS NULL;

-- Bear, Fox, Wolf get "Nocturnal"
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 4 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 4
WHERE o.Rank_Name = 'Species'
AND (o.Common_Name LIKE '%Bear%' OR o.Common_Name LIKE '%Fox%' OR o.Common_Name LIKE '%Wolf%')
AND ot.OrganISM_ID IS NULL;

-- Dolphin, Whale get "Migratory"
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 3 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 3
WHERE o.Rank_Name = 'Species'
AND (o.Common_Name LIKE '%Dolphin%' OR o.Common_Name LIKE '%Whale%' OR o.Common_Name LIKE '%Sea%')
AND ot.OrganISM_ID IS NULL;

-- Snake, Spider, Scorpion get "Venomous"
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 2 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 2
WHERE o.Rank_Name = 'Species'
AND (o.Common_Name LIKE '%Snake%' OR o.Common_Name LIKE '%Spider%' OR o.Common_Name LIKE '%Scorpion%')
AND ot.OrganISM_ID IS NULL;

-- Gorilla, Chimpanzee get "Endangered"
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 1 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 1
WHERE o.Rank_Name = 'Species'
AND (o.Common_Name LIKE '%Gorilla%' OR o.Common_Name LIKE '%Chimpanzee%' OR o.Common_Name LIKE '%Panda%')
AND ot.OrganISM_ID IS NULL;

-- Elephant, Giraffe, Hippo get "Pollinator" or "Edible" for plants
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 8 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 8
WHERE o.Rank_Name = 'Species'
AND (o.Common_Name LIKE '%Bee%' OR o.Common_Name LIKE '%Butterfly%' OR o.Common_Name LIKE '%Hummingbird%')
AND ot.OrganISM_ID IS NULL;

-- Plants get "Edible" or "Medicinal"
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 5 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 5
WHERE o.Rank_Name = 'Species'
AND o.Kingdom_Type = 'Plant'
AND (o.Common_Name LIKE '%Apple%' OR o.Common_Name LIKE '%Banana%' OR o.Common_Name LIKE '%Orange%'
     OR o.Common_Name LIKE '%Grape%' OR o.Common_Name LIKE '%Mango%' OR o.Common_Name LIKE '%Pineapple%')
AND ot.OrganISM_ID IS NULL;

INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 9 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 9
WHERE o.Rank_Name = 'Species'
AND o.Kingdom_Type = 'Plant'
AND (o.Common_Name LIKE '%Lavender%' OR o.Common_Name LIKE '%Aloe%' OR o.Common_Name LIKE '%Ginseng%'
     OR o.Common_Name LIKE '%Chamomile%' OR o.Common_Name LIKE '%Mint%')
AND ot.OrganISM_ID IS NULL;

-- Birds get "Migratory"
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 3 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID AND ot.Tag_ID = 3
WHERE o.Rank_Name = 'Species'
AND (o.Common_Name LIKE '%Crane%' OR o.Common_Name LIKE '%Stork%' OR o.Common_Name LIKE '%Flamingo%'
     OR o.Common_Name LIKE '%Swan%' OR o.Common_Name LIKE '%Goose%' OR o.Common_Name LIKE '%Duck%')
AND ot.OrganISM_ID IS NULL;

-- Assign remaining species random tags to ensure none have 0 tags
-- Give "Edible" to any species without tags
INSERT INTO Organism_Tags (Organism_ID, Tag_ID)
SELECT o.Organism_ID, 5 FROM Organisms o
LEFT JOIN Organism_Tags ot ON o.Organism_ID = ot.Organism_ID
WHERE o.Rank_Name = 'Species'
AND ot.OrganISM_ID IS NULL;

COMMIT;
/
