// Variables globales para gestionar el juego
let pajaro, fondo, tuberiaInferior;
let velocity = 0;
let gravity = 0.6;
let jumpPower = -20;
let tuberias = [];
let pipeGap = 100; // Espacio constante entre tuberías
let velocityPipes = 1.8 ;
let numPipes = 4; // Número de tuberías reutilizables
let pipeWidth = 50; // Ancho de la imagen de la tubería
let canJump = true;
let neat;
let pruebaFlappy, pipeHeight;
let bestScore = 0;
let generation = 0;
let bestBrain = null;

// Precarga las imágenes del juego
function preload() {
	fondo = loadImage("/assets/background.png");
	pajaro = loadImage("/assets/flappy.png");
	tuberiaInferior = loadImage("/assets/pipe_bottom.png");
}

// Configuración inicial del juego
function setup() {
	createCanvas(500, 600);
	createPipes();
	//pruebaFlappy = new Flappy();

	//inicializamos neat con una red d 3 input, 1 output y la config
	neat = new neataptic.Neat(3, 1, {
		mutationRate: 0.2, //% d mutacion en cada geneeracion
		popSize: 50, //tamaño d la pop d redes neuronales
		elitism: 2, //num d individuos q se preservan sin cambios
		mutationAmount: 2 //num d mutaciones aplicadas a cada individuo
	});

	resetGame();
}

function createPipes() {
	// Inicializa las tuberías en distintas posiciones
	for (let i = 0; i < numPipes  ; i++) {
		tuberias.push(new Tuberia(200 * i));
	}
	pipeHeight = (tuberias[0].posY - 32);
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
			let ultimaX = Math.max(...tuberias.map(t => t.xStart + pipeWidth));
			tuberias[i].reiniciar(ultimaX + pipeGap + pipeWidth);
		}

		/* if (pruebaFlappy.estaVivo) {
			pruebaFlappy.puntuacion++;
		} else {
			console.log('Flappy esta muerto');
			setTimeout(resetGame, 200);
		} */

		//pinta lineas para visualizar los puntos q utilizo d ref
		//stroke('#FFF');
		//line(95, 0, 95, 600); // x izq
		//line(145, 0, 145, 600);// x derecha
		//line(95, pipeHeight, 145, pipeHeight); //punto d "altura d la pipe" q es dnd se posiciona el flappy
	}

	let allDead = true;

	for(let genome of neat.population) {
		let flappy = genome.bird;
		
		if(flappy.estaVivo) {
			console.log('genome.bird VIVO', flappy);
			allDead = false;
			flappy.update();
			flappy.show();
			genome.puntuacion ++;

			if(genome.puntuacion > bestScore) {
				bestScore = genome.puntuacion;
			}
		}
	}

	//pruebaFlappy.checkCollision();

	// pinta la img del flappy
	//pruebaFlappy.show();
	// Aplica la gravedad al flappy
	//pruebaFlappy.update();

	/* if (pruebaFlappy.puntuacion > bestScore) {
		bestScore = pruebaFlappy.puntuacion;
	} */

	//mostrarDatos();
}

function mostrarDatos() {
	fill('#000');
	textSize(16);
	text(`Flappy y: ${pruebaFlappy.y.toFixed(1)}`, 10, 20);
	text(`Velocidad: ${velocity.toFixed(1)}`, 10, 40);
	text(`canJump: ${canJump}`, 10, 60);
	text(`Puntuación Flappy: ${pruebaFlappy.puntuacion}`, 10, 80);
	text(`Record Total: ${bestScore}`, 10, 100);
}

function resetGame() {
	//eliminamos pipes y las volvemos a crear
	tuberias = [];
	createPipes();

/* 	pruebaFlappy.y = 200; // colocamos el flappy en su y inicial
    pruebaFlappy.velocity = 0; //reiniciamos la velocidad
    pruebaFlappy.estaVivo = true; //para q el flappy esté vivo
    pruebaFlappy.puntuacion = 0; //reiniciamos la puntuación
    pruebaFlappy.hasJumped = false; //reiniciamos el estado de salto */

	for( let genome of neat.population) {
		genome.y = 200; //colocamos el flappy en su y inicial
		genome.estaVivo = true; //para q el flappy esté vivo
		genome.puntuacion = 0; //reiniciamos la puntuación
		genome.hasJumped = false;//reiniciamos el estado de salto
		genome.bird = new Flappy(genome); //creamos un nuevo flappy para cada individuo
	}
}

// Función que detecta cuando se presiona una tecla
function keyPressed() {
	if (key == ' ' && canJump) {
		pruebaFlappy.velocity = pruebaFlappy.jumpPower;
		canJump = false;

		pruebaFlappy.hasJumped = true;
	}
}

function nextGeneration() {
	neat.evolve(); //evolucionamos la pop usando neat
	resetGame();//reiniciamos con la nueva gen
}

// Clase que representa las tuberías
class Tuberia {
	constructor(lastX) {
		this.xStart = lastX + pipeGap;
		this.posY = height - 200;
	}

	// Mueve la tubería hacia la izquierda
	mover() {
		this.xStart -= velocityPipes  ;
	}

	// Dibuja la tubería en pantalla
	mostrar() {
		image(tuberiaInferior, this.xStart, this.posY, pipeWidth, tuberiaInferior.height);
	}

	// Verifica si la tubería ha salido de la pantalla
	fueraPantalla() {
		return this.xStart < -pipeWidth;
	}

	// Reposiciona la tubería a la derecha de la pantalla con separación constante
	reiniciar(nuevaX) {
		this.xStart = nuevaX;
	}
}

//clase para los flappys
class Flappy {
	constructor(genome) {
		this.x = 100; //posicion inicial en el eje x
		this.y = 200; //inicial en el eje y
		this.alto = 30;
		this.ancho = 40;
		this.velocity = velocity;
		this.gravity = gravity;
		this.jumpPower = jumpPower;
		this.puntuacion = 0; //para luego seleccionar los mejores
		this.estaVivo = true; //para ver si esta vivo o no (si cae entre los huecos)
		this.hasJumped = false; //controla si el flappy ya ha saltado sobre la tuberia
		this.brain = genome; //asignamos la red neuronal al flappy
	}

	update() {
		// Aplica la gravedad al pájaro
		this.velocity += this.gravity;
		this.y += this.velocity;

		//TODO: añadir getInputs y obtenerlos para activar la red neuronal con ellos
 		let inputs = this.getInputs();
		//let output = this.brain.activate(inputs);

		// + comprobar salida si >.5 salta

		this.checkCollision();
	}

	checkCollision() {
		//console.log('Dentro de checkCollision flappy');
		 // Comprueba colisión con el suelo
		if (this.y > height - 30) {
            this.y = height - 30;
            this.velocity = 0;
            this.estaVivo = false;
            return;
        }

		// comprobamos la colisión con las pipes
        for (let i = 0; i < tuberias.length; i++) {
            const pipe = tuberias[i];
            
            // Comprueba si la pipe está en el espacio del flappy (95-145px del canvas)
            if (pipe.xStart + pipeWidth >= 95 && pipe.xStart <= 145) {
                this.pipeHeight = pipe.posY - 32; // Actualiza la altura de la tubería

                //si el flappy esta x encima de la pipe (en el eje y)
                if (this.y < pipe.posY) {
					//si no ha saltado aun y esta sobre la pipe
                    if (this.y >= this.pipeHeight && !this.hasJumped) {
                        this.y = this.pipeHeight; //lo mantenemos "estatico" sobre la altura d la pipe
                        this.velocity = 0;//paramos la caida
                        canJump = true;//activamos el salto (con la flag evitamos q pueda hacer doble salto)
                    } else { //si ha saltado
                        canJump = false; //desactivamos la flag
                        this.hasJumped = false; //permitimos q pueda saltar + mantenerse en la siguiente pipe
                    }
                }
            } else { //si la pipe no esta dnd el flappy (xq flappy esta entre el hueco de las pipes)
                // y si el flappy esta x debajo de la altura de la pipe (  en el hueco)
                if (this.y > pipe  .posY) {
                    canJump = false;
                }
            }
        }
	}

	show() {
		// pinta el flappy img, x, y, width, height
		image(pajaro, this.x, this.y, this.ancho, this.alto);
	}

	getInputs() {
		let closestPipe = tuberias.find(p => p.x > this.x) || tuberias[0];
		console.log('Pipe + cercana: ', closestPipe);
	}
}
