using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProductManagement.DataAccess.Models;

namespace ProductManagement.DataAccess.Interfaces
{
    public interface IProductRepository
    {
        List<Product> GetAll();
        Product? GetById(int id);
        Product Add(Product product);
        void Update(Product product);
        void Delete(Product product);
    }
}
