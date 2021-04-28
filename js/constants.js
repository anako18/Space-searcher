//==========================================================
//=========================MODELS===========================
//==========================================================
export const MODELS_PATH = "models/"
export const MODEL_UFO = "ufo.glb"
export const MODEL_PLANE = "plane.obj"

//==========================================================
//=========================TEXTURES=========================
//==========================================================
//PLANETS
export const TEXTURE_PLANET1 = "textures/planets/planet1.jpg"
export const TEXTURE_PLANET2 = "textures/planets/planet2.jpg"
export const TEXTURE_PLANET3 = "textures/planets/planet3.jpg"
export const TEXTURE_PLANET4 = "textures/planets/planet4.jpg"
export const TEXTURE_PLANET5 = "textures/planets/planet5.jpg"
export const TEXTURE_PLANET6 = "textures/planets/planet6.jpg"

//TEXTURES
export const TEXTURE_SPACE_LEFT = "textures/Space/space_left.jpg"
export const TEXTURE_SPACE_UP = "textures/Space/space_up.jpg"
export const TEXTURE_SPACE_FRONT = "textures/Space/space_front.jpg"
export const TEXTURE_SPACE_RIGHT = "textures/Space/space_right.jpg"
export const TEXTURE_SPACE_DOWN = "textures/Space/space_down.jpg"
export const TEXTURE_SPACE_BACK = "textures/Space/space_back.jpg"

//==========================================================
//=======================PLANET PREVIEWS====================
//==========================================================
export const IMAGE_PREVIEW_PLANET1 = "images/planet1_preview.jpg"
export const IMAGE_PREVIEW_PLANET2 = "images/planet2_preview.jpg"
export const IMAGE_PREVIEW_PLANET3 = "images/planet3_preview.jpg"
export const IMAGE_PREVIEW_PLANET4 = "images/planet4_preview.jpg"
export const IMAGE_PREVIEW_PLANET5 = "images/planet5_preview.jpg"
export const IMAGE_PREVIEW_PLANET6 = "images/planet6_preview.jpg"
export const IMAGE_PREVIEWS = [IMAGE_PREVIEW_PLANET1, IMAGE_PREVIEW_PLANET2, 
    IMAGE_PREVIEW_PLANET3, IMAGE_PREVIEW_PLANET4, IMAGE_PREVIEW_PLANET5, IMAGE_PREVIEW_PLANET6]

//==========================================================
//=========================SOUNDS===========================
//==========================================================
export const BACKGROUND_MUSIC = "sounds/space.mp3"
export const LASER_SOUND = "sounds/laser.mp3"
export const EXPLOSION_SOUND = "sounds/explosion.mp3"

//==========================================================
//=========================GAME SETTINGS====================
//==========================================================
//Camera
export const CAMERA_RADIUS = -10  // how far from the object to follow
export const CAMERA_HEIGHT_OFFSET = 14 // how high above the object to place the camera
export const CAMERA_ROTATION_OFFSET = 0 // the viewing angle
export const CAMERA_ACCELERATION = 0.1 // how fast to move
export const MAX_CAMERA_SPEED = 5 // speed limit

//PLENETS GENERATION AD ENVIRONMENT
export const OBJECTS_COUNT = 200 //How many planets (of each type) should be generated
export const MAX_X = 500 //The upper max X of scene
export const MIN_X = -500 //The lower min X of scene
export const MAX_Z = 500 //The upper max Z of scene
export const MIN_Z = -500 //The lower min Z of scene
export const SKYBOX_SIZE = 5000

export const EXPLOSION_TIMEOUT = 3000 //miliseconds

//AIRCRAFT
export const AIRCRAFT_MESH_NAME = "aircraft"
export const AIRCRAFT_SCALING = 0.01
export const AIRCRAFT_ROTATION_VALUE = 0.05
export const AIRCRAFT_SPEED = 0.15

//RAY
export const RAY_STANDING_TIME = 200
export const RAY_TIMEOUT = 1000
export const RAY_FIRE_LASERS_AFTER = 0.3
export const RAY_LENGTH = 20

//PLANETS
export const PLANETS_SCALING = 3
export const PLANET_1_NAME = "planet1"
export const PLANET_2_NAME = "planet2"
export const PLANET_3_NAME = "planet3"
export const PLANET_4_NAME = "planet4"
export const PLANET_5_NAME = "planet5"
export const PLANET_6_NAME = "planet6"
export const PLANET_NAMES = [PLANET_1_NAME, PLANET_2_NAME, PLANET_3_NAME, PLANET_4_NAME, PLANET_5_NAME, PLANET_6_NAME]