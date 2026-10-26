-- Crea la base y el usuario de la aplicación. Idempotente: se puede correr varias veces.
-- Lo ejecuta el servicio sqlserver-init de compose.yaml; $(DB_PASSWORD) lo reemplaza sqlcmd.

IF DB_ID('cody') IS NULL
    CREATE DATABASE cody;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'cody_app')
    CREATE LOGIN cody_app WITH PASSWORD = '$(DB_PASSWORD)', CHECK_POLICY = OFF;
GO

USE cody;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'cody_app')
    CREATE USER cody_app FOR LOGIN cody_app;
GO

ALTER ROLE db_owner ADD MEMBER cody_app;
GO
