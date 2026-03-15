using Microsoft.EntityFrameworkCore;
using PharmacyManagement.Data;
using Microsoft.AspNetCore.Identity;
using PharmacyManagement.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using PharmacyManagement.Exception_Handling;
using Serilog;
using PharmacyManagement.Logs_Service;
using PharmacyManagement.EmailNotifications;
using AuthService.Service;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<Pharmacy>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Pharmacy")));
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
LogService.ConfigureSerilog();
builder.Host.UseSerilog();
// Configure DbContext with the custom User model

builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISuperAdmin,SuperAdminRepository>();
builder.Services.AddDataProtection();
builder.Services.AddMemoryCache();


// Add other necessary services
builder.Services.AddControllers();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"])),

            
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
    });




builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("DrugAdminPolicy", policy =>
        policy.RequireRole("DrugAdmin"));
    options.AddPolicy("SupplierAdminPolicy", policy =>
        policy.RequireRole("SupplierAdmin"));
    options.AddPolicy("OrderAdminPolicy", policy =>
        policy.RequireRole("OrderAdmin"));
    options.AddPolicy("PaymentAdmin", policy =>
    policy.RequireRole("PaymentAdmin"));
    options.AddPolicy("SalesAdmin", policy =>
    policy.RequireRole("SalesAdmin"));
    options.AddPolicy("SuperAdminPolicy", policy =>
    policy.RequireRole("SuperAdmin"));
});
               


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RoleBasedAuthMicroservice",
        Version = "v1",
        Description = "An ASP.NET Core Web API for Auth Microservices",
        Contact = new OpenApiContact
        {
            Name = "Prathima",
            Email = "prathima@gmail.com",
            Url = new Uri("https://yourwebsite.com")
        }
    });
    
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer <your_token>'"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
           new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseMiddleware<GlobalExceptionHandleMiddleWare>();


app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles(); 
app.MapControllers();
app.UseSerilogRequestLogging();
// This allows serving files from wwwroot
app.Run();
