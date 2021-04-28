import * as Constants from "./constants.js" 

let canvas 
let engine 
let scene 
let camera 

let CURRENT_PLANET_TO_SEARCH = Constants.PLANET_1_NAME

window.onload = startGame 

let assetsManager 
let backgroundMaterial 
let music
let skybox
let score = 0

let inputStates = {} 

let explotionSphere

function startGame() {
  canvas = document.querySelector("#myCanvas") 
  engine = new BABYLON.Engine(canvas, true) 

  scene = createScene() 
  modifySettings() 

  assetsManager = new BABYLON.AssetsManager(scene) 
  loadBackGround(scene) 
  scene.backGroundMaterial = backgroundMaterial 
  scene.assets = {}
  scene.planets = []
  loadPlanets(Constants.TEXTURE_PLANET1,Constants.PLANET_1_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET2,Constants.PLANET_2_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET3,Constants.PLANET_3_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET4,Constants.PLANET_4_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET5,Constants.PLANET_5_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET6,Constants.PLANET_6_NAME) 
  loadUfo() 

  loadAircraft() 
  //loadHologram() 
  loadBackgroundSound()
  loadLaserSound()
  loadExplosionSound()
  loadExplotionParticleSystem()

 // createSuns() 
 createSpaceClouds()

  assetsManager.load()
  setPlanetToSearch()

  assetsManager.onProgress = function (
    remainingCount,
    totalCount,
    lastFinishedTask
  ) {
    let text =
      "We are preparing the space. " +
      remainingCount +
      " out of " +
      totalCount +
      " items still need to be loaded." 
    engine.loadingUIText = text 

    console.log(text) 
  } 

  assetsManager.onFinish = function (tasks) {
    engine.runRenderLoop(() => {
      let aircraft = scene.getMeshByName(Constants.AIRCRAFT_MESH_NAME) 
      if (aircraft) {
        aircraft.moveWithCollisions(
          aircraft.frontVector.multiplyByFloats(
            aircraft.speed,
            aircraft.speed,
            aircraft.speed
          )
        ) 
        aircraft.fireLasers() 

        aircraft.move() 
      }
      if (scene) {
        rotatePlanets()
        scene.render() 
      }
    }) 
  } 
}

function rotatePlanets() {
  for (let i = 0; i < scene.planets.length; i++) {
    scene.planets[i].rotate(BABYLON.Axis.Y, Math.PI / 30);
  }
}

function createSpaceClouds() {
	    var sphereSpark = BABYLON.MeshBuilder.CreateSphere("sphereSpark", {diameter: 0.4, segments:60}, scene);
  sphereSpark.position = new  BABYLON.Vector3(5,0,5);
  sphereSpark.scaling = new  BABYLON.Vector3(2, 2, 2);
	    sphereSpark.isVisible = false;
	    BABYLON.ParticleHelper.CreateFromSnippetAsync("UY098C#3", scene, false).then(system => {
	        system.emitter = sphereSpark;
	    });
	    var sphereSmoke = BABYLON.MeshBuilder.CreateSphere("sphereSmoke", {diameter: 1.9, segments:60}, scene);
  sphereSmoke.position = new  BABYLON.Vector3(5,0,5);
  sphereSmoke.scaling = new  BABYLON.Vector3(2, 2, 2);
	    sphereSmoke.isVisible = false;
	    BABYLON.ParticleHelper.CreateFromSnippetAsync("UY098C#6", scene, false).then(system => {
	        system.emitter = sphereSmoke;
	    });
}

function setPlanetToSearch() {
  let image = document.getElementById("planet")
  let index = Math.floor(Math.random() * (Constants.IMAGE_PREVIEWS.length))
  image.src = Constants.IMAGE_PREVIEWS[index]
  CURRENT_PLANET_TO_SEARCH = Constants.PLANET_NAMES[index]
  console.log(index)
  console.log(Constants.IMAGE_PREVIEWS[index])
  console.log(CURRENT_PLANET_TO_SEARCH)
}

function changeScore(score) {
  let counter = document.getElementById("score-counter") 
  counter.innerHTML = "SCORE: " + score
}

function loadPlanets(texturePath, name) {
  var planetsTextureTask = assetsManager.addTextureTask(
    "planet task " + name,
    texturePath
  ) 
  planetsTextureTask.onSuccess = (task) => {
    let sphere = BABYLON.MeshBuilder.CreateSphere(name, {})
    let xrand = Constants.MIN_X + Math.random() * (Constants.MAX_X - Constants.MIN_X) 
    let zrand = Constants.MIN_Z + Math.random() * (Constants.MAX_Z - Constants.MIN_Z) 
    sphere.position.x = xrand 
    sphere.position.z = zrand 
    sphere.scaling = new BABYLON.Vector3(Constants.PLANETS_SCALING, Constants.PLANETS_SCALING, Constants.PLANETS_SCALING)
    let planetsMaterial = new BABYLON.StandardMaterial(name + "planets_material", scene) 
    planetsMaterial.diffuseTexture = task.texture 
    sphere.material = planetsMaterial 
    scene.planets.push(sphere) 
    clonePlanets(sphere, name) 
  } 
  planetsTextureTask.onError = (task, message, exception) =>
    console.log(message, exception) 
}

function clonePlanets(planet, name) {
  for (let i = 0;  i < Constants.OBJECTS_COUNT;  i++) {
    let planetClone = planet.clone(name + "_" + i) 
    let xrand = Constants.MIN_X + Math.random() * (Constants.MAX_X - Constants.MIN_X) 
    let zrand = Constants.MIN_Z + Math.random() * (Constants.MAX_Z - Constants.MIN_Z) 
    planetClone.position.x = xrand 
    planetClone.position.z = zrand 
    planetClone.checkCollisions = true;
    planetClone.isPickable = true;
    scene.planets.push(planetClone) 
  }
}

function createSuns() {
    BABYLON.ParticleHelper.CreateAsync("sun", scene, true).then((set) => {
      set.start();
    })
}

function loadUfo() {
  var ufoMeshTask = assetsManager.addMeshTask(
    "ufo task",
    "",
    Constants.MODELS_PATH,
    Constants.MODEL_UFO
  ) 
  ufoMeshTask.onSuccess = (task) => {
    let ufo = task.loadedMeshes[0] 
    let xrand = Constants.MIN_X + Math.random() * (Constants.MAX_X - Constants.MIN_X) 
    let zrand = Constants.MIN_Z + Math.random() * (Constants.MAX_Z - Constants.MIN_Z) 
    ufo.position = new BABYLON.Vector3(xrand, 0, zrand) 
    ufo.scaling = new BABYLON.Vector3(2, 2, 2)
    ufo.name = "ufo"
    cloneUfos(ufo, task.loadedSkeletons[0]) 
  }
  ufoMeshTask.onError = (task, message, exception) =>
    console.log(message, exception) 
}

function cloneUfos(ufo, skeleton) {
  scene.ufos = [] 
  for (let i = 0; i < Constants.OBJECTS_COUNT; i++) {
    let uf = ufo.clone("ufo" + i) 
    uf.skeleton = skeleton.clone("clonedSkeleton" + i)  //TODO: Doesn't work :(
    let xrand = Constants.MIN_X + Math.random() * (Constants.MAX_X - Constants.MIN_X) 
    let zrand = Constants.MIN_Z + Math.random() * (Constants.MAX_Z - Constants.MIN_Z) 
    uf.position.x = xrand 
    uf.position.z = zrand
    scene.beginAnimation(skeleton, 0, 100, true, 1.0) 
    scene.ufos.push(uf) 
  }
}

function createFollowCamera(scene, target) {
  let targetName = target.name 

  let camera = new BABYLON.FollowCamera(
    targetName + "FollowCamera",
    target.position,
    scene,
    target
  )

  camera.radius = Constants.CAMERA_RADIUS 
  camera.heightOffset =  Constants.CAMERA_HEIGHT_OFFSET 
  camera.rotationOffset =  Constants.CAMERA_ROTATION_OFFSET 
  camera.cameraAcceleration = Constants.CAMERA_ACCELERATION 
  camera.maxCameraSpeed = Constants.MAX_CAMERA_SPEED 
  return camera 
}

function destroyPlanet(planet) {
  planet.isVisible = false
  scene.removeMesh(planet)
  planet.dispose()
  explotionSphere.position = planet.position
  scene.assets.explosionSound.play()
  explotionSphere.particleSystem.start()
  setTimeout(() => {
    explotionSphere.particleSystem.stop()
  }, Constants.EXPLOSION_TIMEOUT)
}

function loadExplotionParticleSystem() {
  var particleSystem = new BABYLON.ParticleSystem("destroyParticles", 2000, scene);

  explotionSphere = BABYLON.MeshBuilder.CreateSphere("box",  {diameter: 0.4, segments:60}, scene)
  explotionSphere.isVisible = false;
  explotionSphere.particleSystem = particleSystem

  particleSystem.emitter = explotionSphere;
  particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
  particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, 0);
  particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 0);
  particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 1.5;
  particleSystem.emitRate = 1500;
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
  particleSystem.direction1 = new BABYLON.Vector3(-3, 8, 3);
  particleSystem.direction2 = new BABYLON.Vector3(3, 8, -3);
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;

  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;
  particleSystem.updateSpeed = 0.005;
}

function createAircraftFire(aircraft) {
  var particleSystem = new BABYLON.ParticleSystem("aircraftFire", 200, scene);
  particleSystem.particleTexture = new BABYLON.Texture("/textures/fire.jpg", scene);

  let fireSphere = BABYLON.MeshBuilder.CreateSphere("box",  {diameter: 0.4, segments:60}, scene)
  fireSphere.isVisible = false;
  aircraft.addChild(fireSphere);

  particleSystem.emitter = fireSphere;

  particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
  particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
  particleSystem.color1 = new BABYLON.Color4(0.7, 0.7, 0.7, 1.0);
  particleSystem.color2 = new BABYLON.Color4(0.7, 0.7, 0.7, 1.0);
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.0, 0.0);
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.4;
  particleSystem.minLifeTime = 0.2;
  particleSystem.maxLifeTime = 1.0;
  particleSystem.emitRate = 20000;
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
  particleSystem.direction1 = new BABYLON.Vector3(-1, 4, 1);
  particleSystem.direction2 = new BABYLON.Vector3(1, 4, -1);
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;
  particleSystem.minEmitPower = 0;
  particleSystem.maxEmitPower = 0.2;
  particleSystem.updateSpeed = 0.01;
  
  particleSystem.start();
}

function loadAircraft() {
  var aircraftMeshTask = assetsManager.addMeshTask(
    "Aircraft task",
    "",
    Constants.MODELS_PATH,
    Constants.MODEL_PLANE
  ) 
  aircraftMeshTask.onSuccess = (task) => {
    let aircraft = task.loadedMeshes[0] 

    aircraft.material.metallic = 0.52

    aircraft.position = new BABYLON.Vector3(0, 0, 0) 
    aircraft.scaling = new BABYLON.Vector3(Constants.AIRCRAFT_SCALING, Constants.AIRCRAFT_SCALING, Constants.AIRCRAFT_SCALING) 
    aircraft.rotation = new BABYLON.Vector3(0, 0, 0) 
    aircraft.name = Constants.AIRCRAFT_MESH_NAME
    aircraft.checkCollisions = true;

    aircraft.minZ = Constants.MIN_Z
    aircraft.maxZ = Constants.MAX_Z 
    aircraft.minX = Constants.MIN_X
    aircraft.maxX = Constants.MAX_X 

    aircraft.speed = Constants.AIRCRAFT_SPEED 
    aircraft.frontVector = new BABYLON.Vector3(0, 0, 0) 

    createAircraftFire(aircraft)
   
    createFollowCamera(scene, aircraft) 

    aircraft.canFireLasers = true 
    aircraft.fireLasersAfter = Constants.RAY_FIRE_LASERS_AFTER 
    aircraft.fireLasers = () => {
      if (!inputStates.laser) return 
      if (!aircraft.canFireLasers) return 
      aircraft.canFireLasers = false 
      scene.assets.laserSound.play();
      setTimeout(() => {
        aircraft.canFireLasers = true 
      }, Constants.RAY_TIMEOUT * aircraft.fireLasersAfter) 

      let origin = aircraft.position 

      let direction = new BABYLON.Vector3(
        aircraft.frontVector.x,
        aircraft.frontVector.y + 0.1,
        aircraft.frontVector.z
      ) 
      let length = Constants.RAY_LENGTH 
      let ray = new BABYLON.Ray(origin, direction, length) 

      let rayHelper = new BABYLON.RayHelper(ray) 
      rayHelper.show(scene, new BABYLON.Color3.Red()) 

      let pickInfo2 = scene.pickWithRay(ray)
      let pickInfo = scene.pickWithRay(ray, (mesh) => {
        return mesh.name.startsWith(CURRENT_PLANET_TO_SEARCH) 
      }) 

      if (pickInfo.pickedMesh) {
        destroyPlanet(pickInfo.pickedMesh)
        score+=1
        changeScore(score)
        setPlanetToSearch()
      }

      setTimeout(() => {
        rayHelper.hide(ray) 
      }, Constants.RAY_STANDING_TIME) 
    } 

    aircraft.move = () => {
      //aircraft will move non-stop
      aircraft.moveWithCollisions(
        aircraft.frontVector.multiplyByFloats(
          aircraft.speed,
          aircraft.speed,
          aircraft.speed
        )
      ) 

      if (inputStates.left) {
        aircraft.rotation.y -= Constants.AIRCRAFT_ROTATION_VALUE 
        aircraft.frontVector = new BABYLON.Vector3(
          Math.sin(aircraft.rotation.y),
          0,
          Math.cos(aircraft.rotation.y)
        ) 
      }
      if (inputStates.right) {
        aircraft.rotation.y += Constants.AIRCRAFT_ROTATION_VALUE 
        aircraft.frontVector = new BABYLON.Vector3(
          Math.sin(aircraft.rotation.y),
          0,
          Math.cos(aircraft.rotation.y)
        ) 
      }
    } 
  } 
  aircraftMeshTask.onError = (task, message, exception) =>
    console.log(message, exception) 
}

//function loadHologram() {
//  var hologramMeshTask = assetsManager.addMeshTask(
//    "hologram task",
//    "",
//    "models/",
//    "hologram.obj"
//  ) 
//  hologramMeshTask.onSuccess = (task) => {
//    let hologram = task.loadedMeshes[0] 
//
//    hologram.position = new BABYLON.Vector3(-100, -100, -100) 
//    hologram.scale = new BABYLON.Vector3(100, 100, 100) 
//    hologram.name = "hologram" 
//  } 
//  hologramMeshTask.onError = (task, message, exception) =>
//    console.log(message, exception) 
//}

function loadBackgroundSound() {
  var backgroundMusicTask = assetsManager.addBinaryFileTask(
    "backgroundMusicTask",
    Constants.BACKGROUND_MUSIC
  ) 
  backgroundMusicTask.onSuccess = (task) => {
    scene.assets.music = new BABYLON.Sound("backgroundMusic", task.data, scene, null, {
      loop: true,
      autoplay: true,
    }) 
  } 
  backgroundMusicTask.onError = (task, message, exception) =>
    console.log(message, exception) 
}

function loadLaserSound() {
  var laserSoundTask = assetsManager.addBinaryFileTask(
    "laserSoundTask",
    Constants.LASER_SOUND
  ) 
  laserSoundTask.onSuccess = (task) => {
    scene.assets.laserSound = new BABYLON.Sound("laserSoundTask", task.data, scene, null, {
      loop: false,
      autoplay: false,
    })
    scene.assets.laserSound.setVolume(0.3)
  } 
  laserSoundTask.onError = (task, message, exception) =>
    console.log(message, exception) 
}

function loadExplosionSound() {
  var explosionSoundTask = assetsManager.addBinaryFileTask(
    "explosionSoundTask",
    Constants.EXPLOSION_SOUND
  ) 
  explosionSoundTask.onSuccess = (task) => {
    scene.assets.explosionSound = new BABYLON.Sound("explosionSoundTask", task.data, scene, null, {
      loop: false,
      autoplay: false,
    })
    scene.assets.explosionSound.setVolume(0.5)
  } 
  explosionSoundTask.onError = (task, message, exception) =>
    console.log(message, exception) 
}

function loadBackGround() {
  skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: Constants.SKYBOX_SIZE }, scene) 
  var skyboxMaterial = new BABYLON.StandardMaterial("skyBoxMaterial", scene) 
  skyboxMaterial.backFaceCulling = false 
  var files = [
    Constants.TEXTURE_SPACE_LEFT,
    Constants.TEXTURE_SPACE_UP,
    Constants.TEXTURE_SPACE_FRONT,
    Constants.TEXTURE_SPACE_RIGHT,
    Constants.TEXTURE_SPACE_DOWN,
    Constants.TEXTURE_SPACE_BACK
  ] 
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture.CreateFromImages(
    files,
    scene
  ) 
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE 
  skyboxMaterial.disableLighting = true 

  skybox.material = skyboxMaterial 
}

function createScene() {
  let scene = new BABYLON.Scene(engine) 

  let light = new BABYLON.HemisphericLight(
    "mainLight",
    new BABYLON.Vector3(0, 1, 0),
    scene
  ) 
  light.intensity = 0.7 
  light.diffuse = new BABYLON.Color3(1, 1, 1) 

  return scene 
}

window.addEventListener("resize", () => {
  engine.resize() 
}) 


function modifySettings() {
  scene.onPointerDown = () => {
    if (!scene.alreadyLocked) {
      console.log("requesting pointer lock") 
      canvas.requestPointerLock() 
    } else {
      console.log("Pointer already locked") 
    }
  } 

  document.addEventListener("pointerlockchange", () => {
    let element = document.pointerLockElement || null 
    if (element) {
      scene.alreadyLocked = true 
    } else {
      scene.alreadyLocked = false 
    }
  }) 

  inputStates.left = false 
  inputStates.right = false 
  inputStates.laser = false 

  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
        inputStates.left = true 
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        inputStates.right = true 
      } else if (event.key === "l"||  event.key === "L") {
        inputStates.laser = true 
      }
    },
    false
  ) 

  window.addEventListener(
    "keyup",
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
        inputStates.left = false 
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        inputStates.right = false 
      } else if (event.key === "l"||  event.key === "L") {
        inputStates.laser = false 
      }
    },
    false
  ) 
}
