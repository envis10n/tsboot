export * from "fs/promises";
import { stat } from "fs/promises";

type PathLike = string | Buffer | URL;

export async function exists(path: PathLike): Promise<boolean> {
    try {
        await stat(path);
        return true;
    } catch (e) {
        return false;
    }
}
