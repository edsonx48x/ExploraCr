// ════════════════════════════════════════════
// DATOS BASE DE EXPLORACR
// Estos son los lugares que vienen "de fábrica". Los que agregan los
// usuarios NO van aquí: se guardan aparte en el navegador (ver app.js).
//
// Para añadir un lugar fijo, copiá una línea y cambiá los datos:
//   id        número único (no repetir; los de usuarios usan otro rango)
//   cat       'restaurante' | 'cafeteria' | 'hotel' | 'paseo' | 'actividad' | 'turistico'
//   nombre    nombre del sitio
//   desc      descripción corta
//   tag       etiqueta que sale en la tarjeta (con emoji)
//   estrellas calificación de 1 a 5 (selección del equipo)
//   lat, lng  coordenadas aproximadas, para el mapa y las distancias
//   zona      texto de ubicación
//   precio    '₡₡₡', 'Gratis', 'Entrada paga', etc. (los precios cambian, por
//             eso en los sitios de paga se evitan montos)
//   emoji     icono de la tarjeta
//   autor     'Sistema' (así se distinguen de los agregados por usuarios)
//
// OJO: el botón "Llegar" de estos lugares busca por nombre + zona en Google
// Maps, así que aterriza en el sitio real aunque las coordenadas sean
// aproximadas. Si querés afinar un marcador, corregí lat y lng.
// ════════════════════════════════════════════
window.LUGARES_BASE=[
  // ── Restaurantes ──
  {id:1,cat:'restaurante',nombre:'La Esquina de Buenos Aires',desc:'El mejor corte de res de San José. Ambiente familiar y precio justo.',tag:'🍖 Parrilla',estrellas:5,lat:9.9365,lng:-84.0695,zona:'Barrio Escalante, San José',precio:'₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:2,cat:'restaurante',nombre:'Sikwa Restaurante',desc:'Cocina indígena costarricense reinventada con ingredientes nativos.',tag:'🌿 Fusión nativa',estrellas:5,lat:9.9320,lng:-84.0830,zona:'Barrio Otoya, San José',precio:'₡₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:3,cat:'restaurante',nombre:'Cevichería El Marinero',desc:'Ceviche de corvina fresca, patacones y chicharrón de pez. Directo del Pacífico.',tag:'🐟 Mariscos',estrellas:4,lat:9.9770,lng:-84.8330,zona:'Puntarenas Centro',precio:'₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:10,cat:'restaurante',nombre:'Soda Tala',desc:'Soda típica del centro de San José, conocida por su casado: arroz, frijoles, ensalada, tortilla y la proteína del día.',tag:'🍛 Comida típica',estrellas:4,lat:9.9340,lng:-84.0815,zona:'Centro, San José',precio:'₡',emoji:'🍽️',autor:'Sistema'},
  {id:11,cat:'restaurante',nombre:'Mirador Ram Luna',desc:'Restaurante típico en las montañas al sur de San José, con vista al valle. Los miércoles hay noche de marimba y baile típico (confirmá antes de ir).',tag:'🌄 Con vista',estrellas:4,lat:9.8520,lng:-84.0950,zona:'Aserrí, San José',precio:'₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:12,cat:'restaurante',nombre:"Ronny's Place",desc:'Finca con vista al océano cerca de Quepos, famosa por su churrasco y su ceviche de atún.',tag:'🌊 Vista al mar',estrellas:4,lat:9.4050,lng:-84.1500,zona:'Quepos / Manuel Antonio',precio:'₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:13,cat:'restaurante',nombre:'HiR Fine Dining',desc:'Cenas informales de siete tiempos con enfoque de cero desperdicio, en el corazón de Tamarindo.',tag:'🍽️ Menú degustación',estrellas:4,lat:10.3000,lng:-85.8420,zona:'Tamarindo, Guanacaste',precio:'₡₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:14,cat:'restaurante',nombre:'Restaurant Exotica',desc:'Cocina internacional en una terraza con vista a la selva. Su postre Duo Passion es el favorito de la casa.',tag:'🌴 Vista a la selva',estrellas:4,lat:9.1700,lng:-83.6400,zona:'Ojochal, Puntarenas',precio:'₡₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:15,cat:'restaurante',nombre:'Soda El Patty',desc:'Cocina caribeña con jugos de frutas, patties y casados bien servidos, en pleno Limón.',tag:'🥟 Caribeña',estrellas:4,lat:9.9900,lng:-83.0350,zona:'Limón Centro',precio:'₡',emoji:'🍽️',autor:'Sistema'},
  {id:16,cat:'restaurante',nombre:'Mama Gui',desc:'Pasta hecha a mano y trato cercano, cerca de Playa Sámara.',tag:'🍝 Italiana',estrellas:4,lat:9.8800,lng:-85.5300,zona:'Sámara, Guanacaste',precio:'₡₡₡',emoji:'🍽️',autor:'Sistema'},
  {id:17,cat:'restaurante',nombre:"Lola's",desc:'Ensaladas, pizza y cocteles con ambiente surfero frente a Playa Avellanas.',tag:'🍕 Ambiente surfero',estrellas:4,lat:10.3400,lng:-85.8450,zona:'Playa Avellanas, Guanacaste',precio:'₡₡₡',emoji:'🍽️',autor:'Sistema'},

  // ── Cafeterías ──
  {id:18,cat:'cafeteria',nombre:'Cafeoteca',desc:'Café y galería en una casa art déco de los años 50, con 23 cafés de las ocho regiones cafetaleras del país.',tag:'☕ Café de especialidad',estrellas:5,lat:9.9345,lng:-84.0685,zona:'Barrio Escalante, San José',precio:'₡₡',emoji:'☕',autor:'Sistema'},
  {id:19,cat:'cafeteria',nombre:'Alma de Café',desc:'Dentro del Teatro Nacional: espresso y repostería en un salón de pisos de mármol y techos pintados.',tag:'🎭 En el Teatro Nacional',estrellas:5,lat:9.9337,lng:-84.0773,zona:'Centro, San José',precio:'₡₡',emoji:'☕',autor:'Sistema'},
  {id:20,cat:'cafeteria',nombre:'Underground Brew Café',desc:'Café de tueste propio con entrada escondida tras un portón amarillo, en pleno Barrio Escalante.',tag:'🔥 Tueste propio',estrellas:4,lat:9.9358,lng:-84.0690,zona:'Barrio Escalante, San José',precio:'₡₡',emoji:'☕',autor:'Sistema'},
  {id:21,cat:'cafeteria',nombre:'Klika',desc:'Espacio relajado con terraza donde los baristas conversan con gusto sobre métodos de filtrado.',tag:'🌿 Terraza',estrellas:4,lat:9.9340,lng:-84.0580,zona:'Los Yoses, San José',precio:'₡₡',emoji:'☕',autor:'Sistema'},
  {id:22,cat:'cafeteria',nombre:'Café La Mancha',desc:'Café de métodos tradicionales y grano de pequeños productores, en el edificio Steinvorth.',tag:'🏛️ Centro histórico',estrellas:4,lat:9.9340,lng:-84.0805,zona:'Edificio Steinvorth, San José',precio:'₡₡',emoji:'☕',autor:'Sistema'},
  {id:23,cat:'cafeteria',nombre:'Cafe Rico',desc:'Desayunos grandes, café tostado y un salón lleno de libros. A veces se ven perezosos afuera.',tag:'📚 Desayunos',estrellas:4,lat:9.6565,lng:-82.7540,zona:'Puerto Viejo de Talamanca, Limón',precio:'₡₡',emoji:'☕',autor:'Sistema'},
  {id:24,cat:'cafeteria',nombre:'The Bakery',desc:'Pastelería de estilo francés con hojaldres crujientes, además de brunch y almuerzo.',tag:'🥐 Pastelería',estrellas:4,lat:9.6455,lng:-85.1695,zona:'Santa Teresa, Puntarenas',precio:'₡₡₡',emoji:'☕',autor:'Sistema'},
  {id:25,cat:'cafeteria',nombre:'La Sorbetera de Lolo Mora',desc:'Puesto dentro del Mercado Central, famoso por su sorbete de vainilla especiado.',tag:'🍨 Postre típico',estrellas:5,lat:9.9343,lng:-84.0807,zona:'Mercado Central, San José',precio:'₡',emoji:'☕',autor:'Sistema'},

  // ── Hoteles ──
  {id:4,cat:'hotel',nombre:'Nayara Springs',desc:'Villas con piscinas privadas junto a La Fortuna. Lujo en medio del bosque lluvioso.',tag:'♨️ Termales',estrellas:5,lat:10.4655,lng:-84.6400,zona:'La Fortuna, Alajuela',precio:'₡₡₡₡₡',emoji:'🏨',autor:'Sistema'},
  {id:5,cat:'hotel',nombre:'Hotel Bougainvillea',desc:'Jardines tropicales, cancha de tenis y desayuno casero incluido.',tag:'🌺 Jardines',estrellas:4,lat:9.9700,lng:-84.0550,zona:'Santo Domingo, Heredia',precio:'₡₡₡',emoji:'🏨',autor:'Sistema'},
  {id:6,cat:'hotel',nombre:'Arenas del Mar',desc:'Eco-resort frente al Parque Nacional Manuel Antonio. Playa privada.',tag:'🏖️ Eco-resort',estrellas:5,lat:9.3905,lng:-84.1417,zona:'Manuel Antonio, Quepos',precio:'₡₡₡₡₡',emoji:'🏨',autor:'Sistema'},
  {id:26,cat:'hotel',nombre:'Gran Hotel Costa Rica',desc:'Hotel histórico frente al Teatro Nacional, en el corazón de San José.',tag:'🏛️ Histórico',estrellas:4,lat:9.9339,lng:-84.0780,zona:'Centro, San José',precio:'₡₡₡₡',emoji:'🏨',autor:'Sistema'},
  {id:27,cat:'hotel',nombre:'Tabacón Thermal Resort & Spa',desc:'Resort con ríos termales al pie del volcán Arenal.',tag:'♨️ Aguas termales',estrellas:5,lat:10.4800,lng:-84.7270,zona:'La Fortuna, Alajuela',precio:'₡₡₡₡₡',emoji:'🏨',autor:'Sistema'},
  {id:28,cat:'hotel',nombre:'Hotel Belmar',desc:'Hotel de montaña en Monteverde, rodeado de bosque nuboso.',tag:'🌫️ Bosque nuboso',estrellas:4,lat:10.3150,lng:-84.8100,zona:'Monteverde, Puntarenas',precio:'₡₡₡₡',emoji:'🏨',autor:'Sistema'},
  {id:29,cat:'hotel',nombre:'Four Seasons Resort Costa Rica',desc:'Resort sobre el Pacífico en la península de Papagayo, Guanacaste.',tag:'🏖️ Frente al mar',estrellas:5,lat:10.6400,lng:-85.6700,zona:'Península Papagayo, Guanacaste',precio:'₡₡₡₡₡',emoji:'🏨',autor:'Sistema'},

  // ── Paseos (naturaleza) ──
  {id:7,cat:'paseo',nombre:'Volcán Arenal',desc:'Senderismo con vista al volcán, lagunas termales y puentes colgantes.',tag:'🌋 Volcán',estrellas:5,lat:10.4626,lng:-84.7030,zona:'La Fortuna, Alajuela',precio:'Gratis',emoji:'🥾',autor:'Sistema'},
  {id:8,cat:'paseo',nombre:'Parque Nacional Chirripó',desc:'El pico más alto de Costa Rica (3,821 m). Ecosistemas únicos de páramo.',tag:'⛰️ Montañismo',estrellas:5,lat:9.4894,lng:-83.4905,zona:'San Gerardo de Rivas',precio:'$18',emoji:'🥾',autor:'Sistema'},
  {id:9,cat:'paseo',nombre:'Reserva Monteverde',desc:'Puentes colgantes sobre el bosque nuboso, canopy y quetzales.',tag:'🦜 Naturaleza',estrellas:5,lat:10.3000,lng:-84.8167,zona:'Monteverde, Puntarenas',precio:'$25',emoji:'🥾',autor:'Sistema'},
  {id:30,cat:'paseo',nombre:'Parque Nacional Volcán Poás',desc:'Cráter activo con laguna ácida a pocas horas de San José. Conviene reservar y confirmar horarios antes de ir.',tag:'🌋 Cráter',estrellas:5,lat:10.1980,lng:-84.2330,zona:'Poás, Alajuela',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:31,cat:'paseo',nombre:'Parque Nacional Volcán Irazú',desc:'El volcán más alto del país (3,432 m), con cráter principal y una laguna de color verdoso.',tag:'⛰️ Volcán',estrellas:5,lat:9.9795,lng:-83.8520,zona:'Cartago',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:32,cat:'paseo',nombre:'Parque Nacional Manuel Antonio',desc:'Playas de arena blanca, selva y fauna fácil de ver: monos, perezosos y mapaches.',tag:'🐒 Fauna',estrellas:5,lat:9.3920,lng:-84.1360,zona:'Quepos, Puntarenas',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:33,cat:'paseo',nombre:'Parque Nacional Tortuguero',desc:'Canales y selva húmeda en el Caribe norte. Solo se llega en bote o avioneta.',tag:'🐢 Canales',estrellas:5,lat:10.5420,lng:-83.5020,zona:'Tortuguero, Limón',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:34,cat:'paseo',nombre:'Parque Nacional Corcovado',desc:'Selva virgen en la península de Osa, uno de los lugares más biodiversos del país.',tag:'🐆 Biodiversidad',estrellas:5,lat:8.5400,lng:-83.5900,zona:'Península de Osa, Puntarenas',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:35,cat:'paseo',nombre:'Parque Nacional Rincón de la Vieja',desc:'Volcán con fumarolas, pailas de barro hirviendo y senderos entre bosque.',tag:'♨️ Fumarolas',estrellas:5,lat:10.7980,lng:-85.3330,zona:'Liberia, Guanacaste',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:36,cat:'paseo',nombre:'Parque Nacional Cahuita',desc:'Arrecife de coral y sendero costero junto al mar Caribe.',tag:'🪸 Arrecife',estrellas:4,lat:9.7390,lng:-82.8420,zona:'Cahuita, Limón',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:37,cat:'paseo',nombre:'Catarata Río Fortuna',desc:'Caída de unos 70 metros en medio del bosque. Se baja por una larga escalera hasta la poza.',tag:'💧 Catarata',estrellas:5,lat:10.4410,lng:-84.6690,zona:'La Fortuna, Alajuela',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},
  {id:38,cat:'paseo',nombre:'Parque Nacional Marino Ballena',desc:'Playas y arrecifes con la famosa «cola de ballena». Avistamiento de ballenas jorobadas en dos temporadas al año.',tag:'🐋 Ballenas',estrellas:5,lat:9.1480,lng:-83.7320,zona:'Uvita, Puntarenas',precio:'Entrada paga',emoji:'🥾',autor:'Sistema'},

  // ── Actividades ──
  {id:39,cat:'actividad',nombre:'Rafting en el Río Pacuare',desc:'Descenso de aguas bravas entre cañones y selva, con rápidos de clase III y IV. Las salidas parten de Turrialba.',tag:'🚣 Rafting',estrellas:5,lat:9.9050,lng:-83.6840,zona:'Turrialba, Cartago',precio:'Tour pago',emoji:'🧗',autor:'Sistema'},
  {id:40,cat:'actividad',nombre:'Canopy en Monteverde',desc:'Tirolesas y puentes colgantes sobre el bosque nuboso. Parques como Selvatura ofrecen ambas aventuras.',tag:'🪢 Tirolesas',estrellas:5,lat:10.3100,lng:-84.8150,zona:'Monteverde, Puntarenas',precio:'Tour pago',emoji:'🧗',autor:'Sistema'},
  {id:41,cat:'actividad',nombre:'Tirolesas en Arenal',desc:'Canopy entre el bosque tropical y el volcán, a pocos minutos de La Fortuna.',tag:'🪢 Canopy',estrellas:4,lat:10.4700,lng:-84.7000,zona:'La Fortuna, Alajuela',precio:'Tour pago',emoji:'🧗',autor:'Sistema'},
  {id:42,cat:'actividad',nombre:'Surf en Tamarindo',desc:'Olas constantes y escuelas para todos los niveles en una de las playas más conocidas del Pacífico norte.',tag:'🏄 Surf',estrellas:4,lat:10.2990,lng:-85.8410,zona:'Tamarindo, Guanacaste',precio:'Clases de pago',emoji:'🧗',autor:'Sistema'},
  {id:43,cat:'actividad',nombre:'Surf en Santa Teresa',desc:'Playa de olas potentes y ambiente relajado en la península de Nicoya.',tag:'🏄 Surf',estrellas:5,lat:9.6420,lng:-85.1700,zona:'Santa Teresa, Puntarenas',precio:'Clases de pago',emoji:'🧗',autor:'Sistema'},
  {id:44,cat:'actividad',nombre:'Surf en Salsa Brava',desc:'Ola potente sobre arrecife frente a Puerto Viejo. Mejor para surfistas con experiencia.',tag:'🏄 Surf',estrellas:4,lat:9.6535,lng:-82.7530,zona:'Puerto Viejo de Talamanca, Limón',precio:'Gratis',emoji:'🧗',autor:'Sistema'},
  {id:45,cat:'actividad',nombre:'Snorkel y buceo en Bahía Drake',desc:'Salidas en bote hacia la Isla del Caño para snorkel y buceo.',tag:'🤿 Buceo',estrellas:5,lat:8.6850,lng:-83.6700,zona:'Bahía Drake, Puntarenas',precio:'Tour pago',emoji:'🧗',autor:'Sistema'},
  {id:46,cat:'actividad',nombre:'Ciclismo de montaña en Arenal',desc:'Rutas alrededor del Lago Arenal y las coladas de lava de la erupción de 1968.',tag:'🚵 Bicicleta',estrellas:4,lat:10.5150,lng:-84.8700,zona:'Lago Arenal, Guanacaste',precio:'Tour pago',emoji:'🧗',autor:'Sistema'},
  {id:47,cat:'actividad',nombre:'Tour de café en Café Britt',desc:'Recorrido por una finca de café en Heredia: del grano a la taza.',tag:'☕ Tour de café',estrellas:4,lat:10.0230,lng:-84.1190,zona:'Barva, Heredia',precio:'Tour pago',emoji:'🧗',autor:'Sistema'},

  // ── Zonas turísticas ──
  {id:48,cat:'turistico',nombre:'Teatro Nacional',desc:'Teatro inaugurado en 1897 y símbolo cultural de San José. Se visita por dentro o con una función.',tag:'🎭 Cultura',estrellas:5,lat:9.9338,lng:-84.0772,zona:'Centro, San José',precio:'Entrada paga',emoji:'📸',autor:'Sistema'},
  {id:49,cat:'turistico',nombre:'Museo del Oro Precolombino',desc:'Colección de piezas de oro precolombino bajo la Plaza de la Cultura.',tag:'🏺 Museo',estrellas:5,lat:9.9337,lng:-84.0785,zona:'Plaza de la Cultura, San José',precio:'Entrada paga',emoji:'📸',autor:'Sistema'},
  {id:50,cat:'turistico',nombre:'Museo Nacional de Costa Rica',desc:'Museo instalado en el antiguo cuartel Bellavista, con exhibiciones de historia y arqueología.',tag:'🏛️ Museo',estrellas:4,lat:9.9347,lng:-84.0728,zona:'Bellavista, San José',precio:'Entrada paga',emoji:'📸',autor:'Sistema'},
  {id:51,cat:'turistico',nombre:'Mercado Central de San José',desc:'Laberinto de pasillos con sodas, café, artesanías y puestos de toda la vida.',tag:'🛍️ Mercado',estrellas:4,lat:9.9343,lng:-84.0806,zona:'Centro, San José',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:52,cat:'turistico',nombre:'Parque Metropolitano La Sabana',desc:'El «pulmón» de San José: caminatas, lago, deporte y el Museo de Arte Costarricense.',tag:'🌳 Parque',estrellas:4,lat:9.9370,lng:-84.1055,zona:'Mata Redonda, San José',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:53,cat:'turistico',nombre:'Basílica de Nuestra Señora de los Ángeles',desc:'Templo de la patrona de Costa Rica. Cada 2 de agosto miles de peregrinos llegan caminando.',tag:'⛪ Peregrinación',estrellas:5,lat:9.8637,lng:-83.9189,zona:'Cartago',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:54,cat:'turistico',nombre:'Ruinas de Cartago',desc:'Antigua parroquia sin techo, destruida por terremotos y hoy convertida en un jardín abierto.',tag:'🏛️ Ruinas',estrellas:4,lat:9.8645,lng:-83.9195,zona:'Cartago',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:55,cat:'turistico',nombre:'Iglesia de San José de Orosi',desc:'Templo colonial de 1743 en un valle cafetalero, considerado de los más antiguos en uso del país.',tag:'⛪ Colonial',estrellas:4,lat:9.7970,lng:-83.8530,zona:'Orosi, Cartago',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:56,cat:'turistico',nombre:'Jardín Botánico Lankester',desc:'Jardín conocido por su gran colección de orquídeas, a pocos minutos de Cartago.',tag:'🌺 Orquídeas',estrellas:5,lat:9.8390,lng:-83.8870,zona:'Paraíso, Cartago',precio:'Entrada paga',emoji:'📸',autor:'Sistema'},
  {id:57,cat:'turistico',nombre:'Sarchí',desc:'Cuna de la carreta típica, reconocida por la UNESCO, con talleres artesanales y tiendas.',tag:'🎨 Artesanía',estrellas:4,lat:10.0830,lng:-84.3140,zona:'Sarchí, Alajuela',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:58,cat:'turistico',nombre:'Parque de Zarcero',desc:'Jardín de arbustos esculpidos con formas de figuras, frente a una iglesia de fachada colorida.',tag:'🌿 Arte vegetal',estrellas:4,lat:10.1850,lng:-84.3900,zona:'Zarcero, Alajuela',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:59,cat:'turistico',nombre:'Monumento Nacional Guayabo',desc:'Principal sitio arqueológico del país, con calzadas y acueductos precolombinos.',tag:'🗿 Arqueología',estrellas:5,lat:9.9760,lng:-83.6930,zona:'Turrialba, Cartago',precio:'Entrada paga',emoji:'📸',autor:'Sistema'},
  {id:60,cat:'turistico',nombre:'Paseo de los Turistas',desc:'Caminata junto al mar con vista al golfo de Nicoya, helados y puestos de comida.',tag:'🌅 Malecón',estrellas:4,lat:9.9770,lng:-84.8340,zona:'Puntarenas Centro',precio:'Gratis',emoji:'📸',autor:'Sistema'},
  {id:61,cat:'turistico',nombre:'Playa Jacó',desc:'Playa animada del Pacífico central, a unas dos horas de San José, con surf, restaurantes y vida nocturna.',tag:'🏖️ Playa',estrellas:4,lat:9.6150,lng:-84.6290,zona:'Jacó, Puntarenas',precio:'Gratis',emoji:'📸',autor:'Sistema'},
];
