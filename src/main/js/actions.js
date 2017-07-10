import defineAction, {required, optional} from './utilities/defineAction';

export default {
  backendPortUpdated: defineAction({
    type: 'backendPortUpdated',
    params: {
      port: required,
    }
  }),
  resize: defineAction({
    type: 'resize',
    params: {
      w: required,
      h: required,
      animate: optional,
      lock: optional,
    }
  }),
  toggleDevTools: defineAction({
    type: 'toggleDevTools',
  })
};
