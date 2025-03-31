// Variables globales para gestionar el juego
let pajaro, fondo, tuberiaInferior;
let posPajaroY = 250;
let velocidad = 0;
let gravedad = 0.6;
let fuerzaSalto = -20;
let tuberias = [];
let espacioTuberias = 100; // Espacio constante entre tuberías
let velocidadTuberias = 1;
let cantidadTuberias = 4; // Número de tuberías reutilizables
let anchoTuberia = 50; // Ancho de la imagen de la tubería

// Precarga las imágenes del juego
function preload() {
	fondo = loadImage("/assets/background.png");
	pajaro = loadImage("/assets/flappy.png");
	tuberiaInferior = loadImage("/assets/pipe_bottom.png");
}

// Configuración inicial del juego
function setup() {
	createCanvas(500, 600);
	// Inicializa las tuberías en distintas posiciones
	for (let i = 0; i < cantidadTuberias; i++) {
		tuberias.push(new Tuberia(i * (espacioTuberias + anchoTuberia) + width));
	}
}

// Bucle principal del juego
function draw() {
	background(fondo);

	// Mueve y dibuja cada tubería
	for (let i = 0; i < tuberias.length; i++) {
		tuberias[i].mover();
		tuberias[i].mostrar();
		// Reubica las tuberías cuando salen de la pantalla
		if (tuberias[i].fueraPantalla()) {
			let ultimaX = Math.max(...tuberias.map(t => t.x)); // Encuentra la tubería más a la derecha
			tuberias[i].reiniciar(ultimaX + espacioTuberias + anchoTuberia);
		}

        //TODO: revisar para dar + margen
        if(tuberias[i].x >= 100 && tuberias[i].x <= 140) {
            console.log('La pipe está con el flappy');

            console.log('PosY de la pipe', tuberias[i].posY);
            console.log('PosY de flappy', posPajaroY);

            if(posPajaroY < tuberias[i].posY) {
                console.log('Flappy sobre pipe');
            }
        } else {
            if(posPajaroY > tuberias[i].posY) {
                console.log('Flappy está KO en el hueco entre pipes');
            }
        }
	}   

	// pinta el flappy img, x, y, width, height
	image(pajaro, 100, posPajaroY, 40, 30);
	
	// Aplica la gravedad al pájaro
	velocidad += gravedad;
	posPajaroY += velocidad;

	// Evita que el pájaro caiga fuera de la pantalla
	if (posPajaroY > height - 30) {
		posPajaroY = height - 30;
		velocidad = 0;
	}

}

// Función que detecta cuando se presiona una tecla
function keyPressed() {
	if (key == ' ') {
		velocidad = fuerzaSalto;
        checkCollision();
	}
}

function checkCollision() {

}

//clase para los flappys
class Flappy {

}


// Clase que representa las tuberías
class Tuberia {
	constructor(x) {
		this.x = x;
		this.posY = height - 200;
	}

	// Mueve la tubería hacia la izquierda
	mover() {
		this.x -= velocidadTuberias;
	}

	// Dibuja la tubería en pantalla
	mostrar() {
		image(tuberiaInferior, this.x, this.posY, anchoTuberia, tuberiaInferior.height);
	}

	// Verifica si la tubería ha salido de la pantalla
	fueraPantalla() {
		return this.x < -anchoTuberia;
	}

	// Reposiciona la tubería a la derecha de la pantalla con separación constante
	reiniciar(nuevaX) {
		this.x = nuevaX;
	}
}