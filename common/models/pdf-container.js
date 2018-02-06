'use strict';
var app = require('../../server/server');
var PDFDocument = require ('pdfkit');
var fs = require('fs');

module.exports = function(Pdfcontainer) {
    
    Pdfcontainer.remoteMethod('generatePDFMetrica', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'generado', type: 'object',root:true},
        http:{path:'/:id/generatePDFMetrica', verb: 'get'}
    });
    
    Pdfcontainer.remoteMethod('generatePDFEuropeo', {
        accepts: {arg: 'id', type: 'string'},
        returns: {arg: 'generado', type: 'object',root:true},
        http:{path:'/:id/generatePDFEuropeo', verb: 'get'}
    });



    Pdfcontainer.generatePDFMetrica = function(id,cb){
        var Empleado = app.models.Empleado;
        Empleado.findOne({where: {id: id}}, function(err, empleado) {
            if (empleado == null){
                var err = new Error("El empleado que busca no existe");
                err.statusCode = 404;
                err.name="Employee Id Not Found";
                delete err.stack;
                cb(err);   
            }else{
                var filename = generarPDFMetrica(empleado);
                cb(null, {generado:true,filename:filename});
            }
        });
    }

    Pdfcontainer.generatePDFEuropeo = function(id,cb){
        var Empleado = app.models.Empleado;
        Empleado.findOne({where: {id: id}}, function(err, empleado) {
            if (empleado == null){
                var err = new Error("El empleado que busca no existe");
                err.statusCode = 404;
                err.name="Employee Id Not Found";
                delete err.stack;
                cb(err);   
            }else{
                var filename = generarPDFEuropeo(empleado);
                cb(null, {generado:true,filename:filename});
            }
        });
    }



    function generarPDFMetrica(empleado){
        var filename ="Metrica_"+empleado.nombre+empleado.apellido+".pdf";
        filename = formatearFilename(filename);
        var doc = new PDFDocument({
            size: 'LEGAL', 
            info: {
              Title: 'Curriculum '+empleado.nombre+' '+empleado.apellido,
              Author: 'Metrica Consulting',
            }
          });

        doc.moveTo(50,50)
            .fontSize(10)
            .text("Esto es una prueba");

        doc.addPage()
           .fontSize(8)
           .text('Here is some vector graphics...', 100, 100);
        
        doc.save()
           .moveTo(100, 150)
           .lineTo(100, 250)
           .lineTo(200, 250)
           .fill("#FF3300");
        
        doc.scale(0.6)
           .translate(470, -380)
           .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
           .fill('red', 'even-odd')
           .restore();
        
        doc.addPage()
           .fillColor("blue")
           .text('Here is a link!', 100, 100)
           .link(100, 100, 160, 27, 'http://google.com/');
        
        doc.moveTo(200, 200)       // this is your starting position of the line, from the left side of the screen 200 and from top 200
           .lineTo(400, 200)       // this is the end point the line 
           .dash(5, { space: 10 }) // here we are formatting it to dash
           .text("Esto es un texto chulo", 410, 195) // the text and the position where the it should come
            doc.moveTo(500, 200)   //again we are giving a starting position for the text
           .lineTo(800, 200)       //end point
           .dash(5, {space: 10})   //adding dash
           .stroke() 
        
        doc.pipe(
            fs.createWriteStream('./files/salida/'+filename)
          )
            .on('finish', function () {
              console.log("El fichero "+filename+" ha sido creado");
            });
        doc.end();
        return filename;
    
    };

    function generarPDFEuropeo(empleado){
        var filename = "Europeo_"+empleado.nombre+empleado.apellido+".pdf";
        filename = formatearFilename(filename);
        var doc = new PDFDocument({
            size: 'LEGAL', 
            info: {
                Title: 'Curriculum '+empleado.nombre+' '+empleado.apellido,
                Author: 'Metrica Consulting',
            }
          });

        doc.addPage()
           .fontSize(25)
           .text('Here is some vector graphics...', 100, 100);
        
        doc.save()
           .moveTo(100, 150)
           .lineTo(100, 250)
           .lineTo(200, 250)
           .fill("#FF3300");
        
        doc.scale(0.6)
           .translate(470, -380)
           .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
           .fill('red', 'even-odd')
           .restore();
        
        doc.addPage()
           .fillColor("blue")
           .text('Here is a link!', 100, 100)
           .link(100, 100, 160, 27, 'http://google.com/');
        
        doc.moveTo(200, 200)       // this is your starting position of the line, from the left side of the screen 200 and from top 200
           .lineTo(400, 200)       // this is the end point the line 
           .dash(5, { space: 10 }) // here we are formatting it to dash
           .text("Esto es un texto chulo", 410, 195) // the text and the position where the it should come
            doc.moveTo(500, 200)   //again we are giving a starting position for the text
           .lineTo(800, 200)       //end point
           .dash(5, {space: 10})   //adding dash
           .stroke() 
        
        doc.pipe(
            fs.createWriteStream('./files/salida/'+filename)
          )
            .on('finish', function () {
              console.log("El fichero "+filename+" ha sido creado");
        });
        doc.end();
        return filename;
    };

    function formatearFilename(filename){
        
        var fechaCreacion = new Date();
        var dia = fechaCreacion.getDate();
        var mes = fechaCreacion.getMonth()+1;
        var anyo = fechaCreacion.getFullYear();
        if(mes< 10)mes="0"+mes;
        filename = ""+dia+mes+anyo+filename;
        return filename;
    }

};
