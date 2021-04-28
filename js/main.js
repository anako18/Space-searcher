import * as Constants from "./constants.js" 

let canvas 
let engine 
let scene 

let CURRENT_PLANET_TO_SEARCH = Constants.PLANET_1_NAME
let score = 0

window.onload = startGame

function startGame() {
  canvas = document.querySelector("#myCanvas") 
  engine = new BABYLON.Engine(canvas, true) 

  scene = createScene()
  modifySettings() 
  loadModels()
  loadSounds()

  scene.assetsManager.load()
  setPlanetToSearch()
  scene.assetsManager.onProgress = function (
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

  scene.assetsManager.onFinish = function (tasks) {
    engine.runRenderLoop(() => {
      //let aircraft = scene.getMeshByName(Constants.AIRCRAFT_MESH_NAME) 
      if (scene) {
        rotatePlanets()
        if (scene.assets.aircraft) {
          scene.assets.aircraft.moveWithCollisions(
            scene.assets.aircraft.frontVector.multiplyByFloats(
              scene.assets.aircraft.speed,
              scene.assets.aircraft.speed,
              scene.assets.aircraft.speed
            )
          ) 
          scene.assets.aircraft.fireLasers()
          if (score > 0 && Constants.CHECK_COLLISIONS) {
            scene.assets.aircraft.checkPlanetsCollision()
          }
          scene.assets.aircraft.move() 
        }
        scene.render() 
      }
    }) 
  } 
}

function loadModels() {
  loadBackGround(scene)
  loadPlanets(Constants.TEXTURE_PLANET1,Constants.PLANET_1_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET2,Constants.PLANET_2_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET3,Constants.PLANET_3_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET4,Constants.PLANET_4_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET5,Constants.PLANET_5_NAME) 
  loadPlanets(Constants.TEXTURE_PLANET6,Constants.PLANET_6_NAME) 
  loadUfo()

  loadAircraft() 
  //loadHologram() 
  loadExplotionParticleSystem()
  //createSun()
}

function loadSounds() {
  loadBackgroundSound()
  loadLaserSound()
  loadExplosionSound()
}

function rotatePlanets() {
  for (let i = 0; i < scene.planets.length; i++) {
    scene.planets[i].rotate(BABYLON.Axis.Y, Math.PI / 30);
  }
  for (let i = 0; i < scene.ufos.length; i++) {
    scene.ufos[i].rotate(BABYLON.Axis.Y, Math.PI / 30);
  }
}

function createSpaceClouds() {
	    scene.assets.sphereSpark = BABYLON.MeshBuilder.CreateSphere("sphereSpark", {diameter: 0.4, segments:60}, scene);
  scene.assets.sphereSpark.position = new BABYLON.Vector3(0,0,0);
  scene.assets.sphereSpark.scaling = new BABYLON.Vector3(7, 7, 7);
	    scene.assets.sphereSpark.isVisible = false;
	    BABYLON.ParticleHelper.CreateFromSnippetAsync("UY098C#3", scene, false).then(system => {
	        system.emitter = scene.assets.sphereSpark;
          system.emitRate = 1000
	    });
  scene.assets.aircraft.addChild(scene.assets.sphereSpark);
}

function setPlanetToSearch() {
  let image = document.getElementById("planet")
  let index = Math.floor(Math.random() * (Constants.IMAGE_PREVIEWS.length))
  image.src = Constants.IMAGE_PREVIEWS[index]
  CURRENT_PLANET_TO_SEARCH = Constants.PLANET_NAMES[index]
}

function changeScore(score) {
  let counter = document.getElementById("score-counter") 
  counter.innerHTML = "SCORE: " + score
}

function updateLabel() {
  let counter = document.getElementById("score-counter") 
  counter.innerHTML = "GAME OVER! THE SCORE WAS " + score
}

function loadPlanets(texturePath, name) {
  var planetsTextureTask = scene.assetsManager.addTextureTask(
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
    planetClone.checkCollisions = true
    planetClone.isPickable = true
    scene.planets.push(planetClone)
    
    //planetClone.setBoundingInfo(new BABYLON.BoundingInfo(planetClone.getBoundingInfo().boundingBox.minimum, planetClone.getBoundingInfo().boundingBox.minimum));
    planetClone.showBoundingBox = Constants.SHOW_BOUNDED_BOXES
  }
}

function createSun() {
    BABYLON.ParticleHelper.CreateAsync("sun", scene, true).then((set) => {
      set.start()
    })
}

function loadUfo() {
  var ufoMeshTask = scene.assetsManager.addMeshTask(
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
    scene.beginAnimation(uf.skeleton, 0, 100, true, 1.0) 
    scene.ufos.push(uf) 
  }
}

function createFollowCamera() {
  let targetName = scene.assets.aircraft.name 

  let camera = new BABYLON.FollowCamera(
    targetName + "FollowCamera",
    scene.assets.aircraft.position,
    scene,
    scene.assets.aircraft
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
  var index = scene.planets.indexOf(planet);
  if (index > -1) {
    scene.planets.splice(index, 1);
  }
  planet.dispose()
  scene.assets.explosionSphere.position = planet.position
  scene.assets.explosionSound.play()
  scene.assets.explosionSphere.particleSystem.start()
  setTimeout(() => {
    scene.assets.explosionSphere.particleSystem.stop()
  }, Constants.EXPLOSION_TIMEOUT)
}

function gameOver() {
  scene.assets.explosionSphere.particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0)
  scene.assets.explosionSphere.particleSystem.color2 = new BABYLON.Color4(0.8, 0, 0, 1.0)
  scene.assets.explosionSphere.particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0)
  scene.assets.explosionSphere.position = scene.assets.aircraft.position

  scene.removeMesh(scene.assets.aircraft)
  scene.assets.aircraft.dispose()

  scene.assets.explosionSound.play()
  scene.assets.explosionSphere.particleSystem.start()
  window.removeEventListener('keydown', scene.mainListener)
}

function loadExplotionParticleSystem() {
  var particleSystem = new BABYLON.ParticleSystem("destroyParticles", 2000, scene);

  scene.assets.explosionSphere = BABYLON.MeshBuilder.CreateSphere("box",  {diameter: 0.4, segments:60}, scene)
  scene.assets.explosionSphere.isVisible = false
  scene.assets.explosionSphere.checkCollisions = false
  scene.assets.explosionSphere.isPickable = false
  scene.assets.explosionSphere.particleSystem = particleSystem

  particleSystem.emitter = scene.assets.explosionSphere
  particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene)
  particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, 0)
  particleSystem.maxEmitBox = new BABYLON.Vector3(1, 0, 0)
  particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0)
  particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0)
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0)
 //particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0)
 //particleSystem.color2 = new BABYLON.Color4(1, 0, 0, 1.0)
 //particleSystem.colorDead = new BABYLON.Color4(1, 0, 0, 0.0)
  particleSystem.minSize = 0.1
  particleSystem.maxSize = 0.5
  particleSystem.minLifeTime = 0.3
  particleSystem.maxLifeTime = 1.5
  particleSystem.emitRate = 1500
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE
  particleSystem.direction1 = new BABYLON.Vector3(-3, 8, 3)
  particleSystem.direction2 = new BABYLON.Vector3(3, 8, -3)
  particleSystem.minAngularSpeed = 0
  particleSystem.maxAngularSpeed = Math.PI
  particleSystem.minEmitPower = 1
  particleSystem.maxEmitPower = 3
  particleSystem.updateSpeed = 0.005
}

function createAircraftFire() {
  var particleSystem = new BABYLON.ParticleSystem("aircraftFire", 200, scene)
  particleSystem.particleTexture = new BABYLON.Texture("/textures/fire.jpg", scene)

  let fireSphere = BABYLON.MeshBuilder.CreateSphere("box",  {diameter: 0.4, segments:60}, scene)
  fireSphere.isVisible = false
  scene.assets.aircraft.addChild(fireSphere)
  particleSystem.emitter = fireSphere

  particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0)
  particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0)
  particleSystem.color1 = new BABYLON.Color4(0.7, 0.7, 0.7, 1.0)
  particleSystem.color2 = new BABYLON.Color4(0.7, 0.7, 0.7, 1.0)
  particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.0, 0.0)
  particleSystem.minSize = 0.1
  particleSystem.maxSize = 0.4
  particleSystem.minLifeTime = 0.2
  particleSystem.maxLifeTime = 1.0
  particleSystem.emitRate = 20000
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE
  particleSystem.direction1 = new BABYLON.Vector3(-1, 4, 1)
  particleSystem.direction2 = new BABYLON.Vector3(1, 4, -1)
  particleSystem.minAngularSpeed = 0
  particleSystem.maxAngularSpeed = Math.PI
  particleSystem.minEmitPower = 0
  particleSystem.maxEmitPower = 0.2
  particleSystem.updateSpeed = 0.01
  
  particleSystem.start()
}

function loadAircraft() {
  var aircraftMeshTask = scene.assetsManager.addMeshTask(
    "Aircraft task",
    "",
    Constants.MODELS_PATH,
    Constants.MODEL_PLANE
  ) 
  aircraftMeshTask.onSuccess = (task) => {
    scene.assets.aircraft = task.loadedMeshes[0] 

    scene.assets.aircraft.material.metallic = 0.52

    scene.assets.aircraft.position = new BABYLON.Vector3(0, 0, 0) 
    scene.assets.aircraft.scaling = new BABYLON.Vector3(Constants.AIRCRAFT_SCALING, Constants.AIRCRAFT_SCALING, Constants.AIRCRAFT_SCALING) 
    scene.assets.aircraft.rotation = new BABYLON.Vector3(0, 0, 0) 
    scene.assets.aircraft.name = Constants.AIRCRAFT_MESH_NAME
    scene.assets.aircraft.checkCollisions = true

    scene.assets.aircraft.minZ = Constants.MIN_Z
    scene.assets.aircraft.maxZ = Constants.MAX_Z 
    scene.assets.aircraft.minX = Constants.MIN_X
    scene.assets.aircraft.maxX = Constants.MAX_X 

    scene.assets.aircraft.speed = Constants.AIRCRAFT_SPEED 
    scene.assets.aircraft.frontVector = new BABYLON.Vector3(0, 0, 0) 
    scene.assets.aircraft.showBoundingBox = Constants.SHOW_BOUNDED_BOXES

    createAircraftFire()
    createSpaceClouds()
   
    createFollowCamera() 

    scene.assets.aircraft.canFireLasers = true 
    scene.assets.aircraft.fireLasersAfter = Constants.RAY_FIRE_LASERS_AFTER 
    scene.assets.aircraft.fireLasers = () => {
      if (!scene.inputStates.laser) return 
      if (!scene.assets.aircraft.canFireLasers) return 
      scene.assets.aircraft.canFireLasers = false 
      scene.assets.laserSound.play();
      setTimeout(() => {
        scene.assets.aircraft.canFireLasers = true 
      }, Constants.RAY_TIMEOUT * scene.assets.aircraft.fireLasersAfter) 

      let origin = scene.assets.aircraft.position 

      let direction = new BABYLON.Vector3(
        scene.assets.aircraft.frontVector.x,
        scene.assets.aircraft.frontVector.y + 0.01,
        scene.assets.aircraft.frontVector.z
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

    scene.assets.aircraft.move = () => {
      //aircraft will move non-stop
      scene.assets.aircraft.moveWithCollisions(
        scene.assets.aircraft.frontVector.multiplyByFloats(
          scene.assets.aircraft.speed,
          scene.assets.aircraft.speed,
          scene.assets.aircraft.speed
        )
      ) 
      scene.assets.aircraft.position.y = 0;

      if (scene.inputStates.left) {
        scene.assets.aircraft.rotation.y -= Constants.AIRCRAFT_ROTATION_VALUE 
        scene.assets.aircraft.frontVector = new BABYLON.Vector3(
          Math.sin(scene.assets.aircraft.rotation.y),
          0,
          Math.cos(scene.assets.aircraft.rotation.y)
        ) 
      }
      if (scene.inputStates.right) {
        scene.assets.aircraft.rotation.y += Constants.AIRCRAFT_ROTATION_VALUE 
        scene.assets.aircraft.frontVector = new BABYLON.Vector3(
          Math.sin(scene.assets.aircraft.rotation.y),
          0,
          Math.cos(scene.assets.aircraft.rotation.y)
        ) 
      }
    }

    scene.assets.aircraft.checkPlanetsCollision = () => {
      for (let i = 0; i < scene.planets.length; i+=1) {
        if (scene.assets.aircraft.intersectsMesh(scene.planets[i], true)){
          gameOver()
        }
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
  var backgroundMusicTask = scene.assetsManager.addBinaryFileTask(
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
  var laserSoundTask = scene.assetsManager.addBinaryFileTask(
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
  var explosionSoundTask = scene.assetsManager.addBinaryFileTask(
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
  scene.assets.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: Constants.SKYBOX_SIZE }, scene) 
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

  scene.assets.skybox.material = skyboxMaterial 
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

  scene.light = light
  scene.assets = {}
  scene.planets = []
  scene.inputStates = {}
  scene.assetsManager = new BABYLON.AssetsManager(scene)
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

  scene.inputStates.left = false 
  scene.inputStates.right = false 
  scene.inputStates.laser = false 

  scene.mainListener = (event) => {
    if (event.key === "ArrowLeft" || 
    event.key === "q" || 
    event.key === "Q" || 
    event.key === "a" || 
    event.key === "A"
    ) {
      scene.inputStates.left = true 
    } else if (
      event.key === "ArrowRight" ||
      event.key === "d" ||
      event.key === "D"
    ) {
      scene.inputStates.right = true 
    } else if (event.key === "l" || event.key === "L" || event.keyCode === 32) {
      scene.inputStates.laser = true 
    }
  }
  
  window.addEventListener(
    "keydown",
    scene.mainListener,
    false
  ) 

  window.addEventListener(
    "keyup",
    (event) => {
      if (event.key === "ArrowLeft" || 
      event.key === "q" || 
      event.key === "Q" || 
      event.key === "a" || 
      event.key === "A"
      ) {
        scene.inputStates.left = false 
      } else if (
        event.key === "ArrowRight" ||
        event.key === "d" ||
        event.key === "D"
      ) {
        scene.inputStates.right = false 
      } else if (event.key === "l" || event.key === "L" || event.keyCode === 32) {//"space" doesn't work..?
        scene.inputStates.laser = false 
      }
    },
    false
  ) 
}
