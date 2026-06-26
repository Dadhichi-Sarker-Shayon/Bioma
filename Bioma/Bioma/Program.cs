var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Define the Cross-Origin Resource Sharing policy for the React application
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Your exact Vite frontend port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddControllers();
builder.Services.AddSingleton<Bioma.Services.DatabaseService>();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();

app.MapControllers();

app.Run();
