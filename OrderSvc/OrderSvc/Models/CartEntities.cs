// File: OrderSvc/Models/CartEntities.cs
using Microsoft.EntityFrameworkCore;

namespace OrderSvc.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Status { get; set; } = "OPEN"; // OPEN | CHECKED_OUT | CANCELED
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<CartItem> Items { get; set; } = new();
    }

    public class CartItem
    {
        public int Id { get; set; }
        public int CartId { get; set; }
        public Cart? Cart { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; } = "";
        public decimal UnitPrice { get; set; }  // snapshot del precio
        public int Qty { get; set; }
    }
}
