# StasiBack
---
## Prerequisites
-   For this proyect you need **nodeJs** and **npm** installed in your computer.
`sudo apt update`
`sudo apt install nodejs `
`sudo apt install npm`

-   Once you got it, update all dependencies with `npm update`

-    You will need a MongoDB Database for this appliation to run correctly, for that I suggest creating one for free in https://www.mlab.com.
-    With the BBDD created, open the file *server*/*datasources.json* and edit the config of "stasidb" with your info
        ```
        "stasidb": {
        "host": "<host.mlab.com>",
        "port": 61527,
        "url": "",
        "database": "databaseName",
        "password": "password",
        "name": "stasidb",
        "user": "user",
        "connector": "mongodb"
        }
        ```
-   run the application with `node .` The Swagger is in http://localhost:3000/explorer

## Functionality
-    There is a full CRUD for the object Empleado where you can create, read, update and delete employees.
-    You can generate PDFs of an employee using the endpoints:
  
  `GET /pdfs/{id}/generatePDFEuropeo`
  
  `GET /pdfs/{id}/generatePDFMetrica`

        These Endpoints generate the PDFs in the server and answer with the name of the file generated.
-   You can download the files with the endpoint
   `GET /pdfs/salida/download/{fileName}`
