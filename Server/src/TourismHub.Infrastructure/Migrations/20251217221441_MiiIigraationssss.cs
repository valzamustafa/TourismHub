using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourismHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MiiIigraationssss : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StripeApiKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SecretKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    PublishableKey = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    KeyId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Environment = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastUsed = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UsageCount = table.Column<int>(type: "integer", nullable: false),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RevokedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    RevokedReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StripeApiKeys", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StripeApiKeys_Environment_IsActive",
                table: "StripeApiKeys",
                columns: new[] { "Environment", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_StripeApiKeys_ExpiresAt",
                table: "StripeApiKeys",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_StripeApiKeys_KeyId",
                table: "StripeApiKeys",
                column: "KeyId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StripeApiKeys");
        }
    }
}
