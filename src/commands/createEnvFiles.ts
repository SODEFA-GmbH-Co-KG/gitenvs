import { readFile } from "fs/promises";
import { decryptEnvVars } from "../lib/decryptEnvVars";
import { saveEnvVars } from "../lib/saveEnvFiles";
import { GenerateEnvVarsFunction } from "../lib/types/GenerateEnvVarsFunction";
import { Keys } from "../lib/types/Keys";

type CreateEnvFilesOptions = {
  stage?: string;
  keys: Keys<string>;
  passphrase?: string;
  passphrasePath?: string;
  generateEnvVars: GenerateEnvVarsFunction<string>;
};

export const createEnvFiles = async (options: CreateEnvFilesOptions) => {
  const {
    stage = process.env.GITENV_STAGE || "development",
    generateEnvVars,
    keys,
  } = options;

  const privateKey = keys[stage].encryptedPrivateKey;
  const passphrase = await getPassphrase({ ...options, stage });
  const envVars = decryptEnvVars({
    generateEnvVars,
    stage,
    privateKey,
    passphrase,
  });

  await saveEnvVars({ envVars });

  console.log(`🎉 all env files created`);
};

const getPassphrase = async ({
  stage,
  passphrase,
  passphrasePath = `./${stage}.passphrase`,
}: CreateEnvFilesOptions) => {
  const getKeyFromEnvVars = () => {
    const envVar = `GITENV_PRIVATE_KEY_PASSPHRASE_${stage?.toUpperCase()}`;
    const envVarValue = process.env[envVar];
    return envVarValue;
  };

  const getKeyFromFile = async () => {
    if (!passphrasePath) return undefined;

    try {
      return await readFile(passphrasePath, "utf8");
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
      return undefined;
    }
  };

  return passphrase ?? getKeyFromEnvVars() ?? (await getKeyFromFile()) ?? "";
};
