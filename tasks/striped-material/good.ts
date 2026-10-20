// Withheld qualification fixture: animated UV bands on a stationary cube.
import { Camera, MeshInstance, MeshMaterial, runApp, StandardRenderer, Transform, type Plugin } from "@dylanebert/shallot";
import { MaterialPlugin, materialType, engineLayout } from "@dylanebert/shallot/standard/rendering";
import * as d from "typegpu/data";
import * as std from "typegpu/std";

const Stripes = materialType({
    name: "QualificationStripes",
    parameters: d.struct({ unused: d.f32 }),
    defaults: { unused: 0 },
    fragmentInputs: { uv: true },
    fragment: (ctx) => {
        "use gpu";
        const phase = ctx.uv.x * 12 + engineLayout.$.frame.time * 2;
        const value = std.floor(phase) % 2;
        return d.vec4f(d.vec3f(0.1 + value * 0.9), 1);
    },
});
const Scene: Plugin = {
    name: "StripedCube",
    dependencies: [MaterialPlugin(Stripes)],
    initialize(world) {
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0x101010 });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform, { translation: [0, 0, 4] });
        const cube = world.create();
        world.add(cube, Transform, { scale: [2, 2, 2] });
        world.add(cube, MeshInstance);
        world.add(cube, MeshMaterial, world.resource(Stripes).add({}));
    },
};
await runApp({ plugins: [Scene] });
