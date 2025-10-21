import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Grocery Store API',
            version: '1.0.0',
            description: 'API for the Grocery Store application',
            contact: {
                name: 'Sashmita Mahapatros',
                email: "sashmita.mahapatros@gmail.com",
            }
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Local Development Server',
            },
            {
                url: 'http://192.168.1.36:4000',
                description: 'Network Server',
            },
        ],
        components: {
            securitySchemes:{
                cookieAuth :{
                    type :'apiKey',
                    in:'cookie',
                    name:'token'
                }
            }
        },
        security:[
            {
                cookieAuth :[]
            }
        ]
    },
    apis: [
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../controllers/*.js')
    ],
};

const specs = swaggerJSDoc(options);

export {specs,swaggerUi};