import { SpecimenModel as LegacySpecimenModel } from './Specimens';
import type { SpecimenModelProps } from './SpecimenCommon';
import { RecordEnhancementLayer } from './RecordEnhancementLayer';
import { SkymournRepairModel } from './models/SkymournRepairModel';
import {
  AerokarstModel,
  BalanceEngineModel,
  HydrostaticRendererModel,
  StormmindTacticianModel,
  StratosChoristerModel,
} from './models/AtmosEngineModels';
import {
  FoundryCantorModel,
  PowerLatticeRegulatorModel,
  SkylineMoulterModel,
} from './models/CiviformerIndustrialModels';
import {
  DemographicPlannerModel,
  RecordDevourerModel,
  TransitImpalerModel,
} from './models/CiviformerOccupationModels';
import {
  NebularStreamHerderModel,
  OrbitalExtrusionEngineModel,
  StellarPlasmaSwimmerModel,
} from './models/CosmicFluxborneModels';
import { GyreTacticianModel } from './models/CurrenthaloModel';
import {
  CradleExeModel,
  FoldhowlModel,
  RedactedGrinModel,
  SpinalLoopModel,
} from './models/GlitchEmbodiedModels';
import {
  GloryfailModel,
  ManifestDiscordModel,
  ViralBastionModel,
} from './models/GlitchSemanticModels';
import {
  CryofluidEngineModel,
  LittoralReformerModel,
  SalinityConductorModel,
  TrenchSovereignModel,
} from './models/FluxborneModels';
import {
  CivicTimeRewriterModel,
  OneiricEcologistModel,
  SovereigntyEaterModel,
  SyntaxBreakerModel,
} from './models/NoosphereBatchModels';
import {
  HymnlockModel,
  MemorialveinModel,
  ShrinehungerModel,
} from './models/NoosphereRitualModels';
import { MotherModel, TheEggModel } from './models/OriginModels';
import {
  DeepsongCarrierModel,
  GravityImpalerModel,
  RadiantScaffoldModel,
  StarbinderCoreModel,
} from './models/OrbitalWyrmModelsA';
import {
  BurnlineReaperModel,
  DataCoreUnbinderModel,
  PhantomOccluderModel,
} from './models/OrbitalWyrmModelsB';
import {
  GlassspineModel,
  HiveFloramotherModel,
  QuarrymindModel,
  ToxicVeilEngineModel,
} from './models/RemainingCanonicalModels';
import {
  MacrofloraColossusModel,
  NeuralFungibinderModel,
  PrecipitationSynthModel,
  SoilRewriterModel,
  SporesphereArchivistModel,
} from './models/SeedcarrierCanonModels';

function ResolvedSpecimenModel(props: SpecimenModelProps) {
  switch (props.record.id) {
    case 'skymourn':
      return <SkymournRepairModel {...props} />;
    case 'aerokarst':
      return <AerokarstModel {...props} />;
    case 'hydrostatic-renderer':
      return <HydrostaticRendererModel {...props} />;
    case 'stratos-chorister':
      return <StratosChoristerModel {...props} />;
    case 'balance-engine':
      return <BalanceEngineModel {...props} />;
    case 'stormmind-tactician':
      return <StormmindTacticianModel {...props} />;
    case 'toxic-veil-engine':
      return <ToxicVeilEngineModel {...props} />;
    case 'glassspine':
      return <GlassspineModel {...props} />;
    case 'quarrymind':
      return <QuarrymindModel {...props} />;
    case 'macroflora-colossus':
      return <MacrofloraColossusModel {...props} />;
    case 'sporesphere-archivist':
      return <SporesphereArchivistModel {...props} />;
    case 'neural-fungibinder':
      return <NeuralFungibinderModel {...props} />;
    case 'precipitation-synth':
      return <PrecipitationSynthModel {...props} />;
    case 'soil-rewriter':
      return <SoilRewriterModel {...props} />;
    case 'hive-floramother':
      return <HiveFloramotherModel {...props} />;
    case 'trench-sovereign':
      return <TrenchSovereignModel {...props} />;
    case 'salinity-conductor':
      return <SalinityConductorModel {...props} />;
    case 'gyre-tactician':
      return <GyreTacticianModel {...props} />;
    case 'littoral-reformer':
      return <LittoralReformerModel {...props} />;
    case 'cryofluid-engine':
      return <CryofluidEngineModel {...props} />;
    case 'nebular-stream-herder':
      return <NebularStreamHerderModel {...props} />;
    case 'stellar-plasma-swimmer':
      return <StellarPlasmaSwimmerModel {...props} />;
    case 'orbital-extrusion-engine':
      return <OrbitalExtrusionEngineModel {...props} />;
    case 'starbinder-core':
      return <StarbinderCoreModel {...props} />;
    case 'gravity-impaler':
      return <GravityImpalerModel {...props} />;
    case 'deepsong-carrier':
      return <DeepsongCarrierModel {...props} />;
    case 'radiant-scaffold':
      return <RadiantScaffoldModel {...props} />;
    case 'phantom-occluder':
      return <PhantomOccluderModel {...props} />;
    case 'burnline-reaper':
      return <BurnlineReaperModel {...props} />;
    case 'data-core-unbinder':
      return <DataCoreUnbinderModel {...props} />;
    case 'foundry-cantor':
      return <FoundryCantorModel {...props} />;
    case 'power-lattice-regulator':
      return <PowerLatticeRegulatorModel {...props} />;
    case 'skyline-moulter':
      return <SkylineMoulterModel {...props} />;
    case 'transit-impaler':
      return <TransitImpalerModel {...props} />;
    case 'demographic-planner':
      return <DemographicPlannerModel {...props} />;
    case 'record-devourer':
      return <RecordDevourerModel {...props} />;
    case 'syntax-breaker':
      return <SyntaxBreakerModel {...props} />;
    case 'civic-time-rewriter':
      return <CivicTimeRewriterModel {...props} />;
    case 'oneiric-ecologist':
      return <OneiricEcologistModel {...props} />;
    case 'sovereignty-eater':
      return <SovereigntyEaterModel {...props} />;
    case 'hymnlock':
      return <HymnlockModel {...props} />;
    case 'memorialvein':
      return <MemorialveinModel {...props} />;
    case 'shrinehunger':
      return <ShrinehungerModel {...props} />;
    case 'redacted-grin':
      return <RedactedGrinModel {...props} />;
    case 'spinal-loop':
      return <SpinalLoopModel {...props} />;
    case 'cradle-exe':
      return <CradleExeModel {...props} />;
    case 'foldhowl':
      return <FoldhowlModel {...props} />;
    case 'manifest-discord':
      return <ManifestDiscordModel {...props} />;
    case 'gloryfail':
      return <GloryfailModel {...props} />;
    case 'viral-bastion':
      return <ViralBastionModel {...props} />;
    case 'mother':
      return <MotherModel {...props} />;
    case 'the-egg':
      return <TheEggModel {...props} />;
    default:
      return <LegacySpecimenModel {...props} />;
  }
}

function EnhancedSpecimenModel(props: SpecimenModelProps) {
  return (
    <group>
      <ResolvedSpecimenModel {...props} />
      <RecordEnhancementLayer {...props} />
    </group>
  );
}

export { EnhancedSpecimenModel as SpecimenModel };
