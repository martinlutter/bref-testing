import * as JSZip from "jszip";
import * as fs from "fs";

const zip = new JSZip();

addFilesFromDirectoryToZip(zip, 'bin', '../project/bin');
addFilesFromDirectoryToZip(zip, 'config', '../project/config');
addFilesFromDirectoryToZip(zip, 'src', '../project/src');
addFilesFromDirectoryToZip(zip, 'templates', '../project/templates');
addFilesFromDirectoryToZip(zip, 'translations', '../project/translations');
addFilesFromDirectoryToZip(zip, 'var', '../project/var');
addFilesFromDirectoryToZip(zip, 'vendor', '../project/vendor');
addFilesFromDirectoryToZip(zip, 'php', '../project/php');
zip.folder('public')?.file('index.php', fs.readFileSync('../project/public/index.php', 'utf-8'));
zip.file('.env', fs.readFileSync('../project/.env', 'utf-8'));
zip.file('composer.json', fs.readFileSync('../project/composer.json', 'utf-8'));
zip.file('composer.lock', fs.readFileSync('../project/composer.lock', 'utf-8'));
zip.file('symfony.lock', fs.readFileSync('../project/symfony.lock', 'utf-8'));
zip.file('public/build/entrypoints.json', fs.readFileSync('../project/public/build/entrypoints.json', 'utf-8'));
zip.file('public/build/manifest.json', fs.readFileSync('../project/public/build/manifest.json', 'utf-8'));

zip.generateNodeStream({type: "nodebuffer"}).pipe(fs.createWriteStream('symfony_src.zip'));

function addFilesFromDirectoryToZip(zip: JSZip, dirName: string, directoryPath: string) {
    const directoryContents = fs.readdirSync(directoryPath, {
        withFileTypes: true,
    });

    directoryContents.forEach(({name}) => {
        const path = `${directoryPath}/${name}`;
        const zipPath = `${dirName}/${name}`;

        if (fs.statSync(path).isFile()) {
            zip.file(zipPath, fs.readFileSync(path, "utf-8"));
        }

        if (fs.statSync(path).isDirectory()) {
            addFilesFromDirectoryToZip(zip, zipPath, path);
        }
    });
}
