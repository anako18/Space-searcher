# Space searcher (prototype)

Student: **Anastasiia KOZLOVA**

The idea of the game is that the airship controlled by the user is flying in the space and looking for a specific planet type.
The planet needed is displayed in the upper left corner of the screen, as well as the score counter.
The planets are distributed randomly over the space.
If you have found a required planet, you need to use the laser to "grab" it, or just to destroy it.
For each planet grabbed correctly (the planet under the laser row looks like the one required) you get a score.
Many game settings, such as planet's count, textures, speeds, scales can be changed in `constants.js`

## Controls
After pressing the key the airship will start to fly non-stop automatically.
- `Left arrow or "q"` - turns the airshop to the left
- `Right arrow or "d"` - turns the airshop to the right
- `l` - use the laser
# Project structure
- **/css** - css files
- **/images** - images, mainly the planet previews
- **/js** - main program scripts
- **/lib** - librariy files
- **/models** - the models as well as their materials
- **/sounds** - sounds
- **/textures** - textures
- **index.html** - main html file

# Implementation details
I used the AssetsManager to load all the assets. All the paths and changable parameters are in the separate file `constants.js`
The main program code is in the file `main.js`

### Camera and lights
I used the basic light and following camera (camera follows the airship).
### Airship
I have used the .obj model, that's why I have added the babylonjs.loaders dependency.
### Airship fire
I have used the particle system to make a fire for the airship. I applied the texture to each particle and also played with the parameters.
### SkyBox
I decided to try out a skybox in order to generate a space, because it gives a sense of infinity. I used already made textures, however, I have changed the color in photo editor.
### Ufos
I used `ufo.glb` from BabylonJs Meshes library for decoration.
However, I have removed the sound from the model manually, that's why I import it from my repository instead of using the url.
### Planets
For making the planets I just create the spheres and apply textures to them. I have also added simple animation (rotation).
### Explotion
When laser hits the planet, the planet is exploding. I used the particle system for making this explotion.
### Suns
I added the suns from ParticleHelper for decoration.
### Ray
The airship has a laser, I used the RayHelper to implement it.

# Problems encountered

- Sometimes the game is not fully loaded without extra reloading the page. I assume this is due to Javascript's synchronous execution. I'm in the process of finding a solution to this problem, but restarting the page helps.
Also, in the console I saw the error: "DevTools failed to load SourceMap: Could not load content for https://cdn.babylonjs.com/babylon.max.js. Apparently, I'm not the only one who is getting this error, I have found the github issue:
https://github.com/dart-lang/sdk/issues/41659
This problem doesn't seem to be fixed though.

- Some modeles that I have tried which are not in .babylon format were not imported correctly (especially the textures and the animations).

- For some reason the animation of UFOs doesn't work if I clone them, even though I'm cloning the skeletons and I'm running the animation. If I import the model several times, it works normally. However, I decided not to load my goad with extra imports, so I have left everything as it is.

# Improvements planned
- Fix the problem with asyncronous loading which sometimes forces to reload the page
- Add enemies which will protect the planets. It would make the game more difficult and interesting
- Add more animations
- Refactoring (`main.js` looks preetty big..)

# Links used
- https://doc.babylonjs.com/
- https://doc.babylonjs.com/divingDeeper/environment/skybox
- https://doc.babylonjs.com/divingDeeper/importers/assetManager
- https://doc.babylonjs.com/typedoc/classes/babylon.rayhelper
- https://playground.babylonjs.com/#MX2Z99#8

# Assets, textures, models and music
- https://youtu.be/g7h5eT3X_XU
- https://www.zapsplat.com/sound-effect-category/lasers-and-weapons/
- https://doc.babylonjs.com/toolsAndResources/assetLibraries/availableTextures
- https://doc.babylonjs.com/toolsAndResources/assetLibraries/availableMeshes
- https://www.cgtrader.com/ru/besplatnye-3d-modeli/planeta
- Textures: https://www.google.com/ :)