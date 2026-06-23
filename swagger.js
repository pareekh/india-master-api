const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IFSC API",
      version: "1.0.0",
      description: "Indian Bank IFSC Code Finder API"
    },
    servers: [
      {
        url: "https://ifsc-api-eb4u.onrender.com"
      }
    ]
  },
  apis: ["./server.js"]
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
