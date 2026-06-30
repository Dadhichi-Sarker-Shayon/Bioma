namespace Bioma.Models
{
    // ──────────────────────────────────────────────
    // 1. Admin Models
    // ──────────────────────────────────────────────
    public class AdminDto
    {
        public int AdminId { get; set; }
        public string Username { get; set; } = "";
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class LoginDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class AdminCreateDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    public class AdminUpdateDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    // ──────────────────────────────────────────────
    // 2 & 3. Organisms & Encyclopedia Models
    // ──────────────────────────────────────────────
    public class OrganismDto
    {
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public string RankName { get; set; } = "";
        public int? ParentId { get; set; }
        public string? KingdomType { get; set; }
        public string? ConservationStatus { get; set; }
        public int? DiscoveryYear { get; set; }
        public List<OrganismDto> Children { get; set; } = new();
    }

    public class SpeciesEncyclopediaDto
    {
        public int EncyclopediaId { get; set; }
        public int OrganismId { get; set; }
        public string? Description { get; set; }
        public string? DietType { get; set; }
        public string? DietDetails { get; set; }
        public string? PhysicalDescription { get; set; }
        public decimal? AvgHeightCm { get; set; }
        public decimal? AvgLengthCm { get; set; }
        public string? HabitatBehavior { get; set; }
        public string? ReproductionInfo { get; set; }
        public string? NativeRangeDescription { get; set; }
        public string? ImageUrl { get; set; }
        public string? FunFact { get; set; }
        public DateTime? LastUpdated { get; set; }
    }

    // A combined model useful for the public viewer detail page
    public class SpeciesDetailDto
    {
        public OrganismDto BasicInfo { get; set; } = new();
        public SpeciesEncyclopediaDto Encyclopedia { get; set; } = new();
        public List<SpeciesDistributionDto> Distribution { get; set; } = new();
        public List<TagDto> Tags { get; set; } = new();
        public List<OrganismDto> TaxonomyBreadcrumbs { get; set; } = new();
    }

    // ──────────────────────────────────────────────
    // 4 & 5. Regions & Distribution Models
    // ──────────────────────────────────────────────
    public class RegionDto
    {
        public int RegionId { get; set; }
        public string RegionName { get; set; } = "";
        public string Country { get; set; } = "";
        public string? BiomeName { get; set; }
        public string? ClimateZone { get; set; }
        public decimal? AreaSqKm { get; set; }
        public string? IsProtected { get; set; } // 'Y' or 'N'
    }

    public class SpeciesDistributionDto
    {
        public int OrganismId { get; set; }
        public int RegionId { get; set; }
        public string? RegionName { get; set; }
        public string? Country { get; set; }
        public int? EstimatedPopulation { get; set; }
        public DateTime? LastSurveyDate { get; set; }
        public string? PopulationTrend { get; set; }
    }

    public class DistributionCreateDto
    {
        public int RegionId { get; set; }
        public int? EstimatedPopulation { get; set; }
        public DateTime? LastSurveyDate { get; set; }
        public string? PopulationTrend { get; set; }
    }

    // ──────────────────────────────────────────────
    // 6. Reserves Models
    // ──────────────────────────────────────────────
    public class ReserveDto
    {
        public int ReserveId { get; set; }
        public string ReserveName { get; set; } = "";
        public int? RegionId { get; set; }
        public string? RegionName { get; set; }
        public decimal? TotalAreaSqKm { get; set; }
        public decimal? AnnualBudgetUsd { get; set; }
        public int? EstablishedYear { get; set; }
        public string? ReserveType { get; set; }
    }

    // ──────────────────────────────────────────────
    // 7. Sighting Logs Models
    // ──────────────────────────────────────────────
    public class SightingLogDto
    {
        public int SightingId { get; set; }
        public int? OrganismId { get; set; }
        public string? CommonName { get; set; }
        public string? ScientificName { get; set; }
        public int? ReserveId { get; set; }
        public string? ReserveName { get; set; }
        public int? AdminId { get; set; }
        public string? AdminName { get; set; }
        public DateTime SightingTimestamp { get; set; }
        public int QuantityObserved { get; set; }
        public string HealthStatus { get; set; } = "";
        public string? ObservationNotes { get; set; }
    }

    public class SightingCreateDto
    {
        public int OrganismId { get; set; }
        public int ReserveId { get; set; }
        public int QuantityObserved { get; set; }
        public string HealthStatus { get; set; } = "Unknown";
        public string? ObservationNotes { get; set; }
    }

    // ──────────────────────────────────────────────
    // 8. Threat Logs Models
    // ──────────────────────────────────────────────
    public class ThreatLogDto
    {
        public int LogId { get; set; }
        public int? RegionId { get; set; }
        public string? RegionName { get; set; }
        public string ThreatName { get; set; } = "";
        public string? ThreatCategory { get; set; }
        public string SeverityLevel { get; set; } = "";
        public DateTime AssessmentDate { get; set; }
        public int? AdminId { get; set; }
        public string? AdminName { get; set; }
        public string ResolutionStatus { get; set; } = "";
    }

    public class ThreatCreateDto
    {
        public int RegionId { get; set; }
        public string ThreatName { get; set; } = "";
        public string? ThreatCategory { get; set; }
        public string SeverityLevel { get; set; } = "Medium";
        public DateTime AssessmentDate { get; set; }
        public string ResolutionStatus { get; set; } = "Active";
    }

    // ──────────────────────────────────────────────
    // 9 & 10. Tags Models
    // ──────────────────────────────────────────────
    public class TagDto
    {
        public int TagId { get; set; }
        public string TagName { get; set; } = "";
        public string? TagCategory { get; set; }
        public string? TagColor { get; set; }
    }

    // ──────────────────────────────────────────────
    // Views & Analytics Models
    // ──────────────────────────────────────────────
    public class DashboardStats
    {
        public int TotalSpecies { get; set; }
        public int TotalReserves { get; set; }
        public int TotalSightings { get; set; }
        public int ActiveThreats { get; set; }
    }

    public class ExtinctionLeaderboardDto
    {
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public string ConservationStatus { get; set; } = "";
        public int GlobalPopulation { get; set; }
        public int RegionCount { get; set; }
    }

    public class ReserveHealthAnalyticsDto
    {
        public int ReserveId { get; set; }
        public string ReserveName { get; set; } = "";
        public decimal? TotalAreaSqKm { get; set; }
        public decimal? AnnualBudgetUsd { get; set; }
        public string RegionName { get; set; } = "";
        public int TotalSightings { get; set; }
        public int UniqueSpeciesSpotted { get; set; }
        public int UnhealthySightings { get; set; }
    }
}
