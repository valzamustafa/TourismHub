using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace TourismHub.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class StripeTestController : ControllerBase
    {
        private readonly ILogger<StripeTestController> _logger;

        public StripeTestController(ILogger<StripeTestController> logger)
        {
            _logger = logger;
        }

        [HttpGet("status")]
        public IActionResult GetStripeStatus()
        {
            try
            {
                var hasApiKey = !string.IsNullOrEmpty(StripeConfiguration.ApiKey);
                var keyLength = StripeConfiguration.ApiKey?.Length ?? 0;
                var keyPrefix = hasApiKey ? StripeConfiguration.ApiKey?.Substring(0, Math.Min(20, keyLength)) + "..." : "No key";

                var isTestKey = hasApiKey && StripeConfiguration.ApiKey?.StartsWith("sk_test_") == true;
                var isLiveKey = hasApiKey && StripeConfiguration.ApiKey?.StartsWith("sk_live_") == true;
                
                string environment;
                if (!hasApiKey)
                {
                    environment = "NOT CONFIGURED";
                }
                else if (isTestKey)
                {
                    environment = "TEST";
                }
                else if (isLiveKey)
                {
                    environment = "LIVE";
                }
                else
                {
                    environment = "UNKNOWN";
                }

                return Ok(new
                {
                    success = true,
                    stripe = new
                    {
                        configured = hasApiKey,
                        apiKeyLength = keyLength,
                        apiKeyPrefix = keyPrefix,
                        isTestKey = isTestKey,
                        isLiveKey = isLiveKey,
                        environment = environment
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Stripe status");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            try
            {
                if (string.IsNullOrEmpty(StripeConfiguration.ApiKey))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Stripe API key is not configured",
                        fix = "Add 'Stripe:SecretKey' to appsettings.json"
                    });
                }

                var balanceService = new BalanceService();
                var balance = await balanceService.GetAsync();

                return Ok(new
                {
                    success = true,
                    balance = new
                    {
                        livemode = balance.Livemode,
                        environment = balance.Livemode ? "LIVE" : "TEST",
                        available = balance.Available?.Select(b => new
                        {
                            amount = b.Amount,
                            currency = b.Currency.ToUpper(),
                            formatted = $"{(b.Amount / 100m):C2}",
                            sourceTypes = b.SourceTypes
                        }),
                        pending = balance.Pending?.Select(b => new
                        {
                            amount = b.Amount,
                            currency = b.Currency.ToUpper(),
                            formatted = $"{(b.Amount / 100m):C2}",
                            sourceTypes = b.SourceTypes
                        }),
                        connectReserved = balance.ConnectReserved?.Select(b => new
                        {
                            amount = b.Amount,
                            currency = b.Currency.ToUpper(),
                            formatted = $"{(b.Amount / 100m):C2}"
                        })
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe error getting balance");
                return BadRequest(new
                {
                    success = false,
                    error = "Stripe API Error",
                    message = ex.Message,
                    stripeError = new
                    {
                        type = ex.StripeError?.Type,
                        code = ex.StripeError?.Code,
                        message = ex.StripeError?.Message,
                        param = ex.StripeError?.Param
                    },
                    apiKeyInfo = new
                    {
                        configured = !string.IsNullOrEmpty(StripeConfiguration.ApiKey),
                        length = StripeConfiguration.ApiKey?.Length ?? 0,
                        prefix = StripeConfiguration.ApiKey?.Substring(0, Math.Min(30, StripeConfiguration.ApiKey?.Length ?? 0)) + "...",
                        startsWithTest = StripeConfiguration.ApiKey?.StartsWith("sk_test_") ?? false,
                        startsWithLive = StripeConfiguration.ApiKey?.StartsWith("sk_live_") ?? false
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "General error getting balance");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("create-intent")]
        public async Task<IActionResult> CreateTestPaymentIntent([FromBody] CreateTestIntentRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(StripeConfiguration.ApiKey))
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Stripe API key is not configured"
                    });
                }

                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(request.Amount * 100),
                    Currency = request.Currency.ToLower(),
                    PaymentMethodTypes = new List<string> { "card" },
                    Description = $"Test payment from TourismHub - {request.Description}",
                    Metadata = new Dictionary<string, string>
                    {
                        { "test", "true" },
                        { "createdAt", DateTime.UtcNow.ToString("O") },
                        { "purpose", "Stripe integration test" }
                    }
                };

                var service = new PaymentIntentService();
                var paymentIntent = await service.CreateAsync(options);

                return Ok(new
                {
                    success = true,
                    message = "Test payment intent created successfully",
                    paymentIntent = new
                    {
                        id = paymentIntent.Id,
                        clientSecret = paymentIntent.ClientSecret,
                        amount = paymentIntent.Amount,
                        currency = paymentIntent.Currency.ToUpper(),
                        status = paymentIntent.Status,
                        description = paymentIntent.Description,
                        created = paymentIntent.Created,
                        livemode = paymentIntent.Livemode
                    },
                    nextSteps = new
                    {
                        frontend = "Use clientSecret with Stripe.js",
                        testing = "Test with card number 4242 4242 4242 4242",
                        verify = $"Check intent at: https://dashboard.stripe.com/test/payments/{paymentIntent.Id}"
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe error creating test intent");
                return BadRequest(new
                {
                    success = false,
                    error = "Stripe Error",
                    message = ex.Message,
                    stripeError = new
                    {
                        type = ex.StripeError?.Type,
                        code = ex.StripeError?.Code,
                        message = ex.StripeError?.Message
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "General error creating test intent");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("intent/{id}")]
        public async Task<IActionResult> GetPaymentIntent(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(StripeConfiguration.ApiKey))
                {
                    return BadRequest(new { success = false, error = "Stripe API key is not configured" });
                }

                var service = new PaymentIntentService();
                var paymentIntent = await service.GetAsync(id);
                var chargeService = new ChargeService();
                var charges = await chargeService.ListAsync(new ChargeListOptions
                {
                    PaymentIntent = id,
                    Limit = 10
                });

                return Ok(new
                {
                    success = true,
                    paymentIntent = new
                    {
                        id = paymentIntent.Id,
                        amount = paymentIntent.Amount,
                        currency = paymentIntent.Currency,
                        status = paymentIntent.Status,
                        clientSecret = paymentIntent.ClientSecret,
                        description = paymentIntent.Description,
                        created = paymentIntent.Created,
                        livemode = paymentIntent.Livemode,
                        metadata = paymentIntent.Metadata,
                        paymentMethod = paymentIntent.PaymentMethodId,
                        latestCharge = paymentIntent.LatestChargeId,
                        charges = charges.Data.Select(c => new
                        {
                            id = c.Id,
                            amount = c.Amount,
                            currency = c.Currency,
                            status = c.Status,
                            paid = c.Paid,
                            refunded = c.Refunded,
                            description = c.Description
                        })
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (StripeException ex) when (ex.Message.Contains("No such payment_intent"))
            {
                return NotFound(new { success = false, error = $"Payment intent '{id}' not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting payment intent {id}");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
        [HttpPost("refund")]
        public async Task<IActionResult> CreateTestRefund([FromBody] CreateTestRefundRequest request)
        {
            try
            {
                var refundService = new RefundService();
                var refundOptions = new RefundCreateOptions
                {
                    PaymentIntent = request.PaymentIntentId,
                    Amount = request.Amount.HasValue ? (long?)(request.Amount.Value * 100) : null,
                    Reason = request.Reason
                };

                var refund = await refundService.CreateAsync(refundOptions);

                return Ok(new
                {
                    success = true,
                    message = "Test refund created successfully",
                    refund = new
                    {
                        id = refund.Id,
                        amount = refund.Amount,
                        currency = refund.Currency,
                        status = refund.Status,
                        reason = refund.Reason,
                        paymentIntentId = refund.PaymentIntentId,
                        chargeId = refund.ChargeId,
                        created = refund.Created
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe error creating refund");
                return BadRequest(new
                {
                    success = false,
                    error = "Stripe Error",
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "General error creating refund");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
        [HttpGet("products")]
        public async Task<IActionResult> GetTestProducts()
        {
            try
            {
                var productService = new ProductService();
                var products = await productService.ListAsync(new ProductListOptions
                {
                    Limit = 10,
                    Active = true
                });

                var priceService = new PriceService();
                var prices = await priceService.ListAsync(new PriceListOptions
                {
                    Limit = 10,
                    Active = true
                });

                return Ok(new
                {
                    success = true,
                    products = products.Data.Select(p => new
                    {
                        id = p.Id,
                        name = p.Name,
                        description = p.Description,
                        active = p.Active,
                        metadata = p.Metadata,
                        created = p.Created
                    }),
                    prices = prices.Data.Select(p => new
                    {
                        id = p.Id,
                        productId = p.ProductId,
                        unitAmount = p.UnitAmount,
                        currency = p.Currency,
                        recurring = p.Recurring != null ? new
                        {
                            interval = p.Recurring.Interval,
                            intervalCount = p.Recurring.IntervalCount
                        } : null,
                        type = p.Type
                    }),
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
        [HttpPost("webhook-test")]
        public IActionResult TestWebhookSignature([FromBody] WebhookTestRequest request)
        {
            try
            {
       
                return Ok(new
                {
                    success = true,
                    message = "Webhook test endpoint ready",
                    receivedData = new
                    {
                        length = request?.JsonData?.Length ?? 0,
                        hasSignature = !string.IsNullOrEmpty(request?.StripeSignature)
                    },
                    instructions = new
                    {
                        production = "Use EventUtility.ConstructEvent with webhook secret",
                        testing = "Configure webhook in Stripe Dashboard",
                        endpoint = "POST /api/webhook/stripe"
                    },
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in webhook test");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpGet("validate-key")]
        public IActionResult ValidateApiKey()
        {
            try
            {
                var key = StripeConfiguration.ApiKey;
                
                if (string.IsNullOrEmpty(key))
                {
                    return Ok(new
                    {
                        success = false,
                        valid = false,
                        error = "API key is empty or null",
                        fix = "Add 'Stripe:SecretKey' to appsettings.json"
                    });
                }

                var trimmedKey = key.Trim();
                var isValidLength = trimmedKey.Length >= 50 && trimmedKey.Length <= 150;
                var startsWithTest = trimmedKey.StartsWith("sk_test_");
                var startsWithLive = trimmedKey.StartsWith("sk_live_");
                var hasInvalidChars = trimmedKey.Any(c => char.IsWhiteSpace(c) || c == '\n' || c == '\r' || c == '\t');

                return Ok(new
                {
                    success = true,
                    valid = isValidLength && (startsWithTest || startsWithLive) && !hasInvalidChars,
                    details = new
                    {
                        length = trimmedKey.Length,
                        isValidLength = isValidLength,
                        startsWithTest = startsWithTest,
                        startsWithLive = startsWithLive,
                        hasInvalidChars = hasInvalidChars,
                        first20Chars = trimmedKey.Substring(0, Math.Min(20, trimmedKey.Length)) + "...",
                        last20Chars = "..." + trimmedKey.Substring(Math.Max(0, trimmedKey.Length - 20)),
                        environment = startsWithTest ? "TEST" : startsWithLive ? "LIVE" : "UNKNOWN"
                    },
                    recommendations = hasInvalidChars ? "Remove whitespace/newlines from key" : null,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating API key");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
    }

    public class CreateTestIntentRequest
    {
        public decimal Amount { get; set; } = 10.00m;
        public string Currency { get; set; } = "usd";
        public string Description { get; set; } = "TourismHub Test Payment";
    }

    public class CreateTestRefundRequest
    {
        public string PaymentIntentId { get; set; } = string.Empty;
        public decimal? Amount { get; set; }
        public string Reason { get; set; } = "requested_by_customer";
    }

    public class WebhookTestRequest
    {
        public string JsonData { get; set; } = string.Empty;
        public string StripeSignature { get; set; } = string.Empty;
    }
}