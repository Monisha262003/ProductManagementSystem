using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProductManagement.DataAccess.Models;

namespace ProductManagement.Services.Interfaces
{
    public interface IProductService
    {
        List<Product> GetAll();
        Product? GetById(int id);
        Product Add(Product product);
        bool Update(int id, Product updatedProduct);
        bool Delete(int id);
    }
}
