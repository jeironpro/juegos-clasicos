const palabras = [
    "Casa",
    "Pasa",
    "Masa",
    "Nasa",
    "Tasa"
];

const centro = document.getElementById("centro");
const lados = document.querySelectorAll(".lado");

function obtenerLetraComun(palabras) {
    if (palabras.length === 0) {
        return null;
    }

    palabras = palabras.map(p => p.toUpperCase());

    const letrasReferencia = new Set(palabras[0]);

    for (let letra of letrasReferencia) {
        if (palabras.every(p => p.includes(letra))) {
            return letra;
        }
    }
    return null;
}

function obtenerOtrasLetras(palabras, letraComun) {
    let letras = new Set();
    
    palabras.forEach(p => {
        p.toLowerCase().split("").forEach(l => letras.add(l));
    });
    
    if (letraComun) {
        letras.delete(letraComun.toLowerCase());
    }
    return Array.from(letras).slice(0, 6);
}

const letraComun = obtenerLetraComun(palabras) ?? "";

centro.innerHTML = `<span class="letra">${letraComun ?? ""}</span>`;

let otrasLetras = obtenerOtrasLetras(palabras, letraComun);

function mostrarLetrasLados() {
    lados.forEach((lado, i) => {
        lado.innerHTML = `<span class="letra">${otrasLetras[i] ?? ""}</span>`;
    });
}

mostrarLetrasLados();

const letras = document.querySelectorAll(".hexagono");
const palabra = document.getElementById("palabra");
const botonBorrar = document.getElementById("borrar");
const botonCambiar = document.getElementById("cambiar");
const botonAplicar = document.getElementById("aplicar");

let letrasHabilitadas = true;

letras.forEach(letra => {
    letra.addEventListener("click", () => {
        if (letrasHabilitadas === false) {
            return;
        }

        const valor = letra.querySelector("span").textContent.toUpperCase();
        palabra.textContent += valor;
    });
});

botonBorrar.addEventListener("click", () => {
    palabra.textContent = palabra.textContent.slice(0, -1);
});

function cambiarOrden(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

botonCambiar.addEventListener("click", () => {
    cambiarOrden(otrasLetras);
    mostrarLetrasLados();
});

function mostrarMensaje(texto, tipo = "") {
    palabra.textContent = "";
    palabra.innerHTML = `<div class="${tipo}">${texto}</div>`;
    botonBorrar.disabled = true;
    botonCambiar.disabled = true;
    botonAplicar.disabled = true;
    letrasHabilitadas = false;

    setTimeout(() => {
        botonBorrar.disabled = false;
        botonCambiar.disabled = false;
        botonAplicar.disabled = false;
        letrasHabilitadas = true;
        palabra.textContent = "";
    }, 3500);
}

function verificarPalabra(p) {
    p = p.toLowerCase();

    if (!p.includes(letraComun.toLowerCase())) {
        mostrarMensaje("La palabra no contiene la letra del centro.", "error");
    } else if (p.length < 3) {
        mostrarMensaje("La palabra debe tener al menos 3 letras.", "error");
    } else if (!palabras.some(palab => palab.toLowerCase() === p)) {
        mostrarMensaje("La palabra no es válida.", "error");
    } else {
        mostrarMensaje("¡Palabra válida!", "exito");
    }
}

botonAplicar.addEventListener("click", () => {
    verificarPalabra(palabra.textContent);
})