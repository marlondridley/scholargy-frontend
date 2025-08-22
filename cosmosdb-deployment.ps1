# CosmosDB Deployment Script for Scholargy
# This script creates the necessary containers in Azure CosmosDB

param(
    [Parameter(Mandatory=$true)]
    [string]$CosmosDBAccountName,
    
    [Parameter(Mandatory=$true)]
    [string]$DatabaseName = "scholargyvectordb",
    
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US"
)

Write-Host "🚀 Deploying CosmosDB containers for Scholargy..." -ForegroundColor Green

# 1. Create Database if it doesn't exist
Write-Host "📦 Creating database: $DatabaseName" -ForegroundColor Yellow
try {
    az cosmosdb sql database create `
        --account-name $CosmosDBAccountName `
        --resource-group $ResourceGroupName `
        --name $DatabaseName
    Write-Host "✅ Database created successfully" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Database already exists or error occurred" -ForegroundColor Yellow
}

# 2. Create Users Container
Write-Host "👥 Creating users container..." -ForegroundColor Yellow
az cosmosdb sql container create `
    --account-name $CosmosDBAccountName `
    --resource-group $ResourceGroupName `
    --database-name $DatabaseName `
    --name "users" `
    --partition-key-path "/email" `
    --throughput 400

Write-Host "✅ Users container created successfully" -ForegroundColor Green

# 3. Create User Applications Container
Write-Host "📝 Creating user_applications container..." -ForegroundColor Yellow
az cosmosdb sql container create `
    --account-name $CosmosDBAccountName `
    --resource-group $ResourceGroupName `
    --database-name $DatabaseName `
    --name "user_applications" `
    --partition-key-path "/userId" `
    --throughput 400

Write-Host "✅ User applications container created successfully" -ForegroundColor Green

# 4. Create Indexes for optimal performance
Write-Host "🔍 Creating indexes..." -ForegroundColor Yellow

# Index for users container
$usersIndex = @{
    "indexingMode" = "consistent"
    "automatic" = $true
    "includedPaths" = @(
        @{
            "path" = "/email/?"
        },
        @{
            "path" = "/provider/?"
        },
        @{
            "path" = "/created_at/?"
        },
        @{
            "path" = "/updated_at/?"
        }
    )
    "excludedPaths" = @(
        @{
            "path" = "/*"
        }
    )
}

$usersIndexJson = $usersIndex | ConvertTo-Json -Depth 10

az cosmosdb sql container update `
    --account-name $CosmosDBAccountName `
    --resource-group $ResourceGroupName `
    --database-name $DatabaseName `
    --name "users" `
    --idx $usersIndexJson

# Index for user_applications container
$applicationsIndex = @{
    "indexingMode" = "consistent"
    "automatic" = $true
    "includedPaths" = @(
        @{
            "path" = "/userId/?"
        },
        @{
            "path" = "/email/?"
        },
        @{
            "path" = "/created_at/?"
        },
        @{
            "path" = "/updated_at/?"
        },
        @{
            "path" = "/profile/academic/gpa/?"
        },
        @{
            "path" = "/profile/academic/sat_score/?"
        },
        @{
            "path" = "/profile/academic/act_score/?"
        }
    )
    "excludedPaths" = @(
        @{
            "path" = "/*"
        }
    )
}

$applicationsIndexJson = $applicationsIndex | ConvertTo-Json -Depth 10

az cosmosdb sql container update `
    --account-name $CosmosDBAccountName `
    --resource-group $ResourceGroupName `
    --database-name $DatabaseName `
    --name "user_applications" `
    --idx $applicationsIndexJson

Write-Host "✅ Indexes created successfully" -ForegroundColor Green

# 5. Get connection information
Write-Host "🔗 Getting connection information..." -ForegroundColor Yellow
$connectionString = az cosmosdb keys list `
    --account-name $CosmosDBAccountName `
    --resource-group $ResourceGroupName `
    --type connection-strings `
    --query "connectionStrings[0].connectionString" `
    --output tsv

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Connection Information:" -ForegroundColor Cyan
Write-Host "Database: $DatabaseName" -ForegroundColor White
Write-Host "Users Container: users" -ForegroundColor White
Write-Host "Applications Container: user_applications" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Connection String (save this securely):" -ForegroundColor Cyan
Write-Host $connectionString -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Add this connection string to your backend environment variables!" -ForegroundColor Red
