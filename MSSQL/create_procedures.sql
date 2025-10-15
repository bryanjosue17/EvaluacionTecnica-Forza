USE [ShopDb]
GO

/****** Object:  StoredProcedure [dbo].[usp_Product_Create] ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_Product_Create] @Name NVARCHAR(120),
  @Description NVARCHAR(500) = NULL,
  @Price DECIMAL(10, 2),
  @ImageUrl NVARCHAR(300) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO dbo.Products (
    Name,
    Description,
    Price,
    ImageUrl
    )
  VALUES (
    @Name,
    @Description,
    @Price,
    @ImageUrl
    );

  SELECT SCOPE_IDENTITY() AS Id;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Product_Update] ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_Product_Update] @Id INT,
  @Name NVARCHAR(120),
  @Description NVARCHAR(500) = NULL,
  @Price DECIMAL(10, 2),
  @ImageUrl NVARCHAR(300) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE dbo.Products
  SET Name = @Name,
    Description = @Description,
    Price = @Price,
    ImageUrl = @ImageUrl
  WHERE Id = @Id;

  SELECT @@ROWCOUNT AS Affected;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Product_Delete] ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_Product_Delete] @Id INT
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM dbo.Products
  WHERE Id = @Id;

  SELECT @@ROWCOUNT AS Affected;
END
GO