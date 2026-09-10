using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class addQuantiToProductandTop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StockQuantity",
                table: "ProductSizes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StockQuantity",
                table: "ProductSizes");
        }
    }
}
