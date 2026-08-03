import { SpecimenModel as LegacySpecimenModel } from './Specimens';
import type { SpecimenModelProps } from './SpecimenCommon';
import {
  AerokarstModel,
  BalanceEngineModel,
  HydrostaticRendererModel,
  StormmindTacticianModel,
  StratosChoristerModel,
} from './models/AtmosEngineModels';

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
    default:
      return <LegacySpecimenModel {...props} />;
  }
}
