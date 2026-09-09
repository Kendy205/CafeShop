using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class addCartItemTop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cart_item_toppings",
                columns: table => new
                {
                    cart_item_topping_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cart_item_id = table.Column<int>(type: "int", nullable: false),
                    topping_id = table.Column<int>(type: "int", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(65,30)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cart_item_toppings", x => x.cart_item_topping_id);
                    table.ForeignKey(
                        name: "FK_cart_item_toppings_CartItems_cart_item_id",
                        column: x => x.cart_item_id,
                        principalTable: "CartItems",
                        principalColumn: "cart_item_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_cart_item_toppings_Toppings_topping_id",
                        column: x => x.topping_id,
                        principalTable: "Toppings",
                        principalColumn: "ToppingId",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_size_id",
                table: "CartItems",
                column: "size_id");

            migrationBuilder.CreateIndex(
                name: "IX_cart_item_toppings_cart_item_id",
                table: "cart_item_toppings",
                column: "cart_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_cart_item_toppings_topping_id",
                table: "cart_item_toppings",
                column: "topping_id");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Sizes_size_id",
                table: "CartItems",
                column: "size_id",
                principalTable: "Sizes",
                principalColumn: "SizeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Sizes_size_id",
                table: "CartItems");

            migrationBuilder.DropTable(
                name: "cart_item_toppings");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_size_id",
                table: "CartItems");
        }
    }
}
