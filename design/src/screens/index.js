/**
 * Screen registry
 *
 * Importa todas as 30 telas e as exporta em ordem narrativa (fluxo do usuário).
 * A ordem aqui é canônica — o renderer usa diretamente o array.
 *
 * Grupos (informados em cada Screen object):
 *   onboarding   · telas 1–5
 *   core         · telas 6–11, 20, 26 (núcleo + transparência)
 *   support      · telas 13–19, 21–25 (apoio / fluxos secundários)
 *   gamification · telas 27–29
 */

import splash from "./01-splash.js";
import login from "./01a-login.js";
import citySelect from "./02-city-select.js";
import onbCamera from "./03-onboarding-camera.js";
import onbGame from "./04-onboarding-gamification.js";
import onbPact from "./04b-onboarding-community-pact.js";
import onbHood from "./05-onboarding-neighborhood.js";
import homeMap from "./06-home-map.js";
import civicFeed from "./07-civic-feed.js";
import cameraLive from "./08-camera-live.js";
import manualReport from "./09-manual-report.js";
import reportConfirm from "./10-report-confirm.js";
import anonSend from "./11-anonymous-send.js";
import heroesLeague from "./12-heroes-league.js";
import detailInProg from "./13-detail-in-progress.js";
import detailTicket from "./14-detail-ticket.js";
import nps from "./15-nps-feedback.js";
import myReports from "./16-my-reports.js";
import detailMerged from "./17-detail-merged.js";
import syncQueue from "./18-sync-queue.js";
import notifications from "./19-notifications.js";
import cityProfile from "./20-city-profile.js";
import programsHub from "./21-programs-transparency.js";
import electedOfficials from "./21b-elected-officials.js";
import bolsaFamilia from "./22-detail-bolsa-familia.js";
import reportIrreg from "./23-report-irregularity.js";
import servicesWorks from "./24-services-works.js";
import worksFeed from "./25-works-in-progress.js";
import workDetail from "./26-work-detail.js";
import citizenProf from "./27-citizen-profile.js";
import achievements from "./28-achievements.js";
import ranking from "./29-neighborhood-ranking.js";

export const SCREENS = [
  // 01 · Entrada & Onboarding
  splash,
  login,
  citySelect,
  onbCamera,
  onbGame,
  onbPact,
  onbHood,
  // 02 · Núcleo do App
  homeMap,
  civicFeed,
  cameraLive,
  manualReport,
  reportConfirm,
  anonSend,
  heroesLeague,
  detailInProg,
  detailTicket,
  nps,
  myReports,
  detailMerged,
  syncQueue,
  notifications,
  cityProfile,
  programsHub,
  electedOfficials,
  bolsaFamilia,
  reportIrreg,
  servicesWorks,
  worksFeed,
  workDetail,
  // 03 · Gamificação
  citizenProf,
  achievements,
  ranking,
];
