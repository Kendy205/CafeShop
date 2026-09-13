using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class updateFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Orders_OrderId",
                table: "Feedbacks");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Feedbacks",
                newName: "OrderDetailId");

            migrationBuilder.RenameIndex(
                name: "IX_Feedbacks_OrderId",
                table: "Feedbacks",
                newName: "IX_Feedbacks_OrderDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_OrderDetails_OrderDetailId",
                table: "Feedbacks",
                column: "OrderDetailId",
                principalTable: "OrderDetails",
                principalColumn: "OrderDetailId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_OrderDetails_OrderDetailId",
                table: "Feedbacks");

            migrationBuilder.RenameColumn(
                name: "OrderDetailId",
                table: "Feedbacks",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Feedbacks_OrderDetailId",
                table: "Feedbacks",
                newName: "IX_Feedbacks_OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Orders_OrderId",
                table: "Feedbacks",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
