// Withheld qualification fixture: no foreground can be measured.
import { Camera, runApp, StandardRenderer, Transform, type Plugin } from "@dylanebert/shallot";

const Scene: Plugin = {
    name: "NoCube",
    initialize(world) {
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0x101010 });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform, { translation: [0, 0, 4] });
    },
};
await runApp({ plugins: [Scene] });
