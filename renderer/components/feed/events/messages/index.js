import Alias from './alias'
import AliasChown from './alias-chown'
import AliasDelete from './alias-delete'
import Cert from './cert'
import CertChown from './cert-chown'
import CertClone from './cert-clone'
import CertDelete from './cert-delete'
import CertRenew from './cert-renew'
import CertReplace from './cert-replace'
import Deployment from './deployment'
import DeploymentChown from './deployment-chown'
import DeploymentDelete from './deployment-delete'
import DnsAdd from './dns-add'
import DnsDelete from './dns-delete'
import DnsUpdate from './dns-update'
import Domain from './domain'
import DomainBuy from './domain-buy'
import DomainChown from './domain-chown'
import DomainDelete from './domain-delete'
import Login from './login'
import Plan from './plan'
import SecretAdd from './secret-add'
import SecretDelete from './secret-delete'
import SecretRename from './secret-rename'
import Team from './team'
import TeamMemberAdd from './team-member-add'
import TeamMemberDelete from './team-member-delete'
import TeamMemberRollUpdate from './team-member-roll-update'
import TeamNameUpdate from './team-name-update'
import TeamSlugUpdate from './team-slug-update'
import Username from './username'
import Scale from './scale'

export default new Map([
  ['alias', Alias],
  ['alias-chown', AliasChown],
  ['alias-delete', AliasDelete],
  ['cert', Cert],
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
  ['domain-chown', DomainChown],
  ['domain-delete', DomainDelete],
  ['login', Login],
  ['plan', Plan],
  ['secret-add', SecretAdd],
  ['secret-delete', SecretDelete],
  ['secret-rename', SecretRename],
  ['team', Team],
  ['team-member-add', TeamMemberAdd],
  ['team-member-delete', TeamMemberDelete],
  ['team-member-roll-update', TeamMemberRollUpdate],
  ['team-name-update', TeamNameUpdate],
  ['team-slug-update', TeamSlugUpdate],
  ['username', Username],
  ['scale', Scale]
])
