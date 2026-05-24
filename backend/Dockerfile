FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/LargeRetailer.Modernisation.sln backend/
COPY backend/src/LargeRetailer.Modernisation.Api/LargeRetailer.Modernisation.Api.csproj backend/src/LargeRetailer.Modernisation.Api/
COPY backend/src/LargeRetailer.Modernisation.Application/LargeRetailer.Modernisation.Application.csproj backend/src/LargeRetailer.Modernisation.Application/
COPY backend/src/LargeRetailer.Modernisation.Domain/LargeRetailer.Modernisation.Domain.csproj backend/src/LargeRetailer.Modernisation.Domain/
COPY backend/src/LargeRetailer.Modernisation.Infrastructure/LargeRetailer.Modernisation.Infrastructure.csproj backend/src/LargeRetailer.Modernisation.Infrastructure/
COPY backend/tests/LargeRetailer.Modernisation.Api.Tests/LargeRetailer.Modernisation.Api.Tests.csproj backend/tests/LargeRetailer.Modernisation.Api.Tests/
COPY backend/tests/LargeRetailer.Modernisation.Application.Tests/LargeRetailer.Modernisation.Application.Tests.csproj backend/tests/LargeRetailer.Modernisation.Application.Tests/
COPY backend/tests/LargeRetailer.Modernisation.IntegrationTests/LargeRetailer.Modernisation.IntegrationTests.csproj backend/tests/LargeRetailer.Modernisation.IntegrationTests/

RUN dotnet restore backend/LargeRetailer.Modernisation.sln

COPY backend/ backend/
RUN dotnet publish backend/src/LargeRetailer.Modernisation.Api/LargeRetailer.Modernisation.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "LargeRetailer.Modernisation.Api.dll"]
