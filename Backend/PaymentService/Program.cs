using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PaymentService.Service;
using PharmacyManagement.Data;
using Microsoft.OpenApi.Models;
using PharmacyManagement.Exception_Handling;
using PharmacyManagement.Logs_Service;
using Serilog;
using PharmacyManagement.EmailNotifications;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<Pharmacy>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Pharmacy")));
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
LogService.ConfigureSerilog();
builder.Host.UseSerilog();



builder.Services.AddTransient<IPaymentService, PaymentServiceRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();

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


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseMiddleware<GlobalExceptionHandleMiddleWare>();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseSerilogRequestLogging();

app.Run();
