import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Eldercare API",
      version: "1.0.0",
      description: "Automatically generated API documentation page based on the jsdocs comments. This page allows you to test your code on a a development server",
    },
    servers: [{ url: "http://localhost:3001" }],
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
            id: {
              type: "integer",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            profile_picture_url: {
              type: "string",
            },
            gender: {
              type: "string",
            },
            date_of_birth: {
              type: "string",
              format: "date-time",
            },
            language: {
              type: "string",
            },
          },
        },
        UserCreate: {
          type: "object",
          required: ["name", "email", "password", "date_of_birth"],
          properties: {
            name: {
              type: "string",
              maxLength: 255,
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 255,
            },
            password: {
              type: "string",
              minLength: 12,
              maxLength: 255,
              pattern: "(?=.*[A-Z])(?=.*[!@#$%^&*()])",
            },
            date_of_birth: {
              type: "integer",
            },
            gender: {
              type: "string",
              enum: ["0", "1"],
            },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            date_of_birth: {
              type: "string",
              format: "date-time",
            },
            gender: {
              type: "string",
            },
            language: {
              type: "string",
            },
          },
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: ["./controllers/**/*.js"],
};

export const initSwagger = (app) => {
  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true
  }));
}