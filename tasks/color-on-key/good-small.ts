// Withheld qualification fixture: cube smaller than the former central sampling region.
import { Camera, Materials, MeshInstance, MeshMaterial, runApp, StandardMaterial, StandardRenderer, Transform, type Plugin } from "@dylanebert/shallot";

const Scene: Plugin = {
    name: "ColorOnKeySmall",
    initialize(world) {
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0x101010 });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform, { translation: [0, 0, 4] });
        const materials = world.resource(Materials);
        const white = materials.add(StandardMaterial({ baseColor: [1, 1, 1, 1], unlit: true }));
        const cube = world.create();
        world.add(cube, Transform, { scale: [0.3, 0.3, 0.3] });
        world.add(cube, MeshInstance);
        world.add(cube, MeshMaterial, white);
        window.addEventListener("keydown", (event) => {
            if (event.code === "Space") world.resource(Materials).update(white.material, { baseColor: [0, 1, 0, 1] });
        });
    },
};
await runApp({ plugins: [Scene] });
