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
    default:
      return <LegacySpecimenModel {...props} />;
  }
}
