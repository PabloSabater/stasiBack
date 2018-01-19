'use strict';

module.exports = function(Empleado) {

    Empleado.pdf = function(nombre, cb) {

        Empleado.find({where: {nombre: nombre}}, function(err, empleados) {
            console.log(empleados[0]);
        
        
        
        });



        cb(null, 'Greetings... ' + nombre);
      }
  
      Empleado.remoteMethod('pdf', {
            accepts: {arg: 'nombre', type: 'string'},
            returns: {arg: 'greeting', type: 'string'},
            http:{path:'/:nombre/pdf', verb: 'get'}
      });


};
