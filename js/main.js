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

let inputStates = {} 

function startGame() {
  canvas = document.querySelector("#myCanvas") 
  engine = new BABYLON.Engine(canvas, true) 

  scene = createScene() 
  modifySettings() 

  assetsManager = new BABYLON.AssetsManager(scene) 
  loadBackGround(scene) 
  scene.backGroundMaterial = backgroundMaterial 
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
  loadBacgroundSound() 

  createSuns() 

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
        scene.render() 
      }
    }) 
  } 
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
    scene.planets.push(planetClone) 
  }
}

function createSuns() {
  for (let i = 0;  i < Constants.OBJECTS_COUNT; i++) {
    BABYLON.ParticleHelper.CreateAsync("sun", scene, true).then((set) => {
      let xrand = Constants.MIN_X + Math.random() * (Constants.MAX_X - Constants.MIN_X) 
      let zrand = Constants.MIN_Z + Math.random() * (Constants.MAX_Z - Constants.MIN_Z) 
      set.start(new BABYLON.Vector3(xrand, 0, zrand)) 
      scene.planets.push(set) 
    })
  }
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
    ufo.position = new BABYLON.Vector3(0, 0, 0) 
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

    aircraft.minZ = Constants.MIN_Z
    aircraft.maxZ = Constants.MAX_Z 
    aircraft.minX = Constants.MIN_X
    aircraft.maxX = Constants.MAX_X 

    aircraft.speed = Constants.AIRCRAFT_SPEED 
    aircraft.frontVector = new BABYLON.Vector3(0, 0, 0) 
   
    createFollowCamera(scene, aircraft) 

    aircraft.canFireLasers = true 
    aircraft.fireLasersAfter = Constants.RAY_FIRE_LASERS_AFTER 
    aircraft.fireLasers = () => {
      if (!inputStates.laser) return 
      if (!aircraft.canFireLasers) return 
      aircraft.canFireLasers = false 

      setTimeout(() => {
        aircraft.canFireLasers = true 
      }, Constants.RAY_TIMEOUT * aircraft.fireLasersAfter) 

      let origin = aircraft.position 

      let direction = new BABYLON.Vector3(
        aircraft.frontVector.x,
        aircraft.frontVector.y + 3,
        aircraft.frontVector.z
      ) 
      let length = Constants.RAY_LENGTH 
      let ray = new BABYLON.Ray(origin, direction, length) 

      let rayHelper = new BABYLON.RayHelper(ray) 
      rayHelper.show(scene, new BABYLON.Color3.Red()) 

      let pickInfo = scene.pickWithRay(ray, (mesh) => {
        /*
              if((mesh.name === "heroTank")|| ((mesh.name === "ray"))) return false 
              return true 
              */
        console.log(mesh.name) 
        return mesh.name.startsWith(CURRENT_PLANET_TO_SEARCH) 
      }) 

      if (pickInfo.pickedMesh) {
        console.log("PICK", pickInfo.pickedMesh.name) 
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

function loadBacgroundSound() {
  var backgroundMusicTask = assetsManager.addBinaryFileTask(
    "backgroundMusicTask",
    Constants.BACKGROUND_MUSIC
  ) 
  backgroundMusicTask.onSuccess = (task) => {
    music = new BABYLON.Sound("backgroundMusic", task.data, scene, null, {
      loop: true,
      autoplay: true,
    }) 
  } 
  backgroundMusicTask.onError = (task, message, exception) =>
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
      } else if (event.keyCode == 32) {//TODO: event.key === "Space" doesn't work...
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
      } else if (event.keyCode == 32) {//TODO: event.key === "Space" doesn't work...
        inputStates.laser = false 
      }
    },
    false
  ) 
}
