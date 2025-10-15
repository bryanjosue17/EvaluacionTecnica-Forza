// File: OrderSvc/Models/OrderDtos.cs
namespace OrderSvc.Models
{
    public class CheckoutItemDto
    {
        public int ProductId { get; set; }
        public int Qty { get; set; }
    }

    public class CheckoutResult
    {
        public bool Ok { get; set; }
        public int? OrderId { get; set; }
        public string Msg { get; set; } = "";
    }

    public class OrderHeader
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public decimal Total { get; set; }
        public string Status { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }

    public class OrderItemRow
    {
        public int ProductId { get; set; }
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public record AddItemReq(int ProductId, int Qty, decimal UnitPrice, string? Name);
    public record UpdateQtyReq(int Qty);
}
