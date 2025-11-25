using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TourismHub.Domain.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public DateTime Created { get; set; }
    public string CreatedByIp { get; set; } = string.Empty;
    public DateTime? Revoked { get; set; }
    public string? RevokedByIp { get; set; }
    public string? ReplacedByToken { get; set; }
    
   
    public bool IsRevoked { get; set; }
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public bool IsActive => !IsRevoked && !IsExpired;


    public Guid UserId { get; set; }
    
 
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}