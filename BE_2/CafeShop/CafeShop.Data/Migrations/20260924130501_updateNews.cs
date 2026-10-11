using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CafeShop.Data.Migrations
{
    /// <inheritdoc />
    public partial class updateNews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_News_Users_AuthorId",
                table: "News");

            migrationBuilder.RenameColumn(
                name: "AuthorId",
                table: "News",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_News_AuthorId",
                table: "News",
                newName: "IX_News_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "News",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "News",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledPublishAt",
                table: "News",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "News",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "News",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Summary",
                table: "News",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "News",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_News_Users_UserId",
                table: "News",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_News_Users_UserId",
                table: "News");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "News");

            migrationBuilder.DropColumn(
                name: "ScheduledPublishAt",
                table: "News");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "News");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "News");

            migrationBuilder.DropColumn(
                name: "Summary",
                table: "News");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "News");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "News",
                newName: "AuthorId");

            migrationBuilder.RenameIndex(
                name: "IX_News_UserId",
                table: "News",
                newName: "IX_News_AuthorId");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "News",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_News_Users_AuthorId",
                table: "News",
                column: "AuthorId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
