using Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetRooms()
        {
            var tests = new List<Test>
        {
            new Test { Id = 1, Name = "Sala 101" },
            new Test { Id = 2, Name = "Sala 202" }
        };

            return Ok(tests);
        }
    }
}
