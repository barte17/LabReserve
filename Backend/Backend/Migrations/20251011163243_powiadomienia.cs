using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class powiadomienia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Opis",
                table: "Rezerwacje",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Powiadomienia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UzytkownikId = table.Column<string>(type: "text", nullable: false),
                    Tytul = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tresc = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Typ = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Priorytet = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    CzyPrzeczytane = table.Column<bool>(type: "boolean", nullable: false),
                    DataUtworzenia = table.Column<DateTime>(type: "timestamp", nullable: false),
                    RezerwacjaId = table.Column<int>(type: "integer", nullable: true),
                    ActionUrl = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DataWygasniecia = table.Column<DateTime>(type: "timestamp", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Powiadomienia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Powiadomienia_AspNetUsers_UzytkownikId",
                        column: x => x.UzytkownikId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Powiadomienia_Rezerwacje_RezerwacjaId",
                        column: x => x.RezerwacjaId,
                        principalTable: "Rezerwacje",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Powiadomienia_DataUtworzenia",
                table: "Powiadomienia",
                column: "DataUtworzenia");

            migrationBuilder.CreateIndex(
                name: "IX_Powiadomienia_RezerwacjaId",
                table: "Powiadomienia",
                column: "RezerwacjaId");

            migrationBuilder.CreateIndex(
                name: "IX_Powiadomienia_UzytkownikId_CzyPrzeczytane",
                table: "Powiadomienia",
                columns: new[] { "UzytkownikId", "CzyPrzeczytane" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Powiadomienia");

            migrationBuilder.AlterColumn<string>(
                name: "Opis",
                table: "Rezerwacje",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(60)",
                oldMaxLength: 60,
                oldNullable: true);
        }
    }
}
