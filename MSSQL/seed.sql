-- Insertar usuarios de ejemplo
INSERT INTO dbo.Users (Email, PasswordHash) VALUES
('user1@example.com', '$2a$11$examplehash1'),  -- Password: password1
('user2@example.com', '$2a$11$examplehash2');  -- Password: password2

-- Insertar productos de ejemplo
INSERT INTO dbo.Products (Name, Description, Price, ImageUrl) VALUES
('Laptop Gamer', 'Laptop de alta gama para gaming', 1500.00, 'https://example.com/laptop.jpg'),
('Mouse Inalámbrico', 'Mouse ergonómico con batería recargable', 25.00, 'https://example.com/mouse.jpg'),
('Teclado Mecánico', 'Teclado RGB con switches azules', 80.00, 'https://example.com/keyboard.jpg'),
('Monitor 4K', 'Monitor UHD de 27 pulgadas', 400.00, 'https://example.com/monitor.jpg'),
('Auriculares Bluetooth', 'Auriculares con cancelación de ruido', 120.00, 'https://example.com/headphones.jpg');

-- Insertar inventario para los productos
INSERT INTO dbo.Inventory (ProductId, Stock) VALUES
(1, 10),
(2, 50),
(3, 30),
(4, 15),
(5, 20);