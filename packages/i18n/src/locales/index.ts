import type { LocaleDict } from "../types";

import enUSAuth from "./en-US/auth.json";
import enUSCamera from "./en-US/camera.json";
import enUSCommon from "./en-US/common.json";
import enUSErrors from "./en-US/errors.json";
import enUSHome from "./en-US/home.json";
import enUSReport from "./en-US/report.json";
import ptBRAuth from "./pt-BR/auth.json";
import ptBRCamera from "./pt-BR/camera.json";
import ptBRCommon from "./pt-BR/common.json";
import ptBRErrors from "./pt-BR/errors.json";
import ptBRHome from "./pt-BR/home.json";
import ptBRReport from "./pt-BR/report.json";

export const LOCALE_DICTS: Record<"pt-BR" | "en-US", LocaleDict> = {
  "pt-BR": {
    common: ptBRCommon,
    home: ptBRHome,
    camera: ptBRCamera,
    report: ptBRReport,
    auth: ptBRAuth,
    errors: ptBRErrors,
  },
  "en-US": {
    common: enUSCommon,
    home: enUSHome,
    camera: enUSCamera,
    report: enUSReport,
    auth: enUSAuth,
    errors: enUSErrors,
  },
};
