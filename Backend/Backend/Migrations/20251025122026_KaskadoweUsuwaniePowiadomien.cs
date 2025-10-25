using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class KaskadoweUsuwaniePowiadomien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Powiadomienia_Rezerwacje_RezerwacjaId",
                table: "Powiadomienia");

            migrationBuilder.AddForeignKey(
                name: "FK_Powiadomienia_Rezerwacje_RezerwacjaId",
                table: "Powiadomienia",
                column: "RezerwacjaId",
                principalTable: "Rezerwacje",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Powiadomienia_Rezerwacje_RezerwacjaId",
                table: "Powiadomienia");

            migrationBuilder.AddForeignKey(
                name: "FK_Powiadomienia_Rezerwacje_RezerwacjaId",
                table: "Powiadomienia",
                column: "RezerwacjaId",
                principalTable: "Rezerwacje",
                principalColumn: "Id");
        }
    }
}
