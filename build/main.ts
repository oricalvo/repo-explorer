import "reflect-metadata";
import "zone.js";
import * as cli from "build-utils/cli";
import * as path from "path";
import {deleteDirectory, appendFile, copyGlob, copyFile, deleteFile} from "build-utils/fs";
import {exec, spawn} from "build-utils/process";
import {appRoutes} from "../app/routes";
import * as open from "open";
import * as configurator from "../server/config";
import {updateConfig} from "build-utils/config";
import {EnvType} from "../server/config";
import * as SystemJSBuilder from "systemjs-builder";
import * as fs from "build-utils/fs";
import * as logger from "../server/logger";

cli.command("dev", dev);
cli.command("prod", prod);
cli.command("bundle-vendors", bundleVendors);
cli.command("server", devServer);

cli.run();

export async function dev() {
    const config = await configurator.loadFrom(path.resolve(__dirname, "../server/config.json"));

    //logger.info("Compiling typescript");
    //await exec("node_modules/.bin/tsc");

    logger.info("Compiling SASS");
    await exec("node_modules/.bin/node-sass --recursive ./app --output ./app", {silent: true});

    await bundleVendors();

    devServer();

    logger.info("Openning browser");
    open(`http://localhost:${config.httpPort}`);
}

export function devServer() {
    logger.info("Running DEV server");
    spawn("node node_modules/nodemon/bin/nodemon.js server/main.js");
}

export async function prod() {
    const config = await configurator.loadFrom(path.resolve(__dirname, "../server/config.json"));

    await deleteDirectory("./aot");
    await deleteDirectory("./dist");

    console.log("Copying source files to AOT folder");
    await copyGlob("./app/**/*.ts", "./aot/app");
    await copyGlob("./app/**/*.scss", "./aot/app");
    await copyGlob("./app/**/*.html", "./aot/app");
    await deleteFile("./aot/app/main.ts");
    await copyFile("./tsconfig.json", "./aot/tsconfig.json");

    console.log();
    console.log("Compiling SASS");
    await compileSASS();

    console.log();
    console.log("Running AOT");
    await exec("node_modules/.bin/ngc -p ./aot");

    console.log();
    console.log("Fix AOT factories");
    await fixAOT();

    console.log();
    console.log("Compiling AOT");
    await copyFile("./build/aot/main.ts", "./aot/app/main.ts");
    await exec("node_modules/.bin/tsc -p ./aot");

    console.log();
    console.log("Bundling");
    await exec("node_modules/.bin/webpack");

    console.log();
    console.log("Copying server");
    await copyGlob("./server/**", "./dist/server");
    await updateConfig("./dist/server/config.json", {
        env: EnvType.PROD
    });

    console.log();
    console.log("Copying client assets");
    await copyGlob("./app/styles/**/*.css", "./dist");
    await copyFile("./index.hbs", "./dist/index.hbs");
    await copyFile("./node_modules/systemjs/dist/system.js", "./dist/system.js");
    await copyFile("./node_modules/zone.js/dist/zone.js", "./dist/zone.js");
    await copyFile("./node_modules/reflect-metadata/Reflect.js", "./dist/Reflect.js");

    console.log();
    console.log("Running server");
    exec("node ./server/main", {
        cwd: "./dist"
    });

    console.log();
    console.log("Openning browser");
    open(`http://localhost:${config.httpPort}`);
}

function fixNgFactory(route) {
    if(!route.loadChildren) {
        return;
    }

    console.log("Fix factory for route: " + route.loadChildren);

    const parts = route.loadChildren.split("#");
    const modulePath = parts[0];
    const moduleName = parts[1];

    const moduleFactoryPath = "./aot" + modulePath + ".ngfactory.ts";
    const moduleFactoryDirPath = path.dirname(moduleFactoryPath);
    const moduleLoaderPath = "./app/common/moduleLoader";
    const moduleFactoryPathRel = path.posix.relative(moduleFactoryDirPath, moduleLoaderPath);

    const template = `
            import {ModuleLoader} from "${moduleFactoryPathRel}";
            ModuleLoader.notifyLoaded("${moduleName}", ${moduleName}NgFactory);`;

    console.log("    " + moduleFactoryPath);
    return appendFile(moduleFactoryPath, template);
}

async function fixAOT() {
    return Promise.all(appRoutes.map(route => fixNgFactory(route)));
}

export async function compileSASS() {
    await exec("node_modules/.bin/node-sass --recursive ./aot/app --output ./aot/app");
}

export async function bundleVendors() {
    logger.info("Bundling vendors");

    if (!await fs.fileExists('bundles/rxjs.bundle.js')) {
        logger.info("    rxjs");
        const builder = new SystemJSBuilder('/', 'systemjs.config.js');
        await builder.bundle('rxjs', 'bundles/rxjs.bundle.js');
    }

    if (!await fs.fileExists('bundles/t-rex.bundle.js')) {
        logger.info("    t-rex");
        const builder = new SystemJSBuilder('/', 'systemjs.config.js');
        await builder.bundle('t-rex', 'bundles/t-rex.bundle.js');
    }
}
