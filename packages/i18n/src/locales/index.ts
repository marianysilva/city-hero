import type { Locale, LocaleDict } from "../types";

import enUSAuth from "./en-US/auth.json";
import enUSCamera from "./en-US/camera.json";
import enUSCommon from "./en-US/common.json";
import enUSDashboard from "./en-US/dashboard.json";
import enUSErrors from "./en-US/errors.json";
import enUSHome from "./en-US/home.json";
import enUSReport from "./en-US/report.json";
import enUSUsers from "./en-US/users.json";
import enUSValidation from "./en-US/validation.json";
import ptBRAuth from "./pt-BR/auth.json";
import ptBRCamera from "./pt-BR/camera.json";
import ptBRCommon from "./pt-BR/common.json";
import ptBRDashboard from "./pt-BR/dashboard.json";
import ptBRErrors from "./pt-BR/errors.json";
import ptBRHome from "./pt-BR/home.json";
import ptBRReport from "./pt-BR/report.json";
import ptBRUsers from "./pt-BR/users.json";
import ptBRValidation from "./pt-BR/validation.json";

export const LOCALE_DICTS: Record<Locale, LocaleDict> = {
  "pt-BR": {
    common: ptBRCommon,
    home: ptBRHome,
    camera: ptBRCamera,
    report: ptBRReport,
    auth: ptBRAuth,
    errors: ptBRErrors,
    dashboard: ptBRDashboard,
    users: ptBRUsers,
    validation: ptBRValidation,
  },
  "en-US": {
    common: enUSCommon,
    home: enUSHome,
    camera: enUSCamera,
    report: enUSReport,
    auth: enUSAuth,
    errors: enUSErrors,
    dashboard: enUSDashboard,
    users: enUSUsers,
    validation: enUSValidation,
  },
};
