/*
	Variables a utilizar.
	card es un objeto 3D.
	fotos es un array con las texturas cargadas de cada una de las imágenes almacenadas.
	imgUrls y folderUrl son los nombres de las imágenes a cargar y su directorio, respectivamente.
	needsChange indica cuándo se debe cambiar la imagen del plano de imagen.
	counter almacena el índice de la imagen a mostrar.
*/

var renderer, scene, camera, mesh, card, fotos;
var needsChange, counter;
var folderUrl = 'textures/';
var imgUrls = ['thats.png','the.jpg','look.jpg','its.jpg','tha.jpg','book.jpg','da.jpg','luke.jpg','of.jpg','love.jpg'];


function init() {

	/* Obtenemos el canvas HTML del documento HTML*/
    var canvas = document.getElementById("dibujar");
	
	/* Creamos el renderizador de WEBGL con el canvas obtenido */
	renderer = new THREE.WebGLRenderer({canvas:canvas});

	/* Cambiamos el tamaño del renderizador al tamaño y ancho de la pantalla */
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	// Color de fondo para sobreescribir el predeterminado
	var colorScene = new THREE.Color("white");

    // Creamos la escena
    scene = new THREE.Scene();
	
	// Asignamos color a la escena
	scene.background = colorScene;
    
    // Camara en perspectiva para visualizar correctamente el plano. Cuanto más alto es el fov más se visualiza verticalmente.
    camera = new THREE.PerspectiveCamera( 40, window.innerWidth/ window.innerHeight , 1, 1000 );
	
	// Se dispone la posición para ver el plano desde uno de sus ángulos.
    camera.position.z = 400;
    camera.lookAt(scene.position);
	
	// Obtenemos el vídeo desde el documento HTML.
	video = document.getElementById( 'video' );
	
	/* Creamos una geometría de plano con anchura y altura fijas en el eje X e Y respectivamente */
   	var geometry = new THREE.PlaneGeometry(240,120);
	
    // Convertimos el vídeo a una textura.
	texture = new THREE.VideoTexture(video);

	// The default is THREE.LinearFilter, which takes the four closest texels and bilinearly interpolates among them
	texture.minFilter = THREE.LinearFilter;

	// Inicializamos array de texturas para fotos
	fotos = [];

	// Por cada foto que haya en el array de nombres, creamos una textura con dicha foto.
	// Haremos que horizontal y verticalmente realize un Clamp To Edge para que ocupe la totalidad de la foto.
	// Las imágenes no son potencia de dos, por lo que aplicamos, tal y como en el vídeo, el filtro LinearFilter a ambos filtros (para texeles mayores de un pixel y para texeles menores).
	for(let i=0;i<imgUrls.length;i++)
	{
		fotos.push(new THREE.TextureLoader()
		.setPath(folderUrl)
		.load(imgUrls[i]));
		
		fotos[i].wrapS = THREE.ClampToEdgeWrapping;			
		fotos[i].wrapT = THREE.ClampToEdgeWrapping;
		fotos[i].magFilter = THREE.LinearFilter
		fotos[i].minFilter = THREE.LinearFilter
	}
	
	/* Creamos dos materiales, ambos de caracter básico que no son afectados por la iluminación (que no existe en este ejemplo).
	El primero tendrá como textura el vídeo
	El segundo cogerá la primera textura de foto como punto de inicio, y se rotará cada una en la llamada a la animación.
	El primer material se renderizará en el FrontSide del plano, es decir, por delante,  mientras que el segundo estará en el Backside.
	*/
	var materials = [new THREE.MeshBasicMaterial({map: texture, side: THREE.FrontSide}),
                 new THREE.MeshBasicMaterial({ map:fotos[0] , side: THREE.BackSide})];

	for (var i = 0, len = geometry.faces.length; i < len; i++) {

	// Clonamos cada cara
	var face = geometry.faces[i].clone();
	
	// A esa clonación le damos el index del material 1, que es el segundo material
	face.materialIndex = 1;
	
	// Añadimos la cara al resto de caras
	geometry.faces.push(face);
	
	// faceVertex tiene un array de UV layers para cada cara.
	// faceVertex[0] es un array de UVs de una cara
	geometry.faceVertexUvs[0].push(geometry.faceVertexUvs[0][i]);

	}


	
	
    // Creamos el objeto 3D
    card = new THREE.Object3D();
    scene.add(card);

    // Mallado al que asignamos la geometría y los materiales a renderizar sobre este.
    mesh = new THREE.Mesh(geometry, materials);
    card.add(mesh);
	
	// Inicializamos variables
	needsChange = false;
	counter = 0;	
	card.rotation.y = Math.PI; // Se explica la rotación en el código de animate.
		
	// Comenzamos la animación
	animate();
    
}

/*
	Los objetos 3D poseen el atributo rotation, que nos permite rotar dicho objeto en cualquiera de los tres ejes.
	Esta rotación ocurre con ángulos de Euler, y está expresada en radianes. Lo que implica que 180º = PI (rad)
	Dado que la cara de detrás pertenece a la foto, comenzamos el bucle con la rotación en PI, es decir, con un giro de 180º sobre el eje Y.
	El cambio de foto ocurre en dos partes: Cuando la imagen está finalizando su rotación, se asigna la variable de actualización a True, si no lo estaba.
	Una vez desaparece la imagen y comienza la rotación del video, la imagen cambia. Esto ocurre independientemente de en que parte de la rotación se inicie.

	La actualización de la imagen ocurre cambiando la textura del material secundario que pertenece al mallado, el cual se encontraba en el BackSide de la geometría.
	Tras esto se indica que dicho material necesita actualización.

	Para el funcionamiento de esta función, los valores en radianes no deben sobrepasar PI*2 (360º), por lo que se reinicia la rotación a 0 cuando supera dicho valor,
	este cambio no es apreciado por el ojo humano a las velocidades de rotación que se puedan asignar.
*/
function animate() {


    card.rotation.y += 0.008;
	
	if(!needsChange && card.rotation.y >= Math.PI && card.rotation.y <= (Math.PI + Math.PI/2))
	{
		needsChange = true;
	}
	else if(needsChange && card.rotation.y > (Math.PI + Math.PI/2) && card.rotation.y < (Math.PI*2))
	{
		counter++;
		if(counter >= fotos.length) counter = 0;

		mesh.material[1].map = fotos[counter];
		mesh.material[1].needsUpdate = true;
		needsChange = false;
		
	}

	card.rotation.y = card.rotation.y  >= (Math.PI * 2) ? 0 : card.rotation.y;
	    
    renderer.render( scene, camera );
	
	requestAnimationFrame( animate );
    
}
