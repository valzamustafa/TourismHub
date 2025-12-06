using System;
using System.Collections.Generic;

namespace TourismHub.Application.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}