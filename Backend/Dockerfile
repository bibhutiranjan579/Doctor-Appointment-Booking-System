FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS base
WORKDIR /app
EXPOSE 10000

FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY src/DoctorAppointment.Core/DoctorAppointment.Core.csproj src/DoctorAppointment.Core/
COPY src/DoctorAppointment.Application/DoctorAppointment.Application.csproj src/DoctorAppointment.Application/
COPY src/DoctorAppointment.Infrastructure/DoctorAppointment.Infrastructure.csproj src/DoctorAppointment.Infrastructure/
COPY src/DoctorAppointment.API/DoctorAppointment.API.csproj src/DoctorAppointment.API/
RUN dotnet restore src/DoctorAppointment.API/DoctorAppointment.API.csproj

COPY src/ src/
RUN dotnet publish src/DoctorAppointment.API/DoctorAppointment.API.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "DoctorAppointment.API.dll"]
