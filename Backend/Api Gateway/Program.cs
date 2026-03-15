using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200","http://192.168.1.6:4200") 
                  .AllowAnyMethod() 
                  .AllowAnyHeader()
                  .AllowCredentials(); 
        });
});

builder.Configuration.AddJsonFile("Ocelot.json", optional: false, reloadOnChange: true);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOcelot();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowAngularApp");
app.UseAuthorization();
app.UseStaticFiles(); 
app.MapControllers();

app.UseOcelot().Wait();

app.Run();
