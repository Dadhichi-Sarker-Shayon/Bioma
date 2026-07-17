using System.ComponentModel.DataAnnotations;

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
        [Required]
        public string Username { get; set; } = "";
        [Required]
        public string Password { get; set; } = "";
    }

    public class AdminCreateDto
    {
        [Required, MinLength(3), MaxLength(50)]
        public string Username { get; set; } = "";
        [Required, MinLength(6), MaxLength(100)]
        public string Password { get; set; } = "";
        [MaxLength(100)]
        public string? FullName { get; set; }
        [EmailAddress, MaxLength(100)]
        public string? Email { get; set; }
    }

    public class AdminUpdateDto
    {
        [MaxLength(100)]
        public string? FullName { get; set; }
        [EmailAddress, MaxLength(100)]
        public string? Email { get; set; }
        [MinLength(6), MaxLength(100)]
        public string? Password { get; set; }
    }

    // ──────────────────────────────────────────────
    // 2 & 3. Organisms & Encyclopedia Models
    // ──────────────────────────────────────────────
    public class OrganismDto
    {
        public int OrganismId { get; set; }
        [Required, MaxLength(100)]
        public string ScientificName { get; set; } = "";
        [MaxLength(100)]
        public string? CommonName { get; set; }
        [Required]
        public string RankName { get; set; } = "";
        public int? ParentId { get; set; }
        [MaxLength(20)]
        public string? KingdomType { get; set; }
        [MaxLength(10)]
        public string? ConservationStatus { get; set; }
        public int? DiscoveryYear { get; set; }
        public List<OrganismDto> Children { get; set; } = new();
    }

    public class SpeciesEncyclopediaDto
    {
        public int EncyclopediaId { get; set; }
        public int OrganismId { get; set; }
        public string? Description { get; set; }
        [MaxLength(20)]
        public string? DietType { get; set; }
        [MaxLength(255)]
        public string? DietDetails { get; set; }
        [MaxLength(255)]
        public string? PhysicalDescription { get; set; }
        public decimal? AvgHeightCm { get; set; }
        public decimal? AvgLengthCm { get; set; }
        [MaxLength(255)]
        public string? HabitatBehavior { get; set; }
        [MaxLength(255)]
        public string? ReproductionInfo { get; set; }
        [MaxLength(255)]
        public string? NativeRangeDescription { get; set; }
        [MaxLength(500)]
        public string? ImageUrl { get; set; }
        [MaxLength(500)]
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
        [Required, MaxLength(100)]
        public string RegionName { get; set; } = "";
        [Required, MaxLength(100)]
        public string Country { get; set; } = "";
        [MaxLength(100)]
        public string? BiomeName { get; set; }
        [MaxLength(100)]
        public string? ClimateZone { get; set; }
        public decimal? AreaSqKM { get; set; }
        public string? IsProtected { get; set; }
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
        [Required, MaxLength(100)]
        public string ReserveName { get; set; } = "";
        public int? RegionId { get; set; }
        public string? RegionName { get; set; }
        public decimal? TotalAreaSqKm { get; set; }
        public decimal? AnnualBudgetUsd { get; set; }
        public int? EstablishedYear { get; set; }
        [MaxLength(100)]
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
        [Required]
        public string HealthStatus { get; set; } = "";
        [MaxLength(500)]
        public string? ObservationNotes { get; set; }
    }

    public class SightingCreateDto
    {
        public int OrganismId { get; set; }
        public int ReserveId { get; set; }
        public int QuantityObserved { get; set; }
        public string HealthStatus { get; set; } = "Unknown";
        [MaxLength(500)]
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
        [Required, MaxLength(100)]
        public string ThreatName { get; set; } = "";
        [MaxLength(100)]
        public string? ThreatCategory { get; set; }
        [Required]
        public string SeverityLevel { get; set; } = "";
        public DateTime AssessmentDate { get; set; }
        public int? AdminId { get; set; }
        public string? AdminName { get; set; }
        public string ResolutionStatus { get; set; } = "";
    }

    public class ThreatCreateDto
    {
        public int RegionId { get; set; }
        [Required, MaxLength(100)]
        public string ThreatName { get; set; } = "";
        [MaxLength(100)]
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
        [Required, MaxLength(50)]
        public string TagName { get; set; } = "";
        [MaxLength(50)]
        public string? TagCategory { get; set; }
        [MaxLength(20)]
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