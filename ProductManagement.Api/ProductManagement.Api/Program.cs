using Microsoft.EntityFrameworkCore;
using ProductManagement.DataAccess.Interfaces;
using ProductManagement.DataAccess.Models;
using ProductManagement.DataAccess.Repositories;
using ProductManagement.Services.Interfaces;
using ProductManagement.Services.Services;

var builder = WebApplication.CreateBuilder(args);

//1. Add services to the container.

builder.Services.AddControllers();

// 2. Register DbContext with SQL Server Connection String from appsettings.json
builder.Services.AddDbContext<ProductManagementDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Register Dependency Injection for 3-Tier Architecture (Repository & Service)
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IProductService, ProductService>();

// 4. Enable CORS for Local React Development Origin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactClient");

app.UseAuthorization();

app.MapControllers();

app.Run();
