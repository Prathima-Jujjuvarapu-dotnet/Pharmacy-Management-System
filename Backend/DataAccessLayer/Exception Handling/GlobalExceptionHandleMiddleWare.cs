//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;
//using System.Threading.Tasks;

namespace PharmacyManagement.Exception_Handling
{
    public class GlobalExceptionHandleMiddleWare
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionHandleMiddleWare(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var response = context.Response;
            var errorResponse = new { error = exception.Message };

            switch (exception)
            {
                case CustomException:
                    response.StatusCode=(int)HttpStatusCode.BadRequest; break;
                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse = new { error = "An unexpected error occurred." };
                    break;
            }

            var result = JsonSerializer.Serialize(errorResponse);
            await response.WriteAsync(result);
        }

    }
}
