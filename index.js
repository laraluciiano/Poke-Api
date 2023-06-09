const pokemonsContainer  = document.querySelector("#caja")
const loader = document.querySelector(".pokeballs-container")

//URL ESPECIFICA
//Objeto con dos propiedades
const appState = {
/*1° = Especifico un limite de 9 pokemones y desplazamiento de 0. Realizar solicitudes de datos y se actualiza a medida
 que se cargan más pokémones.*/
    currentURL: "https://pokeapi.co/api/v2/pokemon/?limit=9&offset=0",
//2° = Inicio el fetch con el valor FALSE (en este momento no se esta realizando ninguna solicitud de datos)
//A medida que se realizan solicitudes, actualizo el valor a TRUE
    isFetching: false, 
}

//SOLICITUD A POKEAPI
const getPokemonsData = async () => {
/* función externa que se espera que realice una solicitud a la API y devuelva los datos de los pokémones en formato JSON. 
La respuesta de esta solicitud se asigna a una variable desestructurada { NEXT, RESULTS }, lo que significa que extrae 
las propiedades next y results de la respuesta.*/
   const {next, results} = await fetchPokemons(appState.currentURL);
   /*Propiedad NEXT = obtener la siguiente página de resultados de pokémones. Se asigna a appState.currentURL, 
   actualizando así la URL actual con la URL de la siguiente página.*/
   appState.currentURL = next;

   /*Propiedad RESULTS = array que contiene los datos de los pokémones obtenidos en la solicitud. A continuación, 
   se utiliza el método MAP para crear un nuevo array pokemonDataUrls que contiene las URL individuales de cada pokémon.*/
   const pokemonDataUrls = results.map((pokemon) => { /*array de urls*/
    return pokemon.url
   })

//Promise All = múltiples solicitudes a las URL de los pokémones y esperar a que se completen todas
   const pokemonsData = await Promise.all(
    /*Uso método MAP en pokemonDataUrls para crear un nuevo array de promesas. 
    Cada promesa realiza una solicitud a la URL de un pokémon utilizando la función FETCH. 
    La respuesta de cada solicitud se convierte a formato JSON utilizando el método json(). 
    El resultado final es un array de promesas que se espera que se resuelvan en paralelo.*/
    pokemonDataUrls.map (async (url)=> {
        const nextPokemonsData = await fetch(url);
        return await nextPokemonsData.json();
    })
   );
    /*Cuando todas las promesas se resuelven, el resultado se almacena en la variable pokemonsData. 
    Este resultado es un array que contiene los datos individuales de cada pokémon en formato JSON.*/
   return pokemonsData;
}

//Tomo un objeto (pokemon) y extraigo datos para formar un nuevo objeto con info. especifica.
const pokemonTemplate = (pokemon) => {
    return {
        img: pokemon.sprites.other.home.front_default,
        name: pokemon.name.toUpperCase(),
        experience: pokemon.base_experience,
        types: pokemon.types,
        id: pokemon.id,
        height: pokemon.height / 10,
        weight: pokemon.weight / 10,
    }
}

//Tomo un array de tipos de un pokemon y genero un codigo HTML representando los tipos como elementos "span" con la clase correspondiente.
const createTypeSpan = (types) =>{
    //Utiliza el método MAP en el array types para iterar sobre cada elemento del array y realizar una transformación en ellos.
    return types.map ((tipo) => {
    /*Dentro de la función de mapeo, se utiliza una función flecha para tomar cada elemento del array types y 
    generar un elemento <span> correspondiente con la clase y el nombre del tipo de pokémon.*/
    //Tiene una clase "tipo.type.name" significa que la clase del elemento ser ale nombre del tipo del pokemon
        return `<span class="${tipo.type.name} poke__type">${tipo.type.name}</span>`
    //Utilizar "join" para unir todos los elementos generados en una sola cadena de texto, sin separador entre ellos.
    }).join("")

}

//Objeto (pokemon) y uso la funcion pokemonTemplate para obtener la info especifica
//Utilizo esa info para generar un codigo HTML que representa una tarjeta de pokemon.
const pokemonCardTemplate = (pokemon) => {
    const {img, name, experience, types, id, height, weight} = pokemonTemplate (pokemon)
    return `
    <div class="poke">
		<img src="${img}" />
		<h2>${name}</h2>
		<span class="exp">EXP: ${experience}</span>
		<div class="tipo-poke">${createTypeSpan(types)}</div>
		<p class="id-poke">#${id}</p>
		<p class="height">Height: ${height}m</p>
		<p class="weight">Weight: ${weight}Kg</p>
	</div>
    `
}

//Funcion flecha que recibe un array "pokemonList" como argumento y se encarga de renderizas la lista de pokemones
const renderPokemonList = (pokemonList) => {
    //Llamo a la funcion pokemonCardTemplate pasando el pokemon actual como argumento.
    //Utilizar MAP en el array para iterar sobre cada elemento del array y hacer una transformacion en ellos
    pokemonsContainer .innerHTML += pokemonList.map((pokemon) => {
    //resultado de pokemonCardTemplate se agrega al contenido existente del pokemonsContainer, concatenandolos (+=)
        return pokemonCardTemplate(pokemon)
    //Unir elementos generados en una sola cadena de texto
    }).join("")
}

//Funcion asincrona que toma una funcion renderingFunction como argumento, se encarga de cargar y renderizar los datos y la funcion
const loadAndRenderPokemons = async (renderingFunction) =>{
    //Declaro variable, await junto getPokemonsData para esperar a que resuelva la promesa devuelta por esa funcion
    //Es decir, la ejecucion se detendra en este punto hasta que getPokemonsData complete su ejecucion y devuelva un resultado
    const pokemonsData = await getPokemonsData();
    //llamo a la funcion renderingFunction pasando pokemonsData como argumento, esta espera que realice el renderizado de los datos de los pokemones
    //Se pasa pokemonsData para que la funcion pueda acceder a los datos y mostrarlos de alguna manera
    renderingFunction(pokemonsData);
};

//MOSTRAR POKEBALLS CARGANDO
//Tomo como argumento pokemonList, lista de pokemones que se desea renderizar en respuesta al scroll 
const renderOnScroll = (pokemonList) => {
    //Metodo CLASSLIST TOGGLE para alternar la clase show, si la clase esta presenta la elimino y sino la agrega(osea mostrar u ocultar)
    loader.classList.toggle("show");
    //SETTIMEOUT programa una tarea que se va a ejecutar despues de x tiempo
    setTimeout(() => {
    //Nuevamente el mismo metodo para volver a su estado original despues de cierto tiempo mostrado
        loader.classList.toggle("show");
    //Realizo renderizado de los pokemones, se pasa pokemonList como argumento para que pueda renderizar los pokmones
        renderPokemonList(pokemonList)
    //Indica que la operacion de carga finalizo y ya no se obtienen mas datos, esto evita multiples solicitudes de carga al mismo tiempo
        appState.isFetching = false;
//Retardo de 1500 milisegundos y elimino el indicador de carga (pokeballs)
    },1500)

}

//VERIFICACION FINAL DE PAGINA
const isEndOfPage = () => {
//Desestructuro de objetos para extraer tres propiedades del objeto document.documentElement, scrollTop y demas.
//scrollTop (DA) = posición de desplazamiento actual
//clientHeight (AV) = altura visible del contenido
//scrollHeight (AT) = altura total del contenido
             //DA,       AV,           AT
    const {scrollTop, clientHeight, scrollHeight} = document.documentElement;
//Comprueba si la posicion actual del DA mas AV del contenido es mayor o igual  a AT menos 2 PIXELES
    const bottom = scrollTop + clientHeight >= scrollHeight - 2;
//True = usuario llego al final ya que el DA + AV es >= AT
//FALSE = usuario no alcanzo el final ya que seria <= AT
    return bottom;
}

//CARGAR MAS POKEMONES CUANDO SE LLEGO AL FINAL DE LA PAGINA
//Funcion asincrona que se encarga de cargar y renderizar PROXIMOS pokemones al final de la pagina mediante desplazamiento.
const loadNextPokemon = async () => {
//Condicional if con dos condiciones
    if(isEndOfPage && !appState.isFetching) {
//1° = se evalua "isEndOfPage"  determinando si llego o no al final de la pagina, true = pasa a la siguiente condicion
//2° = appState.isFetching verifica si es false, si es true (osea que no hay ninguna solicitud) pasa a la siguiente parte del codigo

//isFetching pasa a ser true para indicar que se hace una operacion de carga
        appState.isFetching = true;
//carga los datos de los proximos pokemones y llama a renderOnScroll para mostrar los nuevos pokemones luego de la carga
        loadAndRenderPokemons(renderOnScroll);
    }
}

//FUNCION AL CARGAR LA PAGINA
function init() {
//Cargo y muestro pokemones iniciales 
    window.addEventListener("DOMContentLoaded", async () => 
        await loadAndRenderPokemons(renderPokemonList)
    );
//Detecto cuando se realiza un desplazamiento t cargar mas pokemones
    window.addEventListener("scroll", async () => {
        await loadNextPokemon()
    })
}

//INICIO LA APLICACION
init();