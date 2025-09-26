import express, { type Request, Response, NextFunction } from "express";
import { resolve } from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedTemplates } from "./scripts/seedTemplates";

const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: false, limit: '500mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Add headers to control embedding. Use a valid CSP frame-ancestors directive.
  // Note: frame-ancestors supersedes X-Frame-Options; do not set both.
  res.header(
    'Content-Security-Policy',
    "frame-ancestors 'self' http://localhost:* https://*.replit.dev https://*.replit.com"
  );
  
  // Allow local preview access
  if (req.path === '/preview') {
    return res.sendFile(resolve(process.cwd(), 'preview.html'));
  }
  
  // Allow access guide
  if (req.path === '/access-guide') {
    return res.sendFile(resolve(process.cwd(), 'access-guide.html'));
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed templates on startup
  await seedTemplates();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Clean port binding with error handling
  const startServer = () => {
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Space Child server successfully started on port ${port}`);
      console.log(`🌐 Access your app at: http://localhost:${port}`);
      log(`serving on port ${port}`);
    });
  };

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is busy. Retrying in 2 seconds...`);
      setTimeout(() => {
        server.close();
        startServer();
      }, 2000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
  
  startServer();
})();
