'use strict';
var app = require('../../server/server');
var PDFDocument = require ('pdfkit');
var fs = require('fs');
var fonts = {
    normal:'Helvetica',
    bold:'Helvetica-Bold',
    italic:'Helvetica-Oblique'
    };
//Size of A4
var width = 595.28; 
var height = 841.89;

var lineHeight = 14;
var footerLineHeight = 7;
var linesPerPage = parseInt(height/lineHeight);

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
        var actualLine;
        var doc = new PDFDocument({
            size: [width, height], 
            info: {
              Title: 'Curriculum '+empleado.nombre+' '+empleado.apellido,
              Author: 'Metrica Consulting',
            }
          });
        
        //Insertamos el logo de Metrica
        doc.image('./server/static/img/metrica.jpg', 400, 50, {scale : 0.25});
        //Insertamos cabecera
        doc.font(fonts.bold).text('Datos Identificativos', 100, 100);
        
        //Insertamos Los Datos Identificativos
        doc.text('Nombre:',100, 130)
        .moveDown().text('Edad:')
        .moveDown().text('Perfil:')
        .moveDown().text('Experiencia:');

        doc.font(fonts.normal).text(empleado.nombre.substring(0,1)+'.'+empleado.apellido,250, 130)
        .moveDown().text(empleado.edad+' años')
        .moveDown().text(empleado.perfil)
        .moveDown().text(empleado.anyosExperiencia+ ' años');

        //Creamos el rectangulo contenedor
        doc.rect(90, 115, 450, 120).stroke();
        doc.rect(90, 115, 150, 120).stroke();
        
        //Perfil profesional
        doc.font(fonts.bold).text('PERFIL PROFESIONAL',105,260)
           .moveDown()
           .font(fonts.normal).text(empleado.descPerfil+". Tecnológicamente posee experiencia en: "+ enumerarCompetencias(empleado.competenciasTecnicas),{indent:20});
        //Experiencia Profesional
        doc.moveDown()
        .font(fonts.bold).text('EXPERIENCIA PROFESIONAL');
        actualLine = parseInt(doc.y/lineHeight);
        empleado.experiencia.forEach(function(exp, index){
            var altura = 5 + exp.funciones.length;
            checkPageBreak(doc, actualLine, altura)
            doc.moveDown().font(fonts.bold).text(formatDate(exp.fechaOrigen)+"-"+formatDate(exp.fechaFin)+'.'+exp.empresa,{indent:20})
            .text('Puesto: '+exp.puesto,{indent:20})
            .text('Cliente: '+exp.cliente,{indent:20})   
            .text('Funciones:',{indent:20});
            var funciones = exp.funciones.map(function (currentValue, index, array){
                    return currentValue.descripcion;
            });
            doc.font(fonts.normal).list(funciones,{bulletRadius:0.1,textIndent:50});
            actualLine = parseInt(doc.y/lineHeight);
        });
        //Formacion
        actualLine = parseInt(doc.y/lineHeight);
        checkPageBreak(doc, actualLine,2);
        doc.moveDown()
            .font(fonts.bold)
            .text('FORMACION:');
        actualLine = parseInt(doc.y/lineHeight);
        empleado.formacion.forEach(function(f){
            var altura = 3;
            checkPageBreak(doc, actualLine, altura);
            doc.moveDown()
            .font(fonts.normal)
            .text(f.fechaOrigen.getFullYear()+"-"+f.fechaFin.getFullYear()+" ",{indent:20})
            .font(fonts.bold)
            .text(f.titulo+", "+f.institucion+", "+f.pais+".",{indent:20});
            actualLine = parseInt(doc.y/lineHeight);
        });

         //Formacion Complementaria
         doc.moveDown()
         .font(fonts.bold)
         .text('FORMACION COMPLEMENTARIA:');
         actualLine = parseInt(doc.y/lineHeight);
         empleado.formacionComplementaria.forEach(function(fc){
            var altura = 2;
            checkPageBreak(doc, actualLine, altura)
            doc.moveDown()
            .font(fonts.normal)
            .text(fc.fechaOrigen.getFullYear()+"-"+fc.fechaFin.getFullYear()+" ",{indent:20})
            .font(fonts.bold)
            .text(fc.titulacion+", "+fc.pais+".",{indent:20});
            actualLine = parseInt(doc.y/lineHeight);
            });
            //Idiomas
            doc.moveDown()
            .font(fonts.bold)
            .text('IDIOMAS:');
            actualLine = parseInt(doc.y/lineHeight);
            empleado.idiomas.forEach(function(idioma){
                var altura = 2;
                checkPageBreak(doc, actualLine, altura)
                doc.font(fonts.normal).text(idioma.nombre+". "+idioma.nivel,{indent:20});
                actualLine = parseInt(doc.y/lineHeight);
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
        var filename ="Europeo_"+empleado.nombre+empleado.apellido+".pdf";
        filename = formatearFilename(filename);
        var actualLine;
        var doc = new PDFDocument({
            size: [width, height], 
            info: {
              Title: 'Curriculum '+empleado.nombre+' '+empleado.apellido,
              Author: 'Metrica Consulting',
            }
          });
        //Perfil
        doc.font(fonts.bold).fontSize(14).text("PERFIL",150, 80);
        doc.fontSize(12).text(empleado.perfil,220, 80);
        
        doc.text("Candidato",140,100);
        doc.font(fonts.normal).text(empleado.nombre,220,100)
           .moveDown().text(empleado.descPerfil);
        //Experiencia Laboral
        doc.font(fonts.bold).text("Experiencia Laboral",85,200);
        doc.font(fonts.normal).fontSize(10);
        empleado.experiencia.forEach(function (exp){
            doc.text(exp.fechaOrigen.getFullYear()+"-"+exp.fechaFin.getFullYear(),{indent:65});
            doc.text(exp.puesto+"."+exp.cliente,{indent:130,underline:true});
            var funciones = exp.funciones.map(function (currentValue){
                return currentValue.descripcion;
            });
            doc.list(funciones,{bulletRadius:0.1,textIndent:140});
            
        });
        doc.moveDown();
        doc.moveDown();
        //Educacion y Formacion
        doc.font(fonts.bold).fontSize(12).text("Educacion y Formacion",{indent:-22});
        doc.font(fonts.normal).fontSize(10);
        empleado.formacion.forEach(function (f){
            doc.text(f.fechaOrigen.getFullYear()+"-"+f.fechaFin.getFullYear(),{indent:65});
            doc.text(f.titulo,{indent:130});
            doc.text(f.institucion+", "+f.pais+".",{indent:130});
        });
        doc.moveDown();
        //Capacidades y competencias personales
        doc.font(fonts.bold).fontSize(12).text("Capacidades y",{indent:30});
        doc.text("competencias personales",{indent:-33});
        doc.font(fonts.normal).fontSize(11);
        doc.moveDown();
        doc.text("Otro(s) idiomas", {indent:40});
        empleado.idiomas.forEach(function(idioma){
            doc.text("Idioma", {indent:80});
            doc.fontSize(10).text(idioma.nombre,{indent:130});
            doc.moveDown().fontSize(11).text("Autoevaluacion",{indent:40});
            var anchoHeader = doc.x + 130;
            var altoHeader = doc.y - 10;
            doc.font(fonts.bold).fontSize(11).text("Comprension              Habla               Escritura",{indent:160})
                .rect(anchoHeader, altoHeader, 300, 70)
                .rect(anchoHeader, altoHeader,120,70)
                .rect(anchoHeader, altoHeader,180,70).stroke();
                var altoIngles = doc.y;
            doc.font(fonts.normal).fontSize(9).text(" Listening         Reading          Speaking                         Writing",{indent:140})
                .rect(anchoHeader,altoIngles,300,50);


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

      function checkPageBreak(doc, actualLine, altura){
        if ((actualLine + altura) >= (linesPerPage-footerLineHeight)) {
            doc.addPage();
            return true;
        }
        return false;
      }

      function enumerarCompetencias(compeArray){
        var enumComp="";  
        compeArray.forEach(function (competencia){
            enumComp+=competencia.descripcion+", ";
        });
        enumComp = enumComp.substring(0,enumComp.length-2);
        return enumComp;
      }
};
