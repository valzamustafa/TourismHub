using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourismHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreatessPostgreSQL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProviderName",
                table: "Activities",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProviderName",
                table: "Activities");
        }
    }
}
