using DoctorAppointment.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DoctorAppointment.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Hospital> Hospitals => Set<Hospital>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
        public DbSet<Feedback> Feedbacks => Set<Feedback>();
        public DbSet<MedAiChatHistory> MedAiChatHistories => Set<MedAiChatHistory>();
        public DbSet<ChatConversation> ChatConversations => Set<ChatConversation>();
        public DbSet<AiChatMessage> AiChatMessages => Set<AiChatMessage>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Role).HasConversion<string>();
            });

            // Doctor
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasOne(d => d.User)
                    .WithOne(u => u.Doctor)
                    .HasForeignKey<Doctor>(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(d => d.Hospital)
                    .WithMany(h => h.Doctors)
                    .HasForeignKey(d => d.HospitalId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(d => d.AdminUser)
                    .WithMany()
                    .HasForeignKey(d => d.AdminUserId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Patient
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasOne(p => p.User)
                    .WithOne(u => u.Patient)
                    .HasForeignKey<Patient>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Appointment
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.Property(a => a.Status).HasConversion<string>();

                entity.HasOne(a => a.Patient)
                    .WithMany(p => p.Appointments)
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Doctor)
                    .WithMany(d => d.Appointments)
                    .HasForeignKey(a => a.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Hospital -> Admin
            modelBuilder.Entity<Hospital>(entity =>
            {
                entity.HasOne(h => h.AdminUser)
                    .WithMany()
                    .HasForeignKey(h => h.AdminUserId)
                    .OnDelete(DeleteBehavior.NoAction);
            });

            // Payment
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(p => p.PaymentMethod).HasConversion<string>();
                entity.Property(p => p.Status).HasConversion<string>();
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");

                entity.HasOne(p => p.Appointment)
                    .WithOne(a => a.Payment)
                    .HasForeignKey<Payment>(p => p.AppointmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Feedback
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasOne(f => f.Appointment)
                    .WithMany()
                    .HasForeignKey(f => f.AppointmentId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(f => f.Patient)
                    .WithMany()
                    .HasForeignKey(f => f.PatientId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasOne(f => f.Doctor)
                    .WithMany()
                    .HasForeignKey(f => f.DoctorId)
                    .OnDelete(DeleteBehavior.NoAction);

                entity.HasIndex(f => f.AppointmentId).IsUnique();
            });

            // ChatMessage
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasOne(c => c.Sender)
                    .WithMany()
                    .HasForeignKey(c => c.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Receiver)
                    .WithMany()
                    .HasForeignKey(c => c.ReceiverId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // MedAiChatHistory
            modelBuilder.Entity<MedAiChatHistory>(entity =>
            {
                entity.HasOne(m => m.User)
                    .WithMany()
                    .HasForeignKey(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(m => new { m.UserId, m.ConversationId });
            });

            // ChatConversation
            modelBuilder.Entity<ChatConversation>(entity =>
            {
                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(c => c.UserId);
                entity.HasIndex(c => new { c.UserId, c.UpdatedAt });
            });

            // AiChatMessage
            modelBuilder.Entity<AiChatMessage>(entity =>
            {
                entity.HasOne(m => m.Conversation)
                    .WithMany(c => c.Messages)
                    .HasForeignKey(m => m.ConversationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(m => m.ConversationId);
            });

            // Seed admin user (pre-hashed password for "Admin@123")
            var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = adminId,
                Name = "Admin",
                Email = "admin@hospital.com",
                PasswordHash = "$2a$11$XVLGQ2Fz1YkD3Jz6jZqXxeZwE3kF5sN0RgW8tYb7VcHpMdKqO3Ey",
                Role = Core.Enums.UserRole.Admin,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });
        }
    }
}
