//let audio;
let cancionActualIndex = 0;
let modoAleatorio = false;
let Bucle = false;

let canciones = [];
let listaDeAudios = {};
let cancionSonando = null; // Variable global para almacenar el objeto Audio que se está reproduciendo actualmente
let barraVolumen = document.getElementById("barraVolumen");
let barraProgreso = document.getElementById("barraProgreso");
let volumenIcono = document.getElementById("volumenIcono");
let imagenSidebar = document.getElementById("imagen-portada");
let duracionCancionBarraProgreso = document.getElementById("duracionCancion");
let btnAgregarCancion = document.getElementById("btnAgregarCancion");
let buscador = document.getElementById("buscador");

let mostrarSoloFavoritos = document.getElementById("mostrarSoloFavoritos");
let mostrarTodas = document.getElementById("mostrarTodas");

cargarCanciones();

async function cargarCanciones() {
  try {
    let datos = await fetch(
      "http://informatica.iesalbarregas.com:7008/songs/",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (datos.ok) {
      // array de canciones
      canciones = await datos.json();
      console.log(canciones);

      let listaCanciones = document.getElementById("listaCanciones");
      listaCanciones.innerHTML = ""; // Limpiar la lista antes de agregar nuevas canciones

      canciones.forEach((cancion) => {
        // Crear el contenedor para cada canción
        let datosDeCadaCancion = document.createElement("div");
        datosDeCadaCancion.classList.add("datosDeCadaCancion");

        // Crear los elementos para el título, artista, duración y botón
        let tituloCancion = document.createElement("h2");
        let artistaCancion = document.createElement("h3");
        let duracionCancion = document.createElement("h3");
        let botonFavorito = document.createElement("button");
        let imagenPortada = document.createElement("img");
        imagenPortada.style.width = "100px";

        // Asignar contenido a los elementos
        tituloCancion.textContent = cancion.title;
        artistaCancion.textContent = cancion.artist;
        imagenPortada.src = cancion.cover; // Asignar la imagen de la portada
        botonFavorito.textContent = "❤️";
        botonFavorito.setAttribute("id", cancion.filepath); // guardamos la ruta de la cancion
        botonFavorito.classList.add("favorito"); // Añadir clase al botón


        // Añadir los elementos al contenedor de la canción
        datosDeCadaCancion.appendChild(imagenPortada);
        datosDeCadaCancion.appendChild(tituloCancion);
        datosDeCadaCancion.appendChild(artistaCancion);
        datosDeCadaCancion.appendChild(duracionCancion);
        datosDeCadaCancion.appendChild(botonFavorito);

        // Añadir el contenedor de la canción a la lista
        listaCanciones.appendChild(datosDeCadaCancion);



        //EVENTO PARA LOCALSTORAGE crea un array donde mete las canciones favoritas
        botonFavorito.addEventListener("click", () => {
          //salta el id de la cancion donde tenemos el filepath de la cancion
          let cancionFavorita = botonFavorito.getAttribute("id");
          console.log("Información del botón: " + cancionFavorita);

          // Obtener la lista de canciones favoritas del localStorage si no existe crea un array vacio que llenaremos y subiremos al local storage
          let favoritas =
            JSON.parse(localStorage.getItem("cancionesFavoritas")) || [];

          // Comprobar si la canción ya está en favoritos
          if (favoritas.includes(cancionFavorita)) {
            // Si ya está, la eliminamos de la lista
            favoritas = favoritas.filter(
              (canciones) => canciones !== cancionFavorita
            );
            botonFavorito.classList.remove("favoritoActivado");
          } else {
            // Si no está, la añadimos
            favoritas.push(cancionFavorita);
            botonFavorito.classList.add("favoritoActivado");
          }

          // Guardar la lista actualizada en localStorage
          localStorage.setItem("cancionesFavoritas", JSON.stringify(favoritas));
        });

        // Al cargar la página, comprobar si las canciones estan en favorita y le pone el corazon rojo
        const favoritas = JSON.parse(localStorage.getItem("cancionesFavoritas")) || [];
        if (favoritas.includes(cancion.filepath)) {
          botonFavorito.classList.add("favoritoActivado");
        }


        datosDeCadaCancion.addEventListener(
          "click",
          ReproducirCancionTocandoElDiv
        );

        // Crear el objeto Audio local
        let audioLocal = new Audio(cancion.filepath);

        listaDeAudios[cancion.filepath] = audioLocal; // Aquí, se está añadiendo una nueva propiedad al objeto listaDeAudios. La clave es cancion.filepath (la ruta del archivo de audio) y el valor es el objeto audioLocal.

        function ReproducirCancionTocandoElDiv() {
          //cancion sonando se inicializa fuera del bucle a null y aqui se le daria el primer valor clicando en el div
          if (cancionSonando) {
            cancionSonando.pause(); // Pausar la canción actual
          }

          console.log(Bucle);


          // Actualizar cancionSonando con el nuevo audio
          cancionSonando = listaDeAudios[cancion.filepath];
          cancionActualIndex = canciones.findIndex(
            (cancion) => cancion.filepath === cancionSonando.src
          );
          imagenSidebar.src = canciones[cancionActualIndex].cover;

          // Comenzar a reproducir la nueva canción
          console.log("Reproducir: " + cancion.filepath);
          cancionSonando.currentTime = 0; // Reiniciar la canción
          cancionSonando.play();
          actualizarBarraProgreso();
          // Iniciar la reproducción de la nueva canción
          barraVolumen.value = 1; // Establecer la barra de volumen al máximo
          cancionSonando.volume = 1;
          cancionSonando.addEventListener("ended", pasarCancionAlTerminar);


          console.log(cancionActualIndex); // Actualizar el índice de la canción actual
        }
        // Intentar obtener la duración de la canción
        setTimeout(function () {
          if (audioLocal.duration) {
            let minutos = Math.floor(audioLocal.duration / 60);
            let segundos = Math.floor(audioLocal.duration % 60);
            duracionCancion.textContent = `${minutos}:${segundos
              .toString()
              .padStart(2, "0")}`; // Asignar la duración de la canción en minutos y segundos
          } else {
            duracionCancion.textContent = "No disponible"; // Mostrar un mensaje de error
          }
        }, 1000); // Esperar 1 segundo antes de intentar obtener la duración
      });
    } else {
      console.error("La respuesta del servidor no fue correcta");
    }
  } catch (error) {
    console.log(error);
  }
}

let btnPausaHeader = document.getElementById("btnPausaHeader");
btnPausaHeader.addEventListener("click", pausarDesdeHeader);

function pausarDesdeHeader() {
  if (cancionSonando) {
    // Si hay una canción sonando, alternar entre play y pause
    cancionSonando.paused ? cancionSonando.play() : cancionSonando.pause();
  } else {
    cancionSonando = listaDeAudios[canciones[cancionActualIndex].filepath]; // Asegúrate de acceder al objeto Audio correcto
    console.log("Reproducir: " + canciones[cancionActualIndex].filepath);
    cancionSonando.currentTime = 0; // Reiniciar la canción
    cancionSonando.play(); // Iniciar la reproducción de la nueva canción
    actualizarBarraProgreso();
    barraVolumen.value = 1; // Establecer la barra de volumen al máximo
    imagenSidebar.src = canciones[cancionActualIndex].cover;
  }
}

let btnPlayPause = document.getElementById("btnPlayPause");
btnPlayPause.addEventListener("click", playPause);


function playPause() {
  if (cancionSonando) {
    // Si hay una canción sonando, alternar entre play y pause
    cancionSonando.paused ? cancionSonando.play() : cancionSonando.pause();
  } else {
    cancionSonando = listaDeAudios[canciones[cancionActualIndex].filepath]; // Asegúrate de acceder al objeto Audio correcto
    console.log("Reproducir: " + canciones[cancionActualIndex].filepath);
    cancionSonando.currentTime = 0; // Reiniciar la canción
    cancionSonando.play();
    actualizarBarraProgreso();
    // Iniciar la reproducción de la nueva canción
    barraVolumen.value = 1; // Establecer la barra de volumen al máximo
    imagenSidebar.src = canciones[cancionActualIndex].cover;
    cancionSonando.addEventListener("ended", pasarCancionAlTerminar);

  }
}

let btnSiguiente = document.getElementById("btnSiguiente");
btnSiguiente.addEventListener("click", siguienteCancionConBoton);

function siguienteCancionConBoton() {
  if (cancionSonando) {
    cancionActualIndex = canciones.findIndex(
      (cancion) => cancion.filepath === cancionSonando.src
    );
    let siguienteIndice = (cancionActualIndex + 1) % canciones.length; // Siguiente índice
    let siguienteCancion = canciones[siguienteIndice];

    cancionSonando.pause();
    cancionSonando = listaDeAudios[siguienteCancion.filepath];
    console.log("Reproducir: " + siguienteCancion.filepath);
    cancionSonando.currentTime = 0; // Reiniciar la canción
    cancionSonando.play();
    actualizarBarraProgreso();
    // Iniciar la reproducción de la nueva canción
    barraVolumen.value = 1; // Establecer la barra de volumen al máximo
    cancionSonando.volume = 1; // Establecer la barra de volumen al máximo
    imagenSidebar.src = siguienteCancion.cover; // Actualizar la imagen de la portada
    cancionActualIndex = siguienteIndice;
    cancionSonando.addEventListener("ended", pasarCancionAlTerminar);

    console.log(cancionActualIndex); // Actualizar el índice de la canción actual
  }
}

let btnAnterior = document.getElementById("btnAnterior");
btnAnterior.addEventListener("click", anteriorCancionConBoton);

function anteriorCancionConBoton() {
  if (cancionSonando) {
    cancionActualIndex = canciones.findIndex(
      (cancion) => cancion.filepath === cancionSonando.src
    );
    let anteriorIndice =
      (cancionActualIndex - 1 + canciones.length) % canciones.length; // Asegura que el índice sea positivo
    let anteriorCancion = canciones[anteriorIndice];

    cancionSonando.pause();
    cancionSonando = listaDeAudios[anteriorCancion.filepath];
    console.log("Reproducir: " + anteriorCancion.filepath);
    cancionSonando.currentTime = 0; // Reiniciar la canción
    cancionSonando.play(); // Iniciar la reproducción de la nueva canción
    barraVolumen.value = 1; // Establecer la barra de volumen al máximo
    cancionSonando.volume = 1; // Establecer la barra de volumen al máximo
    imagenSidebar.src = anteriorCancion.cover; // Actualizar la imagen de la portada
    cancionActualIndex = anteriorIndice; // Actualizar el índice de la canción actual
    cancionSonando.addEventListener("ended", pasarCancionAlTerminar);

    console.log("índice de la canción: " + anteriorIndice); // Mostrar el índice de la nueva canción
  }
}

let btnAleatorio = document.getElementById("aleatorio");
btnAleatorio.addEventListener("click", reproducirCancionAleatoria);

function reproducirCancionAleatoria() {
  //si esta desactivado lo activamos y viceversa
  modoAleatorio = !modoAleatorio;
  console.log("Modo aleatorio: " + modoAleatorio);
  //ponemos el efecto activo al boton si el modo aleatorio esta activo
  btnAleatorio.classList.toggle("active", modoAleatorio);
  //creamos una cancion aleatoria 
  let cancionAleatoria = canciones[Math.floor(Math.random() * canciones.length)];
  console.log("Reproducir: " + cancionAleatoria.filepath);

  //si hay una cancion sonando la pausamos
  if (cancionSonando) {
    cancionSonando.pause();
  }

  //reproducimos la cancion aleatoria
  cancionSonando = listaDeAudios[cancionAleatoria.filepath];
  cancionSonando.currentTime = 0;
  cancionSonando.play();
  cancionSonando.volume = 1;
  barraVolumen.value = 1;
  imagenSidebar.src = cancionAleatoria.cover;
  //reproducimos la cancion aleatoria al terminar
  cancionSonando.addEventListener("ended", pasarCancionAlTerminar);

  cancionActualIndex = canciones.indexOf(cancionAleatoria);
  console.log("índice de la canción: " + cancionActualIndex);
}


let btnBucle = document.getElementById("bucle");
btnBucle.addEventListener("click", reproducirEnBucle);
function reproducirEnBucle() {
  Bucle = !Bucle;
  console.log("Bucle: " + Bucle);

  btnBucle.classList.toggle("active", Bucle);
  if (cancionSonando) {
    cancionSonando.loop = Bucle;
    console.log("Indice de la canción en bucle: " + cancionActualIndex);
  }
}

barraVolumen.addEventListener("input", function () {
  if (cancionSonando) {
    let volumenValue = parseFloat(barraVolumen.value); // Convertir a número
    if (volumenValue === 0) {
      volumenIcono.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (volumenValue <= 0.5) {
      volumenIcono.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      volumenIcono.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    cancionSonando.volume = volumenValue; // Actualizar el volumen de la canción
    console.log("Volumen: " + volumenValue);
  }
});

//modificar por donde va la cancion demiante la barra de progreso
barraProgreso.addEventListener("input", function () {
  if (cancionSonando) {
    let progresoValue = parseFloat(barraProgreso.value); // Convertir a número
    cancionSonando.currentTime =
      (progresoValue / 100) * cancionSonando.duration; // Actualizar el progreso de la canción
    console.log("Progreso: " + progresoValue);
  }
});
function actualizarBarraProgreso() {
  cancionSonando.ontimeupdate = function () {
    let progresoValue =
      (cancionSonando.currentTime / cancionSonando.duration) * 100;
    // Calcular el progreso de la canción
    let duracion = document.getElementById("duracion");
    let currentTime = cancionSonando.currentTime;
    let duration = cancionSonando.duration;

    let minutos = Math.floor(currentTime / 60);
    let segundos = Math.floor(currentTime % 60);

    let durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);

    duracion.innerHTML = `${minutos}:${segundos
      .toString()
      .padStart(2, "0")} / ${durationMinutes}:${durationSeconds
        .toString()
        .padStart(2, "0")}`;
    barraProgreso.value = progresoValue; // Actualizar la barra de progreso
  };
}

document.addEventListener("DOMContentLoaded", function () {
  let acordeonButton = document.getElementById("acordeon");
  let acordeonContent = document.querySelector(".acordeon-content");

  acordeonButton.addEventListener("click", function () {
    // Alternar la visibilidad del contenido del acordeón
    if (
      acordeonContent.style.display === "none" ||
      acordeonContent.style.display === ""
    ) {
      acordeonContent.style.display = "block"; // Mostrar el contenido
    } else {
      acordeonContent.style.display = "none"; // Ocultar el contenido
    }
  });
});

//Abre el pop up
document.getElementById("btnAgregarCancion").addEventListener("click", function () {
  document.getElementById("popup").style.display = "block"; // Mostrar el popup
});
//Cierra el pop up
document.getElementById("closePopup").addEventListener("click", function () {
  document.getElementById("popup").style.display = "none"; // Cerrar el popup
});
//Cierra el pop up si tocas fuera del formulario
document.addEventListener("click", function (event) {
  if (event.target === document.getElementById("popup")) {
    document.getElementById("popup").style.display = "none"; // Cerrar el popup al hacer clic fuera de ella
  }
});
//POST
document.getElementById("formAgregarCancion").addEventListener("submit", async function (event) {
  event.preventDefault();

  // Obtener los valores de los inputs
  const inputAudiomp3 = document.getElementById("inputAudiomp3").files[0];
  const inputTitulo = document.getElementById("inputTitulo").value;
  const inputArtista = document.getElementById("inputArtista").value;
  const inputPortada = document.getElementById("inputPortada").files[0];

  // Validar los campos
  if (!inputAudiomp3 || !inputAudiomp3.name.endsWith(".mp3")) {
    alert("Por favor, selecciona un archivo de canción en formato MP3.");
    return;
  }

  if (inputTitulo.length > 20 || !/^[a-zA-Z\s]*$/.test(inputTitulo)) {
    alert(
      "El título debe tener un máximo de 20 caracteres y solo contener letras y espacios."
    );
    return;
  }
  if (inputArtista.length > 20 || !/^[a-zA-Z\s]*$/.test(inputArtista)) {
    alert(
      "El artista debe tener un máximo de 20 caracteres y solo contener letras y espacios."
    );
    return;
  }
  if (
    !inputPortada ||
    (inputPortada.type !== "image/png" && inputPortada.type !== "image/jpg")
  ) {
    alert(
      "Por favor, selecciona un archivo de portada en formato PNG o JPG."
    );
    return;
  }

  // Crear un objeto FormData para enviar archivos
  const formData = new FormData();
  formData.append("music", inputAudiomp3);
  formData.append("title", inputTitulo);
  formData.append("artist", inputArtista);
  formData.append("cover", inputPortada);

  try {
    const response = await fetch(
      "http://informatica.iesalbarregas.com:7008/upload/",
      {
        method: "POST",
        body: formData, // Enviar el FormData
      }
    );

    if (!response.ok) {
      throw new Error("Error en la respuesta de la red");
    }

    const data = await response.json();
    console.log("Éxito:", data);
    document.getElementById("popup").style.display = "none"; // Cerrar el popup después de enviar
  } catch (error) {
    console.error("Error:", error);
  }
});
async function cargarCancionesFavoritos() {
  // Obtener la lista de canciones favoritas del localStorage
  const favoritas =
    JSON.parse(localStorage.getItem("cancionesFavoritas")) || [];

  // Limpiar la lista antes de agregar nuevas canciones
  let listaCanciones = document.getElementById("listaCanciones");
  listaCanciones.innerHTML = "";

  // Filtrar las canciones que están en el local storage
  const cancionesFavoritas = canciones.filter((cancion) =>
    favoritas.includes(cancion.filepath)
  );

  // Mostrar las canciones favoritas
  cancionesFavoritas.forEach((cancion) => {
    // Crear el contenedor para cada canción
    let datosDeCadaCancion = document.createElement("div");
    datosDeCadaCancion.classList.add("datosDeCadaCancion");

    // Crear los elementos para el título, artista, duración y botón
    let tituloCancion = document.createElement("h2");
    let artistaCancion = document.createElement("h3");
    let duracionCancion = document.createElement("h3");
    let botonFavorito = document.createElement("button");
    let imagenPortada = document.createElement("img");
    imagenPortada.style.width = "100px";

    // Asignar contenido a los elementos
    tituloCancion.textContent = cancion.title;
    artistaCancion.textContent = cancion.artist;
    imagenPortada.src = cancion.cover; // Asignar la imagen de la portada
    botonFavorito.textContent = "❤️";
    botonFavorito.setAttribute("id", cancion.filepath); // Guardamos la ruta de la canción
    botonFavorito.classList.add("favoritoActivado"); // Añadir clase al botón

    // Evento para manejar el clic en el botón de favorito
    botonFavorito.addEventListener("click", () => {
      let cancionFavorita = botonFavorito.getAttribute("id");
      console.log("Información del botón: " + cancionFavorita);

      // Obtener la lista de canciones favoritas del localStorage
      let favoritas =
        JSON.parse(localStorage.getItem("cancionesFavoritas")) || [];

      // Comprobar si la canción ya está en favoritos
      if (favoritas.includes(cancionFavorita)) {
        // Si ya está, la eliminamos
        favoritas = favoritas.filter((c) => c !== cancionFavorita);
        botonFavorito.classList.remove("favoritoActivado");
        botonFavorito.classList.add("favorito");
      } else {
        // Si no está, la añadimos
        favoritas.push(cancionFavorita);
        botonFavorito.classList.add("favoritoActivado");
      }

      // Guardar la lista actualizada en localStorage
      localStorage.setItem("cancionesFavoritas", JSON.stringify(favoritas));
    });

    // Añadir evento para reproducir la canción al hacer clic en el contenedor
    datosDeCadaCancion.addEventListener("click", () => {
      ReproducirCancion(cancion.filepath);
    });

    // Añadir los elementos al contenedor de la canción
    datosDeCadaCancion.appendChild(imagenPortada);
    datosDeCadaCancion.appendChild(tituloCancion);
    datosDeCadaCancion.appendChild(artistaCancion);
    datosDeCadaCancion.appendChild(duracionCancion);
    datosDeCadaCancion.appendChild(botonFavorito);

    // Añadir el contenedor de la canción a la lista
    listaCanciones.appendChild(datosDeCadaCancion);
  });
}

function ReproducirCancion(filepath) {
  if (cancionSonando) {
    cancionSonando.pause(); // Pausar la canción actual
  }

  // Actualizar cancionSonando con el nuevo audio
  cancionSonando = listaDeAudios[filepath];
  cancionActualIndex = canciones.findIndex(
    (c) => c.filepath === cancionSonando.src
  );
  imagenSidebar.src = canciones[cancionActualIndex].cover;

  // Comenzar a reproducir la nueva canción
  console.log("Reproducir: " + filepath);
  cancionSonando.currentTime = 0; // Reiniciar la canción
  cancionSonando.play(); // Iniciar la reproducción de la nueva canción
  barraVolumen.value = 1; // Establecer la barra de volumen al máximo
  cancionSonando.volume = 1;

  cancionSonando.addEventListener("ended", pasarCancionAlTerminar);

  console.log(cancionActualIndex); // Actualizar el índice de la canción actual
}


//Pasar a la siguiente cancion segun si esta en bucle, aleatorio o normal
function pasarCancionAlTerminar() {
  if (Bucle) {
    ReproducirCancion(canciones[cancionActualIndex].filepath);
  } else if (modoAleatorio) {
    ReproducirCancion(canciones[Math.floor(Math.random() * canciones.length)].filepath);
    console.log("Reproducir: " + canciones[Math.floor(Math.random() * canciones.length)].filepath);
  } else {
    cancionActualIndex = (cancionActualIndex + 1) % canciones.length;
    ReproducirCancion(canciones[cancionActualIndex].filepath);
    console.log("Reproducir: " + canciones[cancionActualIndex].filepath);
  }
}



// Evento para mostrar las canciones favoritas
mostrarSoloFavoritos.addEventListener("click", function () {
  mostrarSoloFavoritos.classList.toggle("active");
  mostrarTodas.classList.remove("active");
  cargarCancionesFavoritos();
});

// Evento para mostrar todas las canciones
mostrarTodas.addEventListener("click", function () {
  mostrarTodas.classList.toggle("active");
  mostrarSoloFavoritos.classList.remove("active");
  cargarCanciones();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Función para buscar canciones con evento input de la barra de búsqueda por el nombre de la canción
buscador.addEventListener('input', buscarCanciones);
function buscarCanciones() {
  let busqueda = buscador.value.toLowerCase().trim();
  if (busqueda === "") {
    mostrarCanciones(canciones);
    return;
  }

  //crea un array con las canciones que coincidan con la busqueda
  let cancionesEncontradas = canciones.filter((cancion) => {
    let titulo = cancion.title.toLowerCase();
    
    // Si la búsqueda es de un solo carácter, muestra todas las canciones que lo contienen
    if (busqueda.length === 1) {
      return titulo.includes(busqueda);
    } else {
      // Si la búsqueda es de más de un carácter, muestra solo las canciones que coinciden exactamente con como empieza
      return titulo.startsWith(busqueda);
    }
  });

  if (cancionesEncontradas.length === 0) {
    console.log("No se encontraron canciones que coincidan con la búsqueda.");
  }

  mostrarCanciones(cancionesEncontradas);
}

function mostrarCanciones(canciones) {
  const listaCanciones = document.getElementById('listaCanciones');
  listaCanciones.innerHTML = '';

  canciones.forEach((cancion) => {
    let datosDeCadaCancion = document.createElement("div");
        datosDeCadaCancion.classList.add("datosDeCadaCancion");

        // Crear los elementos para el título, artista, duración y botón
        let tituloCancion = document.createElement("h2");
        let artistaCancion = document.createElement("h3");
        let duracionCancion = document.createElement("h3");
        let botonFavorito = document.createElement("button");
        let imagenPortada = document.createElement("img");
        imagenPortada.style.width = "100px";

        // Asignar contenido a los elementos
        tituloCancion.textContent = cancion.title;
        artistaCancion.textContent = cancion.artist;
        imagenPortada.src = cancion.cover; // Asignar la imagen de la portada
        botonFavorito.textContent = "❤️";
        botonFavorito.setAttribute("id", cancion.filepath); // guardamos la ruta de la cancion
        botonFavorito.classList.add("favorito"); // Añadir clase al botón


        // Añadir los elementos al contenedor de la canción
        datosDeCadaCancion.appendChild(imagenPortada);
        datosDeCadaCancion.appendChild(tituloCancion);
        datosDeCadaCancion.appendChild(artistaCancion);
        datosDeCadaCancion.appendChild(duracionCancion);
        datosDeCadaCancion.appendChild(botonFavorito);

        // Añadir el contenedor de la canción a la lista
        listaCanciones.appendChild(datosDeCadaCancion);
  });
}


// Evento para buscar canciones al escribir en la barra de búsqueda
//barraBusqueda.addEventListener("input", buscarCancione

///////////////////////////////////////////CARGAR LAS CANCIONES EN UNA FUNCION, Y TENER 3 METODOS PARA MOSTRARLAS. UNA DE TODAS OTRO DE FAVORITAS Y OTRO DE BUSCADAS POR NOMBRE