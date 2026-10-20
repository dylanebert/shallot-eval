// Withheld known-bad qualification fixture: blue dynamic body above a gray static floor.
import { Body, BodyType, Camera, Materials, MeshInstance, MeshMaterial, runApp, Shape, StandardMaterial, StandardPhysicsPlugin, StandardRenderer, Transform, type Plugin } from "@dylanebert/shallot";

const Scene: Plugin = {
    name: "FallingBox",
    dependencies: [StandardPhysicsPlugin],
    initialize(world) {
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0x101010 });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform, { translation: [0, 2, 10] });
        const materials = world.resource(Materials);
        const blue = materials.add(StandardMaterial({ baseColor: [0, 0, 1, 1], unlit: true }));
        const gray = materials.add(StandardMaterial({ baseColor: [0.3, 0.3, 0.3, 1], unlit: true }));
        const cube = world.create();
        world.add(cube, Transform, { translation: [0, 4, 0] });
        world.add(cube, MeshInstance);
        world.add(cube, MeshMaterial, blue);
        world.add(cube, Body, { type: BodyType.Static });
        world.add(cube, Shape);
        const floor = world.create();
        world.add(floor, Transform, { translation: [0, -0.5, 0], scale: [8, 1, 8] });
        world.add(floor, MeshInstance);
        world.add(floor, MeshMaterial, gray);
        world.add(floor, Body, { type: BodyType.Static });
        world.add(floor, Shape);
    },
};
await runApp({ plugins: [Scene] });
