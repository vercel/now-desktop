import Alias from './alias'
import AliasChown from './alias-chown'
import AliasDelete from './alias-delete'
import AliasSystem from './alias-system'
import Avatar from './avatar'
import Cert from './cert'
import CertAutoRenew from './cert-autorenew'
import CertChown from './cert-chown'
import CertClone from './cert-clone'
import CertDelete from './cert-delete'
import CertRenew from './cert-renew'
import CertReplace from './cert-replace'
import Deployment from './deployment'
import DeploymentFreeze from './deployment-freeze'
import DeploymentUnfreeze from './deployment-unfreeze'
import DeploymentChown from './deployment-chown'
import DeploymentDelete from './deployment-delete'
import DnsAdd from './dns-add'
import DnsDelete from './dns-delete'
import DnsUpdate from './dns-update'
import Domain from './domain'
import DomainBuy from './domain-buy'
import DomainChown from './domain-chown'
import DomainDelete from './domain-delete'
import DomainMoveIn from './domain-move-in'
import DomainMoveOut from './domain-move-out'
import DomainMoveOutRequestSent from './domain-move-out-request-sent'
import DomainTransferIn from './domain-transfer-in'
import DomainTransferInCanceled from './domain-transfer-in-canceled'
import DomainTransferInCompleted from './domain-transfer-in-completed'
import Login from './login'
import Plan from './plan'
import Scale from './scale'
import ScaleAuto from './scale-auto'
import SetScale from './set-scale'
import SignUp from './signup'
import SecretAdd from './secret-add'
import SecretDelete from './secret-delete'
import SecretRename from './secret-rename'
import Team from './team'
import TeamAvatarUpdate from './team-avatar-update'
import TeamDelete from './team-delete'
import TeamMemberAdd from './team-member-add'
import TeamMemberDelete from './team-member-delete'
import TeamMemberRoleUpdate from './team-member-role-update'
import TeamNameUpdate from './team-name-update'
import TeamSlugUpdate from './team-slug-update'
import Username from './username'

export default new Map([
  ['alias', Alias],
  ['alias-chown', AliasChown],
  ['alias-delete', AliasDelete],
  ['alias-system', AliasSystem],
  ['avatar', Avatar],
  ['cert', Cert],
  ['cert-autorenew', CertAutoRenew],
  ['cert-chown', CertChown],
  ['cert-clone', CertClone],
  ['cert-delete', CertDelete],
  ['cert-renew', CertRenew],
  ['cert-replace', CertReplace],
  ['deployment', Deployment],
  ['deployment-chown', DeploymentChown],
  ['deployment-delete', DeploymentDelete],
  ['dns-add', DnsAdd],
  ['dns-delete', DnsDelete],
  ['dns-update', DnsUpdate],
  ['domain', Domain],
  ['domain-buy', DomainBuy],
  ['deployment-freeze', DeploymentFreeze],
  ['deployment-unfreeze', DeploymentUnfreeze],
  ['domain-chown', DomainChown],
  ['domain-delete', DomainDelete],
  ['domain-move-in', DomainMoveIn],
  ['domain-move-out-request-sent', DomainMoveOutRequestSent],
  ['domain-move-out', DomainMoveOut],
  ['domain-transfer-in-canceled', DomainTransferInCanceled],
  ['domain-transfer-in-completed', DomainTransferInCompleted],
  ['domain-transfer-in', DomainTransferIn],
  ['login', Login],
  ['plan', Plan],
  ['scale', Scale],
  ['scale-auto', ScaleAuto],
  ['set-scale', SetScale],
  ['signup', SignUp],
  ['secret-add', SecretAdd],
  ['secret-delete', SecretDelete],
  ['secret-rename', SecretRename],
  ['team', Team],
  ['team-avatar-update', TeamAvatarUpdate],
  ['team-member-add', TeamMemberAdd],
  ['team-member-delete', TeamMemberDelete],
  ['team-member-role-update', TeamMemberRoleUpdate],
  ['team-name-update', TeamNameUpdate],
  ['team-slug-update', TeamSlugUpdate],
  ['team-delete', TeamDelete],
  ['username', Username]
])
