import fs from 'fs';
import path from 'path';
import { emit } from './utils';

interface EnumDeclaration {
    name: string;
    members: EnumMember[];
}

interface EnumMember {
    name: string;
    value: number;
}

// TODO: Move to DotaTracking
function parseDump() {
    // Output of `cl_panorama_script_help *` command
    const dump = fs.readFileSync(path.join(__dirname, 'cl_panorama_script_help'), 'utf8');
    return dump.split('\n\n').map(
        (group): EnumDeclaration => {
            const enumName = group.match(/Enumeration '(.+?)'/)![1];
            const members = [...group.matchAll(/^\t.+\.(.+?) = (\d+)/gm)].map(
                ([, name, value]): EnumMember => ({ name, value: Number(value) }),
            );

            return { name: enumName, members };
        },
    );
}

export const generatedEnums = emit(
    parseDump()
        .map(({ name: enumName, members }) => {
            const memberTypes = members.map(({ name, value }) => `${name} = ${value}`).join(',');
            return `declare enum ${enumName} {${memberTypes}}`;
        })
        .join('\n\n'),
);