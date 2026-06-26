namespace Bioma.Models
{
    // ──────────────────────────────────────────────
    // Authentication & User Models
    // ──────────────────────────────────────────────

    public class UserDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string RoleName { get; set; } = "";
        public string? Affiliation { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class LoginDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class RegisterDto
    {
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string Email { get; set; } = "";
        public string RoleName { get; set; } = "Field Researcher";
        public string? Affiliation { get; set; }
    }

    // ──────────────────────────────────────────────
    // Taxonomy Models
    // ──────────────────────────────────────────────

    public class TaxonomyNode
    {
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public int RankId { get; set; }
        public string RankName { get; set; } = "";
        public int? ParentId { get; set; }
        public int? DiscoveryYear { get; set; }
        public List<TaxonomyNode> Children { get; set; } = new();
    }

    public class SpeciesProfileDetails
    {
        // Core organism info
        public int OrganismId { get; set; }
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public string RankName { get; set; } = "";
        public int? DiscoveryYear { get; set; }

        // Species Profile fields
        public string? KingdomType { get; set; }
        public string? StatusCode { get; set; }
        public string? StatusName { get; set; }
        public int? RiskLevel { get; set; }
        public decimal? AvgLifespanYears { get; set; }
        public decimal? AvgWeightKg { get; set; }
        public string? MetabolicRateIndex { get; set; }
        public string? PhotosyntheticRate { get; set; }

        // Encyclopedia fields
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

        // Tags
        public List<TagDto> Tags { get; set; } = new();
    }

    public class OrganismCreateDto
    {
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public int RankId { get; set; }
        public int? ParentId { get; set; }
        public int? DiscoveryYear { get; set; }
    }

    // ──────────────────────────────────────────────
    // Sighting & Reserve Models
    // ──────────────────────────────────────────────

    public class SightingRecord
    {
        public int SightingId { get; set; }
        public int OrganismId { get; set; }
        public string? ScientificName { get; set; }
        public string? CommonName { get; set; }
        public int ReserveId { get; set; }
        public string? ReserveName { get; set; }
        public int UserId { get; set; }
        public string? Username { get; set; }
        public DateTime SightingTimestamp { get; set; }
        public int QuantityObserved { get; set; }
        public string? HealthStatus { get; set; }
        public string? ObservationNotes { get; set; }
    }

    public class SightingCreateDto
    {
        public int OrganismId { get; set; }
        public int ReserveId { get; set; }
        public int UserId { get; set; }
        public int QuantityObserved { get; set; }
        public string? HealthStatus { get; set; }
        public string? ObservationNotes { get; set; }
    }

    public class ReserveDto
    {
        public int ReserveId { get; set; }
        public string ReserveName { get; set; } = "";
        public string? RegionName { get; set; }
        public string? Country { get; set; }
        public decimal? TotalAreaSqKm { get; set; }
        public decimal? AnnualBudgetUsd { get; set; }
        public int? EstablishedYear { get; set; }
        public string? ReserveType { get; set; }
    }

    public class ReserveAnalytics
    {
        public string ReserveName { get; set; } = "";
        public string RegionName { get; set; } = "";
        public string BiomeName { get; set; } = "";
        public int TotalSightings { get; set; }
        public int UniqueSpecies { get; set; }
        public int ActiveThreats { get; set; }
        public decimal? AreaSqKm { get; set; }
    }

    // ──────────────────────────────────────────────
    // Threat Models
    // ──────────────────────────────────────────────

    public class ThreatLogRecord
    {
        public int LogId { get; set; }
        public string? RegionName { get; set; }
        public string? ThreatName { get; set; }
        public string? ThreatCategory { get; set; }
        public string SeverityLevel { get; set; } = "";
        public DateTime AssessmentDate { get; set; }
        public string? ReportedByUsername { get; set; }
        public string ResolutionStatus { get; set; } = "Active";
    }

    public class ThreatCreateDto
    {
        public int RegionId { get; set; }
        public int ThreatId { get; set; }
        public string SeverityLevel { get; set; } = "Medium";
        public int? ReportedBy { get; set; }
    }

    // ──────────────────────────────────────────────
    // Tag Models
    // ──────────────────────────────────────────────

    public class TagDto
    {
        public int TagId { get; set; }
        public string TagName { get; set; } = "";
        public string? TagCategory { get; set; }
        public string? TagColor { get; set; }
    }

    public class TagAssignDto
    {
        public int OrganismId { get; set; }
        public int TagId { get; set; }
        public int? TaggedBy { get; set; }
    }

    // ──────────────────────────────────────────────
    // Analytics Models
    // ──────────────────────────────────────────────

    public class DashboardStats
    {
        public int TotalSpecies { get; set; }
        public int TotalOrganisms { get; set; }
        public int TotalSightings { get; set; }
        public int TotalReserves { get; set; }
        public int ActiveThreats { get; set; }
        public int TotalUsers { get; set; }
        public int EndangeredCount { get; set; }
        public int CriticallyEndangeredCount { get; set; }
    }

    public class ExtinctionLeaderboard
    {
        public string ScientificName { get; set; } = "";
        public string? CommonName { get; set; }
        public string StatusName { get; set; } = "";
        public int RiskLevel { get; set; }
        public int TotalSightings { get; set; }
        public int RegionCount { get; set; }
    }

    // ──────────────────────────────────────────────
    // Ecological Interaction Models
    // ──────────────────────────────────────────────

    public class EcologicalInteractionDto
    {
        public int InteractionId { get; set; }
        public string? OrganismAName { get; set; }
        public string? OrganismBName { get; set; }
        public string? InteractionName { get; set; }
        public int? EcologicalImpactScale { get; set; }
        public string? InteractionNotes { get; set; }
    }
}
