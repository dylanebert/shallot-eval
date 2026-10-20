// Withheld known-bad: static stripes on a cube turning like the minimal Welcome cube.
import { Camera, component, MeshInstance, MeshMaterial, runApp, StandardRenderer, Transform, type Plugin } from "@dylanebert/shallot";
import { MaterialPlugin, materialType } from "@dylanebert/shallot/standard/rendering";
import * as d from "typegpu/data";
import * as std from "typegpu/std";

const Stripes = materialType({
    name: "QualificationStripes",
    parameters: d.struct({ unused: d.f32 }),
    defaults: { unused: 0 },
    fragmentInputs: { uv: true },
    fragment: (ctx) => {
        "use gpu";
        const phase = ctx.uv.x * 12 + 0;
        const value = std.floor(phase) % 2;
        return d.vec4f(d.vec3f(0.1 + value * 0.9), 1);
    },
});
const TurningCube = component("TurningCube", {});
const Scene: Plugin = {
    name: "TurningStripedCube",
    components: [TurningCube],
    systems: [{
        name: "SpinCube",
        update(world) {
            const halfAngle = world.time.deltaTime * 0.65 * 0.5;
            const sine = Math.sin(halfAngle);
            const cosine = Math.cos(halfAngle);
            const rotation = world.storage(Transform).rotation;
            for (const eid of world.query([TurningCube])) {
                const y = rotation.y.get(eid);
                const w = rotation.w.get(eid);
                rotation.set(eid, 0, y * cosine + w * sine, 0, w * cosine - y * sine);
            }
        },
    }],
    dependencies: [MaterialPlugin(Stripes)],
    initialize(world) {
        const camera = world.create();
        world.add(camera, Camera, { clearColor: 0x101010 });
        world.add(camera, StandardRenderer);
        world.add(camera, Transform, { translation: [0, 0, 4] });
        const cube = world.create();
        world.add(cube, Transform, { scale: [2, 2, 2] });
        world.add(cube, TurningCube);
        world.add(cube, MeshInstance);
        world.add(cube, MeshMaterial, world.resource(Stripes).add({}));
    },
};
await runApp({ plugins: [Scene] });
