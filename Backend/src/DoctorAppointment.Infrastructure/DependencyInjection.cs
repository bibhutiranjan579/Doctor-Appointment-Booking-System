using DoctorAppointment.Application.Interfaces;
using DoctorAppointment.Application.Services;
using DoctorAppointment.Core.Interfaces;
using DoctorAppointment.Infrastructure.Data;
using DoctorAppointment.Infrastructure.Repositories;
using DoctorAppointment.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DoctorAppointment.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Database - use PostgreSQL if connection string contains "Host=" or starts with postgres://, otherwise SQL Server
            var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "";
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
                    connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                    connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
                {
                    var connStr = connectionString;
                    if (connStr.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                        connStr.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
                    {
                        var uri = new Uri(connStr);
                        var userInfo = uri.UserInfo.Split(':');
                        connStr = $"Host={uri.Host};Port={(uri.Port > 0 ? uri.Port : 5432)};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
                    }
                    options.UseNpgsql(connStr);
                }
                else
                {
                    options.UseSqlServer(connectionString);
                }
            });

            // Repositories
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDoctorRepository, DoctorRepository>();
            services.AddScoped<IPatientRepository, PatientRepository>();
            services.AddScoped<IHospitalRepository, HospitalRepository>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            services.AddScoped<IChatMessageRepository, ChatMessageRepository>();

            // Services
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IDoctorService, DoctorService>();
            services.AddScoped<IPatientService, PatientService>();
            services.AddScoped<IHospitalService, HospitalService>();
            services.AddScoped<IAppointmentService, AppointmentService>();
            services.AddScoped<IChatService, ChatService>();
            services.AddScoped<IFeedbackService, FeedbackService>();
            services.AddScoped<ISentimentAnalysisService, SentimentAnalysisService>();

            // Gemini AI service
            services.AddHttpClient<IGeminiService, GeminiService>();

            return services;
        }
    }
}
