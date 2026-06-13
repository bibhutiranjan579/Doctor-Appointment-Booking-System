using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoctorAppointment.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminUserIdScope : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AdminUserId",
                table: "Hospitals",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AdminUserId",
                table: "Doctors",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Hospitals_AdminUserId",
                table: "Hospitals",
                column: "AdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Doctors_AdminUserId",
                table: "Doctors",
                column: "AdminUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Doctors_Users_AdminUserId",
                table: "Doctors",
                column: "AdminUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Hospitals_Users_AdminUserId",
                table: "Hospitals",
                column: "AdminUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Doctors_Users_AdminUserId",
                table: "Doctors");

            migrationBuilder.DropForeignKey(
                name: "FK_Hospitals_Users_AdminUserId",
                table: "Hospitals");

            migrationBuilder.DropIndex(
                name: "IX_Hospitals_AdminUserId",
                table: "Hospitals");

            migrationBuilder.DropIndex(
                name: "IX_Doctors_AdminUserId",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "AdminUserId",
                table: "Hospitals");

            migrationBuilder.DropColumn(
                name: "AdminUserId",
                table: "Doctors");
        }
    }
}
