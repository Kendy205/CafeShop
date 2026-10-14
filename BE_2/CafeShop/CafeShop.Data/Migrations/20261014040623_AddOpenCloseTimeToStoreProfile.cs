using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOpenCloseTimeToStoreProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "CloseTime",
                table: "StoreProfiles",
                type: "time(6)",
                nullable: false,
                defaultValue: new TimeSpan(22, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "OpenTime",
                table: "StoreProfiles",
                type: "time(6)",
                nullable: false,
                defaultValue: new TimeSpan(7, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CloseTime",
                table: "StoreProfiles");

            migrationBuilder.DropColumn(
                name: "OpenTime",
                table: "StoreProfiles");
        }
    }
}
