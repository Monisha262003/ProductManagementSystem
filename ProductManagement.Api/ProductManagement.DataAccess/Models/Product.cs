using System;
using System.Collections.Generic;

namespace ProductManagement.DataAccess.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public string Category { get; set; } = null!;

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }
}
