using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class addTBShipCF : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShippingConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BaseFee = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    BaseDistanceKm = table.Column<double>(type: "double", nullable: false),
                    ExtraFeePerKm = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    MaxDistanceKm = table.Column<double>(type: "double", nullable: false),
                    NightSurcharge = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    NightHourStart = table.Column<int>(type: "int", nullable: false),
                    NightHourEnd = table.Column<int>(type: "int", nullable: false),
                    PeakHourSurcharge = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    PeakHourStart = table.Column<int>(type: "int", nullable: false),
                    PeakHourEnd = table.Column<int>(type: "int", nullable: false),
                    WeekendSurcharge = table.Column<decimal>(type: "decimal(65,30)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingConfigs", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShippingConfigs");
        }
    }
}
