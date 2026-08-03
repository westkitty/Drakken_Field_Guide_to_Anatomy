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
  CryofluidEngineModel,
  GyreTacticianModel,
  LittoralReformerModel,
  SalinityConductorModel,
  TrenchSovereignModel,
} from './models/FluxborneModels';
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
    default:
      return <LegacySpecimenModel {...props} />;
  }
}
