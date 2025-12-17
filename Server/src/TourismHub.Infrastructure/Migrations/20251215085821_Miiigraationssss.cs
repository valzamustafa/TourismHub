using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourismHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Miiigraationssss : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Activities");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Activities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Activities",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
