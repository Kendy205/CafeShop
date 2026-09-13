using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class addOrderIDtoFeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "Feedbacks");

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "Feedbacks",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "Feedbacks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_OrderId",
                table: "Feedbacks",
                column: "OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Orders_OrderId",
                table: "Feedbacks",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Orders_OrderId",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_OrderId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "Feedbacks");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "Feedbacks",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
