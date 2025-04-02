// Variables globales para gestionar el juego
let pajaro, fondo, tuberiaInferior;
let velocity = 0;
let gravity = 0.6;
let jumpPower = -20;
let tuberias = [];
let pipeGap = 100; // Espacio constante entre tuberías
let velocityPipes = 2;
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
	createCanvas(500, 600); //creamos el canvas
	createPipes();//y las pipes iniciales

	//inicializamos neat con una red d 3 input, 1 output y la config
	neat = new neataptic.Neat(3, 1, {
		mutationRate: 0.2, //% d mutacion en cada geneeracion
		popSize: 10, //tamaño d la pop d redes neuronales
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
		//pinta lineas para visualizar los puntos q utilizo d ref
		//stroke('#FFF');
		//line(95, 0, 95, 600); // x izq
		//line(145, 0, 145, 600);// x derecha
		//line(95, pipeHeight, 145, pipeHeight); //punto d "altura d la pipe" q es dnd se posiciona el flappy
	}

	//bool q controla el estado d los flappys
	let allDead = true;

	//iteramos cada individuo de la pop
	for(let genome of neat.population) {
		let flappy = genome.bird; //y almacenamos el flappy d cada uno

		//comprobamos si esta vivo
		if(flappy.estaVivo) {
			allDead = false; //ponemos la bool q controla el estado general a false

			//actualizamos y mostramos el flappy
			flappy.update();
			flappy.show();
			genome.puntuacion ++; //y le sumamos 1 a su puntuación

			//si la puntuación del flappy actual supera el record
			if(genome.puntuacion > bestScore) {
				bestScore = genome.puntuacion; //actualizamos el valor del record con la puntuacion del flappy 
			}
		}
	}

	//si no ha sobrevivido ningun flappy
	if(allDead) {
		nextGeneration(); //creamos una nueva generacion
	}

	//actualiza los datos q se ven en el front
	mostrarDatos();
}

function mostrarDatos() {
	fill('#000');
	textSize(16);
	text(`Generación: ${generation}`, 10, 20);
	text(`Record Total: ${bestScore}`, 10, 40);
	text(`BestBrain: ${bestBrain}`, 10, 60);
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

	console.log('NEat.population', neat.population);
}

function nextGeneration() {
	generation ++; //aumentamos num d gen

	//obtenemos la mejor puntuacion, si el genome es > best,  almacena esa pop (genome)
	//si no, deja la pop q ya tenia en best
	bestBrain = neat.population.reduce( (best, genome) => genome.puntuacion > (best?.puntuacion || 0) ? genome : best, null);
	console.log('Mostrando la mejor red: ', bestBrain);

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
		this.hasJumped = false; //controla si el flappy ya ha saltado sobre la pipe
		this.canJump = false; //controla el doble salto
		this.brain = genome; //asignamos la red neuronal al flappy
	}

	update() {
		// Aplica la gravedad al pájaro
		this.velocity += this.gravity;
		this.y += this.velocity;

 		let inputs = this.getInputs(); //obtenemos los inputs para la red ( eje x, y de la pipe + posicion y del flappy)
		console.log('Inputs: ', inputs);

		let output = this.brain.activate(inputs); //activamos la red neuronal con los inputs y almacenamos su output
		console.log('Output: ', output);

		// + comprobamos si el output es > 0.5 y
		// la flag canJump es true, debe saltar
		if(output > 0.5 && this.canJump) {
			this.velocity = this.jumpPower; //aplicamos el salto
			this.canJump = false; //desactivamos la flag para evitar q de un doble salto
			this.hasJumped = true;
		}

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
                        this.canJump = true;//activamos el salto (con la flag evitamos q pueda hacer doble salto)
						return;
                    } else { //si ha saltado
                        this.canJump = false; //desactivamos la flag
                        this.hasJumped = false; //permitimos q pueda saltar + mantenerse en la siguiente pipe
						return;
                    }
                }
            } else { //si la pipe no esta dnd el flappy (xq flappy esta entre el hueco de las pipes)
                // y si el flappy esta x debajo de la altura de la pipe (  en el hueco)
                if (this.y > pipe.posY) {
                    this.canJump = false;
					return;
                }
            }
        }
	}

	show() {
		// pinta el flappy img, x, y, width, height
		image(pajaro, this.x, this.y, this.ancho, this.alto);
	}

	getInputs() {
		//let closestPipe = tuberias.find(p => p.xStart > this.x) || tuberias[0];
		//console.log('Pipe + cercana: ', closestPipe);

		let closestPipe = tuberias[1];

		for(let pipe of tuberias) {
			if(pipe.xStart > 145 && pipe.xStart <= 145 + pipeGap + pipeWidth) {
				closestPipe = pipe;
			}
		}

		stroke('red');
		line(closestPipe.xStart, 0, closestPipe.xStart, 600);

		return [
			parseInt(this.y.toFixed()), //la posicion actual del flappy en el eje y
			parseInt(closestPipe.xStart.toFixed()), //el valor sin decimales de la posicion x d la pipe + cercana
			parseInt(closestPipe.posY) //el valor d la parte superior d la pipe (en el eje y)
		];
	}
}
