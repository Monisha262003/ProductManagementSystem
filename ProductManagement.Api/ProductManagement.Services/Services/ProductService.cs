using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProductManagement.DataAccess.Interfaces;
using ProductManagement.DataAccess.Models;
using ProductManagement.Services.Interfaces;

namespace ProductManagement.Services.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;

        // Predefined allowed categories from SRS Section 3 & 6
        private static readonly string[] AllowedCategories =
        {
            "Electronics", "Grocery", "Clothing", "Other"
        };

        public ProductService(IProductRepository repository)
        {
            _repository = repository;
        }

        public List<Product> GetAll() => _repository.GetAll();

        public Product? GetById(int id) => _repository.GetById(id);

        public Product Add(Product product)
        {
            ValidateProduct(product);

            product.ProductName = product.ProductName.Trim();
            product.Category = AllowedCategories.First(c => c.Equals(product.Category.Trim(), StringComparison.OrdinalIgnoreCase));

            return _repository.Add(product);
        }

        public bool Update(int id, Product updatedProduct)
        {
            var existingProduct = _repository.GetById(id);
            if (existingProduct == null)
                return false; // Triggers 404 Not Found in Controller (AC-08)

            ValidateProduct(updatedProduct);

            existingProduct.ProductName = updatedProduct.ProductName.Trim();
            existingProduct.Category = AllowedCategories.First(c => c.Equals(updatedProduct.Category.Trim(), StringComparison.OrdinalIgnoreCase));
            existingProduct.Price = updatedProduct.Price;
            existingProduct.StockQuantity = updatedProduct.StockQuantity;

            _repository.Update(existingProduct);
            return true;
        }

        public bool Delete(int id)
        {
            var existingProduct = _repository.GetById(id);
            if (existingProduct == null)
                return false; // Triggers 404 Not Found in Controller

            _repository.Delete(existingProduct);
            return true;
        }

        // Centralized Business Rule Validator (SRS Section 6: AC-02 & AC-03)
        private void ValidateProduct(Product product)
        {
            if (string.IsNullOrWhiteSpace(product.ProductName))
                throw new ArgumentException("Product name is required and cannot be empty.");

            if (product.ProductName.Trim().Length > 100)
                throw new ArgumentException("Product name cannot exceed 100 characters.");

            if (string.IsNullOrWhiteSpace(product.Category) ||
                !AllowedCategories.Any(c => c.Equals(product.Category.Trim(), StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException("Category must be one of: Electronics, Grocery, Clothing, or Other.");
            }

            if (product.Price <= 0)
                throw new ArgumentException("Price must be greater than zero.");

            if (product.StockQuantity < 0)
                throw new ArgumentException("Stock quantity cannot be negative.");
        }
    }
}
