USE [master]
GO

/****** Object:  Database [ShopDb]    Script Date: 15/10/2025 00:57:49 ******/
CREATE DATABASE [ShopDb] CONTAINMENT = NONE ON PRIMARY (
  NAME = N'ShopDb',
  FILENAME = N'D:\DEV\Brayan\Projects\data\ShopDb.mdf',
  SIZE = 8192 KB,
  MAXSIZE = UNLIMITED,
  FILEGROWTH = 65536 KB
  ) LOG ON (
  NAME = N'ShopDb_log',
  FILENAME = N'D:\DEV\Brayan\Projects\data\ShopDb_log.ldf',
  SIZE = 8192 KB,
  MAXSIZE = 2048 GB,
  FILEGROWTH = 65536 KB
  )
  WITH CATALOG_COLLATION = DATABASE_DEFAULT,
    LEDGER = OFF
GO

ALTER DATABASE [ShopDb]

SET COMPATIBILITY_LEVEL = 160
GO

IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
BEGIN
  EXEC [ShopDb].[dbo].[sp_fulltext_database] @action = 'enable'
END
GO

ALTER DATABASE [ShopDb]

SET ANSI_NULL_DEFAULT OFF
GO

ALTER DATABASE [ShopDb]

SET ANSI_NULLS OFF
GO

ALTER DATABASE [ShopDb]

SET ANSI_PADDING OFF
GO

ALTER DATABASE [ShopDb]

SET ANSI_WARNINGS OFF
GO

ALTER DATABASE [ShopDb]

SET ARITHABORT OFF
GO

ALTER DATABASE [ShopDb]

SET AUTO_CLOSE ON
GO

ALTER DATABASE [ShopDb]

SET AUTO_SHRINK OFF
GO

ALTER DATABASE [ShopDb]

SET AUTO_UPDATE_STATISTICS ON
GO

ALTER DATABASE [ShopDb]

SET CURSOR_CLOSE_ON_COMMIT OFF
GO

ALTER DATABASE [ShopDb]

SET CURSOR_DEFAULT GLOBAL
GO

ALTER DATABASE [ShopDb]

SET CONCAT_NULL_YIELDS_NULL OFF
GO

ALTER DATABASE [ShopDb]

SET NUMERIC_ROUNDABORT OFF
GO

ALTER DATABASE [ShopDb]

SET QUOTED_IDENTIFIER OFF
GO

ALTER DATABASE [ShopDb]

SET RECURSIVE_TRIGGERS OFF
GO

ALTER DATABASE [ShopDb]

SET ENABLE_BROKER
GO

ALTER DATABASE [ShopDb]

SET AUTO_UPDATE_STATISTICS_ASYNC OFF
GO

ALTER DATABASE [ShopDb]

SET DATE_CORRELATION_OPTIMIZATION OFF
GO

ALTER DATABASE [ShopDb]

SET TRUSTWORTHY OFF
GO

ALTER DATABASE [ShopDb]

SET ALLOW_SNAPSHOT_ISOLATION OFF
GO

ALTER DATABASE [ShopDb]

SET PARAMETERIZATION SIMPLE
GO

ALTER DATABASE [ShopDb]

SET READ_COMMITTED_SNAPSHOT OFF
GO

ALTER DATABASE [ShopDb]

SET HONOR_BROKER_PRIORITY OFF
GO

ALTER DATABASE [ShopDb]

SET RECOVERY SIMPLE
GO

ALTER DATABASE [ShopDb]

SET MULTI_USER
GO

ALTER DATABASE [ShopDb]

SET PAGE_VERIFY CHECKSUM
GO

ALTER DATABASE [ShopDb]

SET DB_CHAINING OFF
GO

ALTER DATABASE [ShopDb]

SET FILESTREAM(NON_TRANSACTED_ACCESS = OFF)
GO

ALTER DATABASE [ShopDb]

SET TARGET_RECOVERY_TIME = 60 SECONDS
GO

ALTER DATABASE [ShopDb]

SET DELAYED_DURABILITY = DISABLED
GO

ALTER DATABASE [ShopDb]

SET ACCELERATED_DATABASE_RECOVERY = OFF
GO

ALTER DATABASE [ShopDb]

SET QUERY_STORE = ON
GO

ALTER DATABASE [ShopDb]

SET QUERY_STORE(OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO

USE [ShopDb]
GO

/****** Object:  UserDefinedTableType [dbo].[CheckoutItem]    Script Date: 15/10/2025 00:57:49 ******/
CREATE TYPE [dbo].[CheckoutItem] AS TABLE (
  [ProductId] [int] NOT NULL,
  [Qty] [int] NOT NULL,
  CHECK (([Qty] > (0)))
  )
GO

/****** Object:  UserDefinedTableType [dbo].[TVP_OrderItem]    Script Date: 15/10/2025 00:57:49 ******/
CREATE TYPE [dbo].[TVP_OrderItem] AS TABLE (
  [ProductId] [int] NOT NULL,
  [Qty] [int] NOT NULL,
  CHECK (([Qty] > (0)))
  )
GO

/****** Object:  Table [dbo].[CartItems]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[CartItems] (
  [Id] [int] IDENTITY(1, 1) NOT NULL,
  [CartId] [int] NOT NULL,
  [ProductId] [int] NOT NULL,
  [Name] [nvarchar](200) NOT NULL,
  [UnitPrice] [decimal](10, 2) NOT NULL,
  [Qty] [int] NOT NULL,
  PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Carts]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Carts] (
  [Id] [int] IDENTITY(1, 1) NOT NULL,
  [UserId] [int] NOT NULL,
  [Status] [nvarchar](20) NOT NULL,
  [CreatedAt] [datetime2](0) NOT NULL,
  PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Inventory]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Inventory] (
  [ProductId] [int] NOT NULL,
  [Stock] [int] NOT NULL,
  CONSTRAINT [PK_Inventory] PRIMARY KEY CLUSTERED ([ProductId] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[OrderItems]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[OrderItems] (
  [Id] [int] IDENTITY(1, 1) NOT NULL,
  [OrderId] [int] NOT NULL,
  [ProductId] [int] NOT NULL,
  [Qty] [int] NOT NULL,
  [UnitPrice] [decimal](10, 2) NOT NULL,
  CONSTRAINT [PK_OrderItems] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Orders]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Orders] (
  [Id] [int] IDENTITY(1, 1) NOT NULL,
  [UserId] [int] NOT NULL,
  [Total] [decimal](10, 2) NOT NULL,
  [Status] [nvarchar](30) NOT NULL,
  [CreatedAt] [datetime2](7) NOT NULL,
  CONSTRAINT [PK_Orders] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Products]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Products] (
  [Id] [int] IDENTITY(1, 1) NOT NULL,
  [Name] [nvarchar](120) NOT NULL,
  [Description] [nvarchar](500) NULL,
  [Price] [decimal](10, 2) NOT NULL,
  [ImageUrl] [nvarchar](300) NULL,
  [CreatedAt] [datetime2](7) NOT NULL,
  CONSTRAINT [PK_Products] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Table [dbo].[Users]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Users] (
  [Id] [int] IDENTITY(1, 1) NOT NULL,
  [Email] [nvarchar](256) NOT NULL,
  [PasswordHash] [nvarchar](200) NOT NULL,
  [CreatedAt] [datetime2](7) NOT NULL,
  CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([Id] ASC) WITH (
    PAD_INDEX = OFF,
    STATISTICS_NORECOMPUTE = OFF,
    IGNORE_DUP_KEY = OFF,
    ALLOW_ROW_LOCKS = ON,
    ALLOW_PAGE_LOCKS = ON,
    OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
    ) ON [PRIMARY]
  ) ON [PRIMARY]
GO

/****** Object:  Index [IX_CartItems_CartId]    Script Date: 15/10/2025 00:57:49 ******/
CREATE NONCLUSTERED INDEX [IX_CartItems_CartId] ON [dbo].[CartItems] ([CartId] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

/****** Object:  Index [UX_CartItems_Cart_Product]    Script Date: 15/10/2025 00:57:49 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_CartItems_Cart_Product] ON [dbo].[CartItems] (
  [CartId] ASC,
  [ProductId] ASC
  )
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      IGNORE_DUP_KEY = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO

/****** Object:  Index [IX_Carts_User_Status]    Script Date: 15/10/2025 00:57:49 ******/
CREATE NONCLUSTERED INDEX [IX_Carts_User_Status] ON [dbo].[Carts] (
  [UserId] ASC,
  [Status] ASC
  )
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

/****** Object:  Index [IX_OrderItems_OrderId]    Script Date: 15/10/2025 00:57:49 ******/
CREATE NONCLUSTERED INDEX [IX_OrderItems_OrderId] ON [dbo].[OrderItems] ([OrderId] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

/****** Object:  Index [IX_Orders_UserId_CreatedAt]    Script Date: 15/10/2025 00:57:49 ******/
CREATE NONCLUSTERED INDEX [IX_Orders_UserId_CreatedAt] ON [dbo].[Orders] (
  [UserId] ASC,
  [CreatedAt] DESC
  )
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

/****** Object:  Index [IX_Products_CreatedAt]    Script Date: 15/10/2025 00:57:49 ******/
CREATE NONCLUSTERED INDEX [IX_Products_CreatedAt] ON [dbo].[Products] ([CreatedAt] DESC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO

/****** Object:  Index [IX_Products_Name]    Script Date: 15/10/2025 00:57:49 ******/
CREATE NONCLUSTERED INDEX [IX_Products_Name] ON [dbo].[Products] ([Name] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

SET ANSI_PADDING ON
GO

/****** Object:  Index [UX_Users_Email]    Script Date: 15/10/2025 00:57:49 ******/
CREATE UNIQUE NONCLUSTERED INDEX [UX_Users_Email] ON [dbo].[Users] ([Email] ASC)
  WITH (
      PAD_INDEX = OFF,
      STATISTICS_NORECOMPUTE = OFF,
      SORT_IN_TEMPDB = OFF,
      IGNORE_DUP_KEY = OFF,
      DROP_EXISTING = OFF,
      ONLINE = OFF,
      ALLOW_ROW_LOCKS = ON,
      ALLOW_PAGE_LOCKS = ON,
      OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF
      ) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Carts] ADD DEFAULT('OPEN')
FOR [Status]
GO

ALTER TABLE [dbo].[Carts] ADD DEFAULT(sysutcdatetime())
FOR [CreatedAt]
GO

ALTER TABLE [dbo].[Orders] ADD CONSTRAINT [DF_Orders_CreatedAt] DEFAULT(sysutcdatetime())
FOR [CreatedAt]
GO

ALTER TABLE [dbo].[Products] ADD CONSTRAINT [DF_Products_CreatedAt] DEFAULT(sysutcdatetime())
FOR [CreatedAt]
GO

ALTER TABLE [dbo].[Users] ADD CONSTRAINT [DF_Users_CreatedAt] DEFAULT(sysutcdatetime())
FOR [CreatedAt]
GO

ALTER TABLE [dbo].[CartItems]
  WITH CHECK ADD FOREIGN KEY ([CartId]) REFERENCES [dbo].[Carts]([Id]) ON

DELETE CASCADE
GO

ALTER TABLE [dbo].[Inventory]
  WITH CHECK ADD CONSTRAINT [FK_Inventory_Product] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([Id])
GO

ALTER TABLE [dbo].[Inventory] CHECK CONSTRAINT [FK_Inventory_Product]
GO

ALTER TABLE [dbo].[OrderItems]
  WITH CHECK ADD CONSTRAINT [FK_OrderItems_Order] FOREIGN KEY ([OrderId]) REFERENCES [dbo].[Orders]([Id])
GO

ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Order]
GO

ALTER TABLE [dbo].[OrderItems]
  WITH CHECK ADD CONSTRAINT [FK_OrderItems_Product] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products]([Id])
GO

ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Product]
GO

ALTER TABLE [dbo].[Orders]
  WITH CHECK ADD CONSTRAINT [FK_Orders_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id])
GO

ALTER TABLE [dbo].[Orders] CHECK CONSTRAINT [FK_Orders_User]
GO

ALTER TABLE [dbo].[CartItems]
  WITH CHECK ADD CHECK (([Qty] > (0)))
GO

/****** Object:  StoredProcedure [dbo].[usp_Cart_AddOrMergeItem]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Cart_AddOrMergeItem] @UserId INT,
  @ProductId INT,
  @Qty INT,
  @UnitPrice DECIMAL(10, 2),
  @Name NVARCHAR(200) = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  IF (@Qty <= 0)
  BEGIN
    RAISERROR (
        'Qty must be > 0',
        16,
        1
        );

    RETURN;
  END

  DECLARE @CartId INT;

  BEGIN TRAN;

  SELECT @CartId = Id
  FROM dbo.Carts
  WHERE UserId = @UserId
    AND STATUS = 'OPEN';

  IF @CartId IS NULL
  BEGIN
    INSERT INTO dbo.Carts (
      UserId,
      STATUS
      )
    VALUES (
      @UserId,
      'OPEN'
      );

    SET @CartId = SCOPE_IDENTITY();
  END

  IF EXISTS (
      SELECT 1
      FROM dbo.CartItems
      WHERE CartId = @CartId
        AND ProductId = @ProductId
      )
  BEGIN
    UPDATE dbo.CartItems
    SET Qty = Qty + @Qty,
      UnitPrice = @UnitPrice,
      Name = ISNULL(@Name, Name)
    WHERE CartId = @CartId
      AND ProductId = @ProductId;
  END
  ELSE
  BEGIN
    INSERT INTO dbo.CartItems (
      CartId,
      ProductId,
      Name,
      UnitPrice,
      Qty
      )
    VALUES (
      @CartId,
      @ProductId,
      ISNULL(@Name, CONCAT (
          'Product ',
          @ProductId
          )),
      @UnitPrice,
      @Qty
      );
  END

  COMMIT;

  SELECT @CartId AS CartId;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Cart_Clear]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Cart_Clear] @UserId INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @CartId INT = (
      SELECT TOP (1) Id
      FROM dbo.Carts
      WHERE UserId = @UserId
        AND STATUS = 'OPEN'
      );

  IF @CartId IS NULL
    RETURN;

  DELETE
  FROM dbo.CartItems
  WHERE CartId = @CartId;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Cart_Get]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Cart_Get] @UserId INT
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @CartId INT = (
      SELECT TOP (1) Id
      FROM dbo.Carts
      WHERE UserId = @UserId
        AND STATUS = 'OPEN'
      ORDER BY Id DESC
      );

  SELECT @CartId AS Id,
    @UserId AS UserId;-- RS1

  SELECT i.Id,
    i.ProductId,
    i.Name,
    i.UnitPrice,
    i.Qty -- RS2
  FROM dbo.CartItems i
  WHERE i.CartId = @CartId;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Cart_RemoveItem]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Cart_RemoveItem] @UserId INT,
  @ItemId INT,
  @Rows INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;

  -- Elimina el ítem solo si pertenece al carrito abierto del usuario
  DELETE i
  FROM dbo.CartItems AS i
  INNER JOIN dbo.Carts AS c ON c.Id = i.CartId
  WHERE i.Id = @ItemId
    AND c.UserId = @UserId
    AND c.STATUS = 'OPEN';

  -- Devuelve la cantidad de filas afectadas
  SET @Rows = @@ROWCOUNT;
END;
GO

/****** Object:  StoredProcedure [dbo].[usp_Cart_UpdateQty]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Cart_UpdateQty] @UserId INT,
  @ItemId INT,
  @Qty INT
AS
BEGIN
  SET NOCOUNT ON;

  IF (@Qty <= 0)
  BEGIN
    DELETE
    FROM i
    FROM dbo.CartItems i
    JOIN dbo.Carts c ON c.Id = i.CartId
    WHERE i.Id = @ItemId
      AND c.UserId = @UserId
      AND c.STATUS = 'OPEN';

    RETURN;
  END

  UPDATE i
  SET i.Qty = @Qty
  FROM dbo.CartItems i
  JOIN dbo.Carts c ON c.Id = i.CartId
  WHERE i.Id = @ItemId
    AND c.UserId = @UserId
    AND c.STATUS = 'OPEN';
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Inventory_GetStock]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_Inventory_GetStock] @ProductId INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT Stock
  FROM dbo.Inventory
  WHERE ProductId = @ProductId;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Order_Checkout]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Order_Checkout] @UserId INT,
  @Items dbo.TVP_OrderItem READONLY
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @I TABLE (
    ProductId INT NOT NULL,
    Qty INT NOT NULL
    );

  INSERT INTO @I (
    ProductId,
    Qty
    )
  SELECT ProductId,
    SUM(Qty)
  FROM @Items
  GROUP BY ProductId;

  IF EXISTS (
      SELECT 1
      FROM @I i
      LEFT JOIN dbo.Products p ON p.Id = i.ProductId
      WHERE p.Id IS NULL
      )
  BEGIN
    SELECT CAST(0 AS BIT) AS Ok,
      CAST(NULL AS INT) AS OrderId,
      N'Producto inexistente' AS Msg;

    RETURN;
  END

  IF EXISTS (
      SELECT 1
      FROM @I i
      JOIN dbo.Inventory inv ON inv.ProductId = i.ProductId
      WHERE inv.Stock < i.Qty
      )
  BEGIN
    SELECT CAST(0 AS BIT) AS Ok,
      CAST(NULL AS INT) AS OrderId,
      N'Stock insuficiente' AS Msg;

    RETURN;
  END

  DECLARE @Now DATETIME2(0) = SYSUTCDATETIME();
  DECLARE @OrderId INT,
    @Total DECIMAL(10, 2);

  BEGIN TRY
    BEGIN TRAN;

    SELECT @Total = SUM(i.Qty * p.Price)
    FROM @I i
    JOIN dbo.Products p ON p.Id = i.ProductId;

    INSERT INTO dbo.Orders (
      UserId,
      Total,
      STATUS,
      CreatedAt
      )
    VALUES (
      @UserId,
      @Total,
      N'PLACED',
      @Now
      );

    SET @OrderId = SCOPE_IDENTITY();

    INSERT INTO dbo.OrderItems (
      OrderId,
      ProductId,
      Qty,
      UnitPrice
      )
    SELECT @OrderId,
      i.ProductId,
      i.Qty,
      p.Price
    FROM @I i
    JOIN dbo.Products p ON p.Id = i.ProductId;

    UPDATE inv
    SET inv.Stock = inv.Stock - i.Qty
    FROM dbo.Inventory inv
    JOIN @I i ON i.ProductId = inv.ProductId;

    COMMIT;

    SELECT CAST(1 AS BIT) AS Ok,
      @OrderId AS OrderId,
      N'' AS Msg;

    SELECT o.Id,
      o.UserId,
      o.Total,
      o.STATUS,
      o.CreatedAt
    FROM dbo.Orders o
    WHERE o.Id = @OrderId;

    SELECT oi.ProductId,
      oi.Qty,
      oi.UnitPrice
    FROM dbo.OrderItems oi
    WHERE oi.OrderId = @OrderId;
  END TRY

  BEGIN CATCH
    IF XACT_STATE() <> 0
      ROLLBACK;

    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();

    SELECT CAST(0 AS BIT) AS Ok,
      CAST(NULL AS INT) AS OrderId,
      @ErrMsg AS Msg;
  END CATCH
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Order_Get]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[usp_Order_Get] @OrderId INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT o.Id,
    o.UserId,
    o.Total,
    o.STATUS,
    o.CreatedAt
  FROM dbo.Orders o
  WHERE o.Id = @OrderId;

  SELECT oi.ProductId,
    oi.Qty,
    oi.UnitPrice
  FROM dbo.OrderItems oi
  WHERE oi.OrderId = @OrderId;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Product_Get]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_Product_Get] @ProductId INT
AS
BEGIN
  SET NOCOUNT ON;

  SELECT TOP (1) *
  FROM dbo.Products
  WHERE Id = @ProductId;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Product_List]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_Product_List] @Search NVARCHAR(120) = NULL,
  @Page INT = 1,
  @Size INT = 20
AS
BEGIN
  SET NOCOUNT ON;

  IF @Page < 1
    SET @Page = 1;

  IF @Size < 1
    SET @Size = 20;

  DECLARE @Offset INT = (@Page - 1) * @Size;;

  WITH Q
  AS (
    SELECT p.Id,
      p.Name,
      p.Description,
      p.Price,
      p.ImageUrl,
      p.CreatedAt,
      COUNT(1) OVER () AS Total
    FROM dbo.Products p
    WHERE (
        @Search IS NULL
        OR p.Name LIKE N'%' + @Search + N'%'
        )
    )
  SELECT Id,
    Name,
    Description,
    Price,
    ImageUrl,
    CreatedAt,
    Total
  FROM Q
  ORDER BY Id DESC OFFSET @Offset ROWS

  FETCH NEXT @Size ROWS ONLY;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_User_Create]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_User_Create] @Email NVARCHAR(256),
  @PasswordHash NVARCHAR(200)
AS
BEGIN
  SET NOCOUNT ON;

  BEGIN TRY
    INSERT INTO dbo.Users (
      Email,
      PasswordHash
      )
    VALUES (
      @Email,
      @PasswordHash
      );

    SELECT SCOPE_IDENTITY() AS NewUserId,
      CAST(1 AS BIT) AS Ok;
  END TRY

  BEGIN CATCH
    IF ERROR_NUMBER() IN (2601, 2627) -- violation unique
      SELECT NULL AS NewUserId,
        CAST(0 AS BIT) AS Ok;
    ELSE
      THROW;
  END CATCH
END
GO

/****** Object:  StoredProcedure [dbo].[usp_User_GetByEmail]    Script Date: 15/10/2025 00:57:49 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE PROC [dbo].[usp_User_GetByEmail] @Email NVARCHAR(256)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT Id,
    Email,
    PasswordHash,
    CreatedAt
  FROM dbo.Users
  WHERE Email = @Email;
END
GO

/****** Object:  StoredProcedure [dbo].[usp_Product_Create]    Script Date: 15/10/2025 00:57:49 ******/
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

/****** Object:  StoredProcedure [dbo].[usp_Product_Update]    Script Date: 15/10/2025 00:57:49 ******/
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

/****** Object:  StoredProcedure [dbo].[usp_Product_Delete]    Script Date: 15/10/2025 00:57:49 ******/
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

USE [master]
GO

ALTER DATABASE [ShopDb]

SET READ_WRITE
GO


