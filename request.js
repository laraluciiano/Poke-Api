//Funcion para realizar peticion y recuperar recursos a traves de HTTP. Con el fetch utilizamos metodo "then" para menjar
//la respuesta de la solicitud

// realizar solicitudes de red y recuperar datos de una URL específica en forma de objeto JSON. 
//Al llamar a esta función y pasar una URL válida, puedes obtener los datos de la respuesta de la solicitud en otro lugar de tu código

const fetchPokemons = async /*(peticion afuera)funcion debe ser una funcion asincrona y permite el uso de await*/ (url) => { /*envía una
 solicitud de red y devuelve una promesa que se resuelve cuando la respuesta está disponible.*/ 
    const res = await fetch(url); /* respuesta de la solicitud se asigna a la variable res, se convierta en formato JSON*/ 
    const data = await res.json(); /* datos en formato JSON se asignan a la variable data*/
    return data;
};