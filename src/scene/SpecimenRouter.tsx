import { SpecimenModel as LegacySpecimenModel } from './Specimens';
import type { SpecimenModelProps } from './SpecimenCommon';
import {
  AerokarstModel,
  BalanceEngineModel,
  HydrostaticRendererModel,
  StormmindTacticianModel,
  StratosChoristerModel,
} from './models/AtmosEngineModels';
import {
  NebularStreamHerderModel,
  OrbitalExtrusionEngineModel,
  StellarPlasmaSwimmerModel,
} from './models/CosmicFluxborneModels';
import { GyreTacticianModel } from './models/CurrenthaloModel';
import {
  CryofluidEngineModel,
  LittoralReformerModel,
  SalinityConductorModel,
  TrenchSovereignModel,
} from './models/FluxborneModels';
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
  MacrofloraColossusModel,
  NeuralFungibinderModel,
  PrecipitationSynthModel,
  SoilRewriterModel,
  SporesphereArchivistModel,
} from './models/SeedcarrierCanonModels';

export function SpecimenModel(props: SpecimenModelProps) {
  switch (props.record.id) {
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
    default:
      return <LegacySpecimenModel {...props} />;
  }
}
