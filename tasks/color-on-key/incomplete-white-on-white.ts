// Withheld qualification fixture: starting white cube indistinguishable from white background.
import { Camera, Materials, MeshInstance, MeshMaterial, runApp, StandardMaterial, StandardRenderer, Transform, type Plugin } from "@dylanebert/shallot";

const Scene: Plugin = {
    name: "ColorOnKey",
    initialize(world) {
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0xffffff });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform, { translation: [0, 0, 4] });
        const materials = world.resource(Materials);
        const white = materials.add(StandardMaterial({ baseColor: [1, 1, 1, 1], unlit: true }));
        const cube = world.create();
        world.add(cube, Transform, { scale: [2, 2, 2] });
        world.add(cube, MeshInstance);
        world.add(cube, MeshMaterial, white);
        window.addEventListener("keydown", (event) => {
            if (event.code === "Space") world.resource(Materials).update(white.material, { baseColor: [0, 1, 0, 1] });
        });
    },
};
await runApp({ plugins: [Scene] });
