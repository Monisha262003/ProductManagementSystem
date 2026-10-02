using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProductManagement.Api.DTOs;
using ProductManagement.DataAccess.Models;
using ProductManagement.Services.Interfaces;

namespace ProductManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;

        public ProductsController(IProductService service)
        {
            _service = service;
        }

        // GET: /api/products -> 200 OK
        [HttpGet]
        public IActionResult GetAll()
        {
            var products = _service.GetAll();
            return Ok(products);
        }

        // GET: /api/products/{id} -> 200 OK or 404 Not Found (AC-08)
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var product = _service.GetById(id);
            if (product == null)
                return NotFound(new { message = $"Product with ID {id} not found." });

            return Ok(product);
        }

        // POST: /api/products -> 201 Created or 400 Bad Request (AC-01, AC-02, AC-03)
        [HttpPost]
        public IActionResult Create([FromBody] ProductDto dto)
        {
            try
            {
                var product = new Product
                {
                    ProductName = dto.ProductName,
                    Category = dto.Category,
                    Price = dto.Price,
                    StockQuantity = dto.StockQuantity
                };

                var created = _service.Add(product);
                return CreatedAtAction(nameof(GetById), new { id = created.ProductId }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: /api/products/{id} -> 204 No Content, 400 Bad Request, or 404 Not Found (AC-04)
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] ProductDto dto)
        {
            try
            {
                var updatedProduct = new Product
                {
                    ProductId = id,
                    ProductName = dto.ProductName,
                    Category = dto.Category,
                    Price = dto.Price,
                    StockQuantity = dto.StockQuantity
                };

                bool exists = _service.Update(id, updatedProduct);
                if (!exists)
                    return NotFound(new { message = $"Product with ID {id} not found." });

                return NoContent(); // 204 No Content as required by SRS Section 7
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: /api/products/{id} -> 204 No Content or 404 Not Found (AC-05)
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            bool deleted = _service.Delete(id);
            if (!deleted)
                return NotFound(new { message = $"Product with ID {id} not found." });

            return NoContent(); // 204 No Content as required by SRS Section 7
        }
    }
}

