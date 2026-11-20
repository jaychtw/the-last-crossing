# The Last Crossing · 末班線

A short third-person browser action game above a Taipei-inspired railway during a storm. Run across wet carriage roofs, clear ventilation units, and use three magnetic tether gates to reach evacuation.

## Play

Open `index.html` in a desktop browser with WebGL enabled. All assets and scripts are local. No install, account, CDN, or build step is required. To serve the directory over HTTP, run `python3 -m http.server 8000` and visit `http://localhost:8000`.

| Input | Action |
| --- | --- |
| WASD or arrows | Run forward or backward, move sideways |
| Space | Jump over a roof vent |
| E | Use a tether when the prompt appears |
| Drag the scene | Orbit the runner |
| Escape | Pause or resume |

Crossing a tether gate saves a checkpoint for the current run. The language button switches between English and Traditional Chinese. Audio starts muted. Touch controls appear on coarse-pointer devices.

## Visual production

The scene, character, animation, skyline, signage, textures, sound, sky shader and rain were created procedurally for this game. A single planar reflection pass covers both trains, with a procedural mask and ripples over the textured steel roofs. Repeated city and train components use instancing. The distant windows, interiors and passengers are painted textures. The city and rail route are fictional.

Three.js r160 and its Reflector helper are vendored under the MIT license (see `vendor/THREE-LICENSE.txt`). No external environment packs or motion-capture clips are used.
