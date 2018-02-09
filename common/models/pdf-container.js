'use strict';
var app = require('../../server/server');
var PDFDocument = require ('pdfkit');
var fs = require('fs');
var fonts = {
    normal:'Helvetica',
    bold:'Helvetica-Bold',
    italic:'Helvetica-Oblique'
    }
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
            size: 'A4', 
            info: {
              Title: 'Curriculum '+empleado.nombre+' '+empleado.apellido,
              Author: 'Metrica Consulting',
            }
          });
        //Insertamos el logo de Metrica
        doc.image('./server/static/img/metrica.jpg', 400, 50, {scale : 0.25});
        //Insertamos cabecera
        doc.text('Datos Identificativos', 100, 100);
        
        //Insertamos Los Datos Identificativos
        doc.font(fonts.bold).text('Nombre:',100, 130)
        .moveDown().text('Edad:')
        .moveDown().text('Nacionalidad:')
        .moveDown().text('Perfil:')
        .moveDown().text('Experiencia:');

        doc.font(fonts.normal).text(empleado.nombre.substring(0,1)+'.'+empleado.apellido,250, 130)
        .moveDown().text(empleado.edad+' años')
        .moveDown().text(empleado.nacionalidad)
        .moveDown().text(empleado.experiencia[0].puesto)
        .moveDown().text(empleado.anyosExperiencia+ ' años');

        //Creamos el rectangulo contenedor
        doc.rect(90, 115, 450, 150).stroke();
        doc.rect(90, 115, 150, 150).stroke();
        
        //Perfil profesional
        doc.font(fonts.bold).text('PERFIL PROFESIONAL',105,280)
           .moveDown()
           .font(fonts.normal).text(empleado.descPerfil);
        //Experiencia Profesional
        doc.moveDown()
        .moveDown()
        .font(fonts.bold).text('EXPERIENCIA PROFESIONAL');
        empleado.experiencia.forEach(function(exp){
            doc.moveDown().font(fonts.bold).text(formatDate(exp.fechaOrigen)+"-"+formatDate(exp.fechaFin)+'.'+exp.empresa)
               .text('Puesto: '+exp.puesto)
               .text('Cliente: '+exp.cliente)   
               .text('Funciones:');
               var funciones = exp.funciones.map(function (currentValue, index, array){
                    return currentValue.descripcion;
               });
               doc.font(fonts.normal).list(funciones);
        });
        //Formacion
        doc.moveDown()
            .font(fonts.bold)
            .text('FORMACION:');
        empleado.formacion.forEach(function(f){
            doc.moveDown()
            .font(fonts.normal)
            .text(f.fechaOrigen.getFullYear()+"-"+f.fechaFin.getFullYear()+" ")
            .font(fonts.bold)
            .text(f.titulo+" "+f.institucion+","+f.pais+".");
        });

         //Formacion Complementaria
         doc.moveDown()
         .font(fonts.bold)
         .text('FORMACION COMPLEMENTARIA:');
     empleado.formacionComplementaria.forEach(function(fc){
         doc.moveDown()
         .font(fonts.normal)
         .text(fc.fechaOrigen.getFullYear()+"-"+fc.fechaFin.getFullYear()+" ")
         .font(fonts.bold)
         .text(fc.titulacion+", "+fc.pais+".");
     });
    //Formacion Complementaria
    doc.moveDown()
    .font(fonts.bold)
    .text('IDIOMAS:');
     empleado.idiomas.forEach(function(idioma){
        doc.font(fonts.normal).text(idioma.nombre+". "+idioma.nivel);
     });
        



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
        if(mes < 10)mes="0"+mes;
        if(dia < 10)dia="0"+dia;
        filename = ""+dia+mes+anyo+filename;
        return filename;
    }

    function formatDate(date) {
        var monthNames = [
          "Enero", "Febrero", "Marzo",
          "Abril", "Mayo", "Junio", "Julio",
          "Agosto", "Septiembre", "Octubre",
          "Noviembre", "Diciembre"
        ];
      
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
      
        return monthNames[monthIndex] + ' ' + year;
      }
};
