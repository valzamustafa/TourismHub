using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourismHub.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Miigrationsss : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DelayedDate",
                table: "Activities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RescheduledEndDate",
                table: "Activities",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RescheduledStartDate",
                table: "Activities",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DelayedDate",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RescheduledEndDate",
                table: "Activities");

            migrationBuilder.DropColumn(
                name: "RescheduledStartDate",
                table: "Activities");
        }
    }
}
