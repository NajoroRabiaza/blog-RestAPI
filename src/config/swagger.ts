import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blog RestAPI",
      version: "1.0.0",
      description:
        "API RESTful de blog personnel avec Node.js, TypeScript, Express et PostgreSQL",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Serveur de developpement",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            username: { type: "string" },
            role: { type: "string", enum: ["AUTHOR", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Article: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            slug: { type: "string" },
            content: { type: "string" },
            published: { type: "boolean" },
            publishedAt: { type: "string", format: "date-time", nullable: true },
            views: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            content: { type: "string" },
            articleId: { type: "integer" },
            authorId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["fail", "error"] },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);