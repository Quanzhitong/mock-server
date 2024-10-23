import { base } from '../../util/database';
import currentUser from './data/index.json';
import userConfigContext from './data/userConfig.json';

export default base('/api/user', {
    '': (params: any, body: any) => {
      return Object.assign(currentUser, global.mock.user);
    },
    'user-config': () => {
      return userConfigContext;
    },
   'init-config@post': (params: any, body: any) => {
        global.mock.user = {};
        return null;
    },
  });