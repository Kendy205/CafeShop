# Stage 1: Build the backend application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore dependencies
COPY ["CafeShop/CafeShop.csproj", "CafeShop/"]
COPY ["CafeShop.DTO/CafeShop.DTO.csproj", "CafeShop.DTO/"]
COPY ["CafeShop.Data/CafeShop.Data.csproj", "CafeShop.Data/"]
COPY ["CafeShop.Model/CafeShop.Model.csproj", "CafeShop.Model/"]
COPY ["CafeShop.Service/CafeShop.Service.csproj", "CafeShop.Service/"]
COPY ["CafeShop.Uitls/CafeShop.Uitls.csproj", "CafeShop.Uitls/"]

# Restore nuget packages
RUN dotnet restore "CafeShop/CafeShop.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/app/CafeShop"
RUN dotnet build "CafeShop.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "CafeShop.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CafeShop.dll"]
