PDFDocument = require ('pdfkit');
var fs = require('fs');

doc = new PDFDocument({
    size: 'LEGAL', 
    info: {
      Title: 'Titulo del PDF',
      Author: 'Pablo Sabater',
    }
  });

doc.font('fonts/OpenSans-Regular.ttf')
   .fontSize(25)
   .text('Some text with an embedded font!', 100, 100);

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
    fs.createWriteStream('./salida/TituloDelPDF.pdf')
  )
    .on('finish', function () {
      console.log('PDF closed');
});



doc.end();